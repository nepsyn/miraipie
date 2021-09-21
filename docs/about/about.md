# 介绍

## miraipie 是什么

miraipie 是一个基于 [mirai-api-http](https://github.com/project-mirai/mirai-api-http) 的 TypeScript/JavaScript QQ 机器人开发工具包。

miraipie 完全使用 TypeScript 编写， 拥有良好的注释和类型提示。同时 miraipie 兼容浏览器和 Node.js 平台， 不论是 Web 开发者或 Node.js 开发者都可以快速构建自己的机器人应用程序。

## 为什么选择 miraipie

miraipie 在你使用 Typescript/Javascript 构建自己的机器人应用程序时会极大地减轻你的工作量， 其主要特性有以下几个方面：

1. **良好的注释**。miraipie 在编写过程中加入了大量的注释， 在部分常用方法上有编写时的范例。另外， miraipie 使用 TypeScript 编写， 在开发时可以提供完善的类型注释， 配合 IDE（WebStorm、VSCode） 可以成倍提高开发效率。
2. **开放的拓展**。miraipie 中， 一个独立拓展就是一个函数， 开发简单但功能齐全， 同时 miraipie 的拓展对也可以发布为 NPM 包以供他人使用， 共同丰富机器人的功能。
3. **完整的日志**。miraipie 应用程序有完善的日志系统， 每个插件都有其独自的 `logger` ，在插件执行或应用程序出错时可以快速定位出错位置，便于开发中的调试修改。
4. **及时的更新**。miraipie 总会保持与 mirai-api-http 的更新， 以保证开发者总是能使用 mirai-api-http 提供的新特性。另外，miraipie 应用程序启动时会检查与 mirai-api-http 的版本兼容性并通知用户， 以让用户及时更新 mirai-api-http 或 miraipie 版本。
