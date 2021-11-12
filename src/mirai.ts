/** 联系人 */
export interface Contact {
    /** 联系人账号 */
    readonly id: number;
}

/** 好友 */
export interface Friend extends Contact {
    /** 昵称 */
    nickname: string;
    /** 备注 */
    remark: string;
}

/** 群权限类型 */
export type GroupPermission = 'OWNER' | 'ADMINISTRATOR' | 'MEMBER';

/** 群聊 */
export interface Group extends Contact {
    /** 群名 */
    name: string;
    /** 机器人在群中权限 */
    permission: GroupPermission;
}

/** 群成员 */
export interface GroupMember extends Contact {
    /** 群成员名称 */
    memberName: string;
    /** 头衔 */
    specialTitle: string;
    /** 成员权限 */
    permission: GroupPermission;
    /** 入群时间戳 */
    joinTimestamp: number;
    /** 最近发言时间戳 */
    lastSpeakTimestamp: number;
    /** 剩余禁言时间(秒) */
    muteTimeRemaining: number;
    /** 所在群聊 */
    group: Group;
}

/** 平台类型 */
export type PlatformType = 'IOS' | 'MOBILE' | 'WINDOWS';

/** 其他设备 */
export interface OtherClient extends Contact {
    /** 设备标识号 */
    id: number;
    /** 设备平台 */
    platform: PlatformType;
}

/** 单一消息 */
export interface SingleMessage {
    /** 消息类型 */
    readonly type: SingleMessageType;

    /** 是否为指定类型消息(类型保护) */
    isType<T extends SingleMessageType>(this: SingleMessage, type: T): this is SingleMessageMap[T];

    /** 转化为mirai码 */
    toMiraiCode(): string;

    /** 转化为显示串 */
    toDisplayString(): string;
}

/** 原始消息链 */
export interface MessageChain extends Array<SingleMessage> {
    /** 第一个有效单一消息 */
    firstClientMessage: SingleMessage;
    /** 第一个有效单一消息 */
    f: SingleMessage;
    /** 消息 id */
    sourceId: number;
    /** 消息发送时间 */
    time: number;

    [index: number]: SingleMessage;

    /** 选择对应类型的单一消息 */
    select<T extends SingleMessageType>(type: T): this;

    /** 选择对应类型的单一消息的新消息链 */
    selected<T extends SingleMessageType>(type: T): MessageChain;

    /** 删除对应类型的单一消息 */
    drop<T extends SingleMessageType>(type: T): this;

    /** 删除对应类型的单一消息的新消息链 */
    dropped<T extends SingleMessageType>(type: T): MessageChain;

    /** 转化为mirai码 */
    toMiraiCode(): string;

    /** 转化为显示串 */
    toDisplayString(): string;
}

/** 来源型 */
export interface Source extends SingleMessage {
    type: 'Source';
    /** 消息id */
    id: number;
    /** 时间戳 */
    time: number;
}

/** 引用回复型 */
export interface Quote extends SingleMessage {
    type: 'Quote';
    /** 引用消息id */
    id: number;
    /** 群号 */
    groupId: number;
    /** 发送人QQ号 */
    senderId: number;
    /** 接收者账号 */
    targetId: number;
    /** 原始消息内容 */
    origin: SingleMessage[];
}

/** &#64;型 */
export interface At extends SingleMessage {
    type: 'At';
    /** 群成员QQ号 */
    target: number;
    /** At时显示的文字, 发送消息时无效, 自动使用群名片 */
    display: string;
}

/** &#64;全体成员型 */
export interface AtAll extends SingleMessage {
    type: 'AtAll';
}

