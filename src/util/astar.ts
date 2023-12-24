import { Heap, ICompare } from '@datastructures-js/heap'

export interface INode {
    hash(): string
    equalTo(other: unknown): boolean
    clone(): INode
}

export class Node2D implements INode {

    constructor(public x: number, public y: number) {}

    hash(): string {
        return `${this.x};${this.y}`
    }

    equalTo(other: Node2D): boolean {
        return this.hash() === other.hash()
    }

    clone(): Node2D {
        return new Node2D(this.x, this.y)
    }
}

function reconstructPath<TNode extends INode>(cameFrom: Map<string, TNode>, current: TNode): TNode[] {
    let out = [current]
    while(cameFrom.get(current.hash())) {
        out.unshift(cameFrom.get(current.hash())!)
        current = cameFrom.get(current.hash())!
    }

    return out
}

// You get one guess where I took the pseudocode for this from.
export default function AStar<TNode extends INode>(
    startingNodes: TNode[],
    goal: TNode,
    nextNodes: (currentNode: TNode) => TNode[],
    cost: (currentNode: TNode, neighbour: TNode) => number,
    goalReached: (currentNode: TNode, goal: TNode) => boolean = (node) => node.equalTo(goal),
    heuristic: (node: TNode) => number = () => 0,
    loudmouthyness = false,
) {
    const log = (msg: string) => loudmouthyness && console.log(msg)

    let gScores: Map<string, number> = new Map()
    startingNodes.forEach((node) => gScores.set(node.hash(), 0))
    
    let cameFrom: Map<string, TNode> = new Map()
    
    let fScores: Map<string, number> = new Map()
    startingNodes.forEach((node) => fScores.set(node.hash(), 0))

    const compareNodes: ICompare<TNode> = (a: TNode, b: TNode) => fScores.get(a.hash())! - fScores.get(b.hash())!
    let queue = new Heap<TNode>(compareNodes)
    startingNodes.forEach((node) => queue.insert(node))

    let hashesInQueue: any = {}

    while(!queue.isEmpty()) {
        const node = queue.pop()!

        log(`\n\nlooking at ${JSON.stringify(node)} (fScore ${fScores.get(node.hash())}).`)
        if(goalReached(node, goal)) {
            log('O hey, we made it!')
            return reconstructPath(cameFrom, node)
        }

        nextNodes(node).forEach((neighbour) => {
            log(`\nConsidering neighbour ${JSON.stringify(neighbour)}`)

            const neighbourGScore = (gScores.get(node.hash()) ?? Infinity) + cost(node, neighbour)
            
            const prevNeighbourGScore = gScores.get(neighbour.hash()) ?? Infinity
            log(`Can reach them with: ${neighbourGScore} (was ${prevNeighbourGScore})`)

            if(neighbourGScore < prevNeighbourGScore) {
                log(`Heyhey, update partay!`)
                cameFrom.set(neighbour.hash(), node)
                gScores.set(neighbour.hash(), neighbourGScore)
                fScores.set(neighbour.hash(), neighbourGScore + heuristic(neighbour))
                if(!hashesInQueue[neighbour.hash()]) {
                    log(`Also, adding it to the queue.`)
                    queue.push(neighbour)
                    hashesInQueue[neighbour.hash()] = true
                }
            }
        })
    }

    return []
}
