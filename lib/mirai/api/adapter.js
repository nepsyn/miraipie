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
exports.getMiraiApiHttpAdapter = exports.MiraiApiHttpAdapterMap = exports.WebsocketAdapter = exports.HttpAdapter = void 0;
var axios_1 = __importDefault(require("axios"));
var form_data_1 = __importDefault(require("form-data"));
var log4js_1 = __importDefault(require("log4js"));
var ws_1 = __importDefault(require("ws"));
var _1 = require(".");
var pie_1 = require("../../pie");
var tool_1 = require("../../tool");
var logger = log4js_1.default.getLogger('adapter');
/**
 * mirai-api-http 提供的 http adapter<br/>
 * <a href="https://github.com/project-mirai/mirai-api-http/blob/master/docs/adapter/HttpAdapter.md">文档<a/>
 */
var HttpAdapter = /** @class */ (function () {
    function HttpAdapter(options) {
        this.type = 'HttpAdapter';
        this.messageHandler = options.messageHandler;
        this.eventHandler = options.eventHandler;
        this.setting = {
            verifyKey: options.verifyKey,
            host: options.host,
            port: options.port
        };
    }
    HttpAdapter.prototype.request = function (uri, data, method, requireSession, multipart) {
        if (requireSession === void 0) { requireSession = true; }
        if (multipart === void 0) { multipart = false; }
        return __awaiter(this, void 0, void 0, function () {
            var config, resp, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            method: method,
                            url: "http://" + this.setting.host + ":" + this.setting.port + "/" + uri,
                            headers: {}
                        };
                        // 判断请求类型
                        if (method === 'POST')
                            config.data = data;
                        else
                            config.params = data;
                        if (multipart)
                            config.headers = data.getHeaders();
                        if (!requireSession) return [3 /*break*/, 4];
                        if (!!this.session) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.verify()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.bind()];
                    case 2:
                        _a.sent();
                        if (!this.session)
                            logger.error('session未绑定或已失效');
                        _a.label = 3;
                    case 3:
                        config.headers.sessionKey = this.session;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, axios_1.default.request(config)];
                    case 5:
                        resp = (_a.sent()).data;
                        if ('code' in resp && resp['code'] !== _1.ResponseCode.Success) {
                            logger.warn("\u53D1\u9001\u7684\u8BF7\u6C42\u672A\u80FD\u8FBE\u5230\u9884\u671F\u7684\u6548\u679C, \u9519\u8BEF\u539F\u56E0: " + _1.ResponseCode[resp['code']] + ", \u8BF7\u6C42\u539F\u59CB\u6570\u636E:", data);
                        }
                        return [2 /*return*/, resp];
                    case 6:
                        err_1 = _a.sent();
                        logger.error('发送请求错误, 请求原始数据:', data, err_1.message);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    HttpAdapter.prototype.get = function (uri, params, requireSession, multipart) {
        if (requireSession === void 0) { requireSession = true; }
        if (multipart === void 0) { multipart = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(uri, params, 'GET', requireSession, multipart)];
            });
        });
    };
    HttpAdapter.prototype.post = function (uri, data, requireSession, multipart) {
        if (requireSession === void 0) { requireSession = true; }
        if (multipart === void 0) { multipart = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(uri, data, 'POST', requireSession, multipart)];
            });
        });
    };
    HttpAdapter.prototype.verify = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.post('verify', { verifyKey: _this.setting.verifyKey }, false).then(function (res) {
                            if (res.code === _1.ResponseCode.WrongVerifyKey)
                                logger.error("\u8BA4\u8BC1\u5931\u8D25, \u9519\u8BEF\u7684verifyKey");
                            else
                                _this.session = res.session;
                            resolve(res);
                        }).catch(function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    HttpAdapter.prototype.bind = function (qq) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                id = qq || pie_1.MiraiPieApp.instance.qq;
                return [2 /*return*/, this.post('bind', { sessionKey: this.session, qq: id }, false)];
            });
        });
    };
    HttpAdapter.prototype.release = function (qq) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            var _this = this;
            return __generator(this, function (_a) {
                id = qq || pie_1.MiraiPieApp.instance.qq;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.post('release', { sessionKey: _this.session, qq: id }, false).then(function (res) {
                            _this.session = null;
                            resolve(res);
                        }).catch(function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    HttpAdapter.prototype.listen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var first, resp, _a, _b, i, err_2;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!!this.isListening) return [3 /*break*/, 10];
                        first = true;
                        _d.label = 1;
                    case 1:
                        if (!(this.isListening || first)) return [3 /*break*/, 10];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 7, 8, 9]);
                        return [4 /*yield*/, this.get('fetchMessage', { count: 30 })];
                    case 3:
                        resp = _d.sent();
                        if (!(resp.code === _1.ResponseCode.Success)) return [3 /*break*/, 5];
                        if (first) {
                            this.isListening = true;
                            logger.info(this.type + "\u76D1\u542C\u5668\u542F\u52A8\u6210\u529F");
                        }
                        try {
                            for (_a = (e_1 = void 0, __values(resp.data)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                i = _b.value;
                                if (i.type.endsWith('Message'))
                                    this.messageHandler(i);
                                else
                                    this.eventHandler(i);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [4 /*yield*/, tool_1.sleep(500)];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        logger.error(this.type + "\u76D1\u542C\u5668\u542F\u52A8\u5931\u8D25, \u9519\u8BEF\u539F\u56E0: " + _1.ResponseCode[resp.code]);
                        _d.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        err_2 = _d.sent();
                        logger.error('监听时发生错误:', err_2.message);
                        this.isListening = false;
                        return [3 /*break*/, 9];
                    case 8:
                        first = false;
                        return [7 /*endfinally*/];
                    case 9: return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    HttpAdapter.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.isListening = false;
                return [2 /*return*/];
            });
        });
    };
    HttpAdapter.prototype.getAbout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('about', null, false)];
            });
        });
    };
    HttpAdapter.prototype.getMessageFromId = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('messageFromId', { id: messageId })];
            });
        });
    };
    HttpAdapter.prototype.getFriendList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('friendList')];
            });
        });
    };
    HttpAdapter.prototype.getGroupList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('groupList')];
            });
        });
    };
    HttpAdapter.prototype.getMemberList = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('memberList', { target: groupId })];
            });
        });
    };
    HttpAdapter.prototype.getBotProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('botProfile')];
            });
        });
    };
    HttpAdapter.prototype.getFriendProfile = function (friendId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('friendProfile', { target: friendId })];
            });
        });
    };
    HttpAdapter.prototype.getMemberProfile = function (groupId, memberId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('memberProfile', { target: groupId, memberId: memberId })];
            });
        });
    };
    HttpAdapter.prototype.sendFriendMessage = function (friendId, messageChain, quoteMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('sendFriendMessage', {
                        target: friendId,
                        messageChain: messageChain,
                        quote: quoteMessageId
                    })];
            });
        });
    };
    HttpAdapter.prototype.sendGroupMessage = function (groupId, messageChain, quoteMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('sendGroupMessage', {
                        target: groupId,
                        messageChain: messageChain,
                        quote: quoteMessageId
                    })];
            });
        });
    };
    HttpAdapter.prototype.sendTempMessage = function (memberId, groupId, messageChain, quoteMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('sendTempMessage', {
                        qq: memberId,
                        group: groupId,
                        messageChain: messageChain,
                        quote: quoteMessageId
                    })];
            });
        });
    };
    HttpAdapter.prototype.sendNudge = function (targetId, subjectId, kind) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('sendNudge', { target: targetId, subject: subjectId, kind: kind })];
            });
        });
    };
    HttpAdapter.prototype.recall = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('recall', { target: messageId })];
            });
        });
    };
    HttpAdapter.prototype.getGroupFileList = function (parentFileId, groupId, offset, size, withDownloadInfo) {
        if (offset === void 0) { offset = 0; }
        if (size === void 0) { size = 100; }
        if (withDownloadInfo === void 0) { withDownloadInfo = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('/file/list', { id: parentFileId, group: groupId, offset: offset, size: size, withDownloadInfo: withDownloadInfo })];
            });
        });
    };
    HttpAdapter.prototype.getGroupFileInfo = function (fileId, groupId, withDownloadInfo) {
        if (withDownloadInfo === void 0) { withDownloadInfo = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('file/info', { id: fileId, group: groupId, withDownloadInfo: withDownloadInfo })];
            });
        });
    };
    HttpAdapter.prototype.createGroupFileDirectory = function (parentFileId, directoryName, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('file/mkdir', { id: parentFileId, group: groupId, directoryName: directoryName })];
            });
        });
    };
    HttpAdapter.prototype.deleteGroupFile = function (fileId, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('file/delete', { id: fileId, group: groupId })];
            });
        });
    };
    HttpAdapter.prototype.moveGroupFile = function (fileId, groupId, moveToDirectoryId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('file/move', { id: fileId, group: groupId, moveTo: moveToDirectoryId })];
            });
        });
    };
    HttpAdapter.prototype.renameGroupFile = function (fileId, groupId, name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('file/rename', { id: fileId, group: groupId, renameTo: name })];
            });
        });
    };
    HttpAdapter.prototype.deleteFriend = function (friendId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('deleteFriend', { target: friendId })];
            });
        });
    };
    HttpAdapter.prototype.muteMember = function (memberId, groupId, time) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('mute', { target: groupId, memberId: memberId })];
            });
        });
    };
    HttpAdapter.prototype.unmuteMember = function (memberId, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('unmute', { target: groupId, memberId: memberId })];
            });
        });
    };
    HttpAdapter.prototype.kickMember = function (memberId, groupId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('kick', { target: groupId, memberId: memberId, msg: message })];
            });
        });
    };
    HttpAdapter.prototype.quitGroup = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('quit', { target: groupId })];
            });
        });
    };
    HttpAdapter.prototype.muteAll = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('muteAll', { target: groupId })];
            });
        });
    };
    HttpAdapter.prototype.unmuteAll = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('unmuteAll', { target: groupId })];
            });
        });
    };
    HttpAdapter.prototype.setEssence = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('setEssence', { target: messageId })];
            });
        });
    };
    HttpAdapter.prototype.getGroupConfig = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('groupConfig', { target: groupId })];
            });
        });
    };
    HttpAdapter.prototype.setGroupConfig = function (groupId, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('groupConfig', { target: groupId, config: config })];
            });
        });
    };
    HttpAdapter.prototype.getMemberInfo = function (memberId, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get('memberInfo', { target: groupId, memberId: memberId })];
            });
        });
    };
    HttpAdapter.prototype.setMemberInfo = function (memberId, groupId, info) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('memberInfo', { target: groupId, memberId: memberId, info: info })];
            });
        });
    };
    HttpAdapter.prototype.handleNewFriendRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('resp/newFriendRequestEvent', { eventId: eventId, fromId: fromId, groupId: groupId, operate: operate, message: message })];
            });
        });
    };
    HttpAdapter.prototype.handleMemberJoinRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('resp/memberJoinRequestEvent', { eventId: eventId, fromId: fromId, groupId: groupId, operate: operate, message: message })];
            });
        });
    };
    HttpAdapter.prototype.handleBotInvitedJoinGroupRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post('resp/botInvitedJoinGroupRequestEvent', {
                        eventId: eventId,
                        fromId: fromId,
                        groupId: groupId,
                        operate: operate,
                        message: message
                    })];
            });
        });
    };
    HttpAdapter.prototype.uploadImage = function (uploadType, imageData) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = new form_data_1.default();
                data.append('type', uploadType);
                data.append('img', imageData);
                return [2 /*return*/, this.post('uploadImage', data, true, true)];
            });
        });
    };
    HttpAdapter.prototype.uploadVoice = function (uploadType, voiceData) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = new form_data_1.default();
                data.append('type', uploadType);
                data.append('voice', voiceData);
                return [2 /*return*/, this.post('uploadVoice', data, true, true)];
            });
        });
    };
    HttpAdapter.prototype.uploadGroupFile = function (uploadType, path, fileData) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = new form_data_1.default();
                data.append('type', uploadType);
                data.append('path', path);
                data.append('file', fileData);
                return [2 /*return*/, this.post('uploadFile', data, true, true)];
            });
        });
    };
    return HttpAdapter;
}());
exports.HttpAdapter = HttpAdapter;
/**
 * mirai-api-http 提供的 websocket adapter<br/>
 * <a href="https://github.com/project-mirai/mirai-api-http/blob/master/docs/adapter/WebsocketAdapter.md">文档<a/>
 */
