import {execSync} from 'child_process';
import {program} from 'commander';
import {prompt} from 'enquirer';
import fs from 'fs';
import log4js from 'log4js';
import path from 'path';
import {ChatMessage, Event, Friend, GroupMember, MiraiApiHttpAdapterMap} from '../mirai';
import {createMiraiPieApp, DatabaseAdapter, PieInstance, Sqlite3Adapter} from '../pie';
import {getAssetPath} from '../tool';

const logger = log4js.getLogger('console');

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'info'
        },
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

function writeConfig(userConfigMeta): Promise<any> {
    const configProps = Object.keys(userConfigMeta);
    const queries = configProps.map((prop) => {
        const meta = userConfigMeta[prop];
        const type = typeof meta.type();
        return {
            type: type === 'number' ? 'numeral' : type === 'boolean' ? 'confirm' : 'input',
            name: prop,
            message: `请输入配置项 - ${prop}` + (meta.description ? `(${meta.description})` : ''),
            initial: meta.default
        };
    });
    return new Promise((resolve, reject) => {
        prompt(queries).then((pro) => {
            for (const prop of configProps) {
                try {
                    pro[prop] = userConfigMeta[prop].type(pro[prop]);
                } catch (err) {
                    pro[prop] = null;
                    logger.error(`配置项 '${prop}' 初始化出错:`, err.message);
                }
            }
            resolve(pro);
        }).catch(() => {
            reject();
        });
    });
}

function addLocalPie(p: string, db: DatabaseAdapter) {
    try {
        const pie: PieInstance = require(p);
        // 数据库检索是否已经存在
        const record = db.getPieRecordByFullId(pie.fullId);
        if (record) {
            // 若数据库中版本较旧则更新数据库中模块地址
            if (pie.version > record.version) {
                db.saveOrUpdatePieRecord({...record, path: p});
            } else {
                logger.info(`指定pie '${pie.fullId}' 已存在于数据库中`);
            }
        } else {
            writeConfig(pie.userConfigMeta).then((pro) => {
                // 数据库中添加记录
                db.saveOrUpdatePieRecord({
                    fullId: pie.fullId,
                    version: pie.version,
                    enabled: true,
                    path: p,
                    configs: pro
                });
                logger.info(`成功添加pie '${pie.fullId}'`);
            }).catch(() => {
                logger.info(`已取消添加pie '${pie.fullId}'`);
            });
        }
    } catch (err) {
        logger.error(`添加pie模块 ${p} 失败:`, err.message);
    }
}

function logMessage(chatMessage: ChatMessage) {
    if (chatMessage.type === 'FriendMessage') {
        const sender = chatMessage.sender as Friend;
        logger.info(`${sender.nickname}(${sender.id}) -> ${chatMessage.messageChain.toDisplayString()}`);
    } else if (chatMessage.type === 'GroupMessage') {
        const sender = chatMessage.sender as GroupMember;
        logger.info(`[${sender.group.name}(${sender.group.id})] ${sender.memberName}(${sender.id}) -> ${chatMessage.messageChain.toDisplayString()}`);
    } else if (chatMessage.type === 'TempMessage') {
        const sender = chatMessage.sender as GroupMember;
        logger.info(`${sender.memberName}(${sender.id}) -> ${chatMessage.messageChain.toDisplayString()}`);
    }
}

function logEvent(event: Event) {
    logger.info(`${event.type}: ${JSON.stringify(event)}`);
}

program
    .version(`miraipie ${require('../../package.json').version}`, '-V, --version', '显示版本信息')
    .option('-d, --db-file <path>', 'miraipie的数据库文件路径', 'miraipie.db')
    .helpOption('-h, --help', '显示帮助信息')
    .addHelpCommand('help [command]', '显示命令帮助');

