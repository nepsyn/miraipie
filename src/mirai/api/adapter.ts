import axios, {AxiosRequestConfig} from 'axios';
import FormData from 'form-data';
import {ReadStream} from 'fs';
import log4js from 'log4js';
import WebSocket from 'ws';
import {
    AboutResponse,
    ApiResponse,
    EventHandler,
    FileInfoResponse,
    FileListResponse,
    FriendListResponse,
    GroupConfigResponse,
    GroupListResponse,
    GroupMemberResponse,
    MemberListResponse,
    MessageFromIdResponse,
    MessageHandler,
    MessageRetrieveResponse,
    MiraiApiHttpAdapterApi,
    MiraiApiHttpClientSetting,
    ProfileResponse,
    ResponseCode,
    SendMessageResponse,
    UploadImageResponse,
    UploadType,
    UploadVoiceResponse,
    VerifyResponse
} from '.';
import {ChatMessage, Event, FileOverview, GroupConfig, GroupMember, MessageChain, NudgeKind, SingleMessage} from '..';
import {MiraiPieApp} from '../../pie';
import {sleep} from '../../tool';

const logger = log4js.getLogger('adapter');

type MiraiApiHttpAdapterSetting = MiraiApiHttpClientSetting & {
    messageHandler?: MessageHandler;
    eventHandler?: EventHandler
};

export class HttpAdapter implements MiraiApiHttpAdapterApi {
    readonly type = 'HttpAdapter';
    setting: MiraiApiHttpClientSetting;
    session: string;
    isListening: boolean;
    messageHandler?: MessageHandler;
    eventHandler?: EventHandler;

    constructor(options: MiraiApiHttpAdapterSetting) {
        this.messageHandler = options.messageHandler;
        this.eventHandler = options.eventHandler;

        this.setting = {
            verifyKey: options.verifyKey,
            host: options.host,
            port: options.port
        };
    }

    private async request<T>(uri: string, data: object, method: 'GET' | 'POST', requireSession: boolean = true, multipart: boolean = false): Promise<T> {
        const config: AxiosRequestConfig = {
            method,
            url: `http://${this.setting.host}:${this.setting.port}/${uri}`,
            headers: {}
        };

        if (method === 'POST') config.data = data;
        else config.params = data;
        if (multipart) config.headers = (data as FormData).getHeaders();
        if (requireSession) {
            if (!this.session) {
                await this.verify();
                await this.bind();
                if (!this.session) logger.error('session未绑定或已失效');
            }
            config.headers.sessionKey = this.session;
        }

        try {
            const resp = (await axios.request<T>(config)).data;
            if ('code' in resp && resp['code'] !== ResponseCode.Success) {
                logger.warn(`发送的请求未能达到预期的效果, 错误原因: ${ResponseCode[resp['code']]}, 请求原始数据:`, data);
            }
            return resp;
        } catch (err) {
            logger.error('发送请求错误, 请求原始数据:', data, err);
        }
    }

    private async get<T>(uri: string, params?: object, requireSession: boolean = true, multipart: boolean = false): Promise<T> {
        return this.request<T>(uri, params, 'GET', requireSession, multipart);
    }

    private async post<T>(uri: string, data?: object, requireSession: boolean = true, multipart: boolean = false): Promise<T> {
        return this.request<T>(uri, data, 'POST', requireSession, multipart);
    }

