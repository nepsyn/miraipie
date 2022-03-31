import EventEmitter from 'events';
import {ReadStream} from 'fs';
import {getLogger, Logger} from 'log4js';
import {ConfigMeta, makeConfigs, UserConfigs} from './config';
import {
    AboutResponse,
    ApiResponse,
    ChatMessage,
    Event,
    FileInfoResponse,
    FileListResponse,
    FriendListResponse,
    GroupConfig,
    GroupConfigResponse,
    GroupListResponse,
    GroupMemberSettings,
    GroupMemberResponse,
    MemberListResponse,
    MessageFromIdResponse,
    NudgeKind,
    ProfileResponse,
    SendMessageResponse,
    SingleMessage,
    UploadFileResponse,
    UploadImageResponse,
    UploadVoiceResponse,
    VerifyResponse
} from './mirai';

type UploadType = 'friend' | 'group' | 'temp';

type MiraiApiHttpAdapterApiMethodOptions = {
    /** 获取插件相关信息 */
    getAbout(): Promise<AboutResponse>;

    /**
     * 通过messageId获取消息
     * @param messageId 消息id
     */
    getMessageFromId(messageId: number): Promise<MessageFromIdResponse>;

    /** 获取好友列表 */
    getFriendList(): Promise<FriendListResponse>;

    /** 获取群列表 */
    getGroupList(): Promise<GroupListResponse>;

    /**
     * 获取群成员列表
     * @param groupId 群号
     */
    getMemberList(groupId: number): Promise<MemberListResponse>;

    /** 获取Bot资料 */
    getBotProfile(): Promise<ProfileResponse>;

    /**
     * 获取好友资料
     * @param friendId 好友QQ号
     */
    getFriendProfile(friendId: number): Promise<ProfileResponse>;

    /**
     * 获取群成员资料
     * @param memberId 群成员QQ号
     * @param groupId 群号
     */
    getMemberProfile(memberId: number, groupId: number): Promise<ProfileResponse>;

    /**
     * 发送好友消息
     * @param friendId 好友QQ号
     * @param messageChain 消息链或消息数组
     * @param quoteMessageId 引用回复的消息id
     */
    sendFriendMessage(friendId: number, messageChain: SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;

    /**
     * 发送群消息
     * @param groupId 群号
     * @param messageChain 消息链或消息数组
     * @param quoteMessageId 引用回复的消息id
     */
    sendGroupMessage(groupId: number, messageChain: SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;

    /**
     * 发送群临时会话消息
     * @param memberId 群成员QQ号
     * @param groupId 群号
     * @param messageChain 消息链或消息数组
     * @param quoteMessageId 引用回复的消息id
     */
    sendTempMessage(memberId: number, groupId: number, messageChain: SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;

    /**
     * 发送头像戳一戳消息
     * @param targetId 戳一戳的目标
     * @param subjectId 戳一戳的接收人
     * @param kind 戳一戳的类型("Stranger" | "Friend" | "Group")
     */
    sendNudge(targetId: number, subjectId: number, kind: NudgeKind): Promise<ApiResponse>;

    /**
     * 撤回消息
     * @param messageId 消息id
     */
    recall(messageId: number): Promise<ApiResponse>;

    /**
     * 删除好友
     * @param friendId 好友QQ号
     */
    deleteFriend(friendId: number): Promise<ApiResponse>;

    /**
     * 禁言群成员
     * @param memberId 群成员QQ号
     * @param groupId 群号
     * @param time 禁言时长, 单位为秒, 最多30天, 默认为0
     */
    muteMember(memberId: number, groupId: number, time: number): Promise<ApiResponse>;

    /**
     * 解除群成员禁言
     * @param memberId 群成员QQ号
     * @param groupId 群号
     */
    unmuteMember(memberId: number, groupId: number): Promise<ApiResponse>;

    /**
     * 移除群成员
     * @param memberId 群成员QQ号
     * @param groupId 群号
     * @param message 信息
     */
    kickMember(memberId: number, groupId: number, message: string): Promise<ApiResponse>;

    /**
     * 退出群聊
     * @param groupId 群号
     */
    quitGroup(groupId: number): Promise<ApiResponse>;

    /**
     * 全体禁言
     * @param groupId 群号
     */
    muteAll(groupId: number): Promise<ApiResponse>;

    /**
     * 解除全体禁言
     * @param groupId 群号
     */
    unmuteAll(groupId: number): Promise<ApiResponse>;

    /**
     * 设置群精华消息
     * @param messageId 消息id
     */
    setEssence(messageId: number): Promise<ApiResponse>;

    /**
     * 获取群设置
     * @param groupId 群号
     */
    getGroupConfig(groupId: number): Promise<GroupConfigResponse>;

    /**
     * 修改群设置
     * @param groupId 群号
     * @param config 群设置
     */
    setGroupConfig(groupId: number, config: GroupConfig): Promise<ApiResponse>;

    /**
     * 获取群员设置
     * @param memberId 群成员QQ号
     * @param groupId 群号
     */
    getMemberInfo(memberId: number, groupId: number): Promise<GroupMemberResponse>;

    /**
     * 修改群员设置
     * @param memberId 群成员QQ号
     * @param groupId 群号
     * @param info 群员资料
     */
    setMemberInfo(memberId: number, groupId: number, info: GroupMemberSettings): Promise<ApiResponse>;

    /**
     * 设置管理员(机器人需要有群主权限)
     * @param memberId 群成员QQ号
     * @param groupId 群号
     * @param admin 是否设置为管理员
     * @since mirai-api-http v2.3.0
     */
    setMemberAdmin(memberId: number, groupId: number, admin: boolean): Promise<ApiResponse>;

    /**
     * 处理添加好友申请事件
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号, 可能为0
     * @param operate 操作类型 (0-同意|1-拒绝|2-拒绝并加入黑名单)
     * @param message 回复的信息
     */
    handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    /**
     * 处理用户入群申请事件
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号
     * @param operate 操作类型 (0-同意|1-拒绝|2-忽略|3-拒绝并加入黑名单|4-忽略并加入黑名单)
     * @param message 回复的信息
     */
    handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    /**
     * 处理Bot被邀请入群申请事件
     * @param eventId 事件id
     * @param fromId 邀请人(好友)QQ号
     * @param groupId 邀请进入的群号
     * @param operate 操作类型 (0-同意|1-拒绝)
     * @param message 回复的信息
     */
    handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    /**
     * 查看聊天文件列表
     * @param directoryId 文件夹id, 空串为根文件夹
     * @param directoryPath 文件夹路径
     * @param groupId 群号
     * @param friendId 好友QQ号
     * @param offset 分页偏移
     * @param size 分页大小
     * @param withDownloadInfo 是否携带下载信息, 额外请求, 无必要不要携带
     */
    getFileList(directoryId: string, directoryPath: string, groupId: number, friendId: number, offset: number, size: number, withDownloadInfo: boolean): Promise<FileListResponse>;

    /**
     * 获取聊天文件信息
     * @param fileId 文件id
     * @param path 文件路径
     * @param groupId 群号
     * @param friendId 好友QQ号
     * @param withDownloadInfo 是否携带下载信息, 额外请求, 无必要不要携带
     */
    getFileInfo(fileId: string, path: string, groupId: number, friendId: number, withDownloadInfo: boolean): Promise<FileInfoResponse>;

    /**
     * 创建聊天文件夹
     * @param parentDirectoryId 父文件夹id, 空串为根文件夹
     * @param parentDirectoryPath 父文件夹路径
     * @param directoryName 文件夹名
     * @param groupId 群号
     * @param friendId 好友QQ号
     */
    createFileDirectory(parentDirectoryId: string, parentDirectoryPath: string, directoryName: string, groupId: number, friendId: number): Promise<FileInfoResponse>;

    /**
     * 删除聊天文件
     * @param id 文件或文件夹id
     * @param path 文件或文件夹路径
     * @param groupId 群号
     * @param friendId 好友QQ号
     */
    deleteFile(id: string, path: string, groupId: number, friendId: number): Promise<ApiResponse>;

    /**
     * 移动聊天文件
     * @param id 文件或文件夹id
     * @param path 文件或文件夹路径
     * @param groupId 群号
     * @param friendId 好友QQ号
     * @param moveToDirectoryId 移动到文件夹id, 空串为根文件夹
     * @param moveToDirectoryPath 移动到文件夹路径, 空串为根文件夹
     */
    moveFile(id: string, path: string, groupId: number, friendId: number, moveToDirectoryId: string, moveToDirectoryPath: string): Promise<ApiResponse>;

    /**
     * 重命名聊天文件
     * @param id 文件或文件夹id
     * @param path 文件或文件夹路径
     * @param groupId 群号
     * @param friendId 好友QQ号
     * @param name 文件名
     */
    renameFile(id: string, path: string, groupId: number, friendId: number, name: string): Promise<ApiResponse>;

    /** 会话认证 */
    verify?(): Promise<VerifyResponse>;

    /**
     * 绑定QQ号
     * @param qq 服务的机器人QQ号
     */
    bind?(qq: number): Promise<ApiResponse>;

    /**
     * 释放Session
     * @param qq 服务的机器人QQ号
     */
    release?(qq: number): Promise<ApiResponse>;

    /**
     * 执行命令<br/>
     * console 支持以不同消息类型作为指令的参数, 执行命令需要以消息类型作为参数, 若执行纯文本的命令, 构建多个 Plain 格式的消息 console 会将第一个消息作为指令名, 后续消息作为参数 具体参考 <a href="https://docs.mirai.mamoe.net/console/Commands.html">console 文档</a>
     * @param command 命令与参数
     */
    executeCommand?(command: SingleMessage[]): Promise<ApiResponse>;

    /**
     * 注册命令
     * @param name 指令名
     * @param alias 指令别名
     * @param usage 使用说明
     * @param description 命令描述
     */
    registerCommand?(name: string, alias: string[], usage: string, description: string): Promise<ApiResponse>;

    /**
     * 图片文件上传
     * @param uploadType 上传类型("friend" 或 "group" 或 "temp")
     * @param imageData 文件内容
     */
    uploadImage(uploadType: UploadType, imageData: ReadStream): Promise<UploadImageResponse>;

    /**
     * 语音文件上传
     * @param uploadType 上传类型("friend" 或 "group" 或 "temp")
     * @param voiceData 文件内容
     */
    uploadVoice(uploadType: UploadType, voiceData: ReadStream): Promise<UploadVoiceResponse>;

    /**
     * 群文件上传
     * @param uploadType 上传类型(仅支持"group")
     * @param path 上传父文件夹的id, 空串为上传到根文件夹
     * @param fileData 文件内容
     * @param filename 文件名
     */
    uploadGroupFile(uploadType: UploadType, path: string, fileData: ReadStream, filename: string): Promise<UploadFileResponse>;

    /** 开启消息和事件监听 */
    listen(): Promise<any>;

    /** 关闭消息和事件监听 */
    stop();
}

type MiraiApiHttpAdapterHookOptions<MiraiApiHttpAdapterInstance> = {
    /** adapter安装完成hook */
    installed?: LifecycleHookListener<MiraiApiHttpAdapterInstance>;

    /** adapter卸载完成hook */
    uninstalled?: LifecycleHookListener<MiraiApiHttpAdapterInstance>;

    /** adapter选用hook */
    used?: LifecycleHookListener<MiraiApiHttpAdapterInstance>;

    /** adapter弃用hook */
    unused?: LifecycleHookListener<MiraiApiHttpAdapterInstance>;
}

type MiraiApiHttpAdapterMethodOptions<MiraiApiHttpAdapterInstance> = {
    [key: string]: (this: MiraiApiHttpAdapterInstance, ...args: any) => any;
};

export type MiraiApiHttpAdapterOption<C extends ConfigMeta, D extends object, M extends MiraiApiHttpAdapterMethodOptions<MiraiApiHttpAdapter<C, D, M>>> =
    {
        /** adapter id */
        id: string;

        /** 对mirai-api-http的支持版本 */
        supportVersion: string;

        /** 配置元定义 */
        configMeta?: C;

        /** adapter 额外数据 */
        data?: D;

        /** adapter 额外方法 */
        methods?: M;
    }
    & MiraiApiHttpAdapterHookOptions<MiraiApiHttpAdapter<C, D, M>>
    & MiraiApiHttpAdapterApiMethodOptions
    & ThisType<MiraiApiHttpAdapter<C, D, M>>;

type MessageReceivedListener<MiraiApiHttpAdapterInstance> = (this: MiraiApiHttpAdapterInstance, chatMessage: ChatMessage) => any;
type EventReceivedListener<MiraiApiHttpAdapterInstance> = (this: MiraiApiHttpAdapterInstance, event: Event) => any;
type LifecycleHookListener<MiraiApiHttpAdapterInstance> = (this: MiraiApiHttpAdapterInstance) => any;

export type MiraiApiHttpAdapter<C extends ConfigMeta = {}, D extends object = object, M extends MiraiApiHttpAdapterMethodOptions<MiraiApiHttpAdapter<C, D, M>> = {}> =
    {
        /** adapter id */
        readonly id: string;

        /** 对mirai-api-http的支持版本 */
        readonly supportVersion: string;

        /** 配置元定义 */
        readonly configMeta: C;

        /** 用户配置 */
        configs: UserConfigs<C>;

        /** 是否正在监听 */
        listening: boolean;

        /** logger */
        logger: Logger;

        /** 是否为 api adapter 标识, 恒为 true */
        readonly __isApiAdapter: true;

        addListener(e: 'message', listener: MessageReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        addListener(e: 'event', listener: EventReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        addListener(e: 'used', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        addListener(e: 'unused', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        addListener(e: 'installed', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        addListener(e: 'uninstalled', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        addListener(e: 'listen', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        addListener(e: 'stop', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);

        once(e: 'message', listener: MessageReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        once(e: 'event', listener: EventReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        once(e: 'used', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        once(e: 'unused', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        once(e: 'installed', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        once(e: 'uninstalled', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        once(e: 'listen', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        once(e: 'stop', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);

        on(e: 'message', listener: MessageReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        on(e: 'event', listener: EventReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        on(e: 'used', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        on(e: 'unused', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        on(e: 'installed', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        on(e: 'uninstalled', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        on(e: 'listen', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        on(e: 'stop', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);

        prependListener(e: 'message', listener: MessageReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        prependListener(e: 'event', listener: EventReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        prependListener(e: 'used', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependListener(e: 'unused', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependListener(e: 'installed', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependListener(e: 'uninstalled', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependListener(e: 'listen', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependListener(e: 'stop', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);

        prependOnceListener(e: 'message', listener: MessageReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        prependOnceListener(e: 'event', listener: EventReceivedListener<MiraiApiHttpAdapter<C, D, M>>);
        prependOnceListener(e: 'used', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependOnceListener(e: 'unused', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependOnceListener(e: 'installed', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependOnceListener(e: 'uninstalled', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependOnceListener(e: 'listen', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);
        prependOnceListener(e: 'stop', listener: LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>);

        emit(e: 'message', chatMessage: ChatMessage);
        emit(e: 'event', event: Event);
        emit(e: 'used');
        emit(e: 'unused');
        emit(e: 'installed');
        emit(e: 'uninstalled');
        emit(e: 'listen');
        emit(e: 'stop');

        listeners(e: 'message'): MessageReceivedListener<MiraiApiHttpAdapter<C, D, M>>[];
        listeners(e: 'event'): EventReceivedListener<MiraiApiHttpAdapter<C, D, M>>[];
        listeners(e: 'used'): LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>[];
        listeners(e: 'unused'): LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>[];
        listeners(e: 'installed'): LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>[];
        listeners(e: 'uninstalled'): LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>[];
        listeners(e: 'listen'): LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>[];
        listeners(e: 'stop'): LifecycleHookListener<MiraiApiHttpAdapter<C, D, M>>[];
    }
    & D & M
    & Readonly<MiraiApiHttpAdapterApiMethodOptions>
    & EventEmitter;

/**
 * 创建 api adapter
 * @param options adapter 选项
 */
export function makeApiAdapter<C extends ConfigMeta, D extends object, M extends MiraiApiHttpAdapterMethodOptions<MiraiApiHttpAdapter<C, D, M>>>(options: MiraiApiHttpAdapterOption<C, D, M>): MiraiApiHttpAdapter<C, D, M> {
    const {
        data = {},
        methods = {},
        configMeta = {},
        installed = undefined,
        uninstalled = undefined,
        used = undefined,
        unused = undefined,
        ...rest
    } = options;

    const adapter = Object.assign(new EventEmitter(), {
        ...data,
        ...methods,
        ...rest,
        configMeta: configMeta,
        configs: makeConfigs(options.configMeta),
        listening: false,
        logger: getLogger(`adapter:${options.id}`),
        __isApiAdapter: true
    });

    if (typeof installed === 'function') adapter.on('installed', () => installed.apply(adapter));
    if (typeof uninstalled === 'function') adapter.on('uninstalled', () => uninstalled.apply(adapter));
    if (typeof used === 'function') adapter.on('used', () => used.apply(adapter));
    if (typeof unused === 'function') adapter.on('unused', () => unused.apply(adapter));

    return adapter as MiraiApiHttpAdapter<C, D, M>;
}
