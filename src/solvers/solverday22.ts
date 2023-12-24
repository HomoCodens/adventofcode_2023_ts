import SolverBase, { Solvution } from './solverbase'
import * as maffs from 'mathjs'

class Point3D {
    constructor(public x: number, public y: number, public z: number) {}
    
    static fromString(def: string): Point3D {
        const [x, y, z] = def.split(',')
        return new Point3D(+x, +y, +z)
    }

    toWastl(): string {
        return `${this.x},${this.y},${this.z}`
    }

    clooney(): Point3D {
        return new Point3D(this.x, this.y, this.z)
    }
}

class Brik {
    public id: string = 'unidentifiedLyingObject'
    
    get lowerLeftDown(): Point3D {
        return new Point3D(
                            Math.min(this.from.x, this.to.x),
                            Math.min(this.from.y, this.to.y),
                            Math.min(this.from.z, this.to.z)
                        )
    }
    
    get upperRightSkyward(): Point3D {
        return new Point3D(
                            Math.max(this.from.x, this.to.x),
                            Math.max(this.from.y, this.to.y),
                            Math.max(this.from.z, this.to.z)
                        )
    }

    get unitVector(): number[] {
        return maffs.subtract(
            [this.upperRightSkyward.x, this.upperRightSkyward.y, this.upperRightSkyward.z],
            [this.lowerLeftDown.x, this.lowerLeftDown.y, this.lowerLeftDown.z]
        )
    }

    get xAligned(): boolean {
        return this.from.y === this.to.y
    }

    get isVertical(): boolean {
        return this.from.z !== this.to.z
    }

    get voxels(): Point3D[] {
        let dx = this.to.x - this.from.x
        // This is where he said 'eff it' and fully embraced the shittiness of this mess of code
        if(dx > 0)
            dx /= maffs.abs(dx)

        let dy = this.to.y - this.from.y
        if(dy > 0)
            dy /= maffs.abs(dy)

        let dz = this.to.z - this.from.z
        if(dz > 0)
            dz /= maffs.abs(dz)

        let at = this.from.clooney()
        let out = []
        while(at.x <= this.to.x && at.y <= this.to.y && at.z <= this.to.z) {
            out.push(at)
            at = new Point3D(at.x + dx, at.y + dy, at.z + dz)
        }

        return out
    }
            
    constructor(private from: Point3D, private to: Point3D) {}
        
    static fromString(def: string): Brik {
        const [from, to] = def.split('~')
        return new Brik(Point3D.fromString(from), Point3D.fromString(to))
    }

    toWastl(): string {
        return `${this.from.toWastl()}~${this.to.toWastl()}${this.id.length < 4 ? ` ${this.id}` : ''}`
    }

    collinearXY(other: Brik): boolean {
        if(this.xAligned !== other.xAligned) {
            return false
        }

        if(this.xAligned) {
            return this.from.y === other.from.y
        }

        return this.from.x === other.from.x
    }
    
    interseksXY(other: Brik): boolean {
        if(this.collinearXY(other)) {
            if(this.xAligned) {
                return (other.lowerLeftDown.x >= this.lowerLeftDown.x && other.lowerLeftDown.x <= this.upperRightSkyward.x) ||
                        (this.lowerLeftDown.x >= other.lowerLeftDown.x && this.lowerLeftDown.x <= other.upperRightSkyward.x)
            } else {
                return (other.lowerLeftDown.y >= this.lowerLeftDown.y && other.lowerLeftDown.y <= this.upperRightSkyward.y) ||
                        (this.lowerLeftDown.y >= other.lowerLeftDown.y && this.lowerLeftDown.y <= other.upperRightSkyward.y)
            }
        }

        const intersectionPoint = maffs.intersect(
            [this.lowerLeftDown.x, this.lowerLeftDown.y],
            [this.upperRightSkyward.x, this.upperRightSkyward.y],
            [other.lowerLeftDown.x, other.lowerLeftDown.y],
            [other.upperRightSkyward.x, other.upperRightSkyward.y]
        )

        if(intersectionPoint === null) {
            return false
        }

        return this.lowerLeftDown.x <= Number(intersectionPoint[0]) && this.upperRightSkyward.x >= Number(intersectionPoint[0]) &&
                this.lowerLeftDown.y <= Number(intersectionPoint[1]) && this.upperRightSkyward.y >= Number(intersectionPoint[1]) &&
                other.lowerLeftDown.x <= Number(intersectionPoint[0]) && other.upperRightSkyward.x >= Number(intersectionPoint[0]) &&
                other.lowerLeftDown.y <= Number(intersectionPoint[1]) && other.upperRightSkyward.y >= Number(intersectionPoint[1])

        /*const L = maffs.round([[this.from.x - this.to.x, -(other.from.x - other.to.x)],
                               [this.from.y - this.to.y, -(other.from.y - other.to.y)]])

        const b = [other.from.x - this.from.x, other.from.y - this.from.y]
        const [s, t] = maffs.lusolve(L, b)
        const numberS = Number(s)
        const numberT = Number(t)
        
        return numberS >= 0 && numberS <= 1 && numberT >= 0 && numberT <= 1*/
    }
    
