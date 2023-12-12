import SolverBase, { Solvution } from './solverbase'

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

    set(index: number, what: Spring): SpringRow {
        return new SpringRow(
            [...this.springs].splice(index, 1, what),
            [...this.runs]
        )
    }

    // no, not having a stroke, just... fun?
    // Also could almost be a password. xD
    collapseWaifVuncktion() {

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
}

export default class SolverDay12 extends SolverBase<SpringField> {
    static override day = 12

    prepareInput(rawInput: string): SpringField {
        return SpringField.fromString(rawInput)
    }

    solvePartOne(input: SpringField): Solvution {
        console.log(JSON.stringify(input, null, 2))
        return new Solvution(
            'Answer goes here'
        )
    }
    
    solvePartTwo(input: SpringField): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

}
