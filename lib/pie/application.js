"use strict";
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
exports.createMiraiPieApp = exports.MiraiPieApp = void 0;
var log4js_1 = __importDefault(require("log4js"));
var _1 = require(".");
var mirai_1 = require("../mirai");
var tool_1 = require("../tool");
var logger = log4js_1.default.getLogger('miraipie');
/**
 * miraipie应用
 */
var MiraiPieApp = /** @class */ (function () {
    function MiraiPieApp(options) {
        var e_1, _a, e_2, _b, e_3, _c;
        var _this = this;
        var _d, _e;
        MiraiPieApp.instance = this;
        // 基础设置
        this.qq = options.qq;
        this.adapter = mirai_1.getMiraiApiHttpAdapter(options.adapter, options.adapterSetting);
        this.listenerAdapter = (options.listenerAdapter && mirai_1.getMiraiApiHttpAdapter(options.listenerAdapter, options.adapterSetting)) || this.adapter;
        this.db = options.db || new _1.Sqlite3Adapter('miraipie.db');
        // 绑定监听事件
        this.listenerAdapter.messageHandler = function (chatMessage) { return _this.messageDispatcher(chatMessage); };
        this.listenerAdapter.eventHandler = function (event) { return _this.eventDispatcher(event); };
        // 初始化处理器
        this.messageHandlers = [];
        this.eventHandlers = [];
        // 添加pie管理器的消息和事件分发器
        this.onMessage(function (chatMessage) { return _this.pieAgent.messageDispatcher(chatMessage); });
        this.onMessage(function (chatMessage) {
            var _a;
            (_a = _this.db) === null || _a === void 0 ? void 0 : _a.saveMessage({
                sourceId: chatMessage.messageChain.sourceId,
                messageChain: chatMessage.messageChain,
                from: chatMessage.sender.id,
                to: _this.qq,
                type: chatMessage.type
            });
        });
        this.onEvent(function (event) { return _this.pieAgent.eventDispatcher(event); });
        this.onEvent(function (event) { var _a; return (_a = _this.db) === null || _a === void 0 ? void 0 : _a.saveEvent(event); });
        (_d = this.db) === null || _d === void 0 ? void 0 : _d.saveAppOptions(options);
        this.pieAgent = new _1.PieAgent();
        // 加载数据库中记录的pie
        var pieRecords = (_e = this.db) === null || _e === void 0 ? void 0 : _e.getPieRecords();
        var pies = new Map();
        var edges = new Map();
        try {
            for (var _f = __values(pieRecords || []), _g = _f.next(); !_g.done; _g = _f.next()) {
                var record = _g.value;
                if (record.path) {
                    try {
                        var pie = require(record.path);
                        pies.set(pie.fullId, pie);
                        edges.set(pie.fullId, pie.dependencies.concat());
                    }
                    catch (err) {
                        logger.error("\u52A0\u8F7Dpie\u6A21\u5757\u8DEF\u5F84 " + record.path + " \u51FA\u9519:", err.message);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            // 加载选项中的pie
            for (var _h = __values(options.pies || []), _j = _h.next(); !_j.done; _j = _h.next()) {
                var pie = _j.value;
                pies.set(pie.fullId, pie);
                edges.set(pie.fullId, pie.dependencies.concat());
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // 解析依赖顺序
        var sequence = tool_1.dependencyResolve(edges);
        var _loop_1 = function (fullId) {
            var record = pieRecords.find(function (pie) { return pie.fullId === fullId; });
            if (record)
                this_1.pieAgent.install(pies.get(fullId), { path: record.path, enabled: record.enabled });
            else
                this_1.pieAgent.install(pies.get(fullId));
        };
        var this_1 = this;
        try {
            // 按顺序安装pie
            for (var sequence_1 = __values(sequence), sequence_1_1 = sequence_1.next(); !sequence_1_1.done; sequence_1_1 = sequence_1.next()) {
                var fullId = sequence_1_1.value;
                _loop_1(fullId);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (sequence_1_1 && !sequence_1_1.done && (_c = sequence_1.return)) _c.call(sequence_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // 捕捉Ctrl-C
        process.on('SIGINT', function () {
            logger.info('已手动停止运行 (Ctrl-C)');
            process.exit();
        });
        // 程序结束前保存设置并清理资源
        process.on('exit', function () {
            var _a;
            _this.pieAgent.savePies();
            (_a = _this.db) === null || _a === void 0 ? void 0 : _a.close();
        });
    }
    /**
     * miraipie应用构造工厂方法
     * @param options miraipie应用选项
     */
    MiraiPieApp.createInstance = function (options) {
        MiraiPieApp.instance = new MiraiPieApp(options);
        return MiraiPieApp.instance;
    };
    /**
     * 添加消息处理器
     * @param callback 消息处理器
     * @example
     * app.onMessage((chatMessage) => console.log(chatMessage));  // 打印每条消息
     */
    MiraiPieApp.prototype.onMessage = function (callback) {
        this.messageHandlers.push(callback);
    };
    /**
     * 添加事件处理器
     * @param callback 事件处理器
     * @example
     * app.onEvent((event) => console.log(event));  // 打印每个事件
     */
    MiraiPieApp.prototype.onEvent = function (callback) {
        this.eventHandlers.push(callback);
    };
    /**
     * 消息分发器
     * @param chatMessage 原始消息对象
     */
    MiraiPieApp.prototype.messageDispatcher = function (chatMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_2, _a, _b, handler;
            var e_4, _c;
            return __generator(this, function (_d) {
                chatMessage.messageChain = mirai_1.MessageChain.from(chatMessage.messageChain);
                _loop_2 = function (handler) {
                    tool_1.makeAsync(handler)(tool_1.makeReadonly(chatMessage)).catch(function (err) {
                        logger.error("\u8C03\u7528\u6D88\u606F\u5904\u7406\u5668 '" + handler.name + "' \u65F6\u53D1\u751F\u9519\u8BEF:", err.message);
                    });
                };
                try {
                    for (_a = __values(this.messageHandlers), _b = _a.next(); !_b.done; _b = _a.next()) {
                        handler = _b.value;
                        _loop_2(handler);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 事件分发器
     * @param event 原始事件对象
     */
    MiraiPieApp.prototype.eventDispatcher = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_3, _a, _b, handler;
            var e_5, _c;
            return __generator(this, function (_d) {
                _loop_3 = function (handler) {
                    tool_1.makeAsync(handler)(tool_1.makeReadonly(event)).catch(function (err) {
                        logger.error("\u8C03\u7528\u4E8B\u4EF6\u5904\u7406\u5668 '" + handler.name + "' \u65F6\u53D1\u751F\u9519\u8BEF:", err.message);
                    });
                };
                try {
                    for (_a = __values(this.eventHandlers), _b = _a.next(); !_b.done; _b = _a.next()) {
                        handler = _b.value;
                        _loop_3(handler);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取机器人个人资料
     * @return 个人资料
     */
    MiraiPieApp.prototype.getProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.getBotProfile()];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 启动消息和事件监听
     */
    MiraiPieApp.prototype.listen = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.listenerAdapter.listen) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.listenerAdapter.listen()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        logger.error("\u5F53\u524D\u6307\u5B9A\u7684listenerAdapter '" + this.listenerAdapter.type + "' \u4E0D\u80FD\u63D0\u4F9B\u4E8B\u4EF6\u76D1\u542C");
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 结束消息和事件监听
     */
    MiraiPieApp.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listenerAdapter.stop()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取好友列表
     * @return 好友列表
     */
    MiraiPieApp.prototype.getFriendList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.getFriendList()];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 获取群列表
     * @return 群列表
     */
    MiraiPieApp.prototype.getGroupList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.getGroupList()];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 获取群成员列表
     * @param groupId 群号
     * @return 群成员列表
     */
    MiraiPieApp.prototype.getMemberList = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.getMemberList(groupId)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 处理添加好友申请事件<br/>
     * operate类型如下:
     * <ul>
     *     <li>0 - 同意添加好友</li>
     *     <li>1 - 拒绝添加好友</li>
     *     <li>2 - 拒绝添加好友并添加黑名单，不再接收该用户的好友申请</li>
     * </ul>
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号，可能为0
     * @param operate 操作类型
     * @param message 回复的信息
     * @return 是否处理成功
     */
    MiraiPieApp.prototype.handleNewFriendRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.handleNewFriendRequest(eventId, fromId, groupId, operate, message)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 处理用户入群申请, 机器人需要有管理员权限<br/>
     * operate类型如下:
     * <ul>
     *     <li>0 - 同意入群</li>
     *     <li>1 - 拒绝入群</li>
     *     <li>2 - 忽略请求</li>
     *     <li>3 - 拒绝入群并添加黑名单，不再接收该用户的入群申请</li>
     *     <li>4 - 忽略入群并添加黑名单，不再接收该用户的入群申请</li>
     * </ul>
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号
     * @param operate 操作类型
     * @param message 回复的信息
     * @return 是否处理成功
     */
    MiraiPieApp.prototype.handleMemberJoinRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.handleMemberJoinRequest(eventId, fromId, groupId, operate, message)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 处理机器人被邀请入群申请事件<br/>
     * operate类型如下:
     * <ul>
     *     <li>0 - 同意邀请</li>
     *     <li>1 - 拒绝邀请</li>
     * </ul>
     * @param eventId 事件id
     * @param fromId 邀请人(好友)QQ号
     * @param groupId 邀请进入的群号
     * @param operate 操作类型
     * @param message 回复的信息
     * @return 是否处理成功
     */
    MiraiPieApp.prototype.handleBotInvitedJoinGroupRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.handleBotInvitedJoinGroupRequest(eventId, fromId, groupId, operate, message)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 执行命令<br/>
     * console 支持以不同消息类型作为指令的参数, 执行命令需要以消息类型作为参数, 若执行纯文本的命令, 构建多个 Plain 格式的消息 console 会将第一个消息作为指令名, 后续消息作为参数 具体参考 <a href="https://docs.mirai.mamoe.net/console/Commands.html">console 文档</a>
     * @param command 命令与参数
     */
    MiraiPieApp.prototype.executeCommand = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.executeCommand(command)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 注册命令
     * @param name 指令名
     * @param alias 指令别名
     * @param usage 使用说明
     * @param description 命令描述
     */
    MiraiPieApp.prototype.registerCommand = function (name, alias, usage, description) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.adapter.registerCommand(name, alias, usage, description)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    return MiraiPieApp;
}());
exports.MiraiPieApp = MiraiPieApp;
exports.createMiraiPieApp = MiraiPieApp.createInstance;
