import log4js from 'log4js';
import {DatabaseAdapter, Pie, PieAgent, Sqlite3Adapter} from '.';
import {
    ChatMessage,
    Event,
    Friend,
    getMiraiApiHttpAdapter,
    Group,
    GroupMember,
    MessageChain,
    MiraiApiHttpAdapterApi,
    MiraiApiHttpAdapterType,
    MiraiApiHttpClientSetting,
    Profile,
    ResponseCode
} from '../mirai';
import {makeAsync, makeReadonly} from '../tool';

const logger = log4js.getLogger('miraipie');

export interface MiraiPieAppOptions {
    id: number;

    adapterSetting: MiraiApiHttpClientSetting;
    adapter: MiraiApiHttpAdapterType;
    listenerAdapter?: MiraiApiHttpAdapterType;

    pies?: Pie[];
}

export class MiraiPieApp {
    static instance: MiraiPieApp;

    id: number;

    adapter: MiraiApiHttpAdapterApi;
    listenerAdapter: MiraiApiHttpAdapterApi;
    db: DatabaseAdapter;

    private readonly messageHandlers: Array<(chatMessage: ChatMessage) => any>;
    private readonly eventHandlers: Array<(event: Event) => any>;

    pieAgent: PieAgent;

    static createInstance(options: MiraiPieAppOptions & {
        db?: DatabaseAdapter
    }): MiraiPieApp {
        MiraiPieApp.instance = new MiraiPieApp(options);
        return MiraiPieApp.instance;
    }

    private constructor(options: MiraiPieAppOptions & {
        db?: DatabaseAdapter
    }) {
        this.id = options.id;
        this.adapter = getMiraiApiHttpAdapter(options.adapter, options.adapterSetting);
        this.listenerAdapter = (options.listenerAdapter && getMiraiApiHttpAdapter(options.listenerAdapter, options.adapterSetting)) || this.adapter;
        this.db = options.db || new Sqlite3Adapter('miraipie.db');

        this.listenerAdapter.messageHandler = (chatMessage) => this.messageDispatcher(chatMessage);
        this.listenerAdapter.eventHandler = (event) => this.eventDispatcher(event);

        this.messageHandlers = [];
        this.eventHandlers = [];

        this.pieAgent = new PieAgent();
        for (const pie of options.pies || []) this.pieAgent.install(pie);

        this.onMessage((chatMessage) => this.pieAgent.messageDispatcher(chatMessage));
        this.onMessage((chatMessage) => {
            this.db?.saveMessage(
                chatMessage.messageChain.sourceId,
                chatMessage.messageChain,
                chatMessage.sender.id,
                this.id,
                chatMessage.type
            );
        });
        this.onEvent((event) => this.pieAgent.eventDispatcher(event));
        this.onEvent((event) => this.db?.saveEvent(event));

        this.db?.saveAppOptions(options);
        MiraiPieApp.instance = this;

        process.on('exit', () => {
            this.db.close();
        });
    }

    onMessage(callback: (chatMessage: ChatMessage) => any) {
        this.messageHandlers.push(callback);
    }

    onEvent(callback: (event: Event) => any) {
        this.eventHandlers.push(callback);
    }

    private async messageDispatcher(chatMessage: ChatMessage) {
        chatMessage.messageChain = MessageChain.from(chatMessage.messageChain);
        for (const handler of this.messageHandlers) {
            makeAsync(handler)(makeReadonly(chatMessage)).catch((err) => {
                logger.error(`调用消息处理器 '${handler.name}' 时发生错误:`, err)
            });
        }
    }

    private async eventDispatcher(event: Event) {
        for (const handler of this.eventHandlers) {
            makeAsync(handler)(makeReadonly(event)).catch((err) => {
                logger.error(`调用事件处理器 '${handler.name}' 时发生错误:`, err);
            });
        }
    }

    async getProfile(): Promise<Profile> {
        const resp = await this.adapter?.getBotProfile();
        return resp?.data;
    }

    async listen() {
        if (this.listenerAdapter.listen) await this.listenerAdapter.listen();
        else logger.error(`当前指定的listenerAdapter '${this.listenerAdapter.type}' 不能提供事件监听`)
    }

    async stop() {
        await this.listenerAdapter?.stop();
    }

    async getFriendList(): Promise<Friend[]> {
        const resp = await this.adapter?.getFriendList();
        return resp?.data;
    }

    async getGroupList(): Promise<Group[]> {
        const resp = await this.adapter?.getGroupList();
        return resp?.data;
    }

    async getMemberList(groupId: number): Promise<GroupMember[]> {
        const resp = await this.adapter?.getMemberList(groupId);
        return resp?.data;
    }

    async handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.adapter?.handleNewFriendRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    async handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.adapter?.handleMemberJoinRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    async handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.adapter?.handleBotInvitedJoinGroupRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    async registerCommand(name: string, alias: string[], usage: string, description: string): Promise<boolean> {
        const resp = await this.adapter?.registerCommand(name, alias, usage, description);
        return resp?.code === ResponseCode.Success;
    }

    async executeCommand(command: MessageChain): Promise<boolean> {
        const resp = await this.adapter?.executeCommand(command);
        return resp?.code === ResponseCode.Success;
    }
}

export const createMiraiPieApp = MiraiPieApp.createInstance;
