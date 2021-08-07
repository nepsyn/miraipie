import * as child_process from 'child_process';
import {program} from 'commander';
import {prompt} from 'enquirer';
import * as fs from 'fs';
import log4js from 'log4js';
import * as Path from 'path';
import {MiraiApiHttpAdapterMap} from '../mirai';
import {createMiraiPieApp, Sqlite3Adapter} from '../pie';
import {getAssetPath} from '../tool';

const logger = log4js.getLogger('cli');

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
        file: {
            type: 'file',
            filename: 'miraipie.log',
        }
    },
    categories: {
        default: {
            appenders: ['console', 'file'],
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }
    }
});

function parseFullId(fullId: string) {
    let namespace: string = null, id: string = null;
    if (fullId) {
        if (fullId.includes(':')) [namespace, id] = fullId.split(':');
        else id = fullId;
    }
    return [namespace, id];
}

program
    .version('miraipie 1.0.0', '-V, --version', '显示版本信息')
    .option('-d, --db-file <path>', 'miraipie的数据库文件路径', 'miraipie.db')
    .option('-r, --renew', '重新询问配置')
    .option('-p, --pie <paths...>', 'miraipie需要额外加载的pie的模块路径')
    .helpOption('-h, --help', '显示帮助信息')
    .action(async (opts) => {
        const db = new Sqlite3Adapter(opts.dbFile);
        const options = db.loadAppOptions();
        if ((!options) || opts.renew) {
            prompt([
                {
                    type: 'select',
                    name: 'adapter',
                    message: '请选择用于全局的mirai-api-http adapter',
                    choices: Object.keys(MiraiApiHttpAdapterMap)
                },
                {
                    type: 'select',
                    name: 'listenerAdapter',
                    message: '请选择用于监听事件的mirai-api-http adapter',
                    choices: Object.keys(MiraiApiHttpAdapterMap),
                    initial: 1
                },
                {
                    type: 'input',
                    name: 'qq',
                    message: '请输入mirai-api-http服务的QQ号',
                },
                {
                    type: 'input',
                    name: 'host',
                    message: '请输入mirai-api-http服务的主机地址',
                    initial: '127.0.0.1'
                },
                {
                    type: 'input',
                    name: 'port',
                    message: '请输入mirai-api-http服务的端口号',
                    initial: '23333'
                },
                {
                    type: 'password',
                    name: 'verifyKey',
                    message: '请输入mirai-api-http配置项中的verifyKey',
                }
            ]).then(async (pro: any) => {
                await createMiraiPieApp({
                    id: pro.qq,
                    adapter: pro.adapter,
                    listenerAdapter: pro.listenerAdapter,
                    adapterSetting: {
                        verifyKey: pro.verifyKey,
                        host: pro.host,
                        port: parseInt(pro.port)
                    },
                    db
                }).listen();
            }).catch((err) => {
                logger.error(`初始化miraipie服务错误:`, err);
            });
        } else {
            await createMiraiPieApp({...options, db}).listen();
        }
    });

program
    .command('create [full_id]')
    .aliases(['new', 'init', 'c'])
    .description('使用模板创建新的pie项目')
    .action((fullId: string) => {
        const [namespace, id] = parseFullId(fullId);
        prompt([
            {
                type: 'input',
                name: 'namespace',
                message: '请输入namespace',
                initial: namespace
            },
            {
                type: 'input',
                name: 'id',
                message: '请输入id',
                initial: id
            },
            {
                type: 'input',
                name: 'name',
                message: '请输入名称',
                initial: id
            },
            {
                type: 'input',
                name: 'path',
                message: '请输入存放位置',
                initial: `${id || 'pie'}/`
            }
        ]).then((pro: any) => {
            try {
                // 创建文件夹
                if (!fs.existsSync(pro.path)) {
                    fs.mkdirSync(pro.path);
                }
                // 创建package.json
                let packageContent = fs.readFileSync(getAssetPath('package.json.template')).toString();
                packageContent = packageContent.replace('{{name}}', pro.name);
                fs.writeFileSync(Path.join(pro.path, 'package.json'), packageContent);
                // 创建pie文件
                let pieContent = fs.readFileSync(getAssetPath('pie.js.template')).toString();
                pieContent = pieContent
                    .replace('{{namespace}}', pro.namespace)
                    .replace('{{id}}', pro.id)
                    .replace('{{name}}', pro.name);
                fs.writeFileSync(Path.join(pro.path, 'index.js'), pieContent);
                // 调用npm初始化
                child_process.execSync(`cd ${pro.path} && npm install`);

                logger.info('创建pie项目完成');
            } catch (err) {
                logger.error('创建pie项目失败, 错误:', err);
            }
        }).catch(() => {
            logger.info('已取消创建pie项目');
        });
    });

program
    .command('add <full_id>')
    .aliases(['get', 'a'])
    .description('从远程或本地添加pie')
    .action((fullId: string) => {

    });

program
    .command('update [full_id]')
    .aliases(['upgrade', 'u'])
    .description('从远程或本地更新pie')
    .action((fullId: string) => {

    });

program
    .command('delete <full_id>')
    .aliases(['remove', 'd'])
    .description('删除已添加的pie')
    .action((fullId: string) => {
        if (fs.existsSync('miraipie.db')) {
            const db = new Sqlite3Adapter('miraipie.db');
            const path = db.getPiePath(fullId);
            if (path) {
                if (fs.existsSync(path)) {
                    const stat = fs.statSync(path);
                    if (stat.isDirectory()) fs.rmdirSync(path);
                    else fs.unlinkSync(path);
                }
                db.deletePie(fullId);
                logger.info(`已删除pie '${fullId}'`);
            } else {
                logger.warn(`未找到pie '${fullId}'`)
            }
        } else {
            logger.warn('当前目录下不存在miraipie.db数据库文件');
        }
    });

program
    .command('set-repo <url>')
    .alias('set-repository')
    .description('设置pie仓库源')
    .action((url: string) => {

    });

program.parse(process.argv);
