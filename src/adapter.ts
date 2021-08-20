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
    GroupMember,
    GroupMemberResponse,
    MemberListResponse,
    MessageFromIdResponse,
    NudgeKind,
    ProfileResponse,
    SendMessageResponse, SingleMessage,
    UploadFileResponse,
    UploadImageResponse,
    UploadVoiceResponse,
    VerifyResponse
} from './mirai';
import {Pie} from './pie';

type UploadType = 'friend' | 'group' | 'temp';

type MiraiApiHttpAdapterMethodOptions = {
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
    setMemberInfo(memberId: number, groupId: number, info: GroupMember): Promise<ApiResponse>;

    /**
     * 处理添加好友申请事件
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号, 可能为0
     * @param operate 操作类型
     * @param message 回复的信息
     */
    handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    /**
     * 处理用户入群申请事件
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号
     * @param operate 操作类型
     * @param message 回复的信息
     */
    handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    /**
     * 处理Bot被邀请入群申请事件
     * @param eventId 事件id
     * @param fromId 邀请人(好友)QQ号
     * @param groupId 邀请进入的群号
     * @param operate 操作类型
     * @param message 回复的信息
     */
    handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    /**
     * 查看群文件列表
     * @param parentFileId 文件夹id, 空串为根目录
     * @param groupId 群号
     * @param offset 分页偏移
     * @param size 分页大小
     * @param withDownloadInfo 是否携带下载信息, 额外请求, 无必要不要携带
     */
    getGroupFileList(parentFileId: string, groupId: number, offset?: number, size?: number, withDownloadInfo?: boolean): Promise<FileListResponse>;

    /**
     * 获取群文件信息
     * @param fileId 文件id
     * @param groupId 群号
     * @param withDownloadInfo 是否携带下载信息, 额外请求, 无必要不要携带
     */
    getGroupFileInfo(fileId: string, groupId: number, withDownloadInfo?: boolean): Promise<FileInfoResponse>;

    /**
     * 创建群文件夹
     * @param parentFileId 父目录id, 空串为根目录
     * @param directoryName 文件夹名
     * @param groupId 群号
     */
    createGroupFileDirectory(parentFileId: string, directoryName: string, groupId: number): Promise<FileInfoResponse>;

    /**
     * 删除群文件
     * @param fileId 文件id
     * @param groupId 群号
     */
    deleteGroupFile(fileId: string, groupId: number): Promise<ApiResponse>;

    /**
     * 移动群文件
     * @param fileId 文件id
     * @param groupId 群号
     * @param moveToDirectoryId 移动到文件夹id, 空串为根目录
     */
    moveGroupFile(fileId: string, groupId: number, moveToDirectoryId: string): Promise<ApiResponse>;

    /**
     * 重命名群文件
     * @param fileId 文件id
     * @param groupId 群号
     * @param name 文件名
     */
    renameGroupFile(fileId: string, groupId: number, name: string): Promise<ApiResponse>;

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
     * @param uploadType 上传类型(仅支持"group")
     * @param voiceData 文件内容
     */
    uploadVoice(uploadType: UploadType, voiceData: ReadStream): Promise<UploadVoiceResponse>;

    /**
     * 群文件上传
     * @param uploadType 上传类型(仅支持"group")
     * @param path 上传目录的id, 空串为上传到根目录
     * @param fileData 文件内容
     */
    uploadGroupFile(uploadType: UploadType, path: string, fileData: ReadStream): Promise<UploadFileResponse>;

    /** 开启消息和事件监听 */
    listen(): Promise<any>;

    /** 关闭消息和事件监听 */
    stop();
}

type MiraiApiHttpAdapterHookOptions = {
    /** adapter安装完成hook */
    installed?: LifecycleHookListener;

    /** adapter卸载完成hook */
    uninstalled?: LifecycleHookListener;

    /** adapter选用hook */
    used?: LifecycleHookListener;

    /** adapter弃用hook */
    unused?: LifecycleHookListener;
}

interface MethodsOption {
    [key: string]: (this: Pie, ...args: any) => any;
}

export type MiraiApiHttpAdapterOption<C extends ConfigMeta, D extends {}, M extends MethodsOption> =
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
    & MiraiApiHttpAdapterHookOptions
    & MiraiApiHttpAdapterMethodOptions
    & ThisType<MiraiApiHttpAdapter<C, D, M>>;

type MessageReceivedListener = (chatMessage: ChatMessage) => any;
type EventReceivedListener = (event: Event) => any;
type LifecycleHookListener = () => any;

