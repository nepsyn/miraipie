import {execSync} from 'child_process';
import {program} from 'commander';
import {prompt} from 'enquirer';
import fs from 'fs';
import log4js from 'log4js';
import path from 'path';
import {MiraiApiHttpAdapterMap} from '../mirai';
import {createMiraiPieApp, DatabaseAdapter, Sqlite3Adapter} from '../pie';
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

function useDatabase(path: string): Promise<DatabaseAdapter> {
    return new Promise((resolve) => {
        const db = new Sqlite3Adapter(path);
        if (db.open) resolve(db);
    });
}

program
    .version(`miraipie ${require('../../package.json').version}`, '-V, --version', '显示版本信息')
    .option('-d, --db-file <path>', 'miraipie的数据库文件路径', 'miraipie.db')
    .option('-r, --renew', '重置miraipie并重新填写配置')
    .option('-p, --pies <paths...>', 'miraipie需要额外加载的pie的模块路径')
    .helpOption('-h, --help', '显示帮助信息')
    .action(async (opts) => {
        const db = fs.existsSync(opts.dbFile) ? new Sqlite3Adapter(opts.dbFile) : Sqlite3Adapter.create(opts.dbFile);
        if (db.open && fs.statSync(opts.dbFile).size / Math.pow(2, 30) > 1) {
            logger.warn('数据库文件大小已超过1GB, 建议使用命令 `miraipie clear-history` 清除历史消息记录');
        }

        const options = db.loadAppOptions();
        const pies = (opts.pies || []).map((p) => {
            try {
                return require(path.join(process.cwd(), p));
            } catch (err) {
                logger.error(`加载额外pie模块路径 ${p} 出错:`, err);
                return null;
            }
        }).filter((pie) => pie !== null);
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
                    db,
                    pies
                }).listen();
            }).catch((err) => {
                logger.error(`初始化miraipie服务错误:`, err);
            });
        } else {
            await createMiraiPieApp({...options, db, pies}).listen();
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
                fs.writeFileSync(path.join(pro.path, 'package.json'), packageContent);
                // 创建pie文件
                let pieContent = fs.readFileSync(getAssetPath('pie.js.template')).toString();
                pieContent = pieContent
                    .replace('{{namespace}}', pro.namespace)
                    .replace('{{id}}', pro.id)
                    .replace('{{name}}', pro.name);
                fs.writeFileSync(path.join(pro.path, 'index.js'), pieContent);
                // 调用npm初始化
                execSync(`cd ${pro.path} && npm install`);

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
    .option('-d, --db-file <path>', 'miraipie的数据库文件路径', 'miraipie.db')
    .description('从远程或本地添加pie')
    .action((fullId: string) => {

    });

program
    .command('delete <full_id>')
    .aliases(['remove', 'rm', 'd'])
    .option('-d, --db-file <path>', 'miraipie的数据库文件路径', 'miraipie.db')
    .option('-f, --hard', '是否同时删除本地文件')
    .description('删除已添加的pie')
    .action((fullId: string) => {
        useDatabase(program.opts().dbFile).then((db) => {
            const record = db.getPieRecord(fullId);
            if (record) {
                if (program.opts().hard && fs.existsSync(record.path)) {
                    const stat = fs.statSync(record.path);
                    if (stat.isDirectory()) fs.rmdirSync(record.path);
                    else fs.unlinkSync(record.path);
                }
                db.deletePie(fullId);
                logger.info(`已删除pie '${fullId}'`);
            } else {
                logger.warn(`未找到pie '${fullId}'`)
            }
            db.close();
        });
    });

program
    .command('clear-history [days]')
    .aliases(['ch', 'clear'])
    .option('-d, --db-file <path>', 'miraipie的数据库文件路径', 'miraipie.db')
    .description('删除数据库中消息和事件历史')
    .action((daysString: string) => {
        useDatabase(program.opts().dbFile).then((db) => {
            const candidate = parseInt(daysString);
            const days = candidate > 0 ? candidate : 30;
            prompt({
                type: 'confirm',
                name: 'confirm',
                message: `是否删除${days}天前的历史消息和事件记录?`
            }).then((pro: any) => {
                if (pro.confirm) {
                    const messageCount = db.clearMessageHistory(days);
                    const eventCount = db.clearEventHistory(days);
                    logger.info(`已删除${days}天前的 ${messageCount} 条消息记录, ${eventCount} 条事件记录`);
                }
                db.close();
            }).catch(() => {
                db.close();
            });
        });
    });

program
    .command('set-repo <url>')
    .alias('set-repository')
    .description('设置pie仓库源')
    .action((url: string) => {

    });

program.parse(process.argv);
