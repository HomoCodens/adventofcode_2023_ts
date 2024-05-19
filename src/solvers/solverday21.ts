import Point from '@mapbox/point-geometry'
import SolverBase, { Solvution } from './solverbase'

const hashPoint = (p: Point) => `${p.x};${p.y}`

class Plot {
    constructor(public visitable: boolean) {}

    static fromString(def: string): Plot {
        if(def === '#') {
            return new Plot(false)
        }

        return new Plot(true)
    }

    toString(): string {
        if(this.visitable) {
            return '.'
        } else {
            return '#'
        }
    }
}

class Garden {
    constructor(private plots: Plot[][]) {}

    get width(): number {
        return this.plots[0].length
    }

    get height(): number {
        return this.plots.length
    }

    isVisitable(location: Point): boolean {
        const { x, y } = location
        return this.plots[y] && this.plots[y][x] && this.plots[y][x].visitable
    }

    getVisitableNeighbours(point: Point): Point[] {
        const neighbours: Point[] = []

        const { x, y } = point
        const UP = new Point(x, y - 1)
        const DOWN = new Point(x, y + 1)
        const LEFT = new Point(x - 1, y)
        const RIGHT = new Point(x + 1, y)
        
        return [UP, DOWN, LEFT, RIGHT].filter((location) => this.isVisitable(location))
    }

    toString(occupiedLocations: Map<string, Point>): string {
        return this.plots.map((row, i) => {
            return row.map((plot, j) => {
                if(!plot.visitable) {
                    return '#'
                }

                const at = new Point(j, i)
                return occupiedLocations.has(hashPoint(at)) ? 'O' : '.'
            }).join('')
        }).join('\n')
    }
}

class Shwarf {
    constructor(public shwarfDom: Garden, public startingLocation: Point) {}

    static fromString(def: string): Shwarf {
        let startingLocation: Point
        const garden = def.lines().map((line, i) => {
            return line.trim().split('').map((char, j) => {
                if(char === 'S') {
                    startingLocation = new Point(j, i)
                }
                return Plot.fromString(char)
            })
        })

        return new Shwarf(new Garden(garden), startingLocation!);
    }

    toString(occupiedLocations: Map<string, Point>): string {
        return `Started at ${JSON.stringify(this.startingLocation)}\n\n` + this.shwarfDom.toString(occupiedLocations)
    }

    walk(nSteps: number): number {
        let edge: Map<string, Point> = new Map()
        edge.set(hashPoint(this.startingLocation), this.startingLocation)

        for(let step = 1; step <= nSteps; step++) {
            const nEdge = new Map<string, Point>()
            edge.forEach((plot) => {
                this.shwarfDom.getVisitableNeighbours(plot).forEach((neighbour) => {
                    nEdge.set(hashPoint(neighbour), neighbour)
                })
            })

            edge = nEdge
        }
        return edge.size
    }

    cheat(): number {
        const worldWidth = 131
        const fromFirstToEdge = 65
        const nSteps = 202300*worldWidth + fromFirstToEdge
        const nWorlds = (nSteps - fromFirstToEdge) / worldWidth
        const nTorlds = nWorlds / 2

        const nDiamondsTotal = (4*nTorlds + 1)**2
        const nDiamondsWhole = nDiamondsTotal / 2 + 0.5
        const nDiamondsSplit = nDiamondsWhole - 1

        const nDiamond65 = 4*(nTorlds**2 + nTorlds) + 1
        const nDiamond64 = 4*(nTorlds**2)
        
        const nDnomiad = nDiamondsSplit / 2

        const diamond64 = this.walk(fromFirstToEdge - 1)
        const allDem64 = this.walk(fromFirstToEdge + worldWidth)
        const dnomaid64 = allDem64 - diamond64
        
        const diamond65 = this.walk(fromFirstToEdge)
        const allDem65 = this.walk(fromFirstToEdge + worldWidth + 1)
        const dnomaid65 = allDem65 - diamond65
        
        return nDiamond64*diamond64 + nDiamond65*diamond65 + nDnomiad*(dnomaid64 + dnomaid65)
    }
}

export default class SolverDay21 extends SolverBase<Shwarf> {
    static override day = 21

    prepareInput(rawInput: string): Shwarf {
        return Shwarf.fromString(rawInput)
    }

    solvePartOne(input: Shwarf): Solvution {
        return new Solvution(
            input.walk(64)
        )
    }
    
    solvePartTwo(input: Shwarf): Solvution {
        return new Solvution(
            input.cheat()
        )
    }

}
