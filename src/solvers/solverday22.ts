import Point3D from '../util/point3d'
import SolverBase, { Solvution } from './solverbase'
import * as maffs from 'mathjs'

const numberInRange = (x: number, min: number, max: number) => 
    x >= min && x <= max
class Brik {
    public id: string = 'unidentifiedLyingObject'
    public from: Point3D
    public to: Point3D
    public voxels: Point3D[]
    
    get xAligned(): boolean {
        return this.from.x !== this.to.x
    }

    get yAligned(): boolean {
        return this.from.y !== this.to.y
    }

    get zAligned(): boolean {
        return this.from.z !== this.to.z
    }
           
    constructor(from: Point3D, to: Point3D) {
        this.from = new Point3D(
            Math.min(from.x, to.x),
            Math.min(from.y, to.y),
            Math.min(from.z, to.z),
        )

        this.to = new Point3D(
            Math.max(from.x, to.x),
            Math.max(from.y, to.y),
            Math.max(from.z, to.z),
        )

        this.voxels = this.generateVoxels()
    }

    private generateVoxels(): Point3D[] {
        let direction = new Point3D(1, 0, 0)
        if(this.yAligned) {
            direction = new Point3D(0, 1, 0)
        }
        if(this.zAligned) {
            direction = new Point3D(0, 0, 1)
        }

        let at = this.from.clooney()
        let out = []
        while(at.x <= this.to.x && at.y <= this.to.y && at.z <= this.to.z) {
            out.push(at)
            at = at.add(direction)
        }

        return out
    }

    static fromString(def: string): Brik {
        const [from, to] = def.split('~')
        return new Brik(Point3D.fromString(from), Point3D.fromString(to))
    }

    toWastl(): string {
        return `${this.from.toWastl()}~${this.to.toWastl()}${this.id.length < 4 ? ` ${this.id}` : ''}`
    }

    containsVoxelXY(voxel: Point3D): boolean {
        return numberInRange(voxel.x, this.from.x, this.to.x) &&
                numberInRange(voxel.y, this.from.y, this.to.y)
    }
    
    interseksXY(other: Brik): boolean {
        return other.voxels.some((v) => this.containsVoxelXY(v))
    }
    
    dropLikeABagOfFeathers(targetZ: number): void {
        const dz = this.from.z - targetZ
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

        const maxX = Math.max(...this.bricks.map(({ to }) => to.x))
        const maxY = Math.max(...this.bricks.map(({ to }) => to.y))
        const maxZ = Math.max(...this.bricks.map(({ to }) => to.z))

        this.width = maxX + 1
        this.depth = maxY + 1
        this.height = maxZ + 1
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
            if(brick.zAligned) {
                for(let z = brick.from.z; z <= brick.to.z; z++) {
                    grid[z][brick.from[direction]] = '#'
                }
            } else {
                for(let j = brick.from[direction]; j <= brick.to[direction]; j++) {
                    grid[brick.from.z][j] = '#'
                }
            }
        })

        return grid.map((row) => row.join('')).reverse()
    }

    sideViews(): string {
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
        this.bricks.sort((a, b) => a.from.z - b.from.z)
    }

    settle(): void {
        this.zSortBricks()

        for(const [i, brick] of this.bricks.entries()) {
            // console.log(`\n\nNow Placing: ${brick.toWastl()}\n`)
            // this.printPlacement(brick)
            
            const bricksWhatCouldBlock = this.bricks.slice(0, i).filter((otherBrick) => brick.interseksXY(otherBrick))
            if(bricksWhatCouldBlock.length === 0) {
                brick.dropLikeABagOfFeathers(1)
                // console.log(`what him falls all the way down to layer 1`)
                // console.log(brick.toWastl())
            } else {
                const highestBrick = bricksWhatCouldBlock.sort((a, b) => b.to.z - a.to.z)[0]
                brick.dropLikeABagOfFeathers(highestBrick.to.z + 1)
                // console.log(`what him interseks with ${highestBrick.id} and ends up on layer ${brick.from.z}`)
                // console.log(brick.toWastl())
            }
        }

        return
    }
    
    getZappables(): Brik[] {
        return this.bricks.filter((brick) => {
            // console.log(`\nconsidering brick ${brick.id}`)
            // this.printPlacement(brick)
            
            const hatBricks = this.getBricksRestingOn(brick)
            // console.log(`supporting ${hatBricks.length} many bricks: ${hatBricks.map(({id}) => id).join()}`)
            if(hatBricks.length === 0) {
                // lucky you, enjoy the view!
                // console.log(`nayt supporting nobody. verdict: ZAPPABLE!`)
                return true
            }
            
            const bricksSupportedOnlyByBrick = hatBricks.filter((hatBrick) => this.getBricksSupporting(hatBrick).length === 1)
            // if(bricksSupportedOnlyByBrick.length > 0) {
                // console.log(`is the only one supporting ${bricksSupportedOnlyByBrick.map(({id}) => id).join(',')} some. NOT ZAPPABLE!`)
            // } else {
                // console.log(`s all good man, all my hats are supported by some other guy. ZAPPABLE!`)
            // }
            return bricksSupportedOnlyByBrick.length === 0
        })
    }
    
    getBricksRestingOn(brick: Brik): Brik[] {
        return this.bricks.filter((otherBrick) =>
            (otherBrick.from.z === brick.to.z + 1) &&
                brick.interseksXY(otherBrick)
        )
    }
    
    getBricksSupporting(brick: Brik): Brik[] {
        return this.bricks.filter((otherBrick) => 
            (otherBrick.to.z === brick.from.z - 1) &&
                brick.interseksXY(otherBrick)
        )        
    }
    
    labelBricks(): void {
        this.bricks.forEach((brick, i) => brick.id = String.fromCharCode(65 + i))
    }

    printDiagnostics(zFrom: number, zTo: number): void {
        const birks = this.bricks.filter(({ from }) => from.z >= zFrom && from.z <= zTo)
        console.log(birks.map((b) => b.toWastl()).join('\n'))

        const sideViewLiness = this.sideViews().split('\n')
        console.log([sideViewLiness[0], ...sideViewLiness.slice(this.height + 2 - zTo, this.height + 2 - zFrom + 1)].join('\n'))
    }

    printPlacement(brock: Brik): void {
        let grid = Array.seq(this.depth)
                        .map(() => new Array(this.width).fill('.'))
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
        input.settle()
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
        