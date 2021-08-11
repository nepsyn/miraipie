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
import {dependencyResolve, makeAsync, makeReadonly} from '../tool';

const logger = log4js.getLogger('miraipie');

/**
 * miraipie应用选项
 */
export interface MiraiPieAppOptions {
    /**
     * 机器人QQ号
     */
    qq: number;

    /**
     * mirai-api-http adapter客户端配置
     */
    adapterSetting: MiraiApiHttpClientSetting;
    /**
     * 通用adapter类型
     */
    adapter: MiraiApiHttpAdapterType;
    /**
     * 监听用adapter类型
     */
    listenerAdapter?: MiraiApiHttpAdapterType;

    /**
     * 额外加载的pie列表
     */
    pies?: Pie[];
}

/**
 * miraipie应用
 */
export class MiraiPieApp {
    /**
     * miraipie单例
     */
    static instance: MiraiPieApp;

    /**
     * 机器人QQ号
     */
    qq: number;

    /**
     * 通用adapter
     */
    adapter: MiraiApiHttpAdapterApi;
    /**
     * 监听用adapter
     */
    listenerAdapter: MiraiApiHttpAdapterApi;
    /**
     * 数据库adapter
     */
    db: DatabaseAdapter;

    /**
     * 消息处理器列表
     */
    private readonly messageHandlers: Array<(chatMessage: ChatMessage) => any>;
    /**
     * 事件处理器列表
     */
    private readonly eventHandlers: Array<(event: Event) => any>;

    /**
     * pie管理器
     */
    pieAgent: PieAgent;

    /**
     * miraipie应用构造工厂方法
     * @param options miraipie应用选项
     */
    static createInstance(options: MiraiPieAppOptions & {
        db?: DatabaseAdapter
    }): MiraiPieApp {
        MiraiPieApp.instance = new MiraiPieApp(options);
        return MiraiPieApp.instance;
    }

    private constructor(options: MiraiPieAppOptions & {
        db?: DatabaseAdapter
    }) {
        MiraiPieApp.instance = this;

        // 基础设置
        this.qq = options.qq;
        this.adapter = getMiraiApiHttpAdapter(options.adapter, options.adapterSetting);
        this.listenerAdapter = (options.listenerAdapter && getMiraiApiHttpAdapter(options.listenerAdapter, options.adapterSetting)) || this.adapter;
        this.db = options.db || new Sqlite3Adapter('miraipie.db');

        // 绑定监听事件
        this.listenerAdapter.messageHandler = (chatMessage) => this.messageDispatcher(chatMessage);
        this.listenerAdapter.eventHandler = (event) => this.eventDispatcher(event);

        // 初始化处理器
        this.messageHandlers = [];
        this.eventHandlers = [];

        // 添加pie管理器的消息和事件分发器
        this.onMessage((chatMessage) => this.pieAgent.messageDispatcher(chatMessage));
        this.onMessage((chatMessage) => {
            this.db?.saveMessage({
                sourceId: chatMessage.messageChain.sourceId,
                messageChain: chatMessage.messageChain,
                from: chatMessage.sender.id,
                to: this.qq,
                type: chatMessage.type
            });
        });
        this.onEvent((event) => this.pieAgent.eventDispatcher(event));
        this.onEvent((event) => this.db?.saveEvent(event));

        this.db?.saveAppOptions(options);
        this.pieAgent = new PieAgent();

        // 加载数据库中记录的pie
        const pieRecords = this.db?.getPieRecords();
        const pies: Map<string, Pie> = new Map();
        const edges: Map<string, string[]> = new Map();
        for (const record of pieRecords || []) {
            if (record.path) {
                try {
                    const pie: Pie = require(record.path);
                    pies.set(pie.fullId, pie);
                    edges.set(pie.fullId, pie.dependencies.concat());
                } catch (err) {
                    logger.error(`加载pie模块路径 ${record.path} 出错:`, err.message);
                }
            }
        }
        // 加载选项中的pie
        for (const pie of options.pies || []) {
            pies.set(pie.fullId, pie);
            edges.set(pie.fullId, pie.dependencies.concat());
        }
        // 解析依赖顺序
        const sequence = dependencyResolve(edges);
        // 按顺序安装pie
        for (const fullId of sequence) {
            const record = pieRecords.find((pie) => pie.fullId === fullId);
            if (record) this.pieAgent.install(pies.get(fullId), {path: record.path, enabled: record.enabled});
            else this.pieAgent.install(pies.get(fullId));
        }

        // 捕捉Ctrl-C
        process.on('SIGINT', function () {
            logger.info('已手动停止运行 (Ctrl-C)');
            process.exit();
        });

        // 程序结束前保存设置并清理资源
        process.on('exit', () => {
            this.pieAgent.savePies();
            this.db?.close();
        });
    }

    /**
     * 添加消息处理器
     * @param callback 消息处理器
     * @example
     * app.onMessage((chatMessage) => console.log(chatMessage));  // 打印每条消息
     */
    onMessage(callback: (chatMessage: ChatMessage) => any) {
        this.messageHandlers.push(callback);
    }

