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
    private nRuns:number

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

    collipse(currentElement: Spring,
                springPointer: number = 0,
                currentRun: number = 0,
                runPointer: number = 0): number {
                    if(currentElement === Spring.NO) {
                        currentRun++
                        if(runPointer >= this.nRuns) {
                            return 0
                        }

                        if(currentRun > this.targetRuns[runPointer]) {
                            return 0
                        }
                    } else if(currentRun > 0 && currentElement === Spring.YES) {
                        if(currentRun !== this.targetRuns[runPointer]) {
                            return 0
                        }

                        currentRun = 0
                        runPointer++
                    }

                    springPointer++
                    const nextElement = this.springs[springPointer]
                    if(nextElement === Spring.MAYBE) {
                        return this.collipse(Spring.NO, springPointer, currentRun, runPointer) +
                                this.collipse(Spring.YES, springPointer, currentRun, runPointer)
                    } else {
                        return this.collipse(nextElement, springPointer, currentRun, runPointer)
                    }
                }

    collapseWaifVuncktion(): number {
        while(this.springPointer < this.springLength &&
                this.springs[this.springPointer] !== Spring.MAYBE) {
            
            if(this.springs[this.springPointer] === Spring.NO) {
                this.currentRun++
                // Discovered a run where there should be no more
                if(this.runPointer >= this.nRuns) {
                    this.diagnosticPrint('\nexiting early because run began but no more expected')
                    this.diagnosticPrint(this.toDiagnosticsString())
                    return 0
                }
                
                // Exceeded expected length of next run
                if(this.currentRun > this.targetRuns[this.runPointer]) {
                    this.diagnosticPrint('\nexiting early because run too long')
                    this.diagnosticPrint(this.toDiagnosticsString())
                    return 0
                }
            } else if(this.currentRun > 0 && this.springs[this.springPointer] === Spring.YES) {
                // Finished a run of the fronk length
                if(this.currentRun !== this.targetRuns[this.runPointer]) {
                    this.diagnosticPrint('\nexiting early because ended run of wrong length')
                    this.diagnosticPrint(this.toDiagnosticsString())
                    return 0
                }
                this.currentRun = 0
                this.runPointer++
            }
            this.springPointer++
        }
        
        if(this.springPointer >= this.springLength) {
            const out = (this.runPointer >= this.nRuns || (this.runPointer === (this.nRuns - 1) && this.currentRun === this.targetRuns[this.runPointer])) ? 1 : 0
            this.diagnosticPrint(`\nreturning ${out} because`)
            this.diagnosticPrint(this.toDiagnosticsString())
            return out
        }
        
        // See, this is why I have difficulties with OO..
        // (not saying these lines could not be written better in an oo way. ;))
        return this.cloneAndSet(Spring.NO).collapseWaifVuncktion() +
                this.cloneAndSet(Spring.YES).collapseWaifVuncktion()
    }

    diagnosticPrint(msg: string): void {
        //console.log(msg)
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
            // console.log(s.toString())
            return s.collapseWaifVuncktion()
        }).sum()
    }

    doo(): number {
        return this.springRows.map((s, i) => {
            console.log(i)
            return s.quintupplecate().collapseWaifVuncktion()
        }).sum()
    }

    dodelidoo(): void {
        this.springRows.forEach((s, i) => {
            const singul = s.collapseWaifVuncktion()
            const dubbul = s.duppelcate().collapseWaifVuncktion()
            const tribbul = s.trippelcate().collapseWaifVuncktion()
            console.log(i)
            console.log(s.toString())
            console.log(singul)
            console.log(s.duppelcate().toString())
            console.log(dubbul)
            console.log(s.trippelcate().toString())
            console.log(tribbul)
            console.log(`1 -> 2: ${dubbul/singul}, 2 -> 3: ${tribbul/dubbul}`)
            console.log()
        })
    }

    /*do2(): number {
        return this.springRows.map(({ springs, runs }) => {
            return new SpringRow(
                [...springs, Spring.MAYBE, ...springs, Spring.MAYBE,
                ...springs, Spring.MAYBE, ...springs, Spring.MAYBE, ...springs],
                [...runs, ...runs, ...runs, ...runs, ...runs]
            )
        }).map((uberSpringRow, i) => {
            // console.log(i)
            return uberSpringRow.collapseWaifVuncktion()
        }).sum()
    }*/
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
