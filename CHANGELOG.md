# Changelog

## v1.2.9

- 添加 支持其他客户端的同步消息 `SyncMessage` 及 miraipie 的事件监听。
- 添加 支持商店标签 `MarketFace` 。
- 添加 新增公告相关接口 `getGroupAnnouncements` ， `postGroupAnnouncement` ， `deleteGroupAnnouncement` 。
- 添加 查询用户资料接口 `getUserProfile` 。
- 修复 群成员信息接口 #1

## v1.2.8

- 添加 创建应用时添加参数 `loggerOptions` 用于自定义 log4js 配置。
- 适配 mirai-api-http v2.4.0。

## v1.2.7

- 修复 `getMemberProfile` 参数提示错误的问题。
- 优化 部分类型注释。
- 添加 `regitserCommand` 和 `executeCommand` 方法用于 mirai-console 交互。

## v1.2.6

- 优化 部分编辑器类型补全提示。

## v1.2.5

- 优化 部分类型注释。

## v1.2.4

- 适配 mirai-api-http v2.3.3。
- 优化 机器人事件监听器类型。

## v1.2.3

- 添加 表情枚举类型 `FaceType` 。
- 添加 浏览器端日志 logger 可自定义。

## v1.2.2

- 修复 合并转发消息类型字段类型错误。
- 优化 部分消息链方法。

## v1.2.1

- 添加 内置 adapter 添加 ssl 选项支持。

## v1.2.0

- 添加 对浏览器的支持, 可以用于 web 项目的开发。
- 修复 `makePie` 和 `makeApiAdapter` 属性缺失问题。

## v1.1.15

- 适配 mirai-api-http v2.3.1。
- 添加 `Chat` 模块新增 `findGroup` 和 `findFriend` 方法用于构造聊天窗口。
- 优化 内置 `adapter` 错误提示。

## v1.1.14

- 适配 mirai-api-http v2.3.0。
- 优化 `Chat` 模块的部分方法。
- 添加 CLI启动应用程序时检查当前 miraipie 版本。

## v1.1.13

- 修复 `MessageChain` 构造问题。

## v1.1.12

- 修复 应用程序插件上下文不一致问题。

## v1.1.11

- 修复 日志系统事件问题。

## v1.1.10

- 添加 等待下一条消息方法 `Chat.nextMessage(timeout: number)` 。
- 优化 `pie` 和 `adapter` 生命周期钩子 `installed` 的执行时间。
- 优化 CLI新建 `pie` 项目操作。

## v1.1.9

- 优化 CLI配置填写提示。

## v1.1.8

- 修复 日志系统事件问题。

## v1.1.7

- 修复 CLI加载拓展问题。

## v1.1.6

- 修复 `MessageChain` 构造后内部消息属性丢失问题。

## v1.1.5

- 优化 CLI添加拓展逻辑。
- 优化 CLI配置填写提示。
- 添加 `SingleMessage` 添加方法 `isType` 用于特定情况的类型保护。
- 优化 `MessageChain` 的实现。

## v1.1.4

- 优化 `adapter` 部分类型定义。
- 修复 `MessageChain` 的 `selected` 和 `dropped` 方法。

## v1.1.3

- 修复 `pie` 和 `adapter` 生命周期钩子问题。

## v1.1.2

- 修复 `MessageChain` 方法丢失问题。

## v1.1.1

- 优化 pie项目代码模板文件。

## v1.1.0

- 修复 `pie` 加载相关问题。
- 修改 `pie` 中事件监听的方式改为 `EventEmitter` 风格。
- 修改 `pie` 引入方式和编写模式。
- 添加 用户可自行编写用于与 mirai-api-http 交互的客户端 adapter。
- 添加 `miraipie` 继承 `EventEmitter` 可以用于消息和事件监听。
- 删除 数据库系统。
- 添加 使用配置文件系统管理应用。


## v1.0.5

- 修复 只读属性问题。
- 优化 部分类型定义。
- 优化 日志记录方式。
- 添加 未捕获异常的全局处理。

## v1.0.4

- 修复 群聊消息类型定义。
- 修复 `pie` 名称问题。
- 优化 cli `pie` 配置项填写。

## v1.0.3

- 修复 合并转发类型消息定义。
- 修复 群聊消息发送人缺失。

## v1.0.2

- 修复 `pie` 中类型提示问题。
- 更改 资源文件名取消 `.template` 后缀

## v1.0.1

- 新增 数据库操作 `queryMessages` 和 `queryEvents` 对历史消息和事件进行查询。
- 修复 `pie` 中类型问题。
- 修复 `HttpAdapter` 监听无限循环的问题。

## V1.0.0

- 完成 `miraipie` 核心逻辑。
