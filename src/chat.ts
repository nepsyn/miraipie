import {MessageChain, Plain} from './message';
import {
    FileOverview,
    Friend,
    Group,
    GroupConfig,
    GroupMember,
    GroupPermission,
    Profile,
    ResponseCode,
    SingleMessage
} from './mirai';
import {MiraiPieApplication} from './miraipie';

/**
 * 聊天窗口, 用以模拟QQ客户端的聊天环境
 */
export abstract class Chat {
    /**
     * 当前窗口联系人
     */
    readonly contact: Friend | Group | GroupMember;
    /**
     * 当前窗口消息发送人(只有群聊时和 contact 不同)
     */
    readonly sender: Friend | GroupMember;
    /**
     * 聊天窗类型
     */
    readonly type: ChatType;

    /**
     * 撤回消息
     * @param messageId 消息id
     * @return 是否撤回成功
     */
    static async recall(messageId: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.recall(messageId);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 打开指定好友的聊天窗, 没有找到时返回null
     * @param friendId 好友QQ号
     * @since 1.1.15
     * @example
     * const chat = await Chat.findFriend(10000000);
     * await chat.send('Hello World!');
     */
    static async findFriend(friendId: number): Promise<FriendChat> {
        const resp = await MiraiPieApplication.instance.api.getFriendList();
        for (const friend of resp.data) {
            if (friend.id === friendId) return new FriendChat(friend);
        }
        return null;
    }

    /**
     * 打开指定群聊的聊天窗, 没有找到时返回null, 该聊天窗会将群主作为聊天窗的消息发送人
     * @param groupId 群号
     * @since 1.1.15
     * @example
     * const chat = await Chat.findGroup(20000000);
     * await chat.send('Hello World!');
     */
    static async findGroup(groupId: number): Promise<GroupChat> {
        const resp = await MiraiPieApplication.instance.api.getMemberList(groupId);
        if (resp.code === ResponseCode.Success) {
            for (const member of resp.data) {
                if (member.permission === 'OWNER') return new GroupChat(member);
            }
        }
        return null;
    }

    /**
     * 发送一条消息<br/>
     * 使用该方法向当前聊天对象发送一条消息
     * @param message 待发送的消息
     * @param quoteMessageId 引用回复的消息id
     * @return 已发送消息的消息id
     * @example
     * chat.send('Hello World!');  // 纯文本消息
     * chat.send(AtAll());  // 单个单一消息
     * chat.send([AtAll(), Plain('Hello World!')]);  // 单一消息列表
     * chat.send(MessageChain.from([AtAll(), Plain('Hello World!')]));  // 消息链对象
     * chat.send('Hello World!', 123456);  // 发送消息并引用回复消息
     */
    async send(message: string | SingleMessage | MessageChain | SingleMessage[], quoteMessageId?: number): Promise<number> {
        let messageChain = new MessageChain();
        if (typeof message === 'string') messageChain.push(Plain(message));
        else if (Array.isArray(message)) messageChain = MessageChain.from(message);
        else messageChain.push(message);

        return this._send(messageChain, quoteMessageId);
    }

    /**
     * 等待聊天窗口的下一条消息
     * @param timeout 超时时间, 单位毫秒, 默认为0(不超时)
     * @return 下一条消息的消息链
     * @example
     * async function kick(chat: Chat, someone: number) {
     *     await chat.send('真的要移出成员吗？');
     *     const next = await chat.nextMessage();
     *     const confirmString = next.selected('Plain').toDisplayString();
     *     if (confirmString === '是') {
     *         // 移出成员...
     *         await chat.send('已移出成员');
     *     }
     * }
     */
    abstract nextMessage(timeout?: number): Promise<MessageChain>;

    /**
     * 向当前聊天对象发送一个头像戳一戳
     * @param targetId 戳一戳行为目标QQ号
     * @return 是否发送成功
     */
    abstract sendNudge(targetId?: number): Promise<boolean>;

    /** 判断是否为好友聊天窗口 */
    isFriendChat(): this is FriendChat {
        return this.type === 'FriendChat';
    }

    /** 判断是否为群聊聊天窗口 */
    isGroupChat(): this is GroupChat {
        return this.type === 'GroupChat';
    }

    /** 判断是否为临时聊天窗口 */
    isTempChat(): this is TempChat {
        return this.type === 'TempChat';
    }

    /**
     * 发送消息
     * @param messageChain 消息链
     * @param quoteMessageId 引用回复消息id
     */
    protected abstract _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number>;
}

/**
 * 好友聊天窗
 */
export class FriendChat extends Chat {
    readonly sender: Friend;
    readonly type = 'FriendChat';

