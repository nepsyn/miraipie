# 基础使用

> 此指南假设你已经了解 JavaScript 的相关知识，并能够使用 JavaScript 进行基础开发。
> 在实际使用中遇到问题时，如果是语言和技术相关的问题，建议使用搜索引擎解决你的问题。
> 如果是 miraipie 中产生的问题，欢迎在 Github 仓库提出 issue。

从文档的这一部分开始，我们强烈建议你使用本地的工具完成教程中的操作，以对 miraipie 有更加直观的理解。 如果你是熟悉 web 开发的开发者，可以使用网页调试控制台（F12 唤出）来完成教程。
如果调试控制台妨碍了你的阅读，也可以点击以下按钮弹出 jsconsole playground 来完成教程。

<a class="button" onclick="window.open('https://jsconsole.com/?%3Aload%20https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fmiraipie%40latest%2Fdist%2Fmiraipie.bundle.js', 'jsconsole - playground', 'height=640,width=800,location=no,menubar=no,status=no,toolbar=no')">jsconsole playground</a>

如果你是熟悉 Node.js 的开发者——那也没关系，你可以直接启动 Node REPL 解释器完成同样的操作，你需要先新建一个 NPM 项目：

```shell
mkdir miraipie-guide
cd miraipie-guide
npm init -y
npm i miraipie
```

完成上面的操作后，在 miraipie-guide 目录下启动一个 Node REPl 解释器，并 require miraipie 到环境中：

```javascript
const Miraipie = require('miraipie');
```

至此，你可以使用解释器完成以下的所有教程内容了。

## 创建应用

在 [启动应用](listen.html) 一节已经了解了启动 miraipie 应用程序的方法。 在教程开始前，我们首先创建一个应用程序实例：

```javascript
const app = Miraipie.createApp(Miraipie.makeAppConfig({
    qq: 100000000,                     // 这里修改为机器人服务的QQ号
    adapterInUse: 'ws',
    verbose: true,
    adapters: {
        ws: {
            configs: {
                verifyKey: 'my verify key',  // 这里修改为 mirai-api-http 的配置项 verifyKey
                host: '127.0.0.1',           // 这里修改为 mirai-api-http 服务主机地址
                port: 22333                  // 这里修改为 mirai-api-http 服务端口号
            }
        }
    }
}));
```

## 启动监听

使用 CLI 创建的应用程序会自动启动监听，但在一般情况下，miraipie 是不会自动启动监听的，为此我们需要手动启动监听。 miraipie 有较为完善的事件系统，首先我们为监听成功添加一个事件监听器：

```javascript
app.on('listen', () => {
    console.log('miraipie 应用程序监听启动成功啦！');
});
```

之后我们手动启动监听：

```javascript
app.listen();
```

如果配置填写正确并且应用监听启动成功，你应该能在控制台看到 `"miraipie 应用程序监听启动成功啦！"` 。 人生难得一帆风顺，当你遇到问题导致监听未启动成功时，请检查控制台的输出内容并调整配置。

