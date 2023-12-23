declare interface String {
    lines(delimiter: string = '\n'): string[],
    csv<T>(separator: string | RegExp = ',', parser: (chunk: any, index: number) => T, toStrip: RegExp | null = null, stripNonNumbers: boolean = true): T[],
    csvNumbers(separator: string | RegExp = ',', toStrip: RegExp | null = null, stripNonNumbers: boolean = true): number[],
    parseByRegex(expr: RegExp, parsers: any): any,
}

declare interface ArrayConstructor {
    seq(length: number): number[],
}
declare interface Array {
    sum(): number,
    prod(): number,
    unique(): Array,
    twoString(elementSep: string = '', lineSep: string = '\n'): string,
}

declare interface Location2D {
    x: number,
    y: number,
}