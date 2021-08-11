import { Friend, Group, GroupMember, GroupPermission, MessageChain, OtherClient } from '.';
/**
 * mirai事件
 */
export interface Event {
    /**
     * 事件类型
     */
    readonly type: EventType;
}
/**
 * 机器人事件
 */
export interface BotEvent extends Event {
    /**
     * 机器人QQ号
     */
    qq: number;
}
/**
 * 好友事件
 */
export interface FriendEvent extends Event {
    /**
     * 好友
     */
    friend: Friend;
}
/**
 * 群聊事件
 */
export interface GroupEvent extends Event {
    /**
     * 群聊
     */
    group?: Group;
    /**
     * 操作人(自己时为null)
     */
    operator?: GroupMember;
}
/**
 * 群成员事件
 */
export interface MemberEvent extends Event {
    /**
     * 群成员
     */
    member: GroupMember;
}
/**
 * 请求事件
 */
export interface RequestEvent extends Event {
    /**
     * 事件id
     */
    eventId: number;
    /**
     * 事件来源QQ号
     */
    fromId: number;
    /**
     * 事件对应群号
     */
    groupId: number;
    /**
     * 事件对应人昵称
     */
    nick: string;
    /**
     * 事件对应消息
     */
    message: string;
}
/**
 * 指令事件
 */
export interface CommandEvent extends Event {
    /**
     * 指令名
     */
    name: string;
}
/**
 * 其他设备事件
 */
export interface OtherClientEvent extends Event {
    /**
     * 其他设备
     */
    client: OtherClient;
}
/**
 * Bot登录成功事件
 */
export interface BotOnlineEvent extends BotEvent {
    type: 'BotOnlineEvent';
}
/**
 * Bot主动离线事件
 */
export interface BotOfflineEventActive extends BotEvent {
    type: 'BotOfflineEventActive';
}
/**
 * Bot被挤下线事件
 */
export interface BotOfflineEventForce extends BotEvent {
    type: 'BotOfflineEventForce';
}
/**
 * Bot被服务器断开或因网络问题而掉线事件
 */
export interface BotOfflineEventDropped extends BotEvent {
    type: 'BotOfflineEventDropped';
}
/**
 * Bot主动重新登录事件
 */
export interface BotReloginEvent extends BotEvent {
    type: 'BotReloginEvent';
}
/**
 * 好友输入状态改变事件
 */
export interface FriendInputStatusChangedEvent extends FriendEvent {
    type: 'FriendInputStatusChangedEvent';
    /**
     * 是否正在输入
     */
    inputting: boolean;
}
/**
 * 好友昵称改变事件
 */
export interface FriendNickChangedEvent extends FriendEvent {
    type: 'FriendNickChangedEvent';
    /**
     * 原昵称
     */
    from: string;
    /**
     * 新昵称
     */
    to: string;
}
/**
 * 好友消息撤回事件
 */
export interface FriendRecallEvent extends FriendEvent {
    type: 'FriendRecallEvent';
    /**
     * 消息发送者QQ号
     */
    authorId: number;
    /**
     * 消息id
     */
    messageId: number;
    /**
     * 消息发送时间戳
     */
    time: number;
    /**
     * 撤回消息者QQ号
     */
    operator: number;
}
/**
 * Bot在群里的权限被改变事件, 操作人一定是群主
 */
export interface BotGroupPermissionChangeEvent extends GroupEvent {
    type: 'BotGroupPermissionChangeEvent';
    /**
     * 原权限
     */
    origin: GroupPermission;
    /**
     * 新权限
     */
    current: GroupPermission;
    group: Group;
}
/**
 * Bot被禁言事件
 */
export interface BotMuteEvent extends GroupEvent {
    type: 'BotMuteEvent';
    /**
     * 禁言时长(秒)
     */
    durationSeconds: number;
    operator: GroupMember;
}
/**
 * Bot被取消禁言事件
 */
export interface BotUnmuteEvent extends GroupEvent {
    type: 'BotUnmuteEvent';
    operator: GroupMember;
}
/**
 * Bot加入了一个新群事件
 */
export interface BotJoinGroupEvent extends GroupEvent {
    type: 'BotJoinGroupEvent';
    group: Group;
}
/**
 * Bot主动退出一个群事件
 */
export interface BotLeaveEventActive extends GroupEvent {
    type: 'BotLeaveEventActive';
    group: Group;
}
/**
 * Bot被踢出一个群事件
 */
export interface BotLeaveEventKick extends GroupEvent {
    type: 'BotLeaveEventKick';
    group: Group;
}
/**
 * 群消息撤回事件
 */
