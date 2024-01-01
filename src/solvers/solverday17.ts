import SolverBase, { Solvution } from './solverbase'
import AStar, { Node2D } from '../util/astar'
import { manhattanDistance } from '../util/aochelpers'

enum Direction {
    NORTH = 'NORTH',
    EAST = 'EAST',
    SOUTH = 'SOUTH',
    WEST = 'WEST',
}

class StatefulNode extends Node2D {
    private hashCache = ''

    constructor(x: number, y: number, public directionOfMovement: Direction, public straightStepsTaken: number = 1) {
        super(x, y)
    }

    override hash(): string {
        if(this.hashCache === '') {
            this.hashCache = `${super.hash()};${this.directionOfMovement};${this.straightStepsTaken}`
        }
        return this.hashCache
    }
}

export default class SolverDay17 extends SolverBase<number[][]> {
    static override day = 17

    prepareInput(rawInput: string): number[][] {
        return rawInput.lines().map((line) => line.csvNumbers(''))
    }

    solvePartOne(input: number[][]): Solvution {
        return new Solvution(
            4//this.solve(input, 0, 3)
        )
    }
    
    solvePartTwo(input: number[][]): Solvution {
        return new Solvution(
            this.solve(input, 4, 10)
        )
    }

    solve(input: number[][], minSteps: number = 0, maxSteps: number = 3): number {
        const width = input[0].length
        const height = input.length
        const goal = new StatefulNode(width - 1, height - 1, Direction.EAST)
        const oldElPatho = AStar<StatefulNode>(
            [
                new StatefulNode(0, 0, Direction.EAST),
                new StatefulNode(0, 0, Direction.SOUTH),
            ],
            goal,
            (node) => {
                const { straightStepsTaken, directionOfMovement, x, y } = node

                const out = []
                switch(directionOfMovement) {
                    case Direction.NORTH:
                        if(straightStepsTaken < maxSteps) {
                            out.push(
                                new StatefulNode(
                                    x,
                                    y - 1,
                                    Direction.NORTH,
                                    straightStepsTaken + 1,    
                                ),
                            )
                        }

                        if(straightStepsTaken >= minSteps) {
                            out.push(new StatefulNode(x - 1, y, Direction.WEST))
                            out.push(new StatefulNode(x + 1, y, Direction.EAST))
                        }
                        break
                    case Direction.EAST:
                        if(straightStepsTaken < maxSteps) {
                            out.push(
                                new StatefulNode(
                                    x + 1,
                                    y,
                                    Direction.EAST,
                                    straightStepsTaken + 1,    
                                ),
                            )
                        }

                        if(straightStepsTaken >= minSteps) {
                            out.push(new StatefulNode(x, y - 1, Direction.NORTH))
                            out.push(new StatefulNode(x, y + 1, Direction.SOUTH))
                        }
                        break
                    case Direction.SOUTH:
                        if(straightStepsTaken < maxSteps) {
                            out.push(
                                new StatefulNode(
                                    x,
                                    y + 1,
                                    Direction.SOUTH,
                                    straightStepsTaken + 1,    
                                ),
                            )
                        }

                        if(straightStepsTaken >= minSteps) {
                            out.push(new StatefulNode(x - 1, y, Direction.WEST))
                            out.push(new StatefulNode(x + 1, y, Direction.EAST))
                        }
                        break
                    case Direction.WEST:
                        if(straightStepsTaken < maxSteps) {
                            out.push(
                                new StatefulNode(
                                    x - 1,
                                    y,
                                    Direction.WEST,
                                    straightStepsTaken + 1,    
                                ),
                            )
                        }
                        if(straightStepsTaken >= minSteps) {
                            out.push(new StatefulNode(x, y - 1, Direction.NORTH))
                            out.push(new StatefulNode(x, y + 1, Direction.SOUTH))
                        }
                        break
                }

                return out.filter(({x, y}) => x >= 0 && x < width && y >= 0 && y < height)
            },
            (node, neighbor) => {
                const { x, y } = neighbor
                return input[y][x]
            },
            (node, goal) => node.x === goal.x && node.y === goal.y && node.straightStepsTaken >= minSteps,
            (node) => manhattanDistance(node, goal),
            false
        )

        // console.log(this.drawPaff(input, oldElPatho))
        
        return oldElPatho.slice(1).map(({x, y}) => input[y][x]).sum()
    }

    drawPaff(input: number[][], path: Node2D[]): string {
        const grid = input.map((row) => row.map((x) => x.toString()))
        const mePath = [...path]
        let at = mePath.shift()!
        mePath.forEach(({x, y}) => {
            let char = '<'

            if(at.y > y) {
                char = '^'
            }
            if(at.y < y) {
                char = 'v'
            }
            if(at.x < x) {
                char = '>'
            }

            grid[y][x] = char
            at = new Node2D(x, y)
        })
        return grid.twoString()
    }
}