    compareTo(other: Brik): number {
        // Large Language Dummy? (Please don't kill me, o machine overlords!)
        const myLLD = this.lowerLeftDown
        const otherLLD = other.lowerLeftDown
        return myLLD.z === otherLLD.z ? 
                    myLLD.y === otherLLD.y ? 
                        otherLLD.x - myLLD.x : 
                        otherLLD.y - myLLD.y : 
                    otherLLD.z - myLLD.z
    }
    
    dropLikeABagOfFeathers(targetZ: number): void {
        const dz = this.lowerLeftDown.z - targetZ
        this.from.z -= dz
        this.to.z -= dz
    }
}
    
// Something to do with LEGO probably.
class BrikWorld {
    public width: number
    public depth: number
    public height: number
    
    constructor(private bricks: Brik[]) {
        this.zSortBricks()

        const minX = Math.min(0, ...this.bricks.map(({ lowerLeftDown }) => lowerLeftDown.x))
        const maxX = Math.max(...this.bricks.map(({ upperRightSkyward }) => upperRightSkyward.x))

        const minY = Math.min(0, ...this.bricks.map(({ lowerLeftDown }) => lowerLeftDown.y))
        const maxY = Math.max(...this.bricks.map(({ upperRightSkyward }) => upperRightSkyward.y))

        this.width = maxX - minX + 1
        this.depth = maxY - minY + 1
        this.height = this.bricks[this.bricks.length - 1].upperRightSkyward.z
    }

    toWastl(): string {
        return this.bricks.map((x) => x.toWastl()).join('\n')
    }

    sideViewRaw(direction: 'x' | 'y'): string[] {
        const gridWidth = direction === 'x' ? this.width : this.depth
        let grid = Array.seq(this.height + 1)
                        .map((row, j) => 
                            j === 0 ? new Array(gridWidth).fill('-') : new Array(gridWidth).fill(' ')
                        )

        this.bricks.forEach((brick) => {
            if(brick.isVertical) {
                for(let z = brick.lowerLeftDown.z; z <= brick.upperRightSkyward.z; z++) {
                    grid[z][brick.lowerLeftDown.y] = '#'
                }
            } else {
                for(let j = brick.lowerLeftDown[direction]; j <= brick.upperRightSkyward[direction]; j++) {
                    grid[brick.lowerLeftDown.z][j] = '#'
                }
            }
        })

        return grid.map((row) => row.join('')).reverse()
    }

    sideViews(): string {
        const axisLabelPadding = Math.floor(this.width / 2)

        const sideViewX = this.sideViewRaw('x')
        const sideViewY = this.sideViewRaw('y')
        const lineNoLength = maffs.log10(this.height) + 1

        const lines = sideViewX.map((xLine, i) => {
            const yLine = sideViewY[i]
            const lineNo = (this.height - i).toLocaleString('de-CH', { minimumIntegerDigits: lineNoLength })
            return `${lineNo}  ${xLine}  |  ${yLine}  ${lineNo}`
        })

        const halfXWidth = Math.floor(this.width / 2)
        const halfYWidth = Math.floor(this.depth / 2)

        lines.unshift('')
        lines.unshift(' '.repeat(lineNoLength + halfXWidth + 2) + 'x' + ' '.repeat(halfXWidth + 5 + halfYWidth + 1) + 'y')

        return lines.join('\n')
    }

