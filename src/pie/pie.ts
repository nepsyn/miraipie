import log4js, {Logger} from 'log4js';
import {ChatWindow, FriendChatWindow, GroupChatWindow, MiraiPieApp, TempChatWindow} from '.';
import {At, ChatMessage, Event, Friend, Group, GroupMember, MessageChain, SingleMessageType} from '../mirai';
import {makeAsync, makeReadonly} from '../tool';

const logger = log4js.getLogger('pie');

/**
 * 可序列化类型
 */
type SerializableType = string | number | boolean | Array<SerializableType> | SerializableObject;
/**
 * 可序列化对象类型
 */
type SerializableObject = { [key: string]: SerializableType };
/**
 * 配置类型
 */
type ConfigConstructor<T = SerializableType> = { new(...args): T & {}; } | { (): T; }

/**
 * 用户配置元声明
 */
interface UserConfigMeta<T = SerializableType> {
    [key: string]: {
        /**
         * 配置类型
         */
        type: ConfigConstructor<T>;
        /**
         * 是否必要
         */
        required?: boolean;
        /**
         * 配置描述
         */
        description?: string;
        /**
         * 配置默认值
         */
        default?: T;
    };
}

export interface PieOptions {
    /**
     * 命名空间(必须为合法标识符)
     */
    namespace: string;
    /**
     * id(必须为合法标识符)
     */
    id: string;
    /**
     * 名称
     */
    name: string;
    /**
     * 作者
     */
    author: string;
    /**
     * 版本号
     */
    version: string;

    /**
     * 描述
     */
    description?: string;
    /**
     * 作者链接
     */
    authorUrl?: string;
    /**
     * 项目链接
     */
    projectUrl?: string;
    /**
     * 项目依赖
     */
    dependencies?: string[];
    /**
     * 项目关键字
     */
    keywords?: string[];

    /**
     * pie中数据
     */
    data?: object;
    /**
     * pie中导出对象, 其他pie可引入pie中导出的内容<br/>
     * 注意导出对象中方法this指向该对象, 而不是pie实例
     */
    exports?: object;
    /**
     * pie中方法, 生成pie实例时会自动挂载到实例上, 命名与pie中属性冲突的会在方法名前加$代替
     * @example
     * methods: {
     *     greet() {
     *         return 'Hello ' + this.author;
     *     }
     * }
     *
     * // "Hello Nepsyn"
     * pie.greet();
     */
    methods?: { [name: string]: (this: Pie, ...args: any[]) => any };
    /**
     * pie用户配置元声明, 用以标识用户配置项
     * @example
     * userConfigMeta: {
     *     base: {
     *         type: Number,
     *         description: '累加器初始值',
     *         default: 0
     *     },
     *     step: {
     *         type: Number,
     *         description: '累加器步长',
     *         required: true
     *     }
     * }
     */
    userConfigMeta?: UserConfigMeta;
    /**
     * pie消息过滤器, 用以在执行pie处理器前过滤掉不需要的消息, 多个过滤器求<strong>与</strong>, 为true则执行messageHandler
     * @example
     * filters: [PieFilter.atMe]  // 只响应@我的消息
     * filters: [PieFilter.atMe, PieFilter.atAll]  // 同时响应@我和@全体成员的消息
     * filters: [PieFilter.or(PieFilter.atMe, PieFilter.atAll)]  // 只响应@我或@全体成员的消息
     *
     * // 自行构造过滤器
     * const myFilter = {
     *     sign: 'LuckyTest',
     *     handler: () => Math.random() > 0.1
     * }
     */
    filters?: PieFilter[];

    /**
     * pie消息监听器, 用以监听消息并处理
     * @param window 当前聊天窗
     * @param chain 消息链
     * @example
     * // 复读机
     * messageHandler(window, chain) => {
     *     window.send(chain);
     * }
     */
    messageHandler?(this: Pie, window: ChatWindow, chain: MessageChain): any;

    /**
     * pie事件监听器, 用以监听事件并处理
     * @param event 事件
     */
    eventHandler?(this: Pie, event: Event): any;

    /**
     * pie安装完成hook
     */
    installed?(this: Pie): void;

    /**
     * pie卸载完成hook
     */
    uninstalled?(this: Pie): void;

    /**
     * pie启用hook
     */
    enabled?(this: Pie): void;

    /**
     * pie禁用hook
     */
    disabled?(this: Pie): void;

    /**
     * pie版本更新hook
     * @param oldVersion
     * @example
     * updated(oldVersion) {
     *     console.log(`you have upgraded ${this.fullId} from version ${oldVersion} to ${this.version}`);
     * }
     */
    updated?(this: Pie, oldVersion: string): void;
}

/**
 * A Delicious Pie
 */
