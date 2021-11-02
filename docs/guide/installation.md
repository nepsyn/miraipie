# 安装

#### 浏览器兼容性

miraipie **不支持** IE8 及以下版本。理论上支持 ECMAScript 5 语法的浏览器都可以正常运行 miraipie 。

#### 更新日志

<p class="version-text">最新稳定版本： <img alt="version tag" src="https://img.shields.io/npm/v/miraipie" ></p>

详细的更新日志见 [Github](https://github.com/nepsyn/miraipie/blob/master/CHANGELOG.md)

## 使用 script 标签引入

直接使用 `<script>` 标签引入， `Miraipie` 会注册为一个全局变量。

```html
<!-- 通过 UNPKG 引入 -->
<script src="//unpkg.com/miraipie@latest/dist/miraipie.bundle.js"></script>

<!-- 通过 jsdelivr 引入 -->
<script src="//cdn.jsdelivr.net/npm/miraipie@latest/dist/miraipie.bundle.js"></script>
```

## NPM

对于 Node.js 开发者， 直接使用 NPM 安装 miraipie 作为项目依赖：

```shell
npm i miraipie
```

## 命令行工具（CLI）

miraipie 提供了一个开箱即用的命令行工具， 用于快速启动应用程序或生成插件模板等操作， 要使用 CLI 工具， 需要先全局安装 miraipie ：

```shell
npm i -g miraipie
```

安装完成后即可直接使用 `miraipie` 命令：

```shell
miraipie --help
```

## 自行构建

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

生成的 Node.js 端文件位于 lib/miraipie.js ， 浏览器端文件位于 dist/miraipie.bundle.js 。
