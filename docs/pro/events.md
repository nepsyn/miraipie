# 事件

## 事件概述

作为机器人服务框架，除了处理不同聊天对象的消息，通常还需要对机器人收到的事件进行处理。
理论上，miraipie 支持所有由 mirai-api-http 传递的事件，具体的事件列表请移步 [mirai-api-http 事件类型一览](https://github.com/project-mirai/mirai-api-http/blob/master/docs/api/EventType.md) 。

> 严格意义上，监听到的聊天对象消息也属于机器人事件。在一般情况下，不会单独对 “消息” 和 “事件” 加以区分。

通过监听事件，使框架可以对机器人下线、被禁言；成员入群、退群；消息撤回等诸多操作进行反馈或处理，可以一定程度增加机器人的可用性。

## 事件监听

在 miraipie 中，监听不同类型事件只需知道事件类型名称即可：

```javascript
const {createApp} = require('miraipie');
const app = createApp(/* ... */);

// 监听机器人被踢出群事件
app.on('BotLeaveEventKick', (event) => {
    console.log(`机器人被移出群： ${event.group.name}`);
});

// 监听机器人登陆成功事件，async/await 也同样支持
app.on('BotOnlineEvent', async (event) => {
    await someTask();
    console.log(`机器人 ${event.qq} 登录成功啦！`);
});
```

通过 TypeScript 的类型注释，你不必要记住某个事件的具体名称，
通常完整的事件名称会出现在 IDE 的自动补全列表中：

<img :src="$withBase('/images/event_type_autocomplete.jpg')" alt="未加载的图片">

在 miraipie 1.2.4 及之后的版本中，TypeScript 会根据监听的事件类型自动推断回调函数中的 event 类型，
配合 IDE 可以达到事半功倍的效果。

## 事件反馈

在 mirai-api-http 传递的事件中，存在几个特殊的可反馈操作的事件，它们分别是：

- 添加好友申请事件（NewFriendRequestEvent）
- 用户入群申请事件（MemberJoinRequestEvent）
- Bot被邀请入群申请事件（BotInvitedJoinGroupRequestEvent）

在实际使用中可能需要对以上事件做出反馈，遗憾的是，miraipie 并没有提供处理以上事件的简单方法，
要处理以上事件，你需要直接使用 miraipie 的 adapter 提供的方法：

```javascript
const {createApp} = require('miraipie');
const app = createApp(/* ... */);

// 监听并处理添加好友申请事件
app.on('NewFriendRequestEvent', async (event) => {
    await app.api.handleNewFriendRequest(
        event.eventId,
        event.fromId,
        event.groupId,
        0,  // 0代表同意添加
        '你好！'  // 回复的消息
    );
});
```