export class Pie {
    /**
     * 命名空间(必须为合法标识符)
     */
    namespace: string;
    /**
     * id(必须为合法标识符)
     */
    id: string;
    /**
     * 名称
     */
    name: string;
    /**
     * 作者
     */
    author: string;
    /**
     * 版本号
     */
    version: string;

    /**
     * 描述
     */
    description?: string;
    /**
     * 作者链接
     */
    authorUrl?: string;
    /**
     * 项目链接
     */
    projectUrl?: string;
    /**
     * 项目依赖
     */
    dependencies?: string[];
    /**
     * 项目关键字
     */
    keywords?: string[];

    /**
     * pie中数据
     */
    data?: object;
    /**
     * pie中导出对象
     */
    exports?: object;
    /**
     * pie中方法
     */
    methods?: { [name: string]: (this: Pie, ...args: any[]) => any };
    /**
     * pie用户配置元声明
     */
    userConfigMeta?: UserConfigMeta;
    /**
     * pie用户配置
     */
    configs: SerializableObject;
    /**
     * pie消息过滤器
     */
    filters?: PieFilter[];

    /**
     * pie logger
     */
    logger: Logger;
    /**
     * 是否为pie标识
     */
    readonly isPie = true;

    /**
     * pie消息监听器
     * @param window 当前聊天窗
     * @param chain 消息链
     */
    messageHandler?(this: Pie, window: ChatWindow, chain: MessageChain): any;

    /**
     * pie事件监听器
     * @param event 事件
     */
    eventHandler?(this: Pie, event: Event): any;

    /**
     * pie安装完成hook
     */
    installed?(this: Pie): void;

    /**
     * pie卸载完成hook
     */
    uninstalled?(this: Pie): void;

    /**
     * pie启用hook
     */
    enabled?(this: Pie): void;

    /**
     * pie禁用hook
     */
    disabled?(this: Pie): void;

    /**
     * pie版本更新hook
     * @param oldVersion
     */
    updated?(this: Pie, oldVersion: string): void;

    /**
     * @param options pie选项
     */
    constructor(options: PieOptions) {
        // 判断标识符是否合法
        if (!(options.namespace.match(/^[\w]+$/) && options.id.match(/^[\w]+$/))) {
            throw new Error('pie的namespace和id字段都必须为合法标识符')
        }

        // 基础配置
        this.namespace = options.namespace;
        this.id = options.id;
        this.author = options.author;
        this.version = options.version;

        // pie相关信息
        this.description = options.description || '';
        this.authorUrl = options.authorUrl || '';
        this.projectUrl = options.projectUrl || '';
        this.dependencies = options.dependencies || [];
        this.keywords = options.keywords || [];

        // logger
        this.logger = log4js.getLogger(this.fullId);

        // pie运行环境
        this.data = options.data || {};
        this.exports = options.exports || {};
        this.userConfigMeta = options.userConfigMeta || {};
        this.configs = {};
        for (const i of Object.keys(this.userConfigMeta)) this.configs[i] = options.userConfigMeta[i].default;
        this.filters = options.filters || [];

        // pie生命周期钩子
        this.installed = options.installed;
        this.uninstalled = options.uninstalled;
        this.enabled = options.enabled;
        this.disabled = options.disabled;
        this.updated = options.updated;

        // pie处理器
        this.messageHandler = options.messageHandler;
        this.eventHandler = options.eventHandler;

        // 挂载options中方法到pie实例
        for (const key in options.methods || {}) this[key in this ? `$${key}` : key] = options.methods[key];
    }

    /**
     * 返回pie的全限定名, 格式为: $namespace:$id
     * @example
     * "miraipie:foo"
     * "miraipie:bar"
     */
    get fullId(): string {
        return `${this.namespace}:${this.id}`;
    }

    /**
     * 获取相同命名空间下pie的导出对象
     * @example
     * // {foo: {foo: 'bar'}, bar: {foo: 'baz'}}
     * this.getNamespaceExports();
     */
    private getNamespaceExports(): object {
        return MiraiPieApp.instance?.pieAgent.getNamespaceExports(this.namespace);
    }

    /**
     * 获取依赖项pie的导出对象
     * @param fullId 依赖项的全限定名
     * @example
     * // {foo: 'bar'}
     * this.require('miraipie:foo');
     */
    private require(fullId: string): object {
        if (!this.dependencies.includes(fullId)) logger.warn(`所请求的依赖项 '${fullId}' 没有在pie的声明中指定`);
        return MiraiPieApp.instance?.pieAgent.getPie(fullId)?.exports;
    }
}

/**
 * pie消息过滤器类型
 */
export type PieFilterBuilder = (...args: any[]) => PieFilter;

/**
 * pie消息过滤器
 */
