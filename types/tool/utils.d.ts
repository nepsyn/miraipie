/**
 * 将目标对象中的所有属性设置为只读
 * @param target 目标对象
 * @return 代理后的target对象
 */
export declare function makeReadonly<T extends object>(target: T): T;
/**
 * 将目标函数构造为异步函数
 * @param func 目标函数
 * @param thisArg 函数this指向
 * @return func的异步函数
 */
export declare function makeAsync<T, D>(func: (...args: any[]) => Promise<T> | T, thisArg?: D): (...args: any[]) => Promise<T>;
/**
 * 阻塞一段时间
 * @param ms 阻塞时间(毫秒)
 */
export declare function sleep(ms?: number): Promise<void>;
/**
 * 获取资源文件路径
 * @param name 资源文件名
 * @return 资源文件路径
 */
export declare function getAssetPath(name: string): string;
/**
 * 解析依赖关系并排序
 * @param edges 依赖关系抽象的有向图边
 */
export declare function dependencyResolve(edges: Map<string, string[]>): any[];
/**
 * 转化日期对象为字符串
 */
export declare function formatDate(date: Date): string;
