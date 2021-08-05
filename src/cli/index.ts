import {Option, program} from 'commander';
import log4js from 'log4js';
import * as Path from 'path';
import {HttpAdapter, MiraiApiHttpClientSetting, WebsocketAdapter} from '../mirai';
import {createMiraiPieApp, MiraiPieAppOptions} from '../pie';

const logger = log4js.getLogger('cli');

const adapterMap = {
    HttpAdapter: HttpAdapter,
    WebsocketAdapter: WebsocketAdapter
}

function getAdapter(name: string) {
    if (name in adapterMap) return adapterMap[name];
    else {
        logger.warn(`没有找到名为 '${name}' 的adapter, 已使用HttpAdapter代替`);
        return HttpAdapter;
    }
}

program
    .version('1.0.0')
    .option('-D, --db-file <path>', 'miraipie的数据库文件路径')
    .addOption(new Option('-A, --adapter <adapter>', 'mirai-api-http中用于全局的adapter')
        .default(HttpAdapter)
        .choices(Object.keys(adapterMap))
        .argParser(getAdapter))
    .addOption(new Option('-L, --listener-adapter <adapter>', 'mirai-api-http中用于监听事件的adapter')
        .default(WebsocketAdapter)
        .choices(Object.keys(adapterMap))
        .argParser(getAdapter))
    .option('-H, --host <host>', 'mirai-api-http运行的主机地址')
    .option('-P, --port <port>', 'mirai-api-http运行的端口号')
    .option('-K, --key <verifyKey>', 'mirai-api-http的verifyKey')
    .option('-Q, --qq <qq>', 'miraipie服务的QQ号', parseInt)
    .option('-p, --pie <paths...>', 'miraipie需要加载的pie的模块路径')
    .action((opts) => {
        log4js.configure({
            appenders: {
                console: {
                    type: 'console'
                },
                file: {
                    type: 'file',
                    filename: `miraipie.log`
                }
            },
            categories: {
                default: {
                    appenders: ['console', 'file'],
                    level: process.env.MIRAIPIE_ENV === 'production' ? 'info' : 'debug'
                }
            }
        });

        const adapterOptions: MiraiApiHttpClientSetting = {
            verifyKey: opts.key,
            host: opts.host,
            port: opts.port
        }

        const appOptions: MiraiPieAppOptions = {
            id: null,
            adapter: null,
            listenerAdapter: null
        }

        if (opts.dbFile) {

        } else {
            adapterOptions.verifyKey = opts.key;
            adapterOptions.host = opts.host;
            adapterOptions.port = opts.port;

            appOptions.id = opts.qq;
            appOptions.adapter = new opts.adapter(adapterOptions);
            appOptions.listenerAdapter = opts.adapter === opts.listenerAdapter ? appOptions.adapter : new opts.listenerAdapter(adapterOptions);
        }

        const app = createMiraiPieApp(appOptions);

        if (opts.pie) {
            for (const path of opts.pie) {
                try {
                    app.pieAgent.install(require(Path.join(process.cwd(), path)));
                } catch (err) {
                    logger.error(`加载pie模块 '${path}' 发生错误:`, err);
                }
            }
        }

        app.listen();
    })
    .parse(process.argv);
