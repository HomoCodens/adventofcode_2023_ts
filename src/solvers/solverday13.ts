import SolverBase, { Solvution } from './solverbase'

enum Ground {
    ROCK = '#',
    ASH = '.',
}

class RockPattern {
    tiles: Ground[][]

    constructor(tiles: Ground[][]) {
        this.tiles = tiles
    }

    static fromString(def: string) {
        return new RockPattern(
            def.lines().map((line) => line.csv('', (char) => char === '.' ? Ground.ASH : Ground.ROCK))
        )
    }

    toString() {
        return this.tiles.map((line) => line.map((tile) => tile === Ground.ASH ? '.' : '#').join('')).join('\n') + '\n'
    }

    findHorizontalMirrorage(): number {
        for(let eenieBetweenie = 0; eenieBetweenie < this.tiles.length; eenieBetweenie++) {
            if(this.isHorizontallyMirroredAt(eenieBetweenie)) {
                return 100*(eenieBetweenie + 1)
            }
        }

        return 0
    }

    isHorizontallyMirroredAt(split: number): boolean {
        if(split === this.tiles.length - 1) {
            return false
        }

        let upwardFront = split
        let downwardFront = split + 1

        while(upwardFront >= 0 && downwardFront < this.tiles.length) {
            if(!this.compareStrips(this.tiles[upwardFront], this.tiles[downwardFront])) {
                return false
            }
            upwardFront--
            downwardFront++
        }

        return true
    }

    findVerticalMirrorage(): number {
        for(let eenieBetweenie = 0; eenieBetweenie < this.tiles[0].length; eenieBetweenie++) {
            if(this.isVerticallyMirroredAt(eenieBetweenie)) {
                return eenieBetweenie + 1
            }
        }

        return 0
    }

    isVerticallyMirroredAt(split: number): boolean {
        if(split === this.tiles[0].length - 1) {
            return false
        }

        let leftwardFront = split
        let rightwardFront = split + 1

        while(leftwardFront >= 0 && rightwardFront < this.tiles[0].length) {
            if(!this.compareStrips(this.tiles.map((row) => row[leftwardFront]), this.tiles.map((row) => row[rightwardFront]))) {
                return false
            }
            leftwardFront--
            rightwardFront++
        }

        return true
    }

    compareStrips(a: Ground[], b: Ground[]): boolean {
        return a.length === b.length && a.every((aa, i) => aa === b[i])
    }
}

export default class SolverDay13 extends SolverBase<RockPattern[]> {
    static override day = 13

    prepareInput(rawInput: string): RockPattern[] {
        return rawInput.lines('\n\n').map((pattern) => RockPattern.fromString(pattern))
    }

    solvePartOne(input: RockPattern[]): Solvution {
        return new Solvution(
            input.map((pattern) => pattern.findHorizontalMirrorage() + pattern.findVerticalMirrorage()).sum()
        )
    }
    
    solvePartTwo(input: RockPattern[]): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

}
        