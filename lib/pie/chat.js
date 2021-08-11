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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempChatWindow = exports.GroupChatWindow = exports.FriendChatWindow = exports.ChatWindow = void 0;
var _1 = require(".");
var mirai_1 = require("../mirai");
/**
 * 聊天窗口, 用以模拟QQ客户端的聊天环境
 */
var ChatWindow = /** @class */ (function () {
    function ChatWindow() {
    }
    /**
     * 发送一条消息<br/>
     * 使用该方法向当前聊天对象发送一条消息
     * @param message 待发送的消息
     * @param quoteMessageId 引用回复的消息id
     * @return
     * 已发送消息的消息id
     * @example
     * window.send('Hello World!');  // 纯文本消息
     * window.send(AtAll());  // 单个单一消息
     * window.send([AtAll(), Plain('Hello World!')]);  // 单一消息列表
     * window.send(new MessageChain(AtAll(), Plain('Hello World!')));  // 消息链对象
     * window.send('Hello World!', 123456);  // 发送消息并引用回复消息
     */
    ChatWindow.prototype.send = function (message, quoteMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            var messageChain;
            return __generator(this, function (_a) {
                messageChain = new mirai_1.MessageChain();
                if (typeof message === 'string')
                    messageChain.push(_1.Plain(message));
                else if (Array.isArray(message))
                    messageChain = mirai_1.MessageChain.from(message);
                else
                    messageChain.push(message);
                return [2 /*return*/, this._send(messageChain, quoteMessageId)];
            });
        });
    };
    /**
     * 撤回消息
     * @param messageId 消息id
     * @return 是否撤回成功
     */
    ChatWindow.prototype.recall = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.recall(messageId)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    return ChatWindow;
}());
exports.ChatWindow = ChatWindow;
/**
 * 好友聊天窗
 */
var FriendChatWindow = /** @class */ (function (_super) {
    __extends(FriendChatWindow, _super);
    function FriendChatWindow(contact) {
        var _this = _super.call(this) || this;
        _this.contact = contact;
        _this.type = 'FriendChatWindow';
        return _this;
    }
    FriendChatWindow.prototype._send = function (messageChain, quoteMessageId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var resp, messageId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.sendFriendMessage(this.contact.id, messageChain, quoteMessageId)];
                    case 1:
                        resp = _b.sent();
                        messageId = resp === null || resp === void 0 ? void 0 : resp.messageId;
                        if (messageId)
                            (_a = _1.MiraiPieApp.instance.db) === null || _a === void 0 ? void 0 : _a.saveMessage({
                                sourceId: messageId,
                                messageChain: messageChain,
                                from: _1.MiraiPieApp.instance.qq,
                                to: this.contact.id,
                                type: 'FriendMessage'
                            });
                        return [2 /*return*/, messageId];
                }
            });
        });
    };
    FriendChatWindow.prototype.sendNudge = function (targetId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.sendNudge(targetId || this.contact.id, this.contact.id, 'Friend')];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 获取聊天对象的个人资料
     * @return 聊天对象的个人资料
     */
    FriendChatWindow.prototype.getProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.getFriendProfile(this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 删除好友(慎用)
     * @return 是否删除成功
     */
    FriendChatWindow.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.deleteFriend(this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    return FriendChatWindow;
}(ChatWindow));
exports.FriendChatWindow = FriendChatWindow;
/**
 * 群聊聊天窗
 */
