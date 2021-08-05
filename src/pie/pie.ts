import log4js, {Logger} from 'log4js';
import {ChatWindow, FriendChatWindow, GroupChatWindow, MiraiPieApp, TempChatWindow} from '.';
import {At, ChatMessage, Event, Friend, Group, GroupMember, MessageChain, SingleMessageType} from '../mirai';
import {makeAsync, makeReadonly} from '../tool';

const logger = log4js.getLogger('pie');

export type PieResultType = 'Success' | 'Failed' | 'Ignored';

export class PieResult {
    type: PieResultType;
    data?: any;
    message?: string;

    static success(data?: any): PieResult {
        return {
            type: 'Success',
            data
        };
    }

    static failed(message?: string): PieResult {
        return {
            type: 'Failed',
            message
        };
    }

    static ignored(message?: string): PieResult {
        return {
            type: 'Ignored',
            message
        };
    }
}

type StorableType = string | number | boolean | Array<StorableType> | { [key: string]: StorableType };
type ConfigConstructor<T = StorableType> = { new(...args): T & {}; } | { (): T; }

interface UserConfigMeta<T = StorableType> {
    [key: string]: {
        type: ConfigConstructor<T>;
        required?: boolean;
        description?: string;
        default?: T;
    };
}

export interface PieOptions {
    namespace: string;
    id: string;
    name: string;
    author: string;
    version: [number, number, number, string?];

    description?: string;
    authorUrl?: string;
    projectUrl?: string;
    dependencies?: string[];
    keywords?: string[];

    data?: { [key: string]: StorableType };
    exports?: object;
    methods?: { [name: string]: (this: Pie, ...args: any[]) => any };
    userConfigMeta?: UserConfigMeta;
    filters?: PieFilter[];

    messageHandler?(this: Pie, window: ChatWindow, chain: MessageChain): PieResult | Promise<PieResult | any>;

    eventHandler?(this: Pie, event: Event): PieResult | Promise<PieResult | any>;

    installed?(this: Pie): void;

    uninstalled?(this: Pie): void;

    enabled?(this: Pie): void;

    disabled?(this: Pie): void;
}

export class Pie {
    namespace: string;
    id: string;
    name: string;
    author: string;
    version: [number, number, number, string?];

    description?: string;
    authorUrl?: string;
    projectUrl?: string;
    dependencies?: string[];
    keywords?: string[];

    data?: { [key: string]: StorableType };
    exports?: object;
    userConfigMeta?: UserConfigMeta;
    configs: { [key: string]: StorableType };
    filters: PieFilter[];

    logger: Logger;
    isPie: boolean = true;

    messageHandler?(window: ChatWindow, chain: MessageChain): PieResult | Promise<PieResult>;

    eventHandler?(event: Event): PieResult | Promise<PieResult>;

    installed?(): void;

    uninstalled?(): void;

    enabled?(): void;

    disabled?(): void;

    constructor(options: PieOptions) {
        if (!(options.namespace.match(/^[\w]+$/) && options.id.match(/^[\w]+$/))) {
            throw new Error('pie的namespace和id字段都必须为合法标识符')
        }

        this.namespace = options.namespace;
        this.id = options.id;
        this.author = options.author;
        this.version = options.version;

        this.description = options.description || '';
        this.authorUrl = options.authorUrl || '';
        this.projectUrl = options.projectUrl || '';
        this.dependencies = options.dependencies || [];
        this.keywords = options.keywords || [];

        this.logger = log4js.getLogger(this.fullId);

        if (options.data) Object.assign(this, options.data);
        this.exports = options.exports || {};
        if (options.methods) Object.assign(this, options.methods);
        this.userConfigMeta = options.userConfigMeta || {};
        this.configs = {};
        for (const i of Object.keys(this.userConfigMeta)) this.configs[i] = options.userConfigMeta[i].default;
        this.filters = options.filters || [];

        this.installed = options.installed;
        this.uninstalled = options.uninstalled;
        this.enabled = options.enabled;
        this.disabled = options.disabled;

        this.messageHandler = options.messageHandler;
        this.eventHandler = options.eventHandler;
    }

    get fullId(): string {
        return `${this.namespace}:${this.id}`;
    }

    private getNamespaceExports(): object {
        return MiraiPieApp.instance?.pieAgent.getNamespaceExports(this.namespace);
    }

    private require(fullId: string): object {
        if (this.dependencies.includes(fullId)) return MiraiPieApp.instance?.pieAgent.getPie(fullId)?.exports;
        else logger.error(`所请求的依赖项 '${fullId}' 需要在pie的声明中指定`);
    }
}

export type PieFilterBuilder = (...args: any[]) => PieFilter;

export class PieFilter {
    sign: string;
    handler: (window: ChatWindow, chain: MessageChain, pie: Pie) => boolean;

    static atMe: PieFilter = {
        sign: 'AtMe',
        handler: (window, chain) => {
            return chain.selected('At').some(at => (at as At).target === MiraiPieApp.instance.id)
        }
    };

