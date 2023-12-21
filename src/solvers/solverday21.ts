import Point from '@mapbox/point-geometry'
import SolverBase, { Solvution } from './solverbase'

class Plot {
    visited = false
    isStart = false
    
    constructor(public visitable: boolean) {}

    static fromString(def: string): Plot {
        if(def === '#') {
            return new Plot(false)
        }

        return new Plot(true)
    }

    toString(): string {
        if(this.visited) {
            return 'O'
        } else if(this.visitable) {
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

    isOnGrid({ x, y }: Point): boolean {
        return x >= 0 && x < this.width &&
                y >= 0 && y < this.height
    }

    isVisitable(location: Point): boolean {
        const { x, y } = location
        return this.isOnGrid(location) && 
                this.plots[y][x].visitable && 
                !this.plots[y][x].visited
    }

    markVisited({ x, y }: Point): void {
        this.plots[y][x].visited = true
    }

    getUnvisitedNeighbours({ x, y }: Point): Point[] {
        const neighbours = [
            new Point(x - 1, y),
            new Point(x + 1, y),
            new Point(x, y - 1),
            new Point(x, y + 1),
        ]

        return neighbours.filter((location) => this.isVisitable(location))
    }

    toString(): string {
        return this.plots.twoString()
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
        return `Started at ${JSON.stringify(this.startingLocation)}\n\n` + this.shwarfDom.toString()
    }

    // instead of creating a bajillion shwarves each tracking their individual paths
    // after each step: check which are in the same location and smoosh them together
    // plots CAN be visited multiple times!
    shmoosh(nSteps: number): number {
        let edge = [this.startingLocation]
        let plotsVisited = 1

        for(let i = 0; i < nSteps; i++) {
            console.log(`step ${i}`)
            edge.forEach((location) => this.shwarfDom.markVisited(location))
            console.log(this.shwarfDom.toString())
            edge = edge.flatMap((location) => this.shwarfDom.getUnvisitedNeighbours(location))
            plotsVisited += edge.length
            console.log()
        }

        return plotsVisited
    }
}

export default class SolverDay21 extends SolverBase<Shwarf> {
    static override day = 21

    prepareInput(rawInput: string): Shwarf {
        return Shwarf.fromString(rawInput)
    }

    solvePartOne(input: Shwarf): Solvution {
        return new Solvution(
            input.shmoosh(6)
        )
    }
    
    solvePartTwo(input: Shwarf): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

}
        