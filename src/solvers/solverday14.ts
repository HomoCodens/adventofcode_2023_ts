import { join } from 'path'
import SolverBase, { Solvution } from './solverbase'

enum Rock {
    ROUND = 'O',
    SQUARE = '#',
    NONEXISTENT = '.'
}

class Plattform {
    rocks: Rock[][]

    constructor(rocks: Rock[][]) {
        this.rocks = rocks
    }

    static fromString(def: string) {
        return new Plattform(
            def.lines().map((line) => {
                return line.csv('', (char) => char)
            })
        )
    }

    toString() {
        return this.rocks.map((row) => row.join('')).join('\n')
    }

    northify() {
        const newRocks = this.rocks.map((row) => [...row])
        const xx = newRocks.reduce((nextRocks: Rock[][], row: Rock[], i: number) => {
            row.forEach((rock, j) => {
                if(rock === Rock.ROUND) {
                    let targetPosition = i
                    while(targetPosition > 0 && nextRocks[targetPosition - 1][j] === Rock.NONEXISTENT) {
                        targetPosition--
                    }
                    nextRocks[i][j] = Rock.NONEXISTENT
                    nextRocks[targetPosition][j] = Rock.ROUND
                }
            })
            return nextRocks
        }, newRocks)

        this.rocks = xx
    }

    westify() {
        const newRocks = this.rocks.map((row) => [...row])
        const xx = newRocks.reduce((nextRocks: Rock[][], row: Rock[], i: number) => {
            row.forEach((rock, j) => {
                if(rock === Rock.ROUND) {
                    let targetPosition = j
                    while(targetPosition > 0 && nextRocks[i][targetPosition - 1] === Rock.NONEXISTENT) {
                        targetPosition--
                    }
                    nextRocks[i][j] = Rock.NONEXISTENT
                    nextRocks[i][targetPosition] = Rock.ROUND
                }
            })
            return nextRocks
        }, newRocks)

        this.rocks = xx
    }

    calculateLoad(): number {
        return this.rocks.map((row, i) => (this.rocks.length - i)*row.filter((rock) => rock === Rock.ROUND).length).sum()
    }
}

export default class SolverDay14 extends SolverBase<Plattform> {
    static override day = 14

    prepareInput(rawInput: string): Plattform {
        return Plattform.fromString(rawInput)
    }

    solvePartOne(input: Plattform): Solvution {
        input.northify()
        console.log(input.toString())
        return new Solvution(
            input.calculateLoad()
        )
    }
    
    solvePartTwo(input: Plattform): Solvution {
        console.log()
        input.westify()
        console.log(input.toString())
        return new Solvution(
            'Answer goes here'
        )
    }

}
        