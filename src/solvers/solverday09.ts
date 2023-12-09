import * as maff from 'mathjs'

import SolverBase, { Solvution } from './solverbase'
        
export default class SolverDay09 extends SolverBase<number[][]> {
    static override day = 9

    prepareInput(rawInput: string): number[][] {
        return rawInput.lines().map((line) => line.csvNumbers(' '))
    }

    solvePartOne(input: number[][]): Solvution {
        return new Solvution(
            input.map((sequence) => this.getNextValueOf(sequence)).sum()
        )
    }
    
    solvePartTwo(input: number[][]): Solvution {
        return new Solvution(
            input.map((sequence) => this.getPreviousValueOf(sequence)).sum()
        )
    }

    differentiate(sequence: number[]): number[][] {
        let diffs = [ sequence ]
        while(true) {
            const nextDiff = diffs[diffs.length - 1].reduce((diff: number[], x, i, arr): number[] => {
                if(i > 0) {
                    diff.push(x - arr[i - 1])
                }
                return diff
            }, [])

            if(nextDiff.every((x) => x === 0)) {
                return diffs
            }

            diffs.push(nextDiff)
        }
    }

    getNextValueOf(sequence: number[]): number {
        let diffs = this.differentiate(sequence)

        let integrated = diffs.reverse().reduce((next, x) => next + x[x.length - 1], 0)

        return integrated
    }

    getPreviousValueOf(sequence: number[]): number {
        let diffs = this.differentiate(sequence)

        let integrated = diffs.reverse().reduce((next, x) => x[0] - next, 0)

        return integrated
    }
}
        