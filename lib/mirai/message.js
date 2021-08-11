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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDisplayString = exports.toMiraiCode = exports.MessageChain = void 0;
/**
 * 消息链
 */
var MessageChain = /** @class */ (function (_super) {
    __extends(MessageChain, _super);
    /**
     * @param messages 单一消息
     * @example
     * // MessageChain(1) [{type: 'Plain', text: 'Hello World!'}]
     * new MessageChain(Plain('Hello World!'));
     * // MessageChain(2) [{type: 'AtAll'}, {type: 'Plain', text: 'Hello World!'}]
     * new MessageChain(AtAll(), Plain('Hello World!'));
     */
    function MessageChain() {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        Object.setPrototypeOf(_this, MessageChain.prototype);
        _this.push.apply(_this, __spreadArray([], __read(messages.map(function (message) { return (__assign(__assign({}, message), { toDisplayString: toDisplayString, toMiraiCode: toMiraiCode })); }))));
        return _this;
    }
    /**
     * 使用单一消息数组构造消息链
     * @param messageList 单一消息数组
     * @return 消息链
     * @example
     * // MessageChain(1) [{type: 'Plain', text: 'Hello World!'}]
     * MessageChain.from([Plain('Hello World!')]);
     * // MessageChain(2) [{type: 'AtAll'}, {type: 'Plain', text: 'Hello World!'}]
     * MessageChain.from([AtAll(), Plain('Hello World!')]);
     */
    MessageChain.from = function (messageList) {
        return new (MessageChain.bind.apply(MessageChain, __spreadArray([void 0], __read(messageList))))();
    };
    Object.defineProperty(MessageChain.prototype, "firstClientMessage", {
        /**
         * 获取消息链中第一个有效消息, 如果没有将返回null
         * @return 第一个有效消息
         * @example
         * const chain = MessageChain.from([AtAll(), Plain('Hello World!')]);
         * chain.firstClientMessage;  // {type: 'AtAll'}
         */
        get: function () {
            var e_1, _a;
            try {
                for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var message = _c.value;
                    if (message.type !== 'Source')
                        return message;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MessageChain.prototype, "f", {
        /**
         * 获取消息链中第一个有效消息, 如果没有将返回null
         * @return 第一个有效消息
         * @example
         * const chain = MessageChain.from([AtAll(), Plain('Hello World!')]);
         * chain.f;  // {type: 'AtAll'}
         */
        get: function () {
            return this.firstClientMessage;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MessageChain.prototype, "sourceId", {
        /**
         * 获取消息链中的消息id, 如果没有将返回null
         * @return 消息id
         * @example
         * const chain = fetchSomeMessages();  // MessageChain(2) [{type: 'Source', id: 123456, time: 123456}, {type: 'AtAll'}]
         * chain.sourceId;  // 123456
         */
        get: function () {
            if (this.length > 0 && this[0].type === 'Source')
                return this[0].id;
            else
                return null;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * <strong>原地</strong>选择保留某类型的单一消息
     * @param type 单一消息类型
     * @return 消息链
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // MessageChain(1) [{type: 'AtAll'}]
     * chain.select('AtAll');
     * // MessageChain(1) [{type: 'AtAll'}]
     * chain;
     */
    MessageChain.prototype.select = function (type) {
        var _this = this;
        this.forEach(function (message, index) {
            if (message.type !== type)
                _this.splice(index, 1);
        });
        return this;
    };
    /**
     * 选择保留某类型的单一消息并生成<strong>新消息链</strong>
     * @param type 单一消息类型
     * @return 消息链
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // MessageChain(1) [{type: 'AtAll'}]
     * chain.selected('AtAll');
     * // MessageChain(3) [{type: 'AtAll'}, {type: 'Plain', text: 'Hello '}, {type: 'Plain', text: 'World!'}]
     * chain;
     */
    MessageChain.prototype.selected = function (type) {
        return MessageChain.from(this.filter(function (message) { return message.type === type; }));
    };
    /**
     * <strong>原地</strong>删除某类型的单一消息
     * @param type 单一消息类型
     * @return 消息链
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // MessageChain(1) [{type: 'AtAll'}]
     * chain.drop('Plain');
     * // MessageChain(1) [{type: 'AtAll'}]
     * chain;
     */
    MessageChain.prototype.drop = function (type) {
        for (var i = this.length - 1; i >= 0; i--) {
            if (this[i].type === type)
                this.splice(i, 1);
        }
        return this;
    };
    /**
     * 删除某类型的单一消息并生成<strong>新消息链</strong>
     * @param type 单一消息类型
     * @return 消息链
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // MessageChain(1) [{type: 'AtAll'}]
     * chain.dropped('Plain');
     * // MessageChain(3) [{type: 'AtAll'}, {type: 'Plain', text: 'Hello '}, {type: 'Plain', text: 'World!'}]
     * chain;
     */
    MessageChain.prototype.dropped = function (type) {
        return MessageChain.from(this.filter(function (message) { return message.type !== type; }));
    };
    /**
     * 将消息链转化为显示串
     * @return 消息链的显示串
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // "@全体成员 Hello World!"
     * chain.toDisplayString();
     */
    MessageChain.prototype.toDisplayString = function () {
        return this.dropped('Source').map(function (message) { return message.toDisplayString(); }).join('');
    };
    /**
     * 将消息链转化为mirai码表示形式(与mirai-core中的mirai码有差异, 不能混用)
     * @return mirai码表示形式
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // "[mirai:atall] Hello World!"
     * chain.toMiraiCode();
     */
    MessageChain.prototype.toMiraiCode = function () {
        return this.map(function (message) { return message.toMiraiCode(); }).join('');
    };
    return MessageChain;
}(Array));
exports.MessageChain = MessageChain;
/**
 * 判断单一消息类型(typescript类型保护)
 * @param message 单一消息
 * @param type 单一消息类型
 * @return 是否为对应类型
 */
function isType(message, type) {
    return message.type === type;
}
/**
 * mirai码字符转义
 * @param raw 原始串
 * @return 转移后串
 */
function escape(raw) {
    return raw
        .replace(/([\[\]:,\\])/g, '\\$1')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}
/**
 * 将单一消息转化为对应mirai码
 * @example
 * Plain('Hello').toMiraiCode();  // "Hello"
 * AtAll().toMiraiCode();  // "[mirai:atall]"
 * Dice(6).toMiraiCode();  // "[mirai:dice:6]"
 */
function toMiraiCode() {
    if (isType(this, 'Source'))
        return "[mirai:source:" + this.id + "]";
    else if (isType(this, 'Quote'))
        return "[mirai:quote:" + this.id + "]";
    else if (isType(this, 'At'))
        return "[mirai:at:" + this.target + "]";
    else if (isType(this, 'AtAll'))
        return "[mirai:atall]";
    else if (isType(this, 'Face'))
        return "[mirai:face:" + this.faceId + "]";
    else if (isType(this, 'Plain'))
        return "" + this.text;
    else if (isType(this, 'Image'))
        return "[mirai:image:" + this.imageId + "]";
    else if (isType(this, 'FlashImage'))
        return "[mirai:flash:" + this.imageId + "]";
    else if (isType(this, 'Voice'))
        return "[mirai:voice:" + this.voiceId + "]";
    else if (isType(this, 'Xml'))
        return "[mirai:xml:" + escape(this.xml) + "]";
    else if (isType(this, 'Json'))
        return "[mirai:json:" + escape(this.json) + "]";
    else if (isType(this, 'App'))
        return "[mirai:app:" + escape(this.content) + "]";
    else if (isType(this, 'Poke'))
        return "[mirai:poke:" + this.name + "]";
    else if (isType(this, 'Dice'))
        return "[mirai:dice:" + this.value + "]";
    else if (isType(this, 'MusicShare'))
        return "[mirai:musicshare:" + this.kind + "," + this.title + "," + this.summary + "," + this.jumpUrl + "," + this.pictureUrl + "," + this.musicUrl + "," + this.brief + "]";
    else if (isType(this, 'ForwardMessage'))
        return "[mirai:forward:" + this.nodeList.length + "]";
    else if (isType(this, 'File'))
        return "[mirai:file:" + this.id + "," + this.name + "," + this.size + "]";
    else if (isType(this, 'MiraiCode'))
        return this.code;
    else
        return "[mirai:unknown]";
}
exports.toMiraiCode = toMiraiCode;
/**
 * 将单一消息转化为对应显示串
 * @example
 * Plain('Hello').toDisplayString();  // "Hello"
 * AtAll().toDisplayString();  // "@全体成员"
 * Dice(6).toDisplayString();  // "[骰子:6]"
 */
function toDisplayString() {
    if (isType(this, 'Quote'))
        return "[\u56DE\u590D]" + this.origin.toString();
    else if (isType(this, 'At'))
        return "@" + this.target;
    else if (isType(this, 'AtAll'))
        return "@\u5168\u4F53\u6210\u5458";
    else if (isType(this, 'Face'))
        return "[" + (this.name || '表情') + "]";
    else if (isType(this, 'Plain'))
        return "" + this.text;
    else if (isType(this, 'Image'))
        return "[\u56FE\u7247]";
    else if (isType(this, 'FlashImage'))
        return "[\u95EA\u7167]";
    else if (isType(this, 'Voice'))
        return "[\u8BED\u97F3\u6D88\u606F]";
    else if (isType(this, 'Xml'))
        return "" + this.xml;
    else if (isType(this, 'Json'))
        return "" + this.json;
    else if (isType(this, 'App'))
        return "" + this.content;
    else if (isType(this, 'Poke'))
        return "[\u6233\u4E00\u6233]";
    else if (isType(this, 'Dice'))
        return "[\u9AB0\u5B50:" + this.value + "]";
    else if (isType(this, 'MusicShare'))
        return "[\u5206\u4EAB]" + this.title;
    else if (isType(this, 'ForwardMessage'))
        return "[\u8F6C\u53D1\u6D88\u606F]";
    else if (isType(this, 'File'))
        return "[\u6587\u4EF6]" + this.name;
    else
        return "[\u4E0D\u652F\u6301\u7684\u6D88\u606F\u7C7B\u578B#" + this.type + "]";
}
exports.toDisplayString = toDisplayString;
