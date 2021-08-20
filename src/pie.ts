import EventEmitter from 'events';
import {getLogger, Logger} from 'log4js';
import {Chat} from './chat';
import {ConfigMeta, makeConfigs, UserConfigs} from './config';
import {MessageChain} from './message';
import {At, SingleMessageType} from './mirai';
import {MiraiPieApplication} from './miraipie';

/** pie消息过滤器类型 */
export type PieFilterBuilder = (...args: any[]) => PieFilter;

/** pie消息过滤器 */
export class PieFilter {
    /** 过滤器签名, 通常要能表达过滤器的意图 */
    sign: string;
    /**
     * 过滤器的验证器
     * @param chat 当前聊天窗口
     * @param chain 当前消息链
     * @param pie 当前pie对象
     */
    handler: (chat: Chat, chain: MessageChain, pie: Pie) => boolean;

    /** 消息包含@我 */
    static atMe: PieFilter = {
        sign: 'AtMe',
        handler: (chat, chain) => {
            return chain.selected('At').some((at) => (at as At).target === MiraiPieApplication.instance.qq)
        }
    };

    /**
     * 消息包含@指定QQ号群成员
     * @param id 群成员QQ号
     */
    static at: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `At(${id})`,
            handler: (chat, chain) => {
                return chain.selected('At').some((at) => (at as At).target === id)
            }
        };
    }

    /** 消息包含@全体成员 */
    static atAll: PieFilter = {
        sign: 'AtAll',
        handler: (chat, chain) => chain.selected('AtAll').length > 0
    };

    /**
     * 消息来自指定账号
     * @param id QQ号或群号
     */
    static from: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `From(${id})`,
            handler: (chat) => chat.contact.id === id
        };
    }

    /**
     * 消息不来自指定账号
     * @param id QQ号或群号
     */
    static notFrom: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `NotFrom(${id})`,
            handler: (chat) => chat.contact.id !== id
        };
    }

    /**
     * 消息包含单一消息类型
     * @param type 单一消息类型
     */
    static containsType: PieFilterBuilder = function (type: SingleMessageType): PieFilter {
        return {
            sign: `ContainsType(${type})`,
            handler: (chat, chain) => chain.selected(type).length > 0
        };
    }

    /**
     * 消息显示串匹配正则表达式
     * @param regexp 正则表达式
     */
    static displayStringMatch: PieFilterBuilder = function (regexp: RegExp | string): PieFilter {
        return {
            sign: `DisplayStringMatch(${regexp})`,
            handler: (chat, chain) => chain.toDisplayString().match(regexp) !== null
        };
    }

    /**
     * 消息显示串和指定串全等
     * @param displayString 指定字符串
     */
    static displayStringEquals: PieFilterBuilder = function (displayString: string): PieFilter {
        return {
            sign: `DisplayStringEquals(${displayString})`,
            handler: (chat, chain) => chain.toDisplayString() === displayString
        }
    }

    /**
     * 多个消息过滤器求<strong>或</strong>
     * @param filters 消息过滤器
     */
    static or: PieFilterBuilder = function (...filters: PieFilter[]): PieFilter {
        return {
            sign: `Or(${filters.map((filter) => filter.sign).join(', ')})`,
            handler: (chat, chain, pie) => filters.some((filter) => filter.handler(chat, chain, pie))
        };
    }

    /** 消息来自好友 */
    static fromFriend: PieFilter = {
        sign: 'FromFriend',
        handler: (chat) => chat.isFriendChat()
    }

    /** 消息来自群聊 */
    static fromGroup: PieFilter = {
        sign: 'FromGroup',
        handler: (chat) => chat.isGroupChat()
    }

    /** 消息来自群成员 */
    static fromMember: PieFilter = {
        sign: 'FromMember',
        handler: (chat) => chat.isTempChat()
    }
}

interface MethodsOption {
    [key: string]: (this: Pie, ...args: any) => any;
}

type MessageReceivedListener = (chat: Chat, chain: MessageChain) => any;
type LifecycleHookListener = () => any;

type PieHookOptions = {
    /**
     * pie消息监听器, 用以监听消息并处理
     * @param chat 当前聊天窗
     * @param chain 消息链
     * @example
     * // 复读机
     * async received(chat, chain) => {
     *     await chat.send(chain);
     * }
     */
    received?: MessageReceivedListener;

    /** pie安装完成hook */
    installed?: LifecycleHookListener;

    /** pie卸载完成hook */
    uninstalled?: LifecycleHookListener;

    /** pie启用hook */
    enabled?: LifecycleHookListener;

    /** pie禁用hook */
    disabled?: LifecycleHookListener;
}

