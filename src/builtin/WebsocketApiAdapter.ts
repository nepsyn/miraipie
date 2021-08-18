import WebSocket from 'ws';
import {makeApiAdapter} from '../adapter';
import {ApiResponse, ChatMessage, Event, GroupConfig, GroupMember, NudgeKind, SingleMessage} from '../mirai';
import {MiraiPieApplication, ResponseCode} from '../miraipie';
import {sleep} from '../utils';

function* generateSyncId(): Generator<number> {
    let syncId = 1;
    while (true) {
        syncId = (syncId + 1) % 100;
        yield syncId;
    }
}

/**
 * mirai-api-http 提供的 websocket adapter<br/>
 * @see <a href="https://github.com/project-mirai/mirai-api-http/blob/master/docs/adapter/WebsocketAdapter.md">文档<a/>
 */
const WebSocketApiAdapter = makeApiAdapter({
    id: 'ws',
    supportVersion: '2.2.0',
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
        timeout: {
            type: Number,
            description: '发送请求的超时时间(毫秒)',
            default: () => 2000
        }
    },
    data: {
        /** 响应队列 */
        queue: new Map<number, ApiResponse>(),
        /** syncId 生成器 */
        syncIdGenerator: generateSyncId(),
        /**
         * websocket 连接
         * @type WebSocket
         */
        ws: null
    },
    methods: {
        async request<T extends ApiResponse>(command: string, content: object = {}, subCommand: string = null): Promise<T> {
            // 生成syncId
            const syncId = this.syncIdGenerator.next().value;
            // 判断是否正在监听
            if (!this.listening) {
                this.logger.error(`进行 '${command}' 操作前必须启动监听`);
                return;
            }
            // 构造请求对象
            const data = {syncId, command, subCommand, content};
            this.ws.send(JSON.stringify(data), (err) => {
                if (err) this.logger.error('发送请求错误, 请求原始数据:', data, err.message);
            });

            // 等待响应
            for (let counter = 0; counter * 200 < this.configs.timeout; counter++) {
                if (this.queue.has(syncId)) break;
                await sleep(200);
            }

            // 返回响应
            const resp = this.queue.get(syncId);
            if (resp) {
                this.queue.delete(syncId);
                return resp as T;
            } else {
                this.logger.error('发送的请求已超时, 请求原始数据:', data);
            }
        }
    },
    async listen() {
        if (!this.listening) {
            const id = this.configs.qq;
            this.ws = new WebSocket(`ws://${this.configs.host}:${this.configs.port}/all?verifyKey=${this.configs.verifyKey}&qq=${id}`);
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
                        }
                    } else {
                        this.queue.set(parseInt(message.syncId), message.data as ApiResponse);
                    }
                } else if ('code' in message) {
                    this.logger.error(`监听失败, 错误原因: ${(message as any).msg}`);
                    this.ws.close();
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
        return await this.request('about');
    },
    async getMessageFromId(messageId: number) {
        return await this.request('messageFromId', {target: messageId});
    },
    async getFriendList() {
        return await this.request('friendList');
    },
    async getGroupList() {
        return await this.request('groupList');
    },
    async getMemberList(groupId: number) {
        return await this.request('memberList', {target: groupId});
    },
    async getBotProfile() {
        return await this.request('botProfile');
    },
    async getFriendProfile(friendId: number) {
        return await this.request('friendProfile', {target: friendId});
    },
    async getMemberProfile(groupId: number, memberId: number) {
        return await this.request('memberProfile', {target: groupId, memberId});
    },
    async sendFriendMessage(friendId: number, messageChain: SingleMessage[], quoteMessageId?: number) {
        return await this.request('sendFriendMessage', {qq: friendId, messageChain, quote: quoteMessageId});
    },
    async sendGroupMessage(groupId: number, messageChain: SingleMessage[], quoteMessageId?: number) {
        return await this.request('sendGroupMessage', {group: groupId, messageChain, quote: quoteMessageId});
    },
    async sendTempMessage(memberId: number, groupId: number, messageChain: SingleMessage[], quoteMessageId?: number) {
        return await this.request('sendTempMessage', {
            qq: memberId,
            group: groupId,
            messageChain,
            quote: quoteMessageId
        });
    },
    async sendNudge(targetId: number, subjectId: number, kind: NudgeKind) {
        return await this.request('sendNudge', {target: targetId, subject: subjectId, kind});
    },
    async recall(messageId: number) {
        return await this.request('recall', {target: messageId});
    },
    async getGroupFileList(parentFileId: string, groupId: number, offset: number = 0, size: number = 100, withDownloadInfo: boolean = false) {
        return await this.request('file_list', {id: parentFileId, target: groupId, offset, size, withDownloadInfo});
    },
    async getGroupFileInfo(fileId: string, groupId: number, withDownloadInfo: boolean = false) {
        return await this.request('file_info', {id: fileId, target: groupId, withDownloadInfo});
    },
    async createGroupFileDirectory(parentFileId: string, directoryName: string, groupId: number) {
        return await this.request('file_mkdir', {id: parentFileId, target: groupId, directoryName});
    },
    async deleteGroupFile(fileId: string, groupId: number) {
        return await this.request('file_delete', {id: fileId, target: groupId});
    },
    async moveGroupFile(fileId: string, groupId: number, moveToDirectoryId: string) {
        return await this.request('file_move', {id: fileId, target: groupId, moveTo: moveToDirectoryId});
    },
    async renameGroupFile(fileId: string, groupId: number, name: string) {
        return await this.request('file_rename', {id: fileId, target: groupId, renameTo: name});
    },
    async deleteFriend(friendId: number) {
        return await this.request('deleteFriend', {target: friendId});
    },
    async muteMember(memberId: number, groupId: number, time: number) {
        return await this.request('mute', {target: groupId, memberId, time});
    },
    async unmuteMember(memberId: number, groupId: number) {
        return await this.request('unmute', {target: groupId, memberId});
    },
    async kickMember(memberId: number, groupId: number, message: string) {
        return await this.request('kick', {target: groupId, memberId, msg: message});
    },
    async quitGroup(groupId: number) {
        return await this.request('quit', {target: groupId});
    },
    async muteAll(groupId: number) {
        return await this.request('muteAll', {target: groupId});
    },
    async unmuteAll(groupId: number) {
        return await this.request('unmuteAll', {target: groupId});
    },
    async setEssence(messageId: number) {
        return await this.request('setEssence', {target: messageId});
    },
    async getGroupConfig(groupId: number) {
        return await this.request('groupConfig', {target: groupId}, 'get');
    },
    async setGroupConfig(groupId: number, config: GroupConfig) {
        return await this.request('groupConfig', {target: groupId, config}, 'update');
    },
    async getMemberInfo(memberId: number, groupId: number) {
        return await this.request('memberInfo', {target: groupId, memberId}, 'get');
    },
    async setMemberInfo(memberId: number, groupId: number, info: GroupMember) {
        return await this.request('memberInfo', {target: groupId, memberId, info}, 'update');
    },
    async handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string) {
        return await this.request('resp_newFriendRequestEvent', {eventId, fromId, groupId, operate, message});
    },
    async handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string) {
        return await this.request('resp_memberJoinRequestEvent', {eventId, fromId, groupId, operate, message});
    },
    async handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string) {
        return await this.request('resp_botInvitedJoinGroupRequestEvent', {eventId, fromId, groupId, operate, message});
    },
    async uploadImage() {
        this.logger.error('暂不支持的操作: uploadImage');
        return null;
    },
    async uploadVoice() {
        this.logger.error('暂不支持的操作: uploadVoice');
        return null;
    },
    async uploadGroupFile() {
        this.logger.error('暂不支持的操作: uploadGroupFile');
        return null;
    }
});

export = WebSocketApiAdapter;
