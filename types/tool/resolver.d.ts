export declare class SimpleCommandResolver {
    private main;
    env: object;
    constructor(node: SimpleCommandNode);
    use(env: object): this;
    resolve(command: string): void;
}
declare type SimpleCommandExecutor = (args: string[], env: object, resolver: SimpleCommandResolver) => any | Promise<any>;
interface SimpleCommandNode {
    program: string;
    executor: SimpleCommandExecutor;
    alias?: string[];
    subNodes?: SimpleCommandNode[];
    description?: string;
}
export {};
