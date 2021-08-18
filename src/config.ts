/** 配置类型 */
import {Logger} from 'log4js';

type ConfigConstructor<T> = {
    new(...args: any[]): T & {};
    (...args: []): T;
}

/** 配置默认值工厂函数 */
type ConfigDefaultFactory<T> = (...args: []) => T;

/** 配置项 */
interface Config<T> {
    /** 配置类型 */
    type: ConfigConstructor<T>;
    /** 是否必要 */
    required?: boolean;
    /** 配置项描述 */
    description?: string;
    /** 默认值工厂函数 */
    default?: ConfigDefaultFactory<T>;
}

/** 配置元定义 */
export interface ConfigMeta<T = any> {
    [key: string]: Config<T>;
}

/** 用户配置 */
export type UserConfigs<C extends ConfigMeta> = {
    [P in keyof C]: ReturnType<C[P]['default']>;
};

/** 通过元定义生成默认用户配置 */
export function makeConfigs<C extends ConfigMeta>(configMeta: C): UserConfigs<C> {
    const configs = {};
    for (const key in configMeta || {}) {
        if (configMeta.hasOwnProperty(key)) configs[key] = configMeta[key].default && configMeta[key].default();
    }
    return configs as UserConfigs<C>;
}

export function checkUserConfig<C extends ConfigMeta>(configMeta: C, configs: Partial<UserConfigs<C>>, logger?: Logger) {
    for (const prop in configMeta) {
        if (prop in configs) {
            if (typeof configs[prop] !== typeof configMeta[prop].type() && logger) {
                logger.warn(`配置项 ${prop} 不符合类型定义, 需要类型 ${typeof configMeta[prop].type()}, 得到类型 ${typeof configs[prop]}`)
            }
        }
        if (!(prop in configs) && configMeta[prop].required) {
            if (logger) {
                logger.error(`必要配置项 ${prop} 缺失`);
            } else {
                throw new Error(`必要配置项 ${prop} 缺失`);
            }
        }
    }
}

/** 拓展项基础配置 */
interface BaseExtensionConfig {
    /** 拓展项模块路径 */
    module?: string;
    /** 用户配置 */
    configs: object;
}

/** adapter 配置 */
type AdapterConfig = BaseExtensionConfig;

/** pie 配置 */
interface PieConfig extends BaseExtensionConfig {
    /** pie 是否启用 */
    enabled: boolean;
}

/** MiraiPie 应用程序配置 */
export interface ApplicationConfig {
    /** 机器人服务的QQ号 */
    qq: number;

    /** 当前选用的 adapter */
    adapterInUse: string;

    /** 日志存放文件夹, null 时不写入日志 */
    logDirectory: string;

    /** 日志级别 */
    logLevel: string;

    /** 是否打印接收到的消息和事件 */
    verbose: boolean;

    /** adapter 配置 */
    adapters: { [id: string]: AdapterConfig };

    /** pie 配置 */
    pies: { [id: string]: PieConfig };

    /** 额外的拓展 */
    extensions: string[]
}

export class ApplicationConfig {
    /** 机器人服务的QQ号 */
    qq: number;

    /** 当前选用的 adapter */
    adapterInUse: string;

    /** 日志存放文件夹, null 时不写入日志 */
    logDirectory: string;

    /** 日志级别 */
    logLevel: string;

    /** 是否打印接收到的消息和事件 */
    verbose: boolean;

    /** adapter 配置 */
    adapters: { [id: string]: AdapterConfig };

    /** pie 配置 */
    pies: { [id: string]: PieConfig };

    /** 额外的拓展 */
    extensions: string[]

    static make(config: Partial<ApplicationConfig>): ApplicationConfig {
        if (!config.qq) throw Error('配置文件缺少服务qq号');
        return {
            qq: config.qq,
            adapterInUse: config.adapterInUse || null,
            logDirectory: config.logDirectory || 'log',
            logLevel: config.logLevel || 'debug',
            verbose: config.verbose || false,
            adapters: config.adapters || {},
            pies: config.pies || {},
            extensions: config.extensions || []
        };
    }
}
