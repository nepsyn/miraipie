"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
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
var child_process_1 = require("child_process");
var commander_1 = require("commander");
var enquirer_1 = require("enquirer");
var fs_1 = __importDefault(require("fs"));
var log4js_1 = __importDefault(require("log4js"));
var path_1 = __importDefault(require("path"));
var mirai_1 = require("../mirai");
var pie_1 = require("../pie");
var tool_1 = require("../tool");
var logger = log4js_1.default.getLogger('console');
log4js_1.default.configure({
    appenders: {
        console: {
            type: 'console'
        },
        file: {
            type: 'dateFile',
            filename: 'log/miraipie.log',
        }
    },
    categories: {
        default: {
            appenders: ['console', 'file'],
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }
    }
});
function parseFullId(fullId) {
    var _a;
    var namespace = null, id = null;
    if (fullId) {
        if (fullId.includes(':'))
            _a = __read(fullId.split(':'), 2), namespace = _a[0], id = _a[1];
        else
            id = fullId;
    }
    return [namespace, id];
}
function useDatabase(path) {
    return new Promise(function (resolve) {
        var db = new pie_1.Sqlite3Adapter(path);
        if (db.open)
            resolve(db);
    });
}
function addLocalPie(p, db) {
    try {
        var pie_2 = require(p);
        // 数据库检索是否已经存在
        var record = db.getPieRecordByFullId(pie_2.fullId);
        if (record) {
            // 若数据库中版本较旧则更新数据库中模块地址
            if (pie_2.version > record.version) {
                db.saveOrUpdatePieRecord(__assign(__assign({}, record), { path: p }));
            }
            else {
                logger.info("\u6307\u5B9Apie '" + pie_2.fullId + "' \u5DF2\u5B58\u5728\u4E8E\u6570\u636E\u5E93\u4E2D");
            }
        }
        else {
            var configProps_1 = Object.keys(pie_2.userConfigMeta);
            var queries = configProps_1.map(function (prop) {
                var meta = pie_2.userConfigMeta[prop];
                return {
                    type: 'input',
                    name: prop,
                    message: "\u8BF7\u8F93\u5165\u914D\u7F6E\u9879 - " + prop + (meta.description ? "(" + meta.description + ")" : ''),
                    initial: JSON.stringify(meta.default)
                };
            });
            enquirer_1.prompt(queries).then(function (pro) {
                var e_1, _a;
                try {
                    for (var configProps_2 = __values(configProps_1), configProps_2_1 = configProps_2.next(); !configProps_2_1.done; configProps_2_1 = configProps_2.next()) {
                        var prop = configProps_2_1.value;
                        try {
                            pro[prop] = pie_2.userConfigMeta[prop].type(JSON.parse(pro[prop] || 'null'));
                        }
                        catch (err) {
                            pro[prop] = null;
                            logger.error("\u914D\u7F6E\u9879 '" + prop + "' \u521D\u59CB\u5316\u51FA\u9519:", err.message);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (configProps_2_1 && !configProps_2_1.done && (_a = configProps_2.return)) _a.call(configProps_2);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // 数据库中添加记录
                db.saveOrUpdatePieRecord({
                    fullId: pie_2.fullId,
                    version: pie_2.version,
                    enabled: true,
                    path: p,
                    configs: pro
                });
                logger.info("\u6210\u529F\u6DFB\u52A0pie '" + pie_2.fullId + "'");
            }).catch(function () {
                logger.info("\u5DF2\u53D6\u6D88\u6DFB\u52A0pie '" + pie_2.fullId + "'");
            });
        }
    }
    catch (err) {
        logger.error("\u6DFB\u52A0pie\u6A21\u5757 " + p + " \u5931\u8D25:", err.message);
    }
}
function logMessage(chatMessage) {
    if (chatMessage.type === 'FriendMessage') {
        var sender = chatMessage.sender;
        logger.info(sender.nickname + "(" + sender.id + ") -> " + chatMessage.messageChain.toDisplayString());
    }
    else if (chatMessage.type === 'GroupMessage') {
        var sender = chatMessage.sender;
        logger.info("[" + sender.group.name + "(" + sender.group.id + ")] " + sender.memberName + "(" + sender.id + ") -> " + chatMessage.messageChain.toDisplayString());
    }
    else if (chatMessage.type === 'TempMessage') {
        var sender = chatMessage.sender;
        logger.info(sender.memberName + "(" + sender.id + ") -> " + chatMessage.messageChain.toDisplayString());
    }
}
function logEvent(event) {
    logger.info(event.type + ": " + JSON.stringify(event));
}
commander_1.program
    .version("miraipie " + require('../../package.json').version, '-V, --version', '显示版本信息')
    .option('-d, --db-file <path>', 'miraipie的数据库文件路径', 'miraipie.db')
    .helpOption('-h, --help', '显示帮助信息')
    .addHelpCommand('help [command]', '显示命令帮助');
commander_1.program
    .command('start')
    .description('启动miraipie应用程序')
    .option('-r, --renew', '重新填写miraipie应用配置')
    .option('-p, --pies <paths...>', 'miraipie需要额外加载的pie的模块路径')
    .option('-v, --verbose', '控制台打印miraipie接收到的消息和事件')
    .action(function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    var db, options, _a, _b, p, app;
    var e_2, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                db = fs_1.default.existsSync(commander_1.program.opts().dbFile) ? new pie_1.Sqlite3Adapter(commander_1.program.opts().dbFile) : pie_1.Sqlite3Adapter.create(commander_1.program.opts().dbFile);
                if (db.open && fs_1.default.statSync(commander_1.program.opts().dbFile).size / Math.pow(2, 30) > 1) {
                    logger.warn('数据库文件大小已超过1GB, 建议使用命令 `miraipie clear-history` 清除历史消息记录');
                }
                options = db.loadAppOptions();
                try {
                    for (_a = __values(opts.pies || []), _b = _a.next(); !_b.done; _b = _a.next()) {
                        p = _b.value;
                        addLocalPie(path_1.default.isAbsolute(p) ? p : path_1.default.join(process.cwd(), p), db);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (!((!options) || opts.renew)) return [3 /*break*/, 1];
                enquirer_1.prompt([
                    {
                        type: 'select',
                        name: 'adapter',
                        message: '请选择用于全局的mirai-api-http adapter',
                        choices: Object.keys(mirai_1.MiraiApiHttpAdapterMap)
                    },
                    {
                        type: 'select',
                        name: 'listenerAdapter',
                        message: '请选择用于监听事件的mirai-api-http adapter',
                        choices: Object.keys(mirai_1.MiraiApiHttpAdapterMap),
                        initial: 1
                    },
                    {
                        type: 'input',
                        name: 'qq',
                        message: '请输入mirai-api-http服务的QQ号'
                    },
                    {
                        type: 'input',
                        name: 'host',
                        message: '请输入mirai-api-http服务的主机地址',
                        initial: '127.0.0.1'
                    },
                    {
                        type: 'input',
                        name: 'port',
                        message: '请输入mirai-api-http服务的端口号',
                        initial: '23333'
                    },
                    {
                        type: 'password',
                        name: 'verifyKey',
                        message: '请输入mirai-api-http配置项中的verifyKey'
                    }
                ]).then(function (pro) { return __awaiter(void 0, void 0, void 0, function () {
                    var app;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                app = pie_1.createMiraiPieApp({
                                    qq: pro.qq,
                                    adapter: pro.adapter,
                                    listenerAdapter: pro.listenerAdapter,
                                    adapterSetting: {
                                        verifyKey: pro.verifyKey,
                                        host: pro.host,
                                        port: parseInt(pro.port)
                                    },
                                    db: db
                                });
                                if (opts.verbose) {
                                    app.onMessage(logMessage);
                                    app.onEvent(logEvent);
                                }
                                return [4 /*yield*/, app.listen()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }).catch(function () {
                    logger.info('已取消初始化miraipie');
                });
                return [3 /*break*/, 3];
            case 1:
                app = pie_1.createMiraiPieApp(__assign(__assign({}, options), { db: db }));
                if (opts.verbose) {
                    app.onMessage(logMessage);
                    app.onEvent(logEvent);
                }
                return [4 /*yield*/, app.listen()];
            case 2:
                _d.sent();
                _d.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
commander_1.program
    .command('create [full_id] [dest]')
    .aliases(['new', 'init', 'c'])
    .description('使用模板创建新的pie项目')
    .action(function (fullId, dest) {
    var _a = __read(parseFullId(fullId), 2), namespace = _a[0], id = _a[1];
    enquirer_1.prompt([
        {
            type: 'input',
            name: 'namespace',
            message: '请输入namespace',
            initial: namespace
        },
        {
            type: 'input',
            name: 'id',
            message: '请输入id',
            initial: id
        },
        {
            type: 'input',
            name: 'name',
            message: '请输入名称',
            initial: id
        },
        {
            type: 'input',
            name: 'path',
            message: '请输入存放位置',
            initial: dest || "pies/" + (id || 'pie') + "/"
        }
    ]).then(function (pro) { return __awaiter(void 0, void 0, void 0, function () {
        var proConfirm, packageContent, pieContent, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!!fs_1.default.existsSync(pro.path)) return [3 /*break*/, 1];
                    fs_1.default.mkdirSync(pro.path, { recursive: true });
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, enquirer_1.prompt({
                        type: 'confirm',
                        name: 'confirm',
                        message: "\u6307\u5B9A\u76EE\u5F55 " + pro.path + " \u5DF2\u5B58\u5728, \u662F\u5426\u8986\u76D6\u6587\u4EF6\u5939?",
                    })];
                case 2:
                    proConfirm = _a.sent();
                    if (!proConfirm.confirm) {
                        logger.info('已取消创建项目操作');
                        return [2 /*return*/];
                    }
                    _a.label = 3;
                case 3:
                    packageContent = fs_1.default.readFileSync(tool_1.getAssetPath('package.json.template')).toString();
                    packageContent = packageContent.replace('{{name}}', pro.name);
                    fs_1.default.writeFileSync(path_1.default.join(pro.path, 'package.json'), packageContent);
                    pieContent = fs_1.default.readFileSync(tool_1.getAssetPath('pie.js.template')).toString();
                    pieContent = pieContent
                        .replace('{{namespace}}', pro.namespace)
                        .replace('{{id}}', pro.id)
                        .replace('{{name}}', pro.name);
                    fs_1.default.writeFileSync(path_1.default.join(pro.path, 'index.js'), pieContent);
                    // 调用npm初始化
                    child_process_1.execSync("cd " + pro.path + " && npm install");
                    logger.info('创建pie项目完成');
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    logger.error('创建pie项目失败, 错误:', err_1.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }).catch(function () {
        logger.info('已取消创建pie项目');
    });
});
commander_1.program
    .command('add <path>')
    .aliases(['get', 'a'])
    .description('从远程或本地添加pie(远程仓库将使用git克隆)')
    .action(function (p) {
    useDatabase(commander_1.program.opts().dbFile).then(function (db) {
        var absPath = path_1.default.isAbsolute(p) ? p : path_1.default.join(process.cwd(), p);
        if (fs_1.default.existsSync(absPath)) { // 路径本地存在
            addLocalPie(absPath, db);
        }
        else { // 本地不存在
            enquirer_1.prompt({
                type: 'input',
                name: 'dest',
                message: '未找到本地模块, 尝试使用git克隆远程仓库到目标文件夹(Ctrl-C取消)',
                initial: path_1.default.basename(p).split('.')[0]
            }).then(function (pro) {
                try {
                    child_process_1.execSync("git clone " + p + " " + pro.dest + " && cd " + pro.dest + " && npm install");
                    addLocalPie(path_1.default.isAbsolute(pro.dest) ? pro.dest : path_1.default.join(process.cwd(), pro.dest), db);
                }
                catch (err) {
                    logger.error('调用git clone远程仓库出错:', err.message);
                }
            }).catch(function () {
                logger.info('已取消克隆远程仓库');
            });
        }
    });
});
commander_1.program
    .command('list-pies')
    .aliases(['ls', 'list'])
    .option('-e, --list-enabled', '只显示已启用的pie')
    .description('显示已添加的pie列表')
    .action(function (opts) {
    useDatabase(commander_1.program.opts().dbFile).then(function (db) {
        var records = opts.listEnabled ? db.getPieRecords().filter(function (record) { return record.enabled; }) : db.getPieRecords();
        if (records.length > 0) {
            var header = "" + 'full_id'.padEnd(32) + 'version'.padEnd(12) + 'enabled'.padEnd(10) + "path\n" +
                ("" + '-'.repeat(7).padEnd(32) + '-'.repeat(7).padEnd(12) + '-'.repeat(7).padEnd(10) + '-'.repeat(4) + "\n");
            var content = records.map(function (record) {
                return "" + record.fullId.padEnd(32) + record.version.padEnd(12) + record.enabled.toString().padEnd(10) + record.path;
            }).join('\n');
            logger.info("\u5F53\u524D\u6570\u636E\u5E93\u4E2Dpie\u5217\u8868:\n" + header + content);
        }
        else {
            logger.info("\u5F53\u524D\u6570\u636E\u5E93\u4E2D\u65E0\u5DF2\u6DFB\u52A0" + (opts.listEnabled ? '且启用' : '') + "\u7684pie\u4FE1\u606F");
        }
    });
});
commander_1.program
    .command('enable <full_id>')
    .description('启用已添加的pie')
    .action(function (fullId) {
    useDatabase(commander_1.program.opts().dbFile).then(function (db) {
        var record = db.getPieRecordByFullId(fullId);
        if (record) {
            db.saveOrUpdatePieRecord(__assign(__assign({}, record), { enabled: true }));
            logger.info("\u5DF2\u542F\u7528 '" + fullId + "'");
        }
        else {
            logger.error("\u6570\u636E\u5E93\u4E2D\u6CA1\u6709pie '" + fullId + "'");
        }
    });
});
commander_1.program
    .command('disable <full_id>')
    .description('禁用已添加的pie')
    .action(function (fullId) {
    useDatabase(commander_1.program.opts().dbFile).then(function (db) {
        var record = db.getPieRecordByFullId(fullId);
        if (record) {
            db.saveOrUpdatePieRecord(__assign(__assign({}, record), { enabled: false }));
            logger.info("\u5DF2\u7981\u7528 '" + fullId + "'");
        }
        else {
            logger.error("\u6570\u636E\u5E93\u4E2D\u6CA1\u6709pie '" + fullId + "'");
        }
    });
});
commander_1.program
    .command('delete <full_id>')
    .aliases(['remove', 'rm', 'd'])
    .option('-f, --hard', '是否同时删除本地文件')
    .description('删除已添加的pie')
    .action(function (fullId, opts) {
    useDatabase(commander_1.program.opts().dbFile).then(function (db) {
        var record = db.getPieRecordByFullId(fullId);
        if (record) {
            if (opts.hard && fs_1.default.existsSync(record.path)) {
                fs_1.default.rmSync(record.path, { recursive: true, force: true });
            }
            db.deletePieRecord(fullId);
            logger.info("\u5DF2\u5220\u9664pie '" + fullId + "'");
        }
        else {
            logger.error("\u6570\u636E\u5E93\u4E2D\u6CA1\u6709pie '" + fullId + "'");
        }
    });
});
commander_1.program
    .command('clear-history [days]')
    .aliases(['ch', 'clear'])
    .description('删除数据库中消息和事件历史')
    .action(function (daysString) {
    useDatabase(commander_1.program.opts().dbFile).then(function (db) {
        var candidate = parseInt(daysString);
        var days = candidate > 0 ? candidate : 30;
        enquirer_1.prompt({
            type: 'confirm',
            name: 'confirm',
            message: "\u662F\u5426\u5220\u9664" + days + "\u5929\u524D\u7684\u5386\u53F2\u6D88\u606F\u548C\u4E8B\u4EF6\u8BB0\u5F55?"
        }).then(function (pro) {
            if (pro.confirm) {
                var messageCount = db.clearMessageHistory(days);
                var eventCount = db.clearEventHistory(days);
                logger.info("\u5DF2\u5220\u9664" + days + "\u5929\u524D\u7684 " + messageCount + " \u6761\u6D88\u606F\u8BB0\u5F55, " + eventCount + " \u6761\u4E8B\u4EF6\u8BB0\u5F55");
            }
        }).catch(function () {
        });
    });
});
commander_1.program.parse(process.argv);
