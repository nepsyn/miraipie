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
exports.PieAgent = exports.PieFilter = exports.Pie = void 0;
var log4js_1 = __importDefault(require("log4js"));
var _1 = require(".");
var tool_1 = require("../tool");
var logger = log4js_1.default.getLogger('pie');
/**
 * A Delicious Pie
 */
var Pie = /** @class */ (function () {
    /**
     * @param options pie选项
     */
    function Pie(options) {
        var e_1, _a;
        /**
         * 是否为pie标识
         */
        this.isPie = true;
        // 判断标识符是否合法
        if (!(options.namespace.match(/^[\w]+$/) && options.id.match(/^[\w]+$/))) {
            throw new Error('pie的namespace和id字段都必须为合法标识符');
        }
        // 基础配置
        this.namespace = options.namespace;
        this.id = options.id;
        this.author = options.author;
        this.version = options.version;
        // pie相关信息
        this.description = options.description || '';
        this.authorUrl = options.authorUrl || '';
        this.projectUrl = options.projectUrl || '';
        this.dependencies = options.dependencies || [];
        this.keywords = options.keywords || [];
        // logger
        this.logger = log4js_1.default.getLogger(this.fullId);
        // pie运行环境
        this.data = options.data || {};
        this.exports = options.exports || {};
        this.userConfigMeta = options.userConfigMeta || {};
        this.configs = {};
        try {
            for (var _b = __values(Object.keys(this.userConfigMeta)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var i = _c.value;
                this.configs[i] = options.userConfigMeta[i].default;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.filters = options.filters || [];
        // pie生命周期钩子
        this.installed = options.installed;
        this.uninstalled = options.uninstalled;
        this.enabled = options.enabled;
        this.disabled = options.disabled;
        this.updated = options.updated;
        // pie处理器
        this.messageHandler = options.messageHandler;
        this.eventHandler = options.eventHandler;
        // 挂载options中方法到pie实例
        for (var key in options.methods || {})
            this[key in this ? "$" + key : key] = options.methods[key];
    }
    Object.defineProperty(Pie.prototype, "fullId", {
        /**
         * 返回pie的全限定名, 格式为: $namespace:$id
         * @example
         * "miraipie:foo"
         * "miraipie:bar"
         */
        get: function () {
            return this.namespace + ":" + this.id;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 获取依赖项pie的导出对象
     * @param fullId 依赖项的全限定名
     * @example
     * // {foo: 'bar'}
     * this.require('miraipie:foo');
     */
    Pie.prototype.require = function (fullId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.dependencies.includes(fullId))
                    logger.warn("\u6240\u8BF7\u6C42\u7684\u4F9D\u8D56\u9879 '" + fullId + "' \u6CA1\u6709\u5728pie\u7684\u58F0\u660E\u4E2D\u6307\u5B9A");
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a;
                        var pie = (_a = _1.MiraiPieApp.instance) === null || _a === void 0 ? void 0 : _a.pieAgent.getPie(fullId);
                        if (pie)
                            resolve(pie.exports);
                        else
                            reject(new Error("\u65E0\u6CD5\u5F15\u7528\u672A\u5B89\u88C5\u7684pie '" + fullId + "'"));
                    })];
            });
        });
    };
    return Pie;
}());
exports.Pie = Pie;
/**
 * pie消息过滤器
 */