    async verify(): Promise<VerifyResponse> {
        return new Promise<VerifyResponse>((resolve, reject) => {
            this.post<VerifyResponse>('verify', {verifyKey: this.setting.verifyKey}, false).then((res) => {
                if (res.code === ResponseCode.WrongVerifyKey) logger.error(`认证失败, 错误的verifyKey`);
                else this.session = res.session;
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    async bind(qq?: number): Promise<ApiResponse> {
        const id = qq || MiraiPieApp.instance.id;
        return this.post<ApiResponse>('bind', {sessionKey: this.session, qq: id}, false);
    }

    async release(qq?: number): Promise<ApiResponse> {
        const id = qq || MiraiPieApp.instance.id;
        return new Promise<ApiResponse>((resolve, reject) => {
            this.post<ApiResponse>('release', {sessionKey: this.session, qq: id}, false).then((res) => {
                this.session = null;
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    async listen() {
        if (!this.isListening) {
            let first = true;
            while (this.isListening || first) {
                try {
                    const resp = await this.get<MessageRetrieveResponse>('fetchMessage', {count: 30});
                    if (resp.code === ResponseCode.Success) {
                        if (first) {
                            this.isListening = true;
                            logger.info(`${this.type}监听器启动成功`);
                        }
                        for (const i of resp.data) {
                            if (i.type.endsWith('Message')) this.messageHandler(i as ChatMessage);
                            else this.eventHandler(i as Event);
                        }
                    } else {
                        logger.error(`${this.type}监听器启动失败, 错误原因: ${ResponseCode[resp.code]}`);
                    }
                    first = false;
                } catch (err) {
                    logger.log('监听时发生错误:', err);
                    this.isListening = false;
                }
                await sleep(500);
            }
        }
    }

    async stop() {
        this.isListening = false;
    }

    async getAbout(): Promise<AboutResponse> {
        return this.get('about', null, false);
    }

    async getMessageFromId(messageId: number): Promise<MessageFromIdResponse> {
        return this.get('messageFromId', {id: messageId});
    }

    async getFriendList(): Promise<FriendListResponse> {
        return this.get('friendList');
    }

    async getGroupList(): Promise<GroupListResponse> {
        return this.get('groupList');
    }

    async getMemberList(groupId: number): Promise<MemberListResponse> {
        return this.get('memberList', {target: groupId});
    }

    async getBotProfile(): Promise<ProfileResponse> {
        return this.get('botProfile');
    }

    async getFriendProfile(friendId: number): Promise<ProfileResponse> {
        return this.get('friendProfile', {target: friendId});
    }

    async getMemberProfile(groupId: number, memberId: number): Promise<ProfileResponse> {
        return this.get('memberProfile', {target: groupId, memberId});
    }

    async sendFriendMessage(friendId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse> {
        return this.post('sendFriendMessage', {
            target: friendId,
            messageChain,
            quote: quoteMessageId
        });
    }

    async sendGroupMessage(groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse> {
        return this.post('sendGroupMessage', {
            target: groupId,
            messageChain,
            quote: quoteMessageId
        });
    }

    async sendTempMessage(memberId: number, groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse> {
        return this.post('sendTempMessage', {
            qq: memberId,
            group: groupId,
            messageChain,
            quote: quoteMessageId
        });
    }

    async sendNudge(targetId: number, subjectId: number, kind: NudgeKind): Promise<ApiResponse> {
        return this.post('sendNudge', {target: targetId, subject: subjectId, kind});
    }

    async recall(messageId: number): Promise<ApiResponse> {
        return this.post('recall', {target: messageId});
    }

    async getGroupFileList(parentFileId: string, groupId: number): Promise<FileListResponse> {
        return this.get('/file/list', {id: parentFileId, group: groupId});
    }

    async getGroupFileInfo(fileId: string, groupId: number): Promise<FileInfoResponse> {
        return this.get('file/info', {id: fileId, group: groupId});
    }

    async createGroupFileDirectory(parentFileId: string, directoryName: string, groupId: number): Promise<FileInfoResponse> {
        return this.post('file/mkdir', {id: parentFileId, group: groupId, directoryName});
    }

    async deleteGroupFile(fileId: string, groupId: number): Promise<ApiResponse> {
        return this.post('file/delete', {id: fileId, group: groupId});
    }

    async moveGroupFile(fileId: string, groupId: number, moveToDirectoryId: string): Promise<ApiResponse> {
        return this.post('file/move', {id: fileId, group: groupId, moveTo: moveToDirectoryId});
    }

    async renameGroupFile(fileId: string, groupId: number, name: string): Promise<ApiResponse> {
        return this.post('file/rename', {id: fileId, group: groupId, renameTo: name});
    }

    async deleteFriend(friendId: number): Promise<ApiResponse> {
        return this.post('deleteFriend', {target: friendId});
    }

    async muteMember(memberId: number, groupId: number, time: number): Promise<ApiResponse> {
        return this.post('mute', {target: groupId, memberId});
    }

    async unmuteMember(memberId: number, groupId: number): Promise<ApiResponse> {
        return this.post('unmute', {target: groupId, memberId});
    }

    async kickMember(memberId: number, groupId: number, message: string): Promise<ApiResponse> {
        return this.post('kick', {target: groupId, memberId, msg: message});
    }

    async quitGroup(groupId: number): Promise<ApiResponse> {
        return this.post('quit', {target: groupId});
    }

    async muteAll(groupId: number): Promise<ApiResponse> {
        return this.post('muteAll', {target: groupId});
    }

    async unmuteAll(groupId: number): Promise<ApiResponse> {
        return this.post('unmuteAll', {target: groupId});
    }

    async setEssence(messageId: number): Promise<ApiResponse> {
        return this.post('setEssence', {target: messageId});
    }

    async getGroupConfig(groupId: number): Promise<GroupConfigResponse> {
        return this.get('groupConfig', {target: groupId});
    }

    async setGroupConfig(groupId: number, config: GroupConfig): Promise<ApiResponse> {
        return this.post('groupConfig', {target: groupId, config})
    }

    async getMemberInfo(memberId: number, groupId: number): Promise<GroupMemberResponse> {
        return this.get('memberInfo', {target: groupId, memberId});
    }

    async setMemberInfo(memberId: number, groupId: number, info: GroupMember): Promise<ApiResponse> {
        return this.post('memberInfo', {target: groupId, memberId, info});
    }

    async handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse> {
        return this.post('resp/newFriendRequestEvent', {eventId, fromId, groupId, operate, message});
    }

    async handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse> {
        return this.post('resp/memberJoinRequestEvent', {eventId, fromId, groupId, operate, message});
    }

    async handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse> {
        return this.post('resp/botInvitedJoinGroupRequestEvent', {
            eventId,
            fromId,
            groupId,
            operate,
            message
        });
    }

    async uploadImage(uploadType: UploadType, imageData: ReadStream): Promise<UploadImageResponse> {
        const data = new FormData();
        data.append('type', uploadType);
        data.append('img', imageData);
        return this.post('uploadImage', data, true, true);
    }

    async uploadVoice(uploadType: UploadType, voiceData: ReadStream): Promise<UploadVoiceResponse> {
        const data = new FormData();
        data.append('type', uploadType);
        data.append('voice', voiceData);
        return this.post('uploadVoice', data, true, true);
    }

    async uploadGroupFile(uploadType: UploadType, path: string, fileData: ReadStream): Promise<FileOverview> {
        const data = new FormData();
        data.append('type', uploadType);
        data.append('path', path);
        data.append('file', fileData);
        return this.post('uploadFile', data, true, true);
    }
}

export class WebsocketAdapter implements MiraiApiHttpAdapterApi {
    readonly type = 'WebsocketAdapter';
    setting: MiraiApiHttpClientSetting;
    isListening: boolean;
    private ws: WebSocket;
    private queue: Map<number, ApiResponse>;
    private syncIdGenerator: Generator;
    messageHandler?: MessageHandler;
    eventHandler?: EventHandler;

    constructor(options: MiraiApiHttpAdapterSetting) {
        this.messageHandler = options.messageHandler;
        this.eventHandler = options.eventHandler;

        this.setting = {
            verifyKey: options.verifyKey,
            host: options.host,
            port: options.port
        };

        this.queue = new Map();
        this.syncIdGenerator = WebsocketAdapter.generateSyncId();
    }

    private static* generateSyncId(): Generator<number> {
        let syncId = 1;
        while (true) {
            syncId %= 100;
            yield syncId;
        }
    }

    private async request<T extends ApiResponse>(command: string, content: object = {}, subCommand: string = null): Promise<T> {
        const syncId = this.syncIdGenerator.next().value;
        if (!this.isListening) {
            await this.listen();
            await sleep(1000);
        }
        if (this.isListening) {
            const data = {syncId, command, subCommand, content};
            this.ws.send(JSON.stringify(data), (err) => {
                if (err) logger.error('发送请求错误, 请求原始数据:', data, err);
            });

            let timeOutCounter = 0;
            while (!this.queue.has(syncId) && timeOutCounter < 20) {
                await sleep(100);
                timeOutCounter++;
            }

            const resp = this.queue.get(syncId);
            if (resp) {
                this.queue.delete(syncId);
                return resp as T;
            } else {
                logger.error('发送的请求已超时, 请求原始数据:', data);
            }
        }
    }

    async listen(qq?: number) {
        if (!this.isListening) {
            const id = qq || MiraiPieApp.instance.id;
            this.ws = new WebSocket(`ws://${this.setting.host}:${this.setting.port}/all?verifyKey=${this.setting.verifyKey}&qq=${id}`);
            this.ws.on('error', (err) => {
                logger.error(`WebsocketAdapter 监听器启动错误:`, err);
            });
            this.ws.on('message', (buffer: Buffer) => {
                const message: { syncId: string, data: ChatMessage | Event | ApiResponse } = JSON.parse(buffer.toString());
                if ('syncId' in message && 'data' in message) {
                    const data = message.data;
                    if ('type' in data) {
                        if (data.type.endsWith('Message')) this.messageHandler(data as ChatMessage);
                        else if ( data.type.endsWith('Event')) this.eventHandler(data as Event);
                    } else if ('code' in data) {
                        if (data.code === ResponseCode.Success) {
                            this.isListening = true;
                            logger.info(`${this.type}监听器启动成功`);
                        } else {
                            logger.error(`${this.type}监听器启动失败, 错误原因: ${ResponseCode[data.code]}`);
                        }
                    } else {
                        this.queue.set(parseInt(message.syncId), message.data as ApiResponse);
                    }
                } else {
                    if ('code' in message) {
                        logger.error(`监听失败, 错误原因: ${ResponseCode[message['code']]}`);
                        this.ws.close();
                    } else {
                        logger.warn('未能解析的数据:', message);
                    }
                }
            });
        }
    }

    async stop() {
        if (this.ws && this.ws.readyState === this.ws.OPEN) {
            this.ws.close();
            this.isListening = false;
        }
    }

    async getAbout(): Promise<AboutResponse> {
        return await this.request('about');
    }

    async getMessageFromId(messageId: number): Promise<MessageFromIdResponse> {
        return await this.request('messageFromId', {target: messageId});
    }

    async getFriendList(): Promise<FriendListResponse> {
        return await this.request('friendList');
    }

    async getGroupList(): Promise<GroupListResponse> {
        return await this.request('groupList');
    }

    async getMemberList(groupId: number): Promise<MemberListResponse> {
        return await this.request('memberList', {target: groupId});
    }

    async getBotProfile(): Promise<ProfileResponse> {
        return await this.request('botProfile');
    }

    async getFriendProfile(friendId: number): Promise<ProfileResponse> {
        return await this.request('friendProfile', {target: friendId});
    }

    async getMemberProfile(groupId: number, memberId: number): Promise<ProfileResponse> {
        return await this.request('memberProfile', {target: groupId, memberId});
    }

    async sendFriendMessage(friendId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse> {
        return await this.request('sendFriendMessage', {qq: friendId, messageChain, quote: quoteMessageId});
    }

    async sendGroupMessage(groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse> {
        return await this.request('sendGroupMessage', {group: groupId, messageChain, quote: quoteMessageId});
    }

    async sendTempMessage(memberId: number, groupId: number, messageChain: MessageChain | SingleMessage[], quoteMessageId?: number): Promise<SendMessageResponse> {
        return await this.request('sendTempMessage', {
            qq: memberId,
            group: groupId,
            messageChain,
            quote: quoteMessageId
        });
    }

    async sendNudge(targetId: number, subjectId: number, kind: NudgeKind): Promise<ApiResponse> {
        return await this.request('sendNudge', {target: targetId, subject: subjectId, kind});
    }

    async recall(messageId: number): Promise<ApiResponse> {
        return await this.request('recall', {target: messageId});
    }

    async getGroupFileList(parentFileId: string, groupId: number): Promise<FileListResponse> {
        return await this.request('file_list', {id: parentFileId, target: groupId});
    }

    async getGroupFileInfo(fileId: string, groupId: number): Promise<FileInfoResponse> {
        return await this.request('file_info', {id: fileId, target: groupId});
    }

    async createGroupFileDirectory(parentFileId: string, directoryName: string, groupId: number): Promise<FileInfoResponse> {
        return await this.request('file_mkdir', {id: parentFileId, target: groupId, directoryName});
    }

    async deleteGroupFile(fileId: string, groupId: number): Promise<ApiResponse> {
        return await this.request('file_delete', {id: fileId, target: groupId});
    }

    async moveGroupFile(fileId: string, groupId: number, moveToDirectoryId: string): Promise<ApiResponse> {
        return await this.request('file_move', {id: fileId, target: groupId, moveTo: moveToDirectoryId});
    }

    async renameGroupFile(fileId: string, groupId: number, name: string): Promise<ApiResponse> {
        return await this.request('file_rename', {id: fileId, target: groupId, renameTo: name});
    }

    async deleteFriend(friendId: number): Promise<ApiResponse> {
        return await this.request('deleteFriend', {target: friendId});
    }

    async muteMember(memberId: number, groupId: number, time: number): Promise<ApiResponse> {
        return await this.request('mute', {target: groupId, memberId, time});
    }

    async unmuteMember(memberId: number, groupId: number): Promise<ApiResponse> {
        return await this.request('unmute', {target: groupId, memberId});
    }

    async kickMember(memberId: number, groupId: number, message: string): Promise<ApiResponse> {
        return await this.request('kick', {target: groupId, memberId, msg: message});
    }

    async quitGroup(groupId: number): Promise<ApiResponse> {
        return await this.request('quit', {target: groupId});
    }

    async muteAll(groupId: number): Promise<ApiResponse> {
        return await this.request('muteAll', {target: groupId});
    }

    async unmuteAll(groupId: number): Promise<ApiResponse> {
        return await this.request('unmuteAll', {target: groupId});
    }

    async setEssence(messageId: number): Promise<ApiResponse> {
        return await this.request('setEssence', {target: messageId});
    }

    async getGroupConfig(groupId: number): Promise<GroupConfigResponse> {
        return await this.request('groupConfig', {target: groupId}, 'get');
    }

    async setGroupConfig(groupId: number, config: GroupConfig): Promise<ApiResponse> {
        return await this.request('groupConfig', {target: groupId, config}, 'update');
    }

    async getMemberInfo(memberId: number, groupId: number): Promise<GroupMemberResponse> {
        return await this.request('memberInfo', {target: groupId, memberId}, 'get');
    }

    async setMemberInfo(memberId: number, groupId: number, info: GroupMember): Promise<ApiResponse> {
        return await this.request('memberInfo', {target: groupId, memberId, info}, 'update');
    }

    async handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse> {
        return await this.request('resp_newFriendRequestEvent', {eventId, fromId, groupId, operate, message});
    }

    async handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse> {
        return await this.request('resp_memberJoinRequestEvent', {eventId, fromId, groupId, operate, message});
    }

    async handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<ApiResponse> {
        return await this.request('resp_botInvitedJoinGroupRequestEvent', {eventId, fromId, groupId, operate, message});
    }
}

export const MiraiApiHttpAdapterMap = {
    HttpAdapter,
    WebsocketAdapter
}

export type MiraiApiHttpAdapterType = keyof typeof MiraiApiHttpAdapterMap;

export function getMiraiApiHttpAdapter(name: MiraiApiHttpAdapterType | string, options: MiraiApiHttpAdapterSetting): MiraiApiHttpAdapterApi {
    if (name in MiraiApiHttpAdapterMap) return new MiraiApiHttpAdapterMap[name](options);
    else {
        logger.warn(`没有找到名为 '${name}' 的adapter, 已使用HttpAdapter代替`);
        return new HttpAdapter(options);
    }
}
