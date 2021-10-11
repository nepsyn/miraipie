# 消息结构

## 消息链（`MessageChain`）

mirai 中的消息链相当于多个[单一消息](#单一消息-singlemessage)（SingleMessage）的列表，
miraipie 在保持消息链原有特性的基础上对其进行了拓展，
添加了类型选取（select）、丢弃（drop）等操作，使开发过程中对消息链的操作更加直观。

在 miraipie 中，所有发送和接收到的消息都是以消息链的形式存在的。
即使发送的消息中只有一条普通文本内容，为了保持一致性，miraipie 也会构造一个消息链来装载这条消息。

> Tips： 在 miraipie 源码中 Mirai.MessageChain 和 MessageChain 有不同含义，
> Mirai.MessageChain 表示 mirai-api-http 中的消息链类型，本质上是多个单一消息组合成的数组，
> 而直接使用的 MessageChain 是 miraipie 拓展后的消息链类型，其拥有更丰富的操作。

### 数组原生操作

miraipie 中 `MessageChain` 类型本质上还是一个数组，其拥有 JS 原生数组具备的所有操作。
你可以直接使用 map 、filter 等原生操作，也可以直接使用下标获取对应单一消息。

```javascript
const {MessageChain} = require('miraipie');

// 构造消息链（一般不需要手动构建，此处为演示需要）
const chain = MessageChain.from([
    Plain('Hello '),
    Plain('World!')
]);

// {type: 'Plain', text: 'Hello '}
chain[0];
// {type: 'Plain', text: 'World!'}
chain[1];
// 添加一个表情
chain.push(Face(Faces.OK));
// 3
chain.length;
```

### 消息过滤

- `chain.f` or `chain.firstClientMessage`

用于获取消息链中的首条有效消息。
在 mirai-api-http 接收到的消息链中，会自动加上一个 Source 类型的单一消息用于标识消息来源。
然而实际开发中很少会直接用到，使用 `chain.f` 可以轻松过滤掉 Source 类型单一消息并返回第一个有效单一消息。

```javascript
app.on('FriendMessage', (chatMessage) => {
    // 控制台打印每条接收到好友消息的第一条有效消息
    console.log(chatMessage.messageChain.f);
});
```

- `chain.select(type)` or `chain.selected(type)`

用于选择指定类型的消息。
选择后只保留指定类型的消息，`chain.select(type)` 会在 **原地** 修改消息链，`chain.selected(type)` 会创建一个新的消息链。

```javascript
const {MessageChain} = require('miraipie');

// 构造消息链
const chain = MessageChain.from([
    Plain('我已经怒不可遏了'),
    Face(Faces.FA_NU)
]);

const plains = chain.selected('Plain'); // 选择 Plain 类型消息并创建新的消息链
chain.length;  // 2
plains.length;  // 1
plains === chain;  // false

const plainsInPlace = chain.select('Plain');  // 原地选择 Plain 类型消息
chain.length;  // 1
plainsInPlace.length;  // 1
plainsInPlace === chain;  // true
```

- `chain.drop(type)` or `chain.dropped(type)`

用于丢弃指定类型的消息。
丢弃后只保留其他类型消息，与消息选择类似，
`chain.drop(type)` 会在 **原地** 修改消息链，`chain.dropped(type)` 会创建一个新的消息链。

### 消息来源

- `chain.sourceId`

用于获取消息id。只存在于 mirai-api-http 返回的消息链中。
一般用于消息撤回等操作。

- `chain.time`

用于获取消息接收时间。只存在于 mirai-api-http 返回的消息链中。
一般用于持久化记录消息等操作。

### 消息序列化

- `chain.toMiraiCode()`

用于将消息链序列化为 mirai 码。
miraipie **不能保证**序列化后的 mirai 码与 mirai 原生 mirai 码兼容，请谨慎使用。

```javascript
const {MessageChain} = require('miraipie');

// 构造消息链
const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
// "[mirai:atall] Hello World!"
chain.toMiraiCode();
```

- `chain.toDisplayString()`

用于将消息链序列化为显示字符串。
一般用于日志记录或文本消息匹配。

```javascript
const {MessageChain} = require('miraipie');

// 构造消息链
const chain = MessageChain.from([AtAll(), Plain('Hello '), Plain('World!')]);
// "@全体成员 Hello World!"
chain.toDisplayString();
```

## 单一消息（`SingleMessage`）

mirai 中的单一消息用于表示一个原子的消息内容，如一张图片、一段语音等。
在 mirai-api-http 中，单一消息使用 JSON 格式表示，miraipie 在原有基础上对其进行了简单拓展。

miraipie 中支持的单一消息类型始终与 mirai-api-http 提供的 [消息类型](https://github.com/project-mirai/mirai-api-http/blob/master/docs/api/MessageType.md#%E6%B6%88%E6%81%AF%E7%B1%BB%E5%9E%8B) 保持一致。

- Source （来源）
- Quote （引用回复）
- At （@某人）
- AtAll （@全体成员）
- Face （聊天表情）
- Plain （普通文本）
- Image （图片）
- FlashImage （闪图）
- Voice （语音）
- Xml （XML 卡片）
- Json（JSON 卡片）
- App （小程序）
- Poke （戳一戳）
- Dice （骰子）
- MusicShare （音乐分享）
- Forward （合并转发）
- File （文件）
- MiraiCode （原生 mirai 码）

### 消息构造

在 miraipie 中，构造单一消息只需要调用其类型同名函数并依次填入参数即可。
函数具体的参数可查看 mirai-api-http 提供的 [消息类型文档](https://github.com/project-mirai/mirai-api-http/blob/master/docs/api/MessageType.md#%E6%B6%88%E6%81%AF%E7%B1%BB%E5%9E%8B) ，也可以通过 IDE 查看函数注释。

```javascript
const {Plain, At} = require('miraipie');

// {type: 'Plain', text: 'JavaScript is the best programming language in the world!', ...}
Plain('JavaScript is the best programming language in the world!');
// {type: 'At', target: 123456789, display: '@', ...}
At(123456789, '@');
```

特别的，由于部分单一消息可选属性较多，miraipie 提供了一些辅助函数用于构造图片、闪图、语音和音乐分享型消息。
其分别对应 `makeImage(options)` 、 `makeFlashImage(options)` 、 `makeVoice(options)` 和 `makeMusicShare(options)` 。
使用辅助函数构造此类消息会使消息结构更为直观。

```javascript
const {Image, makeImage} = require('miraipie');
const base64string = 'SomeMockBase64String==';

// 直接构造方式
const image = Image(null, null, null, base64string);
// 辅助函数构造方式
const imageByMake = makeImage({
    base64: base64string
});
```

### 消息序列化

与消息链相同，每个单一消息都有 `toMiraiCode()` 和 `toDisplayString()` 方法，用于分别序列化为 mirai 码和显示字符串。

```javascript
const {At} = require('miraipie');

const at = At(123456789, '@');
// [mirai:at:123456789]
at.toMiraiCode();
// @123456789
at.toDisplayString();
```