type PieOptions<C extends ConfigMeta, D extends {}, M extends MethodsOption> = {
        /** id(必须为合法标识符) */
        id: string;
        /** 名称 */
        name: string;
        /** 作者 */
        author: string;
        /** 版本号 */
        version: string;

        /** 描述 */
        description?: string;
        /** 作者链接 */
        authorUrl?: string;
        /** 项目链接 */
        projectUrl?: string;

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
         *         description: '累加器步长'
         *     }
         * }
         */
        configMeta?: C;
        /** pie中数据 */
        data?: D;
        /**
         * pie中方法, 生成pie实例时会自动挂载到实例上
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
        methods?: M;
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
    }
    & PieHookOptions
    & ThisType<Pie<C, D, M>>;

export type Pie<C extends ConfigMeta = {}, D extends {} = {}, M extends MethodsOption = {}> =
    {
        /** id */
        readonly id: string;
        /** 名称 */
        readonly name: string;
        /** 作者 */
        readonly author: string;
        /** 版本号 */
        readonly version: string;

        /** 描述 */
        description: string;
        /** 作者链接 */
        authorUrl: string;
        /** 项目链接 */
        projectUrl: string;

        /** 配置元定义 */
        readonly configMeta: C;

        /** 用户配置 */
        configs: UserConfigs<C>;

        /** pie 过滤器 */
        filters: PieFilter[];

        /** logger */
        logger: Logger;

        /** 是否为 pie 标识, 恒为 true */
        readonly __isPie: true;

        addListener(e: 'received', listener: MessageReceivedListener);
        addListener(e: 'installed', listener: LifecycleHookListener);
        addListener(e: 'uninstalled', listener: LifecycleHookListener);
        addListener(e: 'enabled', listener: LifecycleHookListener);
        addListener(e: 'disabled', listener: LifecycleHookListener);

        once(e: 'received', listener: MessageReceivedListener);
        once(e: 'installed', listener: LifecycleHookListener);
        once(e: 'uninstalled', listener: LifecycleHookListener);
        once(e: 'enabled', listener: LifecycleHookListener);
        once(e: 'disabled', listener: LifecycleHookListener);

        on(e: 'received', listener: MessageReceivedListener);
        on(e: 'installed', listener: LifecycleHookListener);
        on(e: 'uninstalled', listener: LifecycleHookListener);
        on(e: 'enabled', listener: LifecycleHookListener);
        on(e: 'disabled', listener: LifecycleHookListener);

        prependListener(e: 'received', listener: MessageReceivedListener);
        prependListener(e: 'installed', listener: LifecycleHookListener);
        prependListener(e: 'uninstalled', listener: LifecycleHookListener);
        prependListener(e: 'enabled', listener: LifecycleHookListener);
        prependListener(e: 'disabled', listener: LifecycleHookListener);

        prependOnceListener(e: 'received', listener: MessageReceivedListener);
        prependOnceListener(e: 'installed', listener: LifecycleHookListener);
        prependOnceListener(e: 'uninstalled', listener: LifecycleHookListener);
        prependOnceListener(e: 'enabled', listener: LifecycleHookListener);
        prependOnceListener(e: 'disabled', listener: LifecycleHookListener);

        emit(e: 'received', chat: Chat, chain: MessageChain);
        emit(e: 'installed');
        emit(e: 'uninstalled');
        emit(e: 'enabled');
        emit(e: 'disabled');

        listeners(e: 'received'): MessageReceivedListener[];
        listeners(e: 'installed'): LifecycleHookListener[];
        listeners(e: 'uninstalled'): LifecycleHookListener[];
        listeners(e: 'enabled'): LifecycleHookListener[];
        listeners(e: 'disabled'): LifecycleHookListener[];
    }
    & D & M
    & EventEmitter;

/**
 * 创建 pie
 * @param options pie 选项
 */
export function makePie<C extends ConfigMeta, D extends {}, M extends MethodsOption>(options: PieOptions<C, D, M>) {
    const {data, methods, configMeta} = options;
    const pie = Object.assign(new EventEmitter(), {
        ...(data || {}),
        ...(methods || {}),
        id: options.id,
        name: options.name,
        author: options.author,
        version: options.version,
        description: options.description || '',
        authorUrl: options.authorUrl || '',
        projectUrl: options.projectUrl || '',
        configMeta: configMeta || {},
        configs: makeConfigs(configMeta),
        filters: options.filters || [],
        logger: getLogger('pie'),
        __isPie: true
    });

    if (typeof options.received === 'function') pie.on('received', (...args) => options.received.apply(pie, args));
    if (typeof options.installed === 'function') pie.on('installed', () => options.installed.apply(pie));
    if (typeof options.uninstalled === 'function') pie.on('uninstalled', () => options.uninstalled.apply(pie));
    if (typeof options.enabled === 'function') pie.on('enabled', () => options.enabled.apply(pie));
    if (typeof options.disabled === 'function') pie.on('disabled', () => options.disabled.apply(pie));

    return pie as Pie<C, D, M>;
}