    async nextMessage(timeout?: number): Promise<MessageChain> {
        return new Promise((resolve, reject) => {
            let flag = true;
            MiraiPieApplication.instance.once('FriendMessage', (chatMessage) => {
                if (this.sender.id === chatMessage.sender.id) {
                    flag = false;
                    resolve(MessageChain.from(chatMessage.messageChain));
                }
            });
            if (timeout > 0) {
                setTimeout(() => {
                    if (flag) reject(new Error('等待消息已超时'));
                }, timeout);
            }
        });
    }

    async sendNudge(targetId?: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.sendNudge(targetId || this.contact.id, this.contact.id, 'Friend');
        return resp?.code === ResponseCode.Success;
    }

    protected async _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number> {
        const resp = await MiraiPieApplication.instance.api.sendFriendMessage(this.contact.id, messageChain, quoteMessageId);
        return resp?.messageId;
    }

    constructor(public readonly contact: Friend) {
        super();
        this.sender = contact;
    }

    /**
     * 获取聊天对象的个人资料
     * @return 聊天对象的个人资料
     */
    async getProfile(): Promise<Profile> {
        const resp = await MiraiPieApplication.instance.api.getFriendProfile(this.contact.id);
        return resp?.data;
    }

    /**
     * 删除好友(慎用)
     * @return 是否删除成功
     */
    async delete(): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.deleteFriend(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }
}

/**
 * 群聊聊天窗
 */
export class GroupChat extends Chat {
    readonly contact: Group;
    readonly type = 'GroupChat';

    async nextMessage(timeout?: number): Promise<MessageChain> {
        return new Promise((resolve, reject) => {
            let flag = true;
            MiraiPieApplication.instance.once('GroupMessage', (chatMessage) => {
                if (this.sender.id === chatMessage.sender.id && this.contact.id === (chatMessage.sender as GroupMember).group.id) {
                    flag = false;
                    resolve(MessageChain.from(chatMessage.messageChain));
                }
            });
            if (timeout > 0) {
                setTimeout(() => {
                    if (flag) reject(new Error('等待消息已超时'));
                }, timeout);
            }
        });
    }

    async sendNudge(targetId: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.sendNudge(targetId, this.contact.id, 'Group');
        return resp?.code === ResponseCode.Success;
    }

    protected async _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number> {
        const resp = await MiraiPieApplication.instance.api.sendGroupMessage(this.contact.id, messageChain, quoteMessageId);
        return resp?.messageId;
    }

    constructor(public readonly sender: GroupMember) {
        super();
        this.contact = sender.group;
    }

    /** 机器人在本群权限 */
    get permission(): GroupPermission {
        return this.contact.permission;
    }

    /** 通过群聊对象构造群聊天窗口 */
    static from() {

    }

