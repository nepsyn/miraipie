import {ReadStream} from 'fs';
import {
    AboutResponse,
    ApiResponse,
    FileInfoResponse,
    FileListResponse,
    FriendListResponse,
    GroupConfigResponse,
    GroupListResponse,
    GroupMemberResponse,
    MemberListResponse,
    MessageFromIdResponse,
    ProfileResponse,
    SendMessageResponse,
    UploadImageResponse,
    UploadVoiceResponse,
    VerifyResponse
} from '.';
import {ChatMessage, Event, FileOverview, GroupConfig, GroupMember, MessageChain, NudgeKind, SingleMessage} from '..';

export interface MiraiApiHttpClientSetting {
    verifyKey: string;
    host: string;
    port: number;
}

export type UploadType = 'friend' | 'group' | 'temp';

export type MessageHandler = (chatMessage: ChatMessage) => any;
export type EventHandler = (event: Event) => any;

export interface MiraiApiHttpAdapterApi {
    readonly type: string;
    setting: MiraiApiHttpClientSetting;

    session?: string;

    isListening?: boolean;
    messageHandler?: MessageHandler;
    eventHandler?: EventHandler;

    getAbout?(): Promise<AboutResponse>;

    getMessageFromId?(messageId: number): Promise<MessageFromIdResponse>;

    getFriendList?(): Promise<FriendListResponse>;

    getGroupList?(): Promise<GroupListResponse>;

    getMemberList?(groupId: number): Promise<MemberListResponse>;

    getBotProfile?(): Promise<ProfileResponse>;

    getFriendProfile?(friendId: number): Promise<ProfileResponse>;

    getMemberProfile?(groupId: number, memberId: number): Promise<ProfileResponse>;

    sendFriendMessage?(friendId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;

    sendGroupMessage?(groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;

    sendTempMessage?(memberId: number, groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;

    sendNudge?(targetId: number, subjectId: number, kind: NudgeKind): Promise<ApiResponse>;

    recall?(messageId: number): Promise<ApiResponse>;

    deleteFriend?(friendId: number): Promise<ApiResponse>;

    muteMember?(memberId: number, groupId: number, time: number): Promise<ApiResponse>;

    unmuteMember?(memberId: number, groupId: number): Promise<ApiResponse>;

    kickMember?(memberId: number, groupId: number, message: string): Promise<ApiResponse>;

    quitGroup?(groupId: number): Promise<ApiResponse>;

    muteAll?(groupId: number): Promise<ApiResponse>;

    unmuteAll?(groupId: number): Promise<ApiResponse>;

    setEssence?(messageId: number): Promise<ApiResponse>;

    getGroupConfig?(groupId: number): Promise<GroupConfigResponse>;

    setGroupConfig?(groupId: number, config: GroupConfig): Promise<ApiResponse>;

    getMemberInfo?(memberId: number, groupId: number): Promise<GroupMemberResponse>;

    setMemberInfo?(memberId: number, groupId: number, info: GroupMember): Promise<ApiResponse>;

    handleNewFriendRequest?(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    handleMemberJoinRequest?(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    handleBotInvitedJoinGroupRequest?(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;

    getGroupFileList?(parentFileId: string, groupId: number, withDownloadInfo?: boolean): Promise<FileListResponse>;

    getGroupFileInfo?(fileId: string, groupId: number, withDownloadInfo?: boolean): Promise<FileInfoResponse>;

    createGroupFileDirectory?(parentFileId: string, directoryName: string, groupId: number): Promise<FileInfoResponse>;

    deleteGroupFile?(fileId: string, groupId: number): Promise<ApiResponse>;

    moveGroupFile?(fileId: string, groupId: number, moveToDirectoryId: string): Promise<ApiResponse>;

    renameGroupFile?(fileId: string, groupId: number, name: string): Promise<ApiResponse>;

    verify?(): Promise<VerifyResponse>;

    bind?(qq: number): Promise<ApiResponse>;

    release?(qq: number): Promise<ApiResponse>;

    executeCommand?(command: MessageChain): Promise<ApiResponse>;

    registerCommand?(name: string, alias: string[], usage: string, description: string): Promise<ApiResponse>;

    uploadImage?(uploadType: UploadType, imageData: ReadStream): Promise<UploadImageResponse>;

    uploadVoice?(uploadType: UploadType, voiceData: ReadStream): Promise<UploadVoiceResponse>;

    uploadGroupFile?(uploadType: UploadType, path: string, fileData: ReadStream): Promise<FileOverview>;

    listen?(): Promise<any>;

    stop?(): Promise<any>;
}
