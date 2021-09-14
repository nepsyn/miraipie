/** 联系人 */
export interface Contact {
    /** 联系人账号 */
    readonly id: number;
}

/** 好友 */
export interface Friend extends Contact {
    /** 昵称 */
    nickname: string;
    /** 备注 */
    remark: string;
}

/** 群权限类型 */
export type GroupPermission = 'OWNER' | 'ADMINISTRATOR' | 'MEMBER';

/** 群聊 */
export interface Group extends Contact {
    /** 群名 */
    name: string;
    /** 机器人在群中权限 */
    permission: GroupPermission;
}

/** 群成员 */
export interface GroupMember extends Contact {
    /** 群成员名称 */
    memberName: string;
    /** 头衔 */
    specialTitle: string;
    /** 成员权限 */
    permission: GroupPermission;
    /** 入群时间戳 */
    joinTimestamp: number;
    /** 最近发言时间戳 */
    lastSpeakTimestamp: number;
    /** 剩余禁言时间(秒) */
    muteTimeRemaining: number;
    /** 所在群聊 */
    group: Group;
}

/** 平台类型 */
export type PlatformType = 'IOS' | 'MOBILE' | 'WINDOWS';

/** 其他设备 */
export interface OtherClient extends Contact {
    /** 设备标识号 */
    id: number;
    /** 设备平台 */
    platform: PlatformType;
}

/** 单一消息 */
export interface SingleMessage {
    /** 消息类型 */
    readonly type: SingleMessageType;

    /** 是否为指定类型消息(类型保护) */
    isType<T extends SingleMessageType>(this: SingleMessage, type: T): this is SingleMessageMap[T];

    /** 转化为mirai码 */
    toMiraiCode(): string;

    /** 转化为显示串 */
    toDisplayString(): string;
}

/** 原始消息链 */
export interface MessageChain extends Array<SingleMessage> {
    [index: number]: SingleMessage;

    /** 第一个有效单一消息 */
    firstClientMessage: SingleMessage;

    /** 第一个有效单一消息 */
    f: SingleMessage;

    /** 消息 id */
    sourceId: number;

    /** 选择对应类型的单一消息 */
    select<T extends SingleMessageType>(type: T): this;

    /** 选择对应类型的单一消息的新消息链 */
    selected<T extends SingleMessageType>(type: T): MessageChain;

    /** 删除对应类型的单一消息 */
    drop<T extends SingleMessageType>(type: T): this;

    /** 删除对应类型的单一消息的新消息链 */
    dropped<T extends SingleMessageType>(type: T): MessageChain;

    /** 转化为mirai码 */
    toMiraiCode(): string;

    /** 转化为显示串 */
    toDisplayString(): string;
}

/** 来源型 */
export interface Source extends SingleMessage {
    type: 'Source';
    /** 消息id */
    id: number;
    /** 时间戳 */
    time: number;
}

/** 引用回复型 */
export interface Quote extends SingleMessage {
    type: 'Quote';
    /** 引用消息id */
    id: number;
    /** 群号 */
    groupId: number;
    /** 发送人QQ号 */
    senderId: number;
    /** 接收者账号 */
    targetId: number;
    /** 原始消息内容 */
    origin: SingleMessage[];
}

/** &#64;型 */
export interface At extends SingleMessage {
    type: 'At';
    /** 群成员QQ号 */
    target: number;
    /** At时显示的文字, 发送消息时无效, 自动使用群名片 */
    display: string;
}

/** &#64;全体成员型 */
export interface AtAll extends SingleMessage {
    type: 'AtAll';
}

/** 表情型 */
export interface Face extends SingleMessage {
    type: 'Face';
    /** 表情id */
    faceId: number;
    /** 表情名称 */
    name: string;
}

/** 普通文本型 */
export interface Plain extends SingleMessage {
    type: 'Plain';
    /** 文本内容 */
    text: string;
}

/** 图片型 */
export interface Image extends SingleMessage {
    type: 'Image';
    /** 图片id */
    imageId: string;
    /** 图片链接 */
    url: string;
    /** 图片文件路径 */
    path?: string;
    /** 图片Base64编码 */
    base64?: string;
}

/** 闪图型 */
export interface FlashImage extends SingleMessage {
    type: 'FlashImage';
    /** 图片id */
    imageId: string;
    /** 图片链接 */
    url: string;
    /** 图片文件路径 */
    path?: string;
    /** 图片Base64编码 */
    base64?: string;
}

