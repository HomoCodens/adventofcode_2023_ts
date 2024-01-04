import SolverBase, { Solvution } from './solverbase'

// k, this may be going a bit far calling this Point but not being the other one
class Point {
    constructor(public x: number, public y: number) {}

    hatshi(): string {
        return `${this.x};${this.y}`
    }
}

class Plot {
    isStart = false
    
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
        const { x, y } = this.wrap(location)
        console.log(`checking visitability of ${location.hatshi()} (really ${this.wrap(location).hatshi()})`)
        return this.plots[y][x].visitable
    }

    wrap({x, y}: Point) {
        return new Point(
            x < 0 ? x % this.width + this.width : x % this.width,
            y < 0 ? y % this.height + this.height : y % this.height
        )
    }

    getVisitableNeighbours({ x, y }: Point): Point[] {
        const neighbours = [
            new Point(x - 1, y),
            new Point(x + 1, y),
            new Point(x, y - 1),
            new Point(x, y + 1),
        ]

        return neighbours.filter((location) => this.isVisitable(location))
    }

    toString(occupiedLocations: any): string {
        return this.plots.map((row, i) => {
            return row.map((plot, j) => {
                if(!plot.visitable) {
                    return '#'
                }

                const at = new Point(j, i)
                return occupiedLocations[at.hatshi()] ? 'O' : '.'
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

    // instead of creating a bajillion shwarves each tracking their individual paths
    // after each step: check which are in the same location and smoosh them together
    // plots CAN be visited multiple times!
    shmoosh(nSteps: number): number {
        type EdgeEntry = { location: Point, nShwarves: number }
        let edge: { [k in string]: EdgeEntry } = {}
        edge[this.startingLocation.hatshi()] = {
            location: this.startingLocation,
            nShwarves: 1
        }

        for(let i = 0; i < nSteps; i++) {
            let nextEdge: { [k in string]: EdgeEntry} = {}
            Object.values(edge).forEach((entry) => {
                this.shwarfDom.getVisitableNeighbours(entry.location)
                                .forEach((location) => nextEdge[location.hatshi()] = {
                                    location,
                                    nShwarves: (nextEdge[location.hatshi()]?.nShwarves || 0) + entry.nShwarves
                                })
            })
            console.log(`step ${i + 1}`)
            console.log(this.shwarfDom.toString(nextEdge))
            console.log()
            edge = nextEdge
        }

        return Object.keys(edge).length
    }
}

export default class SolverDay21 extends SolverBase<Shwarf> {
    static override day = 21

    prepareInput(rawInput: string): Shwarf {
        return Shwarf.fromString(rawInput)
    }

    solvePartOne(input: Shwarf): Solvution {
        return new Solvution(
            input.shmoosh(5000)
        )
    }
    
    solvePartTwo(input: Shwarf): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

}
        