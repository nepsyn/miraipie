import db from 'better-sqlite3';
import fs from 'fs';
import log4js from 'log4js';
import {MiraiPieAppOptions} from '.';
import {ChatMessageType, Event, EventType, MessageChain} from '../mirai';
import {formatDate, getAssetPath} from '../tool';

const logger = log4js.getLogger('db');

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
export abstract class DatabaseAdapter {
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
    abstract close();

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
    abstract deletePieRecord(fullId: string);

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

export class Sqlite3Adapter extends DatabaseAdapter {
    readonly type = 'Sqlite3Adapter';
    private database: db.Database;

    get open(): boolean {
        return this.database && this.database.open;
    }

    constructor(public path: string) {
        super();
        try {
            this.database = db(path, {
                fileMustExist: true
            });
        } catch (err) {
            logger.error(`打开数据库文件 ${path} 出错:`, err.message);
        }
    }

    static create(path: string): Sqlite3Adapter {
        fs.copyFileSync(getAssetPath('miraipie.db.template'), path);
        return new Sqlite3Adapter(path);
    }

    close() {
        this.database?.close();
        this.database = null;
    }

    saveAppOptions(options: MiraiPieAppOptions): boolean {
        this.database?.prepare('DELETE FROM sys').run();
        const resp = this.database
            ?.prepare('INSERT INTO sys VALUES ($qq, $adapterName, $listenerAdapterName, $verifyKey, $host, $port)')
            .run({
                qq: options.qq,
                adapterName: options.adapter,
                listenerAdapterName: options.listenerAdapter,
                verifyKey: options.adapterSetting.verifyKey,
                host: options.adapterSetting.host,
                port: options.adapterSetting.port
            });
        return resp?.changes > 0;
    }

    loadAppOptions(): MiraiPieAppOptions {
        const options = this.database
            ?.prepare('SELECT qq, adapter_name adapterName, listener_adapter_name listenerAdapterName, verify_key verifyKey, host, port FROM sys')
            .get();
        if (options) {
            return {
                qq: options.qq,
                adapter: options.adapterName,
                listenerAdapter: options.listenerAdapterName,
                adapterSetting: {
                    verifyKey: options.verifyKey,
                    host: options.host,
                    port: options.port
                }
            };
        }
    }

    saveMessage(record: MessageRecord): boolean {
        const resp = this.database
            ?.prepare('INSERT INTO message (id, content, from_id, to_id, type) VALUES ($sourceId, $content, $fromId, $toId, $type)')
            .run({
                sourceId: record.sourceId,
                content: JSON.stringify(MessageChain.from(record.messageChain).dropped('Source')),
                fromId: record.from,
                toId: record.to,
                type: record.type
            });
        return resp?.changes > 0;
    }

    getMessageById(messageId: number) {
        const record = this.database
            .prepare('SELECT id sourceId, content messageChain, from_id [from], to_id [to], type, timestamp time FROM message WHERE id=?')
            .get(messageId);
        if (record) {
            record.messageChain = MessageChain.from(JSON.parse(record.messageChain));
            record.time = new Date(record.time);
        }
        return record;
    }

    queryMessages(conditions: {
        from?: number;
        to?: number;
        type?: ChatMessageType;
        timeStart?: Date;
        timeEnd?: Date;
    } = {}): MessageRecord[] {
        let sql = 'SELECT id sourceId, content messageChain, from_id [from], to_id [to], type, timestamp time FROM message';
        const queries = [];
        if (conditions.from) queries.push('from_id=$from');
        if (conditions.to) queries.push('to_id=$to');
        if (conditions.type) queries.push('type=$type');
        if (conditions.timeStart) queries.push('timestamp>=$timeStart');
        if (conditions.timeEnd) queries.push('timestamp<=$timeEnd');
        if (queries.length > 0) sql += (' WHERE ' + queries.join(' AND '));
        const records = this.database
            ?.prepare(sql)
            .all({
                ...conditions,
                timeStart: formatDate(conditions?.timeStart),
                timeEnd: formatDate(conditions?.timeEnd)
            });
        for (const record of records) {
            record.messageChain = MessageChain.from(JSON.parse(record.messageChain));
            record.time = new Date(record.time);
        }
        return records;
    }

