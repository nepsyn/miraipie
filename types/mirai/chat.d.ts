import { Contact, Friend, GroupMember, MessageChain, OtherClient } from '.';
export interface ChatMessage {
    readonly type: ChatMessageType;
    sender: Contact;
    messageChain: MessageChain;
}
export interface FriendMessage extends ChatMessage {
    type: 'FriendMessage';
    sender: Friend;
}
export interface GroupMessage extends ChatMessage {
    type: 'GroupMessage';
    sender: GroupMember;
}
export interface TempMessage extends ChatMessage {
    type: 'TempMessage';
    sender: GroupMember;
}
export interface StrangerMessage extends ChatMessage {
    type: 'StrangerMessage';
    sender: Friend;
}
export interface OtherClientMessage extends ChatMessage {
    type: 'OtherClientMessage';
    sender: OtherClient;
}
export declare type ChatMessageMap = {
    FriendMessage: FriendMessage;
    GroupMessage: GroupMessage;
    TempMessage: TempMessage;
    StrangerMessage: StrangerMessage;
    OtherClientMessage: OtherClientMessage;
};
export declare type ChatMessageType = keyof ChatMessageMap;
