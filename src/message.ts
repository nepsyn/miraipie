import * as Mirai from './mirai';
import {DiceValue, PokeType, SingleMessage, SingleMessageType} from './mirai';

/**
 * 判断单一消息类型(typescript类型保护)
 * @param type 单一消息类型
 * @return 是否为对应类型
 */
function isType<T extends SingleMessageType>(this: SingleMessage, type: T): boolean {
    return this.type === type;
}

/**
 * mirai码字符转义
 * @param raw 原始串
 * @return 转移后串
 */
function escape(raw: string): string {
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
function toMiraiCode<T extends SingleMessage>(this: T): string {
    if (this.isType('Source')) return `[mirai:source:${this.id}]`;
    else if (this.isType('Quote')) return `[mirai:quote:${this.id}]`;
    else if (this.isType('At')) return `[mirai:at:${this.target}]`;
    else if (this.isType('AtAll')) return `[mirai:atall]`;
    else if (this.isType('Face')) return `[mirai:face:${this.faceId}]`;
    else if (this.isType('Plain')) return `${this.text}`;
    else if (this.isType('Image')) return `[mirai:image:${this.imageId}]`;
    else if (this.isType('FlashImage')) return `[mirai:flash:${this.imageId}]`;
    else if (this.isType('Voice')) return `[mirai:voice:${this.voiceId}]`;
    else if (this.isType('Xml')) return `[mirai:xml:${escape(this.xml)}]`;
    else if (this.isType('Json')) return `[mirai:json:${escape(this.json)}]`;
    else if (this.isType('App')) return `[mirai:app:${escape(this.content)}]`;
    else if (this.isType('Poke')) return `[mirai:poke:${this.name}]`;
    else if (this.isType('Dice')) return `[mirai:dice:${this.value}]`;
    else if (this.isType('MusicShare')) return `[mirai:musicshare:${this.kind},${this.title},${this.summary},${this.jumpUrl},${this.pictureUrl},${this.musicUrl},${this.brief}]`;
    else if (this.isType('Forward')) return `[mirai:forward:${this.nodeList.length}]`;
    else if (this.isType('File')) return `[mirai:file:${this.id},${this.name},${this.size}]`;
    else if (this.isType('MiraiCode')) return this.code;
    else return `[mirai:unknown]`;
}

/**
 * 将单一消息转化为对应显示串
 * @example
 * Plain('Hello').toDisplayString();  // "Hello"
 * AtAll().toDisplayString();  // "@全体成员"
 * Dice(6).toDisplayString();  // "[骰子:6]"
 */
function toDisplayString<T extends SingleMessage>(this: T): string {
    if (this.isType('Quote')) return `[回复]${this.origin.toString()}`;
    else if (this.isType('At')) return `@${this.target}`;
    else if (this.isType('AtAll')) return `@全体成员`;
    else if (this.isType('Face')) return `[${this.name || '表情'}]`;
    else if (this.isType('Plain')) return `${this.text}`;
    else if (this.isType('Image')) return `[图片]`;
    else if (this.isType('FlashImage')) return `[闪照]`;
    else if (this.isType('Voice')) return `[语音消息]`;
    else if (this.isType('Xml')) return `${this.xml}`;
    else if (this.isType('Json')) return `${this.json}`;
    else if (this.isType('App')) return `${this.content}`;
    else if (this.isType('Poke')) return `[戳一戳]`;
    else if (this.isType('Dice')) return `[骰子:${this.value}]`;
    else if (this.isType('MusicShare')) return `[分享]${this.title}`;
    else if (this.isType('Forward')) return `[转发消息]`;
    else if (this.isType('File')) return `[文件]${this.name}`;
    else return `[不支持的消息类型#${this.type}]`;
}

/** 消息链 */
export class MessageChain extends Array<SingleMessage> implements Mirai.MessageChain {
    [index: number]: SingleMessage;

    /**
     * @param messages 单一消息
     * @example
     * // MessageChain(1) [{type: 'Plain', text: 'Hello World!'}]
     * new MessageChain(Plain('Hello World!'));
     * // MessageChain(2) [{type: 'AtAll'}, {type: 'Plain', text: 'Hello World!'}]
     * new MessageChain(AtAll(), Plain('Hello World!'));
     */
    constructor(...messages: SingleMessage[]) {
        super();
        Object.setPrototypeOf(this, MessageChain.prototype);
        this.push(...messages.map((message) => ({...message, isType, toDisplayString, toMiraiCode})));
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
    static from(messageList: SingleMessage[]): MessageChain {
        return new MessageChain(...messageList);
    }

    /**
     * 获取消息链中第一个有效消息, 如果没有将返回null
     * @return 第一个有效消息
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello World!')]);
     * chain.firstClientMessage;  // {type: 'AtAll'}
     */
    get firstClientMessage(): SingleMessage {
        for (const message of this) {
            if (message.type !== 'Source') return message;
        }
        return null;
    }

    /**
     * 获取消息链中第一个有效消息, 如果没有将返回null
     * @return 第一个有效消息
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello World!')]);
     * chain.f;  // {type: 'AtAll'}
     */
    get f(): SingleMessage {
        return this.firstClientMessage;
    }

    /**
     * 获取消息链中的消息id, 如果没有将返回null
     * @return 消息id
     * @example
     * const chain = fetchSomeMessages();  // MessageChain(2) [{type: 'Source', id: 123456, time: 123456}, {type: 'AtAll'}]
     * chain.sourceId;  // 123456
     */
    get sourceId(): number {
        if (this.length > 0 && this[0].isType('Source')) return this[0].id;
        else return null;
    }

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
    select<T extends SingleMessageType>(type: T): this {
        this.forEach((message, index) => {
            if (message.type !== type) this.splice(index, 1);
        });
        return this;
    }

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
    selected<T extends SingleMessageType>(type: T): MessageChain {
        return MessageChain.from(Array.from(this).filter((message) => message.type === type));
    }

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
    drop<T extends SingleMessageType>(type: T): this {
        for (let i = this.length - 1; i >= 0; i--) {
            if (this[i].type === type) this.splice(i, 1);
        }
        return this;
    }

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
    dropped<T extends SingleMessageType>(type: T): MessageChain {
        return MessageChain.from(Array.from(this).filter((message) => message.type !== type));
    }

    /**
     * 将消息链转化为mirai码表示形式(与mirai-core中的mirai码有差异, 不能混用)
     * @return mirai码表示形式
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // "[mirai:atall] Hello World!"
     * chain.toMiraiCode();
     */
    toMiraiCode(): string {
        return this.map((message) => message.toMiraiCode()).join('');
    }

    /**
     * 将消息链转化为显示串
     * @return 消息链的显示串
     * @example
     * const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
     * // "@全体成员 Hello World!"
     * chain.toDisplayString();
     */
    toDisplayString(): string {
        return this.dropped('Source').map((message) => message.toDisplayString()).join('');
    }
}

/**
 * 构造引用回复消息
 * @param id 引用消息id
 * @param groupId 群号
 * @param senderId 发送人QQ号
 * @param origin 接收者账号
 * @param targetId 原始消息内容
 */
export function Quote(id: number, groupId: number, senderId: number, origin: SingleMessage[], targetId?: number): Mirai.Quote {
    return {
        type: 'Quote',
        id, groupId, senderId, targetId, origin,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造&#64;消息
 * @param target 群成员QQ号
 * @param display At时显示的文字, 发送消息时无效, 自动使用群名片
 */
export function At(target: number, display: string = ''): Mirai.At {
    return {
        type: 'At',
        target, display,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造&#64;全体成员消息
 */
export function AtAll(): Mirai.AtAll {
    return {
        type: 'AtAll',
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造表情消息
 * @param faceId 表情id
 * @param name 表情名称
 */
export function Face(faceId?: number, name?: string): Mirai.Face {
    return {
        type: 'Face',
        faceId, name,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造普通文本消息
 * @param text 文本内容
 */
export function Plain(text: string): Mirai.Plain {
    return {
        type: 'Plain',
        text,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造图片消息
 * @param imageId 图片id
 * @param url 图片链接
 * @param path 图片文件路径
 * @param base64 图片Base64编码
 */
export function Image(imageId?: string, url?: string, path?: string, base64?: string): Mirai.Image {
    return {
        type: 'Image',
        imageId, url, path, base64,
        isType, toDisplayString, toMiraiCode
    };
}

type ImageOptions = Partial<Omit<Mirai.Image, 'type' | 'toDisplayString' | 'toMiraiCode'>>;

/**
 * 通过对象构造图片消息
 * @param options 图片选项
 */
export function makeImage(options: ImageOptions): Mirai.Image {
    return {
        type: 'Image',
        imageId: options.imageId,
        url: options.url,
        ...options,
        isType, toDisplayString, toMiraiCode
    }
}

/**
 * 构造闪图消息
 * @param imageId 图片id
 * @param url 图片链接
 * @param path 图片文件路径
 * @param base64 图片Base64编码
 */
export function FlashImage(imageId?: string, url?: string, path?: string, base64?: string): Mirai.FlashImage {
    return {
        type: 'FlashImage',
        imageId, url, path, base64,
        isType, toDisplayString, toMiraiCode
    };
}

type FlashImageOptions = Partial<Omit<Mirai.FlashImage, 'type' | 'toDisplayString' | 'toMiraiCode'>>;

/**
 * 通过对象构造闪图消息
 * @param options 闪图选项
 */
export function makeFlashImage(options: FlashImageOptions): Mirai.FlashImage {
    return {
        type: 'FlashImage',
        imageId: options.imageId,
        url: options.url,
        ...options,
        isType, toDisplayString, toMiraiCode
    }
}

/**
 * 构造语音消息
 * @param voiceId 语音id
 * @param url 语音链接
 * @param path 语音文件路径
 * @param base64 语音Base64编码
 */
export function Voice(voiceId?: string, url?: string, path?: string, base64?: string): Mirai.Voice {
    return {
        type: 'Voice',
        voiceId, url, path, base64,
        isType, toDisplayString, toMiraiCode
    };
}

type VoiceOptions = Partial<Omit<Mirai.Voice, 'type' | 'toDisplayString' | 'toMiraiCode'>>;

/**
 * 通过对象构造语音消息
 * @param options 语音选项
 */
export function makeVoice(options: VoiceOptions): Mirai.Voice {
    return {
        type: 'Voice',
        voiceId: options.voiceId,
        url: options.url,
        ...options,
        isType, toDisplayString, toMiraiCode
    }
}

/**
 * 构造XML消息
 * @param xml XML内容
 */
export function Xml(xml: string): Mirai.Xml {
    return {
        type: 'Xml',
        xml,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造JSON消息
 * @param json JSON内容
 */
export function Json(json: string): Mirai.Json {
    return {
        type: 'Json',
        json,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造小程序消息(手动构造的一般无法发送)
 * @param content 小程序内容(Json格式)
 */
export function App(content: string): Mirai.App {
    return {
        type: 'App',
        content,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造戳一戳消息
 * @param name 戳一戳名称
 */
export function Poke(name: PokeType): Mirai.Poke {
    return {
        type: 'Poke',
        name,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造骰子消息
 * @param value 骰子数值(1~6)
 */
export function Dice(value: DiceValue): Mirai.Dice {
    return {
        type: 'Dice',
        value,
        isType, toDisplayString, toMiraiCode
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
export function MusicShare(kind: string, title: string, summary: string, jumpUrl: string, pictureUrl: string, musicUrl: string, brief: string): Mirai.MusicShare {
    return {
        type: 'MusicShare',
        kind, title, summary, jumpUrl, pictureUrl, musicUrl, brief,
        isType, toDisplayString, toMiraiCode
    };
}

type MusicShareOptions = Partial<Omit<Mirai.MusicShare, 'type' | 'toDisplayString' | 'toMiraiCode'>>;

/**
 * 通过对象构造音乐分享消息
 * @param options 音乐分享选项
 */
export function makeMusicShare(options: MusicShareOptions): Mirai.MusicShare {
    return {
        type: 'MusicShare',
        kind: options.kind,
        title: options.title,
        summary: options.summary,
        jumpUrl: options.jumpUrl,
        pictureUrl: options.pictureUrl,
        musicUrl: options.musicUrl,
        brief: options.brief,
        isType, toDisplayString, toMiraiCode
    }
}

/**
 * 构造转发结点
 * @param senderId 发送人QQ号
 * @param time 发送时间戳
 * @param senderName 发送人名称
 * @param messageChain 消息链
 * @param sourceId 消息id
 */
export function ForwardNode(senderId: number, time: number, senderName: number, messageChain: MessageChain, sourceId: number): Mirai.ForwardNode {
    return {
        senderId, time, senderName, messageChain, sourceId
    };
}

/**
 * 构造合并转发消息
 * @param nodeList 结点列表
 */
export function Forward(nodeList: Mirai.ForwardNode[]): Mirai.Forward {
    return {
        type: 'Forward',
        nodeList,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造文件消息
 * @param id 文件id
 * @param name 文件名
 * @param size 文件大小
 */
export function File(id: string, name: string, size: number): Mirai.File {
    return {
        type: 'File',
        id, name, size,
        isType, toDisplayString, toMiraiCode
    };
}

/**
 * 构造mirai码消息
 * @param code mirai码
 */
export function MiraiCode(code: string): Mirai.MiraiCode {
    return {
        type: 'MiraiCode',
        code,
        isType, toDisplayString, toMiraiCode
    };
}
