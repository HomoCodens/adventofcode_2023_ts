String.prototype.lines = function(delimiter = '\n'): string[] {
    return this.trim().split(delimiter)
}

String.prototype.csvNumbers = function(separator: string = ',', toStrip: RegExp | null = null): number[] {
    let str: String = this;
    if(toStrip !== null) {
        str = str.replace(toStrip, '');
    }

    return str.trim().split(separator).filter(Boolean).map(Number)
}

Array.prototype.sum = function() {
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

Array.prototype.seq = function(length: number) {
    return new Array(length).fill(0).map((_, i) => i)
}

export const manhattanDistance = (a: Location2D, b: Location2D) => Math.abs(a.x - b.x)  + Math.abs(a.y - b.y)