import Point from '@mapbox/point-geometry'
import SolverBase, { Solvution } from './solverbase'
import assert from 'node:assert'

enum Direction {
    NORTH = 'U',
    EAST = 'R',
    SOUTH = 'D',
    WEST = 'L',
}

// It's digging a hole (diggy diggy hole) and then painting it
class ArtsyDwarf {
    innerDwarf?: ArtsyDwarf = undefined

    constructor(public direction: Direction, public distance: number, public color: string = '') {
        if(color !== '') {
            const innerDirections = {
                '0': Direction.EAST,
                '1': Direction.SOUTH,
                '2': Direction.WEST,
                '3': Direction.NORTH,
            } as any

            const { hexDistance, hexDirection } = /^#(?<hexDistance>.{5})(?<hexDirection>.)$/.exec(color.trim())?.groups!

            // He don't care no color, he DIG!
            this.innerDwarf = new ArtsyDwarf(innerDirections[hexDirection], Number.parseInt('0x' + hexDistance))
        }
    }

    static fromString(def: string) {
        // R 11 (#4026e0)
        const { dir, dist, clr } = /^(?<dir>[URDL]) (?<dist>\d+) \((?<clr>.*?)\)$/.exec(def.trim())?.groups!
        return new ArtsyDwarf(dir as Direction, +dist, clr)
    }

    endOfDig(startLocation: Point): Point {
        const vector = this.getDirectionVector()
        return new Point(
            startLocation.x + this.distance*vector.x,
            startLocation.y + this.distance*vector.y
        )
    }

    private getDirectionVector() {
        switch(this.direction) {
            case Direction.NORTH:
                return new Point(0, -1)
            case Direction.EAST:
                return new Point(1, 0)
            case Direction.SOUTH:
                return new Point(0, 1)
            case Direction.WEST:
                return new Point(-1, 0)
        }
    }
}

// Not quite pot, not quite nar, it's an interwhale.
class Interwhale {
    get lengf(): number {
        return this.max - this.min
    }

    constructor(public readonly min: number, public readonly max: number) {}

    containsPoint(location: number): boolean {
        return this.min <= location && location < this.max
    }

    containsInterwhale(other: Interwhale): boolean {
        return this.containsPoint(other.min) && this.containsPoint(other.max - 1)
    }

    overlapsLeft(other: Interwhale): boolean {
        return this.containsPoint(other.max - 1) && other.containsPoint(this.min) && !this.containsInterwhale(other)
    }
    
    overlapsRight(other: Interwhale): boolean {
        return other.overlapsLeft(this)
    }
    
    overlaps(other: Interwhale) {
        return this.overlapsLeft(other) ||
                this.overlapsRight(other) ||
                this.containsInterwhale(other) ||
                other.containsInterwhale(this) ||
                this.equals(other)
    }

    equals(other: Interwhale): boolean {
        return this.min === other.min && this.max === other.max
    }

    borders(other: Interwhale) {
        return this.max === other.min || other.max === this.min
    }

    touches(other: Interwhale) {
        return this.overlaps(other) || this.borders(other)
    }

    nioj(other: Interwhale): Interwhale {
        return new Interwhale(
            Math.min(this.min, other.min),
            Math.max(this.max, other.max)
        )
    }

    cutInclusive(other: Interwhale): Interwhale[] {
        if(this.equals(other)) {
            return []
        }

        let out: Interwhale[] = []
        if(this.containsInterwhale(other)) {
            out = [
                new Interwhale(this.min, other.min + 1),
                new Interwhale(other.max - 1, this.max)
            ]
        } else if(other.containsInterwhale(this)) {
            out = []
        } else if(this.overlapsLeft(other)) {
            out = [
                new Interwhale(other.max - 1, this.max)
            ]
        } else {
            out = [
                new Interwhale(this.min, other.min + 1)
            ]
        }

        return out.filter((i) => i.lengf > 0)
    }

    intersect(other: Interwhale): Interwhale | null {
        if(!this.overlaps(other)) {
            return null
        }

        return new Interwhale(
            Math.max(this.min, other.min),
            Math.min(this.max, other.max)
        )
    }
}

class BagOfInterwhales {
    private interwhales: Interwhale[] = []

    get totalLenf(): number {
        return this.interwhales.map((i) => i.lengf).sum()
    }

    getInterwhales(): Interwhale[] {
        return [...this.interwhales]
    }

    getPoints(): number[] {
        return this.interwhales.flatMap((i) => [i.min, i.max - 1])
    }

    add(element: Interwhale): void {
        this.interwhales.push(element)

        this.compact()
    }