export interface GroupRecallEvent extends GroupEvent {
    type: 'GroupRecallEvent';
    /**
     * 消息发送者QQ号
     */
    authorId: number;
    /**
     * 消息id
     */
    messageId: number;
    /**
     * 消息发送时间戳
     */
    time: number;
    group: Group;
    operator?: GroupMember;
}
/**
 * 群名改变事件
 */
export interface GroupNameChangeEvent extends GroupEvent {
    type: 'GroupNameChangeEvent';
    /**
     * 原群名
     */
    origin: string;
    /**
     * 新群名
     */
    current: string;
    group: Group;
    operator?: GroupMember;
}
/**
 * 入群公告改变事件
 */
export interface GroupEntranceAnnouncementChangeEvent extends GroupEvent {
    type: 'GroupEntranceAnnouncementChangeEvent';
    /**
     * 原公告
     */
    origin: string;
    /**
     * 新公告
     */
    current: string;
    group: Group;
    operator?: GroupMember;
}
/**
 * 全员禁言事件
 */
export interface GroupMuteAllEvent extends GroupEvent {
    type: 'GroupMuteAllEvent';
    /**
     * 原本是否处于禁言状态
     */
    origin: boolean;
    /**
     * 现在是否处于禁言状态
     */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}
/**
 * 匿名聊天改变事件
 */
export interface GroupAllowAnonymousChatEvent extends GroupEvent {
    type: 'GroupAllowAnonymousChatEvent';
    /**
     * 原本是否允许
     */
    origin: boolean;
    /**
     * 现在是否允许
     */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}
/**
 * 坦白说改变事件
 */
export interface GroupAllowConfessTalkEvent extends GroupEvent {
    type: 'GroupAllowConfessTalkEvent';
    /**
     * 原本是否允许
     */
    origin: boolean;
    /**
     * 现在是否允许
     */
    current: boolean;
    group: Group;
    isMyBot: boolean;
}
/**
 * 允许群员邀请好友加群改变事件
 */
export interface GroupAllowMemberInviteEvent extends GroupEvent {
    type: 'GroupAllowMemberInviteEvent';
    /**
     * 原本是否允许
     */
    origin: boolean;
    /**
     * 现在是否允许
     */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}
/**
 * 新人入群事件
 */
export interface MemberJoinEvent extends MemberEvent {
    type: 'MemberJoinEvent';
}
/**
 * 群成员被踢出群事件, 该成员不是Bot
 */
export interface MemberLeaveEventKick extends MemberEvent {
    type: 'MemberLeaveEventKick';
    operator?: GroupMember;
}
/**
 * 群成员主动离群事件, 该成员不是Bot
 */
export interface MemberLeaveEventQuit extends MemberEvent {
    type: 'MemberLeaveEventQuit';
}
/**
 * 群名片改动事件
 */
export interface MemberCardChangeEvent extends MemberEvent {
    type: 'MemberCardChangeEvent';
    /**
     * 原名片
     */
    origin: string;
    /**
     * 新名片
     */
    current: string;
    operator?: GroupMember;
}
/**
 * 群头衔改动事件, 只有群主有操作限权
 */
export interface MemberSpecialTitleChangeEvent extends MemberEvent {
    type: 'MemberSpecialTitleChangeEvent';
    /**
     * 原头衔
     */
    origin: string;
    /**
     * 新头衔
     */
    current: string;
}
/**
 * 群成员权限改变事件, 该成员不是Bot
 */
export interface MemberPermissionChangeEvent extends MemberEvent {
    type: 'MemberPermissionChangeEvent';
    /**
     * 原权限
     */
    origin: GroupPermission;
    /**
     * 新权限
     */
    current: GroupPermission;
}
/**
 * 群成员被禁言事件, 该成员不是Bot
 */
export interface MemberMuteEvent extends MemberEvent {
    type: 'MemberMuteEvent';
    /**
     * 禁言时长(秒)
     */
    durationSeconds: number;
    operator?: GroupMember;
}
/**
 * 群成员被取消禁言事件, 该成员不是Bot
 */
export interface MemberUnmuteEvent extends MemberEvent {
    type: 'MemberUnmuteEvent';
    operator?: GroupMember;
}
/**
 * 群成员称号改变事件
 */
export interface MemberHonorChangeEvent extends MemberEvent {
    type: 'MemberHonorChangeEvent';
    /**
     * 称号变化行为(achieve - 获得称号, lose - 失去称号)
     */
    action: string;
    /**
     * 称号
     */
    honor: string;
}
/**
 * 添加好友申请事件
 */
export interface NewFriendRequestEvent extends RequestEvent {
    type: 'NewFriendRequestEvent';
}
/**
 * 用户入群申请事件
 */
