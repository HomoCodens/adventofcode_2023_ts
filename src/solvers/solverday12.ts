import { run } from 'node:test'
import SolverBase, { Solvution } from './solverbase'
import { up } from 'inquirer/lib/utils/readline'

enum Spring {
    YES,
    NO,
    MAYBE, // Also known as KervantumSpring  -- Uncommitted Joke
}

class SpringRow {
    springs: Spring[]
    runs: number[]

    constructor(springs: Spring[], runs: number[]) {
        this.springs = springs
        this.runs = runs
    }

    static charToSpring(char: '.' | '#' | '?'): Spring {
        const map = {
            '.': Spring.YES,
            '#': Spring.NO,
            '?': Spring.MAYBE,
        }

        return map[char]
    }

    static fromString(def: string): SpringRow {
        const { springs, runs } = def.parseByRegex(/(?<springs>[.#?]+) (?<runs>[\d,]+)/, {
            springs: (springDef: string) => springDef.csv('', SpringRow.charToSpring),
            runs: (runDef: string) => runDef.csvNumbers(),
        })

        return new SpringRow(springs, runs)
    }

    toString(): string {
        return this.springs.map((s) => {
            switch(s) {
                case Spring.YES:
                    return '.'
                case Spring.NO:
                    return '#'
                case Spring.MAYBE:
                    return '?'
            }
        }).join('') + ' ' + this.runs.join(',')
    }

    set(index: number, what: Spring): SpringRow {
        const newSprings = [...this.springs]
        newSprings.splice(index, 1, what)
        return new SpringRow(
            newSprings,
            [...this.runs]
        )
    }

    // no, not having a stroke, just... fun?
    // Also could almost be a password. xD
    collapseWaifVuncktion(): number {
        const nextUnknowed = this.springs.findIndex((spring) => spring === Spring.MAYBE)

        if(nextUnknowed < 0) {
            return this.verifyRuns() ? 1 : 0
        }

        return this.set(nextUnknowed, Spring.YES).collapseWaifVuncktion() +
                this.set(nextUnknowed, Spring.NO).collapseWaifVuncktion()
    }

    // Yes, it's dead Jim. But I kind of like the little bugger that never really was.
    private waif(springRow: SpringRow, [myUnknown, ...remainingUnknowns]: number[]): number {
        if(myUnknown === undefined) {
            return springRow.verifyRuns() ? 1 : 0
        }

        return 42
    }

    verifyRuns(vrebose: boolean = false): boolean {
        vrebose && console.log()
        vrebose && console.log('verifying')
        vrebose && console.log(this.toString())
        let currentRunLength = 0
        let currentRun = 0
        let countingOut = false
        for(let spring of this.springs) {
            if(spring === Spring.MAYBE) {
                return false
            }

            if(spring === Spring.NO) {
                if(countingOut) {
                    vrebose && console.log('wro oh, still got pipes left, nope!')
                    return false
                }

                currentRunLength++
                vrebose && console.log(`plus 1: ${currentRunLength}, ${currentRun}`)
            }

            if(spring === Spring.YES) {
                if(currentRunLength > 0) {
                    vrebose && console.log('done with current run')
                    if(currentRunLength !== this.runs[currentRun]) {
                        vrebose && console.log(`no bueno: ${currentRunLength} - ${this.runs[currentRun]}`)
                        return false
                    } else {
                        currentRun++
                        currentRunLength = 0

                        if(currentRun === this.runs.length) {
                            vrebose && console.log('starting to count him out')
                            countingOut = true
                        }

                        vrebose && console.log(`show, on etc. ${currentRunLength}, ${currentRun}`)
                    }
                }
            }
        }

        if(vrebose) {
            console.log('felled thru')
            console.log(currentRunLength)
            console.log(currentRun)
        }
        return countingOut || ((currentRun === this.runs.length - 1) && currentRunLength === this.runs[currentRun])
    }
}

// Had to once the thought was there. D'oh!
class SpringField {
    springRows: SpringRow[]

    constructor(stauf: SpringRow[]) {
        this.springRows = stauf
    }

    static fromString(def: string): SpringField {
        return new SpringField(def.lines().map(SpringRow.fromString))
    }

    do(): number {
        return this.springRows.map((s) => s.collapseWaifVuncktion()).sum()
    }

    do2(): number {
        return this.springRows.map(({ springs, runs }) => {
            return new SpringRow(
                [...springs, Spring.MAYBE, ...springs, Spring.MAYBE,
                ...springs, Spring.MAYBE, ...springs, Spring.MAYBE, ...springs],
                [...runs, ...runs, ...runs, ...runs, ...runs]
            )
        }).map((uberSpringRow, i) => {
            console.log(i)
            return uberSpringRow.collapseWaifVuncktion()
        }).sum()
    }
}

export default class SolverDay12 extends SolverBase<SpringField> {
    static override day = 12

    prepareInput(rawInput: string): SpringField {
        return SpringField.fromString(rawInput)
    }

    solvePartOne(input: SpringField): Solvution {
        console.log(input.do())
        return new Solvution(
            'Answer goes here'
        )
    }
    
    solvePartTwo(input: SpringField): Solvution {
        console.log(input.do2())
        return new Solvution(
            'Answer goes here'
        )
    }

}