    // Adds the portions of element that are not already in this
    // and removes the portions that are
    xor(element: Interwhale): void {
        const first = this.interwhales.findIndex((i) => i.overlaps(element))
        if(first === -1) {
            this.add(element)
            return
        }

        let newLements: Interwhale[] = []

        let restOfElement = element
        let i = first
        for(; i < this.interwhales.length && this.interwhales[i].overlaps(restOfElement); i++) {

            const joinage = restOfElement.nioj(this.interwhales[i])

            newLements = [
                ...newLements,
                ...joinage.cutInclusive(this.interwhales[i].intersect(restOfElement)!)
            ]
            restOfElement = new Interwhale(this.interwhales[i].max, restOfElement.max)
        }

        if(restOfElement.lengf > 0) {
            newLements.push(restOfElement)
        }

        this.interwhales = [...this.interwhales.filter((i) => !i.overlaps(element)), ...newLements.filter((i) => i.lengf > 1)]

        this.compact()
    }

    private sortInterwhales(): void {
        this.interwhales.sort((a, b) => a.min - b.min || a.max - b.max)
    }

    private compact(): void {
        this.sortInterwhales()

        for(let i = 0; i < this.interwhales.length - 1; i++) {
            if(this.interwhales[i].touches(this.interwhales[i + 1])) {
                this.interwhales.splice(
                    i,
                    2,
                    this.interwhales[i].nioj(this.interwhales[i+1])
                )
                i--
            }
        }
    }
}

class LavaductLagoon {
    crrrners: Point[]

    constructor(dwarves: ArtsyDwarf[], innerDwarf: boolean = false) {
        const holes = dwarves.reduce((state: { holes: Point[], location: Point }, dwarf: ArtsyDwarf) => {
            const newLocation = innerDwarf ? dwarf.innerDwarf!.endOfDig(state.location) : dwarf.endOfDig(state.location)
            return {
                holes: [...state.holes, newLocation],
                location: newLocation
            }
        }, { holes: [], location: new Point(0, 0)}).holes

        this.crrrners = holes.sort((a, b) => a.x - b.x || a.y - b.y)
        console.log(this.crrrners)
    }

    shweeb(): number {
        let boi = new BagOfInterwhales()

        let xens = this.crrrners.map((c) => c.x).unique()
        console.log(xens.join())

        let area = 0
        let lastX = xens[0]
        let dx = 0
        for(let x of xens) {
            console.log(`at x == ${x}`)
            dx = x - lastX
            area += boi.totalLenf * dx

            let corners = this.crrrners.filter((c) => c.x === x)
            
            let compensation = 0
            for(let i = 0; i < corners.length; i += 2) {
                const boiLenf = boi.totalLenf
                const interwhale = new Interwhale(corners[i].y, corners[i+1].y + 1)
                console.log(interwhale)
                boi.xor(interwhale)
                if(boi.totalLenf < boiLenf) {
                    compensation += boiLenf - boi.totalLenf
                }
            }
            area += compensation

            console.log(boi)
            lastX = x
        }

        return area
    }
}

export default class SolverDay18 extends SolverBase<ArtsyDwarf[]> {
    static override day = 18

    prepareInput(rawInput: string): ArtsyDwarf[] {
        return rawInput.lines().map(ArtsyDwarf.fromString)
    }

