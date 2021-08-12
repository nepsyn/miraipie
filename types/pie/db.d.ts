import { MiraiPieAppOptions } from '.';
import { ChatMessageType, Event, EventType, MessageChain } from '../mirai';
/**
 * 数据库中pie记录
 */
interface PieRecord {
    /**
     * pie全限定名
     */
    fullId: string;
    /**
     * pie版本号
     */
    version: string;
    /**
     * pie是否启用
     */
    enabled: boolean;
    /**
     * pie模块路径
     */
    path: string;
    /**
     * pie用户配置
     */
    configs: object;
}
/**
 * 数据库中消息记录
 */
interface MessageRecord {
    /**
     * 消息id
     */
    sourceId: number;
    /**
     * 消息链
     */
    messageChain: MessageChain;
    /**
     * 消息发送人QQ号
     */
    from: number;
    /**
     * 消息接收者账号
     */
    to: number;
    /**
     * 消息类型
     */
    type: ChatMessageType;
    /**
     * 时间
     */
    time?: Date;
}
/**
 * 数据库中事件记录
 */
interface EventRecord {
    /**
     * 事件内容
     */
    event: Event;
    /**
     * 事件类型
     */
    type: EventType;
    /**
     * 时间
     */
    time?: Date;
}
/**
 * 数据库adapter
 */
export declare abstract class DatabaseAdapter {
    /**
     * adapter类型
     */
    readonly type: string;
    /**
     * 是否已打卡
     */
    abstract open: boolean;
    /**
     * 数据库文件路径
     */
    abstract path: string;
    /**
     * 创建新的数据库
     */
    static create: (path: string) => DatabaseAdapter;
    /**
     * 关闭当前数据库
     */
    abstract close(): any;
    /**
     * 保存miraipie应用信息
     * @param options 应用信息
     */
    abstract saveAppOptions(options: MiraiPieAppOptions): boolean;
    /**
     * 获取miraipie应用信息
     */
    abstract loadAppOptions(): MiraiPieAppOptions;
    /**
     * 保存一条消息
     * @param record 消息记录
     */
    abstract saveMessage(record: MessageRecord): boolean;
    /**
     * 根据消息id获取一条消息原始记录
     * @param messageId
     */
    abstract getMessageById(messageId: number): MessageRecord;
    /**
     * 通过指定条件查询消息记录
     * @param conditions 查询条件
     */
    abstract queryMessages(conditions?: {
        from?: number;
        to?: number;
        type?: ChatMessageType;
        timeStart?: Date;
        timeEnd?: Date;
    }): MessageRecord[];
    /**
     * 保存一个事件
     * @param record 事件
     */
    abstract saveEvent(record: EventRecord): boolean;
    /**
     * 通过指定条件查询事件记录
     * @param conditions 查询条件
     */
    abstract queryEvents(conditions?: {
        type?: EventType;
        timeStart?: Date;
        timeEnd?: Date;
    }): EventRecord[];
    /**
     * 保存或更新pie记录
     * @param record pie记录
     */
    abstract saveOrUpdatePieRecord(record: PieRecord): boolean;
    /**
     * 获取所有pie记录
     */
    abstract getPieRecords(): PieRecord[];
    /**
     * 获取指定全限定名pie
     * @param fullId pie全限定名
     */
    abstract getPieRecordByFullId(fullId: string): PieRecord;
    /**
     * 删除指定全限定名pie记录
     * @param fullId pie全限定名
     */
    abstract deletePieRecord(fullId: string): any;
    /**
     * 删除历史消息
     * @param days 和当前日期相差天数
     */
    abstract clearMessageHistory(days: number): number;
    /**
     * 删除历史事件
     * @param days 和当前日期相差天数
     */
    abstract clearEventHistory(days: number): number;
}
export declare class Sqlite3Adapter extends DatabaseAdapter {
    path: string;
    readonly type = "Sqlite3Adapter";
    private database;
    get open(): boolean;
    constructor(path: string);
    static create(path: string): Sqlite3Adapter;
    close(): void;
    saveAppOptions(options: MiraiPieAppOptions): boolean;
    loadAppOptions(): MiraiPieAppOptions;
    saveMessage(record: MessageRecord): boolean;
    getMessageById(messageId: number): any;
    queryMessages(conditions?: {
        from?: number;
        to?: number;
        type?: ChatMessageType;
        timeStart?: Date;
        timeEnd?: Date;
    }): MessageRecord[];
    saveEvent(record: EventRecord): boolean;
    queryEvents(conditions?: {
        type?: EventType;
        timeStart?: Date;
        timeEnd?: Date;
    }): EventRecord[];
    saveOrUpdatePieRecord(record: PieRecord): boolean;
    getPieRecords(): PieRecord[];
    getPieRecordByFullId(fullId: string): PieRecord;
    deletePieRecord(fullId: string): void;
    clearMessageHistory(days: number): number;
    clearEventHistory(days: number): number;
}
export {};
