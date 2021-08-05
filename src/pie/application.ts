import {Pie, PieAgent} from '.';
import {
    ChatMessage,
    CommandApi,
    CommonApi,
    Event,
    FileApi,
    Friend,
    Group,
    GroupMember,
    ListenerApi,
    MessageChain,
    MiraiApiHttpAdapterApi,
    Profile,
    ResponseCode,
    UploadApi
} from '../mirai';
import {makeAsync, makeReadonly} from '../tool';
import log4js from 'log4js';

const logger = log4js.getLogger('application');

export interface MiraiPieAppOptions {
    id: number;
    adapter: MiraiApiHttpAdapterApi;

    apiAdapter?: CommonApi;
    commandAdapter?: CommandApi;
    fileAdapter?: FileApi;
    listenerAdapter?: ListenerApi;
    uploadAdapter?: UploadApi;

    pies?: Pie[];
}

export class MiraiPieApp {
    static instance: MiraiPieApp;

    id: number;
    adapter: MiraiApiHttpAdapterApi;

    apiAdapter: CommonApi;
    commandAdapter: CommandApi;
    fileAdapter: FileApi;
    listenerAdapter: ListenerApi;
    uploadAdapter: UploadApi;

    private readonly messageHandlers: Array<(chatMessage: ChatMessage) => any>;
    private readonly eventHandlers: Array<(event: Event) => any>;

    pieAgent: PieAgent;

    static createInstance(options: MiraiPieAppOptions): MiraiPieApp {
        MiraiPieApp.instance = new MiraiPieApp(options);
        return MiraiPieApp.instance;
    }

    private constructor(options: MiraiPieAppOptions) {
        this.id = options.id;
        this.adapter = options.adapter;

        this.apiAdapter = options.apiAdapter || this.adapter as CommonApi;
        this.commandAdapter = options.commandAdapter || this.adapter as CommandApi;
        this.fileAdapter = options.fileAdapter || this.adapter as FileApi;
        this.listenerAdapter = options.listenerAdapter || this.adapter as ListenerApi;
        this.uploadAdapter = options.uploadAdapter || this.adapter as UploadApi;

        if (this.listenerAdapter) {
            this.listenerAdapter.messageHandler = async (chatMessage) => {
                chatMessage.messageChain = MessageChain.from(chatMessage.messageChain);
                for (const handler of this.messageHandlers) {
                    makeAsync(handler)(makeReadonly(chatMessage)).catch((err) => {
                        logger.error(`调用消息处理器 '${handler.name}' 时发生错误:`, err)
                    });
                }
            };
            this.listenerAdapter.eventHandler = async (event) => {
                for (const handler of this.eventHandlers) {
                    makeAsync(handler)(makeReadonly(event)).catch((err) => {
                        logger.error(`调用事件处理器 '${handler.name}' 时发生错误:`, err);
                    });
                }
            };
        }

        this.messageHandlers = [];
        this.eventHandlers = [];

        this.pieAgent = new PieAgent();
        for (const pie of options.pies || []) this.pieAgent.install(pie);

        this.onMessage(async (chatMessage) => {
            await this.pieAgent.messageDispatcher(chatMessage);
        });
        this.onEvent(async (event) => {
            await this.pieAgent.eventDispatcher(event);
        });

        MiraiPieApp.instance = this;
    }

    onMessage(callback: (chatMessage: ChatMessage) => any) {
        this.messageHandlers.push(callback);
    }

    onEvent(callback: (event: Event) => any) {
        this.eventHandlers.push(callback);
    }

    async getProfile(): Promise<Profile> {
        const resp = await this.apiAdapter?.getBotProfile();
        return resp?.data;
    }

    async listen() {
        if (this.listenerAdapter) await this.listenerAdapter?.listen();
        else logger.error(`当前指定的listenerAdapter '${this.listenerAdapter.type}' 不能提供事件监听`)
    }

    async stop() {
        await this.listenerAdapter?.stop();
    }

    async getFriendList(): Promise<Friend[]> {
        const resp = await this.apiAdapter?.getFriendList();
        return resp?.data;
    }

    async getGroupList(): Promise<Group[]> {
        const resp = await this.apiAdapter?.getGroupList();
        return resp?.data;
    }

    async getMemberList(groupId: number): Promise<GroupMember[]> {
        const resp = await this.apiAdapter?.getMemberList(groupId);
        return resp?.data;
    }

    async handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.apiAdapter?.handleNewFriendRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    async handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.apiAdapter?.handleMemberJoinRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    async handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.apiAdapter?.handleBotInvitedJoinGroupRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    async registerCommand(name: string, alias: string[], usage: string, description: string): Promise<boolean> {
        const resp = await this.commandAdapter?.registerCommand(name, alias, usage, description);
        return resp?.code === ResponseCode.Success;
    }

    async executeCommand(command: MessageChain): Promise<boolean> {
        const resp = await this.commandAdapter?.executeCommand(command);
        return resp?.code === ResponseCode.Success;
    }
}

export const createMiraiPieApp = MiraiPieApp.createInstance;
