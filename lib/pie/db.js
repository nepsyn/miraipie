"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sqlite3Adapter = exports.DatabaseAdapter = void 0;
var better_sqlite3_1 = __importDefault(require("better-sqlite3"));
var fs_1 = __importDefault(require("fs"));
var log4js_1 = __importDefault(require("log4js"));
var mirai_1 = require("../mirai");
var tool_1 = require("../tool");
var logger = log4js_1.default.getLogger('db');
/**
 * 数据库adapter
 */
var DatabaseAdapter = /** @class */ (function () {
    function DatabaseAdapter() {
    }
    return DatabaseAdapter;
}());
exports.DatabaseAdapter = DatabaseAdapter;
var Sqlite3Adapter = /** @class */ (function (_super) {
    __extends(Sqlite3Adapter, _super);
    function Sqlite3Adapter(path) {
        var _this = _super.call(this) || this;
        _this.path = path;
        _this.type = 'Sqlite3Adapter';
        try {
            _this.database = better_sqlite3_1.default(path, {
                fileMustExist: true
            });
        }
        catch (err) {
            logger.error("\u6253\u5F00\u6570\u636E\u5E93\u6587\u4EF6 " + path + " \u51FA\u9519:", err.message);
        }
        return _this;
    }
    Object.defineProperty(Sqlite3Adapter.prototype, "open", {
        get: function () {
            return this.database && this.database.open;
        },
        enumerable: false,
        configurable: true
    });
    Sqlite3Adapter.create = function (path) {
        fs_1.default.copyFileSync(tool_1.getAssetPath('miraipie.db.template'), path);
        return new Sqlite3Adapter(path);
    };
    Sqlite3Adapter.prototype.close = function () {
        var _a;
        (_a = this.database) === null || _a === void 0 ? void 0 : _a.close();
        this.database = null;
    };
    Sqlite3Adapter.prototype.saveAppOptions = function (options) {
        var _a, _b;
        (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare('DELETE FROM sys').run();
        var resp = (_b = this.database) === null || _b === void 0 ? void 0 : _b.prepare('INSERT INTO sys VALUES ($qq, $adapterName, $listenerAdapterName, $verifyKey, $host, $port)').run({
            qq: options.qq,
            adapterName: options.adapter,
            listenerAdapterName: options.listenerAdapter,
            verifyKey: options.adapterSetting.verifyKey,
            host: options.adapterSetting.host,
            port: options.adapterSetting.port
        });
        return (resp === null || resp === void 0 ? void 0 : resp.changes) > 0;
    };
    Sqlite3Adapter.prototype.loadAppOptions = function () {
        var _a;
        var options = (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare('SELECT qq, adapter_name adapterName, listener_adapter_name listenerAdapterName, verify_key verifyKey, host, port FROM sys').get();
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
    };
    Sqlite3Adapter.prototype.saveMessage = function (record) {
        var _a;
        var resp = (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare('INSERT INTO message (id, content, from_id, to_id, type) VALUES ($sourceId, $content, $fromId, $toId, $type)').run({
            sourceId: record.sourceId,
            content: JSON.stringify(mirai_1.MessageChain.from(record.messageChain).dropped('Source')),
            fromId: record.from,
            toId: record.to,
            type: record.type
        });
        return (resp === null || resp === void 0 ? void 0 : resp.changes) > 0;
    };
    Sqlite3Adapter.prototype.getMessageById = function (messageId) {
        var record = this.database
            .prepare('SELECT id sourceId, content messageChain, from_id [from], to_id [to], type FROM message WHERE id=?')
            .get(messageId);
        if (record) {
            record.messageChain = mirai_1.MessageChain.from(JSON.parse(record.messageChain));
        }
        return record;
    };
    Sqlite3Adapter.prototype.saveEvent = function (event) {
        var _a;
        var resp = (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare('INSERT INTO event (content, type) VALUES ($content, $type)').run({
            content: JSON.stringify(event),
            type: event.type
        });
        return (resp === null || resp === void 0 ? void 0 : resp.changes) > 0;
    };
    Sqlite3Adapter.prototype.saveOrUpdatePieRecord = function (record) {
        var _a, _b, _c;
        var count = (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare('SELECT COUNT(*) FROM pie WHERE full_id=?').pluck().get(record.fullId);
        if (count > 0) {
            var resp = (_b = this.database) === null || _b === void 0 ? void 0 : _b.prepare('UPDATE pie SET version=$version, enabled=$enabled, path=$path, configs=$configs WHERE full_id=$fullId').run({
                fullId: record.fullId,
                version: record.version,
                enabled: record.enabled ? 1 : 0,
                path: record.path,
                configs: JSON.stringify(record.configs)
            });
            return (resp === null || resp === void 0 ? void 0 : resp.changes) > 0;
        }
        else {
            var resp = (_c = this.database) === null || _c === void 0 ? void 0 : _c.prepare('INSERT INTO pie VALUES ($fullId, $version, $enabled, $path, $configs)').run({
                fullId: record.fullId,
                version: record.version,
                enabled: record.enabled ? 1 : 0,
                path: record.path,
                configs: JSON.stringify(record.configs)
            });
            return (resp === null || resp === void 0 ? void 0 : resp.changes) > 0;
        }
    };
    Sqlite3Adapter.prototype.getPieRecords = function () {
        var e_1, _a;
        var _b;
        var records = (_b = this.database) === null || _b === void 0 ? void 0 : _b.prepare('SELECT full_id fullId, version, enabled, path, configs FROM pie').all();
        try {
            for (var _c = __values(records || []), _d = _c.next(); !_d.done; _d = _c.next()) {
                var record = _d.value;
                record.enabled = (record.enabled === 1);
                record.configs = JSON.parse(record.configs);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return records;
    };
    Sqlite3Adapter.prototype.getPieRecordByFullId = function (fullId) {
        var _a;
        var record = (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare('SELECT full_id fullId, version, enabled, path, configs FROM pie WHERE full_id=?').get(fullId);
        if (record) {
            record.enabled = (record.enabled === 1);
            record.configs = JSON.parse(record.configs);
        }
        return record;
    };
    Sqlite3Adapter.prototype.deletePieRecord = function (fullId) {
        var _a;
        (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare('DELETE FROM pie WHERE full_id=?').run(fullId);
    };
    Sqlite3Adapter.prototype.clearMessageHistory = function (days) {
        var _a, _b;
        return (_b = (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare("DELETE FROM message WHERE JULIANDAY(DATETIME('now', 'localtime'))-JULIANDAY(DATETIME(timestamp))>?").run(days)) === null || _b === void 0 ? void 0 : _b.changes;
    };
    Sqlite3Adapter.prototype.clearEventHistory = function (days) {
        var _a, _b;
        return (_b = (_a = this.database) === null || _a === void 0 ? void 0 : _a.prepare("DELETE FROM event WHERE JULIANDAY(DATETIME('now', 'localtime'))-JULIANDAY(DATETIME(timestamp))>?").run(days)) === null || _b === void 0 ? void 0 : _b.changes;
    };
    return Sqlite3Adapter;
}(DatabaseAdapter));
exports.Sqlite3Adapter = Sqlite3Adapter;