program
    .command('start')
    .description('启动miraipie应用程序')
    .option('-r, --renew', '重新填写miraipie应用配置')
    .option('-p, --pies <paths...>', 'miraipie需要额外加载的pie的模块路径')
    .option('-v, --verbose', '控制台打印miraipie接收到的消息和事件')
    .action(async (opts) => {
        log4js.configure({
            appenders: {
                console: {
                    type: 'console'
                },
                file: {
                    type: 'dateFile',
                    filename: 'log/miraipie.log',
                }
            },
            categories: {
                default: {
                    appenders: ['console', 'file'],
                    level: 'debug'
                }
            }
        });

        const db = fs.existsSync(program.opts().dbFile) ? new Sqlite3Adapter(program.opts().dbFile) : Sqlite3Adapter.create(program.opts().dbFile);
        if (db.open && fs.statSync(program.opts().dbFile).size / (2 ** 30) > 1) {
            logger.warn('数据库文件大小已超过1GB, 建议使用命令 `miraipie clear-history` 清除历史消息记录');
        }

        const options = db.loadAppOptions();
        for (const p of opts.pies || []) {
            addLocalPie(path.isAbsolute(p) ? p : path.join(process.cwd(), p), db);
        }
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
                    message: '请输入mirai-api-http服务的QQ号'
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
                    message: '请输入mirai-api-http配置项中的verifyKey'
                }
            ]).then(async (pro: any) => {
                const app = createMiraiPieApp({
                    qq: pro.qq,
                    adapter: pro.adapter,
                    listenerAdapter: pro.listenerAdapter,
                    adapterSetting: {
                        verifyKey: pro.verifyKey,
                        host: pro.host,
                        port: parseInt(pro.port)
                    },
                    db
                });
                if (opts.verbose) {
                    app.onMessage(logMessage);
                    app.onEvent(logEvent);
                }
                await app.listen();
            }).catch(() => {
                logger.info('已取消初始化miraipie');
            });
        } else {
            const app = createMiraiPieApp({...options, db});
            if (opts.verbose) {
                app.onMessage(logMessage);
                app.onEvent(logEvent);
            }
            await app.listen();
        }
    });

program
    .command('create [full_id] [dest]')
    .aliases(['new', 'init', 'c'])
    .description('使用模板创建新的pie项目')
    .action((fullId: string, dest: string) => {
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
                initial: dest || `pies/${id || 'pie'}/`
            }
        ]).then(async (pro: any) => {
            try {
                // 创建文件夹
                if (!fs.existsSync(pro.path)) {
                    fs.mkdirSync(pro.path, {recursive: true});
                } else {
                    const proConfirm: any = await prompt({
                        type: 'confirm',
                        name: 'confirm',
                        message: `指定目录 ${pro.path} 已存在, 是否覆盖文件夹?`,
                    });
                    if (!proConfirm.confirm) {
                        logger.info('已取消创建项目操作');
                        return;
                    }
                }
                // 创建package.json
                let packageContent = fs.readFileSync(getAssetPath('package.json')).toString();
                packageContent = packageContent.replace('{{name}}', pro.name);
                fs.writeFileSync(path.join(pro.path, 'package.json'), packageContent);
                // 创建pie文件
                let pieContent = fs.readFileSync(getAssetPath('pie.js')).toString();
                pieContent = pieContent
                    .replace('{{namespace}}', pro.namespace)
                    .replace('{{id}}', pro.id)
                    .replace('{{name}}', pro.name);
                fs.writeFileSync(path.join(pro.path, 'index.js'), pieContent);
                // 调用npm初始化
                execSync(`cd ${pro.path} && npm install`);

                logger.info('创建pie项目完成');
            } catch (err) {
                logger.error('创建pie项目失败, 错误:', err.message);
            }
        }).catch(() => {
            logger.info('已取消创建pie项目');
        });
    });

