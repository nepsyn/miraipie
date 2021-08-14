/**
 * 单一消息
 */
export interface SingleMessage {
    /**
     * 消息类型
     */
    readonly type: SingleMessageType;

    /**
     * 转化为mirai码
     */
    toMiraiCode(): string;

    /**
     * 转化为显示串
     */
    toDisplayString(): string;
}

/**
 * 消息链
 */
export class MessageChain extends Array<SingleMessage> {
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
        this.push(...messages.map((message) => ({...message, toDisplayString, toMiraiCode})));
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
        if (this.length > 0 && this[0].type === 'Source') return (this[0] as Source).id;
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
        return MessageChain.from(this.filter(message => message.type === type));
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
        return MessageChain.from(this.filter(message => message.type !== type));
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
        return this.dropped('Source').map(message => message.toDisplayString()).join('');
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
        return this.map(message => message.toMiraiCode()).join('');
    }
}

/**
 * 判断单一消息类型(typescript类型保护)
 * @param message 单一消息
 * @param type 单一消息类型
 * @return 是否为对应类型
 */
function isType<T extends SingleMessageType>(message: SingleMessage, type: T): message is SingleMessageMap[T] {
    return message.type === type;
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
export function toMiraiCode<T extends SingleMessage>(this: T): string {
    if (isType(this, 'Source')) return `[mirai:source:${this.id}]`;
    else if (isType(this, 'Quote')) return `[mirai:quote:${this.id}]`;
    else if (isType(this, 'At')) return `[mirai:at:${this.target}]`;
    else if (isType(this, 'AtAll')) return `[mirai:atall]`;
    else if (isType(this, 'Face')) return `[mirai:face:${this.faceId}]`;
    else if (isType(this, 'Plain')) return `${this.text}`;
    else if (isType(this, 'Image')) return `[mirai:image:${this.imageId}]`;
    else if (isType(this, 'FlashImage')) return `[mirai:flash:${this.imageId}]`;
    else if (isType(this, 'Voice')) return `[mirai:voice:${this.voiceId}]`;
    else if (isType(this, 'Xml')) return `[mirai:xml:${escape(this.xml)}]`;
    else if (isType(this, 'Json')) return `[mirai:json:${escape(this.json)}]`;
    else if (isType(this, 'App')) return `[mirai:app:${escape(this.content)}]`;
    else if (isType(this, 'Poke')) return `[mirai:poke:${this.name}]`;
    else if (isType(this, 'Dice')) return `[mirai:dice:${this.value}]`;
    else if (isType(this, 'MusicShare')) return `[mirai:musicshare:${this.kind},${this.title},${this.summary},${this.jumpUrl},${this.pictureUrl},${this.musicUrl},${this.brief}]`;
    else if (isType(this, 'Forward')) return `[mirai:forward:${this.nodeList.length}]`;
    else if (isType(this, 'File')) return `[mirai:file:${this.id},${this.name},${this.size}]`;
    else if (isType(this, 'MiraiCode')) return this.code;
    else return `[mirai:unknown]`;
}

/**
 * 将单一消息转化为对应显示串
 * @example
 * Plain('Hello').toDisplayString();  // "Hello"
 * AtAll().toDisplayString();  // "@全体成员"
 * Dice(6).toDisplayString();  // "[骰子:6]"
 */
export function toDisplayString<T extends SingleMessage>(this: T): string {
    if (isType(this, 'Quote')) return `[回复]${this.origin.toString()}`;
    else if (isType(this, 'At')) return `@${this.target}`;
    else if (isType(this, 'AtAll')) return `@全体成员`;
    else if (isType(this, 'Face')) return `[${this.name || '表情'}]`;
    else if (isType(this, 'Plain')) return `${this.text}`;
    else if (isType(this, 'Image')) return `[图片]`;
    else if (isType(this, 'FlashImage')) return `[闪照]`;
    else if (isType(this, 'Voice')) return `[语音消息]`;
    else if (isType(this, 'Xml')) return `${this.xml}`;
    else if (isType(this, 'Json')) return `${this.json}`;
    else if (isType(this, 'App')) return `${this.content}`;
    else if (isType(this, 'Poke')) return `[戳一戳]`;
    else if (isType(this, 'Dice')) return `[骰子:${this.value}]`;
    else if (isType(this, 'MusicShare')) return `[分享]${this.title}`;
    else if (isType(this, 'Forward')) return `[转发消息]`;
    else if (isType(this, 'File')) return `[文件]${this.name}`;
    else return `[不支持的消息类型#${this.type}]`;
}

/**
 * 来源型
 */
export interface Source extends SingleMessage {
    type: 'Source';
    /**
     * 消息id
     */
    id: number;
    /**
     * 时间戳
     */
    time: number;
}

/**
 * 引用回复型
 */
export interface Quote extends SingleMessage {
    type: 'Quote';
    /**
     * 引用消息id
     */
    id: number;
    /**
     * 群号
     */
    groupId: number;
    /**
     * 发送人QQ号
     */
    senderId: number;
    /**
     * 接收者账号
     */
    targetId: number;
    /**
     * 原始消息内容
     */
    origin: MessageChain | SingleMessage[]
}

/**
 * &#64;型
 */
export interface At extends SingleMessage {
    type: 'At';
    /**
     * 群成员QQ号
     */
    target: number;
    /**
     * At时显示的文字, 发送消息时无效, 自动使用群名片
     */
    display: string;
}

/**
 * &#64;全体成员型
 */
export interface AtAll extends SingleMessage {
    type: 'AtAll';
}

/**
 * 表情型
 */
export interface Face extends SingleMessage {
    type: 'Face';
    /**
     * 表情id
     */
    faceId: number;
    /**
     * 表情名称
     */
    name: string;
}

/**
 * 普通文本型
 */
export interface Plain extends SingleMessage {
    type: 'Plain';
    /**
     * 文本内容
     */
    text: string;
}

/**
 * 图片型
 */
export interface Image extends SingleMessage {
    type: 'Image';
    /**
     * 图片id
     */
    imageId: string;
    /**
     * 图片链接
     */
    url: string;
    /**
     * 图片文件路径
     */
    path?: string;
    /**
     * 图片Base64编码
     */
    base64?: string;
}

/**
 * 闪图型
 */
export interface FlashImage extends SingleMessage {
    type: 'FlashImage';
    /**
     * 图片id
     */
    imageId: string;
    /**
     * 图片链接
     */
    url: string;
    /**
     * 图片文件路径
     */
    path?: string;
    /**
     * 图片Base64编码
     */
    base64?: string;
}

/**
 * 语音型
 */
export interface Voice extends SingleMessage {
    type: 'Voice';
    /**
     * 语音id
     */
    voiceId: string;
    /**
     * 语音链接
     */
    url: string;
    /**
     * 语音文件路径
     */
    path?: string;
    /**
     * 语音Base64编码
     */
    base64?: string;
}

/**
 * XML型
 */
export interface Xml extends SingleMessage {
    type: 'Xml';
    /**
     * XML内容
     */
    xml: string;
}

/**
 * JSON型
 */
export interface Json extends SingleMessage {
    type: 'Json';
    /**
     * JSON内容
     */
    json: string;
}

/**
 * 小程序型
 */
export interface App extends SingleMessage {
    type: 'App';
    /**
     * 小程序内容(Json格式)
     */
    content: string;
}

/**
 * 戳一戳类型
 */
export type PokeType = 'Poke' | 'ShowLove' | 'Like' | 'Heartbroken' | 'SixSixSix' | 'FangDaZhao';

/**
 * 戳一戳型
 */
export interface Poke extends SingleMessage {
    type: 'Poke';
    /**
     * 戳一戳名称
     */
    name: PokeType;
}

/**
 * 骰子数值类型
 */
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 骰子型
 */
export interface Dice extends SingleMessage {
    type: 'Dice';
    /**
     * 骰子数值
     */
    value: DiceValue;
}

/**
 * 音乐分享型
 */
export interface MusicShare extends SingleMessage {
    type: 'MusicShare',
    /**
     * 音乐分享类型
     */
    kind: string;
    /**
     * 标题
     */
    title: string;
    /**
     * 概括
     */
    summary: string;
    /**
     * 跳转链接
     */
    jumpUrl: string;
    /**
     * 封面图片链接
     */
    pictureUrl: string;
    /**
     * 音乐播放链接
     */
    musicUrl: string;
    /**
     * 简介
     */
    brief: string;
}

/**
 * 合并转发结点
 */
export interface ForwardNode {
    /**
     * 发送人QQ号
     */
    senderId: number;
    /**
     * 发送时间戳
     */
    time: number;
    /**
     * 发送人名称
     */
    senderName: number;
    /**
     * 消息链
     */
    messageChain: MessageChain | SingleMessage[];
    /**
     * 消息id
     */
    sourceId: number;
}

/**
 * 合并转发型
 */
export interface Forward extends SingleMessage {
    type: 'Forward';
    /**
     * 结点列表
     */
    nodeList: ForwardNode[];
}

/**
 * 文件型
 */
export interface File extends SingleMessage {
    type: 'File';
    /**
     * 文件id
     */
    id: string;
    /**
     * 文件名
     */
    name: string;
    /**
     * 文件大小
     */
    size: number;
}

/**
 * mirai码型
 */
export interface MiraiCode extends SingleMessage {
    type: 'MiraiCode';
    /**
     * mirai码
     */
    code: string;
}

export type SingleMessageMap = {
    Source: Source,
    Quote: Quote,
    At: At,
    AtAll: AtAll,
    Face: Face,
    Plain: Plain,
    Image: Image,
    FlashImage: FlashImage,
    Voice: Voice,
    Xml: Xml,
    Json: Json,
    App: App,
    Poke: Poke,
    Dice: Dice,
    MusicShare: MusicShare,
    Forward: Forward,
    File: File,
    MiraiCode: MiraiCode
};

/**
 * 单一消息类型
 */
export type SingleMessageType = keyof SingleMessageMap;