/** 表情类型映射 */
export enum FaceType {
    JING_YA = 0,
    惊讶 = JING_YA,
    PIE_ZUI = 1,
    撇嘴 = PIE_ZUI,
    SE = 2,
    色 = SE,
    FA_DAI = 3,
    发呆 = FA_DAI,
    DE_YI = 4,
    得意 = DE_YI,
    LIU_LEI = 5,
    流泪 = LIU_LEI,
    HAI_XIU = 6,
    害羞 = HAI_XIU,
    BI_ZUI = 7,
    闭嘴 = BI_ZUI,
    SHUI = 8,
    睡 = SHUI,
    DA_KU = 9,
    大哭 = DA_KU,
    GAN_GA = 10,
    尴尬 = GAN_GA,
    FA_NU = 11,
    发怒 = FA_NU,
    TIAO_PI = 12,
    调皮 = TIAO_PI,
    ZI_YA = 13,
    呲牙 = ZI_YA,
    WEI_XIAO = 14,
    微笑 = WEI_XIAO,
    NAN_GUO = 15,
    难过 = NAN_GUO,
    KU = 16,
    酷 = KU,
    ZHUA_KUANG = 18,
    抓狂 = ZHUA_KUANG,
    TU = 19,
    吐 = TU,
    TOU_XIAO = 20,
    偷笑 = TOU_XIAO,
    KE_AI = 21,
    可爱 = KE_AI,
    BAI_YAN = 22,
    白眼 = BAI_YAN,
    AO_MAN = 23,
    傲慢 = AO_MAN,
    JI_E = 24,
    饥饿 = JI_E,
    KUN = 25,
    困 = KUN,
    JING_KONG = 26,
    惊恐 = JING_KONG,
    LIU_HAN = 27,
    流汗 = LIU_HAN,
    HAN_XIAO = 28,
    憨笑 = HAN_XIAO,
    YOU_XIAN = 29,
    悠闲 = YOU_XIAN,
    FEN_DOU = 30,
    奋斗 = FEN_DOU,
    ZHOU_MA = 31,
    咒骂 = ZHOU_MA,
    YI_WEN = 32,
    疑问 = YI_WEN,
    XU = 33,
    嘘 = XU,
    YUN = 34,
    晕 = YUN,
    ZHE_MO = 35,
    折磨 = ZHE_MO,
    SHUAI = 36,
    衰 = SHUAI,
    KU_LOU = 37,
    骷髅 = KU_LOU,
    QIAO_DA = 38,
    敲打 = QIAO_DA,
    ZAI_JIAN = 39,
    再见 = ZAI_JIAN,
    FA_DOU = 41,
    发抖 = FA_DOU,
    AI_QING = 42,
    爱情 = AI_QING,
    TIAO_TIAO = 43,
    跳跳 = TIAO_TIAO,
    ZHU_TOU = 46,
    猪头 = ZHU_TOU,
    YONG_BAO = 49,
    拥抱 = YONG_BAO,
    DAN_GAO = 53,
    蛋糕 = DAN_GAO,
    SHAN_DIAN = 54,
    闪电 = SHAN_DIAN,
    ZHA_DAN = 55,
    炸弹 = ZHA_DAN,
    DAO = 56,
    刀 = DAO,
    ZU_QIU = 57,
    足球 = ZU_QIU,
    BIAN_BIAN = 59,
    便便 = BIAN_BIAN,
    KA_FEI = 60,
    咖啡 = KA_FEI,
    FAN = 61,
    饭 = FAN,
    MEI_GUI = 63,
    玫瑰 = MEI_GUI,
    DIAO_XIE = 64,
    凋谢 = DIAO_XIE,
    AI_XIN = 66,
    爱心 = AI_XIN,
    XIN_SUI = 67,
    心碎 = XIN_SUI,
    LI_WU = 69,
    礼物 = LI_WU,
    TAI_YANG = 74,
    太阳 = TAI_YANG,
    YUE_LIANG = 75,
    月亮 = YUE_LIANG,
    ZAN = 76,
    赞 = ZAN,
    CAI = 77,
    踩 = CAI,
    WO_SHOU = 78,
    握手 = WO_SHOU,
    SHENG_LI = 79,
    胜利 = SHENG_LI,
    FEI_WEN = 85,
    飞吻 = FEI_WEN,
    OU_HUO = 86,
    怄火 = OU_HUO,
    XI_GUA = 89,
    西瓜 = XI_GUA,
    LENG_HAN = 96,
    冷汗 = LENG_HAN,
    CA_HAN = 97,
    擦汗 = CA_HAN,
    KOU_BI = 98,
    抠鼻 = KOU_BI,
    GU_ZHANG = 99,
    鼓掌 = GU_ZHANG,
    QIU_DA_LE = 100,
    糗大了 = QIU_DA_LE,
    HUAI_XIAO = 101,
    坏笑 = HUAI_XIAO,
    ZUO_HENG_HENG = 102,
    左哼哼 = ZUO_HENG_HENG,
    YOU_HENG_HENG = 103,
    右哼哼 = YOU_HENG_HENG,
    HA_QIAN = 104,
    哈欠 = HA_QIAN,
    BI_SHI = 105,
    鄙视 = BI_SHI,
    WEI_QU = 106,
    委屈 = WEI_QU,
    KUAI_KU_LE = 107,
    快哭了 = KUAI_KU_LE,
    YIN_XIAN = 108,
    阴险 = YIN_XIAN,
    QIN_QIN = 109,
    亲亲 = QIN_QIN,
    XIA = 110,
    吓 = XIA,
    KE_LIAN = 111,
    可怜 = KE_LIAN,
    CAI_DAO = 112,
    菜刀 = CAI_DAO,
    PI_JIU = 113,
    啤酒 = PI_JIU,
    LAN_QIU = 114,
    篮球 = LAN_QIU,
    PING_PANG = 115,
    乒乓 = PING_PANG,
    SHI_AI = 116,
    示爱 = SHI_AI,
    PIAO_CHONG = 117,
    瓢虫 = PIAO_CHONG,
    BAO_QUAN = 118,
    抱拳 = BAO_QUAN,
    GOU_YIN = 119,
    勾引 = GOU_YIN,
    QUAN_TOU = 120,
    拳头 = QUAN_TOU,
    CHA_JIN = 121,
    差劲 = CHA_JIN,
    AI_NI = 122,
    爱你 = AI_NI,
    NO = 123,
    BU = NO,
    不 = NO,
    OK = 124,
    HAO = OK,
    好 = OK,
    ZHUAN_QUAN = 125,
    转圈 = ZHUAN_QUAN,
    KE_TOU = 126,
    磕头 = KE_TOU,
    HUI_TOU = 127,
    回头 = HUI_TOU,
    TIAO_SHENG = 128,
    跳绳 = TIAO_SHENG,
    HUI_SHOU = 129,
    挥手 = HUI_SHOU,
    JI_DONG = 130,
    激动 = JI_DONG,
    JIE_WU = 131,
    街舞 = JIE_WU,
    XIAN_WEN = 132,
    献吻 = XIAN_WEN,
    ZUO_TAI_JI = 133,
    左太极 = ZUO_TAI_JI,
    YOU_TAI_JI = 134,
    右太极 = YOU_TAI_JI,
    SHUANG_XI = 136,
    双喜 = SHUANG_XI,
    BIAN_PAO = 137,
    鞭炮 = BIAN_PAO,
    DENG_LONG = 138,
    灯笼 = DENG_LONG,
    K_GE = 140,
    K歌 = K_GE,
    HE_CAI = 144,
    喝彩 = HE_CAI,
    QI_DAO = 145,
    祈祷 = QI_DAO,
    BAO_JIN = 146,
    爆筋 = BAO_JIN,
    BANG_BANG_TANG = 147,
    棒棒糖 = BANG_BANG_TANG,
    HE_NAI = 148,
    喝奶 = HE_NAI,
    FEI_JI = 151,
    飞机 = FEI_JI,
    CHAO_PIAO = 158,
    钞票 = CHAO_PIAO,
    YAO = 168,
    药 = YAO,
    SHOU_QIANG = 169,
    手枪 = SHOU_QIANG,
    CHA = 171,
    茶 = CHA,
    ZHA_YAN_JING = 172,
    眨眼睛 = ZHA_YAN_JING,
    LEI_BEN = 173,
    泪奔 = LEI_BEN,
    WU_NAI = 174,
    无奈 = WU_NAI,
    MAI_MENG = 175,
    卖萌 = MAI_MENG,
    XIAO_JIU_JIE = 176,
    小纠结 = XIAO_JIU_JIE,
    PEN_XIE = 177,
    喷血 = PEN_XIE,
    XIE_YAN_XIAO = 178,
    斜眼笑 = XIE_YAN_XIAO,
    doge = 179,
    JING_XI = 180,
    惊喜 = JING_XI,
    SAO_RAO = 181,
    骚扰 = SAO_RAO,
    XIAO_KU = 182,
    笑哭 = XIAO_KU,
    WO_ZUI_MEI = 183,
    我最美 = WO_ZUI_MEI,
    HE_XIE = 184,
    河蟹 = HE_XIE,
    YANG_TUO = 185,
    羊驼 = YANG_TUO,
    YOU_LING = 187,
    幽灵 = YOU_LING,
    DAN = 188,
    蛋 = DAN,
    JU_HUA = 190,
    菊花 = JU_HUA,
    HONG_BAO = 192,
    红包 = HONG_BAO,
    DA_XIAO = 193,
    大笑 = DA_XIAO,
    BU_KAI_XIN = 194,
    不开心 = BU_KAI_XIN,
    LENG_MO = 197,
    冷漠 = LENG_MO,
    E = 198,
    呃 = E,
    HAO_BANG = 199,
    好棒 = HAO_BANG,
    BAI_TUO = 200,
    拜托 = BAI_TUO,
    DIAN_ZAN = 201,
    点赞 = DIAN_ZAN,
    WU_LIAO = 202,
    无聊 = WU_LIAO,
    TUO_LIAN = 203,
    托脸 = TUO_LIAN,
    CHI = 204,
    吃 = CHI,
    SONG_HUA = 205,
    送花 = SONG_HUA,
    HAI_PA = 206,
    害怕 = HAI_PA,
    HUA_CHI = 207,
    花痴 = HUA_CHI,
    XIAO_YANG_ER = 208,
    小样儿 = XIAO_YANG_ER,
    BIAO_LEI = 210,
    飙泪 = BIAO_LEI,
    WO_BU_KAN = 211,
    我不看 = WO_BU_KAN,
    TUO_SAI = 212,
    托腮 = TUO_SAI,
    BO_BO = 214,
    啵啵 = BO_BO,
    HU_LIAN = 215,
    糊脸 = HU_LIAN,
    PAI_TOU = 216,
    拍头 = PAI_TOU,
    CHE_YI_CHE = 217,
    扯一扯 = CHE_YI_CHE,
    TIAN_YI_TIAN = 218,
    舔一舔 = TIAN_YI_TIAN,
    CENG_YI_CENG = 219,
    蹭一蹭 = CENG_YI_CENG,
    ZHUAI_ZHA_TIAN = 220,
    拽炸天 = ZHUAI_ZHA_TIAN,
    DING_GUA_GUA = 221,
    顶呱呱 = DING_GUA_GUA,
    BAO_BAO = 222,
    抱抱 = BAO_BAO,
    BAO_JI = 223,
    暴击 = BAO_JI,
    KAI_QIANG = 224,
    开枪 = KAI_QIANG,
    LIAO_YI_LIAO = 225,
    撩一撩 = LIAO_YI_LIAO,
    PAI_ZHUO = 226,
    拍桌 = PAI_ZHUO,
    PAI_SHOU = 227,
    拍手 = PAI_SHOU,
    GONG_XI = 228,
    恭喜 = GONG_XI,
    GAN_BEI = 229,
    干杯 = GAN_BEI,
    CHAO_FENG = 230,
    嘲讽 = CHAO_FENG,
    HENG = 231,
    哼 = HENG,
    FO_XI = 232,
    佛系 = FO_XI,
    QIA_YI_QIA = 233,
    掐一掐 = QIA_YI_QIA,
    JING_DAI = 234,
    惊呆 = JING_DAI,
    CHAN_DOU = 235,
    颤抖 = CHAN_DOU,
    KEN_TOU = 236,
    啃头 = KEN_TOU,
    TOU_KAN = 237,
    偷看 = TOU_KAN,
    SHAN_LIAN = 238,
    扇脸 = SHAN_LIAN,
    YUAN_LIANG = 239,
    原谅 = YUAN_LIANG,
    PEN_LIAN = 240,
    喷脸 = PEN_LIAN,
    SHENG_RI_KUAI_LE = 241,
    生日快乐 = SHENG_RI_KUAI_LE,
    TOU_ZHUANG_JI = 242,
    头撞击 = TOU_ZHUANG_JI,
    SHUAI_TOU = 243,
    甩头 = SHUAI_TOU,
    RENG_GOU = 244,
    扔狗 = RENG_GOU,
    JIA_YOU_BI_SHENG = 245,
    加油必胜 = JIA_YOU_BI_SHENG,
    JIA_YOU_BAO_BAO = 246,
    加油抱抱 = JIA_YOU_BAO_BAO,
    KOU_ZHAO_HU_TI = 247,
    口罩护体 = KOU_ZHAO_HU_TI,
    BAN_ZHUAN_ZHONG = 260,
    搬砖中 = BAN_ZHUAN_ZHONG,
    MANG_DAO_FEI_QI = 261,
    忙到飞起 = MANG_DAO_FEI_QI,
    NAO_KUO_TENG = 262,
    脑阔疼 = NAO_KUO_TENG,
    CANG_SANG = 263,
    沧桑 = CANG_SANG,
    WU_LIAN = 264,
    捂脸 = WU_LIAN,
    LA_YAN_JING = 265,
    辣眼睛 = LA_YAN_JING,
    O_YO = 266,
    哦哟 = O_YO,
    TOU_TU = 267,
    头秃 = TOU_TU,
    WEN_HAO_LIAN = 268,
    问号脸 = WEN_HAO_LIAN,
    AN_ZHONG_GUAN_CHA = 269,
    暗中观察 = AN_ZHONG_GUAN_CHA,
    EMM = 270,
    emm = EMM,
    CHI_GUA = 271,
    吃瓜 = CHI_GUA,
    HE_HE_DA = 272,
    呵呵哒 = HE_HE_DA,
    WO_SUAN_LE = 273,
    我酸了 = WO_SUAN_LE,
    TAI_NAN_LE = 274,
    太南了 = TAI_NAN_LE,
    LA_JIAO_JIANG = 276,
    辣椒酱 = LA_JIAO_JIANG,
    WANG_WANG = 277,
    汪汪 = WANG_WANG,
    HAN = 278,
    汗 = HAN,
    DA_LIAN = 279,
    打脸 = DA_LIAN,
    JI_ZHANG = 280,
    击掌 = JI_ZHANG,
    WU_YAN_XIAO = 281,
    无眼笑 = WU_YAN_XIAO,
    JING_LI = 282,
    敬礼 = JING_LI,
    KUANG_XIAO = 283,
    狂笑 = KUANG_XIAO,
    MIAN_WU_BIAO_QING = 284,
    面无表情 = MIAN_WU_BIAO_QING,
    MO_YU = 285,
    摸鱼 = MO_YU,
    MO_GUI_XIAO = 286,
    魔鬼笑 = MO_GUI_XIAO,
    O = 287,
    哦 = O,
    QING = 288,
    请 = QING,
    ZHENG_YAN = 289,
    睁眼 = ZHENG_YAN
}

