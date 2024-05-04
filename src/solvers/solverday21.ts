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
    private visitabilityCache: Map<string, Point[]> = new Map()

    constructor(private plots: Plot[][]) {}

    get width(): number {
        return this.plots[0].length
    }

    get height(): number {
        return this.plots.length
    }

    isVisitable(location: Point): boolean {
        const { x, y } = this.wrap(location)
        return this.plots[y][x].visitable
    }

    wrap({x, y}: Point) {
        let wrappedX = x % this.width
        if(wrappedX < 0) {
            wrappedX += this.width
        }

        let wrappedY = y % this.height
        if(wrappedY < 0) {
            wrappedY += this.height
        }

        return new Point(
            wrappedX,
            wrappedY,
        )
    }

    getVisitableNeighbours(point: Point, origin: Point): Point[] {
        const neighbours: Point[] = []

        const { x, y } = point
        const UP = new Point(x, y - 1)
        const DOWN = new Point(x, y + 1)
        const LEFT = new Point(x - 1, y)
        const RIGHT = new Point(x + 1, y)
        
        if(point.y >= origin.y) {
            neighbours.push(DOWN)
        }
        if(point.y <= origin.y) {
            neighbours.push(UP)
        }
        if(point.x >= origin.x) {
            neighbours.push(RIGHT)
        }
        if(point.x <= origin.x) {
            neighbours.push(LEFT)
        }

        return neighbours.filter((location) => this.isVisitable(location))
    }

    toString(occupiedLocations: any): string {
        return this.plots.map((row, i) => {
            return row.map((plot, j) => {
                if(!plot.visitable) {
                    return '#'
                }

                const at = new Point(j, i)
                return occupiedLocations[hashPoint(at)] ? 'O' : '.'
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

    toString(): string {
        return `Started at ${JSON.stringify(this.startingLocation)}\n\n` + this.shwarfDom.toString({})
    }

    walk(nSteps: number): number {
        let nEvens = 0
        let nOdds = 1

        const seen = {
            top: 0,
            left: -1,
            bottom: this.shwarfDom.height,
            right: this.shwarfDom.width,
        }

        let edge: Map<string, Point> = new Map()
        edge.set(hashPoint(this.startingLocation), this.startingLocation)
        for(let step = 1; step <= nSteps; step++) {
            //console.log(`step ${step}, edge length: ${edge.size}, total plots visited: ${nEvens + nOdds}`)
            const nEdge = new Map<string, Point>()
            edge.forEach((location) => {
                this.shwarfDom.getVisitableNeighbours(location, new Point(65, 65)).forEach((neighbour) => {
                    if(neighbour.x === seen.left) {
                        console.log('left')
                        console.log(neighbour)
                        seen.left -= this.shwarfDom.width
                    }
                    if(neighbour.x === seen.right) {
                        console.log('right')
                        console.log(neighbour)
                        seen.right += this.shwarfDom.width
                    }
                    if(neighbour.y === seen.top) {
                        console.log('top')
                        console.log(neighbour)
                        seen.top -= this.shwarfDom.height
                    }
                    if(neighbour.y === seen.bottom) {
                        console.log('bottom')
                        console.log(neighbour)
                        seen.bottom += this.shwarfDom.height
                    }
                    nEdge.set(hashPoint(neighbour), neighbour)
                    if(step % 2) {
                        nOdds++
                    } else {
                        nEvens++
                    }
                })
            })

            edge = nEdge
        }

        return (nSteps % 2) ? nOdds : nEvens
    }
}

export default class SolverDay21 extends SolverBase<Shwarf> {
    static override day = 21

    prepareInput(rawInput: string): Shwarf {
        return Shwarf.fromString(rawInput)
    }

    solvePartOne(input: Shwarf): Solvution {
        console.log(input.toString())
        return new Solvution(
            5//input.walk(64)
        )
    }
    
    solvePartTwo(input: Shwarf): Solvution {
        input.startingLocation = new Point(-1, 65)
        return new Solvution(
            input.walk(600) //input.walk(26_501_365)
        )
    }

}
        