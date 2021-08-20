# Changelog

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
