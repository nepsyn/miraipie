import {execSync} from 'child_process';
import {program} from 'commander';
import {prompt} from 'enquirer';
import EventEmitter from 'events';
import fs from 'fs-extra';
import log4js from 'log4js';
import path from 'path';
import MixedApiAdapter from './builtin/MixedApiAdapter';
import {ApplicationConfig, ConfigMeta} from './config';
import createApp, {MiraiApiHttpAdapter, Pie} from './miraipie';
import {makeTemplate} from './utils';

log4js.configure({
    appenders: {
        console: {type: 'console'}
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'info'
        }
    }
});
const logger = log4js.getLogger('cli');
const banner = `
 __    __     __     ______     ______     __     ______   __     ______    
/\\ "-./  \\   /\\ \\   /\\  == \\   /\\  __ \\   /\\ \\   /\\  == \\ /\\ \\   /\\  ___\\   
\\ \\ \\-./\\ \\  \\ \\ \\  \\ \\  __<   \\ \\  __ \\  \\ \\ \\  \\ \\  _-/ \\ \\ \\  \\ \\  __\\   
 \\ \\_\\ \\ \\_\\  \\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\  \\ \\_\\    \\ \\_\\  \\ \\_____\\ 
  \\/_/  \\/_/   \\/_/   \\/_/ /_/   \\/_/\\/_/   \\/_/   \\/_/     \\/_/   \\/_____/ 
`;

// 提供虚拟环境
function MiraiPieApplicationMock() {
    return Object.assign(new EventEmitter(), {
        config: {},
        extensions: [],
        install(extension: MiraiApiHttpAdapter | Pie) {
            this.extensions.push(extension);
        },
        adapter(adapter: MiraiApiHttpAdapter) {
            this.extensions.push(adapter);
        },
        pie(pie: Pie) {
            this.extensions.push(pie);
        },
        useAdapter: () => undefined,
        uninstallAdapter: () => undefined,
        enable: () => undefined,
        disable: () => undefined,
        uninstallPie: () => undefined,
        listen: () => undefined,
        stop: () => undefined
    });
}

// 填写用户配置
async function writeUserConfig(configMeta: ConfigMeta) {
    const unsupportedConfig = {};
    const questions = Object.keys(configMeta).map((name) => {
        const meta = configMeta[name];
        const question = {
            type: null,
            name,
            message: `请输入配置项 - ${name}` + (meta.description ? `(${meta.description})` : ''),
            initial: typeof meta.default === 'function' ? meta.default() : null
        };
        const type = typeof meta.type();
        if (type === 'number') question.type = 'numeral';
        else if (type === 'boolean') question.type = 'confirm';
        else if (type === 'string') question.type = 'input';
        else {
            logger.warn(`暂不支持CLI填写的配置项: ${name} 类型: ${type} , 请手动填写配置文件`);
            unsupportedConfig[name] = typeof meta.default === 'function' ? meta.default() : null
        }
        return question.type ? question : null;
    }).filter((question) => !!question);
    try {
        return Object.assign(await prompt(questions), unsupportedConfig);
    } catch (e) {
        return {};
    }
}

// 加载配置文件
async function useConfigFile(path: string): Promise<ApplicationConfig> {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(path)) {
            prompt({
                type: 'confirm',
                name: 'new',
                message: '没有检测到配置文件, 是否新建配置文件?',
                initial: true
            }).then((confirm: any) => {
                if (confirm.new) {
                    prompt([
                        {
                            type: 'numeral',
                            name: 'qq',
                            message: '请输入机器人服务的QQ号'
                        },
                        {
                            type: 'select',
                            name: 'adapter',
                            message: '请选择默认服务客户端adapter',
                            choices: ['mixed', 'http', 'ws'],
                            initial: 0
                        }
                    ]).then(async (pro: any) => {
                        const configMeta = Object.assign({}, MixedApiAdapter.configMeta);
                        delete configMeta['qq'];
                        const adapterConfigs = await writeUserConfig(configMeta);
                        const config = ApplicationConfig.make({qq: pro.qq, adapterInUse: pro.adapter});
                        config.adapters[pro.adapter] = {configs: adapterConfigs};
                        saveConfigFile(config, path);
                        resolve(config);
                    }).catch(reject);
                } else reject();
            }).catch(reject);
        } else {
            fs.readJson(path).then((content) => {
                resolve(ApplicationConfig.make(content));
            }).catch(reject);
        }
    });
}

// 保存配置文件
function saveConfigFile(config: ApplicationConfig, path: string) {
    fs.writeJsonSync(path, config, {
        spaces: 4
    });
}

// miraipie
program
    .version(`miraipie ${require('../package.json').version}`, '-V, --version', '显示版本信息')
    .option('-c, --config <path>', 'miraipie的配置文件路径', 'miraipie.json')
    .helpOption('-h, --help', '显示帮助信息')
    .addHelpCommand('help [command]', '显示命令帮助');

// miraipie start
program
    .command('start')
    .description('启动miraipie应用程序')
    .option('-m, --modules <paths...>', 'miraipie需要额外加载的模块路径')
    .option('-l, --log-level <level>', 'miraipie日志输出级别')
    .option('-v, --verbose', '控制台打印miraipie接收到的消息和事件')
    .action((opts) => {
        useConfigFile(program.opts().config).then(async (config) => {
            if (opts.logLevel) config.logLevel = opts.logLevel;
            if (opts.modules) config.extensions = [...config.extensions, ...opts.modules];
            if (opts.verbose) config.verbose = true;
            const app = createApp(config);
            app.once('listen', () => {
                logger.info('miraipie应用程序已成功启动!\n' + banner);
            });
            await app.listen();
        }).catch((err) => {
            logger.error('启动应用程序失败:', err);
        });
    });

