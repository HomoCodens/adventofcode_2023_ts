import SolverBase, { Solvution } from './solverbase'

enum Spring {
    YES = '.',
    NO = '#',
    MAYBE = '?', // Also known as KervantumSpring  -- Uncommitted Joke
}

class SpringRow {
    private springPointer: number = 0
    private runPointer: number = 0
    private currentRun: number = 0
    private springLength: number
    private nRuns: number

    constructor(private springs: Spring[], private targetRuns: number[]) {
        this.springLength = springs.length
        this.nRuns = targetRuns.length
    }

    static charToSpring(char: '.' | '#' | '?'): Spring {
        return char as Spring
    }

    static fromString(def: string): SpringRow {
        const { springs, runs } = def.parseByRegex(/(?<springs>[.#?]+) (?<runs>[\d,]+)/, {
            springs: (springDef: string) => springDef.csv('', SpringRow.charToSpring),
            runs: (runDef: string) => runDef.csvNumbers(),
        })
        
        return new SpringRow(springs, runs)
    }
    
    toString(): string {
        return this.springs.map((s) => s.toString()).join('') + ' ' + this.targetRuns.join(',')
    }
    
    toDiagnosticsString(): string {
        const normalString = this.toString()
        let springPointerString = ' '.repeat(this.springPointer) + 'v'
        const springPointerPaddy = this.springLength - this.springPointer - 1
        if(springPointerPaddy > 0) {
            springPointerString += ' '.repeat(springPointerPaddy)
        }
        const runPointerString = ' '.repeat(2*this.runPointer) + 'v'
        return springPointerString + ' ' + runPointerString + '\n' + normalString
    }

    runDown(): number {
        while(this.springs[this.springPointer] == Spring.YES) { 
            this.springPointer++
        }

        if(this.springPointer == this.springLength + 1) {
            return 0
        }

        if(this.springs[this.springPointer] == Spring.NO) {
            let afterRun = this.springPointer + this.targetRuns[this.runPointer]

            if(afterRun > this.springLength) {
                return 0
            }

            while(this.springPointer < afterRun) {
                if(this.springs[this.springPointer] == Spring.YES) {
                    return 0
                }

                this.springs[this.springPointer] = Spring.NO
                this.springPointer++
            }

            if(this.springs[this.springPointer] == Spring.NO) {
                return 0
            }

            this.runPointer++
            if(this.runPointer == this.nRuns) {
                if(this.springs.slice(this.springPointer).some(s => s == Spring.NO)) {
                    return 0
                }

                return 1
            }

            let remainingRuns = this.targetRuns.slice(this.runPointer)
            let remainingSpotsNeeded = remainingRuns.sum() + remainingRuns.length - 1
            let remainingSpots = this.springLength - this.springPointer
            if(remainingSpotsNeeded > remainingSpots) {
                return 0
            }

            this.springs[this.springPointer] = Spring.YES
            this.springPointer++
            return this.runDown()
        } else {
            return this.cloneAndSet(Spring.YES).runDown() +
                    this.cloneAndSet(Spring.NO).runDown()
        }

    }

    // eslint-disable-next-line
    diagnosticPrint(msg: string): void {
        console.log(msg)
    }

    cloneAndSet(what: Spring): SpringRow {
        const clone = new SpringRow([...this.springs], this.targetRuns)
        clone.runPointer = this.runPointer
        clone.currentRun = this.currentRun
        clone.springPointer = this.springPointer
        clone.springs.splice(this.springPointer, 1, what)
        return clone
    }

    duppelcate(): SpringRow {
        return new SpringRow(
            [...this.springs, Spring.MAYBE, ...this.springs],
            [...this.targetRuns, ...this.targetRuns]
        )
    }

    trippelcate(): SpringRow {
        return new SpringRow(
            [...this.springs, Spring.MAYBE, ...this.springs, Spring.MAYBE, ...this.springs],
            [...this.targetRuns, ...this.targetRuns, ...this.targetRuns]
        )
    }

    quintupplecate(): SpringRow {
        return new SpringRow(
            [...this.springs, Spring.MAYBE, ...this.springs, Spring.MAYBE, ...this.springs, Spring.MAYBE, ...this.springs, Spring.MAYBE, ...this.springs],
            [...this.targetRuns, ...this.targetRuns, ...this.targetRuns, ...this.targetRuns, ...this.targetRuns]
        )
    }
}

// Had to once the thought was there. D'oh!
class SpringField {

    constructor(private springRows: SpringRow[]) { }

    static fromString(def: string): SpringField {
        return new SpringField(def.lines().map(SpringRow.fromString))
    }

    do(): number {
        return this.springRows.map((s) => {
            console.log(s.toString())
            let combs = s.runDown()
            console.log(`that makes ${combs} possibilities\n`)
            return combs
        }).sum()
    }

    doo(): number {
        return this.springRows.map((s, i) => {
            console.log(i)
            return s.quintupplecate().runDown()
        }).sum()
    }
}

export default class SolverDay12 extends SolverBase<SpringField> {
    static override day = 12

    prepareInput(rawInput: string): SpringField {
        return SpringField.fromString(rawInput)
    }

    solvePartOne(input: SpringField): Solvution {
        return new Solvution(
            input.do()
        )
    }
    
    solvePartTwo(input: SpringField): Solvution {
        return new Solvution(
            input.doo()
        )
    }

}