var PieFilter = /** @class */ (function () {
    function PieFilter() {
    }
    /**
     * 消息包含@我
     */
    PieFilter.atMe = {
        sign: 'AtMe',
        handler: function (window, chain) {
            return chain.selected('At').some(function (at) { return at.target === _1.MiraiPieApp.instance.qq; });
        }
    };
    /**
     * 消息包含@指定QQ号群成员
     * @param id 群成员QQ号
     */
    PieFilter.at = function (id) {
        return {
            sign: "At(" + id + ")",
            handler: function (window, chain) {
                return chain.selected('At').some(function (at) { return at.target === id; });
            }
        };
    };
    /**
     * 消息包含@全体成员
     */
    PieFilter.atAll = {
        sign: 'AtAll',
        handler: function (window, chain) { return chain.selected('AtAll').length > 0; }
    };
    /**
     * 消息来自指定账号
     * @param id QQ号或群号
     */
    PieFilter.from = function (id) {
        return {
            sign: "From(" + id + ")",
            handler: function (window) { return window.contact.id === id; }
        };
    };
    /**
     * 消息不来自指定账号
     * @param id QQ号或群号
     */
    PieFilter.notFrom = function (id) {
        return {
            sign: "NotFrom(" + id + ")",
            handler: function (window) { return window.contact.id !== id; }
        };
    };
    /**
     * 消息包含单一消息类型
     * @param type 单一消息类型
     */
    PieFilter.containsType = function (type) {
        return {
            sign: "ContainsType(" + type + ")",
            handler: function (window, chain) { return chain.selected(type).length > 0; }
        };
    };
    /**
     * 消息显示串匹配正则表达式
     * @param regexp 正则表达式
     */
    PieFilter.displayStringMatch = function (regexp) {
        return {
            sign: "DisplayStringMatch(" + regexp + ")",
            handler: function (window, chain) { return chain.toDisplayString().match(regexp) !== null; }
        };
    };
    /**
     * 消息显示串和指定串全等
     * @param displayString 指定字符串
     */
    PieFilter.displayStringEquals = function (displayString) {
        return {
            sign: "DisplayStringEquals(" + displayString + ")",
            handler: function (window, chain) { return chain.toDisplayString() === displayString; }
        };
    };
    /**
     * 多个消息过滤器求<strong>或</strong>
     * @param filters 消息过滤器
     */
    PieFilter.or = function () {
        var filters = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            filters[_i] = arguments[_i];
        }
        return {
            sign: "Or(" + filters.map(function (filter) { return filter.sign; }).join(', ') + ")",
            handler: function (window, chain, pie) { return filters.some(function (filter) { return filter.handler(window, chain, pie); }); }
        };
    };
    /**
     * 消息来自好友
     */
    PieFilter.fromFriend = {
        sign: 'FromFriend',
        handler: function (window) { return window.type === 'FriendChatWindow'; }
    };
    /**
     * 消息来自群聊
     */
    PieFilter.fromGroup = {
        sign: 'FromGroup',
        handler: function (window) { return window.type === 'GroupChatWindow'; }
    };
    /**
     * 消息来自群成员
     */
    PieFilter.fromMember = {
        sign: 'FromMember',
        handler: function (window) { return window.type === 'TempChatWindow'; }
    };
    return PieFilter;
}());
exports.PieFilter = PieFilter;
/**
 * pie管理类, 用户维护各个pie
 */
