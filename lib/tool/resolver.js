"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCommandResolver = void 0;
var SimpleCommandResolver = /** @class */ (function () {
    function SimpleCommandResolver(node) {
        this.main = new SimpleCommandResolverNode(node, this);
        this.env = {};
    }
    SimpleCommandResolver.prototype.use = function (env) {
        this.env = env;
        return this;
    };
    SimpleCommandResolver.prototype.resolve = function (command) {
        var args = command.trim().split(/\s+/);
        if (args.length >= 1 && (this.main.program === args[0] || this.main.alias.includes(args[0]))) {
            this.main.resolve(args.slice(1));
        }
    };
    return SimpleCommandResolver;
}());
exports.SimpleCommandResolver = SimpleCommandResolver;
var SimpleCommandResolverNode = /** @class */ (function () {
    function SimpleCommandResolverNode(node, resolver) {
        var e_1, _a, e_2, _b;
        this.program = node.program;
        this.executor = node.executor;
        this.resolver = resolver;
        this.subNodes = new Map();
        this.alias = node.alias || [];
        this.description = node.description || '';
        try {
            for (var _c = __values(node.subNodes || []), _d = _c.next(); !_d.done; _d = _c.next()) {
                var subNode = _d.value;
                var newNode = new SimpleCommandResolverNode(subNode, resolver);
                this.subNodes.set(subNode.program, newNode);
                try {
                    for (var _e = (e_2 = void 0, __values(subNode.alias || [])), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var alias = _f.value;
                        this.subNodes.set(alias, newNode);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    SimpleCommandResolverNode.prototype.resolve = function (args) {
        if (args.length >= 1 && this.subNodes.has(args[0]))
            this.subNodes.get(args[0]).resolve(args.slice(1));
        else
            this.executor(args, this.resolver.env, this.resolver);
    };
    return SimpleCommandResolverNode;
}());