/** 语音型 */
export interface Voice extends SingleMessage {
    type: 'Voice';
    /** 语音id */
    voiceId: string;
    /** 语音文件路径 */
    path?: string;
    /** 语音Base64编码 */
    base64?: string;
    /** 返回的语音长度 */
    length?: number;
}

/** XML型 */
export interface Xml extends SingleMessage {
    type: 'Xml';
    /** XML内容 */
    xml: string;
}

/** JSON型 */
export interface Json extends SingleMessage {
    type: 'Json';
    /** JSON内容 */
    json: string;
}

/** 小程序型 */
export interface App extends SingleMessage {
    type: 'App';
    /** 小程序内容(Json格式) */
    content: string;
}

/** 戳一戳类型 */
export type PokeType = 'Poke' | 'ShowLove' | 'Like' | 'Heartbroken' | 'SixSixSix' | 'FangDaZhao';

/** 戳一戳型 */
export interface Poke extends SingleMessage {
    type: 'Poke';
    /** 戳一戳名称 */
    name: PokeType;
}

/** 骰子型 */
export interface Dice extends SingleMessage {
    type: 'Dice';
    /** 骰子数值 */
    value: number;
}

/** 音乐分享型 */
export interface MusicShare extends SingleMessage {
    type: 'MusicShare',
    /** 音乐分享类型 */
    kind: string;
    /** 标题 */
    title: string;
    /** 概括 */
    summary: string;
    /** 跳转链接 */
    jumpUrl: string;
    /** 封面图片链接 */
    pictureUrl: string;
    /** 音乐播放链接 */
    musicUrl: string;
    /** 简介 */
    brief: string;
}

/** 合并转发结点 */
export interface ForwardNode {
    /** 发送人QQ号 */
    senderId: number;
    /** 发送时间戳 */
    time: number;
    /** 发送人名称 */
    senderName: number;
    /** 消息链 */
    messageChain: SingleMessage[];
    /** 消息id */
    messageId?: number;
}

/** 合并转发型 */
export interface Forward extends SingleMessage {
    type: 'Forward';
    /** 结点列表 */
    nodeList: ForwardNode[];
}

/** 文件型 */
export interface File extends SingleMessage {
    type: 'File';
    /** 文件id */
    id: string;
    /** 文件名 */
    name: string;
    /** 文件大小 */
    size: number;
}

/** mirai码型 */
export interface MiraiCode extends SingleMessage {
    type: 'MiraiCode';
    /** mirai码 */
    code: string;
}

/** 单一消息类型映射 */
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

/** 单一消息类型 */
export type SingleMessageType = keyof SingleMessageMap;

/** mirai事件 */
export interface Event {
    /** 事件类型 */
    readonly type: EventType;
}

/** 机器人事件 */
export interface BotEvent extends Event {
    /** 机器人QQ号 */
    qq: number;
}

/** 好友事件 */
export interface FriendEvent extends Event {
    /** 好友 */
    friend: Friend;
}

/** 群聊事件 */
export interface GroupEvent extends Event {
    /** 群聊 */
    group?: Group;
    /** 操作人(自己时为null) */
    operator?: GroupMember;
}

/** 群成员事件 */
export interface MemberEvent extends Event {
    /** 群成员 */
    member: GroupMember;
}

/** 请求事件 */
export interface RequestEvent extends Event {
    /** 事件id */
    eventId: number;
    /** 事件来源QQ号 */
    fromId: number;
    /** 事件对应群号 */
    groupId: number;
    /** 事件对应人昵称 */
    nick: string;
    /** 事件对应消息 */
    message: string;
}

/** 指令事件 */
export interface CommandEvent extends Event {
    /** 指令名 */
    name: string;
}

/** 其他设备事件 */
export interface OtherClientEvent extends Event {
    /** 其他设备 */
    client: OtherClient;
}

/** Bot登录成功事件 */
export interface BotOnlineEvent extends BotEvent {
    type: 'BotOnlineEvent';
}

/** Bot主动离线事件 */
export interface BotOfflineEventActive extends BotEvent {
    type: 'BotOfflineEventActive';
}

/** Bot被挤下线事件 */
export interface BotOfflineEventForce extends BotEvent {
    type: 'BotOfflineEventForce';
}

/** Bot被服务器断开或因网络问题而掉线事件 */
export interface BotOfflineEventDropped extends BotEvent {
    type: 'BotOfflineEventDropped';
}

/** Bot主动重新登录事件 */
export interface BotReloginEvent extends BotEvent {
    type: 'BotReloginEvent';
}