export interface MemberJoinRequestEvent extends RequestEvent {
    type: 'MemberJoinRequestEvent';
    /**
     * 群名称
     */
    groupName: string;
}
/**
 * Bot被邀请入群申请事件
 */
export interface BotInvitedJoinGroupRequestEvent extends RequestEvent {
    type: 'BotInvitedJoinGroupRequestEvent';
    /**
     * 群名称
     */
    groupName: string;
}
/**
 * 命令被执行事件
 */
export interface CommandExecutedEvent extends CommandEvent {
    type: 'CommandExecutedEvent';
    /**
     * 发送命令的好友
     */
    friend?: Friend;
    /**
     * 发送命令的群成员
     */
    member?: GroupMember;
    /**
     * 指令的参数
     */
    args: MessageChain;
}
/**
 * 其他设备上线事件
 */
export interface OtherClientOnlineEvent extends OtherClientEvent {
    type: 'OtherClientOnlineEvent';
}
/**
 * 其他设备下线事件
 */
export interface OtherClientOfflineEvent extends OtherClientEvent {
    type: 'OtherClientOfflineEvent';
}
/**
 * 戳一戳类型
 */
export declare type NudgeKind = 'Stranger' | 'Friend' | 'Group';
/**
 * 戳一戳接收人
 */
export interface NudgeSubject {
    /**
     * 接收人账号
     */
    id: number;
    /**
     * 戳一戳类型("Stranger" | "Friend" | "Group")
     */
    kind: NudgeKind;
}
/**
 * 戳一戳事件
 */
export interface NudgeEvent extends Event {
    type: 'NudgeEvent';
    /**
     * 发送人账号
     */
    fromId: number;
    /**
     * 戳一戳目标账号
     */
    target: number;
    /**
     * 戳一戳接收人
     */
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
/**
 * 未知事件
 */
export interface UnknownEvent extends Event {
    type: 'UnknownEvent';
    data: object;
}
export declare type EventMap = {
    BotOnlineEvent: BotOnlineEvent;
    BotOfflineEventActive: BotOfflineEventActive;
    BotOfflineEventForce: BotOfflineEventForce;
    BotOfflineEventDropped: BotOfflineEventDropped;
    BotReloginEvent: BotReloginEvent;
    FriendInputStatusChangedEvent: FriendInputStatusChangedEvent;
    FriendNickChangedEvent: FriendNickChangedEvent;
    FriendRecallEvent: FriendRecallEvent;
    BotGroupPermissionChangeEvent: BotGroupPermissionChangeEvent;
    BotMuteEvent: BotMuteEvent;
    BotUnmuteEvent: BotUnmuteEvent;
    BotJoinGroupEvent: BotJoinGroupEvent;
    BotLeaveEventActive: BotLeaveEventActive;
    BotLeaveEventKick: BotLeaveEventKick;
    GroupRecallEvent: GroupRecallEvent;
    GroupNameChangeEvent: GroupNameChangeEvent;
    GroupEntranceAnnouncementChangeEvent: GroupEntranceAnnouncementChangeEvent;
    GroupMuteAllEvent: GroupMuteAllEvent;
    GroupAllowAnonymousChatEvent: GroupAllowAnonymousChatEvent;
    GroupAllowConfessTalkEvent: GroupAllowConfessTalkEvent;
    GroupAllowMemberInviteEvent: GroupAllowMemberInviteEvent;
    MemberJoinEvent: MemberJoinEvent;
    MemberLeaveEventKick: MemberLeaveEventKick;
    MemberLeaveEventQuit: MemberLeaveEventQuit;
    MemberCardChangeEvent: MemberCardChangeEvent;
    MemberSpecialTitleChangeEvent: MemberSpecialTitleChangeEvent;
    MemberPermissionChangeEvent: MemberPermissionChangeEvent;
    MemberMuteEvent: MemberMuteEvent;
    MemberUnmuteEvent: MemberUnmuteEvent;
    MemberHonorChangeEvent: MemberHonorChangeEvent;
    NewFriendRequestEvent: NewFriendRequestEvent;
    MemberJoinRequestEvent: MemberJoinRequestEvent;
    BotInvitedJoinGroupRequestEvent: BotInvitedJoinGroupRequestEvent;
    CommandExecutedEvent: CommandExecutedEvent;
    OtherClientOnlineEvent: OtherClientOnlineEvent;
    OtherClientOfflineEvent: OtherClientOfflineEvent;
    NudgeEvent: NudgeEvent;
    UnknownEvent: UnknownEvent;
};
/**
 * mirai事件类型
 */
export declare type EventType = keyof EventMap;
