import Point from '@mapbox/point-geometry'
import SolverBase, { Solvution } from './solverbase'

enum Direction {
    NORTH = '^',
    EAST = '>',
    SOUTH = 'v',
    WEST = '<',
}

enum MirrorDirection {
    FORWARD = '/',
    BACKWARD = '\\',
}

enum SplitterDirection {
    HORIZONTAL = '-',
    VERTICAL = '|',
}

abstract class Tile {
    symbol: string = '.'

    constructor() {}

    directionsVisitedIn: Set<Direction> = new Set()

    get enerjized() {
        return this.directionsVisitedIn.size > 0
    }

    static fromString(x: number, y: number, def: string): Tile {
        switch(def) {
            case '/':
                return  new Mirror(MirrorDirection.FORWARD)
            case '\\':
                return new Mirror(MirrorDirection.BACKWARD)
            case '-':
                return new Splitter(SplitterDirection.HORIZONTAL)
            case '|':
                return new Splitter(SplitterDirection.VERTICAL)
        }

        return new OpenSpace()
    }

    toString(): string {
        const nDirections = this.directionsVisitedIn.size
        if(nDirections === 1) {
            return [...this.directionsVisitedIn][0]
        }

        return nDirections === 0 ? this.symbol : nDirections.toString()
    }

    clone(): Tile {
        const cloney = this.derivedClone() // smell that? it smells like a smell
        cloney.directionsVisitedIn = new Set([...this.directionsVisitedIn])
        return cloney
    }
    protected abstract reallyActNow(beam: Beam): Beam[]
    protected abstract derivedClone(): Tile

    actOnBeam(beam: Beam): Beam[] {
        if(this.directionsVisitedIn.has(beam.direction)) {
            beam.active = false
            return [beam]
        }

        this.directionsVisitedIn.add(beam.direction)
        return this.reallyActNow(beam)
    }
}

class Mirror extends Tile {
    constructor(public facing: MirrorDirection) {
        super() // swell, fantabulous...!
        this.symbol = facing
    }

    reallyActNow(beam: Beam): Beam[] {
        switch(this.facing) {
            case MirrorDirection.FORWARD:
                return [beam.rotateCcw()]
            case MirrorDirection.BACKWARD:
                return [beam.rotateCw()]
        }
    }

    override toString(printElements: boolean = true): string {
        if(printElements) {
            return this.facing
        } else {
            return super.toString()
        }
    }

    override derivedClone(): Tile {
        return new Mirror(this.facing)
    }
}

class Splitter extends Tile {
    constructor(public facing: SplitterDirection) {
        super()
        this.symbol = facing
    }

    reallyActNow(beam: Beam): Beam[] {
        if((this.facing === SplitterDirection.HORIZONTAL && beam.isMovingVertically()) ||
            (this.facing === SplitterDirection.VERTICAL && beam.isMovingHorizontally())) {
            return [beam.rotateCcw(), beam.rotateCw()]
        } else {
            return [beam]
        }
    }

    override toString(printElements: boolean = true): string {
        return printElements ? this.facing : super.toString()
    }

    override derivedClone(): Tile {
        return new Splitter(this.facing)
    }
}

class OpenSpace extends Tile {
    reallyActNow(beam: Beam): Beam[] {
        return [beam]
    }

    override derivedClone(): Tile {
        return new OpenSpace()
    }
}

class Beam {
    active = true

    get x(): number {
        return this.position.x
    }

    get y(): number {
        return this.position.y
    }

    get velocity(): Point {
        switch(this.direction) {
            case Direction.NORTH:
                return new Point(0, -1)
            case Direction.EAST:
                return new Point(1, 0)
            case Direction.SOUTH:
                return new Point(0, 1)
            case Direction.WEST:
                return new Point(-1, 0)
        }
    }

    constructor(public position: Point, public direction: Direction) { }

    step(verld: Tile[][]): Beam[] {
        if(this.offGrid(verld.length, verld[0].length)) {
            this.active = false
            return [this]
        }

        const newBeams = verld[this.y][this.x].actOnBeam(this)
        newBeams.forEach((nb) => nb.moof())
        return newBeams
    }
    
    moof() {
        this.position = this.position.add(this.velocity)
    }

    offGrid(height: number, width: number): boolean {
        return this.x < 0 || this.x >= width || this.y < 0 || this.y >= height
    }

