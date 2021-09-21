# 启动应用

## CLI 快速启动

miraipie 提供的 CLI 工具可以快速启动 miraipie 应用程序，你只需要几个简单的步骤即可运行 miraipie。 在阅读下面的步骤之前，请确保已通过 NPM 全局安装
miraipie。如果没有，请先完成[全局安装 miraipie](installation.html#命令行工具-cli)。

首先为你的机器人应用程序创建一个文件夹：

```shell
mkdir miraipie-bot
cd miraipie-bot
```

其次通过命令直接启动一个机器人应用程序，首次启动时会询问部分配置：

```shell
miraipie start
```

当然你也可以直接编写 miraipie 的配置文件。 miraipie 在启动时默认使用当前目录下 miraipie.json 文件作为应用程序配置。 你也可以通过命令参数 `--config <path>`
来手动指定配置文件路径，miraipie 当前只支持 json 格式的配置文件。

```shell
# 手动编写配置
vi miraipie.json
```

一个基础的配置文件内容如下：

```json
{
  "qq": 10000000,
  "adapterInUse": "ws",
  "logDirectory": "log",
  "logLevel": "debug",
  "verbose": false,
  "adapters": {
    "ws": {
      "configs": {
        "verifyKey": "my verify key",
        "host": "127.0.0.1",
        "port": 23333
      }
    }
  },
  "pies": {},
  "extensions": []
}
```

## 通过代码启动

如果你需要通过代码手动启动 miraipie，这也很简单。你可以直接参考 Github 仓库中提供的 [demo](https://github.com/nepsyn/miraipie/tree/master/demo)。
本节文档会提供更详细的教程，在此之前，首先确保你已经成功[安装或引入 miraipie](installation.html)。

### Node.js 开发者

你需要新建一个项目并添加 miraipie 作为依赖：

```shell
mkdir miraipie-bot
cd miraipie-bot
npm init
npm i miraipie
```

新建一个 js 脚本文件 bot.js，并添加以下内容：

```javascript
const {createApp, makeAppConfig} = require('miraipie');
const app = createApp(makeAppConfig({
    qq: 100000000,                          // 这里修改为机器人服务的QQ号
    adapterInUse: 'http',
    verbose: true,
    adapters: {
        http: {
            configs: {
                verifyKey: 'my verify key',  // 这里修改为 mirai-api-http 的配置项 verifyKey
                host: '127.0.0.1',           // 这里修改为 mirai-api-http 服务主机地址
                port: 22333                  // 这里修改为 mirai-api-http 服务端口号
            }
        }
    }
}));

app.listen();
```

使用 Node 运行该脚本文件：

```shell
node bot.js
```

### web 开发者

web 开发者使用 miraipie 更为简单，只需要在页面中引入 miraipie 并添加如下代码：

```html

<script>
  const app = Miraipie.createApp(Miraipie.makeAppConfig({
    qq: 100000000,                          // 这里修改为机器人服务的QQ号
    adapterInUse: 'ws',
    verbose: true,
    adapters: {
      ws: {
        configs: {
          verifyKey: 'my verify key',  // 这里修改为 mirai-api-http 的配置项 verifyKey
          host: '127.0.0.1',           // 这里修改为 mirai-api-http 服务主机地址
          port: 22333                  // 这里修改为 mirai-api-http 服务端口号
        }
      }
    }
  }));

  app.listen();
</script>
```

> 细心的读者可能已经发现了，为什么在 Node.js 环境下配置中的 `adapter` 字段是 `"http"` ，而浏览器环境下是 `"ws"` 呢？
> 这是因为在浏览器条件下，浏览器会根据 [同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy) 禁止非同源的 http 请求，使用 WebSocket 作为通信方式会避免遇到麻烦的跨域问题。
> 当然，如果读者的各项配置正确，也是可以使用 http adapter 作为通信方式的。
