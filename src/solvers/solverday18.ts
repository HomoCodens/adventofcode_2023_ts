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
    kleur: string
}

// It's digging a hole (diggy diggy hole) and then painting it
class ArtsyDwarf {
    innerDwarf?: ArtsyDwarf = undefined

    constructor(public direction: Direction, public distance: number, public color: string = '') {
        if(color !== '') {
            const innerDirections = {
                '0': Direction.EAST,
                '1': Direction.SOUTH,
                '2': Direction.WEST,
                '3': Direction.NORTH,
            } as any

            const { hexDistance, hexDirection } = /^#(?<hexDistance>.{5})(?<hexDirection>.)$/.exec(color.trim())?.groups!
            this.innerDwarf = new ArtsyDwarf(innerDirections[hexDirection], Number.parseInt('0x' + hexDistance))
        }
    }

    static fromString(def: string) {
        // R 11 (#4026e0)
        const { dir, dist, clr } = /^(?<dir>[URDL]) (?<dist>\d+) \((?<clr>.*?)\)$/.exec(def.trim())?.groups!
        return new ArtsyDwarf(dir as Direction, +dist, clr)
    }

    dig(startLocation: Point): Hole[] {
        const vector = this.getDirectionVector()
        let holes: Hole[] = []
        for(let i = 0; i < this.distance; i++) {
            const distTravelled = i + 1
            holes.push({
                x: startLocation.x + distTravelled*vector.x,
                y: startLocation.y + distTravelled*vector.y,
                kleur: this.color
            })
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

class LavaductLagoon {
    map: string[][]

    get width() {
        return this.map[0].length
    }

    get height() {
        return this.map.length
    }

    get voloom() {
        return this.map.flatMap((row) => row.map((hole) => hole === '#' ? 1 : 0)).sum()
    }

    constructor(dwarves: ArtsyDwarf[], innerDwarf: boolean = false) {
        const holes = dwarves.reduce((state: { holes: Hole[], location: Point }, dwarf: ArtsyDwarf, i, alldem) => {
            console.log(`now digging: ${i} / ${alldem.length}`)
            const newHoles = innerDwarf ? dwarf.innerDwarf!.dig(state.location) : dwarf.dig(state.location)
            const endHole = newHoles[newHoles.length - 1]
            return {
                holes: [...state.holes, ...newHoles],
                location: new Point(endHole.x, endHole.y)
            }
        }, { holes: [], location: new Point(0, 0)}).holes

        const { xMin, xMax, yMin, yMax } = holes.reduce(({ xMin, xMax, yMin, yMax }, { x, y }) => {
            return {
                xMin: x < xMin ? x : xMin,
                xMax: x > xMax ? x : xMax,
                yMin: y < yMin ? y : yMin,
                yMax: y > yMax ? y : yMax,
            }
        }, {
            xMin: Infinity,
            xMax: -Infinity,
            yMin: Infinity,
            yMax: -Infinity
        })

        const width = xMax - xMin + 1
        const height = yMax - yMin + 1

        console.log(`am ${width} wide, ${height} high and have ${holes.length} starting holes. *burp*`)
        this.map = new Array(height).fill(0).map((row) => new Array(width).fill('.'))

        holes.forEach(({ x, y }) => this.map[y - yMin][x - xMin] = '#')
    }

    toString(): string {
        return this.map.twoString()
    }

    fill(): void {
        let edgeX = 0
        while(this.map[0][edgeX] === '.') {
            edgeX++
        }

        let edge: Location2D[] = [{x: edgeX + 1, y: 1}]

        while(edge.length) {
            let nextEdge = new Map<string, Location2D>()
            for(let {x, y} of edge) {
                this.map[y][x] = '#'
    
                if(x > 0 && this.map[y][x - 1] === '.') {
                    nextEdge.set(`${x - 1}:${y}`, { x: x - 1, y })
                }
    
                if(x < this.width - 1 && this.map[y][x + 1] === '.') {
                    nextEdge.set(`${x + 1}:${y}`, { x: x + 1, y })
                }
    
                if(y > 0 && this.map[y - 1][x] === '.') {
                    nextEdge.set(`${x}:${y - 1}`, { x, y: y - 1 })
                }
    
                if(y < this.height && this.map[y + 1][x] === '.') {
                    nextEdge.set(`${x}:${y + 1}`, { x, y: y + 1 })
                }
            }
            edge = Array.from(nextEdge.values())
        }
    }
}

export default class SolverDay18 extends SolverBase<ArtsyDwarf[]> {
    static override day = 18

    prepareInput(rawInput: string): ArtsyDwarf[] {
        return rawInput.lines().map(ArtsyDwarf.fromString)
    }

    solvePartOne(input: ArtsyDwarf[]): Solvution {
        /*console.log(input)
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
        }*/

        const lagoon = new LavaductLagoon(input)
        lagoon.fill()

        return new Solvution(
            lagoon.voloom
        )
    }
    
    solvePartTwo(input: ArtsyDwarf[]): Solvution {
        console.log(input)
        const lagoooon = new LavaductLagoon(input, true)
        lagoooon.fill()
        return new Solvution(
            lagoooon.voloom
        )
    }

}