/** 表情型 */
export interface Face extends SingleMessage {
    type: 'Face';
    /** 表情id */
    faceId: FaceType | number;
    /** 表情名称 */
    name: string;
}

/** 普通文本型 */
export interface Plain extends SingleMessage {
    type: 'Plain';
    /** 文本内容 */
    text: string;
}

/** 图片型 */
export interface Image extends SingleMessage {
    type: 'Image';
    /** 图片id */
    imageId: string;
    /** 图片链接 */
    url: string;
    /** 图片文件路径 */
    path?: string;
    /** 图片Base64编码 */
    base64?: string;
}

/** 闪图型 */
export interface FlashImage extends SingleMessage {
    type: 'FlashImage';
    /** 图片id */
    imageId: string;
    /** 图片链接 */
    url: string;
    /** 图片文件路径 */
    path?: string;
    /** 图片Base64编码 */
    base64?: string;
}

/** 语音型 */
export interface Voice extends SingleMessage {
    type: 'Voice';
    /** 语音id */
    voiceId: string;
    /** 语音文件路径 */
    path?: string;
    /** 语音Base64编码 */
    base64?: string;
    /** 返回的语音长度 */
    length?: number;
}

/** XML型 */
export interface Xml extends SingleMessage {
    type: 'Xml';
    /** XML内容 */
    xml: string;
}

