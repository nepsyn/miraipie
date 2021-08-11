import { Contact } from '.';
/**
 * 个人资料性别类型
 */
export declare type SexType = 'UNKNOWN' | 'MALE' | 'FEMALE';
/**
 * 个人资料
 */
export interface Profile {
    /**
     * 昵称
     */
    nickname: string;
    /**
     * 邮箱地址
     */
    email: string;
    /**
     * 年龄
     */
    age: number;
    /**
     * 等级
     */
    level: number;
    /**
     * 个性签名
     */
    sign: string;
    /**
     * 性别
     */
    sex: SexType;
}
/**
 * 文件概览
 */
export interface FileOverview {
    /**
     * 文件名
     */
    name: string;
    /**
     * 文件id
     */
    id: string;
    /**
     * 文件路径
     */
    path: string;
    /**
     * 上级文件
     */
    parent?: FileOverview;
    /**
     * 文件所属Contact
     */
    contact: Contact;
    /**
     * 是否为文件
     */
    isFile: boolean;
    /**
     * 是否为文件夹
     */
    isDirectory: boolean;
    /**
     * 文件下载信息
     */
    downloadInfo?: {
        /**
         * 文件sha1
         */
        sha1: string;
        /**
         * 文件md5
         */
        md5: string;
        /**
         * 文件下载链接
         */
        url: string;
    };
}
/**
 * 群设置
 */
export interface GroupConfig {
    /**
     * 群名
     */
    name: string;
    /**
     * 群公告
     */
    announcement: string;
    /**
     * 是否开启坦白说
     */
    confessTalk: boolean;
    /**
     * 是否允许群员邀请
     */
    allowMemberInvite: boolean;
    /**
     * 是否开启自动审批入群
     */
    autoApprove: boolean;
    /**
     * 是否允许匿名聊天
     */
    anonymousChat: boolean;
}
