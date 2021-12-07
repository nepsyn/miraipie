import EventEmitter from 'events';
import { Configuration, configure, getLogger, Logger } from 'log4js';
import path from 'path';
import { MiraiApiHttpAdapter } from './adapter';
import { Chat, FriendChat, GroupChat, TempChat } from './chat';
import { ApplicationConfig, checkUserConfig } from './config';
import { MessageChain } from './message';
import { ChatMessage, ChatMessageMap, ChatMessageType, Event, EventMap, EventType, Friend, GroupMember } from './mirai';
import { Pie } from './pie';
import { makeReadonly } from './utils';

type MessageReceivedListener<T extends ChatMessage> = (chatMessage: T) => any;
type EventReceivedListener<T extends Event> = (event: T) => any;
type LifecycleHookListener = () => any;

/** MiraiPie 应用程序 */
export class MiraiPieApplication extends EventEmitter {
    /** 应用程序单例 */
    static instance: MiraiPieApplication = null;

    /** logger */
    logger: Logger = getLogger('miraipie');
    /** 机器人服务的QQ号 */
    readonly qq: number;
    /** 用于与 mirai-api-http 对接的客户端 adapter */
    api: MiraiApiHttpAdapter;
    /** 可用的 mirai-api-http 客户端 adapter 映射 */
    private __apiAdapterMap: Map<string, MiraiApiHttpAdapter>;

    /** 已安装的 pie 映射 */
    private __piesMap: Map<string, Pie>;

    /** pie 启用状态映射 */
    private __piesEnabledMap: Map<string, boolean>;

