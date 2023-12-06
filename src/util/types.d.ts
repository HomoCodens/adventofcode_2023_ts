declare interface String {
    lines(delimiter: string = '\n'): string[],
    csvNumbers(separator: string = ',', toStrip: RegExp | null = null): number[],
}

declare interface Array {
    sum(): number,
    prod(): number,
    static seq(length: number): number[],
}