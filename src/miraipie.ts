import EventEmitter from 'events';
import {configure, getLogger, Logger} from 'log4js';
import path from 'path';
import {MiraiApiHttpAdapter} from './adapter';
import HttpApiAdapter from './builtin/HttpApiAdapter';
import MixedApiAdapter from './builtin/MixedApiAdapter';
import WebSocketApiAdapter from './builtin/WebsocketApiAdapter';
import {Chat, FriendChat, GroupChat, TempChat} from './chat';
import {ApplicationConfig, checkUserConfig} from './config';
import {MessageChain} from './message';
import {ChatMessage, ChatMessageType, Event, EventType, Friend, GroupMember} from './mirai';
import {Pie} from './pie';
import {makeReadonly} from './utils';

type MessageReceivedListener = (chatMessage: ChatMessage) => any;
type EventReceivedListener = (event: Event) => any;
type LifecycleHookListener = () => any;

/** MiraiPie 应用程序 */
export class MiraiPieApplication extends EventEmitter {
    /** 应用程序单例 */
    static instance: MiraiPieApplication = null;

    /** logger */
    logger: Logger = getLogger('miraipie');

    private constructor(private config: ApplicationConfig) {
        super();
        MiraiPieApplication.instance = this;

        this.qq = config.qq;

        configure({
            appenders: {
                console: {
                    type: 'console'
                },
                file: {
                    type: 'dateFile',
                    filename: config.logDirectory + '/miraipie.log'
                }
            },
            categories: {
                default: {
                    appenders: config.logDirectory ? ['console', 'file'] : ['console'],
                    level: config.logLevel || 'debug'
                }
            }
        });

        this.setMaxListeners(0);
        this.__apiAdapterMap = new Map();
        this.__piesMap = new Map();
        this.__piesEnabledMap = new Map();

        // 加载内置 adapter
        HttpApiAdapter.configs.qq = this.qq;
        WebSocketApiAdapter.configs.qq = this.qq;
        MixedApiAdapter.configs.qq = this.qq;
        this.adapter(HttpApiAdapter);
        this.adapter(WebSocketApiAdapter);
        this.adapter(MixedApiAdapter);

        // 加载配置文件中的各项拓展
        const modules = new Set([
            ...this.config.extensions,
            ...Object.keys(this.config.adapters).map((id) => this.config.adapters[id].module),
            ...Object.keys(this.config.pies).map((id) => this.config.pies[id].module)
        ]);
        for (const module of modules) {
            if (module) {
                try {
                    // 执行拓展文件
                    require(path.join(process.cwd(), module))(this);
                } catch (err) {
                    this.logger.error(`加载拓展模块 '${module}' 时出错:`, err);
                }
            }
        }

        if (this.config.verbose) {
            this.on('message', (chatMessage) => {
                const displayString = (chatMessage.messageChain as MessageChain).toDisplayString()
                if (chatMessage.type === 'FriendMessage') {
                    const sender = chatMessage.sender as Friend;
                    this.logger.info(`${sender.nickname}(${sender.id}) -> ${displayString}`);
                } else if (chatMessage.type === 'GroupMessage') {
                    const sender = chatMessage.sender as GroupMember;
                    this.logger.info(`[${sender.group.name}(${sender.group.id})] ${sender.memberName}(${sender.id}) -> ${displayString}`);
                } else if (chatMessage.type === 'TempMessage') {
                    const sender = chatMessage.sender as GroupMember;
                    this.logger.info(`${sender.memberName}(${sender.id}) -> ${displayString}`);
                }
            });
            this.on('event', (event) => {
                this.logger.info(`${event.type}: ${JSON.stringify(event)}`);
            });
        }

        // 选用默认 adapter
        this.useAdapter(config.adapterInUse);

        // 捕获未处理的异常
        process.on('uncaughtException', (error) => {
            this.logger.debug('捕获到未处理的异常:', error);
        });
        process.on('unhandledRejection', (reason) => {
            this.logger.debug('捕获到未处理的reject:', reason);
        });

        // 捕捉Ctrl-C
        process.on('SIGINT', () => {
            this.logger.info('已手动停止运行 (Ctrl-C)');
            process.exit();
        });
    }

    /**
     * 创建 MiraiPie 应用程序实例
     * @param appConfigs 应用程序配置
     */
    static createApp(appConfigs: ApplicationConfig): MiraiPieApplication {
        if (MiraiPieApplication.instance) return MiraiPieApplication.instance;
        return new MiraiPieApplication(appConfigs);
    }

    /** 可用的 mirai-api-http 客户端 adapter 映射 */
    private __apiAdapterMap: Map<string, MiraiApiHttpAdapter>;

    /** 已安装的 pie 映射 */
    private __piesMap: Map<string, Pie>;

    /** pie 启用状态映射 */
    private __piesEnabledMap: Map<string, boolean>;

    /** 机器人服务的QQ号 */
    readonly qq: number;

    /** 用于与 mirai-api-http 对接的客户端 adapter */
    api: MiraiApiHttpAdapter;

