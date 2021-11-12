import axios, {AxiosRequestConfig} from 'axios';
import FormData from 'form-data';
import {ReadStream} from 'fs';
import WebSocket from 'ws';
import {makeApiAdapter} from '../adapter';
import {
    ApiResponse,
    ChatMessage,
    Event,
    GroupConfig,
    GroupMember,
    MIRAI_API_HTTP_VERSION,
    NudgeKind,
    ResponseCode,
    SingleMessage
} from '../mirai';

type UploadType = 'friend' | 'group' | 'temp';

/**
 * 使用 http 发送操作请求, ws 监听事件 的混用客户端 adapter<br/>
 */
const MixedApiAdapter = makeApiAdapter({
    id: 'mixed',
    supportVersion: MIRAI_API_HTTP_VERSION,
    configMeta: {
        qq: {
            type: Number,
            description: 'mirai-api-http服务的QQ号'
        },
        verifyKey: {
            type: String,
            required: true,
            description: 'mirai-api-http配置中的verifyKey',
        },
        host: {
            type: String,
            required: true,
            description: 'mirai-api-http服务的主机地址',
            default: () => '127.0.0.1'
        },
        port: {
            type: Number,
            required: true,
            description: 'mirai-api-http服务的端口号',
            default: () => 23333
        },
        ssl: {
            type: Boolean,
            description: '是否使用SSL',
            default: () => false
        }
    },
    data: {
        session: null,
        ws: null
    },
    methods: {
        async request<T>(uri: string, data: object, method: 'GET' | 'POST', requireSession: boolean = true, multipart: boolean = false): Promise<T> {
            // 构造axios请求config
            const config: AxiosRequestConfig = {
                method,
                url: `http${this.configs.ssl ? 's' : ''}://${this.configs.host}:${this.configs.port}/${uri}`,
                headers: {}
            };

            // 判断请求类型
            if (method === 'POST') config.data = data;
            else config.params = data;
            if (multipart) config.headers = (data as FormData).getHeaders();
            // 判断是否需要session
            if (requireSession) {
                if (!this.session) {
                    await this.verify();
                    await this.bind();
                    if (!this.session) this.logger.error('session未绑定或已失效');
                }
                config.headers.sessionKey = this.session;
            }

            // 发送请求
            try {
                const resp = (await axios.request<T>(config)).data;
                if ('code' in resp && resp['code'] !== ResponseCode.Success) {
                    this.logger.warn(`发送的请求未能达到预期的效果, 请求uri: ${uri}, 错误原因: ${(resp as any).msg}, 请求原始数据:`, data);
                }
                return resp;
            } catch (err) {
                this.logger.error('发送请求错误, 请求原始数据:', data, err.message);
            }
        },
        async get<T>(uri: string, params?: object, requireSession: boolean = true, multipart: boolean = false): Promise<T> {
            return this.request(uri, params, 'GET', requireSession, multipart);
        },
        async post<T>(uri: string, data?: object, requireSession: boolean = true, multipart: boolean = false): Promise<T> {
            return this.request(uri, data, 'POST', requireSession, multipart);
        }
    },
    async verify() {
        return new Promise((resolve, reject) => {
            this.post('verify', {verifyKey: this.configs.verifyKey}, false).then((res) => {
                if (res.code === ResponseCode.WrongVerifyKey) this.logger.error(`认证失败, 错误的verifyKey`);
                else this.session = res.session;
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    },
    async bind() {
        return this.post('bind', {sessionKey: this.session, qq: this.configs.qq}, false);
    },
    async release() {
        return new Promise((resolve, reject) => {
            this.post('release', {sessionKey: this.session, qq: this.configs.qq}, false).then((res) => {
                this.session = null;
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    },
    async listen() {
        if (!this.listening) {
            const id = this.configs.qq;
            this.ws = new WebSocket(`ws${this.configs.ssl ? 's' : ''}://${this.configs.host}:${this.configs.port}/all?verifyKey=${this.configs.verifyKey}&qq=${id}`);
            this.ws.on('error', (err) => {
                this.logger.error(`监听器启动出错:`, err.message);
            });
            this.ws.on('message', (buffer: Buffer) => {
                const message: { syncId: string, data: ChatMessage | Event | ApiResponse } = JSON.parse(buffer.toString());
                if ('syncId' in message) {
                    if (message.syncId === '-1') {
                        const data = message.data as ChatMessage | Event;
                        if (data.type.endsWith('Message')) this.emit('message', data as ChatMessage);
                        else if (data.type.endsWith('Event')) this.emit('event', data as Event);
                    } else if (message.syncId === '') {
                        const data = message.data as ApiResponse;
                        if (data.code === ResponseCode.Success) {
                            this.listening = true;
                            this.emit('listen');
                            this.logger.info('已启动监听');
                        } else {
                            this.logger.error(`监听器启动失败, 错误原因: ${data.msg}`);
                            this.ws.close();
                        }
                    } else {
                        this.queue.set(parseInt(message.syncId), message.data as ApiResponse);
                    }
                } else {
                    this.logger.warn('未能解析的数据:', message);
                }
            });
        }
    },
    stop() {
        if (this.ws && this.ws.readyState === this.ws.OPEN) {
            this.ws.close();
            this.listening = false;
            this.logger.info('已停止监听');
            this.emit('stop');
        }
    },
    async getAbout() {
        return this.get('about', null, false);
    },
    async getMessageFromId(messageId: number) {
        return this.get('messageFromId', {id: messageId});
    },
    async getBotProfile() {
        return this.get('botProfile');
    },
    async getFriendList() {
        return this.get('friendList');
    },
    async getGroupList() {
        return this.get('groupList');
    },
    async getMemberList(groupId: number) {
        return this.get('memberList', {target: groupId});
    },
    async getFriendProfile(friendId: number) {
        return this.get('friendProfile', {target: friendId});
    },
    async getMemberProfile(memberId: number, groupId: number) {
        return this.get('memberProfile', {target: groupId, memberId});
    },
    async sendFriendMessage(friendId: number, messageChain: SingleMessage[], quoteMessageId?: number) {
        return this.post('sendFriendMessage', {
            target: friendId,
            messageChain,
            quote: quoteMessageId
        });
    },
    async sendGroupMessage(groupId: number, messageChain: SingleMessage[], quoteMessageId?: number) {
        return this.post('sendGroupMessage', {
            target: groupId,
            messageChain,
            quote: quoteMessageId
        });
    },
    async sendTempMessage(memberId: number, groupId: number, messageChain: SingleMessage[], quoteMessageId?: number) {
        return this.post('sendTempMessage', {
            qq: memberId,
            group: groupId,
            messageChain,
            quote: quoteMessageId
        });
    },
    async sendNudge(targetId: number, subjectId: number, kind: NudgeKind) {
        return this.post('sendNudge', {target: targetId, subject: subjectId, kind});
    },
    async recall(messageId: number) {
        return this.post('recall', {target: messageId});
    },
    async getFileList(directoryId: string, directoryPath: string, groupId: number, friendId: number, offset: number = 1, size: number = 100, withDownloadInfo: boolean = true) {
        return this.get('file/list', {
            id: directoryId,
            path: directoryPath,
            group: groupId,
            qq: friendId,
            offset,
            size,
            withDownloadInfo
        });
    },
    async getFileInfo(fileId: string, path: string, groupId: number, friendId: number, withDownloadInfo: boolean = true) {
        return this.get('file/info', {id: fileId, path: path, group: groupId, qq: friendId, withDownloadInfo});
    },
    async createFileDirectory(parentDirectoryId: string, parentDirectoryPath: string, directoryName: string, groupId: number, friendId: number) {
        return this.post('file/mkdir', {
            id: parentDirectoryId,
            path: parentDirectoryPath,
            group: groupId,
            qq: friendId,
            directoryName
        });
    },
    async deleteFile(id: string, path: string, groupId: number, friendId: number) {
        return this.post('file/delete', {id, path, group: groupId, qq: friendId});
    },
    async moveFile(id: string, path: string, groupId: number, friendId: number, moveToDirectoryId: string, moveToDirectoryPath: string) {
        return this.post('file/move', {
            id,
            path,
            group: groupId,
            qq: friendId,
            moveTo: moveToDirectoryId,
            moveToPath: moveToDirectoryPath
        });
    },
    async renameFile(id: string, path: string, groupId: number, friendId: number, name: string) {
        return this.post('file/rename', {id, path, group: groupId, qq: friendId, renameTo: name});
    },
    async deleteFriend(friendId: number) {
        return this.post('deleteFriend', {target: friendId});
    },
    async muteMember(memberId: number, groupId: number, time: number) {
        return this.post('mute', {target: groupId, memberId, time});
    },
    async unmuteMember(memberId: number, groupId: number) {
        return this.post('unmute', {target: groupId, memberId});
    },
    async kickMember(memberId: number, groupId: number, message: string) {
        return this.post('kick', {target: groupId, memberId, msg: message});
    },
    async quitGroup(groupId: number) {
        return this.post('quit', {target: groupId});
    },
    async muteAll(groupId: number) {
        return this.post('muteAll', {target: groupId});
    },
    async unmuteAll(groupId: number) {
        return this.post('unmuteAll', {target: groupId});
    },
    async setEssence(messageId: number) {
        return this.post('setEssence', {target: messageId});
    },
    async getGroupConfig(groupId: number) {
        return this.get('groupConfig', {target: groupId});
    },
    async setGroupConfig(groupId: number, config: GroupConfig) {
        return this.post('groupConfig', {target: groupId, config})
    },
    async getMemberInfo(memberId: number, groupId: number) {
        return this.get('memberInfo', {target: groupId, memberId});
    },
    async setMemberInfo(memberId: number, groupId: number, info: GroupMember) {
        return this.post('memberInfo', {target: groupId, memberId, info});
    },
    async setMemberAdmin(memberId: number, groupId: number, admin: boolean = true) {
        return this.post('memberAdmin', {target: groupId, memberId, assign: admin});
    },
    async executeCommand(command: SingleMessage[]) {
        return this.post('cmd/execute', {command});
    },
    async registerCommand(name: string, alias: string[], usage: string, description: string) {
        return this.post('cmd/register', {name, alias, usage, description});
    },
    async handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string) {
        return this.post('resp/newFriendRequestEvent', {eventId, fromId, groupId, operate, message});
    },
    async handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string) {
        return this.post('resp/memberJoinRequestEvent', {eventId, fromId, groupId, operate, message});
    },
    async handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string) {
        return this.post('resp/botInvitedJoinGroupRequestEvent', {
            eventId,
            fromId,
            groupId,
            operate,
            message
        });
    },
    async uploadImage(uploadType: UploadType, imageData: ReadStream) {
        const data = new FormData();
        data.append('type', uploadType);
        data.append('img', imageData);
        return this.post('uploadImage', data, true, true);
    },
    async uploadVoice(uploadType: UploadType, voiceData: ReadStream) {
        const data = new FormData();
        data.append('type', uploadType);
        data.append('voice', voiceData);
        return this.post('uploadVoice', data, true, true);
    },
    async uploadGroupFile(uploadType: UploadType, path: string, fileData: ReadStream) {
        const data = new FormData();
        data.append('type', uploadType);
        data.append('path', path);
        data.append('file', fileData);
        return this.post('uploadFile', data, true, true);
    }
});

export = MixedApiAdapter;
