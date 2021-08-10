import {
    App,
    At,
    AtAll,
    Dice,
    DiceValue,
    Face,
    File,
    FlashImage,
    ForwardMessage,
    ForwardNode,
    Image,
    Json,
    MessageChain,
    MiraiCode,
    MusicShare,
    Plain,
    Poke,
    PokeType,
    Quote,
    toDisplayString,
    toMiraiCode,
    Voice,
    Xml,
} from '../mirai';

/**
 * 构造引用回复消息
 * @param id 引用消息id
 * @param groupId 群号
 * @param senderId 发送人QQ号
 * @param origin 接收者账号
 * @param targetId 原始消息内容
 */
export function Quote(id: number, groupId: number, senderId: number, origin: MessageChain, targetId?: number): Quote {
    return {
        type: 'Quote',
        id, groupId, senderId, targetId, origin,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造&#64;消息
 * @param target 群成员QQ号
 * @param display At时显示的文字, 发送消息时无效, 自动使用群名片
 */
export function At(target: number, display: string = ''): At {
    return {
        type: 'At',
        target, display,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造&#64;全体成员消息
 */
export function AtAll(): AtAll {
    return {
        type: 'AtAll',
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造表情消息
 * @param faceId 表情id
 * @param name 表情名称
 */
export function Face(faceId?: number, name?: string): Face {
    return {
        type: 'Face',
        faceId, name,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造普通文本消息
 * @param text 文本内容
 */
export function Plain(text: string): Plain {
    return {
        type: 'Plain',
        text,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造图片消息
 * @param imageId 图片id
 * @param url 图片链接
 * @param path 图片文件路径
 * @param base64 图片Base64编码
 */
export function Image(imageId?: string, url?: string, path?: string, base64?: string): Image {
    return {
        type: 'Image',
        imageId, url, path, base64,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造闪图消息
 * @param imageId 图片id
 * @param url 图片链接
 * @param path 图片文件路径
 * @param base64 图片Base64编码
 */
export function FlashImage(imageId?: string, url?: string, path?: string, base64?: string): FlashImage {
    return {
        type: 'FlashImage',
        imageId, url, path, base64,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造语音消息
 * @param voiceId 语音id
 * @param url 语音链接
 * @param path 语音文件路径
 * @param base64 语音Base64编码
 */
export function Voice(voiceId?: string, url?: string, path?: string, base64?: string): Voice {
    return {
        type: 'Voice',
        voiceId, url, path, base64,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造XML消息
 * @param xml XML内容
 */
export function Xml(xml: string): Xml {
    return {
        type: 'Xml',
        xml,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造JSON消息
 * @param json JSON内容
 */
export function Json(json: string): Json {
    return {
        type: 'Json',
        json,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造小程序消息(手动构造的一般无法发送)
 * @param content 小程序内容(Json格式)
 */
export function App(content: string): App {
    return {
        type: 'App',
        content,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造戳一戳消息
 * @param name 戳一戳名称
 */
export function Poke(name: PokeType): Poke {
    return {
        type: 'Poke',
        name,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造骰子消息
 * @param value 骰子数值(1~6)
 */
export function Dice(value: DiceValue): Dice {
    return {
        type: 'Dice',
        value,
        toDisplayString, toMiraiCode
    };
}

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
export function MusicShare(kind: string, title: string, summary: string, jumpUrl: string, pictureUrl: string, musicUrl: string, brief: string): MusicShare {
    return {
        type: 'MusicShare',
        kind, title, summary, jumpUrl, pictureUrl, musicUrl, brief,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造转发结点
 * @param senderId 发送人QQ号
 * @param time 发送时间戳
 * @param senderName 发送人名称
 * @param messageChain 消息链
 * @param sourceId 消息id
 */
export function ForwardNode(senderId: number, time: number, senderName: number, messageChain: MessageChain, sourceId: number): ForwardNode {
    return {
        senderId, time, senderName, messageChain, sourceId
    };
}

/**
 * 构造合并转发消息
 * @param nodeList 结点列表
 */
export function ForwardMessage(nodeList: ForwardNode[]): ForwardMessage {
    return {
        type: 'ForwardMessage',
        nodeList,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造文件消息
 * @param id 文件id
 * @param name 文件名
 * @param size 文件大小
 */
export function File(id: string, name: string, size: number): File {
    return {
        type: 'File',
        id, name, size,
        toDisplayString, toMiraiCode
    };
}

/**
 * 构造mirai码消息
 * @param code mirai码
 */
export function MiraiCode(code: string): MiraiCode {
    return {
        type: 'MiraiCode',
        code,
        toDisplayString, toMiraiCode
    };
}