    private constructor(private config: ApplicationConfig, loggerOptions?: Configuration) {
        super();
        MiraiPieApplication.instance = this;

        // 注册全局模块
        process.env.MIRAIPIE_MODULE = module.id;

        this.qq = config.qq;

        // 初始化log4js
        configure(loggerOptions || {
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
        const BuiltinApiAdapters = [
            require('./builtin/HttpApiAdapter'),
            require('./builtin/WebsocketApiAdapter'),
            require('./builtin/MixedApiAdapter')
        ];
        for (const adapter of BuiltinApiAdapters) {
            adapter.configs.qq = this.qq;
            this.adapter(adapter);
        }

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
            this.logger.debug('捕获到未处理的rejection:', reason);
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
     * @param loggerOptions log4js实例配置
     */
    static createApp(appConfigs: ApplicationConfig, loggerOptions?: Configuration): MiraiPieApplication {
        return new MiraiPieApplication(appConfigs, loggerOptions);
    }

    /**
     * 安装拓展
     * @param extension 拓展对象, 可以为 adapter 和 pie
     */
    install<Instance extends Pie | MiraiApiHttpAdapter>(extension: Instance): this {
        if ((extension as Pie).__isPie) this.pie(extension as Pie);
        else if ((extension as MiraiApiHttpAdapter).__isApiAdapter) this.adapter(extension as MiraiApiHttpAdapter);
        else this.logger.error(`未知的拓展类型: ${extension}`);
        return this;
    }

    /**
     * 安装 adapter
     * @param adapter adapter 对象
     */
    adapter<MiraiApiHttpAdapterInstance extends MiraiApiHttpAdapter>(adapter: MiraiApiHttpAdapterInstance): this {
        if (!adapter.__isApiAdapter) {
            this.logger.error(`安装 adapter 失败, ${adapter} 不是有效的 adapter`);
            return this;
        }
        // 安装 adapter
        this.__apiAdapterMap.set(adapter.id, adapter);
        // 注册时事件
        adapter.on('message', async (chatMessage) => {
            chatMessage.messageChain = MessageChain.from(chatMessage.messageChain);
            this.emit('message', chatMessage);
            this.emit(chatMessage.type, chatMessage);
            await this.__messageDispatcher(chatMessage);
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
        // 配置 adapter
        if (adapter.id in this.config.adapters) {
            adapter.configs = Object.assign(adapter.configs, this.config.adapters[adapter.id].configs);
            checkUserConfig(adapter.configMeta, adapter.configs, adapter.logger);
        }
        this.logger.info(`已安装 adapter '${adapter.id}'`);
        adapter.emit('installed');
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
    pie<PieInstance extends Pie>(pie: PieInstance): this {
        if (!pie.__isPie) {
            this.logger.error(`安装 pie 失败, ${pie} 不是有效的 pie`);
            return this;
        }
        // 安装 pie
        this.__piesMap.set(pie.id, pie);
        // 配置 pie
        if (pie.id in this.config.pies) {
            const pieConfig = this.config.pies[pie.id];
            pie.configs = Object.assign(pie.configs, pieConfig.configs);
            checkUserConfig(pie.configMeta, pie.configs, pie.logger);
            // 是否启用
            this.__piesEnabledMap.set(pie.id, pieConfig.enabled);
        } else {
            // 自动启用
            this.__piesEnabledMap.set(pie.id, true);
        }
        this.logger.info(`已安装 pie '${pie.id}'`);
        pie.emit('installed');
        if (this.__piesEnabledMap.get(pie.id)) this.enable(pie.id);
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

    addListener(e: 'message', listener: MessageReceivedListener<ChatMessage>): this;
    addListener<T extends ChatMessageType>(e: T, listener: MessageReceivedListener<ChatMessageMap[T]>): this;
    addListener(e: 'event', listener: EventReceivedListener<Event>): this;
    addListener<T extends EventType>(e: T, listener: EventReceivedListener<EventMap[T]>): this;
    addListener(e: 'listen', listener: LifecycleHookListener): this;
    addListener(e: 'stop', listener: LifecycleHookListener): this;
    addListener(event, listener): this {
        return super.addListener(event, listener);
    }

    on(e: 'message', listener: MessageReceivedListener<ChatMessage>): this;
    on<T extends ChatMessageType>(e: T, listener: MessageReceivedListener<ChatMessageMap[T]>): this;
    on(e: 'event', listener: EventReceivedListener<Event>): this;
    on<T extends EventType>(e: T, listener: EventReceivedListener<EventMap[T]>): this;
    on(e: 'listen', listener: LifecycleHookListener): this;
    on(e: 'stop', listener: LifecycleHookListener): this;
    on(event, listener): this {
        return super.on(event, listener);
    }

    once(e: 'message', listener: MessageReceivedListener<ChatMessage>): this;
    once<T extends ChatMessageType>(e: T, listener: MessageReceivedListener<ChatMessageMap[T]>): this;
    once(e: 'event', listener: EventReceivedListener<Event>): this;
    once<T extends EventType>(e: T, listener: EventReceivedListener<EventMap[T]>): this;
    once(e: 'listen', listener: LifecycleHookListener): this;
    once(e: 'stop', listener: LifecycleHookListener): this;
    once(event, listener): this {
        return super.once(event, listener);
    }

    listeners(e: 'message'): MessageReceivedListener<ChatMessage>[];
    listeners<T extends ChatMessageType>(e: T): MessageReceivedListener<ChatMessageMap[T]>[];
    listeners(e: 'event'): EventReceivedListener<Event>[];
    listeners<T extends EventType>(e: T): EventReceivedListener<EventMap[T]>[];
    listeners(e: 'listen'): LifecycleHookListener[];
    listeners(e: 'stop'): LifecycleHookListener[];
    listeners(event) {
        return super.listeners(event);
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

    prependListener(e: 'message', listener: MessageReceivedListener<ChatMessage>): this;
    prependListener<T extends ChatMessageType>(e: T, listener: MessageReceivedListener<ChatMessageMap[T]>): this;
    prependListener(e: 'event', listener: EventReceivedListener<Event>): this;
    prependListener<T extends EventType>(e: T, listener: EventReceivedListener<EventMap[T]>): this;
    prependListener(e: 'listen', listener: LifecycleHookListener): this;
    prependListener(e: 'stop', listener: LifecycleHookListener): this;
    prependListener(event, listener): this {
        return super.prependListener(event, listener);
    }

    prependOnceListener(e: 'message', listener: MessageReceivedListener<ChatMessage>): this;
    prependOnceListener<T extends ChatMessageType>(e: T, listener: MessageReceivedListener<ChatMessageMap[T]>): this;
    prependOnceListener(e: 'event', listener: EventReceivedListener<Event>): this;
    prependOnceListener<T extends EventType>(e: T, listener: EventReceivedListener<EventMap[T]>): this;
    prependOnceListener(e: 'listen', listener: LifecycleHookListener): this;
    prependOnceListener(e: 'stop', listener: LifecycleHookListener): this;
    prependOnceListener(event, listener): this {
        return super.prependOnceListener(event, listener);
    }

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
}

export {ResponseCode, FaceType} from './mirai';
export * as Mirai from './mirai';
export * from './adapter';
export * from './pie';
export * from './message';
export * from './chat';
export * from './config';
export const createApp = MiraiPieApplication.createApp;
export const makeAppConfig = ApplicationConfig.make;
export default createApp;

// 当存在全局 miraipie 应用程序时, 使用全局模块
if (process.env.MIRAIPIE_MODULE) {
    module.exports = require(process.env.MIRAIPIE_MODULE);
}