// miraipie install
program
    .command('install')
    .description('添加本地模块(客户端adapter或pie)')
    .argument('module', '待安装的本地模块路径')
    .aliases(['i', 'add'])
    .action((module) => {
        useConfigFile(program.opts().config).then((config) => {
            const mockApp = MiraiPieApplicationMock();
            try {
                require(path.join(process.cwd(), module))(mockApp);
                for (const extension of mockApp.extensions) {
                    if ((extension.__isPie || extension.__isApiAdapter) && extension.id) {
                        writeUserConfig(extension.configMeta || {}).then((userConfigs) => {
                            if (extension.__isPie) {
                                config.pies[extension.id] = {
                                    module,
                                    enabled: true,
                                    configs: userConfigs
                                };
                                logger.info(`已添加pie '${extension.id}'`);
                            } else if (extension.__isApiAdapter) {
                                config.adapters[extension.id] = {
                                    module,
                                    configs: userConfigs
                                };
                                logger.info(`已添加adapter '${extension.id}'`);
                            }
                            saveConfigFile(config, program.opts().config);
                        });
                    } else {
                        config.extensions.push(module);
                        logger.info(`已添加模块 ${module}`);
                        saveConfigFile(config, program.opts().config);
                    }
                }
            } catch (err) {
                logger.error('添加模块失败:', err);
            }
        }).catch(() => {
            logger.error('没有找到miraipie配置文件');
        });
    });

// miraipie pie
const pie = program
    .command('pie [command]')
    .description('miraipie关于pie相关选项')

// miraipie pie create
pie
    .command('create')
    .description('使用模板创建pie项目')
    .aliases(['new', 'init'])
    .argument('[id]', 'pie id')
    .option('-j, --javascript', '使用javascript模板')
    .action((id, opts) => {
        prompt([
            {
                type: 'input',
                name: 'id',
                message: '请输入pie id',
                initial: id || 'my-pie'
            },
            {
                type: 'input',
                name: 'name',
                message: '请输入pie名称',
                initial: id || 'my-pie'
            },
            {
                type: 'input',
                name: 'path',
                message: '请输入pie存放位置',
                initial: `pies/${id || 'my-pie'}/`
            }
        ]).then((pro: any) => {
            const src = path.join(__dirname, opts.javascript ? '../template/pie-js' : '../template/pie-ts');
            fs.ensureDirSync(pro.path);
            fs.readdir(src, (err, files) => {
                if (err) {
                    logger.error('创建pie项目失败:', err);
                    return;
                }
                for (const file of files) makeTemplate(path.resolve(src, file), path.resolve(pro.path, file), pro);
            });
            logger.info('已使用模板创建pie项目');
            prompt({
                type: 'confirm',
                name: 'init',
                message: '是否使用npm初始化pie项目',
                initial: true
            }).then((proConfirm: any) => {
                if (proConfirm.init) execSync(`cd "${pro.path}" && npm install`);
            }).catch(() => undefined);
        }).catch(() => {
            logger.info('已取消创建项目');
        });
    });

// miraipie pie list
pie
    .command('list')
    .description('显示已安装pie的列表')
    .option('-e, --enabled', '只显示已启用的pie')
    .action((opts) => {
        useConfigFile(program.opts().config).then((config) => {
            const pies = config.pies;
            if (opts.enabled) {
                for (const id in pies) {
                    if (!pies[id].enabled) delete pies[id];
                }
            }
            if (Object.keys(pies).length === 0) {
                logger.info('当前没有已添加的pie');
                return;
            }
            const header = `${'id'.padEnd(32)}${'enabled'.padEnd(12)}path\n` +
                `${'-'.repeat(2).padEnd(32)}${'-'.repeat(7).padEnd(12)}${'-'.repeat(4)}`;
            const content = Object.keys(pies).map((id) => {
                return `${id.padEnd(32)}${pies[id].enabled.toString().padEnd(12)}${pies[id].module.toString()}`
            }).join('\n');
            logger.info(`当前加载的pie列表:\n${header}\n${content}`);
        }).catch(() => {
            logger.error('没有找到miraipie配置文件');
        });
    });

// miraipie pie enable
pie
    .command('enable')
    .description('启用已添加的pie')
    .argument('id', 'pie id')
    .action((id) => {
        useConfigFile(program.opts().config).then((config) => {
            if (id in config.pies) {
                config.pies[id].enabled = true;
                logger.info(`已启用pie '${id}'`);
                saveConfigFile(config, program.opts().config);
            } else {
                logger.error(`配置文件中不存在pie '${id}'`)
            }
        }).catch(() => {
            logger.error('没有找到miraipie配置文件');
        });
    });

// miraipie pie disable
pie
    .command('disable')
    .description('禁用已添加的pie')
    .argument('id', 'pie id')
    .action((id) => {
        useConfigFile(program.opts().config).then((config) => {
            if (id in config.pies) {
                config.pies[id].enabled = false;
                logger.info(`已禁用pie '${id}'`);
                saveConfigFile(config, program.opts().config);
            } else {
                logger.error(`配置文件中不存在pie '${id}'`)
            }
        }).catch(() => {
            logger.error('没有找到miraipie配置文件');
        });
    });

// miraipie pie delete
pie
    .command('delete')
    .description('移除已添加的pie')
    .alias('remove')
    .argument('id', 'pie id')
    .action((id) => {
        useConfigFile(program.opts().config).then((config) => {
            if (id in config.pies) {
                delete config.pies[id];
                logger.info(`已移除pie '${id}'`);
                saveConfigFile(config, program.opts().config);
            } else {
                logger.error(`配置文件中不存在pie '${id}'`)
            }
        }).catch(() => {
            logger.error('没有找到miraipie配置文件');
        });
    });

program.parse(process.argv);
