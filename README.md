# miraipie

一个基于 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 TypeScript/JavaScript 机器人开发工具包。

## 开始使用

### 准备工作

- 安装 [mirai-console](https://github.com/mamoe/mirai-console)
  并启用 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 插件。
  推荐使用 [mirai-console-loader](https://github.com/iTXTech/mirai-console-loader) 一键启动 mirai-console 并加载插件。
- 填写 mirai-api-http 插件配置文件, 并保证至少启用了 [http adapter](https://github.com/project-mirai/mirai-api-http#adapter) 。
- 在 mirai-console 中登录自己的机器人账号。

### 安装 `miraipie`

通过 npm 安装：

```shell
> npm install miraipie -g
```

通过 git 安装：

```shell
# 克隆本项目
> git clone https://github.com/nepsyn/miraipie.git
# 进入目标文件夹
> cd miraipie
# 安装项目依赖
> npm install
# 编译本项目
> npm run build
# 安装到全局
> npm install . -g
```

### 启动 `miraipie` 应用程序

对于一般用户, 建议使用 `miraipie` 提供的 cli 工具直接启动应用程序：

```shell
# 查看命令帮助
> miraipie -h
# 启动 miraipie 机器人
> miraipie start
```

对于编程式的用户, 建议参阅 demo 文件夹中的 [tart-miraipie.js](demo/start-miraipie.js) 文件查看基础用法。

## 编写 pie( `miraipie` 中的独立插件)

> 参阅 demo 文件夹中的 [repeater-pie.js](demo/repeater-pie.js) 文件查看最基础的 pie 结构。

### 新建 pie 项目

通过 cli 工具快速新建一个 pie 项目：

```shell
# 使用命令新建 pie 项目
> miraipie pie create
√ 请输入pie项目存放位置 · pies/repeater/
[2021-08-11T23:21:13.295] [INFO] cli - 已使用模板创建pie项目
```

### 编写指南

TODO

### 引入 pie

使用 cli 工具快速导入编写完成的 pie 模块：

```shell
# 使用命令导入 pie
> miraipie install pies/repeater
```

# 更新日志

> 参见 [CHANGELOG.md](CHANGELOG.md) 查看完整的更新日志。

## v1.1.8

- 修复 日志系统事件问题。


# 许可

本项目遵循 AGPL-3.0 许可协议, 详见 [LICENSE](LICENSE) 文件。
