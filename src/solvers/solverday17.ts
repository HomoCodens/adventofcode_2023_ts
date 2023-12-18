import SolverBase, { Solvution } from './solverbase'

export default class SolverDay17 extends SolverBase<unknown> {
    static override day = 17

    prepareInput(rawInput: string): unknown {
        return rawInput.lines()
    }

    solvePartOne(input: unknown): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }
    
    solvePartTwo(input: unknown): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

}