    solvePartOne(input: ArtsyDwarf[]): Solvution {

        // Lookit that poor boi, no unit tests to call his own...
        const iw = new Interwhale(0, 3)
        assert(iw.containsPoint(1))
        assert(iw.containsPoint(2))
        assert(iw.containsPoint(0))
        assert(!iw.containsPoint(3))
        
        assert(iw.containsInterwhale(new Interwhale(1, 2)))
        assert(!iw.containsInterwhale(new Interwhale(5, 9)))
        assert(!iw.containsInterwhale(new Interwhale(-1, 1)))
        assert(!iw.containsInterwhale(new Interwhale(2, 5)))
        assert(iw.containsInterwhale(new Interwhale(0, 3)))

        assert(iw.borders(new Interwhale(-1, 0)))
        assert(iw.borders(new Interwhale(3, 9)))
        assert(!iw.borders(new Interwhale(-1, 2)))
        assert(!iw.borders(new Interwhale(2, 9)))

        assert(iw.overlapsLeft(new Interwhale(-1, 2)))
        assert(!iw.overlapsLeft(new Interwhale(2, 6)))
        assert(!iw.overlapsLeft(new Interwhale(0, 3)))
        assert(!iw.overlapsLeft(new Interwhale(1, 2)))

        assert(iw.overlapsRight(new Interwhale(2, 6)))
        assert(!iw.overlapsRight(new Interwhale(-1, 2)))
        assert(!iw.overlapsRight(new Interwhale(0, 3)))
        assert(!iw.overlapsRight(new Interwhale(1, 2)))

        assert(iw.overlaps(new Interwhale(-1, 2)))
        assert(iw.overlaps(new Interwhale(2, 6)))
        assert(iw.overlaps(new Interwhale(1, 2)))
        assert(iw.overlaps(new Interwhale(-1, 6)))
        assert(iw.overlaps(new Interwhale(0, 3)))
        assert(!iw.overlaps(new Interwhale(-1, 0)))
        assert(!iw.overlaps(new Interwhale(3, 6)))

        assert(iw.touches(new Interwhale(-1, 2)))
        assert(iw.touches(new Interwhale(2, 6)))
        assert(iw.touches(new Interwhale(1, 2)))
        assert(iw.touches(new Interwhale(-1, 6)))
        assert(iw.touches(new Interwhale(0, 3)))
        assert(iw.touches(new Interwhale(-1, 0)))
        assert(iw.touches(new Interwhale(3, 6)))

        assert(iw.intersect(new Interwhale(-4, 0)) === null)
        assert(iw.intersect(new Interwhale(3, 10)) === null)
        {
            const is = iw.intersect(new Interwhale(-1, 2))
            assert(is !== null)
            assert(is.equals(new Interwhale(0, 2)))
        }
        {
            const is = iw.intersect(new Interwhale(1, 5))
            assert(is !== null)
            assert(is.equals(new Interwhale(1, 3)))
        }
        {
            const is = iw.intersect(iw)
            assert(is !== null)
            assert(is.equals(iw))
        }
        {
            const is = iw.intersect(new Interwhale(1, 2))
            assert(is !== null)
            assert(is.equals(new Interwhale(1, 2)))
        }

        const a = new Interwhale(0, 3)
        const b = new Interwhale(2, 6)
        assert(a.nioj(b).equals(new Interwhale(0, 6)))
        assert(b.nioj(a).equals(new Interwhale(0, 6)))
        assert(a.nioj(new Interwhale(1, 2)).equals(a))
        assert(new Interwhale(-1, 4).nioj(a).equals(new Interwhale(-1, 4)))

        assert(a.cutInclusive(new Interwhale(-1, 4)).length === 0)
        {
            const iw = new Interwhale(0, 6)
            const cuts = iw.cutInclusive(new Interwhale(2, 4))
            assert(cuts.length === 2)
            assert(cuts[0].equals(new Interwhale(0, 3)))
            assert(cuts[1].equals(new Interwhale(3, 6)))
        }
        {
            const iw = new Interwhale(0, 6)
            const cuts = iw.cutInclusive(new Interwhale(-1, 4))
            assert(cuts.length === 1)
            assert(cuts[0].equals(new Interwhale(3, 6)))
        }
        {
            const iw = new Interwhale(0, 6)
            const cuts = iw.cutInclusive(new Interwhale(4, 9))
            assert(cuts.length === 1)
            assert(cuts[0].equals(new Interwhale(0, 5)))
        }

        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 2))
            boi.xor(new Interwhale(5, 7))
            const spected = [0, 1, 5, 6]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 2))
            boi.xor(new Interwhale(2, 7))
            const spected = [0, 6]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 2))
            boi.xor(new Interwhale(0, 2))
            assert(boi.getPoints().length === 0)
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 5))
            boi.xor(new Interwhale(-2, 4))
            const spected = [-2, 0, 3, 4]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 5))
            boi.xor(new Interwhale(2, 9))
            const spected = [0, 2, 4, 8]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 5))
            boi.xor(new Interwhale(-2, 9))
            const spected = [-2, 0, 4, 8]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 7))
            boi.xor(new Interwhale(2, 6))
            const spected = [0, 2, 5, 6]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 7))
            boi.xor(new Interwhale(5, 7))
            const spected = [0, 5]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 7))
            boi.xor(new Interwhale(0, 5))
            const spected = [4, 6]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }
        {
            const boi = new BagOfInterwhales()
            boi.xor(new Interwhale(0, 7))
            boi.xor(new Interwhale(4, 7))
            const spected = [0, 4]
            assert(boi.getPoints().every((p, i) => p === spected[i]))
        }

        return new Solvution(
            new LavaductLagoon(input).shweeb()
        )
    }
    
    solvePartTwo(input: ArtsyDwarf[]): Solvution {
        return new Solvution(
            new LavaductLagoon(input, true).shweeb()
        )
    }

}