export class PieFilter {
    /**
     * 过滤器签名, 通常要能表达过滤器的意图
     */
    sign: string;
    handler: (window: ChatWindow, chain: MessageChain, pie: Pie) => boolean;

    /**
     * 消息包含@我
     */
    static atMe: PieFilter = {
        sign: 'AtMe',
        handler: (window, chain) => {
            return chain.selected('At').some(at => (at as At).target === MiraiPieApp.instance.qq)
        }
    };

    /**
     * 消息包含@指定QQ号群成员
     * @param id 群成员QQ号
     */
    static at: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `At(${id})`,
            handler: (window, chain) => {
                return chain.selected('At').some(at => (at as At).target === id)
            }
        };
    }

    /**
     * 消息包含@全体成员
     */
    static atAll: PieFilter = {
        sign: 'AtAll',
        handler: (window, chain) => chain.selected('AtAll').length > 0
    };

    /**
     * 消息来自指定账号
     * @param id QQ号或群号
     */
    static from: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `From(${id})`,
            handler: window => window.contact.id === id
        };
    }

    /**
     * 消息不来自指定账号
     * @param id QQ号或群号
     */
    static notFrom: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `NotFrom(${id})`,
            handler: window => window.contact.id !== id
        };
    }

    /**
     * 消息包含单一消息类型
     * @param type 单一消息类型
     */
    static containsType: PieFilterBuilder = function (type: SingleMessageType): PieFilter {
        return {
            sign: `ContainsType(${type})`,
            handler: (window, chain) => chain.selected(type).length > 0
        };
    }

    /**
     * 消息显示串匹配正则表达式
     * @param regexp 正则表达式
     */
    static displayStringMatch: PieFilterBuilder = function (regexp: RegExp | string): PieFilter {
        return {
            sign: `DisplayStringMatch(${regexp})`,
            handler: (window, chain) => chain.toDisplayString().match(regexp) !== null
        };
    }

    /**
     * 消息显示串和指定串全等
     * @param displayString 指定字符串
     */
    static displayStringEquals: PieFilterBuilder = function (displayString: string): PieFilter {
        return {
            sign: `DisplayStringEquals(${displayString})`,
            handler: (window, chain) => chain.toDisplayString() === displayString
        }
    }

    /**
     * 多个消息过滤器求<strong>或</strong>
     * @param filters 消息过滤器
     */
    static or: PieFilterBuilder = function (...filters: PieFilter[]): PieFilter {
        return {
            sign: `Or(${filters.map(filter => filter.sign).join(', ')})`,
            handler: (window, chain, pie) => filters.some(filter => filter.handler(window, chain, pie))
        };
    }

    /**
     * 消息来自好友
     */
    static fromFriend: PieFilter = {
        sign: 'FromFriend',
        handler: (window) => window.type === 'FriendChatWindow'
    }

    /**
     * 消息来自群聊
     */
    static fromGroup: PieFilter = {
        sign: 'FromGroup',
        handler: (window) => window.type === 'GroupChatWindow'
    }

    /**
     * 消息来自群成员
     */
    static fromMember: PieFilter = {
        sign: 'FromMember',
        handler: (window) => window.type === 'TempChatWindow'
    }
}

/**
 * pie控制块
 */
interface PieControl {
    /**
     * pie实例
     */
    pie: Pie;
    /**
     * 是否启用
     */
    enabled: boolean;
    /**
     * 模块路径
     */
    path: string;
}

/**
 * pie管理类, 用户维护各个pie
 */
export class PieAgent {
    /**
     * pie控制块map
     */
    private readonly controller: Map<string, PieControl>;

    constructor() {
        this.controller = new Map();
    }

    /**
     * 获取指定命名空间下所有pie的exports
     * @param namespace 指定命名空间
     */
    getNamespaceExports(namespace: string): { [id: string]: object } {
        const exports = {};
        for (const control of this.controller.values()) {
            const pie = control.pie;
            if (pie.namespace === namespace) exports[pie.id] = makeReadonly(pie.exports);
        }
        return exports;
    }

    /**
     * 获取pie实例
     * @param fullId pie的全限定名
     */
    getPie(fullId: string): Pie {
        return makeReadonly(this.controller.get(fullId)?.pie);
    }

    /**
     * 将当前所有pie的环境存储到数据库中
     */
    savePies() {
        for (const control of this.controller.values()) MiraiPieApp.instance.db?.saveOrUpdatePieRecord({
            fullId: control.pie.fullId,
            version: control.pie.version,
            enabled: control.enabled,
            path: control.path,
            configs: control.pie.configs
        });
    }

