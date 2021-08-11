"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseCode = void 0;
/**
 * mirai-api-http请求返回的状态码
 */
var ResponseCode;
(function (ResponseCode) {
    /**
     * 正常
     */
    ResponseCode[ResponseCode["Success"] = 0] = "Success";
    /**
     * 错误的verify key
     */
    ResponseCode[ResponseCode["WrongVerifyKey"] = 1] = "WrongVerifyKey";
    /**
     * 指定的Bot不存在
     */
    ResponseCode[ResponseCode["BotNotExist"] = 2] = "BotNotExist";
    /**
     * Session失效或不存在
     */
    ResponseCode[ResponseCode["SessionNotExist"] = 3] = "SessionNotExist";
    /**
     * Session未认证(未激活)
     */
    ResponseCode[ResponseCode["UnverifiedSession"] = 4] = "UnverifiedSession";
    /**
     * 发送消息目标不存在(指定对象不存在)
     */
    ResponseCode[ResponseCode["TargetNotExist"] = 5] = "TargetNotExist";
    /**
     * 指定文件不存在，出现于发送本地图片
     */
    ResponseCode[ResponseCode["FileNotExist"] = 6] = "FileNotExist";
    /**
     * 无操作权限，指Bot没有对应操作的限权
     */
    ResponseCode[ResponseCode["NoPermission"] = 10] = "NoPermission";
    /**
     * Bot被禁言，指Bot当前无法向指定群发送消息
     */
    ResponseCode[ResponseCode["BotIsMuted"] = 20] = "BotIsMuted";
    /**
     * 消息过长
     */
    ResponseCode[ResponseCode["MessageTooLong"] = 30] = "MessageTooLong";
    /**
     * 错误的访问，如参数错误等
     */
    ResponseCode[ResponseCode["BadRequest"] = 400] = "BadRequest";
})(ResponseCode = exports.ResponseCode || (exports.ResponseCode = {}));
