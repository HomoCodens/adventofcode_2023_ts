import SolverBase, { Solvution } from './solverbase'
import Point from '@mapbox/point-geometry'

// NOT happy with the way this is right now.
enum Orientation {
    NIL,
    HORIZONTAL,
    VERTICAL,
    WTON,
    NTOE,
    ETOS,
    STOW,
}

enum RelativePosition {
    NOTADJACENT,
    WEST,
    NORTH,
    EAST,
    SOUTH,
}

const Offgrid = new Point(-1, -1)
const Up = new Point(0, -1)
const Down = new Point(0, 1)
const Left = new Point(-1, 0)
const Right = new Point(1, 0)

abstract class Pipe {
    position: Point
    orientation: Orientation

    get x(): number {
        return this.position.x
    }

    get y(): number {
        return this.position.y
    }
    
    constructor(orientation: Orientation, position: Point) {
        this.orientation = orientation
        this.position = position
    }

    static fromString(pipe: string, position: Point): Pipe {
        switch(pipe) {
            case '-':
                return new Straight(Orientation.HORIZONTAL, position)
            case '|':
                return new Straight(Orientation.VERTICAL, position)
            case 'J':
                return new Bend(Orientation.WTON, position)
            case 'L':
                return new Bend(Orientation.NTOE, position)
            case 'F':
                return new Bend(Orientation.ETOS, position)
            case '7':
                return new Bend(Orientation.STOW, position)
            default:
                return new DeadEnd(Orientation.NIL, position)
        }
    }

    abstract scurryFrom(origin: Pipe): Point
    abstract connectsTo(origin: RelativePosition): boolean
    abstract toString(): string

    toHash(): string {
        return `${this.x}|${this.y}`
    }

    relativePositionTo(other: Pipe): RelativePosition {
        const pStar = other.position.sub(this.position)

        if(pStar.mag() > 1) {
            return RelativePosition.NOTADJACENT
        }

        if(pStar.x === -1) {
            return RelativePosition.WEST
        }

        if(pStar.x === 1) {
            return RelativePosition.EAST
        }

        if(pStar.y === -1) {
            return RelativePosition.NORTH
        }

        return RelativePosition.SOUTH
    }

    positionAt(direction: RelativePosition): Point {
        switch(direction) {
            case RelativePosition.WEST:
                return this.position.add(Left)
            case RelativePosition.NORTH:
                return this.position.add(Up)
            case RelativePosition.EAST:
                return this.position.add(Right)
            case RelativePosition.SOUTH:
                return this.position.add(Down)
            default:
                return Offgrid
        }
    }
}

class Straight extends Pipe {
    connectsTo(origin: RelativePosition): boolean {
        switch(this.orientation) {
            case Orientation.HORIZONTAL:
                return origin === RelativePosition.WEST || origin === RelativePosition.EAST
            case Orientation.VERTICAL:
                return origin === RelativePosition.NORTH || origin === RelativePosition.SOUTH
        }

        return false
    }

    scurryFrom(origin: Pipe): Point {
        const relativePos = this.relativePositionTo(origin)

        if(this.orientation === Orientation.HORIZONTAL) {
            switch(relativePos) {
                case RelativePosition.WEST:
                    return this.positionAt(RelativePosition.EAST)
                case RelativePosition.EAST:
                    return this.positionAt(RelativePosition.WEST)
            }            
        } else {
            switch(relativePos) {
                case RelativePosition.NORTH:
                    return this.positionAt(RelativePosition.SOUTH)
                case RelativePosition.SOUTH:
                    return this.positionAt(RelativePosition.NORTH)
            }
        }

        return this.position
    }
    
    toString(): string {
        return this.orientation === Orientation.HORIZONTAL ? '━' : '┃'
    }
}

class Bend extends Pipe {
    connectsTo(origin: RelativePosition): boolean {
        switch(this.orientation) {
            case Orientation.WTON:
                return origin === RelativePosition.WEST || origin === RelativePosition.NORTH
            case Orientation.NTOE:
                return origin === RelativePosition.NORTH || origin === RelativePosition.EAST
            case Orientation.ETOS:
                return origin === RelativePosition.EAST || origin === RelativePosition.SOUTH
            case Orientation.STOW:
                return origin === RelativePosition.SOUTH || origin === RelativePosition.WEST
        }

        return false
    }

