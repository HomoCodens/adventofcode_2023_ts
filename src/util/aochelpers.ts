String.prototype.lines = function(delimiter = '\n'): string[] {
    return this.trim().split(delimiter)
}

String.prototype.csvNumbers = function(separator: string = ','): number[] {
    return this.trim().split(separator).map(Number).filter((x) => !Number.isNaN(x))
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