    /**
     * 安装pie
     * @param pie pie实例
     * @param options 安装选项
     */
    install(pie: Pie, options?: { path?: string, enabled?: boolean }) {
        if (pie?.isPie) {
            // 防止重复安装
            if (this.getPie(pie.fullId)?.version === pie.version) return;
            // 获取数据库中记录并还原pie环境
            const record = MiraiPieApp.instance.db?.getPieRecord(pie.fullId);
            if (record) {
                pie.configs = record.configs as SerializableObject;
                // pie版本存在更新
                if (pie.version > record.version && pie.updated) {
                    makeAsync(pie.updated, pie)(record.version).catch((err) => {
                        pie.logger.error('调用钩子updated发生错误:', err.message);
                    });
                }
            }
            // 添加控制块
            this.controller.set(pie.fullId, {
                pie,
                enabled: false,
                path: options?.path
            });
            pie.logger.debug('已加载');
            // 调用钩子
            if (pie.installed) {
                makeAsync(pie.installed, pie)().catch((err) => {
                    pie.logger.error('调用钩子installed发生错误:', err.message);
                });
            }
            // 自动启用
            if (!options || options?.enabled) this.enable(pie.fullId);
        } else {
            logger.error(`加载pie失败, 请检查 ${pie} 是否为一个有效的pie`)
        }
    }

    /**
     * 卸载pie
     * @param fullId pie全限定名
     */
    uninstall(fullId: string) {
        const pie = this.getPie(fullId);
        if (pie) {
            // 禁用pie
            this.disable(fullId);
            this.controller.delete(fullId);
            pie.logger.debug('已卸载');
            // 调用钩子
            if (pie.uninstalled) {
                makeAsync(pie.uninstalled, pie)().catch((err) => {
                    pie.logger.error('调用钩子uninstalled发生错误:', err.message);
                });
            }
        }
    }

    /**
     * 启用pie
     * @param fullId pie全限定名
     */
    enable(fullId: string) {
        // 获取pie实例
        const pie = this.getPie(fullId);
        if (pie) {
            this.controller.get(fullId).enabled = true;
            pie.logger.debug('已启用');
            // 调用钩子
            if (pie.enabled) {
                makeAsync(pie.enabled, pie)().catch((err) => {
                    pie.logger.error('调用钩子enabled发生错误:', err.message);
                });
            }
        }
    }

    /**
     * 禁用pie
     * @param fullId pie全限定名
     */
    disable(fullId: string) {
        // 获取pie实例
        const pie = this.getPie(fullId);
        if (pie) {
            this.controller.get(fullId).enabled = false;
            pie.logger.debug('已禁用');
            // 调用钩子
            if (pie.disabled) {
                makeAsync(pie.disabled, pie)().catch((err) => {
                    pie.logger.error('调用钩子disabled发生错误:', err.message);
                });
            }
        }
    }

    /**
     * 消息分发器, 用以分发消息给各个pie单独处理
     * @param chatMessage 消息原始对象
     */
    async messageDispatcher(chatMessage: ChatMessage) {
        // 构造聊天窗
        let window: ChatWindow = null;
        if (chatMessage.type === 'FriendMessage') window = new FriendChatWindow(chatMessage.sender as Friend);
        else if (chatMessage.type === 'GroupMessage') window = new GroupChatWindow(chatMessage.sender as Group);
        else if (chatMessage.type === 'TempMessage') window = new TempChatWindow(chatMessage.sender as GroupMember);

        // 使聊天窗和消息链只读
        window = makeReadonly(window);
        const chain = makeReadonly(chatMessage.messageChain);

        // 遍历所有pie, 并调用其处理器
        for (const control of this.controller.values()) {
            if (control.enabled) {
                const pie = control.pie;
                // 检查过滤
                const passed = pie.filters.every((filter) => {
                    try {
                        return filter.handler(window, chain, pie);
                    } catch (err) {
                        pie.logger.error(`执行过滤器 '${filter.sign}' 时发生错误:`, err.message);
                        return false
                    }
                });
                if (pie.messageHandler && passed) {
                    makeAsync(pie.messageHandler, pie)(window, chain).catch((err) => {
                        pie.logger.error('调用消息处理器发生错误:', err.message);
                    });
                }
            }
        }
    }

    /**
     * 事件分发器, 用以分发事件给各个pie单独处理
     * @param event 事件原始对象
     */
    async eventDispatcher(event: Event) {
        // 使事件只读
        const _event = makeReadonly(event);

        // 遍历所有pie, 并调用其处理器
        for (const control of this.controller.values()) {
            if (control.enabled) {
                const pie = control.pie;
                if (pie.eventHandler) {
                    makeAsync(pie.eventHandler, pie)(_event).catch((err) => {
                        pie.logger.error('调用事件处理器发生错误:', err.message);
                    });
                }
            }
        }
    }
}
