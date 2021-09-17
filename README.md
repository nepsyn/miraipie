# miraipie

一个基于 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 TypeScript/JavaScript QQ 机器人开发工具包。

## 开始使用

### 准备工作

- 安装 [mirai-console](https://github.com/mamoe/mirai-console)
  并启用 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 插件。
  推荐使用 [mirai-console-loader](https://github.com/iTXTech/mirai-console-loader) 一键启动 mirai-console 并加载插件。
- 填写 mirai-api-http 插件配置文件, 并保证至少启用了 [http adapter](https://github.com/project-mirai/mirai-api-http#adapter) 。
- 在 mirai-console 中登录自己的机器人账号。

### 安装 `miraipie`

#### NPM

对于 Node.js 开发者， 直接使用 NPM 安装 miraipie 作为项目依赖：

```shell
npm i miraipie
```

#### 命令行工具（CLI）

miraipie 提供了一个开箱即用的命令行工具， 用于快速启动应用程序或生成插件模板等操作， 要使用 CLI 工具， 需要先全局安装 miraipie ：

```shell
npm i -g miraipie
```

安装完成后即可直接使用 `miraipie` 命令：

```shell
miraipie --help
```

#### 自行构建

NPM 安装的 miraipie 不一定是当前的最新版本， 如果需要即时使用 miraipie 的最新版本， 推荐自行构建：

```shell
# 克隆 miraipie 仓库
git clone https://github.com/nepsyn/miraipie.git
cd miraipie
# 安装依赖项
npm install
# 运行构建
npm run build
```

### 启动 `miraipie` 应用程序

对于一般 NodeJs 用户, 建议使用 `miraipie` 提供的 cli 工具直接启动应用程序：

```shell
# 查看命令帮助
> miraipie -h
# 启动 miraipie 机器人
> miraipie start
```

对于编程式的用户, 建议参阅 demo 文件夹中的 [start-miraipie.js](demo/start-miraipie.js) 文件查看基础用法。
对于 web 开发的用户, 建议参阅 demo 文件夹中的 [start-miraipie.html](demo/start-miraipie.html) 文件查看基础用法。

## 文档

访问 [miraipie 文档](https://nepsyn.github.io/miraipie/) 查看完整的 miraipie 文档。

# 更新日志

> 参见 [CHANGELOG.md](CHANGELOG.md) 查看完整的更新日志。

# 许可

本项目遵循 AGPL-3.0 许可协议, 详见 [LICENSE](LICENSE) 文件。
