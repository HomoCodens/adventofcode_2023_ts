import * as maffs from 'mathjs'

import SolverBase, { Solvution } from './solverbase'

class Race {
    length: number
    record: number

    constructor(length: number, record: number) {
        this.length = length
        this.record = record
    }

    getNumberOfWaysToWin(): number {
        const [lb, ub] = maffs.polynomialRoot(-this.record, this.length, -1)
        return Number(maffs.subtract(maffs.floor(ub), maffs.ceil(lb))) + 1
    }
}

export default class SolverDay06 extends SolverBase<Race[]> {
    static override day = 6

    prepareInput(rawInput: string): Race[] {
        const [lengths, records]: number[][] = rawInput.lines().map((line) => line.csvNumbers(/ +/, /^\w+:/))

        return lengths.map((length, i) => new Race(length, records[i]))
    }

    solvePartOne(input: Race[]): Solvution {
        return new Solvution(
            input.map((race) => race.getNumberOfWaysToWin()).prod(),
            'Under the assumption that there are multiple races, the solution is $$.'
        )
    }
    
    solvePartTwo(input: Race[]): Solvution {
        const actualRace = new Race(
            Number(input.reduce((acc, x) => acc + x.length, '')),
            Number(input.reduce((acc, x) => acc + x.record, '')),
        )
        return new Solvution(
            actualRace.getNumberOfWaysToWin(),
            'In the MegaGigaRace there are $$ ways to win. Taking the best of course.'
        )
    }

}
        