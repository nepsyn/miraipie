export class SimpleCommandResolver {
    private main: SimpleCommandResolverNode;
    public env: object;

    constructor(node: SimpleCommandNode) {
        this.main = new SimpleCommandResolverNode(node, this);
        this.env = {};
    }

    use(env: object): this {
        this.env = env;
        return this;
    }

    resolve(command: string) {
        const args = command.trim().split(/\s+/);
        if (args.length >= 1 && (this.main.program === args[0] || this.main.alias.includes(args[0]))) {
            this.main.resolve(args.slice(1));
        }
    }
}

type SimpleCommandExecutor = (args: string[], env: object, resolver: SimpleCommandResolver) => any | Promise<any>;
interface SimpleCommandNode {
    program: string;
    executor: SimpleCommandExecutor;

    alias?: string[];
    subNodes?: SimpleCommandNode[];
    description?: string;
}

class SimpleCommandResolverNode {
    public program: string;
    private readonly executor: SimpleCommandExecutor;
    private readonly resolver: SimpleCommandResolver;
    private subNodes: Map<string, SimpleCommandResolverNode>;

    public alias: string[];
    public description: string;

    constructor(node: SimpleCommandNode, resolver: SimpleCommandResolver) {
        this.program = node.program;
        this.executor = node.executor;
        this.resolver = resolver;
        this.subNodes = new Map();

        this.alias = node.alias || [];
        this.description = node.description || '';

        for (const subNode of node.subNodes || []) {
            const newNode = new SimpleCommandResolverNode(subNode, resolver);
            this.subNodes.set(subNode.program, newNode);
            for (const alias of subNode.alias || []) this.subNodes.set(alias, newNode);
        }
    }

    resolve(args: string[]) {
        if (args.length >= 1 && this.subNodes.has(args[0])) this.subNodes.get(args[0]).resolve(args.slice(1));
        else this.executor(args, this.resolver.env, this.resolver);
    }
}
