import {Contact} from '.';

export type SexType = 'UNKNOWN' | 'MALE' | 'FEMALE';

export interface Profile {
    nickname: string;
    email: string;
    age: number;
    level: number;
    sign: string;
    sex: SexType;
}

export interface FileOverview {
    name: string;
    id: string;
    path: string;
    parent?: FileOverview;
    contact: Contact;
    isFile: boolean;
    isDirectory: boolean;
}

export interface GroupConfig {
    name: string;
    announcement: string;
    confessTalk: boolean;
    allowMemberInvite: boolean;
    autoApprove: boolean;
    anonymousChat: boolean;
}
