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

export function Quote(id: number, groupId: number, senderId: number, origin: MessageChain, targetId?: number): Quote {
    return {
        type: 'Quote',
        id, groupId, senderId, targetId, origin,
        toDisplayString, toMiraiCode
    };
}

export function At(target: number, display: string = ''): At {
    return {
        type: 'At',
        target, display,
        toDisplayString, toMiraiCode
    };
}

export function AtAll(): AtAll {
    return {
        type: 'AtAll',
        toDisplayString, toMiraiCode
    };
}

export function Face(faceId?: number, name?: string): Face {
    return {
        type: 'Face',
        faceId, name,
        toDisplayString, toMiraiCode
    };
}

export function Plain(text: string): Plain {
    return {
        type: 'Plain',
        text,
        toDisplayString, toMiraiCode
    };
}

export function Image(imageId?: string, url?: string, path?: string, base64?: string): Image {
    return {
        type: 'Image',
        imageId, url, path, base64,
        toDisplayString, toMiraiCode
    };
}

export function FlashImage(imageId?: string, url?: string, path?: string, base64?: string): FlashImage {
    return {
        type: 'FlashImage',
        imageId, url, path, base64,
        toDisplayString, toMiraiCode
    };
}

export function Voice(voiceId?: string, url?: string, path?: string, base64?: string): Voice {
    return {
        type: 'Voice',
        voiceId, url, path, base64,
        toDisplayString, toMiraiCode
    };
}

export function Xml(xml: string): Xml {
    return {
        type: 'Xml',
        xml,
        toDisplayString, toMiraiCode
    };
}

export function Json(json: string): Json {
    return {
        type: 'Json',
        json,
        toDisplayString, toMiraiCode
    };
}

export function App(content: string): App {
    return {
        type: 'App',
        content,
        toDisplayString, toMiraiCode
    };
}

export function Poke(name: PokeType): Poke {
    return {
        type: 'Poke',
        name,
        toDisplayString, toMiraiCode
    };
}

export function Dice(value: DiceValue): Dice {
    return {
        type: 'Dice',
        value,
        toDisplayString, toMiraiCode
    };
}

export function MusicShare(kind: string, title: string, summary: string, jumpUrl: string, pictureUrl: string, musicUrl: string, brief: string): MusicShare {
    return {
        type: 'MusicShare',
        kind, title, summary, jumpUrl, pictureUrl, musicUrl, brief,
        toDisplayString, toMiraiCode
    };
}

export function ForwardNode(senderId: number, time: number, senderName: number, messageChain: MessageChain, sourceId: number): ForwardNode {
    return {
        senderId, time, senderName, messageChain, sourceId
    };
}

export function ForwardMessage(nodeList: ForwardNode[]): ForwardMessage {
    return {
        type: 'ForwardMessage',
        nodeList,
        toDisplayString, toMiraiCode
    };
}

export function File(id: string, name: string, size: number): File {
    return {
        type: 'File',
        id, name, size,
        toDisplayString, toMiraiCode
    };
}

export function MiraiCode(code: string): MiraiCode {
    return {
        type: 'MiraiCode',
        code,
        toDisplayString, toMiraiCode
    };
}