export type MiraiApiHttpAdapter<C extends ConfigMeta = {}, D extends {} = {}, M extends MethodsOption = {}> =
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

        addListener(e: 'message', listener: MessageReceivedListener);
        addListener(e: 'event', listener: EventReceivedListener);
        addListener(e: 'used', listener: LifecycleHookListener);
        addListener(e: 'unused', listener: LifecycleHookListener);
        addListener(e: 'installed', listener: LifecycleHookListener);
        addListener(e: 'uninstalled', listener: LifecycleHookListener);
        addListener(e: 'listen', listener: LifecycleHookListener);
        addListener(e: 'stop', listener: LifecycleHookListener);

        once(e: 'message', listener: MessageReceivedListener);
        once(e: 'event', listener: EventReceivedListener);
        once(e: 'used', listener: LifecycleHookListener);
        once(e: 'unused', listener: LifecycleHookListener);
        once(e: 'installed', listener: LifecycleHookListener);
        once(e: 'uninstalled', listener: LifecycleHookListener);
        once(e: 'listen', listener: LifecycleHookListener);
        once(e: 'stop', listener: LifecycleHookListener);

        on(e: 'message', listener: MessageReceivedListener);
        on(e: 'event', listener: EventReceivedListener);
        on(e: 'used', listener: LifecycleHookListener);
        on(e: 'unused', listener: LifecycleHookListener);
        on(e: 'installed', listener: LifecycleHookListener);
        on(e: 'uninstalled', listener: LifecycleHookListener);
        on(e: 'listen', listener: LifecycleHookListener);
        on(e: 'stop', listener: LifecycleHookListener);

        prependListener(e: 'message', listener: MessageReceivedListener);
        prependListener(e: 'event', listener: EventReceivedListener);
        prependListener(e: 'used', listener: LifecycleHookListener);
        prependListener(e: 'unused', listener: LifecycleHookListener);
        prependListener(e: 'installed', listener: LifecycleHookListener);
        prependListener(e: 'uninstalled', listener: LifecycleHookListener);
        prependListener(e: 'listen', listener: LifecycleHookListener);
        prependListener(e: 'stop', listener: LifecycleHookListener);

        prependOnceListener(e: 'message', listener: MessageReceivedListener);
        prependOnceListener(e: 'event', listener: EventReceivedListener);
        prependOnceListener(e: 'used', listener: LifecycleHookListener);
        prependOnceListener(e: 'unused', listener: LifecycleHookListener);
        prependOnceListener(e: 'installed', listener: LifecycleHookListener);
        prependOnceListener(e: 'uninstalled', listener: LifecycleHookListener);
        prependOnceListener(e: 'listen', listener: LifecycleHookListener);
        prependOnceListener(e: 'stop', listener: LifecycleHookListener);

        emit(e: 'message', chatMessage: ChatMessage);
        emit(e: 'event', event: Event);
        emit(e: 'used');
        emit(e: 'unused');
        emit(e: 'installed');
        emit(e: 'uninstalled');
        emit(e: 'listen');
        emit(e: 'stop');

        listeners(e: 'message'): MessageReceivedListener[];
        listeners(e: 'event'): EventReceivedListener[];
        listeners(e: 'used'): LifecycleHookListener[];
        listeners(e: 'unused'): LifecycleHookListener[];
        listeners(e: 'installed'): LifecycleHookListener[];
        listeners(e: 'uninstalled'): LifecycleHookListener[];
        listeners(e: 'listen'): LifecycleHookListener[];
        listeners(e: 'stop'): LifecycleHookListener[];
    }
    & D & M
    & Readonly<MiraiApiHttpAdapterMethodOptions>
    & EventEmitter;

/**
 * 创建 api adapter
 * @param options adapter 选项
 */
export function makeApiAdapter<C extends ConfigMeta, D extends {}, M extends MethodsOption>(options: MiraiApiHttpAdapterOption<C, D, M>): MiraiApiHttpAdapter<C, D, M> {
    const {data, methods, configMeta, installed, uninstalled, used, unused, ...rest} = options;

    const adapter = Object.assign(new EventEmitter(), {
        ...(data || {}),
        ...(methods || {}),
        ...rest,
        configMeta: configMeta || {},
        configs: makeConfigs(options.configMeta),
        listening: false,
        logger: getLogger('adapter'),
        __isApiAdapter: true
    });

    if (typeof installed === 'function') adapter.on('installed', () => installed.apply(adapter));
    if (typeof uninstalled === 'function') adapter.on('uninstalled', () => uninstalled.apply(adapter));
    if (typeof used === 'function') adapter.on('used', () => used.apply(adapter));
    if (typeof unused === 'function') adapter.on('unused', () => unused.apply(adapter));

    return adapter as MiraiApiHttpAdapter<C, D, M>;
}
