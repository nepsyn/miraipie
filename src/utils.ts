import fs from 'fs-extra';

/**
 * 将目标对象中的所有属性设置为只读
 * @param target 目标对象
 * @return 代理后的target对象
 */
export function makeReadonly<T extends object>(target: T): T {
    if (target) {
        return new Proxy(target, {
            get(target: T, p: string | symbol, receiver: any): any {
                return Reflect.get(target, p, receiver);
            },
            set(): boolean {
                return false;  // 不可修改
            }
        });
    } else {
        return null;
    }
}

/**
 * 将目标函数构造为异步函数
 * @param func 目标函数
 * @param thisArg 函数this指向
 * @return func的异步函数
 */
export function makeAsync<T, D>(func: (...args: any[]) => Promise<T> | T, thisArg?: D): (...args: any[]) => Promise<T> {
    return async function (this: D, ...args) {
        return await func.apply(thisArg, args);
    }
}

/**
 * 阻塞一段时间
 * @param ms 阻塞时间(毫秒)
 */
export async function sleep(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 解析依赖关系并排序
 * @param edges 依赖关系抽象的有向图边
 */
export function dependencyResolve(edges: Map<string, string[]>) {
    // 最终结果
    const sequence: any[] = [];
    // 当不存在边时结束
    while (edges.size > 0) {
        let prior = null;
        // 寻找引用计数最小的结点
        for (const [v, e] of edges.entries()) {
            if (prior === null) prior = v;
            if (e.length === 0) {
                prior = v;
                break;
            } else if (e.length < edges.get(prior).length) prior = v;
        }
        // 删除该结点并加入排序序列
        sequence.push(prior);
        edges.delete(prior);
        // 删除其他结点对该节点的引用关系
        for (const [v, e] of edges.entries()) edges.set(v, e.filter((p) => p !== prior));
    }
    return sequence;
}

/**
 * 转化日期对象为字符串
 */
export function formatDate(date: Date): string {
    if (!date) return null;
    return `${date.getUTCFullYear()}-` +
        `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
        `${date.getDate().toString().padStart(2, '0')} ` +
        `${date.getHours().toString().padStart(2, '0')}:` +
        `${date.getMinutes().toString().padEnd(2, '0')}:` +
        `${date.getSeconds().toString().padStart(2, '0')}`;
}

/**
 * 写入模板
 * @param src 源文件
 * @param dest 目标文件
 * @param bindings 绑定值
 */
export function makeTemplate(src: string, dest: string, bindings: object) {
    let content = fs.readFileSync(src).toString();
    for (const key of Object.keys(bindings)) {
        content = content.replace(`{{${key}}}`, bindings[key]);
    }
    fs.writeFileSync(dest, content);
}