/** JSON型 */
export interface Json extends SingleMessage {
    type: 'Json';
    /** JSON内容 */
    json: string;
}

/** 小程序型 */
export interface App extends SingleMessage {
    type: 'App';
    /** 小程序内容(Json格式) */
    content: string;
}

/** 戳一戳类型 */
export type PokeType = 'Poke' | 'ShowLove' | 'Like' | 'Heartbroken' | 'SixSixSix' | 'FangDaZhao';

/** 戳一戳型 */
export interface Poke extends SingleMessage {
    type: 'Poke';
    /** 戳一戳名称 */
    name: PokeType;
}

/** 骰子型 */
export interface Dice extends SingleMessage {
    type: 'Dice';
    /** 骰子数值 */
    value: number;
}

/** 音乐分享型 */
export interface MusicShare extends SingleMessage {
    type: 'MusicShare',
    /** 音乐分享类型 */
    kind: string;
    /** 标题 */
    title: string;
    /** 概括 */
    summary: string;
    /** 跳转链接 */
    jumpUrl: string;
    /** 封面图片链接 */
    pictureUrl: string;
    /** 音乐播放链接 */
    musicUrl: string;
    /** 简介 */
    brief: string;
}

/** 合并转发结点 */
export interface ForwardNode {
    /** 发送人QQ号 */
    senderId: number;
    /** 发送时间戳 */
    time: number;
    /** 发送人名称 */
    senderName: string;
    /** 消息链 */
    messageChain: SingleMessage[];
    /** 消息id */
    messageId?: number;
}

