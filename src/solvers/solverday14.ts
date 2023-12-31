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

    settle() {
        let leadIn = 0
        let hatshiTheHashmap: any = {}
        let key = this.toString()

        while(hatshiTheHashmap[key] === undefined) {
            leadIn++
            hatshiTheHashmap[key] = true
            this.cycle()
            key = this.toString()
        }

        // console.log(`Found repetition after ${leadIn}...`)

        let loopLength = 0
        const loopStartState = key
        let theOtherOne: string

        do {
            this.cycle()
            theOtherOne = this.toString()
            loopLength++
        } while(loopStartState !== theOtherOne) // Please be fast ;P
        
        
        const ONE_TRILLION_DOLLARS = 1_000_000_000
        let remainder = (ONE_TRILLION_DOLLARS - leadIn) % loopLength
        
        // console.log(`found loop length: ${loopLength}...`)
        // console.log(`doing it ${remainder} more times...`)

        for(; remainder > 0; remainder--) {
            this.cycle()
        }
    }
    
    cycle() {
        this.northify()
        this.westify()
        this.southify()
        this.eastify()    
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

    southify() {
        const newRocks = this.rocks.map((row) => [...row])
        const xx = newRocks.reduceRight((nextRocks: Rock[][], row: Rock[], i: number) => {
            row.forEach((rock, j) => {
                if(rock === Rock.ROUND) {
                    let targetPosition = i
                    while(targetPosition < (nextRocks.length - 1) && nextRocks[targetPosition + 1][j] === Rock.NONEXISTENT) {
                        targetPosition++
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

    eastify() {
        const newRocks = this.rocks.map((row) => [...row])
        const xx = newRocks.reduce((nextRocks: Rock[][], row: Rock[], i: number) => {
            nextRocks[i] = row.reduceRight((nextRow: Rock[], rock: Rock, j: number): Rock[] => {
                if(rock === Rock.ROUND) {
                    let targetPosition = j
                    while(targetPosition < (nextRow.length - 1) && nextRow[targetPosition + 1] === Rock.NONEXISTENT) {
                        targetPosition++
                    }
                    nextRow[j] = Rock.NONEXISTENT
                    nextRow[targetPosition] = Rock.ROUND
                }
                return nextRow
            }, nextRocks[i])
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
        return new Solvution(
            input.calculateLoad(),
            'What a brilliant idea! Putting all the load on the damaged north side results in it bearing $$ load units.'
        )
    }
    
    solvePartTwo(input: Plattform): Solvution {
        /*console.log(input.toString())
        console.log()
        input.northify()
        console.log(input.toString())
        console.log()
        input.westify()
        console.log(input.toString())
        console.log()
        input.southify()
        console.log(input.toString())
        console.log()
        input.eastify()
        console.log(input.toString())
        console.log()*/
        input.settle()

        return new Solvution(
            input.calculateLoad(),
            '_One eternety lateur..._ The load after One Trillion Cycles is $$.'
        )
    }

}
        