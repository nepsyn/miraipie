import { ChatMessage, Event, FileOverview, Friend, Group, GroupConfig, GroupMember, Profile } from '..';
/**
 * mirai-api-http请求返回的状态码
 */
export declare enum ResponseCode {
    /**
     * 正常
     */
    Success = 0,
    /**
     * 错误的verify key
     */
    WrongVerifyKey = 1,
    /**
     * 指定的Bot不存在
     */
    BotNotExist = 2,
    /**
     * Session失效或不存在
     */
    SessionNotExist = 3,
    /**
     * Session未认证(未激活)
     */
    UnverifiedSession = 4,
    /**
     * 发送消息目标不存在(指定对象不存在)
     */
    TargetNotExist = 5,
    /**
     * 指定文件不存在，出现于发送本地图片
     */
    FileNotExist = 6,
    /**
     * 无操作权限，指Bot没有对应操作的限权
     */
    NoPermission = 10,
    /**
     * Bot被禁言，指Bot当前无法向指定群发送消息
     */
    BotIsMuted = 20,
    /**
     * 消息过长
     */
    MessageTooLong = 30,
    /**
     * 错误的访问，如参数错误等
     */
    BadRequest = 400
}
/**
 * 认证响应
 */
export interface VerifyResponse {
    /**
     * 状态码
     */
    code: ResponseCode;
    /**
     * 会话Session
     */
    session: string;
}
/**
 * Api请求的响应
 */
export interface ApiResponse {
    /**
     * 状态码
     */
    code: ResponseCode;
    /**
     * 消息
     */
    msg: string;
    /**
     * 响应数据
     */
    data?: object;
}
/**
 * 获取插件信息响应
 */
export interface AboutResponse extends ApiResponse {
    data: {
        /**
         * mirai-api-http版本
         */
        version: string;
    };
}
/**
 * 获取历史消息响应
 */
export interface MessageRetrieveResponse extends ApiResponse {
    /**
     * 消息、事件列表
     */
    data: Array<ChatMessage | Event>;
}
/**
 * 根据id获取消息响应
 */
export interface MessageFromIdResponse extends ApiResponse {
    /**
     * 消息
     */
    data: ChatMessage;
}
/**
 * 获取好友列表响应
 */
export interface FriendListResponse extends ApiResponse {
    /**
     * 好友列表
     */
    data: Friend[];
}
/**
 * 获取群列表响应
 */
export interface GroupListResponse extends ApiResponse {
    /**
     * 群列表
     */
    data: Group[];
}
/**
 * 获取群成员列表响应
 */
export interface MemberListResponse extends ApiResponse {
    /**
     * 群成员列表
     */
    data: GroupMember[];
}
/**
 * 获取资料响应
 */
export interface ProfileResponse extends ApiResponse {
    /**
     * 个人资料
     */
    data: Profile;
}
/**
 * 发送消息响应
 */
export interface SendMessageResponse extends ApiResponse {
    /**
     * 已发送消息id
     */
    messageId: number;
}
/**
 * 查看文件列表响应
 */
export interface FileListResponse extends ApiResponse {
    /**
     * 文件概览列表
     */
    data: FileOverview[];
}
/**
 * 获取文件信息响应
 */
export interface FileInfoResponse extends ApiResponse {
    /**
     * 文件概览
     */
    data: FileOverview;
}
/**
 * 获取群设置响应
 */
export interface GroupConfigResponse extends ApiResponse {
    /**
     * 群设置
     */
    data: GroupConfig;
}
/**
 * 获取群成员信息响应
 */
export interface GroupMemberResponse extends ApiResponse {
    /**
     * 群成员信息
     */
    data: GroupMember;
}
/**
 * 图片上传响应
 */
export interface UploadImageResponse {
    /**
     * 图片id
     */
    imageId: string;
    /**
     * 图片下载链接
     */
    url: string;
}
/**
 * 语音上传响应
 */
export interface UploadVoiceResponse {
    /**
     * 语音id
     */
    voiceId: string;
    /**
     * 语音下载链接
     */
    url: string;
}
/**
 * 文件上传响应
 */
export declare type UploadFileResponse = FileOverview;