/** 合并转发型 */
export interface Forward extends SingleMessage {
    type: 'Forward';
    /** 结点列表 */
    nodeList: ForwardNode[];
}

/** 文件型 */
export interface File extends SingleMessage {
    type: 'File';
    /** 文件id */
    id: string;
    /** 文件名 */
    name: string;
    /** 文件大小 */
    size: number;
}

/** mirai码型 */
export interface MiraiCode extends SingleMessage {
    type: 'MiraiCode';
    /** mirai码 */
    code: string;
}

/** 单一消息类型映射 */
export type SingleMessageMap = {
    Source: Source,
    Quote: Quote,
    At: At,
    AtAll: AtAll,
    Face: Face,
    Plain: Plain,
    Image: Image,
    FlashImage: FlashImage,
    Voice: Voice,
    Xml: Xml,
    Json: Json,
    App: App,
    Poke: Poke,
    Dice: Dice,
    MusicShare: MusicShare,
    Forward: Forward,
    File: File,
    MiraiCode: MiraiCode
};

/** 单一消息类型 */
export type SingleMessageType = keyof SingleMessageMap;

/** mirai事件 */
export interface Event {
    /** 事件类型 */
    readonly type: EventType;
}

/** 机器人事件 */
export interface BotEvent extends Event {
    /** 机器人QQ号 */
    qq: number;
}

/** 好友事件 */
export interface FriendEvent extends Event {
    /** 好友 */
    friend: Friend;
}

/** 群聊事件 */
export interface GroupEvent extends Event {
    /** 群聊 */
    group?: Group;
    /** 操作人(自己时为null) */
    operator?: GroupMember;
}

/** 群成员事件 */
export interface MemberEvent extends Event {
    /** 群成员 */
    member: GroupMember;
}

/** 请求事件 */
export interface RequestEvent extends Event {
    /** 事件id */
    eventId: number;
    /** 事件来源QQ号 */
    fromId: number;
    /** 事件对应群号 */
    groupId: number;
    /** 事件对应人昵称 */
    nick: string;
    /** 事件对应消息 */
    message: string;
}

/** 指令事件 */
export interface CommandEvent extends Event {
    /** 指令名 */
    name: string;
}

/** 其他设备事件 */
export interface OtherClientEvent extends Event {
    /** 其他设备 */
    client: OtherClient;
}

/** Bot登录成功事件 */
export interface BotOnlineEvent extends BotEvent {
    type: 'BotOnlineEvent';
}

/** Bot主动离线事件 */
export interface BotOfflineEventActive extends BotEvent {
    type: 'BotOfflineEventActive';
}

/** Bot被挤下线事件 */
export interface BotOfflineEventForce extends BotEvent {
    type: 'BotOfflineEventForce';
}

/** Bot被服务器断开或因网络问题而掉线事件 */
export interface BotOfflineEventDropped extends BotEvent {
    type: 'BotOfflineEventDropped';
}

/** Bot主动重新登录事件 */
export interface BotReloginEvent extends BotEvent {
    type: 'BotReloginEvent';
}

/** 好友输入状态改变事件 */
export interface FriendInputStatusChangedEvent extends FriendEvent {
    type: 'FriendInputStatusChangedEvent';
    /** 是否正在输入 */
    inputting: boolean;
}

/** 好友昵称改变事件 */
export interface FriendNickChangedEvent extends FriendEvent {
    type: 'FriendNickChangedEvent';
    /** 原昵称 */
    from: string;
    /** 新昵称 */
    to: string;
}

/** 好友消息撤回事件 */
export interface FriendRecallEvent extends FriendEvent {
    type: 'FriendRecallEvent';
    /** 消息发送者QQ号 */
    authorId: number;
    /** 消息id */
    messageId: number;
    /** 消息发送时间戳 */
    time: number;
    /** 撤回消息者QQ号 */
    operator: number;
}

/** Bot在群里的权限被改变事件, 操作人一定是群主 */
export interface BotGroupPermissionChangeEvent extends GroupEvent {
    type: 'BotGroupPermissionChangeEvent';
    /** 原权限 */
    origin: GroupPermission;
    /** 新权限 */
    current: GroupPermission;
    group: Group;
}

/** Bot被禁言事件 */
export interface BotMuteEvent extends GroupEvent {
    type: 'BotMuteEvent';
    /** 禁言时长(秒) */
    durationSeconds: number;
    operator: GroupMember;
}

/** Bot被取消禁言事件 */
export interface BotUnmuteEvent extends GroupEvent {
    type: 'BotUnmuteEvent',
    operator: GroupMember;
}

/** Bot加入了一个新群事件 */
export interface BotJoinGroupEvent extends GroupEvent {
    type: 'BotJoinGroupEvent';
    group: Group;
    /** 邀请人 */
    invitor?: GroupMember;
}