    /** 用于 pie 的消息分发器 */
    private async __messageDispatcher(chatMessage: ChatMessage) {
        let chat: Chat = null;
        if (chatMessage.type === 'FriendMessage') chat = new FriendChat(chatMessage.sender as Friend);
        else if (chatMessage.type === 'GroupMessage') chat = new GroupChat(chatMessage.sender as GroupMember);
        else if (chatMessage.type === 'TempMessage') chat = new TempChat(chatMessage.sender as GroupMember);
        else return;

        chat = makeReadonly(chat);
        const chain = makeReadonly(MessageChain.from(chatMessage.messageChain));

        for (const [id, enabled] of this.__piesEnabledMap.entries()) {
            if (enabled) {
                const pie = this.__piesMap.get(id);
                if (pie.filters.map((filter) => filter.handler(chat, chain, pie)).some((v) => !v)) continue;
                pie.emit('received', chat, chain);
            }
        }
    }

    /**
     * 安装拓展
     * @param extension 拓展对象, 可以为 adapter 和 pie
     */
    install(extension: MiraiApiHttpAdapter | Pie): this {
        if ((extension as Pie).__isPie) this.pie(extension as Pie);
        else if ((extension as MiraiApiHttpAdapter).__isApiAdapter) this.adapter(extension as MiraiApiHttpAdapter);
        else this.logger.error(`未知的拓展类型: ${extension}`);
        return this;
    }

    /**
     * 安装 adapter
     * @param adapter adapter 对象
     */
    adapter(adapter: MiraiApiHttpAdapter): this {
        if (!adapter.__isApiAdapter) {
            this.logger.error(`加载 adapter 失败, ${adapter} 不是有效的 adapter`);
            return this;
        }
        // 安装 adapter
        this.__apiAdapterMap.set(adapter.id, adapter);
        // 注册时事件
        adapter.on('message', async (chatMessage) => {
            await this.__messageDispatcher(chatMessage);
        });
        adapter.on('message', (chatMessage) => {
            chatMessage.messageChain = MessageChain.from(chatMessage.messageChain);
            this.emit('message', chatMessage);
            this.emit(chatMessage.type, chatMessage);
        });
        adapter.on('event', (event) => {
            this.emit('event', event);
            this.emit(event.type, event);
        });
        adapter.on('listen', () => {
            this.emit('listen');
        });
        adapter.on('stop', () => {
            this.emit('stop');
        });
        adapter.once('listen', async () => {
            const resp = await adapter.getAbout();
            if (resp.data.version !== adapter.supportVersion) {
                this.logger.warn(`当前使用的adapter: '${adapter.id}' 支持 mirai-api-http V${adapter.supportVersion}, 而服务端运行的版本为 V${resp.data.version}, 使用中可能产生兼容性问题`);
            }
        });
        adapter.emit('installed');
        // 配置 adapter
        if (adapter.id in this.config.adapters) {
            adapter.configs = Object.assign(adapter.configs, this.config.adapters[adapter.id].configs);
            checkUserConfig(adapter.configMeta, adapter.configs, adapter.logger);
        }
        return this;
    }

    /**
     * 切换服务 adapter
     * @param id adapter id
     */
    useAdapter(id: string): this {
        if (this.__apiAdapterMap.has(id)) {
            if (this.api) {
                this.api.emit('unused');
                this.api.stop();
            }
            this.api = this.__apiAdapterMap.get(id);
            this.__apiAdapterMap.get(id).emit('used');
        } else {
            this.logger.error(`使用 adapter 失败, 指定的 adapter '${id}' 未安装`);
        }
        return this;
    }

    /**
     * 卸载 adapter
     * @param id adapter id
     */
    uninstallAdapter(id: string): MiraiApiHttpAdapter {
        if (this.api && this.api.id === id) {
            this.logger.error(`卸载 adapter '${id}' 失败, 当前正在使用`);
        }
        if (this.__apiAdapterMap.has(id)) {
            const adapter = this.__apiAdapterMap.get(id);
            this.__apiAdapterMap.delete(id);
            this.logger.info(`已卸载 adapter '${id}'`);
            return adapter;
        } else {
            this.logger.error(`卸载 adapter 失败, 指定的 adapter '${id}' 未安装`);
        }
    }

    /**
     * 安装 pie
     * @param pie pie 对象
     */
    pie(pie: Pie): this {
        if (!pie.__isPie) {
            this.logger.error(`加载 pie 失败, ${pie} 不是有效的 pie`);
            return this;
        }
        // 安装 pie
        this.__piesMap.set(pie.id, pie);
        pie.emit('installed');
        this.logger.info(`已安装 pie '${pie.id}'`);
        // 配置 pie
        if (pie.id in this.config.pies) {
            const pieConfig = this.config.pies[pie.id];
            pie.configs = Object.assign(pie.configs, pieConfig.configs);
            checkUserConfig(pie.configMeta, pie.configs, pie.logger);
            // 是否启用
            this.__piesEnabledMap.set(pie.id, pieConfig.enabled);
            if (pieConfig.enabled) this.enable(pie.id);
        } else {
            // 自动启用
            this.enable(pie.id);
        }
        return this;
    }

