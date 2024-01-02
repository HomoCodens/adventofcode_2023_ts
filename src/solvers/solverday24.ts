import * as maffs from 'mathjs'
import SolverBase, { Solvution } from './solverbase'
import Point3D from '../util/point3d'

class HailStone {
    constructor(private location: Point3D, private velocity: Point3D) {}

    static fromString(def: string): HailStone {
        const [p, v] = def.csv<Point3D>(' @ ', (chunk) => {
            const [x, y, z] = chunk.csvNumbers()
            return new Point3D(x, y, z)
        })

        return new HailStone(p, v)
    }

    toWastl(): string {
        return `${this.location.toWastl()} @ ${this.velocity.toWastl()}`
    }

    interseks2D(other: HailStone): Point3D | null {
        const L = [[this.velocity.x, -other.velocity.x],
                   [this.velocity.y, -other.velocity.y]]

        const determinant = maffs.det(L)
        
        if(determinant !== 0) {
            const b = other.location.subtract(this.location)
            const [s, t] = maffs.lusolve(L, [b.x, b.y]) as [number, number]

            if(s >= 0 && t >= 0) {
                return  this.location.add(this.velocity.scale(s))
            }
        }

        return null
    }

    distanceTo(other: HailStone): number {
        const n = maffs.cross(this.velocity.toArray(), other.velocity.toArray())
        const myPlaneNormal = maffs.cross(n, this.velocity.toArray())
        const theirPlaneNormal = maffs.cross(n, other.velocity.toArray())

        const myClosestPoint = this.location.add(
            this.velocity.scale(
                maffs.dot(other.location.subtract(this.location).toArray(), theirPlaneNormal) / 
                maffs.dot(this.velocity.toArray(), theirPlaneNormal)))
        const theirClosestPoint = other.location.add(
            other.velocity.scale(
                maffs.dot(this.location.subtract(other.location).toArray(), myPlaneNormal) /
                maffs.dot(other.velocity.toArray(), myPlaneNormal)
            )
        )

        const d = theirClosestPoint.subtract(myClosestPoint)
        console.log(d)
        return maffs.distance(d.toArray(), [0, 0, 0]) as number
    }

    tojsonthing(): string {
        return `{ x: ${this.location.x}, y: ${this.location.y}, z: ${this.location.z}, dx: ${this.velocity.x}, dy: ${this.velocity.y}, dz: ${this.velocity.z}},`
    }
}

export default class SolverDay24 extends SolverBase<HailStone[]> {
    static override day = 24

    prepareInput(rawInput: string): HailStone[] {
        //19, 13, 30 @ -2,  1, -2
        return rawInput.lines().map(HailStone.fromString)
    }

    solvePartOne(input: HailStone[]): Solvution {
        let n = 0
        for(let i = 0; i < input.length - 1; i++) {
            for(let j = i + 1; j < input.length; j++) {
                const bangPoint = input[i].interseks2D(input[j])
                if(bangPoint !== null) {
                    if(this.pointInRect(bangPoint, 200000000000000, 400000000000000, 200000000000000, 400000000000000)) {
                        n++
                        break
                    }
                }
            }
        }
        return new Solvution(
            n
        )
    }
    
    solvePartTwo(input: HailStone[]): Solvution {
        // Idees: 1) We must start from a point where the min dist to all lines is all positive and throw towards them
        //        2) We are looking for a series of points on all lines (one each) that are themselves on a straight line
        //           and reachable with constant v
        for(let i = 0; i < input.length - 1; i++) {
            for(let j = i + 1; j < input.length; j++) {
                console.log(input[i].distanceTo(input[j]))
            }
        }

        input.forEach((hs) => {
            console.log(hs.tojsonthing())
        })

        return new Solvution(
            'Answer goes here'
        )
    }

    pointInRect(point: Point3D, xMin: number, xMax: number, yMin: number, yMax: number): boolean {
        return point.x >= xMin && point.x <= xMax && point.y >= yMin && point.y <= yMax
    }
}
    