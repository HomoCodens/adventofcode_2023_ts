String.prototype.lines = function(delimiter = '\n'): string[] {
    return this.trim().split(delimiter)
}

String.prototype.csvNumbers = function(separator: string = ',',
                                        toStrip: RegExp | null = null,
                                        stripNulls: boolean = true): number[] {
    return this.csv(separator, Number, toStrip, stripNulls)
}

String.prototype.csv = function<T>(separator: string = ',',
                                    parser: (chunk: any, index: number) => T,
                                    toStrip: RegExp | null = null,
                                    stripNulls: boolean = true): T[] {
    let str: String = this;
    if(toStrip !== null) {
        str = str.replace(toStrip, '');
    }

    let elements: T[] = str.trim().split(separator).map(parser)
    
    if(stripNulls) {
        elements = elements.filter((x) => x !== null && x !== undefined)
    }

    return elements
}

// TODO: can one do parsers: { [k in groupsof expr]: any } or somewhat?
String.prototype.parseByRegex = function(expr: RegExp, parsers: any): any {
    const matches = expr.exec(this as string)

    if(!matches) {
        return {}
    } else {
        return Object.entries(matches.groups!).reduce((acc: any, [groupName, chunk]) => {
            acc[groupName] = parsers[groupName](chunk)
            return acc
        }, {})
    }

}

Array.prototype.sum = function() {
    if(this.length === 0) {
        return 0
    }

    if(typeof this[0] != 'number') {
        return Number.NaN
    }
    return this.reduce((acc, x) => acc + x)
}

Array.prototype.prod = function() {
    if(typeof this[0] != 'number') {
        return Number.NaN
    }

    return this.reduce((acc, x) => acc * x)
}

Array.prototype.twoString = function(elementSep: string = '', lineSep: string = '\n') {
    return this.map((line) => line.join(elementSep)).join(lineSep)
}

Array.seq = function(length: number) {
    return new Array(length).fill(0).map((_, i) => i)
}

export const manhattanDistance = (a: Location2D, b: Location2D) => Math.abs(a.x - b.x)  + Math.abs(a.y - b.y)