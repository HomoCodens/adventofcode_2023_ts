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

export type NodeQueue<INode> = INode[]

type NodeAndState<TState, TNode> = {
    state: TState,
    node: TNode,
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
    startingNode: TNode,
    goal: TNode,
    nextNodes: (currentNode: TNode) => TNode[],
    cost: (currentNode: TNode, neighbour: TNode) => number,
    goalReached: (currentNode: TNode, goal: TNode) => boolean = (node) => node.equalTo(goal),
    heuristic: (node: TNode) => number = () => 0,
    loudmouthyness = false,
) {
    const log = (msg: string) => loudmouthyness && console.log(msg)

    
    let gScores: Map<string, number> = new Map()
    gScores.set(startingNode.hash(), 0)
    
    let cameFrom: Map<string, TNode> = new Map()
    
    let fScores: Map<string, number> = new Map()
    fScores.set(startingNode.hash(), 0)

    const compareNodes: ICompare<TNode> = (a: TNode, b: TNode) => fScores.get(a.hash())! - fScores.get(b.hash())!
    let queue = new Heap<TNode>(compareNodes)
    queue.insert(startingNode)

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


/*function reconstruct_path(cameFrom, current)
    total_path := {current}
    while current in cameFrom.Keys:
        current := cameFrom[current]
        total_path.prepend(current)
    return total_path

// A* finds a path from start to goal.
// h is the heuristic function. h(n) estimates the cost to reach goal from node n.
function A_Star(start, goal, h)
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    openSet := {start}

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start
    // to n currently known.
    cameFrom := an empty map

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    gScore := map with default value of Infinity
    gScore[start] := 0

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how cheap a path could be from start to finish if it goes through n.
    fScore := map with default value of Infinity
    fScore[start] := h(start)

    while openSet is not empty
        // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue
        current := the node in openSet having the lowest fScore[] value
        if current = goal
            return reconstruct_path(cameFrom, current)

        openSet.Remove(current)
        for each neighbor of current
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            tentative_gScore := gScore[current] + d(current, neighbor)
            if tentative_gScore < gScore[neighbor]
                // This path to neighbor is better than any previous one. Record it!
                cameFrom[neighbor] := current
                gScore[neighbor] := tentative_gScore
                fScore[neighbor] := tentative_gScore + h(neighbor)
                if neighbor not in openSet
                    openSet.add(neighbor)

    // Open set is empty but goal was never reached
    return failure*/