    static at: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `At(${id})`,
            handler: (window, chain) => {
                return chain.selected('At').some(at => (at as At).target === id)
            }
        };
    }

    static atAll: PieFilter = {
        sign: 'AtAll',
        handler: (window, chain) => chain.selected('AtAll').length > 0
    };

    static from: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `From(${id})`,
            handler: window => window.contact.id === id
        };
    }

    static notFrom: PieFilterBuilder = function (id: number): PieFilter {
        return {
            sign: `NotFrom(${id})`,
            handler: window => window.contact.id !== id
        };
    }

    static containsType: PieFilterBuilder = function (type: SingleMessageType): PieFilter {
        return {
            sign: `ContainsType(${type})`,
            handler: (window, chain) => chain.selected(type).length > 0
        };
    }

    static signatureMatch: PieFilterBuilder = function (regexp: RegExp): PieFilter {
        return {
            sign: `Match(${regexp})`,
            handler: (window, chain) => chain.toString().match(regexp) !== null
        };
    }

    static or: PieFilterBuilder = function (...filters: PieFilter[]): PieFilter {
        return {
            sign: `Or(${filters.map(filter => filter.sign).join(', ')})`,
            handler: (window, chain, pie) => filters.some(filter => filter.handler(window, chain, pie))
        };
    }

    static fromFriend: PieFilter = {
        sign: 'FromFriend',
        handler: (window) => window.type === 'FriendChatWindow'
    }

    static fromGroup: PieFilter = {
        sign: 'FromGroup',
        handler: (window) => window.type === 'GroupChatWindow'
    }

    static fromMember: PieFilter = {
        sign: 'FromMember',
        handler: (window) => window.type === 'TempChatWindow'
    }
}

interface PieControl {
    pie: Pie;
    enabled: boolean;
    configs: { [key: string]: StorableType };
    exports: object;
}

export class PieAgent {
    private readonly controller: Map<string, PieControl>;

    constructor(private autoEnable: boolean = true) {
        this.controller = new Map();
    }

    getNamespaceExports(namespace: string): { [id: string]: object } {
        const exports = {};
        for (const control of this.controller.values()) {
            const pie = control.pie;
            if (pie.namespace === namespace) exports[pie.id] = makeReadonly(pie.exports);
        }
        return exports;
    }

    getPie(fullId: string): Pie {
        return makeReadonly(this.controller.get(fullId)?.pie);
    }

    install(pie: Pie) {
        this.controller.set(pie.fullId, {
            pie,
            enabled: false,
            exports: pie.exports,
            configs: pie.configs
        });
        pie.logger.debug('已加载');
        if (pie.installed) {
            makeAsync(pie.installed, pie)().catch((err) => {
                pie.logger.error('调用钩子installed发生错误:', err);
            });
        }
        if (this.autoEnable) this.enable(pie.fullId);
    }

    uninstall(fullId: string) {
        const pie = this.getPie(fullId);
        if (pie) {
            this.disable(fullId);
            this.controller.delete(fullId);
            pie.logger.debug('已卸载');
            if (pie.uninstalled) {
                makeAsync(pie.uninstalled, pie)().catch((err) => {
                    pie.logger.error('调用钩子uninstalled发生错误:', err);
                });
            }
        }
    }

    enable(fullId: string) {
        const pie = this.getPie(fullId);
        if (pie) {
            this.controller.get(fullId).enabled = true;
            pie.logger.debug('已启用');
            if (pie.enabled) {
                makeAsync(pie.enabled, pie)().catch((err) => {
                    pie.logger.error('调用钩子enabled发生错误:', err);
                });
            }
        }
    }

    disable(fullId: string) {
        const pie = this.getPie(fullId);
        if (pie) {
            this.controller.get(fullId).enabled = false;
            pie.logger.debug('已禁用');
            if (pie.disabled) {
                makeAsync(pie.disabled, pie)().catch((err) => {
                    pie.logger.error('调用钩子disabled发生错误:', err);
                });
            }
        }
    }

    async messageDispatcher(chatMessage: ChatMessage) {
        let window: ChatWindow = null;
        if (chatMessage.type === 'FriendMessage') window = new FriendChatWindow(chatMessage.sender as Friend);
        else if (chatMessage.type === 'GroupMessage') window = new GroupChatWindow(chatMessage.sender as Group);
        else if (chatMessage.type === 'TempMessage') window = new TempChatWindow(chatMessage.sender as GroupMember);

        window = makeReadonly(window);
        const chain = makeReadonly(chatMessage.messageChain);

        for (const control of this.controller.values()) {
            if (control.enabled) {
                const pie = control.pie;
                const passed = pie.filters.every((filter) => {
                    try {
                        return filter.handler(window, chain, pie);
                    } catch (err) {
                        pie.logger.error(`执行过滤器 '${filter.sign}' 时发生错误:`, err);
                        return false
                    }
                });
                if (pie.messageHandler && passed) {
                    makeAsync(pie.messageHandler, pie)(window, chain).catch((err) => {
                        pie.logger.error('调用消息处理器发生错误:', err);
                    });
                }
            }
        }
    }

    async eventDispatcher(event: Event) {
        const _event = makeReadonly(event);

        for (const control of this.controller.values()) {
            if (control.enabled) {
                const pie = control.pie;
                if (pie.eventHandler) {
                    makeAsync(pie.eventHandler, pie)(_event).catch((err) => {
                        pie.logger.error('调用事件处理器发生错误:', err);
                    });
                }
            }
        }
    }
}