    /**
     * 启用 pie
     * @param id pie id
     */
    enable(id: string): this {
        if (this.__piesMap.has(id)) {
            this.__piesEnabledMap.set(id, true);
            this.__piesMap.get(id).emit('enabled');
            this.logger.info(`已启用 pie '${id}'`);
        }
        return this;
    }

    /**
     * 禁用 pie
     * @param id pie id
     */
    disable(id: string): this {
        if (this.__piesMap.has(id)) {
            this.__piesEnabledMap.set(id, false);
            this.__piesMap.get(id).emit('disabled');
            this.logger.info(`已禁用 pie '${id}'`);
        }
        return this;
    }

    /**
     * 卸载 pie
     * @param id pie id
     */
    uninstallPie(id: string): Pie {
        if (this.__piesMap.has(id)) {
            const pie = this.__piesMap.get(id);
            this.disable(id);
            this.__piesEnabledMap.delete(id);
            this.__piesMap.delete(id);
            pie.emit('uninstalled');
            this.logger.info(`已卸载 pie '${id}'`);
            return pie;
        } else {
            this.logger.error(`卸载 pie 失败, 指定的 pie '${id}' 未安装`);
        }
    }

    /** 启动 adapter 的事件监听 */
    async listen() {
        if (this.api) {
            if (!this.api.listening) await this.api.listen();
        } else {
            this.logger.error('未指定使用的 adapter, 无法启动监听');
        }
    }

    /** 停止 adapter 的事件监听 */
    stop() {
        if (this.api && this.api.listening) this.api.stop();
    }

    addListener(e: 'message', listener: MessageReceivedListener): this;
    addListener(e: ChatMessageType, listener: MessageReceivedListener): this;
    addListener(e: 'event', listener: EventReceivedListener): this;
    addListener(e: EventType, listener: EventReceivedListener): this;
    addListener(e: 'listen', listener: LifecycleHookListener): this;
    addListener(e: 'stop', listener: LifecycleHookListener): this;
    addListener(event, listener): this {
        return super.addListener(event, listener);
    }

    once(e: 'message', listener: MessageReceivedListener): this;
    once(e: ChatMessageType, listener: MessageReceivedListener): this;
    once(e: 'event', listener: EventReceivedListener): this;
    once(e: EventType, listener: EventReceivedListener): this;
    once(e: 'listen', listener: LifecycleHookListener): this;
    once(e: 'stop', listener: LifecycleHookListener): this;
    once(event, listener): this {
        return super.once(event, listener);
    }

    on(e: 'message', listener: MessageReceivedListener): this;
    on(e: ChatMessageType, listener: MessageReceivedListener): this;
    on(e: 'event', listener: EventReceivedListener): this;
    on(e: EventType, listener: EventReceivedListener): this;
    on(e: 'listen', listener: LifecycleHookListener): this;
    on(e: 'stop', listener: LifecycleHookListener): this;
    on(event, listener): this {
        return super.on(event, listener);
    }

    prependListener(e: 'message', listener: MessageReceivedListener): this;
    prependListener(e: ChatMessageType, listener: MessageReceivedListener): this;
    prependListener(e: 'event', listener: EventReceivedListener): this;
    prependListener(e: EventType, listener: EventReceivedListener): this;
    prependListener(e: 'listen', listener: LifecycleHookListener): this;
    prependListener(e: 'stop', listener: LifecycleHookListener): this;
    prependListener(event, listener): this {
        return super.prependListener(event, listener);
    }

    prependOnceListener(e: 'message', listener: MessageReceivedListener): this;
    prependOnceListener(e: ChatMessageType, listener: MessageReceivedListener): this;
    prependOnceListener(e: 'event', listener: EventReceivedListener): this;
    prependOnceListener(e: EventType, listener: EventReceivedListener): this;
    prependOnceListener(e: 'listen', listener: LifecycleHookListener): this;
    prependOnceListener(e: 'stop', listener: LifecycleHookListener): this;
    prependOnceListener(event, listener): this {
        return super.prependOnceListener(event, listener);
    }

    emit(e: 'message', chatMessage: ChatMessage);
    emit(e: ChatMessageType, chatMessage: ChatMessage);
    emit(e: 'event', event: Event);
    emit(e: EventType, event: Event);
    emit(e: 'listen');
    emit(e: 'stop');
    emit(event, ...args) {
        return super.emit(event, ...args);
    }

    listeners(e: 'message'): MessageReceivedListener[];
    listeners(e: ChatMessageType): MessageReceivedListener[];
    listeners(e: 'event'): EventReceivedListener[];
    listeners(e: EventType): EventReceivedListener[];
    listeners(e: 'listen'): LifecycleHookListener[];
    listeners(e: 'stop'): LifecycleHookListener[];
    listeners(event) {
        return super.listeners(event);
    }
}

export {ResponseCode} from './mirai';
export * as Mirai from './mirai';
export * from './adapter';
export * from './pie';
export * from './message';
export * from './chat';
export * from './config';
export const createApp = MiraiPieApplication.createApp;
export default createApp;
