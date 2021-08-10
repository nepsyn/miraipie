/**
 * 联系人
 */
export interface Contact {
    /**
     * 联系人账号
     */
    id: number;
}

/**
 * 好友
 */
export interface Friend extends Contact {
    /**
     * 昵称
     */
    nickname: string;
    /**
     * 备注
     */
    remark: string;
}

/**
 * 群权限类型
 */
export type GroupPermission = 'OWNER' | 'ADMINISTRATOR' | 'MEMBER';

/**
 * 群聊
 */
export interface Group extends Contact {
    /**
     * 群名
     */
    name: string;
    /**
     * 机器人在群中权限
     */
    permission: GroupPermission;
}

/**
 * 群成员
 */
export interface GroupMember extends Contact {
    /**
     * 群成员名称
     */
    memberName: string;
    /**
     * 头衔
     */
    specialTitle: string;
    /**
     * 成员权限
     */
    permission: GroupPermission;
    /**
     * 入群时间戳
     */
    joinTimestamp: number;
    /**
     * 最近发言时间戳
     */
    lastSpeakTimestamp: number;
    /**
     * 剩余禁言时间(秒)
     */
    muteTimeRemaining: number;
    /**
     * 所在群聊
     */
    group: Group;
}

/**
 * 平台类型
 */
export type PlatformType = 'IOS' | 'MOBILE' | 'WINDOWS';

/**
 * 其他设备
 */
export interface OtherClient extends Contact {
    /**
     * 设备平台
     */
    platform: PlatformType;
}