    /**
     * 设置群精华消息
     * @param messageId 消息id
     * @return 是否设置成功
     */
    static async setEssence(messageId: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.setEssence(messageId);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 等待下一条群消息, 无论发送人是谁
     * @since 1.1.14
     * @param timeout 超时时间, 单位毫秒, 默认为0(不超时)
     */
    async nextGroupMessage(timeout?: number): Promise<MessageChain> {
        return new Promise((resolve, reject) => {
            let flag = true;
            MiraiPieApplication.instance.once('GroupMessage', (chatMessage) => {
                if (this.contact.id === (chatMessage.sender as GroupMember).group.id) {
                    flag = false;
                    resolve(MessageChain.from(chatMessage.messageChain));
                }
            });
            if (timeout > 0) {
                setTimeout(() => {
                    if (flag) reject(new Error('等待消息已超时'));
                }, timeout);
            }
        });
    }

    /**
     * 获取群成员列表
     * @return 群成员列表
     */
    async getMemberList(): Promise<GroupMember[]> {
        const resp = await MiraiPieApplication.instance.api.getMemberList(this.contact.id);
        return resp?.data;
    }

    /**
     * 获取成员的个人资料
     * @param memberId 成员QQ号(默认为当前消息发送人)
     * @return 聊天对象的个人资料
     */
    async getProfile(memberId?: number): Promise<Profile> {
        const resp = await MiraiPieApplication.instance.api.getMemberProfile(memberId || this.sender.id, this.contact.id);
        return resp?.data;
    }

    /**
     * 获取成员信息
     * @param memberId 成员QQ号(默认为当前消息发送人)
     * @return 成员信息
     */
    async getInfo(memberId?: number): Promise<GroupMember> {
        const resp = await MiraiPieApplication.instance.api.getMemberInfo(memberId || this.sender.id, this.contact.id);
        return resp?.data;
    }

    /**
     * 修改成员信息
     * @param info 成员信息
     * @param memberId 成员QQ号(默认为当前消息发送人)
     * @return 是否修改成功
     */
    async setInfo(info: GroupMember, memberId?: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.setMemberInfo(memberId || this.sender.id, this.contact.id, info);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 禁言成员
     * @param time 禁言时长(秒)
     * @param memberId 成员QQ号(默认为当前消息发送人)
     * @return 是否禁言成功
     */
    async mute(time: number = 60, memberId?: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.muteMember(memberId || this.sender.id, this.contact.id, time);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 取消禁言成员
     * @param memberId 成员QQ号(默认为当前消息发送人)
     * @return 是否取消成功
     */
    async unmute(memberId?: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.unmuteMember(memberId || this.sender.id, this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 踢出成员
     * @param message 留言
     * @param memberId 成员QQ号(默认为当前消息发送人)
     * @return 是否踢出成功
     */
    async kick(message: string = '', memberId?: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.kickMember(memberId || this.sender.id, this.contact.id, message);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 退出群聊
     * @return 是否退出成功
     */
    async quit(): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.quitGroup(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 全体禁言
     * @return 是否禁言成功
     */
    async muteAll(): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.muteAll(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 取消全体禁言
     * @return 是否取消成功
     */
    async unmuteAll(): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.unmuteAll(this.contact.id);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 获取群设置
     * @return 群设置
     */
    async getConfig(): Promise<GroupConfig> {
        const resp = await MiraiPieApplication.instance.api.getGroupConfig(this.contact.id);
        return resp?.data;
    }

    /**
     * 修改群设置
     * @param config 群设置
     * @return 是否修改成功
     */
    async setConfig(config: GroupConfig): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.setGroupConfig(this.contact.id, config);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 设置或取消管理员
     * @since 1.1.14
     * @param admin 是否为管理员
     * @param memberId 成员QQ号(默认为当前消息发送人)
     * @return 是否操作成功
     */
    async setAdmin(admin: boolean = true, memberId?: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.setMemberAdmin(memberId || this.sender.id, this.contact.id, admin);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 获取群文件列表
     * @param directoryPathOrId 文件夹路径或id
     * @param offset 分页偏移
     * @param size 分页大小
     * @return 文件列表
     */
    async getFileList(directoryPathOrId: string = '', offset: number = 0, size: number = 100): Promise<FileOverview[]> {
        const resp = await MiraiPieApplication.instance.api.getFileList(directoryPathOrId, directoryPathOrId, this.contact.id, null, offset, size, true);
        return resp?.data;
    }

    /**
     * 获取文件详情
     * @param pathOrId 文件路径或id
     * @return 文件概览
     */
    async getFileInfo(pathOrId: string): Promise<FileOverview> {
        const resp = await MiraiPieApplication.instance.api.getFileInfo(pathOrId, pathOrId, this.contact.id, null, true);
        return resp?.data;
    }

    /**
     * 创建群文件夹
     * @param directoryName 文件夹名称
     * @param parentDirectoryPathOrId 父文件夹路径或id
     * @return 文件夹概览
     */
    async createDirectory(directoryName: string, parentDirectoryPathOrId: string = ''): Promise<FileOverview> {
        const resp = await MiraiPieApplication.instance.api.createFileDirectory(parentDirectoryPathOrId, parentDirectoryPathOrId, directoryName, this.contact.id, null);
        return resp?.data;
    }

    /**
     * 删除群文件
     * @param pathOrId 文件路径或id
     * @return 是否删除成功
     */
    async deleteFile(pathOrId: string): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.deleteFile(pathOrId, pathOrId, this.contact.id, null);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 移动群文件
     * @param pathOrId 文件路径或id
     * @param moveToDirectoryPathOrId 移动到文件夹路径或id
     * @return 是否移动成功
     */
    async moveFile(pathOrId: string, moveToDirectoryPathOrId: string = null): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.moveFile(pathOrId, pathOrId, this.contact.id, null, moveToDirectoryPathOrId, moveToDirectoryPathOrId);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 重命名群文件
     * @param pathOrId 文件路径或id
     * @param name 文件名
     * @return 是否重命名成功
     */
    async renameFile(pathOrId: string, name: string): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.renameFile(pathOrId, pathOrId, this.contact.id, null, name);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 打开私聊窗口
     * @since 1.1.14
     * @return 当前消息发送人的私聊窗口
     */
    openTempChat(): TempChat {
        return new TempChat(this.sender);
    }
}

/**
 * 临时消息聊天窗
 */
export class TempChat extends Chat {
    readonly sender: GroupMember;
    readonly type = 'TempChat';

    async nextMessage(timeout?: number): Promise<MessageChain> {
        return new Promise((resolve, reject) => {
            let flag = true;
            MiraiPieApplication.instance.once('TempMessage', (chatMessage) => {
                if (this.sender.id === chatMessage.sender.id) {
                    flag = false;
                    resolve(MessageChain.from(chatMessage.messageChain));
                }
            });
            if (timeout > 0) {
                setTimeout(() => {
                    if (flag) reject(new Error('等待消息已超时'));
                }, timeout);
            }
        });
    }

    async sendNudge(targetId?: number): Promise<boolean> {
        const resp = await MiraiPieApplication.instance.api.sendNudge(targetId || this.contact.id, this.contact.id, 'Stranger');
        return resp?.code === ResponseCode.Success;
    }

    protected async _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number> {
        const resp = await MiraiPieApplication.instance.api.sendTempMessage(this.contact.id, this.contact.group.id, messageChain, quoteMessageId);
        return resp?.messageId;
    }

    constructor(public readonly contact: GroupMember) {
        super();
        this.sender = contact;
    }

    /**
     * 获取聊天对象的个人资料
     * @return 聊天对象的个人资料
     */
    async getProfile(): Promise<Profile> {
        const resp = await MiraiPieApplication.instance.api.getMemberProfile(this.contact.group.id, this.contact.id);
        return resp?.data;
    }
}

/** 聊天窗口类型映射 */
export type ChatTypeMap = {
    FriendChat: FriendChat,
    GroupChat: GroupChat,
    TempChat: TempChat
};

/** 聊天窗口类型 */
export type ChatType = keyof ChatTypeMap;
