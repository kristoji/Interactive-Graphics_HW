


export function clamp(x: number, a: number, b: number): number {
    return Math.min(Math.max(x, a), b);
}

export function rand_range(a: number, b: number): number {
    return a + Math.random() * (b - a);
}