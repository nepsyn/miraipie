import db from 'better-sqlite3';
import fs from 'fs';
import log4js from 'log4js';
import {MiraiPieAppOptions} from '.';
import {ChatMessageType, Event, MessageChain} from '../mirai';
import {getAssetPath} from '../tool';

const logger = log4js.getLogger('db');

interface PieRecord {
    fullId: string;
    version: string;
    enabled: boolean;
    path: string;
    configs: object;
}

export abstract class DatabaseAdapter {
    readonly type: string;
    abstract open: boolean;

    static create: (path: string) => DatabaseAdapter;

    abstract close();

    abstract saveAppOptions(options: MiraiPieAppOptions): boolean;

    abstract loadAppOptions(): MiraiPieAppOptions;

    abstract saveMessage(sourceId: number, messageChain: MessageChain, from: number, to: number, type: ChatMessageType): boolean;

    abstract saveEvent(event: Event): boolean;

    abstract saveOrUpdatePieRecord(record: PieRecord): boolean;

    abstract getPiePath(fullId: string): string;

    abstract getPieRecords(): PieRecord[];

    abstract getPieRecord(fullId: string): PieRecord;

    abstract deletePie(fullId: string);

    abstract clearMessageHistory(days: number): number;

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
            logger.error(`打开数据库文件 ${path} 出错:`, err);
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
                qq: options.id,
                adapterName: options.adapter,
                listenerAdapterName: options.listenerAdapter,
                verifyKey: options.adapterSetting.verifyKey,
                host: options.adapterSetting.host,
                port: options.adapterSetting.port
            });
        return resp?.changes > 0;
    }

    loadAppOptions(): MiraiPieAppOptions {
        const options = this.database?.prepare('SELECT * FROM sys').get();
        if (options) {
            return {
                id: options.qq,
                adapter: options.adapter_name,
                listenerAdapter: options.listener_adapter_name,
                adapterSetting: {
                    verifyKey: options.verify_key,
                    host: options.host,
                    port: options.port
                }
            };
        }
    }

    saveMessage(sourceId: number, messageChain: MessageChain, from: number, to: number, type: ChatMessageType): boolean {
        const resp = this.database
            ?.prepare('INSERT INTO message (id, content, from_id, to_id, type) VALUES ($sourceId, $content, $from_id, $to_id, $type)')
            .run({
                sourceId,
                content: JSON.stringify(messageChain.dropped('Source')),
                from_id: from,
                to_id: to,
                type
            });
        return resp?.changes > 0;
    }

    saveEvent(event: Event): boolean {
        const resp = this.database
            ?.prepare('INSERT INTO event (content, type) VALUES ($content, $type)')
            .run({
                content: JSON.stringify(event),
                type: event.type
            });
        return resp?.changes > 0;
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

    getPiePath(fullId: string): string {
        return this.database
            ?.prepare(`SELECT path FROM pie WHERE full_id=?`)
            .pluck()
            .get(fullId)
    }

    getPieRecords(): PieRecord[] {
        const records = this.database
            ?.prepare('SELECT * FROM pie')
            .all();
        for (const record of records || []) {
            record.enabled = (record.enabled === 1);
            record.configs = JSON.parse(record.configs);
        }
        return records;
    }

    getPieRecord(fullId: string): PieRecord {
        const record = this.database
            ?.prepare('SELECT * FROM pie WHERE full_id=?')
            .get(fullId);
        if (record) {
            record.enabled = (record.enabled === 1);
            record.configs = JSON.parse(record.configs);
        }
        return record;
    }

    deletePie(fullId: string) {
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