    saveEvent(record: EventRecord): boolean {
        const resp = this.database
            ?.prepare('INSERT INTO event (content, type) VALUES ($content, $type)')
            .run({
                content: JSON.stringify(record.event),
                type: record.type
            });
        return resp?.changes > 0;
    }

    queryEvents(conditions: {
        type?: EventType;
        timeStart?: Date;
        timeEnd?: Date;
    } = {}): EventRecord[] {
        let sql = 'SELECT content event, type, timestamp time FROM event';
        const queries = [];
        if (conditions.type) queries.push('type=$type');
        if (conditions.timeStart) queries.push('timestamp>=$timeStart');
        if (conditions.timeEnd) queries.push('timestamp<=$timeEnd');
        if (queries.length > 0) sql += (' WHERE ' + queries.join(' AND '));
        const records = this.database
            ?.prepare(sql)
            .all({
                ...conditions,
                timeStart: formatDate(conditions?.timeStart),
                timeEnd: formatDate(conditions?.timeEnd)
            });
        for (const record of records) {
            record.event = JSON.parse(record.event);
            record.time = new Date(record.time);
        }
        return records;
    }

    saveOrUpdatePieRecord(record: PieRecord): boolean {
        const count = this.database
            ?.prepare('SELECT COUNT(*) FROM pie WHERE full_id=?')
            .pluck()
            .get(record.fullId);
        if (count > 0) {
            const resp = this.database
                ?.prepare('UPDATE pie SET version=$version, enabled=$enabled, path=$path, configs=$configs WHERE full_id=$fullId')
                .run({
                    fullId: record.fullId,
                    version: record.version,
                    enabled: record.enabled ? 1 : 0,
                    path: record.path,
                    configs: JSON.stringify(record.configs)
                });
            return resp?.changes > 0;
        } else {
            const resp = this.database
                ?.prepare('INSERT INTO pie VALUES ($fullId, $version, $enabled, $path, $configs)')
                .run({
                    fullId: record.fullId,
                    version: record.version,
                    enabled: record.enabled ? 1 : 0,
                    path: record.path,
                    configs: JSON.stringify(record.configs)
                });
            return resp?.changes > 0;
        }
    }

    getPieRecords(): PieRecord[] {
        const records = this.database
            ?.prepare('SELECT full_id fullId, version, enabled, path, configs FROM pie')
            .all();
        for (const record of records || []) {
            record.enabled = (record.enabled === 1);
            record.configs = JSON.parse(record.configs);
        }
        return records;
    }

    getPieRecordByFullId(fullId: string): PieRecord {
        const record = this.database
            ?.prepare('SELECT full_id fullId, version, enabled, path, configs FROM pie WHERE full_id=?')
            .get(fullId);
        if (record) {
            record.enabled = (record.enabled === 1);
            record.configs = JSON.parse(record.configs);
        }
        return record;
    }

    deletePieRecord(fullId: string) {
        this.database
            ?.prepare('DELETE FROM pie WHERE full_id=?')
            .run(fullId);
    }

    clearMessageHistory(days: number): number {
        return this.database
            ?.prepare(`DELETE FROM message WHERE JULIANDAY(DATETIME('now', 'localtime'))-JULIANDAY(DATETIME(timestamp))>?`)
            .run(days)
            ?.changes;
    }

    clearEventHistory(days: number): number {
        return this.database
            ?.prepare(`DELETE FROM event WHERE JULIANDAY(DATETIME('now', 'localtime'))-JULIANDAY(DATETIME(timestamp))>?`)
            .run(days)
            ?.changes;
    }
}