    isMovingVertically(): boolean {
        return this.direction === Direction.NORTH || this.direction === Direction.SOUTH
    }

    isMovingHorizontally(): boolean {
        return this.direction === Direction.EAST || this.direction === Direction.WEST
    }

    rotateCw(): Beam {
        const clone = this.clone()
        switch(clone.direction) {
            case Direction.NORTH:
                clone.direction = Direction.WEST
                break
            case Direction.EAST:
                clone.direction = Direction.SOUTH
                break
            case Direction.SOUTH:
                clone.direction = Direction.EAST
                break
            case Direction.WEST:
                clone.direction = Direction.NORTH
                break
        }
        return clone
    }

    rotateCcw(): Beam {
        const clone = this.clone()
        switch(clone.direction) {
            case Direction.NORTH:
                clone.direction = Direction.EAST
                break
            case Direction.EAST:
                clone.direction = Direction.NORTH
                break
            case Direction.SOUTH:
                clone.direction = Direction.WEST
                break
            case Direction.WEST:
                clone.direction = Direction.SOUTH
                break
        }
        return clone
    }

    clone(): Beam {
        return new Beam(
            this.position.clone(),
            this.direction
        )
    }
}

export default class SolverDay16 extends SolverBase<Tile[][]> {
    static override day = 16

    prepareInput(rawInput: string): Tile[][] {
        return rawInput.lines().map((line, row) => line.csv('', (char, col) => Tile.fromString(col, row, char)))
    }

    solvePartOne(input: Tile[][]): Solvution {
        const resoelt = this.runWith(new Beam(new Point(0, 0), Direction.EAST), input)
        return new Solvution(
            this.countEnergies(resoelt),
            'Run, Beamo, run! You will touch $$ tiles.'
        )
    }
    
    solvePartTwo(input: Tile[][]): Solvution {
        // let bestest = this.countEnergies(this.runWith(new Beam(new Point(3, 0), Direction.SOUTH), input))
        
        let bestest = 0
        const width = input[0].length
        const height = input.length
        for(let i = 0; i < width; i++) {
            const downBeam = new Beam(new Point(i, 0), Direction.SOUTH)
            const downScore = this.countEnergies(this.runWith(downBeam, input))

            if(downScore > bestest) {
                bestest = downScore
                // console.log(`got a new bestest, moving ${downBeam.direction} from (${i} - 0): ${bestest}`)
            }

            const upBeam = new Beam(new Point(i, height), Direction.NORTH)
            const upScore = this.countEnergies(this.runWith(upBeam, input))
            if(upScore > bestest) {
                bestest = downScore
                // console.log(`got a new bestest, moving ${upBeam.direction} from (${i} - ${height}): ${bestest}`)
            }
        }

        for(let i = 0; i < height; i++) {
            const rightBeam = new Beam(new Point(0, i), Direction.EAST)
            const rightScore = this.countEnergies(this.runWith(rightBeam, input))

            if(rightScore > bestest) {
                bestest = rightScore
                // console.log(`got a new bestest, moving ${rightBeam.direction} from (0 - ${i}): ${bestest}`)
            }

            const leftBeam = new Beam(new Point(i, height), Direction.WEST)
            const leftScore = this.countEnergies(this.runWith(leftBeam, input))
            if(leftScore > bestest) {
                bestest = leftScore
                // console.log(`got a new bestest, moving ${leftBeam.direction} from (${width} - ${i}): ${bestest}`)
            }
        }

        return new Solvution(
            bestest,
            'Welp, you should have entered somewhere else. Best we could have done is $$.'
        )
    }

    runWith(beam: Beam, input: Tile[][]): Tile[][] {
        const myVerld = this.cloneInput(input)
        let meBeams = [beam]

        // let i = 0
        while(meBeams.length > 0) {
            // i++
            // console.log(`\n\n=================\nRound ${i+1}\n=================\n`)
            meBeams = meBeams.flatMap((b) => b.step(myVerld)).filter((b) => b.active)
            // console.log(input.twoString())
            // console.log(`Round ${i}, ${meBeams.length} active beams`)
        }
        return myVerld
    }

    countEnergies(tiles: Tile[][]): number {
        return tiles.flatMap((row) => row.map((t) => t.enerjized ? 1 : 0)).sum()
    }

    cloneInput(input: Tile[][]): Tile[][] {
        return input.map((row) => row.map((tile) => tile.clone()))
    }
}
        