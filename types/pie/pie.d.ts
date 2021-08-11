import { Logger } from 'log4js';
import { ChatWindow } from '.';
import { ChatMessage, Event, MessageChain } from '../mirai';
/**
 * 可序列化类型
 */
declare type SerializableType = string | number | boolean | Array<SerializableType> | SerializableObject;
/**
 * 可序列化对象类型
 */
declare type SerializableObject = {
    [key: string]: SerializableType;
};
/**
 * 配置类型
 */
declare type ConfigConstructor<T = SerializableType> = {
    new (...args: any[]): T & {};
} | {
    (): T;
};
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
    methods?: {
        [name: string]: (this: Pie, ...args: any[]) => any;
    };
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
export declare class Pie {
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
    methods?: {
        [name: string]: (this: Pie, ...args: any[]) => any;
    };
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
    constructor(options: PieOptions);
    /**
     * 返回pie的全限定名, 格式为: $namespace:$id
     * @example
     * "miraipie:foo"
     * "miraipie:bar"
     */
    get fullId(): string;
    /**
     * 获取依赖项pie的导出对象
     * @param fullId 依赖项的全限定名
     * @example
     * // {foo: 'bar'}
     * this.require('miraipie:foo');
     */
    private require;
}
/**
 * pie消息过滤器类型
 */
export declare type PieFilterBuilder = (...args: any[]) => PieFilter;
/**
 * pie消息过滤器
 */
export declare class PieFilter {
    /**
     * 过滤器签名, 通常要能表达过滤器的意图
     */
    sign: string;
    handler: (window: ChatWindow, chain: MessageChain, pie: Pie) => boolean;
    /**
     * 消息包含@我
     */
    static atMe: PieFilter;
    /**
     * 消息包含@指定QQ号群成员
     * @param id 群成员QQ号
     */
    static at: PieFilterBuilder;
    /**
     * 消息包含@全体成员
     */
    static atAll: PieFilter;
    /**
     * 消息来自指定账号
     * @param id QQ号或群号
     */
    static from: PieFilterBuilder;
    /**
     * 消息不来自指定账号
     * @param id QQ号或群号
     */
    static notFrom: PieFilterBuilder;
    /**
     * 消息包含单一消息类型
     * @param type 单一消息类型
     */
    static containsType: PieFilterBuilder;
    /**
     * 消息显示串匹配正则表达式
     * @param regexp 正则表达式
     */
    static displayStringMatch: PieFilterBuilder;
    /**
     * 消息显示串和指定串全等
     * @param displayString 指定字符串
     */
    static displayStringEquals: PieFilterBuilder;
    /**
     * 多个消息过滤器求<strong>或</strong>
     * @param filters 消息过滤器
     */
    static or: PieFilterBuilder;
    /**
     * 消息来自好友
     */
    static fromFriend: PieFilter;
    /**
     * 消息来自群聊
     */
    static fromGroup: PieFilter;
    /**
     * 消息来自群成员
     */
    static fromMember: PieFilter;
}
/**
 * pie管理类, 用户维护各个pie
 */
export declare class PieAgent {
    /**
     * pie控制块map
     */
    private readonly controller;
    constructor();
    /**
     * 获取pie实例
     * @param fullId pie的全限定名
     */
    getPie(fullId: string): Pie;
    /**
     * 将当前所有pie的环境存储到数据库中
     */
    savePies(): void;
    /**
     * 安装pie
     * @param pie pie实例
     * @param options 安装选项
     */
    install(pie: Pie, options?: {
        path?: string;
        enabled?: boolean;
    }): void;
    /**
     * 卸载pie
     * @param fullId pie全限定名
     */
    uninstall(fullId: string): void;
    /**
     * 启用pie
     * @param fullId pie全限定名
     */
    enable(fullId: string): void;
    /**
     * 禁用pie
     * @param fullId pie全限定名
     */
    disable(fullId: string): void;
    /**
     * 消息分发器, 用以分发消息给各个pie单独处理
     * @param chatMessage 消息原始对象
     */
    messageDispatcher(chatMessage: ChatMessage): Promise<void>;
    /**
     * 事件分发器, 用以分发事件给各个pie单独处理
     * @param event 事件原始对象
     */
    eventDispatcher(event: Event): Promise<void>;
}
export {};