> 如果控制台出现 `An insecure WebSocket connection may not be initiated from a page loaded over HTTPS` 错误提示，请启用 `ssl` 配置或参考 [Allowing insecure WebSocket connections](https://www.damirscorner.com/blog/posts/20210528-AllowingInsecureWebsocketConnections.html)。

## Hello World!

和其他很多教程一样，Hello World 的示例是最直观的。 我们已经成功启动了监听，现在我们可以与好友进行聊天了！

我们首先选择一个好友作为聊天的对象，这个好友应该存在于机器人账号的好友列表中（一般测试的情况下，建议注册一个额外的 QQ 账号用于测试），然后我们向好友发送一条消息，内容为 `"Hello World!"`：

```javascript
Miraipie.Chat.findFriend(/* 换成好友的QQ号 */ 123456789).then(async (chat) => {
    await chat.send('Hello World!');
});
```

如果发送成功，效果图如下所示：

<Chat :messages="[{avatar: '/Jerry.jpeg', content: 'Hello World!', fromBot: true}]"></Chat>

这里的 `chat` 是 miraipie 中抽象的一个概念，它代表与一个对象的聊天窗口。
和 QQ 客户端一样，你的聊天窗口可以分为和好友的聊天窗口、群聊的聊天窗口和私聊的聊天窗口。
聊天窗口提供了多个方法用于模拟客户端的各项操作，例如发送消息、撤回消息、删除好友等。

## 发送不同类型消息

在日常使用社交软件的过程中，我们当然不只发送文本，我们还要发送不同类型的消息。
在 miraipie 中，发送不同类型的消息非常简单。



```javascript
// 发送一张图片消息，以下两种方式是等价的
await chat.send(Miraipie.Image(
    null,
    'https://tvax1.sinaimg.cn/large/007Tv3Vmly1gufg1l5szij31hc0u07cv'
));

await chat.send(Miraipie.makeImage({
    url: 'https://tvax1.sinaimg.cn/large/007Tv3Vmly1gufg1l5szij31hc0u07cv'
}));
```
<Chat :messages="[{avatar: '/Jerry.jpeg', type: 'Image', content: 'https://tvax1.sinaimg.cn/large/007Tv3Vmly1gufg1l5szij31hc0u07cv', fromBot: true}]"></Chat>

## 响应他人的消息

作为一个机器人，其不能只是主动发送消息，在他人发送消息时做出合理响应才是机器人最核心的功能。
在 miraipie 中，针对消息做出响应分为两种：一次性的响应（等待）和持续性的响应（监听）。

### 一次性的响应

一个简单的例子：

```javascript
// 复读
Miraipie.Chat.findFriend(/* 换成好友的QQ号 */ 123456789).then(async (chat) => {
    const message = await chat.nextMessage();
    await chat.send(message);
});
```

之后通过该好友向机器人发送任意一条消息，就会有如下所示的响应：

<Chat :messages="[{avatar: '/Jerry.jpeg', content: '人类的本质'}, {avatar: 'Tom.jpeg', content: '人类的本质', fromBot: true}]"></Chat>

但只响应一次消息的复读机往往是不符合直觉的：

<Chat :messages="[{avatar: '/Jerry.jpeg', content: '人类的本质'}, {avatar: 'Tom.jpeg', content: '人类的本质', fromBot: true}, {avatar: '/Jerry.jpeg', content: '你最帅！'}, {avatar: '/Jerry.jpeg', content: '为什么不说话？'}]"></Chat>

### 持续性的响应

```javascript
app.on('FriendMessage', async (chatMessage) => {
    if (chatMessage.sender.id === /* 换成好友的QQ号 */ 123456789) {
        const chat = new FriendChat(chatMessage.sender);
        await chat.send(chatMessage.messageChain);

        // 不创建聊天窗，直接通过api发送
        // app.api.sendFriendMessage(chatMessage.sender.id, chatMessage.messageChain);
    }
});
```

现在你的机器人会持续性地响应指定好友发送的消息了：

<Chat :messages="[{avatar: '/Jerry.jpeg', content: '人类的本质'}, {avatar: '/Tom.jpeg', content: '人类的本质', fromBot: true}, {avatar: '/Jerry.jpeg', content: '你最帅！'}, {avatar: '/Tom.jpeg', content: '你最帅！', fromBot: true}, {avatar: '/Jerry.jpeg', type: 'Image', content: 'bro.jpg'}, {avatar: '/Tom.jpeg', type: 'Image', content: 'bro.jpg', fromBot: true}]"></Chat>

### 我该如何决定哪种响应方式？

对于机器人的某个长期支持的服务（点歌、搜题等）来说，一般应采用持续响应的方式。
对于一些只作用一次的功能（抢答、确认操作等），一般采用一次性响应的方式。

在实际开发中，通常会遇到两者组合的情况。请设想下图中的情况：

<Chat :messages="[{avatar: '/Jerry.jpeg', content: 'rm -rf /学习资料'}, {avatar: '/Tom.jpeg', content: '确定要删除吗？', fromBot: true}, {avatar: '/Jerry.jpeg', content: '确定'}, {avatar: '/Tom.jpeg', content: '已删除', fromBot: true}, {avatar: '/Jerry.jpeg', content: 'rm -rf /'}, {avatar: '/Tom.jpeg', content: '确定要删除吗？', fromBot: true}, {avatar: '/Jerry.jpeg', content: '我闹着玩的'}, {avatar: '/Tom.jpeg', content: '已取消删除', fromBot: true}]"></Chat>

对于这种长期服务操作需要确认的情况，单独使用两种响应方式都会使代码变得十分笨重。两种方式组合起来会以很优雅的方式实现功能：

```javascript
app.on('FriendMessage', async (chatMessage) => {
    if (chatMessage.messageChain.toDisplayString().startsWith('rm')) {
        const chat = new FriendChat(chatMessage.sender);
        // 等待下一条确认消息
        const confirmMessage = await chat.nextMessage();
        if (confirmMessage.toDisplayString() === '确认') {
            /* 执行删除操作... */
            await chat.send('已删除');
        } else {
            /* 啥也不干 */
            await chat.send('已取消删除');
        }
    }
});
```

到目前为止，你已经学习了开发一个简单机器人的所有基础操作。
你现在可以倒上一杯咖啡，为你的机器人添加一个简单的功能。
在下一章节，我们将进一步探索 miraipie 中的各项操作。
