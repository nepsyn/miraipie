import {ChatMessage, Event, FileOverview, Friend, Group, GroupConfig, GroupMember, Profile} from '..';

export enum ResponseCode {
    Success = 0,
    WrongVerifyKey = 1,
    BotNotExist = 2,
    SessionNotExist = 3,
    UnverifiedSession = 4,
    TargetNotExist = 5,
    FileNotExist = 6,
    NoPermission = 10,
    BotIsMuted = 20,
    MessageTooLong = 30,
    BadRequest = 400
}

export interface VerifyResponse {
    code: ResponseCode;
    session: string;
}

export interface ApiResponse {
    code: ResponseCode;
    msg: string;
    data?: object;
}

export interface AboutResponse extends ApiResponse {
    data: {
        version: string
    }
}

export interface MessageRetrieveResponse extends ApiResponse {
    data: Array<ChatMessage | Event>;
}

export interface MessageFromIdResponse extends ApiResponse {
    data: ChatMessage | Event;
}

export interface FriendListResponse extends ApiResponse {
    data: Friend[];
}

export interface GroupListResponse extends ApiResponse {
    data: Group[];
}

export interface MemberListResponse extends ApiResponse {
    data: GroupMember[];
}

export interface ProfileResponse extends ApiResponse {
    data: Profile;
}

export interface SendMessageResponse extends ApiResponse {
    messageId: number;
}

export interface FileListResponse extends ApiResponse {
    data: FileOverview[];
}

export interface FileInfoResponse extends ApiResponse {
    data: FileOverview;
}

export interface GroupConfigResponse extends ApiResponse {
    data: GroupConfig;
}

export interface GroupMemberResponse extends ApiResponse {
    data: GroupMember;
}

export interface UploadImageResponse {
    imageId: string;
    url: string;
}

export interface UploadVoiceResponse {
    voiceId: string;
    url: string;
}