/** 好友输入状态改变事件 */
export interface FriendInputStatusChangedEvent extends FriendEvent {
    type: 'FriendInputStatusChangedEvent';
    /** 是否正在输入 */
    inputting: boolean;
}

/** 好友昵称改变事件 */
export interface FriendNickChangedEvent extends FriendEvent {
    type: 'FriendNickChangedEvent';
    /** 原昵称 */
    from: string;
    /** 新昵称 */
    to: string;
}

/** 好友消息撤回事件 */
export interface FriendRecallEvent extends FriendEvent {
    type: 'FriendRecallEvent';
    /** 消息发送者QQ号 */
    authorId: number;
    /** 消息id */
    messageId: number;
    /** 消息发送时间戳 */
    time: number;
    /** 撤回消息者QQ号 */
    operator: number;
}

/** Bot在群里的权限被改变事件, 操作人一定是群主 */
export interface BotGroupPermissionChangeEvent extends GroupEvent {
    type: 'BotGroupPermissionChangeEvent';
    /** 原权限 */
    origin: GroupPermission;
    /** 新权限 */
    current: GroupPermission;
    group: Group;
}

/** Bot被禁言事件 */
export interface BotMuteEvent extends GroupEvent {
    type: 'BotMuteEvent';
    /** 禁言时长(秒) */
    durationSeconds: number;
    operator: GroupMember;
}

/** Bot被取消禁言事件 */
export interface BotUnmuteEvent extends GroupEvent {
    type: 'BotUnmuteEvent',
    operator: GroupMember;
}

/** Bot加入了一个新群事件 */
export interface BotJoinGroupEvent extends GroupEvent {
    type: 'BotJoinGroupEvent';
    group: Group;
    /** 邀请人 */
    invitor?: GroupMember;
}

/** Bot主动退出一个群事件 */
export interface BotLeaveEventActive extends GroupEvent {
    type: 'BotLeaveEventActive';
    group: Group;
}

/** Bot被踢出一个群事件 */
export interface BotLeaveEventKick extends GroupEvent {
    type: 'BotLeaveEventKick';
    group: Group;
    /** 操作人 */
    operator?: GroupMember;
}

/** 群消息撤回事件 */
export interface GroupRecallEvent extends GroupEvent {
    type: 'GroupRecallEvent';
    /** 消息发送者QQ号 */
    authorId: number;
    /** 消息id */
    messageId: number;
    /** 消息发送时间戳 */
    time: number;
    group: Group;
    operator?: GroupMember;
}

/** 群名改变事件 */
export interface GroupNameChangeEvent extends GroupEvent {
    type: 'GroupNameChangeEvent';
    /** 原群名 */
    origin: string;
    /** 新群名 */
    current: string;
    group: Group;
    operator?: GroupMember;
}

/** 入群公告改变事件 */
export interface GroupEntranceAnnouncementChangeEvent extends GroupEvent {
    type: 'GroupEntranceAnnouncementChangeEvent';
    /** 原公告 */
    origin: string;
    /** 新公告 */
    current: string;
    group: Group;
    operator?: GroupMember;
}

