import {Friend, Group, GroupMember, GroupPermission, MessageChain, OtherClient} from '.';

export interface Event {
    readonly type: EventType;
}

export interface BotEvent extends Event {
    qq: number;
}

export interface FriendEvent extends Event {
    friend: Friend;
}

export interface GroupEvent extends Event {
    group?: Group;
    operator?: GroupMember;
}

export interface MemberEvent extends Event {
    member: GroupMember;
}

export interface RequestEvent extends Event {
    eventId: number;
    fromId: number;
    groupId: number;
    nick: string;
    message: string;
}

export interface CommandEvent extends Event {
    name: string;
}

export interface OtherClientEvent extends Event {
    client: OtherClient;
}

export interface BotOnlineEvent extends BotEvent {
    type: 'BotOnlineEvent';
}

export interface BotOfflineEventActive extends BotEvent {
    type: 'BotOfflineEventActive';
}

export interface BotOfflineEventForce extends BotEvent {
    type: 'BotOfflineEventForce';
}

export interface BotOfflineEventDropped extends BotEvent {
    type: 'BotOfflineEventDropped';
}

export interface BotReloginEvent extends BotEvent {
    type: 'BotReloginEvent';
}

export interface FriendInputStatusChangedEvent extends FriendEvent {
    type: 'FriendInputStatusChangedEvent';
    inputting: boolean;
}

export interface FriendNickChangedEvent extends FriendEvent {
    type: 'FriendNickChangedEvent';
    from: string;
    to: string;
}

export interface FriendRecallEvent extends FriendEvent {
    type: 'FriendRecallEvent';
    authorId: number;
    messageId: number;
    time: number;
    operator: number;
}

export interface BotGroupPermissionChangeEvent extends GroupEvent {
    type: 'BotGroupPermissionChangeEvent';
    origin: GroupPermission;
    current: GroupPermission;
    group: Group;
}

export interface BotMuteEvent extends GroupEvent {
    type: 'BotMuteEvent';
    durationSeconds: number;
    operator: GroupMember;
}

export interface BotUnmuteEvent extends GroupEvent {
    type: 'BotUnmuteEvent',
    operator: GroupMember;
}

export interface BotJoinGroupEvent extends GroupEvent {
    type: 'BotJoinGroupEvent';
    group: Group;
}

export interface BotLeaveEventActive extends GroupEvent {
    type: 'BotLeaveEventActive';
    group: Group;
}

export interface BotLeaveEventKick extends GroupEvent {
    type: 'BotLeaveEventKick';
    group: Group;
}

export interface GroupRecallEvent extends GroupEvent {
    type: 'GroupRecallEvent';
    authorId: number;
    messageId: number;
    time: number;
    group: Group;
    operator?: GroupMember;
}

export interface GroupNameChangeEvent extends GroupEvent {
    type: 'GroupNameChangeEvent';
    origin: string;
    current: string;
    group: Group;
    operator?: GroupMember;
}

export interface GroupEntranceAnnouncementChangeEvent extends GroupEvent {
    type: 'GroupEntranceAnnouncementChangeEvent';
    origin: string;
    current: string;
    group: Group;
    operator?: GroupMember;
}

export interface GroupMuteAllEvent extends GroupEvent {
    type: 'GroupMuteAllEvent';
    origin: boolean;
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

export interface GroupAllowAnonymousChatEvent extends GroupEvent {
    type: 'GroupAllowAnonymousChatEvent';
    origin: boolean;
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

export interface GroupAllowConfessTalkEvent extends GroupEvent {
    type: 'GroupAllowConfessTalkEvent';
    origin: boolean;
    current: boolean;
    group: Group;
    isMyBot: boolean;
}

export interface GroupAllowMemberInviteEvent extends GroupEvent {
    type: 'GroupAllowMemberInviteEvent';
    origin: boolean;
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

export interface MemberJoinEvent extends MemberEvent {
    type: 'MemberJoinEvent';
}

export interface MemberLeaveEventKick extends MemberEvent {
    type: 'MemberLeaveEventKick';
    operator?: GroupMember;
}

export interface MemberLeaveEventQuit extends MemberEvent {
    type: 'MemberLeaveEventQuit';
}

export interface MemberCardChangeEvent extends MemberEvent {
    type: 'MemberCardChangeEvent';
    origin: string;
    current: string;
    operator?: GroupMember;
}

export interface MemberSpecialTitleChangeEvent extends MemberEvent {
    type: 'MemberSpecialTitleChangeEvent';
    origin: string;
    current: string;
}

export interface MemberPermissionChangeEvent extends MemberEvent {
    type: 'MemberPermissionChangeEvent';
    origin: GroupPermission;
    current: GroupPermission;
}

export interface MemberMuteEvent extends MemberEvent {
    type: 'MemberMuteEvent';
    durationSeconds: number;
    operator?: GroupMember;
}

export interface MemberUnmuteEvent extends MemberEvent {
    type: 'MemberUnmuteEvent';
    operator?: GroupMember;
}

export interface MemberHonorChangeEvent extends MemberEvent {
    type: 'MemberHonorChangeEvent';
    action: string;
    honor: string;
}

export interface NewFriendRequestEvent extends RequestEvent {
    type: 'NewFriendRequestEvent';
}

export interface MemberJoinRequestEvent extends RequestEvent {
    type: 'MemberJoinRequestEvent';
    groupName: string;
}

export interface BotInvitedJoinGroupRequestEvent extends RequestEvent {
    type: 'BotInvitedJoinGroupRequestEvent';
    groupName: string;
}

export interface CommandExecutedEvent extends CommandEvent {
    type: 'CommandExecutedEvent';
    friend?: Friend;
    member?: GroupMember;
    args: MessageChain;
}

export interface OtherClientOnlineEvent extends OtherClientEvent {
    type: 'OtherClientOnlineEvent';
}

export interface OtherClientOfflineEvent extends OtherClientEvent {
    type: 'OtherClientOfflineEvent';
}

export type NudgeKind = 'Stranger' | 'Friend' | 'Group';

export interface NudgeSubject {
    id: number;
    kind: NudgeKind;
}

export interface NudgeEvent extends Event {
    type: 'NudgeEvent';
    fromId: number;
    target: number;
    subject: NudgeSubject;
    action: string;
    suffix: string;
}

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

export type EventType = keyof EventMap;