    scurryFrom(origin: Pipe): Point {
        const relativePos = this.relativePositionTo(origin)

        switch(this.orientation) {
            case Orientation.WTON:
                if(relativePos === RelativePosition.WEST) {
                    return this.positionAt(RelativePosition.NORTH)
                } else if(relativePos === RelativePosition.NORTH) {
                    return this.positionAt(RelativePosition.WEST)
                }
            case Orientation.NTOE:
                if(relativePos === RelativePosition.NORTH) {
                    return this.positionAt(RelativePosition.EAST)
                } else if(relativePos === RelativePosition.EAST) {
                    return this.positionAt(RelativePosition.NORTH)
                }
            case Orientation.ETOS:
                if(relativePos === RelativePosition.EAST) {
                    return this.positionAt(RelativePosition.SOUTH)
                } else if(relativePos === RelativePosition.SOUTH) {
                    return this.positionAt(RelativePosition.EAST)
                }
            case Orientation.STOW:
                if(relativePos === RelativePosition.SOUTH) {
                    return this.positionAt(RelativePosition.WEST)
                } else if(relativePos === RelativePosition.WEST) {
                    return this.positionAt(RelativePosition.SOUTH)
                }
        }

        return this.position
    }

    toString(): string {
        switch(this.orientation) {
            case Orientation.WTON:
                return '┛'
            case Orientation.NTOE:
                return '┗'
            case Orientation.ETOS:
                return '┏'
            case Orientation.STOW:
                return '┓'
        }
        return ' '
    }
}

class DeadEnd extends Pipe {
    connectsTo(origin: RelativePosition): boolean {
        return false
    }
    
    scurryFrom(origin: Pipe): Point {
        return origin.position
    }

    toString(): string {
        return ' '
    }
}

class Maze {
    pipes: Pipe[][] = []
    start: Point

    get width() {
        return this.pipes[0] ? this.pipes[0].length : 0
    }

    get height() {
        return this.pipes.length
    }

    private constructor(pipes: Pipe[][], start: Point) {
        this.pipes = pipes
        this.start = start

        // Figure out starting pipe
        const startPipe = this.getPipeAt(start)
        
        const neighbourLeft = this.getPipeAt(startPipe!.positionAt(RelativePosition.WEST))
        const neighbourUp = this.getPipeAt(startPipe!.positionAt(RelativePosition.NORTH))
        const neighbourRight = this.getPipeAt(startPipe!.positionAt(RelativePosition.EAST))
        const neighbourBelow = this.getPipeAt(startPipe!.positionAt(RelativePosition.SOUTH))

        if(neighbourLeft && neighbourRight && neighbourLeft.connectsTo(RelativePosition.EAST) && neighbourRight.connectsTo(RelativePosition.WEST)) {
            this.pipes[start.y][start.x] = new Straight(Orientation.HORIZONTAL, start)
        }

        if(neighbourUp && neighbourBelow && neighbourUp.connectsTo(RelativePosition.SOUTH) && neighbourBelow.connectsTo(RelativePosition.NORTH)) {
            this.pipes[start.y][start.x] = new Straight(Orientation.VERTICAL, start)
        }

        if(neighbourLeft && neighbourUp && neighbourLeft.connectsTo(RelativePosition.EAST) && neighbourUp.connectsTo(RelativePosition.SOUTH)) {
            this.pipes[start.y][start.x] = new Bend(Orientation.WTON, start)
        }

        if(neighbourUp && neighbourRight && neighbourUp.connectsTo(RelativePosition.SOUTH) && neighbourRight.connectsTo(RelativePosition.WEST)) {
            this.pipes[start.y][start.x] = new Bend(Orientation.NTOE, start)
        }

        if(neighbourRight && neighbourBelow && neighbourRight.connectsTo(RelativePosition.WEST) && neighbourBelow.connectsTo(RelativePosition.NORTH)) {
            this.pipes[start.y][start.x] = new Bend(Orientation.ETOS, start)
        }

        if(neighbourBelow && neighbourLeft && neighbourBelow.connectsTo(RelativePosition.NORTH) && neighbourLeft.connectsTo(RelativePosition.EAST)) {
            this.pipes[start.y][start.x] = new Bend(Orientation.STOW, start)
        }
    }

    static fromString(def: string): Maze {
        let start: Point

        const pipes = def.lines().map((line, row) => {
            return line.split('').map((char, col) => {
                if(char === 'S') {
                    start = new Point(col, row)
                }

                return Pipe.fromString(char, new Point(col, row))
            })
        })

        return new Maze(pipes, start!)
    }

