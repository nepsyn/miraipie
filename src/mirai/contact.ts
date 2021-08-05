export interface Contact {
    id: number;
}

export interface Friend extends Contact {
    nickname: string;
    remark: string;
}

export type GroupPermission = 'OWNER' | 'ADMINISTRATOR' | 'MEMBER';

export interface Group extends Contact {
    name: string;
    permission: GroupPermission;
}

export interface GroupMember extends Contact {
    memberName: string;
    specialTitle: string;
    permission: GroupPermission;
    joinTimestamp: number;
    lastSpeakTimestamp: number;
    muteTimeRemaining: number;
    group: Group;
}

export type PlatformType = 'IOS' | 'MOBILE' | 'WINDOWS';

export interface OtherClient extends Contact {
    platform: PlatformType;
}
