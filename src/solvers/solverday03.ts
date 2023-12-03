import SolverBase, { Solvution } from './solverbase'
        
export default class SolverDay03 extends SolverBase<string[]> {
    prepareInput(rawInput: string): string[] {
        return rawInput.trim().split('\n')
    }

    solvePartOne(input: string[]): Solvution {
        return new Solvution(
            input.map((line, i, lines) => {
                const numberMatches = [...line.matchAll(/\d+/g)]
                                        .filter((match) => this.hazSymbol(match, i, lines))
                                        .map((x) => +x[0])
                console.log(numberMatches)
                if(numberMatches.length === 0) {
                    return 0
                }
                
                return numberMatches.reduce((a, b) => a + b)
            }).reduce((a, b) => a + b)            
        )
    }
    
    solvePartTwo(input: string[]): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

    private hazSymbol(match: RegExpMatchArray, lineNo: number, lines: string[]) {
        if(match.index === undefined || match.input === undefined) {
            return false
        }

        console.log(match)

        return this.stringHazSymbol(match.input.substring(match.index - 1, match.index + match[0].length + 1)) ||
                (lineNo > 0 && this.stringHazSymbol(lines[lineNo - 1].substring(match.index - 1, match.index  +  match[0].length + 1))) ||
                (lineNo < (lines.length - 1) && this.stringHazSymbol(lines[lineNo + 1].substring(match.index - 1, match.index + match[0].length + 1)))
    }

    private stringHazSymbol(str: string) {
        console.log(`testing ${str}`)
        console.log(`methinks ${/[^\d\.]/.test(str)}`)
        return /[^\d.]/.test(str)
    }
}
        