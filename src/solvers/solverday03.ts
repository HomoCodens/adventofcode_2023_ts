import SolverBase, { Solvution } from './solverbase'

class NumberToken {
    value: number
    line: number
    col: number
    length: number

    static Null = new NumberToken(-1, -1, -1, -1)

    constructor(value: number, line: number, col: number, length: number) {
        this.value = value
        this.line = line
        this.col = col
        this.length = length
    }

    adjacentTo(symbol: SymbolToken): boolean {
        // "rect contains"
        return (symbol.line >= this.line - 1 && symbol.line <= this.line + 1) &&
                (symbol.col >= this.col - 1 && symbol.col <= this.col + this.length)
    }
}

class SymbolToken {
    value: string
    line: number
    col: number

    static Null = new SymbolToken('', -1, -1)

    constructor(value: string, line: number, col: number) {
        this.value = value
        this.line = line
        this.col = col
    }

    adjacentTo(num: NumberToken): boolean {
        return num.adjacentTo(this)
    }
}

type Schematic = {
    numberTokens: NumberToken[],
    symbolTokens: SymbolToken[],
}

export default class SolverDay03 extends SolverBase<Schematic> {
    static override day = 3

    prepareInput(rawInput: string): Schematic {
        const lines = rawInput.trim()
                                .split('\n')
        
        const numberTokens = lines.flatMap((line, lineNo) => 
                                [...line.matchAll(/\d+/g)].map((match) => {
                                    if(match.index !== undefined) {
                                        return new NumberToken(+match[0], lineNo, match.index, match[0].length)
                                    } else {
                                        // can't happen, pleasing the compailer
                                        return NumberToken.Null
                                    }
                                })
                             )

        const symbolTokens = lines.flatMap((line, lineNo) => 
                                [...line.matchAll(/[^\d.]/g)].map((match) => {
                                    if(match.index !== undefined) {
                                        return new SymbolToken(match[0], lineNo, match.index)
                                    } else {
                                        return SymbolToken.Null
                                    }
                                })
        )

        return {
            numberTokens,
            symbolTokens
        }
    }

    solvePartOne(input: Schematic): Solvution {
        return new Solvution(
            input.numberTokens.filter((number) => input.symbolTokens.some((symbol) => number.adjacentTo(symbol)))
                .reduce((acc: number, { value }: NumberToken) => acc + value, 0)
        )
    }
    
    solvePartTwo(input: Schematic): Solvution {
        return new Solvution(
            input.symbolTokens.filter(({ value }) => value === '*')
                    .map((symbol) => input.numberTokens.filter((number) => symbol.adjacentTo(number)))
                    .filter((numbers) => numbers.length === 2)
                    .reduce((acc, numbers) => acc + numbers[0].value*numbers[1].value, 0)
        )
    }
}
        