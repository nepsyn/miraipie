import * as Path from 'path';

export function makeReadonly<T extends object>(target: T): T {
    if (target) {
        return new Proxy(target, {
            get(target: T, p: string | symbol, receiver: any): any {
                const res = Reflect.get(target, p, receiver);
                if (typeof res === 'object') return makeReadonly(res);
                else return res;
            },
            set(): boolean {
                return false;
            }
        });
    } else {
        return null;
    }
}

export function makeAsync<T, D>(func: (...args: any[]) => Promise<T> | T, thisArg?: D): (...args: any[]) => Promise<T> {
    return async function (this: D, ...args) {
        return await func.apply(thisArg, args);
    }
}

export async function sleep(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAssetPath(name: string): string {
    return Path.normalize(Path.join(__dirname, `../../assets/${name}`));
}
