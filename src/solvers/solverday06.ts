import SolverBase, { Solvution } from './solverbase'

class Race {
    length: number
    record: number

    constructor(length: number, record: number) {
        this.length = length
        this.record = record
    }

    getNumberOfWaysToWin(): number {
        // TODO: Better idea for later
        //       solve for global max and threshold(s?) and count analytically
        return (new Array(this.length)).fill(0).map((_, i) => i)
                .filter((tPush) => (this.length - tPush)*tPush > this.record).length
    }
}

export default class SolverDay06 extends SolverBase<Race[]> {
    static override day = 6

    prepareInput(rawInput: string): Race[] {
        const [lengths, records, ..._]: number[][] = rawInput.lines().map((line) => line.csvNumbers(' ', /^\w+:/))

        return lengths.map((length, i) => new Race(length, records[i]))
    }

    solvePartOne(input: Race[]): Solvution {
        return new Solvution(
            input.map((race) => race.getNumberOfWaysToWin()).prod(),
        )
    }
    
    solvePartTwo(input: Race[]): Solvution {
        const actualRace = new Race(
            Number(input.reduce((acc, x) => acc + x.length, '')),
            Number(input.reduce((acc, x) => acc + x.record, '')),
        )
        return new Solvution(
            actualRace.getNumberOfWaysToWin(),
        )
    }

}
        