var WebsocketAdapter = /** @class */ (function () {
    function WebsocketAdapter(options) {
        this.type = 'WebsocketAdapter';
        this.messageHandler = options.messageHandler;
        this.eventHandler = options.eventHandler;
        this.setting = {
            verifyKey: options.verifyKey,
            host: options.host,
            port: options.port
        };
        this.queue = new Map();
        this.syncIdGenerator = WebsocketAdapter.generateSyncId();
    }
    WebsocketAdapter.generateSyncId = function () {
        var syncId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    syncId = 1;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    syncId %= 100;
                    return [4 /*yield*/, syncId];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    WebsocketAdapter.prototype.request = function (command, content, subCommand) {
        if (content === void 0) { content = {}; }
        if (subCommand === void 0) { subCommand = null; }
        return __awaiter(this, void 0, void 0, function () {
            var syncId, data_1, timeOutCounter, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        syncId = this.syncIdGenerator.next().value;
                        if (!!this.isListening) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.listen()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, tool_1.sleep(1000)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!this.isListening) return [3 /*break*/, 7];
                        data_1 = { syncId: syncId, command: command, subCommand: subCommand, content: content };
                        this.ws.send(JSON.stringify(data_1), function (err) {
                            if (err)
                                logger.error('发送请求错误, 请求原始数据:', data_1, err.message);
                        });
                        timeOutCounter = 0;
                        _a.label = 4;
                    case 4:
                        if (!(!this.queue.has(syncId) && timeOutCounter < 20)) return [3 /*break*/, 6];
                        return [4 /*yield*/, tool_1.sleep(100)];
                    case 5:
                        _a.sent();
                        timeOutCounter++;
                        return [3 /*break*/, 4];
                    case 6:
                        resp = this.queue.get(syncId);
                        if (resp) {
                            this.queue.delete(syncId);
                            return [2 /*return*/, resp];
                        }
                        else {
                            logger.error('发送的请求已超时, 请求原始数据:', data_1);
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    WebsocketAdapter.prototype.listen = function (qq) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.isListening) {
                    id = qq || pie_1.MiraiPieApp.instance.qq;
                    this.ws = new ws_1.default("ws://" + this.setting.host + ":" + this.setting.port + "/all?verifyKey=" + this.setting.verifyKey + "&qq=" + id);
                    this.ws.on('error', function (err) {
                        logger.error("WebsocketAdapter \u76D1\u542C\u5668\u542F\u52A8\u9519\u8BEF:", err.message);
                    });
                    this.ws.on('message', function (buffer) {
                        var message = JSON.parse(buffer.toString());
                        if ('syncId' in message && 'data' in message) {
                            var data = message.data;
                            if ('type' in data) {
                                if (data.type.endsWith('Message'))
                                    _this.messageHandler(data);
                                else if (data.type.endsWith('Event'))
                                    _this.eventHandler(data);
                            }
                            else if ('code' in data) {
                                if (data.code === _1.ResponseCode.Success) {
                                    _this.isListening = true;
                                    logger.info(_this.type + "\u76D1\u542C\u5668\u542F\u52A8\u6210\u529F");
                                }
                                else {
                                    logger.error(_this.type + "\u76D1\u542C\u5668\u542F\u52A8\u5931\u8D25, \u9519\u8BEF\u539F\u56E0: " + _1.ResponseCode[data.code]);
                                }
                            }
                            else {
                                _this.queue.set(parseInt(message.syncId), message.data);
                            }
                        }
                        else {
                            if ('code' in message) {
                                logger.error("\u76D1\u542C\u5931\u8D25, \u9519\u8BEF\u539F\u56E0: " + _1.ResponseCode[message['code']]);
                                _this.ws.close();
                            }
                            else {
                                logger.warn('未能解析的数据:', message);
                            }
                        }
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    WebsocketAdapter.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.ws && this.ws.readyState === this.ws.OPEN) {
                    this.ws.close();
                    this.isListening = false;
                }
                return [2 /*return*/];
            });
        });
    };
    WebsocketAdapter.prototype.getAbout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('about')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getMessageFromId = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('messageFromId', { target: messageId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getFriendList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('friendList')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getGroupList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('groupList')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getMemberList = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('memberList', { target: groupId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getBotProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('botProfile')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getFriendProfile = function (friendId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('friendProfile', { target: friendId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getMemberProfile = function (groupId, memberId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('memberProfile', { target: groupId, memberId: memberId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.sendFriendMessage = function (friendId, messageChain, quoteMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('sendFriendMessage', { qq: friendId, messageChain: messageChain, quote: quoteMessageId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.sendGroupMessage = function (groupId, messageChain, quoteMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('sendGroupMessage', { group: groupId, messageChain: messageChain, quote: quoteMessageId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.sendTempMessage = function (memberId, groupId, messageChain, quoteMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('sendTempMessage', {
                            qq: memberId,
                            group: groupId,
                            messageChain: messageChain,
                            quote: quoteMessageId
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.sendNudge = function (targetId, subjectId, kind) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('sendNudge', { target: targetId, subject: subjectId, kind: kind })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.recall = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('recall', { target: messageId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getGroupFileList = function (parentFileId, groupId, offset, size, withDownloadInfo) {
        if (offset === void 0) { offset = 0; }
        if (size === void 0) { size = 100; }
        if (withDownloadInfo === void 0) { withDownloadInfo = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('file_list', { id: parentFileId, target: groupId, offset: offset, size: size, withDownloadInfo: withDownloadInfo })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getGroupFileInfo = function (fileId, groupId, withDownloadInfo) {
        if (withDownloadInfo === void 0) { withDownloadInfo = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('file_info', { id: fileId, target: groupId, withDownloadInfo: withDownloadInfo })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.createGroupFileDirectory = function (parentFileId, directoryName, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('file_mkdir', { id: parentFileId, target: groupId, directoryName: directoryName })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.deleteGroupFile = function (fileId, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('file_delete', { id: fileId, target: groupId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.moveGroupFile = function (fileId, groupId, moveToDirectoryId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('file_move', { id: fileId, target: groupId, moveTo: moveToDirectoryId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.renameGroupFile = function (fileId, groupId, name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('file_rename', { id: fileId, target: groupId, renameTo: name })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.deleteFriend = function (friendId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('deleteFriend', { target: friendId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.muteMember = function (memberId, groupId, time) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('mute', { target: groupId, memberId: memberId, time: time })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.unmuteMember = function (memberId, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('unmute', { target: groupId, memberId: memberId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.kickMember = function (memberId, groupId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('kick', { target: groupId, memberId: memberId, msg: message })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.quitGroup = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('quit', { target: groupId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.muteAll = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('muteAll', { target: groupId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.unmuteAll = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('unmuteAll', { target: groupId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.setEssence = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('setEssence', { target: messageId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getGroupConfig = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('groupConfig', { target: groupId }, 'get')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.setGroupConfig = function (groupId, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('groupConfig', { target: groupId, config: config }, 'update')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.getMemberInfo = function (memberId, groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('memberInfo', { target: groupId, memberId: memberId }, 'get')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.setMemberInfo = function (memberId, groupId, info) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('memberInfo', { target: groupId, memberId: memberId, info: info }, 'update')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.handleNewFriendRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('resp_newFriendRequestEvent', { eventId: eventId, fromId: fromId, groupId: groupId, operate: operate, message: message })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.handleMemberJoinRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('resp_memberJoinRequestEvent', { eventId: eventId, fromId: fromId, groupId: groupId, operate: operate, message: message })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WebsocketAdapter.prototype.handleBotInvitedJoinGroupRequest = function (eventId, fromId, groupId, operate, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('resp_botInvitedJoinGroupRequestEvent', { eventId: eventId, fromId: fromId, groupId: groupId, operate: operate, message: message })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return WebsocketAdapter;
}());
exports.WebsocketAdapter = WebsocketAdapter;
exports.MiraiApiHttpAdapterMap = {
    HttpAdapter: HttpAdapter,
    WebsocketAdapter: WebsocketAdapter
};
function getMiraiApiHttpAdapter(name, options) {
    if (name in exports.MiraiApiHttpAdapterMap)
        return new exports.MiraiApiHttpAdapterMap[name](options);
    else {
        logger.warn("\u6CA1\u6709\u627E\u5230\u540D\u4E3A '" + name + "' \u7684adapter, \u5DF2\u4F7F\u7528HttpAdapter\u4EE3\u66FF");
        return new HttpAdapter(options);
    }
}
exports.getMiraiApiHttpAdapter = getMiraiApiHttpAdapter;
