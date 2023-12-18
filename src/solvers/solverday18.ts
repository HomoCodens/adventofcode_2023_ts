import Point from '@mapbox/point-geometry'
import SolverBase, { Solvution } from './solverbase'

enum Direction {
    NORTH = 'U',
    EAST = 'R',
    SOUTH = 'D',
    WEST = 'L',
}

type Hole = {
    x: number
    y: number
}

// It's digging a hole (diggy diggy hole) and then painting it
class ArtsyDwarf {
    constructor(public direction: Direction, public distance: number, public color: string) {}

    static fromString(def: string) {
        // R 11 (#4026e0)
        const { dir, dist, clr } = /^(?<dir>[URDL]) (?<dist>\d+) \((?<clr>.*?)\)$/.exec(def.trim())?.groups!
        return new ArtsyDwarf(dir as Direction, +dist, clr)
    }

    dig(startLocation: Point): Hole[] {
        const vector = this.getDirectionVector()
        let holes: Hole[] = []
        for(let i = 0; i < this.distance; i++) {
            const distTravelled = i+1
            holes.push({ x: startLocation.x + distTravelled*vector.x, y: startLocation.y + distTravelled*vector.y })
        }
        return holes
    }

    private getDirectionVector() {
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
}

export default class SolverDay18 extends SolverBase<ArtsyDwarf[]> {
    static override day = 18

    prepareInput(rawInput: string): ArtsyDwarf[] {
        return rawInput.lines().map(ArtsyDwarf.fromString)
    }

    solvePartOne(input: ArtsyDwarf[]): Solvution {
        console.log(input)
        const holes = input.reduce((state: { holes: Hole[], location: Point }, dwarf: ArtsyDwarf) => {
            const newHoles = dwarf.dig(state.location)
            const endHole = newHoles[newHoles.length - 1]
            return {
                holes: [...state.holes, ...newHoles],
                location: new Point(endHole.x, endHole.y)
            }
        }, { holes: [], location: new Point(0, 0)}).holes
        holes.sort((a, b) => {
            const yDiff = a.y - b.y
            return yDiff !== 0 ? yDiff : a.x - b.x
        })
        console.log(holes)

        let voloom = 0
        for(let i = 0; i < holes.length;) {
            const hole = holes[i]
            const nextHole = holes[i + 1]
            if(nextHole) {
                if(nextHole.y === hole.y) {
                    if(nextHole.x - hole.x === 1) {
                        // horizontal edge
                        let edgeHole = hole
                        let nextEdgeHole = nextHole
                        i++
                        voloom++
                        while(nextEdgeHole && nextEdgeHole.y === edgeHole.y && nextEdgeHole.x - edgeHole.x === 1) {
                            i++
                            edgeHole = nextEdgeHole
                            nextEdgeHole = holes[i]
                            voloom++
                        }
                        if(edgeHole.y === nextEdgeHole.y) {
                            i++
                        }
                    } else {
                        // gap between a left and a right edge
                        voloom += nextHole.x - hole.x + 1
                        i += 2
                    }
                }
            }
        }

        return new Solvution(
            voloom
        )
    }
    
    solvePartTwo(input: ArtsyDwarf[]): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

}