    toChars(): string[][] {
        return this.pipes.map((line) => {
            return line.map((pipe) => {
                if(pipe.position.equals(this.start)) {
                    return 'S'
                }

                return pipe.toString()
            })
        })
    }

    toString(): string {
        return this.toChars().map((row) => row.join('')).join('\n')
    }

    getPipeAt(pos: Point): Pipe {
        return this.pipes[pos.y][pos.x]
    }

    getStartPipe(): Pipe {
        return this.getPipeAt(this.start)
    }

    getPipesOnPath(): { [k: string]: Pipe } {
        let path: any = {}

        const startPipe = this.getStartPipe()
        let currentPipe = startPipe
        
        // Try neighbouring pipes until one connects
        let nextPipe = this.getPipeAt(currentPipe.positionAt(RelativePosition.NORTH))
        
        if(!nextPipe.connectsTo(nextPipe.relativePositionTo(currentPipe))) {
            nextPipe = this.getPipeAt(currentPipe.positionAt(RelativePosition.EAST))
        }

        if(!nextPipe.connectsTo(nextPipe.relativePositionTo(currentPipe))) {
            nextPipe = this.getPipeAt(currentPipe.positionAt(RelativePosition.SOUTH))
        }

        // By now one of them HAS to connect
        path[startPipe.toHash()] = true

        while(!(nextPipe.position.equals(startPipe.position))) {
            path[nextPipe.toHash()] = true
            const target = this.getPipeAt(nextPipe!.scurryFrom(currentPipe))
            currentPipe = nextPipe
            nextPipe = target
        }

        return path
    }
}

export default class SolverDay10 extends SolverBase<Maze> {
    static override day = 10

    prepareInput(rawInput: string): Maze {
        return Maze.fromString(rawInput)
    }

    solvePartOne(input: Maze): Solvution {
        const path = input.getPipesOnPath()

        return new Solvution(
            Math.floor(Object.keys(path).length / 2),
            'Yon critter will have to take $$ steps to get to the farthest bit.'
        )
    }
    
    solvePartTwo(input: Maze): Solvution {
        const path = input.getPipesOnPath()

        const innieOuties = input.pipes.map((line) => {
            return line.map((pipe) => {
                if(path[pipe.toHash()]) {
                    return ' '
                }
                
                return this.isInside(path, pipe, input)? 'I' : 'O'
            })
        })

        let chars = input.toChars()
        innieOuties.forEach((line, row) => {
            line.forEach((pipe, col) => {
                if(pipe !== ' ') {
                    chars[row][col] = pipe
                } 
            })
        })

        return new Solvution(
            innieOuties.flat().reduce((acc, x) => acc + (x === 'I' ? 1 : 0), 0),
            'Snap! It could also be hiding in $$ other locations...'
        )
    }

    isInside(path: any, pipe: Pipe, maze: Maze): boolean {
        let nCrossings = 0

        if(path[pipe.toHash()]) {
            return false
        }
        
        let edgeEntryOrientation = Orientation.NIL

        // Cast a ray eastward and count how often we cross the boundary
        for(let i = pipe.position.x + 1; i < maze.width; i++) {
            const currentPipe = maze.getPipeAt(new Point(i, pipe.y))
            const onPath = path[currentPipe.toHash()]
            if(onPath) {
                if(currentPipe.orientation === Orientation.VERTICAL) {
                    nCrossings++
                } else if(edgeEntryOrientation === Orientation.NIL) {
                    edgeEntryOrientation = currentPipe.orientation
                } else {
                    // edgeEntryOrientation can only ever be NTOE or ETOS as if we had started on the edge we would
                    // not get to this point
                    if(edgeEntryOrientation === Orientation.NTOE && currentPipe.orientation === Orientation.STOW ||
                        edgeEntryOrientation === Orientation.ETOS && currentPipe.orientation === Orientation.WTON) {
                            nCrossings++
                        }

                        if(currentPipe.orientation === Orientation.WTON ||
                            currentPipe.orientation === Orientation.NTOE ||
                            currentPipe.orientation === Orientation.ETOS ||
                            currentPipe.orientation === Orientation.STOW) {
                            edgeEntryOrientation = Orientation.NIL
                        }
                }
            }
        }

        return nCrossings % 2 === 1
    }
}
