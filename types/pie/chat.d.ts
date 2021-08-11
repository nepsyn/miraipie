import { Contact, FileOverview, Friend, Group, GroupConfig, GroupMember, GroupPermission, MessageChain, Profile, SingleMessage } from '../mirai';
/**
 * 聊天窗类型
 */
declare type ChatWindowType = 'FriendChatWindow' | 'GroupChatWindow' | 'TempChatWindow';
/**
 * 聊天窗口, 用以模拟QQ客户端的聊天环境
 */
export declare abstract class ChatWindow {
    /**
     * 当前窗口联系人
     */
    readonly contact: Contact;
    /**
     * 聊天窗类型
     */
    readonly type: ChatWindowType;
    /**
     * 发送消息
     * @param messageChain 消息链
     * @param quoteMessageId 引用回复消息id
     */
    protected abstract _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number>;
    /**
     * 发送一条消息<br/>
     * 使用该方法向当前聊天对象发送一条消息
     * @param message 待发送的消息
     * @param quoteMessageId 引用回复的消息id
     * @return
     * 已发送消息的消息id
     * @example
     * window.send('Hello World!');  // 纯文本消息
     * window.send(AtAll());  // 单个单一消息
     * window.send([AtAll(), Plain('Hello World!')]);  // 单一消息列表
     * window.send(new MessageChain(AtAll(), Plain('Hello World!')));  // 消息链对象
     * window.send('Hello World!', 123456);  // 发送消息并引用回复消息
     */
    send(message: string | SingleMessage | MessageChain | SingleMessage[], quoteMessageId?: number): Promise<number>;
    /**
     * 向当前聊天对象发送一个头像戳一戳
     * @param targetId 戳一戳行为目标QQ号
     * @return 是否发送成功
     */
    abstract sendNudge(targetId?: number): Promise<boolean>;
    /**
     * 撤回消息
     * @param messageId 消息id
     * @return 是否撤回成功
     */
    recall(messageId: number): Promise<boolean>;
}
/**
 * 好友聊天窗
 */
export declare class FriendChatWindow extends ChatWindow {
    readonly contact: Friend;
    readonly type = "FriendChatWindow";
    constructor(contact: Friend);
    protected _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number>;
    sendNudge(targetId?: number): Promise<boolean>;
    /**
     * 获取聊天对象的个人资料
     * @return 聊天对象的个人资料
     */
    getProfile(): Promise<Profile>;
    /**
     * 删除好友(慎用)
     * @return 是否删除成功
     */
    delete(): Promise<boolean>;
}
/**
 * 群聊聊天窗
 */
export declare class GroupChatWindow extends ChatWindow {
    readonly contact: Group;
    readonly type = "GroupChatWindow";
    constructor(contact: Group);
    /**
     * 机器人在本群权限
     */
    get permission(): GroupPermission;
    protected _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number>;
    sendNudge(targetId: number): Promise<boolean>;
    /**
     * 禁言群成员
     * @param memberId 群成员QQ号
     * @param time 禁言时长(秒)
     * @return 是否禁言成功
     */
    mute(memberId: number, time?: number): Promise<boolean>;
    /**
     * 取消禁言群成员
     * @param memberId 群成员QQ号
     * @return 是否取消成功
     */
    unmute(memberId: number): Promise<boolean>;
    /**
     * 踢出群成员
     * @param memberId 群成员QQ号
     * @param message 留言
     * @return 是否踢出成功
     */
    kick(memberId: number, message?: string): Promise<boolean>;
    /**
     * 退出群聊
     * @return 是否退出成功
     */
    quit(): Promise<boolean>;
    /**
     * 全体禁言
     * @return 是否禁言成功
     */
    muteAll(): Promise<boolean>;
    /**
     * 取消全体禁言
     * @return 是否取消成功
     */
    unmuteAll(): Promise<boolean>;
    /**
     * 设置群精华消息
     * @param messageId 消息id
     * @return 是否设置成功
     */
    static setEssence(messageId: number): Promise<boolean>;
    /**
     * 获取群设置
     * @return 群设置
     */
    getConfig(): Promise<GroupConfig>;
    /**
     * 修改群设置
     * @param config 群设置
     * @return 是否修改成功
     */
    setConfig(config: GroupConfig): Promise<boolean>;
    /**
     * 获取群文件列表
     * @param path 文件夹路径
     * @param offset 分页偏移
     * @param size 分页大小
     * @return 文件列表
     */
    getFileList(path?: string, offset?: number, size?: number): Promise<FileOverview[]>;
    /**
     * 获取文件详情
     * @param fileId 文件id
     * @return 文件概览
     */
    getFileInfo(fileId: string): Promise<FileOverview>;
    /**
     * 创建群文件夹
     * @param directoryName 文件夹名称
     * @param parentFileId 父文件夹id
     * @return 文件夹概览
     */
    createDirectory(directoryName: string, parentFileId?: string): Promise<FileOverview>;
    /**
     * 删除群文件
     * @param fileId 文件id
     * @return 是否删除成功
     */
    deleteFile(fileId: string): Promise<boolean>;
    /**
     * 移动群文件
     * @param fileId 文件id
     * @param moveToDirectoryId 移动到文件夹id
     * @return 是否移动成功
     */
    moveFile(fileId: string, moveToDirectoryId?: string): Promise<boolean>;
    /**
     * 重命名群文件
     * @param fileId 文件id
     * @param name 文件名
     * @return 是否重命名成功
     */
    renameFile(fileId: string, name: string): Promise<boolean>;
}
/**
 * 临时消息聊天窗
 */
export declare class TempChatWindow extends ChatWindow {
    readonly contact: GroupMember;
    readonly type = "TempChatWindow";
    constructor(contact: GroupMember);
    protected _send(messageChain: MessageChain, quoteMessageId?: number): Promise<number>;
    sendNudge(targetId?: number): Promise<boolean>;
    /**
     * 获取聊天对象的个人资料
     * @return 聊天对象的个人资料
     */
    getProfile(): Promise<Profile>;
    /**
     * 获取群成员信息
     * @return 群成员信息
     */
    getInfo(): Promise<GroupMember>;
    /**
     * 修改群成员信息
     * @param info 群成员信息
     * @return 是否修改成功
     */
    setInfo(info: GroupMember): Promise<boolean>;
}
export {};
