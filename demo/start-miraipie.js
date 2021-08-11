const MiraiPie = require('miraipie');
const config = require('./config.json');
const log4js = require('log4js');

// 配置日志系统
log4js.configure({
    appenders: {
        console: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'debug'
        },
    }
});

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