    /**
     * 添加事件处理器
     * @param callback 事件处理器
     * @example
     * app.onEvent((event) => console.log(event));  // 打印每个事件
     */
    onEvent(callback: (event: Event) => any) {
        this.eventHandlers.push(callback);
    }

    /**
     * 消息分发器
     * @param chatMessage 原始消息对象
     */
    private async messageDispatcher(chatMessage: ChatMessage) {
        chatMessage.messageChain = MessageChain.from(chatMessage.messageChain);
        for (const handler of this.messageHandlers) {
            makeAsync(handler)(makeReadonly(chatMessage)).catch((err) => {
                logger.error(`调用消息处理器 '${handler.name}' 时发生错误:`, err.message)
            });
        }
    }

    /**
     * 事件分发器
     * @param event 原始事件对象
     */
    private async eventDispatcher(event: Event) {
        for (const handler of this.eventHandlers) {
            makeAsync(handler)(makeReadonly(event)).catch((err) => {
                logger.error(`调用事件处理器 '${handler.name}' 时发生错误:`, err.message);
            });
        }
    }

    /**
     * 获取机器人个人资料
     * @return 个人资料
     */
    async getProfile(): Promise<Profile> {
        const resp = await this.adapter.getBotProfile();
        return resp?.data;
    }

    /**
     * 启动消息和事件监听
     */
    async listen() {
        if (this.listenerAdapter.listen) await this.listenerAdapter.listen();
        else logger.error(`当前指定的listenerAdapter '${this.listenerAdapter.type}' 不能提供事件监听`)
    }

    /**
     * 结束消息和事件监听
     */
    async stop() {
        await this.listenerAdapter.stop();
    }

    /**
     * 获取好友列表
     * @return 好友列表
     */
    async getFriendList(): Promise<Friend[]> {
        const resp = await this.adapter.getFriendList();
        return resp?.data;
    }

    /**
     * 获取群列表
     * @return 群列表
     */
    async getGroupList(): Promise<Group[]> {
        const resp = await this.adapter.getGroupList();
        return resp?.data;
    }

    /**
     * 获取群成员列表
     * @param groupId 群号
     * @return 群成员列表
     */
    async getMemberList(groupId: number): Promise<GroupMember[]> {
        const resp = await this.adapter.getMemberList(groupId);
        return resp?.data;
    }

    /**
     * 处理添加好友申请事件<br/>
     * operate类型如下:
     * <ul>
     *     <li>0 - 同意添加好友</li>
     *     <li>1 - 拒绝添加好友</li>
     *     <li>2 - 拒绝添加好友并添加黑名单，不再接收该用户的好友申请</li>
     * </ul>
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号，可能为0
     * @param operate 操作类型
     * @param message 回复的信息
     * @return 是否处理成功
     */
    async handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.adapter.handleNewFriendRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 处理用户入群申请, 机器人需要有管理员权限<br/>
     * operate类型如下:
     * <ul>
     *     <li>0 - 同意入群</li>
     *     <li>1 - 拒绝入群</li>
     *     <li>2 - 忽略请求</li>
     *     <li>3 - 拒绝入群并添加黑名单，不再接收该用户的入群申请</li>
     *     <li>4 - 忽略入群并添加黑名单，不再接收该用户的入群申请</li>
     * </ul>
     * @param eventId 事件id
     * @param fromId 申请人QQ号
     * @param groupId 申请人群号
     * @param operate 操作类型
     * @param message 回复的信息
     * @return 是否处理成功
     */
    async handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.adapter.handleMemberJoinRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 处理机器人被邀请入群申请事件<br/>
     * operate类型如下:
     * <ul>
     *     <li>0 - 同意邀请</li>
     *     <li>1 - 拒绝邀请</li>
     * </ul>
     * @param eventId 事件id
     * @param fromId 邀请人(好友)QQ号
     * @param groupId 邀请进入的群号
     * @param operate 操作类型
     * @param message 回复的信息
     * @return 是否处理成功
     */
    async handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean> {
        const resp = await this.adapter.handleBotInvitedJoinGroupRequest(eventId, fromId, groupId, operate, message);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 执行命令<br/>
     * console 支持以不同消息类型作为指令的参数, 执行命令需要以消息类型作为参数, 若执行纯文本的命令, 构建多个 Plain 格式的消息 console 会将第一个消息作为指令名, 后续消息作为参数 具体参考 <a href="https://docs.mirai.mamoe.net/console/Commands.html">console 文档</a>
     * @param command 命令与参数
     */
    async executeCommand(command: MessageChain): Promise<boolean> {
        const resp = await this.adapter.executeCommand(command);
        return resp?.code === ResponseCode.Success;
    }

    /**
     * 注册命令
     * @param name 指令名
     * @param alias 指令别名
     * @param usage 使用说明
     * @param description 命令描述
     */
    async registerCommand(name: string, alias: string[], usage: string, description: string): Promise<boolean> {
        const resp = await this.adapter.registerCommand(name, alias, usage, description);
        return resp?.code === ResponseCode.Success;
    }
}

export const createMiraiPieApp = MiraiPieApp.createInstance;
