import {MiraiPieApp, Plain} from '.';
import {
    Contact,
    FileOverview,
    Friend,
    Group,
    GroupConfig,
    GroupMember,
    GroupPermission,
    MessageChain,
    Profile,
    ResponseCode,
    SingleMessage
} from '../mirai';

type ChatWindowType = 'FriendChatWindow' | 'GroupChatWindow' | 'TempChatWindow';


export abstract class ChatWindow {
    readonly contact: Contact;
    readonly type: ChatWindowType;

    protected abstract _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number>;

    send(text: string, quoteMessageId?: number): Promise<number>;
    send(message: SingleMessage, quoteMessageId?: number): Promise<number>;
    send(messageChain: MessageChain | SingleMessage[], quoteMessageId: number): Promise<number>;
    async send(message: any, quoteMessageId?: number): Promise<number> {
        let messageChain = new MessageChain();
        if (typeof message === 'string') messageChain.push(Plain(message));
        else if (Array.isArray(message)) messageChain = MessageChain.from(message);
        else messageChain.push(message);

        return this._send(messageChain, quoteMessageId);
    }

    abstract sendNudge(subjectId?: number): Promise<boolean>;

    async recall(messageId: number): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.recall(messageId);
        return resp?.code === ResponseCode.Success;
    }
}

export class FriendChatWindow extends ChatWindow {
    readonly type = 'FriendChatWindow';

    constructor(public readonly contact: Friend) {
        super();
    }

    protected async _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number> {
        const resp = await MiraiPieApp.instance.adapter.sendFriendMessage(this.contact.id, messageChain, quoteMessageId);
        const messageId = resp?.messageId;
        if (messageId) MiraiPieApp.instance.db?.saveMessage(messageId, messageChain, MiraiPieApp.instance.id, this.contact.id, 'FriendMessage');
        return messageId;
    }

    async sendNudge(subjectId?: number): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.sendNudge(this.contact.id, subjectId || this.contact.id, 'Friend');
        return resp?.code === ResponseCode.Success;
    }

    async getProfile(): Promise<Profile> {
        const resp = await MiraiPieApp.instance.adapter.getFriendProfile(this.contact.id);
        return resp?.data;
    }

    async delete(): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.deleteFriend(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }
}

export class GroupChatWindow extends ChatWindow {
    readonly type = 'GroupChatWindow';

    constructor(public readonly contact: Group) {
        super();
    }

    get permission(): GroupPermission {
        return this.contact.permission;
    }

    protected async _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number> {
        const resp = await MiraiPieApp.instance.adapter.sendGroupMessage(this.contact.id, messageChain, quoteMessageId);
        const messageId = resp?.messageId;
        if (messageId) MiraiPieApp.instance.db?.saveMessage(messageId, messageChain, MiraiPieApp.instance.id, this.contact.id, 'GroupMessage');
        return messageId;
    }

    async sendNudge(subjectId: number): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.sendNudge(this.contact.id, subjectId, 'Group');
        return resp?.code === ResponseCode.Success;
    }

    async mute(memberId: number, time: number = 60): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.muteMember(memberId, this.contact.id, time);
        return resp?.code === ResponseCode.Success;
    }

    async unmute(memberId: number): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.unmuteMember(memberId, this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    async kick(memberId: number, message: string = ''): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.kickMember(memberId, this.contact.id, message);
        return resp?.code === ResponseCode.Success;
    }

    async quit(): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.quitGroup(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    async muteAll(): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.muteAll(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    async unmuteAll(): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.unmuteAll(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    async setEssence(messageId: number): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.setEssence(messageId);
        return resp?.code === ResponseCode.Success;
    }

    async getConfig(): Promise<GroupConfig> {
        const resp = await MiraiPieApp.instance.adapter.getGroupConfig(this.contact.id);
        return resp?.data;
    }

    async setConfig(config: GroupConfig): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.setGroupConfig(this.contact.id, config);
        return resp?.code === ResponseCode.Success;
    }

    async getFileList(path: string = ''): Promise<FileOverview[]> {
        const resp = await MiraiPieApp.instance.adapter.getGroupFileList(path, this.contact.id);
        return resp?.data;
    }

    async getFileInfo(fileId: string): Promise<FileOverview> {
        const resp = await MiraiPieApp.instance.adapter.getGroupFileInfo(fileId, this.contact.id);
        return resp?.data;
    }

    async createDirectory(directoryName: string, parentFileId: string = ''): Promise<FileOverview> {
        const resp = await MiraiPieApp.instance.adapter.createGroupFileDirectory(parentFileId, directoryName, this.contact.id);
        return resp?.data;
    }

    async deleteFile(fileId: string): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.deleteGroupFile(fileId, this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    async moveFile(fileId: string, moveToDirectoryId: string = ''): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.moveGroupFile(fileId, this.contact.id, moveToDirectoryId);
        return resp?.code === ResponseCode.Success;
    }

    async renameFile(fileId: string, name: string): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.moveGroupFile(fileId, this.contact.id, name);
        return resp?.code === ResponseCode.Success;
    }
}

export class TempChatWindow extends ChatWindow {
    readonly type = 'TempChatWindow';

    constructor(public readonly contact: GroupMember) {
        super();
    }

    protected async _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number> {
        const resp = await MiraiPieApp.instance.adapter.sendTempMessage(this.contact.id, this.contact.group.id, messageChain, quoteMessageId);
        const messageId = resp?.messageId;
        if (messageId) MiraiPieApp.instance.db?.saveMessage(messageId, messageChain, MiraiPieApp.instance.id, this.contact.id, 'TempMessage');
        return messageId;
    }

    async sendNudge(subjectId?: number): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.sendNudge(this.contact.id, subjectId || this.contact.id, 'Stranger');
        return resp?.code === ResponseCode.Success;
    }

    async getProfile(): Promise<Profile> {
        const resp = await MiraiPieApp.instance.adapter.getMemberProfile(this.contact.group.id, this.contact.id);
        return resp?.data;
    }

    async getInfo(): Promise<GroupMember> {
        const resp = await MiraiPieApp.instance.adapter.getMemberInfo(this.contact.id, this.contact.group.id);
        return resp?.data;
    }

    async setInfo(info: GroupMember): Promise<boolean> {
        const resp = await MiraiPieApp.instance.adapter.setMemberInfo(this.contact.id, this.contact.group.id, info);
        return resp?.code === ResponseCode.Success;
    }
}
