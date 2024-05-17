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
    
    toDiagnosticsString(chonkhPositions: number[]): string {
        const springString = this.toString()
        const positionsWithIndex = chonkhPositions.map((p, i) => ({p, i})).filter(({p}) => p >= 0)
        const chonkhPointers = positionsWithIndex.map(({p, i}) => {
            let nSpaces = Math.max(p - 1, 0)
            if(i > 0) {
                nSpaces -= positionsWithIndex[i - 1].p
            }
            return ' '.repeat(nSpaces) + 'v'
        }).join('')
        const chonkhSizes = positionsWithIndex.map(({p, i}) => {
            let nSpaces = Math.max(p - 1, 0)
            if(i > 0) {
                nSpaces -= positionsWithIndex[i - 1].p
            }
            return ' '.repeat(nSpaces) + this.targetRuns[i]
        }).join('')
        return `${chonkhSizes}\n${chonkhPointers}\n${springString}`
    }

    runDown(chonkh: number = 0,
            startPosition: number = 0,
            caysh: number[][] = [],
            positions: number[] = Array.fillN(this.nRuns, -1)): number {
        
        if(!caysh[chonkh]) {
            caysh[chonkh] = []
        }

        // console.log(`checking with ${chonkh}, ${positions}`)
        // console.log(this.toDiagnosticsString(positions))

        if(caysh[chonkh] && caysh[chonkh][startPosition] !== undefined) {
            // console.log(`Hitted the cash for chonkh ${chonkh} at ${startPosition}: ${caysh[chonkh][startPosition]}`)
            return caysh[chonkh][startPosition]
        }

        const chonkhSize = this.targetRuns[chonkh]
        if(startPosition + chonkhSize > this.springLength) {
            // console.log('down but no sigar')
            caysh[chonkh][startPosition] = 0
            return 0
        }

        if(chonkh >= this.nRuns) {
            // console.log('returning an one')
            if(!this.springs.slice(startPosition).some(s => s === Spring.NO)) {
                // console.log('works')
                return 1
            } else {
                caysh[chonkh][startPosition] = 0
                return 0
            }
        }

        const remainingRuns = this.targetRuns.slice(chonkh + 1)
        const maxStartPosition = this.springLength - (remainingRuns.sum() + remainingRuns.length - 1 + chonkhSize)
        const anchor = this.springs.findIndex((s, i) => s === Spring.NO && i >= startPosition)
        const lastStartPosition = anchor == -1 ? maxStartPosition : anchor

        let chonkhPosition = this.settleChonkh(chonkhSize, startPosition, lastStartPosition)
        let totalPermutations = 0
        while(chonkhPosition <= lastStartPosition) {
            const positiones = [...positions.slice(0, chonkh), chonkhPosition, ...positions.slice(chonkh + 1)]
            const validPermutations = this.runDown(chonkh + 1, chonkhPosition + chonkhSize + 1, caysh, positiones)
            totalPermutations += validPermutations

            chonkhPosition = this.settleChonkh(chonkhSize, chonkhPosition + 1, lastStartPosition)
        }

        caysh[chonkh][startPosition] = totalPermutations

        return totalPermutations
    }

    settleChonkh(runLength: number, startPosition: number, maxPosition: number) {
        let settledPosition = startPosition
        while(!this.chonkhCanSit(runLength, settledPosition) &&
                settledPosition <= maxPosition) {
            settledPosition++
        }
        return this.chonkhCanSit(runLength, settledPosition) ? settledPosition : this.springLength + 1
    }

    chonkhCanSit(runLength: number, position: number) {
        return (position + runLength <= this.springLength) &&
                !this.springs.slice(position, position + runLength).some(x => x == Spring.YES) &&
                !((position + runLength < this.springLength) && this.springs[position + runLength] == Spring.NO)
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