    zSortBricks(): void {
        this.bricks.sort((a, b) => a.lowerLeftDown.z - b.lowerLeftDown.z)
    }

    settle(): void {
        this.zSortBricks()
        this.bricks.forEach((brick: Brik, i: number) => {
            
            console.log(`\n\nNow Placing: ${brick.toWastl()}\n`)
            //this.printPlacement(brick)

            // yes, the order changes during the loop, but only for those with a z value
            // LESS than the remaining bricks so it's fiiine
            // also: yes, some smart data structure would be more efficient.
            for(let ii = i - 1; ii >= 0; ii--) {
                if(brick.interseksXY(this.bricks[ii])) {
                    brick.dropLikeABagOfFeathers(this.bricks[ii].upperRightSkyward.z + 1)
                    console.log(`what him interseks with ${this. bricks[ii]} and ends up on layer ${brick.lowerLeftDown.z}`)
                    return
                }
            }
            
            brick.dropLikeABagOfFeathers(1)
            console.log(`what him falls all the way down to layer 1`)
        })
        this.zSortBricks()
    }
    
    getZappables(): Brik[] {
        return this.bricks.filter((brick) => {
            console.log(`\nconsidering brick ${brick.id}`)
            
            const hatBricks = this.getBricksRestingOn(brick)
            console.log(`supporting ${hatBricks.length} many bricks: ${hatBricks.map(({id}) => id).join()}`)
            if(hatBricks.length === 0) {
                // lucky you, enjoy the view!
                console.log(`nayt supporting nobody. verdict: ZAPPABLE!`)
                return true
            }
            
            const isOnlySupportingForSome = hatBricks.some((hatBrick) => this.getBricksSupporting(hatBrick).length === 1)
            if(isOnlySupportingForSome) {
                console.log(`is the only one supporting ${hatBricks.filter((hatBrick) => this.getBricksSupporting(hatBrick)).map(({id}) => id).join(',')} some. NOT ZAPPABLE!`)
            } else {
                console.log(`s all good man, all my hats are supported by some other guy. ZAPPABLE!`)
            }
            return !isOnlySupportingForSome
        })
    }
    
    getBricksRestingOn(brick: Brik): Brik[] {
        return this.bricks.filter((otherBrick) =>
            otherBrick.lowerLeftDown.z === brick.upperRightSkyward.z + 1 &&
                brick.interseksXY(otherBrick)
        )
    }
    
    getBricksSupporting(brick: Brik): Brik[] {
        return this.bricks.filter((otherBrick) => 
            otherBrick.upperRightSkyward.z === brick.lowerLeftDown.z - 1 &&
                brick.interseksXY(otherBrick)
        )        
    }
    
    labelBricks(): void {
        this.bricks.forEach((brick, i) => brick.id = String.fromCharCode(65 + i))
    }

    printDiagnostics(zFrom: number, zTo: number): void {
        const birks = this.bricks.filter(({ lowerLeftDown }) => lowerLeftDown.z >= zFrom && lowerLeftDown.z <= zTo)
        console.log(birks.map((b) => b.toWastl()).join('\n'))

        const sideViewLiness = this.sideViews().split('\n')
        console.log([sideViewLiness[0], ...sideViewLiness.slice(this.height + 2 - zTo, this.height + 2 - zFrom + 1)].join('\n'))
    }

    printPlacement(brock: Brik): void {
        let grid = Array.seq(this.width)
                        .map(() => new Array(this.depth).fill('.'))
        brock.voxels.forEach(({x, y}) => grid[y][x] = brock.id.length < 2 ? brock.id : '#')
        console.log(grid.reverse().twoString())
    }
}
        
export default class SolverDay22 extends SolverBase<BrikWorld> {
    static override day = 22
    
    prepareInput(rawInput: string): BrikWorld {
        return new BrikWorld(rawInput.lines().map(Brik.fromString))
    }
    
    solvePartOne(input: BrikWorld): Solvution {
        input.labelBricks()
        input.zSortBricks()
        console.log(input.toWastl())
        console.log(input.sideViews())
        input.settle()
        console.log(input.sideViews())
        input.printDiagnostics(0, 4)
        return new Solvution(
            input.getZappables().length
        )
    }
        
    solvePartTwo(input: BrikWorld): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }
        
}
        