/** 全员禁言事件 */
export interface GroupMuteAllEvent extends GroupEvent {
    type: 'GroupMuteAllEvent';
    /** 原本是否处于禁言状态 */
    origin: boolean;
    /** 现在是否处于禁言状态 */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

/** 匿名聊天改变事件 */
export interface GroupAllowAnonymousChatEvent extends GroupEvent {
    type: 'GroupAllowAnonymousChatEvent';
    /** 原本是否允许 */
    origin: boolean;
    /** 现在是否允许 */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

/** 坦白说改变事件 */
export interface GroupAllowConfessTalkEvent extends GroupEvent {
    type: 'GroupAllowConfessTalkEvent';
    /** 原本是否允许 */
    origin: boolean;
    /** 现在是否允许 */
    current: boolean;
    group: Group;
    isMyBot: boolean;
}

/** 允许群员邀请好友加群改变事件 */
export interface GroupAllowMemberInviteEvent extends GroupEvent {
    type: 'GroupAllowMemberInviteEvent';
    /** 原本是否允许 */
    origin: boolean;
    /** 现在是否允许 */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

/** 新人入群事件 */
export interface MemberJoinEvent extends MemberEvent {
    type: 'MemberJoinEvent';
    /** 邀请人 */
    invitor?: GroupMember;
}

/** 群成员被踢出群事件, 该成员不是Bot */
export interface MemberLeaveEventKick extends MemberEvent {
    type: 'MemberLeaveEventKick';
    operator?: GroupMember;
}

/** 群成员主动离群事件, 该成员不是Bot */
export interface MemberLeaveEventQuit extends MemberEvent {
    type: 'MemberLeaveEventQuit';
}

/** 群名片改动事件 */
export interface MemberCardChangeEvent extends MemberEvent {
    type: 'MemberCardChangeEvent';
    /** 原名片 */
    origin: string;
    /** 新名片 */
    current: string;
    operator?: GroupMember;
}

/** 群头衔改动事件, 只有群主有操作限权 */
export interface MemberSpecialTitleChangeEvent extends MemberEvent {
    type: 'MemberSpecialTitleChangeEvent';
    /** 原头衔 */
    origin: string;
    /** 新头衔 */
    current: string;
}

/** 群成员权限改变事件, 该成员不是Bot */
export interface MemberPermissionChangeEvent extends MemberEvent {
    type: 'MemberPermissionChangeEvent';
    /** 原权限 */
    origin: GroupPermission;
    /** 新权限 */
    current: GroupPermission;
}

/** 群成员被禁言事件, 该成员不是Bot */
export interface MemberMuteEvent extends MemberEvent {
    type: 'MemberMuteEvent';
    /** 禁言时长(秒) */
    durationSeconds: number;
    operator?: GroupMember;
}

/** 群成员被取消禁言事件, 该成员不是Bot */
export interface MemberUnmuteEvent extends MemberEvent {
    type: 'MemberUnmuteEvent';
    operator?: GroupMember;
}

/** 群成员称号改变事件 */
export interface MemberHonorChangeEvent extends MemberEvent {
    type: 'MemberHonorChangeEvent';
    /** 称号变化行为(achieve - 获得称号, lose - 失去称号) */
    action: string;
    /** 称号 */
    honor: string;
}

/** 添加好友申请事件 */
export interface NewFriendRequestEvent extends RequestEvent {
    type: 'NewFriendRequestEvent';
}

/** 用户入群申请事件 */
export interface MemberJoinRequestEvent extends RequestEvent {
    type: 'MemberJoinRequestEvent';
    /** 群名称 */
    groupName: string;
}

/** Bot被邀请入群申请事件 */
export interface BotInvitedJoinGroupRequestEvent extends RequestEvent {
    type: 'BotInvitedJoinGroupRequestEvent';
    /** 群名称 */
    groupName: string;
}

/** 命令被执行事件 */
export interface CommandExecutedEvent extends CommandEvent {
    type: 'CommandExecutedEvent';
    /** 发送命令的好友 */
    friend?: Friend;
    /** 发送命令的群成员 */
    member?: GroupMember;
    /** 指令的参数 */
    args: SingleMessage[];
}

/** 其他设备上线事件 */
export interface OtherClientOnlineEvent extends OtherClientEvent {
    type: 'OtherClientOnlineEvent';
    /** 设备详细类型 */
    kind?: number;
}

/** 其他设备下线事件 */
export interface OtherClientOfflineEvent extends OtherClientEvent {
    type: 'OtherClientOfflineEvent';
}

/** 头像戳一戳类型 */
export type NudgeKind = 'Stranger' | 'Friend' | 'Group';

/** 头像戳一戳接收人 */
export interface NudgeSubject {
    /** 接收人账号 */
    id: number;
    /** 头像戳一戳类型("Stranger" | "Friend" | "Group") */
    kind: NudgeKind;
}

/** 头像戳一戳事件 */
export interface NudgeEvent extends Event {
    type: 'NudgeEvent';
    /** 发送人账号 */
    fromId: number;
    /** 头像戳一戳目标账号 */
    target: number;
    /** 头像戳一戳接收人 */
    subject: NudgeSubject;
    /**
     * 戳一戳动作
     * @example
     * "戳了戳"
     * "捏了捏"
     */
    action: string;
    /**
     * 戳一戳后缀
     * @example
     * "的脸"
     * "的头"
     */
    suffix: string;
}

/** 未知事件 */
export interface UnknownEvent extends Event {
    type: 'UnknownEvent';
    data: object;
}

export type EventMap = {
    BotOnlineEvent: BotOnlineEvent,
    BotOfflineEventActive: BotOfflineEventActive,
    BotOfflineEventForce: BotOfflineEventForce,
    BotOfflineEventDropped: BotOfflineEventDropped,
    BotReloginEvent: BotReloginEvent,
    FriendInputStatusChangedEvent: FriendInputStatusChangedEvent,
    FriendNickChangedEvent: FriendNickChangedEvent,
    FriendRecallEvent: FriendRecallEvent,
    BotGroupPermissionChangeEvent: BotGroupPermissionChangeEvent,
    BotMuteEvent: BotMuteEvent,
    BotUnmuteEvent: BotUnmuteEvent,
    BotJoinGroupEvent: BotJoinGroupEvent,
    BotLeaveEventActive: BotLeaveEventActive,
    BotLeaveEventKick: BotLeaveEventKick,
    GroupRecallEvent: GroupRecallEvent,
    GroupNameChangeEvent: GroupNameChangeEvent,
    GroupEntranceAnnouncementChangeEvent: GroupEntranceAnnouncementChangeEvent,
    GroupMuteAllEvent: GroupMuteAllEvent,
    GroupAllowAnonymousChatEvent: GroupAllowAnonymousChatEvent,
    GroupAllowConfessTalkEvent: GroupAllowConfessTalkEvent,
    GroupAllowMemberInviteEvent: GroupAllowMemberInviteEvent,
    MemberJoinEvent: MemberJoinEvent,
    MemberLeaveEventKick: MemberLeaveEventKick,
    MemberLeaveEventQuit: MemberLeaveEventQuit,
    MemberCardChangeEvent: MemberCardChangeEvent,
    MemberSpecialTitleChangeEvent: MemberSpecialTitleChangeEvent,
    MemberPermissionChangeEvent: MemberPermissionChangeEvent,
    MemberMuteEvent: MemberMuteEvent,
    MemberUnmuteEvent: MemberUnmuteEvent,
    MemberHonorChangeEvent: MemberHonorChangeEvent,
    NewFriendRequestEvent: NewFriendRequestEvent,
    MemberJoinRequestEvent: MemberJoinRequestEvent,
    BotInvitedJoinGroupRequestEvent: BotInvitedJoinGroupRequestEvent,
    CommandExecutedEvent: CommandExecutedEvent,
    OtherClientOnlineEvent: OtherClientOnlineEvent,
    OtherClientOfflineEvent: OtherClientOfflineEvent,
    NudgeEvent: NudgeEvent,
    UnknownEvent: UnknownEvent
}

/** mirai事件类型 */
export type EventType = keyof EventMap;

/** mirai 聊天消息 */
export interface ChatMessage {
    /** 聊天消息类型 */
    readonly type: ChatMessageType;
    /** 消息发送人 */
    sender: Contact;
    /** 消息链 */
    messageChain: MessageChain;
}

/** 好友聊天消息 */
export interface FriendMessage extends ChatMessage {
    type: 'FriendMessage';
    sender: Friend;
}

/** 群聊聊天消息 */
export interface GroupMessage extends ChatMessage {
    type: 'GroupMessage';
    sender: GroupMember;
}

/** 临时聊天消息 */
export interface TempMessage extends ChatMessage {
    type: 'TempMessage';
    sender: GroupMember;
}

/** 陌生人聊天消息 */
export interface StrangerMessage extends ChatMessage {
    type: 'StrangerMessage';
    sender: Friend;
}

/** 其他设备聊天消息 */
export interface OtherClientMessage extends ChatMessage {
    type: 'OtherClientMessage';
    sender: OtherClient;
}

/** 聊天消息映射 */
export type ChatMessageMap = {
    FriendMessage: FriendMessage,
    GroupMessage: GroupMessage,
    TempMessage: TempMessage,
    StrangerMessage: StrangerMessage,
    OtherClientMessage: OtherClientMessage
}

/** 聊天消息类型 */
export type ChatMessageType = keyof ChatMessageMap;

/** 个人资料性别类型 */
export type SexType = 'UNKNOWN' | 'MALE' | 'FEMALE';

/** 个人资料 */
export interface Profile {
    /** 昵称 */
    nickname: string;
    /** 邮箱地址 */
    email: string;
    /** 年龄 */
    age: number;
    /** 等级 */
    level: number;
    /** 个性签名 */
    sign: string;
    /** 性别 */
    sex: SexType;
}

/** 文件概览 */
export interface FileOverview {
    /** 文件名 */
    name: string;
    /** 文件id */
    id: string;
    /** 文件路径 */
    path: string;
    /** 上级文件 */
    parent?: FileOverview;
    /** 文件所属Contact */
    contact: Contact;
    /** 是否为文件 */
    isFile: boolean;
    /** 是否为文件夹 */
    isDirectory: boolean;
    /** 文件下载信息 */
    downloadInfo?: {
        /** 文件sha1 */
        sha1: string;
        /** 文件md5 */
        md5: string;
        /** 下载次数 */
        downloadTimes: number;
        /** 上传人QQ号 */
        uploaderId: number;
        /** 上传时间戳 */
        uploadTime: number;
        /** 最近更改时间戳 */
        lastModifyTime: number;
        /** 文件下载链接 */
        url: string;
    }
}

/** 群设置 */
export interface GroupConfig {
    /** 群名 */
    name: string;
    /** 是否开启坦白说 */
    confessTalk: boolean;
    /** 是否允许群员邀请 */
    allowMemberInvite: boolean;
    /** 是否开启自动审批入群 */
    autoApprove: boolean;
    /** 是否允许匿名聊天 */
    anonymousChat: boolean;
}

/** mirai-api-http请求返回的状态码 */
export enum ResponseCode {
    /** 正常 */
    Success = 0,
    /** 错误的verify key */
    WrongVerifyKey = 1,
    /** 指定的Bot不存在 */
    BotNotExist = 2,
    /** Session失效或不存在 */
    SessionNotExist = 3,
    /** Session未认证(未激活) */
    UnverifiedSession = 4,
    /** 发送消息目标不存在(指定对象不存在) */
    TargetNotExist = 5,
    /** 指定文件不存在, 出现于发送本地图片 */
    FileNotExist = 6,
    /** 无操作权限, 指Bot没有对应操作的限权 */
    NoPermission = 10,
    /** Bot被禁言, 指Bot当前无法向指定群发送消息 */
    BotIsMuted = 20,
    /** 消息过长 */
    MessageTooLong = 30,
    /** 错误的访问, 如参数错误等 */
    BadRequest = 400,
    /** mirai-api-http 内部错误 */
    InternalError = 500
}

/** 认证响应 */
export interface VerifyResponse {
    /** 状态码 */
    code: ResponseCode;
    /** 会话Session */
    session: string;
}

/** Api请求的响应 */
export interface ApiResponse {
    /** 状态码 */
    code: ResponseCode;
    /** 消息 */
    msg: string;
    /** 响应数据 */
    data?: object;
}

/** 获取插件信息响应 */
export interface AboutResponse extends ApiResponse {
    data: {
        /** mirai-api-http版本 */
        version: string
    }
}

/** 获取历史消息响应 */
export interface MessageRetrieveResponse extends ApiResponse {
    /** 消息、事件列表 */
    data: Array<ChatMessage | Event>;
}

/** 根据id获取消息响应 */
export interface MessageFromIdResponse extends ApiResponse {
    /** 消息 */
    data: ChatMessage;
}

/** 获取好友列表响应 */
export interface FriendListResponse extends ApiResponse {
    /** 好友列表 */
    data: Friend[];
}

/** 获取群列表响应 */
export interface GroupListResponse extends ApiResponse {
    /** 群列表 */
    data: Group[];
}

/** 获取群成员列表响应 */
export interface MemberListResponse extends ApiResponse {
    /** 群成员列表 */
    data: GroupMember[];
}

/** 获取资料响应 */
export interface ProfileResponse extends ApiResponse {
    /** 个人资料 */
    data: Profile;
}

/** 发送消息响应 */
export interface SendMessageResponse extends ApiResponse {
    /** 已发送消息id */
    messageId: number;
}

/** 查看文件列表响应 */
export interface FileListResponse extends ApiResponse {
    /** 文件概览列表 */
    data: FileOverview[];
}

/** 获取文件信息响应 */
export interface FileInfoResponse extends ApiResponse {
    /** 文件概览 */
    data: FileOverview;
}

/** 获取群设置响应 */
export interface GroupConfigResponse extends ApiResponse {
    /** 群设置 */
    data: GroupConfig;
}

/** 获取群成员信息响应 */
export interface GroupMemberResponse extends ApiResponse {
    /** 群成员信息 */
    data: GroupMember;
}

/** 图片上传响应 */
export interface UploadImageResponse {
    /** 图片id */
    imageId: string;
    /** 图片下载链接 */
    url: string;
}

/** 语音上传响应 */
export interface UploadVoiceResponse {
    /** 语音id */
    voiceId: string;
    /** 语音下载链接 */
    url: string;
}

/** 文件上传响应 */
export type UploadFileResponse = FileInfoResponse;

/** 支持的 mirai-api-http 版本号 */
export const MIRAI_API_HTTP_VERSION = '2.3.1';
