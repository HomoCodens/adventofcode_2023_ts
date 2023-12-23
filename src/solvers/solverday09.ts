import SolverBase, { Solvution } from './solverbase'
        
export default class SolverDay09 extends SolverBase<number[][][]> {
    static override day = 9

    prepareInput(rawInput: string): number[][][] {
        return rawInput.lines().map((line) => line.csvNumbers(/ +/))
                                .map((sequence) => this.differentiate(sequence).reverse())
    }

    solvePartOne(input: number[][][]): Solvution {
        return new Solvution(
            input.map((diffs) => this.getNextValueOf(diffs)).sum(),
            'Continuing the sequences forward, we get $$.'
        )
    }
    
    solvePartTwo(input: number[][][]): Solvution {
        return new Solvution(
            input.map((diffs) => this.getPreviousValueOf(diffs)).sum(),
            'Looking back beyond the edge of the sequenceverses, we arrive at a sensible $$.'
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

    getNextValueOf(diffs: number[][]): number {
        let integrated = diffs.reduce((next, x) => next + x[x.length - 1], 0)

        return integrated
    }

    getPreviousValueOf(diffs: number[][]): number {
        let integrated = diffs.reduce((next, x) => x[0] - next, 0)

        return integrated
    }
}
        