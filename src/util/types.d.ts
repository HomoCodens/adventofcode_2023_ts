declare interface String {
    lines(delimiter: string = '\n'): string[],
    csvNumbers(separator: string = ','): number[],
}

declare interface Array {
    sum(): number,
    prod(): number
}