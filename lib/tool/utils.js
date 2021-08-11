"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyResolve = exports.getAssetPath = exports.sleep = exports.makeAsync = exports.makeReadonly = void 0;
var path_1 = __importDefault(require("path"));
/**
 * 将目标对象中的所有属性设置为只读
 * @param target 目标对象
 * @return 代理后的target对象
 */
function makeReadonly(target) {
    if (target) {
        return new Proxy(target, {
            get: function (target, p, receiver) {
                var res = Reflect.get(target, p, receiver);
                if (typeof res === 'object')
                    return makeReadonly(res); // 迭代子对象
                else
                    return res;
            },
            set: function () {
                return false; // 不可修改
            }
        });
    }
    else {
        return null;
    }
}
exports.makeReadonly = makeReadonly;
/**
 * 将目标函数构造为异步函数
 * @param func 目标函数
 * @param thisArg 函数this指向
 * @return func的异步函数
 */
function makeAsync(func, thisArg) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, func.apply(thisArg, args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
}
exports.makeAsync = makeAsync;
/**
 * 阻塞一段时间
 * @param ms 阻塞时间(毫秒)
 */
function sleep(ms) {
    if (ms === void 0) { ms = 100; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
exports.sleep = sleep;
/**
 * 获取资源文件路径
 * @param name 资源文件名
 * @return 资源文件路径
 */
function getAssetPath(name) {
    return path_1.default.normalize(path_1.default.join(__dirname, "../../assets/" + name));
}
exports.getAssetPath = getAssetPath;
/**
 * 解析依赖关系并排序
 * @param edges 依赖关系抽象的有向图边
 */
function dependencyResolve(edges) {
    // 最终结果
    var sequence = [];
    var _loop_1 = function () {
        var e_1, _a, e_2, _b;
        var prior = null;
        try {
            // 寻找引用计数最小的结点
            for (var _c = (e_1 = void 0, __values(edges.entries())), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), v = _e[0], e = _e[1];
                if (prior === null)
                    prior = v;
                if (e.length === 0) {
                    prior = v;
                    break;
                }
                else if (e.length < edges.get(prior).length)
                    prior = v;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // 删除该结点并加入排序序列
        sequence.push(prior);
        edges.delete(prior);
        try {
            // 删除其他结点对该节点的引用关系
            for (var _f = (e_2 = void 0, __values(edges.entries())), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = __read(_g.value, 2), v = _h[0], e = _h[1];
                edges.set(v, e.filter(function (p) { return p !== prior; }));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    // 当不存在边时结束
    while (edges.size > 0) {
        _loop_1();
    }
    return sequence;
}
exports.dependencyResolve = dependencyResolve;
