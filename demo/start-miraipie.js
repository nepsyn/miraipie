const {createApp, ApplicationConfig} = require('../lib/miraipie');
const config = require('./miraipie.json');

// const app = createApp(ApplicationConfig.make({
//     qq: 123456789,
//     adapterInUse: 'mixed',
//     logDirectory: 'log',
//     logLevel: 'debug',
//     verbose: false,
//     adapters: {
//         mixed: {
//             configs: {
//                 verifyKey: 'verify key',
//                 host: '127.0.0.1',
//                 port: 23333
//             }
//         }
//     },
//     pies: {
//         repeater: {
//             module: './repeater-pie',
//             enabled: true,
//             configs: {}
//         }
//     }
// }));
const app = createApp(ApplicationConfig.make(config));

// 消息监听
app.on('message', console.log);

// 事件监听
app.on('event', console.log);

app.listen();