var GroupChatWindow = /** @class */ (function (_super) {
    __extends(GroupChatWindow, _super);
    function GroupChatWindow(contact) {
        var _this = _super.call(this) || this;
        _this.contact = contact;
        _this.type = 'GroupChatWindow';
        return _this;
    }
    Object.defineProperty(GroupChatWindow.prototype, "permission", {
        /**
         * 机器人在本群权限
         */
        get: function () {
            return this.contact.permission;
        },
        enumerable: false,
        configurable: true
    });
    GroupChatWindow.prototype._send = function (messageChain, quoteMessageId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var resp, messageId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.sendGroupMessage(this.contact.id, messageChain, quoteMessageId)];
                    case 1:
                        resp = _b.sent();
                        messageId = resp === null || resp === void 0 ? void 0 : resp.messageId;
                        if (messageId)
                            (_a = _1.MiraiPieApp.instance.db) === null || _a === void 0 ? void 0 : _a.saveMessage({
                                sourceId: messageId,
                                messageChain: messageChain,
                                from: _1.MiraiPieApp.instance.qq,
                                to: this.contact.id,
                                type: 'GroupMessage'
                            });
                        return [2 /*return*/, messageId];
                }
            });
        });
    };
    GroupChatWindow.prototype.sendNudge = function (targetId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.sendNudge(targetId, this.contact.id, 'Group')];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 禁言群成员
     * @param memberId 群成员QQ号
     * @param time 禁言时长(秒)
     * @return 是否禁言成功
     */
    GroupChatWindow.prototype.mute = function (memberId, time) {
        if (time === void 0) { time = 60; }
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.muteMember(memberId, this.contact.id, time)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 取消禁言群成员
     * @param memberId 群成员QQ号
     * @return 是否取消成功
     */
    GroupChatWindow.prototype.unmute = function (memberId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.unmuteMember(memberId, this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 踢出群成员
     * @param memberId 群成员QQ号
     * @param message 留言
     * @return 是否踢出成功
     */
    GroupChatWindow.prototype.kick = function (memberId, message) {
        if (message === void 0) { message = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.kickMember(memberId, this.contact.id, message)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 退出群聊
     * @return 是否退出成功
     */
    GroupChatWindow.prototype.quit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.quitGroup(this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 全体禁言
     * @return 是否禁言成功
     */
    GroupChatWindow.prototype.muteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.muteAll(this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 取消全体禁言
     * @return 是否取消成功
     */
    GroupChatWindow.prototype.unmuteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.unmuteAll(this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 设置群精华消息
     * @param messageId 消息id
     * @return 是否设置成功
     */
    GroupChatWindow.setEssence = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.setEssence(messageId)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 获取群设置
     * @return 群设置
     */
    GroupChatWindow.prototype.getConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.getGroupConfig(this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 修改群设置
     * @param config 群设置
     * @return 是否修改成功
     */
    GroupChatWindow.prototype.setConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.setGroupConfig(this.contact.id, config)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 获取群文件列表
     * @param path 文件夹路径
     * @param offset 分页偏移
     * @param size 分页大小
     * @return 文件列表
     */
    GroupChatWindow.prototype.getFileList = function (path, offset, size) {
        if (path === void 0) { path = ''; }
        if (offset === void 0) { offset = 0; }
        if (size === void 0) { size = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.getGroupFileList(path, this.contact.id, offset, size)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 获取文件详情
     * @param fileId 文件id
     * @return 文件概览
     */
    GroupChatWindow.prototype.getFileInfo = function (fileId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.getGroupFileInfo(fileId, this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 创建群文件夹
     * @param directoryName 文件夹名称
     * @param parentFileId 父文件夹id
     * @return 文件夹概览
     */
    GroupChatWindow.prototype.createDirectory = function (directoryName, parentFileId) {
        if (parentFileId === void 0) { parentFileId = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.createGroupFileDirectory(parentFileId, directoryName, this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 删除群文件
     * @param fileId 文件id
     * @return 是否删除成功
     */
    GroupChatWindow.prototype.deleteFile = function (fileId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.deleteGroupFile(fileId, this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 移动群文件
     * @param fileId 文件id
     * @param moveToDirectoryId 移动到文件夹id
     * @return 是否移动成功
     */
    GroupChatWindow.prototype.moveFile = function (fileId, moveToDirectoryId) {
        if (moveToDirectoryId === void 0) { moveToDirectoryId = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.moveGroupFile(fileId, this.contact.id, moveToDirectoryId)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 重命名群文件
     * @param fileId 文件id
     * @param name 文件名
     * @return 是否重命名成功
     */
    GroupChatWindow.prototype.renameFile = function (fileId, name) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.moveGroupFile(fileId, this.contact.id, name)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    return GroupChatWindow;
}(ChatWindow));
exports.GroupChatWindow = GroupChatWindow;
/**
 * 临时消息聊天窗
 */
var TempChatWindow = /** @class */ (function (_super) {
    __extends(TempChatWindow, _super);
    function TempChatWindow(contact) {
        var _this = _super.call(this) || this;
        _this.contact = contact;
        _this.type = 'TempChatWindow';
        return _this;
    }
    TempChatWindow.prototype._send = function (messageChain, quoteMessageId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var resp, messageId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.sendTempMessage(this.contact.id, this.contact.group.id, messageChain, quoteMessageId)];
                    case 1:
                        resp = _b.sent();
                        messageId = resp === null || resp === void 0 ? void 0 : resp.messageId;
                        if (messageId)
                            (_a = _1.MiraiPieApp.instance.db) === null || _a === void 0 ? void 0 : _a.saveMessage({
                                sourceId: messageId,
                                messageChain: messageChain,
                                from: _1.MiraiPieApp.instance.qq,
                                to: this.contact.id,
                                type: 'TempMessage'
                            });
                        return [2 /*return*/, messageId];
                }
            });
        });
    };
    TempChatWindow.prototype.sendNudge = function (targetId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.sendNudge(targetId || this.contact.id, this.contact.id, 'Stranger')];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    /**
     * 获取聊天对象的个人资料
     * @return 聊天对象的个人资料
     */
    TempChatWindow.prototype.getProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.getMemberProfile(this.contact.group.id, this.contact.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 获取群成员信息
     * @return 群成员信息
     */
    TempChatWindow.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.getMemberInfo(this.contact.id, this.contact.group.id)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, resp === null || resp === void 0 ? void 0 : resp.data];
                }
            });
        });
    };
    /**
     * 修改群成员信息
     * @param info 群成员信息
     * @return 是否修改成功
     */
    TempChatWindow.prototype.setInfo = function (info) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.MiraiPieApp.instance.adapter.setMemberInfo(this.contact.id, this.contact.group.id, info)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, (resp === null || resp === void 0 ? void 0 : resp.code) === mirai_1.ResponseCode.Success];
                }
            });
        });
    };
    return TempChatWindow;
}(ChatWindow));
exports.TempChatWindow = TempChatWindow;
