import SolverBase, { Solvution } from './solverbase'
import '../util/aochelpers'
import { boolean, number } from 'mathjs'
import { up } from 'inquirer/lib/utils/readline'

class RockPattern {
    rows: number[]
    cols: number[]

    get height() {
        return this.rows.length
    }

    get width() {
        return this.cols.length
    }

    constructor(rows: number[], cols: number[]) {
        this.rows = rows
        this.cols = cols
    }

    static fromString(def: string): RockPattern {
        const bitMap = def.lines().map((line) => line.csv('', (char) => char === '.' ? 0 : 1))
        const rows = bitMap.map((row) => RockPattern.bashBitsIntoNumber([...row].reverse()))
                                            
        const cols = Array.seq(bitMap[0].length)
                        .map((colIndex) => bitMap.map((row) => row[colIndex]))
                        .map((col) => RockPattern.bashBitsIntoNumber([...col].reverse()))
        return new RockPattern(rows, cols)
    }

    private static bashBitsIntoNumber(bits: number[]): number {
        return bits.reduce((row: number, bit: number, exponent: number): number => row + bit*(2**exponent), 0)
    }

    findMirrorageIndex(): number {
        return this.findHorizontalMirrorage() + this.findVerticalMirrorage()
    }

    findTheOtherOne(): number {
        const horizontal = this.findHorizontalMirrorage(true)
        const vanillaHorizontal = this.findHorizontalMirrorage()
        if(horizontal !== vanillaHorizontal) {
            return horizontal
        }

        return this.findVerticalMirrorage(true)
    }

    private findHorizontalMirrorage(smudge: boolean = false): number {
        for(let eenieBetweenie = 0; eenieBetweenie < this.height; eenieBetweenie++) {
            if(this.isHorizontallyMirroredAt(eenieBetweenie, smudge)) {
                return 100*(eenieBetweenie + 1)
            }
        }

        return 0
    }

    private isHorizontallyMirroredAt(split: number, smudge: boolean = false): boolean {
        return this.isMirroredAt(split, this.rows, smudge)
    }

    private findVerticalMirrorage(smudge: boolean = false): number {
        for(let eenieBetweenie = 0; eenieBetweenie < this.width; eenieBetweenie++) {
            if(this.isVerticallyMirroredAt(eenieBetweenie, smudge)) {
                return eenieBetweenie + 1
            }
        }

        return 0
    }

    private isVerticallyMirroredAt(split: number, smudge: boolean = false): boolean {
        return this.isMirroredAt(split, this.cols, smudge)
    }

    private isMirroredAt(split: number,
        strips: number[],
        smudge: boolean = false,
        upwardFront: number = split,
        downwardFront: number = split + 1): boolean {
        if(split === strips.length - 1) {
            return false
        }

        while(upwardFront >= 0 && downwardFront < strips.length) {
            if((!smudge) && (strips[upwardFront] != strips[downwardFront])) {
                return false
            }

            if(smudge) {
                const differingBit = this.getDifferingBit(strips[upwardFront], strips[downwardFront])
                if(differingBit > 0) {
                    if(this.isMirroredAt(
                        split,
                        this.flipBitIn(strips, upwardFront, differingBit),
                        false,
                        upwardFront,
                        downwardFront)) {
                        return true
                    }
                }
            }

            upwardFront--
            downwardFront++
        }

        return !smudge
    }

    private getDifferingBit(a: number, b: number) : number {
        const aXORb = a ^ b
        return aXORb && ((aXORb & (aXORb - 1)) === 0) ? aXORb : 0
    }

    private flipBitIn(strips: number[], toFlip: number, bit: number): number[] {
        const out = [...strips]
        out[toFlip] = out[toFlip] ^ bit
        return out
    }
}

export default class SolverDay13 extends SolverBase<RockPattern[]> {
    static override day = 13

    prepareInput(rawInput: string): RockPattern[] {
        return rawInput.lines('\n\n').map((pattern) => RockPattern.fromString(pattern))
    }

    solvePartOne(input: RockPattern[]): Solvution {
        return new Solvution(
            input.map((pattern) => pattern.findMirrorageIndex()).sum()
        )
    }
    
    solvePartTwo(input: RockPattern[]): Solvution {
        return new Solvution(
            input.map((pattern) => pattern.findTheOtherOne()).sum()
        )
    }

}
        