import axios, {AxiosRequestConfig} from 'axios';
import FormData from 'form-data';
import {ReadStream} from 'fs';
import {makeApiAdapter} from '../adapter';
import {
    ChatMessage,
    Event,
    GroupConfig,
    GroupMemberSettings,
    MIRAI_API_HTTP_VERSION,
    NudgeKind,
    ResponseCode,
    SingleMessage
} from '../mirai';
import {sleep} from '../utils';

type UploadType = 'friend' | 'group' | 'temp';

/**
 * mirai-api-http 提供的 http adapter<br/>
 * @see <a href="https://github.com/project-mirai/mirai-api-http/blob/master/docs/adapter/HttpAdapter.md">文档<a/>
 */
const HttpApiAdapter = makeApiAdapter({
    id: 'http',
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
        interval: {
            type: Number,
            description: 'http轮询周期(毫秒)',
            default: () => 500
        },
        ssl: {
            type: Boolean,
            description: '是否使用SSL',
            default: () => false
        }
    },
    data: {
        session: null
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
            let first = true;
            while (this.listening || first) {
                try {
                    const resp = await this.get('fetchMessage', {count: 30});
                    if (resp.code === ResponseCode.Success) {
                        if (first) {
                            this.listening = true;
                            this.logger.info('已启动监听');
                            this.emit('listen');
                        }
                        for (const i of resp.data) {
                            if (i.type.endsWith('Message')) this.emit('message', i as ChatMessage);
                            else this.emit('event', i as Event);
                        }
                        await sleep(this.configs.interval);
                    } else {
                        this.logger.error(`监听器启动失败, 错误原因: ${(resp as any).msg}`);
                    }
                } catch (err) {
                    this.logger.error('监听时发生错误:', err.message);
                    this.listening = false;
                } finally {
                    first = false;
                }
            }
        }
    },
    stop() {
        if (this.listening) {
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
    async setMemberInfo(memberId: number, groupId: number, info: GroupMemberSettings) {
        return this.post('memberInfo', {target: groupId, memberId, info});
    },
    async setMemberAdmin(memberId: number, groupId: number, admin: boolean = true) {
        return this.post('memberAdmin', {target: groupId, memberId, assign: admin});
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
    async executeCommand(command: SingleMessage[]) {
        return this.post('cmd/execute', {command});
    },
    async registerCommand(name: string, alias: string[], usage: string, description: string) {
        return this.post('cmd/register', {name, alias, usage, description});
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

export = HttpApiAdapter;
