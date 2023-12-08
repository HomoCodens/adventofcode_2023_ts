import * as math from 'mathjs'

import SolverBase, { Solvution } from './solverbase'

type DesertNode = {
    id: string,
    L: string,
    R: string
}

class DesertMap {
    directions: string[] = []
    nodes: Map<string, DesertNode> = new Map()

    constructor(directions: string[], nodes: Map<string, DesertNode>) {
        this.directions = directions
        this.nodes = nodes
    }

    static fromString(def: string): DesertMap {
        const [instructions, blank, ...nodes] = def.lines()

        const nodeExpression = /(?<id>\w+) = \((?<L>\w+), (?<R>\w+)\)/
        const nodeObjects = nodes.map((nodeDef: string) => ({ ...nodeExpression.exec(nodeDef)?.groups } as DesertNode))

        return new DesertMap(
            instructions.split(''),
            nodeObjects.reduce((acc: Map<string, DesertNode>, x: DesertNode): Map<string, DesertNode> => {
                acc.set(x.id, x)
                return acc
            },
            new Map<string, DesertNode>()),
        )
    }
}

export default class SolverDay08 extends SolverBase<DesertMap> {
    static override day = 8

    prepareInput(rawInput: string): DesertMap {
        return DesertMap.fromString(rawInput)
    }

    solvePartOne(input: DesertMap): Solvution {
        console.log(input)
        return new Solvution(
            this.runYouBeautifulBoy(input)
        )
    }
    
    solvePartTwo(input: DesertMap): Solvution {
        const aNodes = [...input.nodes.entries()].map(([id]) => id).filter((x) => x.endsWith('A'))
        const cycles = aNodes.map((n) => this.runYouSpectralBoi(input, n))
        return new Solvution(
            cycles.reduce((acc, x) => math.lcm(acc, x))
        )
    }

    runYouBeautifulBoy(map: DesertMap): number {
        if(map.directions.length === 0) {
            return 0
        }

        let currentNodeId = 'AAA'
        let steps = 0

        while(currentNodeId !== 'ZZZ') {
            let isntruction = map.directions[steps % map.directions.length]
            const currentNode = map.nodes.get(currentNodeId)
            currentNodeId = (currentNode as any)[isntruction]
            steps++
        }

        return steps
    }

    runYouSpectralBoi(map: DesertMap, startingNodeId: string): number {
        if(map.directions.length === 0) {
            return 0
        }

        let currentNodeId = startingNodeId
        let steps = 0

        while(!currentNodeId.endsWith('Z')) {
            let isntruction = map.directions[steps % map.directions.length]
            const currentNode = map.nodes.get(currentNodeId)
            currentNodeId = (currentNode as any)[isntruction]
            steps++
        }

        return steps
    }
}
        