var PieAgent = /** @class */ (function () {
    function PieAgent() {
        this.controller = new Map();
    }
    /**
     * 获取pie实例
     * @param fullId pie的全限定名
     */
    PieAgent.prototype.getPie = function (fullId) {
        var _a;
        return tool_1.makeReadonly((_a = this.controller.get(fullId)) === null || _a === void 0 ? void 0 : _a.pie);
    };
    /**
     * 将当前所有pie的环境存储到数据库中
     */
    PieAgent.prototype.savePies = function () {
        var e_2, _a;
        var _b;
        try {
            for (var _c = __values(this.controller.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var control = _d.value;
                (_b = _1.MiraiPieApp.instance.db) === null || _b === void 0 ? void 0 : _b.saveOrUpdatePieRecord({
                    fullId: control.pie.fullId,
                    version: control.pie.version,
                    enabled: control.enabled,
                    path: control.path,
                    configs: control.pie.configs
                });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    /**
     * 安装pie
     * @param pie pie实例
     * @param options 安装选项
     */
    PieAgent.prototype.install = function (pie, options) {
        var _a, _b;
        if (pie === null || pie === void 0 ? void 0 : pie.isPie) {
            // 防止重复安装
            if (((_a = this.getPie(pie.fullId)) === null || _a === void 0 ? void 0 : _a.version) === pie.version)
                return;
            // 获取数据库中记录并还原pie环境
            var record = (_b = _1.MiraiPieApp.instance.db) === null || _b === void 0 ? void 0 : _b.getPieRecordByFullId(pie.fullId);
            if (record) {
                pie.configs = record.configs;
                // pie版本存在更新
                if (pie.version > record.version && pie.updated) {
                    tool_1.makeAsync(pie.updated, pie)(record.version).catch(function (err) {
                        pie.logger.error('调用钩子updated发生错误:', err.message);
                    });
                }
            }
            // 添加控制块
            this.controller.set(pie.fullId, {
                pie: pie,
                enabled: false,
                path: options === null || options === void 0 ? void 0 : options.path
            });
            pie.logger.debug('已加载');
            // 调用钩子
            if (pie.installed) {
                tool_1.makeAsync(pie.installed, pie)().catch(function (err) {
                    pie.logger.error('调用钩子installed发生错误:', err.message);
                });
            }
            // 自动启用
            if (!options || (options === null || options === void 0 ? void 0 : options.enabled))
                this.enable(pie.fullId);
        }
        else {
            logger.error("\u52A0\u8F7Dpie\u5931\u8D25, \u8BF7\u68C0\u67E5 " + pie + " \u662F\u5426\u4E3A\u4E00\u4E2A\u6709\u6548\u7684pie");
        }
    };
    /**
     * 卸载pie
     * @param fullId pie全限定名
     */
    PieAgent.prototype.uninstall = function (fullId) {
        var pie = this.getPie(fullId);
        if (pie) {
            // 禁用pie
            this.disable(fullId);
            this.controller.delete(fullId);
            pie.logger.debug('已卸载');
            // 调用钩子
            if (pie.uninstalled) {
                tool_1.makeAsync(pie.uninstalled, pie)().catch(function (err) {
                    pie.logger.error('调用钩子uninstalled发生错误:', err.message);
                });
            }
        }
    };
    /**
     * 启用pie
     * @param fullId pie全限定名
     */
    PieAgent.prototype.enable = function (fullId) {
        // 获取pie实例
        var pie = this.getPie(fullId);
        if (pie) {
            this.controller.get(fullId).enabled = true;
            pie.logger.debug('已启用');
            // 调用钩子
            if (pie.enabled) {
                tool_1.makeAsync(pie.enabled, pie)().catch(function (err) {
                    pie.logger.error('调用钩子enabled发生错误:', err.message);
                });
            }
        }
    };
    /**
     * 禁用pie
     * @param fullId pie全限定名
     */
    PieAgent.prototype.disable = function (fullId) {
        // 获取pie实例
        var pie = this.getPie(fullId);
        if (pie) {
            this.controller.get(fullId).enabled = false;
            pie.logger.debug('已禁用');
            // 调用钩子
            if (pie.disabled) {
                tool_1.makeAsync(pie.disabled, pie)().catch(function (err) {
                    pie.logger.error('调用钩子disabled发生错误:', err.message);
                });
            }
        }
    };
    /**
     * 消息分发器, 用以分发消息给各个pie单独处理
     * @param chatMessage 消息原始对象
     */
    PieAgent.prototype.messageDispatcher = function (chatMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var window, chain, _loop_1, _a, _b, control;
            var e_3, _c;
            return __generator(this, function (_d) {
                window = null;
                if (chatMessage.type === 'FriendMessage')
                    window = new _1.FriendChatWindow(chatMessage.sender);
                else if (chatMessage.type === 'GroupMessage')
                    window = new _1.GroupChatWindow(chatMessage.sender);
                else if (chatMessage.type === 'TempMessage')
                    window = new _1.TempChatWindow(chatMessage.sender);
                // 使聊天窗和消息链只读
                window = tool_1.makeReadonly(window);
                chain = tool_1.makeReadonly(chatMessage.messageChain);
                _loop_1 = function (control) {
                    if (control.enabled) {
                        var pie_1 = control.pie;
                        // 检查过滤
                        var passed = pie_1.filters.every(function (filter) {
                            try {
                                return filter.handler(window, chain, pie_1);
                            }
                            catch (err) {
                                pie_1.logger.error("\u6267\u884C\u8FC7\u6EE4\u5668 '" + filter.sign + "' \u65F6\u53D1\u751F\u9519\u8BEF:", err.message);
                                return false;
                            }
                        });
                        if (pie_1.messageHandler && passed) {
                            tool_1.makeAsync(pie_1.messageHandler, pie_1)(window, chain).catch(function (err) {
                                pie_1.logger.error('调用消息处理器发生错误:', err.message);
                            });
                        }
                    }
                };
                try {
                    // 遍历所有pie, 并调用其处理器
                    for (_a = __values(this.controller.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        control = _b.value;
                        _loop_1(control);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 事件分发器, 用以分发事件给各个pie单独处理
     * @param event 事件原始对象
     */
    PieAgent.prototype.eventDispatcher = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _event, _loop_2, _a, _b, control;
            var e_4, _c;
            return __generator(this, function (_d) {
                _event = tool_1.makeReadonly(event);
                _loop_2 = function (control) {
                    if (control.enabled) {
                        var pie_2 = control.pie;
                        if (pie_2.eventHandler) {
                            tool_1.makeAsync(pie_2.eventHandler, pie_2)(_event).catch(function (err) {
                                pie_2.logger.error('调用事件处理器发生错误:', err.message);
                            });
                        }
                    }
                };
                try {
                    // 遍历所有pie, 并调用其处理器
                    for (_a = __values(this.controller.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        control = _b.value;
                        _loop_2(control);
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
    return PieAgent;
}());
exports.PieAgent = PieAgent;
