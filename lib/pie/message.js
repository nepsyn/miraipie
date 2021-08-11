"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiraiCode = exports.File = exports.ForwardMessage = exports.ForwardNode = exports.MusicShare = exports.Dice = exports.Poke = exports.App = exports.Json = exports.Xml = exports.Voice = exports.FlashImage = exports.Image = exports.Plain = exports.Face = exports.AtAll = exports.At = exports.Quote = void 0;
var mirai_1 = require("../mirai");
/**
 * 构造引用回复消息
 * @param id 引用消息id
 * @param groupId 群号
 * @param senderId 发送人QQ号
 * @param origin 接收者账号
 * @param targetId 原始消息内容
 */
function Quote(id, groupId, senderId, origin, targetId) {
    return {
        type: 'Quote',
        id: id,
        groupId: groupId,
        senderId: senderId,
        targetId: targetId,
        origin: origin,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Quote = Quote;
/**
 * 构造&#64;消息
 * @param target 群成员QQ号
 * @param display At时显示的文字, 发送消息时无效, 自动使用群名片
 */
function At(target, display) {
    if (display === void 0) { display = ''; }
    return {
        type: 'At',
        target: target,
        display: display,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.At = At;
/**
 * 构造&#64;全体成员消息
 */
function AtAll() {
    return {
        type: 'AtAll',
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.AtAll = AtAll;
/**
 * 构造表情消息
 * @param faceId 表情id
 * @param name 表情名称
 */
function Face(faceId, name) {
    return {
        type: 'Face',
        faceId: faceId,
        name: name,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Face = Face;
/**
 * 构造普通文本消息
 * @param text 文本内容
 */
function Plain(text) {
    return {
        type: 'Plain',
        text: text,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Plain = Plain;
/**
 * 构造图片消息
 * @param imageId 图片id
 * @param url 图片链接
 * @param path 图片文件路径
 * @param base64 图片Base64编码
 */
function Image(imageId, url, path, base64) {
    return {
        type: 'Image',
        imageId: imageId,
        url: url,
        path: path,
        base64: base64,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Image = Image;
/**
 * 构造闪图消息
 * @param imageId 图片id
 * @param url 图片链接
 * @param path 图片文件路径
 * @param base64 图片Base64编码
 */
function FlashImage(imageId, url, path, base64) {
    return {
        type: 'FlashImage',
        imageId: imageId,
        url: url,
        path: path,
        base64: base64,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.FlashImage = FlashImage;
/**
 * 构造语音消息
 * @param voiceId 语音id
 * @param url 语音链接
 * @param path 语音文件路径
 * @param base64 语音Base64编码
 */
function Voice(voiceId, url, path, base64) {
    return {
        type: 'Voice',
        voiceId: voiceId,
        url: url,
        path: path,
        base64: base64,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Voice = Voice;
/**
 * 构造XML消息
 * @param xml XML内容
 */
function Xml(xml) {
    return {
        type: 'Xml',
        xml: xml,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Xml = Xml;
/**
 * 构造JSON消息
 * @param json JSON内容
 */
function Json(json) {
    return {
        type: 'Json',
        json: json,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Json = Json;
/**
 * 构造小程序消息(手动构造的一般无法发送)
 * @param content 小程序内容(Json格式)
 */
function App(content) {
    return {
        type: 'App',
        content: content,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.App = App;
/**
 * 构造戳一戳消息
 * @param name 戳一戳名称
 */
function Poke(name) {
    return {
        type: 'Poke',
        name: name,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Poke = Poke;
/**
 * 构造骰子消息
 * @param value 骰子数值(1~6)
 */
function Dice(value) {
    return {
        type: 'Dice',
        value: value,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.Dice = Dice;
/**
 * 构造音乐分享消息
 * @param kind 音乐分享类型
 * @param title 标题
 * @param summary 概括
 * @param jumpUrl 跳转链接
 * @param pictureUrl 封面图片链接
 * @param musicUrl 音乐播放链接
 * @param brief 简介
 */
function MusicShare(kind, title, summary, jumpUrl, pictureUrl, musicUrl, brief) {
    return {
        type: 'MusicShare',
        kind: kind,
        title: title,
        summary: summary,
        jumpUrl: jumpUrl,
        pictureUrl: pictureUrl,
        musicUrl: musicUrl,
        brief: brief,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.MusicShare = MusicShare;
/**
 * 构造转发结点
 * @param senderId 发送人QQ号
 * @param time 发送时间戳
 * @param senderName 发送人名称
 * @param messageChain 消息链
 * @param sourceId 消息id
 */
function ForwardNode(senderId, time, senderName, messageChain, sourceId) {
    return {
        senderId: senderId,
        time: time,
        senderName: senderName,
        messageChain: messageChain,
        sourceId: sourceId
    };
}
exports.ForwardNode = ForwardNode;
/**
 * 构造合并转发消息
 * @param nodeList 结点列表
 */
function ForwardMessage(nodeList) {
    return {
        type: 'ForwardMessage',
        nodeList: nodeList,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.ForwardMessage = ForwardMessage;
/**
 * 构造文件消息
 * @param id 文件id
 * @param name 文件名
 * @param size 文件大小
 */
function File(id, name, size) {
    return {
        type: 'File',
        id: id,
        name: name,
        size: size,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.File = File;
/**
 * 构造mirai码消息
 * @param code mirai码
 */
function MiraiCode(code) {
    return {
        type: 'MiraiCode',
        code: code,
        toDisplayString: mirai_1.toDisplayString,
        toMiraiCode: mirai_1.toMiraiCode
    };
}
exports.MiraiCode = MiraiCode;
