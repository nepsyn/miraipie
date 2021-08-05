import {Database} from 'better-sqlite3';

export interface DatabaseAdapter {
    readonly type: string;
}

export class Sqlite3Adapter implements DatabaseAdapter {
    readonly type = 'Sqlite3Adapter';
    private database: Database;


}
