export interface SingleMessage {
    readonly type: SingleMessageType;

    toMiraiCode(): string;

    toDisplayString(): string;
}

export class MessageChain extends Array<SingleMessage> {
    [index: number]: SingleMessage;

    constructor(...messages: SingleMessage[]) {
        super();
        Object.setPrototypeOf(this, MessageChain.prototype);
        this.push(...messages.map((message) => ({...message, toDisplayString, toMiraiCode})));
    }

    static from(messageList: SingleMessage[]): MessageChain {
        return new MessageChain(...messageList);
    }

    get firstClientMessage(): SingleMessage | null {
        for (const message of this) {
            if (message.type !== 'Source') return message;
        }
        return null;
    }

    get f(): SingleMessage | null {
        return this.firstClientMessage;
    }

    get sourceId(): number | null {
        if (this.length > 0 && this[0].type === 'Source') return (this[0] as Source).id;
        else return null;
    }

    select<T extends SingleMessageType>(type: T): this {
        this.forEach((message, index) => {
            if (message.type !== type) this.splice(index, 1);
        });
        return this;
    }

    selected<T extends SingleMessageType>(type: T): MessageChain {
        return MessageChain.from(this.filter(message => message.type === type));
    }

    drop<T extends SingleMessageType>(type: T): this {
        for (let i = this.length - 1; i >= 0; i--) {
            if (this[i].type === type) this.splice(i, 1);
        }
        return this;
    }

    dropped<T extends SingleMessageType>(type: T): MessageChain {
        return MessageChain.from(this.filter(message => message.type !== type));
    }

    toDisplayString(): string {
        return this.dropped('Source').map(message => message.toDisplayString()).join('');
    }

    toMiraiCode(): string {
        return this.map(message => message.toMiraiCode()).join('');
    }
}

function isType<T extends SingleMessageType>(message: SingleMessage, type: T): message is SingleMessageMap[T] {
    return message.type === type;
}

function escape(raw: string): string {
    return raw
        .replace(/([\[\]:,\\])/g, '\\$1')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}

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
    else if (isType(this, 'ForwardMessage')) return `[mirai:forward:${this.nodeList.length}]`;
    else if (isType(this, 'File')) return `[mirai:file:${this.id},${this.name},${this.size}]`;
    else return `[mirai:unknown]`;
}

export function toDisplayString<T extends SingleMessage>(this: T): string {
    if (isType(this, 'Quote')) return `[回复]${this.origin.toString()}`;
    else if (isType(this, 'At')) return `@${this.display || this.target}`;
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
    else if (isType(this, 'ForwardMessage')) return `[转发消息]`;
    else if (isType(this, 'File')) return `[文件]${this.name}`;
    else return `[不支持的消息类型#${this.type}]`;
}

export interface Source extends SingleMessage {
    type: 'Source';
    id: number;
    time: number;
}

export interface Quote extends SingleMessage {
    type: 'Quote';
    id: number;
    groupId: number;
    senderId: number;
    targetId: number;
    origin: MessageChain
}

export interface At extends SingleMessage {
    type: 'At';
    target: number;
    display: string;
}

export interface AtAll extends SingleMessage {
    type: 'AtAll';
}

export interface Face extends SingleMessage {
    type: 'Face';
    faceId: number;
    name: string;
}

export interface Plain extends SingleMessage {
    type: 'Plain';
    text: string;
}

export interface Image extends SingleMessage {
    type: 'Image';
    imageId: string;
    url: string;
    path?: string;
    base64?: string;
}

export interface FlashImage extends SingleMessage {
    type: 'FlashImage';
    imageId: string;
    url: string;
    path?: string;
    base64?: string;
}

export interface Voice extends SingleMessage {
    type: 'Voice';
    voiceId: string;
    url: string;
    path?: string;
    base64?: string;
}

export interface Xml extends SingleMessage {
    type: 'Xml';
    xml: string;
}

export interface Json extends SingleMessage {
    type: 'Json';
    json: string;
}

export interface App extends SingleMessage {
    type: 'App';
    content: string;
}

export type PokeType = 'Poke' | 'ShowLove' | 'Like' | 'Heartbroken' | 'SixSixSix' | 'FangDaZhao';

export interface Poke extends SingleMessage {
    type: 'Poke';
    name: PokeType;
}

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface Dice extends SingleMessage {
    type: 'Dice';
    value: DiceValue;
}

export interface MusicShare extends SingleMessage {
    type: 'MusicShare',
    kind: string;
    title: string;
    summary: string;
    jumpUrl: string;
    pictureUrl: string;
    musicUrl: string;
    brief: string;
}

export interface ForwardNode {
    senderId: number;
    time: number;
    senderName: number;
    messageChain: MessageChain;
    sourceId: number;
}

export interface ForwardMessage extends SingleMessage {
    type: 'ForwardMessage';
    nodeList: ForwardNode[];
}

export interface File extends SingleMessage {
    type: 'File';
    id: string;
    name: string;
    size: number;
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
    ForwardMessage: ForwardMessage,
    File: File
};

export type SingleMessageType = keyof SingleMessageMap;
