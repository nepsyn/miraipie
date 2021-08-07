import db from 'better-sqlite3';
import * as fs from 'fs';
import log4js from 'log4js';
import {MiraiPieAppOptions, Pie} from '.';
import {ChatMessageType, Event, MessageChain} from '../mirai';
import {getAssetPath} from '../tool';

const logger = log4js.getLogger('db');

export abstract class DatabaseAdapter {
    readonly type: string;

    static create: (path: string) => DatabaseAdapter;

    abstract close();

    abstract saveAppOptions(options: MiraiPieAppOptions): boolean;

    abstract loadAppOptions(): MiraiPieAppOptions;

    abstract saveMessage(sourceId: number, messageChain: MessageChain, from: number, to: number, type: ChatMessageType): boolean;

    abstract saveEvent(event: Event): boolean;

    abstract saveOrUpdatePie(pie: Pie, path: string): boolean;
}

export class Sqlite3Adapter extends DatabaseAdapter {
    readonly type = 'Sqlite3Adapter';
    private db: db.Database;

    constructor(public path: string) {
        super();
        try {
            this.db = db(path, {
                fileMustExist: true
            });
        } catch {
            fs.copyFileSync(getAssetPath('miraipie.db.template'), path);
            this.db = db(path);
        }
    }

    static create(path: string): Sqlite3Adapter {
        fs.copyFileSync(getAssetPath('miraipie.db.template'), path);
        return new Sqlite3Adapter(path);
    }

    close() {
        this.db.close();
        this.db = null;
    }

    saveAppOptions(options: MiraiPieAppOptions): boolean {
        this.db?.prepare('DELETE FROM sys').run();
        const resp = this.db
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
        const options = this.db.prepare('SELECT * FROM sys').get();
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
        const resp = this.db
            ?.prepare('INSERT INTO message (id, content, from_id, to_id, type) VALUES ($sourceId, $content, $from_id, $to_id, $type)')
            .run({
                sourceId,
                content: JSON.stringify(messageChain),
                from_id: from,
                to_id: to,
                type
            });
        return resp?.changes > 0;
    }

    saveEvent(event: Event): boolean {
        const resp = this.db
            ?.prepare('INSERT INTO event (content, type) VALUES ($content, $type)')
            .run({
                content: JSON.stringify(event),
                type: event.type
            });
        return resp?.changes > 0;
    }

    saveOrUpdatePie(pie: Pie, path?: string): boolean {
        const count = this.db
            ?.prepare('SELECT COUNT(*) FROM pie WHERE full_id=?')
            .pluck()
            .get(pie.fullId);
        if (count > 0) {
            const resp = this.db
                ?.prepare('UPDATE pie SET config=$config, data=$data, path=$path WHERE full_id=$fullId')
                .run({
                    fullId: pie.fullId,
                    path,
                    config: JSON.stringify(pie.configs),
                    data: JSON.stringify(pie.data)
                });
            return resp?.changes > 0;
        } else {
            const resp = this.db
                ?.prepare('INSERT INTO pie VALUES ($fullId, $path, $config, $data)')
                .run({
                    fullId: pie.fullId,
                    path,
                    config: JSON.stringify(pie.configs),
                    data: JSON.stringify(pie.data)
                });
            return resp?.changes > 0;
        }
    }

    getPiePath(fullId: string): string {
        return this.db
            ?.prepare(`SELECT [path] FROM pie WHERE full_id=?`)
            .pluck()
            .get(fullId)
    }

    deletePie(fullId: string) {
        this.db
            ?.prepare('DELETE FROM pie WHERE full_id=?')
            .run(fullId);
    }
}
