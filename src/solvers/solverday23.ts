import Point from '@mapbox/point-geometry'
import { Queue } from '@datastructures-js/queue'
import SolverBase, { Solvution } from './solverbase'

enum LabraYnth 
{
    PATH = '.',
    TREE = '#',
    // As in "slippery slope". Definitely not a typo...
    SLIPE_EAST = '>',
    SLIPE_SOUTH = 'v',
    SLIPE_WEST = '<',
    SLIPE_NORTH = '^',
}

class Ajent {
    private active = true
    private paff: Point[] = []

    get isActive() {
        return this.active
    }

    constructor(private position: Point) { }

    step(dx: number, dy: number): Ajent {
        let clone = this.clone()
        clone.position.add(new Point(dx, dy))
        clone.paff.push(clone.position)
        return clone
    }

    update(forestArea: LabraYnth[][], canClimbSloppies: boolean): Ajent[] {
        const { x, y } = this.position
        const width = forestArea[0].length
        const height = forestArea.length

        let candidates: Ajent[] = []

        if(forestArea[y][x] === LabraYnth.PATH || (forestArea[y][x] !== LabraYnth.TREE && canClimbSloppies)) {
            candidates = [
                this.step(-1, 0),
                this.step(1, 0),
                this.step(0, -1),
                this.step(0, 1),
            ]
        } else {
            switch(forestArea[y][x]) {
                case LabraYnth.SLIPE_EAST:
                    candidates = [
                        this.step(1, 0)
                    ]
                    break
                case LabraYnth.SLIPE_SOUTH:
                    candidates = [
                        this.step(0, 1)
                    ]
                    break
                case LabraYnth.SLIPE_WEST:
                    candidates = [
                        this.step(-1, 0)
                    ]
                    break
                case LabraYnth.SLIPE_NORTH:
                    candidates = [
                        this.step(0, -1)
                    ]
                    break
            }
        }

        candidates = candidates.filter((c) => {
            const { y, x } = c.position
            return x >= 0 && x < width && y >= 0 && y < height &&
                forestArea[y][x] !== LabraYnth.TREE &&
                !this.paff.some((history) => history.equals(c.position))
        })

        if(candidates.length <= 1) {
            // Happily walking along (or vanishing from existence)...
            return candidates
        } else {
            return [this.hibernate()]
        }
    }

    hibernate(): Ajent {
        let clone = this.clone()
        clone.active = false
        return clone
    }

    nom(others: Ajent[]): Ajent[] {
        let stuffedAjent = others.reduce((acc, ajent) => acc.paff.length > ajent.paff.length ? acc : ajent, this)
        stuffedAjent.active = true
        return [stuffedAjent]
    }

    clone(): Ajent {
        const clone = new Ajent(this.position.clone())
        clone.active = this.active
        clone.paff = this.paff.map((x) => x.clone())
        return clone
    }
}

class ChuegeliBahn {
    constructor(private forestArea: LabraYnth[][]) {}

    run(canClimbSloppies: boolean): Point[] {
        let activeAjents = new Queue<Ajent>([new Ajent(new Point(1, 0))])
        let sleepyAjents = new Queue<Ajent>();

        while(!activeAjents.isEmpty()) {
            const ajent = activeAjents.pop()
            const nextAjents = ajent.update(this.forestArea, canClimbSloppies)
            if(nextAjents.length) {
                if(nextAjents[0].isActive) {
                    // Technically there is at most 1 of them..
                    nextAjents.forEach((a) => activeAjents.push(a))
                } else {
                    nextAjents.forEach((a) => sleepyAjents.push(a))
                }
            }

            if(activeAjents.isEmpty()) {
                // wakey wakey
            }
        }
    }
}

export default class SolverDay23 extends SolverBase<LabraYnth[][]> {
    static override day = 23

    prepareInput(rawInput: string): LabraYnth[][] {
        return rawInput.lines().map((line) => line.csv('', (x) => x as LabraYnth))
    }

    solvePartOne(input: LabraYnth[][]): Solvution {
        return new Solvution(
            this.solve(input, false)
        )
    }
    
    solvePartTwo(input: LabraYnth[][]): Solvution {
        return new Solvution(
            this.solve(input, true)
        )
    }

    solve(forestArea: LabraYnth[][], canClimbSloppies: boolean): number {


        return 42
    }

    drawPaff(input: LabraYnth[][], path: Point[]): string {
        const grid = input.map((row) => row.map((x) => x.toString()))
        const mePath = [...path]
        let at = mePath.shift()!
        mePath.forEach(({x, y}) => {
            grid[y][x] = 'O'
            at = new Point(x, y)
        })
        return grid.twoString()
    }
}