declare interface String {
    lines(delimiter: string = '\n'): string[],
    csv<T>(separator: string | RegExp = ',', parser: (chunk: any, index: number) => T, toStrip: RegExp | null = null, stripNonNumbers: boolean = true): T[],
    csvNumbers(separator: string | RegExp = ',', toStrip: RegExp | null = null, stripNonNumbers: boolean = true): number[],
    parseByRegex(expr: RegExp, parsers: any): any,
}

declare interface ArrayConstructor {
    seq(length: number): number[],
    fillN(length: number, value: any): any[]
}
declare interface Array {
    sum(): number,
    prod(): number,
    unique(): Array,
    twoString(elementSep: string = '', lineSep: string = '\n'): string,
    toSpliced(start: number, deleteCount: number, ...items: any[]),
}

declare interface Location2D {
    x: number,
    y: number,
}