import { DatabaseAdapter, Pie, PieAgent } from '.';
import { ChatMessage, Event, Friend, Group, GroupMember, MessageChain, MiraiApiHttpAdapterApi, MiraiApiHttpAdapterType, MiraiApiHttpClientSetting, Profile } from '../mirai';
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
export declare class MiraiPieApp {
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
    private readonly messageHandlers;
    /**
     * 事件处理器列表
     */
    private readonly eventHandlers;
    /**
     * pie管理器
     */
    pieAgent: PieAgent;
    /**
     * miraipie应用构造工厂方法
     * @param options miraipie应用选项
     */
    static createInstance(options: MiraiPieAppOptions & {
        db?: DatabaseAdapter;
    }): MiraiPieApp;
    private constructor();
    /**
     * 添加消息处理器
     * @param callback 消息处理器
     * @example
     * app.onMessage((chatMessage) => console.log(chatMessage));  // 打印每条消息
     */
    onMessage(callback: (chatMessage: ChatMessage) => any): void;
    /**
     * 添加事件处理器
     * @param callback 事件处理器
     * @example
     * app.onEvent((event) => console.log(event));  // 打印每个事件
     */
    onEvent(callback: (event: Event) => any): void;
    /**
     * 消息分发器
     * @param chatMessage 原始消息对象
     */
    private messageDispatcher;
    /**
     * 事件分发器
     * @param event 原始事件对象
     */
    private eventDispatcher;
    /**
     * 获取机器人个人资料
     * @return 个人资料
     */
    getProfile(): Promise<Profile>;
    /**
     * 启动消息和事件监听
     */
    listen(): Promise<void>;
    /**
     * 结束消息和事件监听
     */
    stop(): Promise<void>;
    /**
     * 获取好友列表
     * @return 好友列表
     */
    getFriendList(): Promise<Friend[]>;
    /**
     * 获取群列表
     * @return 群列表
     */
    getGroupList(): Promise<Group[]>;
    /**
     * 获取群成员列表
     * @param groupId 群号
     * @return 群成员列表
     */
    getMemberList(groupId: number): Promise<GroupMember[]>;
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
    handleNewFriendRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean>;
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
    handleMemberJoinRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean>;
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
    handleBotInvitedJoinGroupRequest(eventId: number, fromId: number, groupId: number, operate: number, message: string): Promise<boolean>;
    /**
     * 执行命令<br/>
     * console 支持以不同消息类型作为指令的参数, 执行命令需要以消息类型作为参数, 若执行纯文本的命令, 构建多个 Plain 格式的消息 console 会将第一个消息作为指令名, 后续消息作为参数 具体参考 <a href="https://docs.mirai.mamoe.net/console/Commands.html">console 文档</a>
     * @param command 命令与参数
     */
    executeCommand(command: MessageChain): Promise<boolean>;
    /**
     * 注册命令
     * @param name 指令名
     * @param alias 指令别名
     * @param usage 使用说明
     * @param description 命令描述
     */
    registerCommand(name: string, alias: string[], usage: string, description: string): Promise<boolean>;
}
export declare const createMiraiPieApp: typeof MiraiPieApp.createInstance;
