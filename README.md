# miraipie

一个基于 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 TypeScript/JavaScript 机器人开发工具包。

## 开始使用

### 准备工作

- 安装 [mirai-console](https://github.com/mamoe/mirai-console) 并启用 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 插件。 推荐使用 [mirai-console-loader](https://github.com/iTXTech/mirai-console-loader) 一键启动 mirai-console 并加载插件。
- 填写 mirai-api-http 插件配置文件，并保证至少启用了 [http adapter](https://github.com/project-mirai/mirai-api-http#adapter) 。
- 在 mirai-console 中登录自己的机器人账号。

### 安装 `miraipie`

通过 npm 安装：

```shell
> npm install miraipie -g
```

通过 git 安装：

```shell
> git clone https://github.com/nepsyn/miraipie.git
> cd miraipie
> npm install . -g
```

### 启动 `miraipie` 应用程序

对于一般用户，建议使用 `miraipie` 提供的 cli 工具直接启动应用程序：

```shell
# 查看命令帮助
> miraipie -h
# 启动 miraipie 机器人
> miraipie start
```

对于编程式的用户，建议参阅 demo 文件夹中的 [tart-miraipie.js](demo/start-miraipie.js) 文件查看基础用法。

## 编写 pie( `miraipie` 中的独立插件)

> 参阅 demo 文件夹中的 [repeater-pie.js](demo/repeater-pie.js) 文件查看最基础的 pie 结构。

### 新建 pie 项目

通过 cli 工具快速新建一个 pie 项目：

```shell
# 使用命令新建 pie 项目
> miraipie create miraipie:repeater
√ 请输入namespace » miraipie
√ 请输入id » repeater
√ 请输入名称 » repeater
√ 请输入存放位置 » pies/repeater/
[2021-08-11T23:21:13.295] [INFO] console - 创建pie项目完成
```

### 编写指南

TODO

### 引入 pie

使用 cli 工具快速导入编写完成的 pie 模块：

```shell
# 使用命令导入 pie
> miraipie add pies/repeater
```

# 更新日志

> 参见 [CHANGELOG.md](CHANGELOG.md) 查看完整的更新日志。

### V1.0.0

- 完成 `miraipie` 核心逻辑。

# 许可

本项目遵循 AGPL-3.0 许可协议，详见 [LICENSE](LICENSE) 文件。