/** Bot主动退出一个群事件 */
export interface BotLeaveEventActive extends GroupEvent {
    type: 'BotLeaveEventActive';
    group: Group;
}

/** Bot被踢出一个群事件 */
export interface BotLeaveEventKick extends GroupEvent {
    type: 'BotLeaveEventKick';
    group: Group;
    /** 操作人 */
    operator?: GroupMember;
}

/** 群消息撤回事件 */
export interface GroupRecallEvent extends GroupEvent {
    type: 'GroupRecallEvent';
    /** 消息发送者QQ号 */
    authorId: number;
    /** 消息id */
    messageId: number;
    /** 消息发送时间戳 */
    time: number;
    group: Group;
    operator?: GroupMember;
}

/** 群名改变事件 */
export interface GroupNameChangeEvent extends GroupEvent {
    type: 'GroupNameChangeEvent';
    /** 原群名 */
    origin: string;
    /** 新群名 */
    current: string;
    group: Group;
    operator?: GroupMember;
}

/** 入群公告改变事件 */
export interface GroupEntranceAnnouncementChangeEvent extends GroupEvent {
    type: 'GroupEntranceAnnouncementChangeEvent';
    /** 原公告 */
    origin: string;
    /** 新公告 */
    current: string;
    group: Group;
    operator?: GroupMember;
}

