/// <reference types="node" />
import { ReadStream } from 'fs';
import { AboutResponse, ApiResponse, EventHandler, FileInfoResponse, FileListResponse, FriendListResponse, GroupConfigResponse, GroupListResponse, GroupMemberResponse, MemberListResponse, MessageFromIdResponse, MessageHandler, MiraiApiHttpAdapterApi, MiraiApiHttpClientSetting, ProfileResponse, SendMessageResponse, UploadImageResponse, UploadType, UploadVoiceResponse, VerifyResponse } from '.';
import { FileOverview, GroupConfig, GroupMember, MessageChain, NudgeKind, SingleMessage } from '..';
declare type MiraiApiHttpAdapterSetting = MiraiApiHttpClientSetting & {
    messageHandler?: MessageHandler;
    eventHandler?: EventHandler;
};
/**
 * mirai-api-http 提供的 http adapter<br/>
 * <a href="https://github.com/project-mirai/mirai-api-http/blob/master/docs/adapter/HttpAdapter.md">文档<a/>
 */
export declare class HttpAdapter implements MiraiApiHttpAdapterApi {
    readonly type = "HttpAdapter";
    setting: MiraiApiHttpClientSetting;
    session: string;
    isListening: boolean;
    messageHandler?: MessageHandler;
    eventHandler?: EventHandler;
    constructor(options: MiraiApiHttpAdapterSetting);
    private request;
    private get;
    private post;
    verify(): Promise<VerifyResponse>;
    bind(qq?: number): Promise<ApiResponse>;
    release(qq?: number): Promise<ApiResponse>;
    listen(): Promise<void>;
    stop(): Promise<void>;
    getAbout(): Promise<AboutResponse>;
    getMessageFromId(messageId: number): Promise<MessageFromIdResponse>;
    getFriendList(): Promise<FriendListResponse>;
    getGroupList(): Promise<GroupListResponse>;
    getMemberList(groupId: number): Promise<MemberListResponse>;
    getBotProfile(): Promise<ProfileResponse>;
    getFriendProfile(friendId: number): Promise<ProfileResponse>;
    getMemberProfile(groupId: number, memberId: number): Promise<ProfileResponse>;
    sendFriendMessage(friendId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;
    sendGroupMessage(groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;
    sendTempMessage(memberId: number, groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;
    sendNudge(targetId: number, subjectId: number, kind: NudgeKind): Promise<ApiResponse>;
    recall(messageId: number): Promise<ApiResponse>;
    getGroupFileList(parentFileId: string, groupId: number, offset?: number, size?: number, withDownloadInfo?: boolean): Promise<FileListResponse>;
    getGroupFileInfo(fileId: string, groupId: number, withDownloadInfo?: boolean): Promise<FileInfoResponse>;
    createGroupFileDirectory(parentFileId: string, directoryName: string, groupId: number): Promise<FileInfoResponse>;
    deleteGroupFile(fileId: string, groupId: number): Promise<ApiResponse>;
    moveGroupFile(fileId: string, groupId: number, moveToDirectoryId: string): Promise<ApiResponse>;
    renameGroupFile(fileId: string, groupId: number, name: string): Promise<ApiResponse>;
    deleteFriend(friendId: number): Promise<ApiResponse>;
    muteMember(memberId: number, groupId: number, time: number): Promise<ApiResponse>;
    unmuteMember(memberId: number, groupId: number): Promise<ApiResponse>;
    kickMember(memberId: number, groupId: number, message: string): Promise<ApiResponse>;
    quitGroup(groupId: number): Promise<ApiResponse>;
    muteAll(groupId: number): Promise<ApiResponse>;
    unmuteAll(groupId: number): Promise<ApiResponse>;
    setEssence(messageId: number): Promise<ApiResponse>;
    getGroupConfig(groupId: number): Promise<GroupConfigResponse>;
    setGroupConfig(groupId: number, config: GroupConfig): Promise<ApiResponse>;
    getMemberInfo(memberId: number, groupId: number): Promise<GroupMemberResponse>;
    setMemberInfo(memberId: number, groupId: number, info: GroupMember): Promise<ApiResponse>;
    handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;
    handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;
    handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;
    uploadImage(uploadType: UploadType, imageData: ReadStream): Promise<UploadImageResponse>;
    uploadVoice(uploadType: UploadType, voiceData: ReadStream): Promise<UploadVoiceResponse>;
    uploadGroupFile(uploadType: UploadType, path: string, fileData: ReadStream): Promise<FileOverview>;
}
/**
 * mirai-api-http 提供的 websocket adapter<br/>
 * <a href="https://github.com/project-mirai/mirai-api-http/blob/master/docs/adapter/WebsocketAdapter.md">文档<a/>
 */
export declare class WebsocketAdapter implements MiraiApiHttpAdapterApi {
    readonly type = "WebsocketAdapter";
    setting: MiraiApiHttpClientSetting;
    isListening: boolean;
    private ws;
    private queue;
    private syncIdGenerator;
    messageHandler?: MessageHandler;
    eventHandler?: EventHandler;
    constructor(options: MiraiApiHttpAdapterSetting);
    private static generateSyncId;
    private request;
    listen(qq?: number): Promise<void>;
    stop(): Promise<void>;
    getAbout(): Promise<AboutResponse>;
    getMessageFromId(messageId: number): Promise<MessageFromIdResponse>;
    getFriendList(): Promise<FriendListResponse>;
    getGroupList(): Promise<GroupListResponse>;
    getMemberList(groupId: number): Promise<MemberListResponse>;
    getBotProfile(): Promise<ProfileResponse>;
    getFriendProfile(friendId: number): Promise<ProfileResponse>;
    getMemberProfile(groupId: number, memberId: number): Promise<ProfileResponse>;
    sendFriendMessage(friendId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;
    sendGroupMessage(groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;
    sendTempMessage(memberId: number, groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse>;
    sendNudge(targetId: number, subjectId: number, kind: NudgeKind): Promise<ApiResponse>;
    recall(messageId: number): Promise<ApiResponse>;
    getGroupFileList(parentFileId: string, groupId: number, offset?: number, size?: number, withDownloadInfo?: boolean): Promise<FileListResponse>;
    getGroupFileInfo(fileId: string, groupId: number, withDownloadInfo?: boolean): Promise<FileInfoResponse>;
    createGroupFileDirectory(parentFileId: string, directoryName: string, groupId: number): Promise<FileInfoResponse>;
    deleteGroupFile(fileId: string, groupId: number): Promise<ApiResponse>;
    moveGroupFile(fileId: string, groupId: number, moveToDirectoryId: string): Promise<ApiResponse>;
    renameGroupFile(fileId: string, groupId: number, name: string): Promise<ApiResponse>;
    deleteFriend(friendId: number): Promise<ApiResponse>;
    muteMember(memberId: number, groupId: number, time: number): Promise<ApiResponse>;
    unmuteMember(memberId: number, groupId: number): Promise<ApiResponse>;
    kickMember(memberId: number, groupId: number, message: string): Promise<ApiResponse>;
    quitGroup(groupId: number): Promise<ApiResponse>;
    muteAll(groupId: number): Promise<ApiResponse>;
    unmuteAll(groupId: number): Promise<ApiResponse>;
    setEssence(messageId: number): Promise<ApiResponse>;
    getGroupConfig(groupId: number): Promise<GroupConfigResponse>;
    setGroupConfig(groupId: number, config: GroupConfig): Promise<ApiResponse>;
    getMemberInfo(memberId: number, groupId: number): Promise<GroupMemberResponse>;
    setMemberInfo(memberId: number, groupId: number, info: GroupMember): Promise<ApiResponse>;
    handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;
    handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;
    handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse>;
}
export declare const MiraiApiHttpAdapterMap: {
    HttpAdapter: typeof HttpAdapter;
    WebsocketAdapter: typeof WebsocketAdapter;
};
export declare type MiraiApiHttpAdapterType = keyof typeof MiraiApiHttpAdapterMap;
export declare function getMiraiApiHttpAdapter(name: MiraiApiHttpAdapterType | string, options: MiraiApiHttpAdapterSetting): MiraiApiHttpAdapterApi;
export {};