program
    .command('add <path>')
    .aliases(['get', 'a'])
    .description('从远程或本地添加pie(远程仓库将使用git克隆)')
    .action((p: string) => {
        useDatabase(program.opts().dbFile).then((db) => {
            const absPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
            if (fs.existsSync(absPath)) {  // 路径本地存在
                addLocalPie(absPath, db);
            } else {  // 本地不存在
                prompt({
                    type: 'input',
                    name: 'dest',
                    message: '未找到本地模块, 尝试使用git克隆远程仓库到目标文件夹(Ctrl-C取消)',
                    initial: path.basename(p).split('.')[0]
                }).then((pro: any) => {
                    try {
                        execSync(`git clone ${p} ${pro.dest} && cd ${pro.dest} && npm install`);
                        addLocalPie(path.isAbsolute(pro.dest) ? pro.dest : path.join(process.cwd(), pro.dest), db);
                    } catch (err) {
                        logger.error('调用git clone远程仓库出错:', err.message);
                    }
                }).catch(() => {
                    logger.info('已取消克隆远程仓库');
                });
            }
        });
    });

program
    .command('list-pies')
    .aliases(['ls', 'list'])
    .option('-e, --list-enabled', '只显示已启用的pie')
    .description('显示已添加的pie列表')
    .action((opts) => {
        useDatabase(program.opts().dbFile).then((db) => {
            const records = opts.listEnabled ? db.getPieRecords().filter((record) => record.enabled) : db.getPieRecords();
            if (records.length > 0) {
                const header = `${'full_id'.padEnd(32)}${'version'.padEnd(12)}${'enabled'.padEnd(10)}path\n` +
                    `${'-'.repeat(7).padEnd(32)}${'-'.repeat(7).padEnd(12)}${'-'.repeat(7).padEnd(10)}${'-'.repeat(4)}\n`;
                const content = records.map((record) => {
                    return `${record.fullId.padEnd(32)}${record.version.padEnd(12)}${record.enabled.toString().padEnd(10)}${record.path}`;
                }).join('\n');
                logger.info(`当前数据库中pie列表:\n${header}${content}`);
            } else {
                logger.info(`当前数据库中无已添加${opts.listEnabled ? '且启用' : ''}的pie信息`);
            }
        });
    });

program
    .command('enable <full_id>')
    .description('启用已添加的pie')
    .action((fullId: string) => {
        useDatabase(program.opts().dbFile).then((db) => {
            const record = db.getPieRecordByFullId(fullId);
            if (record) {
                db.saveOrUpdatePieRecord({...record, enabled: true});
                logger.info(`已启用 '${fullId}'`);
            } else {
                logger.error(`数据库中没有pie '${fullId}'`)
            }
        });
    });

program
    .command('disable <full_id>')
    .description('禁用已添加的pie')
    .action((fullId: string) => {
        useDatabase(program.opts().dbFile).then((db) => {
            const record = db.getPieRecordByFullId(fullId);
            if (record) {
                db.saveOrUpdatePieRecord({...record, enabled: false});
                logger.info(`已禁用 '${fullId}'`);
            } else {
                logger.error(`数据库中没有pie '${fullId}'`)
            }
        });
    });

program
    .command('delete <full_id>')
    .aliases(['remove', 'rm', 'd'])
    .option('-f, --hard', '是否同时删除本地文件')
    .description('删除已添加的pie')
    .action((fullId: string, opts) => {
        useDatabase(program.opts().dbFile).then((db) => {
            const record = db.getPieRecordByFullId(fullId);
            if (record) {
                if (opts.hard && fs.existsSync(record.path)) {
                    fs.rmSync(record.path, {recursive: true, force: true});
                }
                db.deletePieRecord(fullId);
                logger.info(`已删除pie '${fullId}'`);
            } else {
                logger.error(`数据库中没有pie '${fullId}'`)
            }
        });
    });

program
    .command('clear-history [days]')
    .aliases(['ch', 'clear'])
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
            }).catch(() => {
            });
        });
    });

program.parse(process.argv);