/** 全员禁言事件 */
export interface GroupMuteAllEvent extends GroupEvent {
    type: 'GroupMuteAllEvent';
    /** 原本是否处于禁言状态 */
    origin: boolean;
    /** 现在是否处于禁言状态 */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

/** 匿名聊天改变事件 */
export interface GroupAllowAnonymousChatEvent extends GroupEvent {
    type: 'GroupAllowAnonymousChatEvent';
    /** 原本是否允许 */
    origin: boolean;
    /** 现在是否允许 */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

/** 坦白说改变事件 */
export interface GroupAllowConfessTalkEvent extends GroupEvent {
    type: 'GroupAllowConfessTalkEvent';
    /** 原本是否允许 */
    origin: boolean;
    /** 现在是否允许 */
    current: boolean;
    group: Group;
    isMyBot: boolean;
}

/** 允许群员邀请好友加群改变事件 */
export interface GroupAllowMemberInviteEvent extends GroupEvent {
    type: 'GroupAllowMemberInviteEvent';
    /** 原本是否允许 */
    origin: boolean;
    /** 现在是否允许 */
    current: boolean;
    group: Group;
    operator?: GroupMember;
}

/** 新人入群事件 */
export interface MemberJoinEvent extends MemberEvent {
    type: 'MemberJoinEvent';
    /** 邀请人 */
    invitor?: GroupMember;
}

/** 群成员被踢出群事件, 该成员不是Bot */
export interface MemberLeaveEventKick extends MemberEvent {
    type: 'MemberLeaveEventKick';
    operator?: GroupMember;
}

/** 群成员主动离群事件, 该成员不是Bot */
export interface MemberLeaveEventQuit extends MemberEvent {
    type: 'MemberLeaveEventQuit';
}

/** 群名片改动事件 */
export interface MemberCardChangeEvent extends MemberEvent {
    type: 'MemberCardChangeEvent';
    /** 原名片 */
    origin: string;
    /** 新名片 */
    current: string;
    operator?: GroupMember;
}

/** 群头衔改动事件, 只有群主有操作限权 */
export interface MemberSpecialTitleChangeEvent extends MemberEvent {
    type: 'MemberSpecialTitleChangeEvent';
    /** 原头衔 */
    origin: string;
    /** 新头衔 */
    current: string;
}

/** 群成员权限改变事件, 该成员不是Bot */
export interface MemberPermissionChangeEvent extends MemberEvent {
    type: 'MemberPermissionChangeEvent';
    /** 原权限 */
    origin: GroupPermission;
    /** 新权限 */
    current: GroupPermission;
}

/** 群成员被禁言事件, 该成员不是Bot */
export interface MemberMuteEvent extends MemberEvent {
    type: 'MemberMuteEvent';
    /** 禁言时长(秒) */
    durationSeconds: number;
    operator?: GroupMember;
}

/** 群成员被取消禁言事件, 该成员不是Bot */
export interface MemberUnmuteEvent extends MemberEvent {
    type: 'MemberUnmuteEvent';
    operator?: GroupMember;
}

/** 群成员称号改变事件 */
export interface MemberHonorChangeEvent extends MemberEvent {
    type: 'MemberHonorChangeEvent';
    /** 称号变化行为(achieve - 获得称号, lose - 失去称号) */
    action: string;
    /** 称号 */
    honor: 'achieve' | 'lose';
}

/** 添加好友申请事件 */
export interface NewFriendRequestEvent extends RequestEvent {
    type: 'NewFriendRequestEvent';
}

/** 用户入群申请事件 */
export interface MemberJoinRequestEvent extends RequestEvent {
    type: 'MemberJoinRequestEvent';
    /** 群名称 */
    groupName: string;
}

/** Bot被邀请入群申请事件 */
export interface BotInvitedJoinGroupRequestEvent extends RequestEvent {
    type: 'BotInvitedJoinGroupRequestEvent';
    /** 群名称 */
    groupName: string;
}

/** 命令被执行事件 */
export interface CommandExecutedEvent extends CommandEvent {
    type: 'CommandExecutedEvent';
    /** 发送命令的好友 */
    friend?: Friend;
    /** 发送命令的群成员 */
    member?: GroupMember;
    /** 指令的参数 */
    args: SingleMessage[];
}

/** 其他设备上线事件 */
export interface OtherClientOnlineEvent extends OtherClientEvent {
    type: 'OtherClientOnlineEvent';
    /** 设备详细类型 */
    kind?: number;
}

/** 其他设备下线事件 */
export interface OtherClientOfflineEvent extends OtherClientEvent {
    type: 'OtherClientOfflineEvent';
}

/** 头像戳一戳类型 */
export type NudgeKind = 'Stranger' | 'Friend' | 'Group';

/** 头像戳一戳接收人 */
export interface NudgeSubject {
    /** 接收人账号 */
    id: number;
    /** 头像戳一戳类型("Stranger" | "Friend" | "Group") */
    kind: NudgeKind;
}

/** 头像戳一戳事件 */
export interface NudgeEvent extends Event {
    type: 'NudgeEvent';
    /** 发送人账号 */
    fromId: number;
    /** 头像戳一戳目标账号 */
    target: number;
    /** 头像戳一戳接收人 */
    subject: NudgeSubject;
    /**
     * 戳一戳动作
     * @example
     * "戳了戳"
     * "捏了捏"
     */
    action: string;
    /**
     * 戳一戳后缀
     * @example
     * "的脸"
     * "的头"
     */
    suffix: string;
}

/** 未知事件 */
export interface UnknownEvent extends Event {
    type: 'UnknownEvent';
    data: object;
}

export type EventMap = {
    BotOnlineEvent: BotOnlineEvent,
    BotOfflineEventActive: BotOfflineEventActive,
    BotOfflineEventForce: BotOfflineEventForce,
    BotOfflineEventDropped: BotOfflineEventDropped,
    BotReloginEvent: BotReloginEvent,
    FriendInputStatusChangedEvent: FriendInputStatusChangedEvent,
    FriendNickChangedEvent: FriendNickChangedEvent,
    FriendRecallEvent: FriendRecallEvent,
    BotGroupPermissionChangeEvent: BotGroupPermissionChangeEvent,
    BotMuteEvent: BotMuteEvent,
    BotUnmuteEvent: BotUnmuteEvent,
    BotJoinGroupEvent: BotJoinGroupEvent,
    BotLeaveEventActive: BotLeaveEventActive,
    BotLeaveEventKick: BotLeaveEventKick,
    GroupRecallEvent: GroupRecallEvent,
    GroupNameChangeEvent: GroupNameChangeEvent,
    GroupEntranceAnnouncementChangeEvent: GroupEntranceAnnouncementChangeEvent,
    GroupMuteAllEvent: GroupMuteAllEvent,
    GroupAllowAnonymousChatEvent: GroupAllowAnonymousChatEvent,
    GroupAllowConfessTalkEvent: GroupAllowConfessTalkEvent,
    GroupAllowMemberInviteEvent: GroupAllowMemberInviteEvent,
    MemberJoinEvent: MemberJoinEvent,
    MemberLeaveEventKick: MemberLeaveEventKick,
    MemberLeaveEventQuit: MemberLeaveEventQuit,
    MemberCardChangeEvent: MemberCardChangeEvent,
    MemberSpecialTitleChangeEvent: MemberSpecialTitleChangeEvent,
    MemberPermissionChangeEvent: MemberPermissionChangeEvent,
    MemberMuteEvent: MemberMuteEvent,
    MemberUnmuteEvent: MemberUnmuteEvent,
    MemberHonorChangeEvent: MemberHonorChangeEvent,
    NewFriendRequestEvent: NewFriendRequestEvent,
    MemberJoinRequestEvent: MemberJoinRequestEvent,
    BotInvitedJoinGroupRequestEvent: BotInvitedJoinGroupRequestEvent,
    CommandExecutedEvent: CommandExecutedEvent,
    OtherClientOnlineEvent: OtherClientOnlineEvent,
    OtherClientOfflineEvent: OtherClientOfflineEvent,
    NudgeEvent: NudgeEvent,
    UnknownEvent: UnknownEvent
}

/** mirai事件类型 */
export type EventType = keyof EventMap;

/** mirai 聊天消息 */
export interface ChatMessage {
    /** 聊天消息类型 */
    readonly type: ChatMessageType;
    /** 消息发送人 */
    sender: Contact;
    /** 消息链 */
    messageChain: MessageChain;
}

/** 好友聊天消息 */
export interface FriendMessage extends ChatMessage {
    type: 'FriendMessage';
    sender: Friend;
}

/** 群聊聊天消息 */
export interface GroupMessage extends ChatMessage {
    type: 'GroupMessage';
    sender: GroupMember;
}

/** 临时聊天消息 */
export interface TempMessage extends ChatMessage {
    type: 'TempMessage';
    sender: GroupMember;
}

/** 陌生人聊天消息 */
export interface StrangerMessage extends ChatMessage {
    type: 'StrangerMessage';
    sender: Friend;
}

/** 其他设备聊天消息 */
export interface OtherClientMessage extends ChatMessage {
    type: 'OtherClientMessage';
    sender: OtherClient;
}

/** 聊天消息映射 */
export type ChatMessageMap = {
    FriendMessage: FriendMessage,
    GroupMessage: GroupMessage,
    TempMessage: TempMessage,
    StrangerMessage: StrangerMessage,
    OtherClientMessage: OtherClientMessage
}

/** 聊天消息类型 */
export type ChatMessageType = keyof ChatMessageMap;

/** 个人资料性别类型 */
export type SexType = 'UNKNOWN' | 'MALE' | 'FEMALE';

/** 个人资料 */
export interface Profile {
    /** 昵称 */
    nickname: string;
    /** 邮箱地址 */
    email: string;
    /** 年龄 */
    age: number;
    /** 等级 */
    level: number;
    /** 个性签名 */
    sign: string;
    /** 性别 */
    sex: SexType;
}

/** 文件概览 */
export interface FileOverview {
    /** 文件名 */
    name: string;
    /** 文件id */
    id: string;
    /** 文件路径 */
    path: string;
    /** 上级文件 */
    parent?: FileOverview;
    /** 文件所属Contact */
    contact: Contact;
    /** 是否为文件 */
    isFile: boolean;
    /** 是否为文件夹 */
    isDirectory: boolean;
    /** 文件下载信息 */
    downloadInfo?: {
        /** 文件sha1 */
        sha1: string;
        /** 文件md5 */
        md5: string;
        /** 下载次数 */
        downloadTimes: number;
        /** 上传人QQ号 */
        uploaderId: number;
        /** 上传时间戳 */
        uploadTime: number;
        /** 最近更改时间戳 */
        lastModifyTime: number;
        /** 文件下载链接 */
        url: string;
    }
}

/** 群设置 */
export interface GroupConfig {
    /** 群名 */
    name: string;
    /** 是否开启坦白说 */
    confessTalk: boolean;
    /** 是否允许群员邀请 */
    allowMemberInvite: boolean;
    /** 是否开启自动审批入群 */
    autoApprove: boolean;
    /** 是否允许匿名聊天 */
    anonymousChat: boolean;
}

/** mirai-api-http请求返回的状态码 */
export enum ResponseCode {
    /** 正常 */
    Success = 0,
    /** 错误的verify key */
    WrongVerifyKey = 1,
    /** 指定的Bot不存在 */
    BotNotExist = 2,
    /** Session失效或不存在 */
    SessionNotExist = 3,
    /** Session未认证(未激活) */
    UnverifiedSession = 4,
    /** 发送消息目标不存在(指定对象不存在) */
    TargetNotExist = 5,
    /** 指定文件不存在, 出现于发送本地图片 */
    FileNotExist = 6,
    /** 无操作权限, 指Bot没有对应操作的限权 */
    NoPermission = 10,
    /** Bot被禁言, 指Bot当前无法向指定群发送消息 */
    BotIsMuted = 20,
    /** 消息过长 */
    MessageTooLong = 30,
    /** 错误的访问, 如参数错误等 */
    BadRequest = 400,
    /** mirai-api-http 内部错误 */
    InternalError = 500
}

/** 认证响应 */
export interface VerifyResponse {
    /** 状态码 */
    code: ResponseCode;
    /** 会话Session */
    session: string;
}

/** Api请求的响应 */
export interface ApiResponse {
    /** 状态码 */
    code: ResponseCode;
    /** 消息 */
    msg: string;
    /** 响应数据 */
    data?: object;
}

/** 获取插件信息响应 */
export interface AboutResponse extends ApiResponse {
    data: {
        /** mirai-api-http版本 */
        version: string
    }
}

/** 获取历史消息响应 */
export interface MessageRetrieveResponse extends ApiResponse {
    /** 消息、事件列表 */
    data: Array<ChatMessage | Event>;
}

/** 根据id获取消息响应 */
export interface MessageFromIdResponse extends ApiResponse {
    /** 消息 */
    data: ChatMessage;
}

/** 获取好友列表响应 */
export interface FriendListResponse extends ApiResponse {
    /** 好友列表 */
    data: Friend[];
}

/** 获取群列表响应 */
export interface GroupListResponse extends ApiResponse {
    /** 群列表 */
    data: Group[];
}

/** 获取群成员列表响应 */
export interface MemberListResponse extends ApiResponse {
    /** 群成员列表 */
    data: GroupMember[];
}

/** 获取资料响应 */
export interface ProfileResponse extends ApiResponse {
    /** 个人资料 */
    data: Profile;
}

/** 发送消息响应 */
export interface SendMessageResponse extends ApiResponse {
    /** 已发送消息id */
    messageId: number;
}

/** 查看文件列表响应 */
export interface FileListResponse extends ApiResponse {
    /** 文件概览列表 */
    data: FileOverview[];
}

/** 获取文件信息响应 */
export interface FileInfoResponse extends ApiResponse {
    /** 文件概览 */
    data: FileOverview;
}

/** 获取群设置响应 */
export interface GroupConfigResponse extends ApiResponse {
    /** 群设置 */
    data: GroupConfig;
}

/** 获取群成员信息响应 */
export interface GroupMemberResponse extends ApiResponse {
    /** 群成员信息 */
    data: GroupMember;
}

/** 图片上传响应 */
export interface UploadImageResponse {
    /** 图片id */
    imageId: string;
    /** 图片下载链接 */
    url: string;
}

/** 语音上传响应 */
export interface UploadVoiceResponse {
    /** 语音id */
    voiceId: string;
    /** 语音下载链接 */
    url: string;
}

/** 文件上传响应 */
export type UploadFileResponse = FileInfoResponse;

/** 支持的 mirai-api-http 版本号 */
export const MIRAI_API_HTTP_VERSION = '2.3.3';
