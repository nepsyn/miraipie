const MiraiPie = require('miraipie');
const config = require('./config.json');

// const app = MiraiPie({
//     qq: 747337480,
//     adapterSetting: {
//         verifyKey: 'verify key',
//         host: '127.0.0.1',
//         port: 23333
//     },
//     adapter: 'HttpAdapter',
//     listenerAdapter: 'WebsocketAdapter'
// });
const app = MiraiPie(config);

// 消息监听
app.onMessage((chatMessage) => {
    console.log(chatMessage);
});

// 事件监听
app.onEvent((event) => {
    console.log(event);
});

app.listen();
