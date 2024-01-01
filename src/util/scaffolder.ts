import { firstMissingInSequence, padNumber } from './helpers'
import FsThing from './fsthing'

export default class Scaffolder {
    fsHelper: FsThing

    constructor(root: string = './') {
        this.fsHelper = new FsThing(root)
    }

    nextUncreatedDay(): number {
        return firstMissingInSequence(this.fsHelper.listAvailableDays())
    }

    nextExampleForDay(day: number): number {
        return firstMissingInSequence(this.fsHelper.listAvailableExamples(day))
    }

    scaffoldDay(day: number) {
        const dayPadded = padNumber(day)
        const solver = this.fsHelper.daySolver(day)

        try {
            this.fsHelper.writeFile(solver, `import SolverBase, { Solvution } from './solverbase'
    
    export default class SolverDay${dayPadded} extends SolverBase<TInput> {
        static override day = ${day}
    
        prepareInput(rawInput: string): TInput {
            return rawInput.lines()
        }
    
        solvePartOne(input: TInput): Solvution {
            return new Solvution(
                'Answer goes here'
            )
        }
        
        solvePartTwo(input: TInput): Solvution {
            return new Solvution(
                'Answer goes here'
            )
        }
    
    }
    `
            )
        }
        catch {
            // TODO: handle more gracefully ;)
            throw `${solver} already exists. Get it together, man.`
        }

        const index = this.fsHelper.fileIn(
            this.fsHelper.solversRoot,
            'index.ts'
        )

        let indexContent = this.fsHelper.readFile(index)

        indexContent = indexContent.replace(
            /\n\nconst Solvers = \[([^]+)\]/,
            `\nimport SolverDay${dayPadded} from './solverday${dayPadded}'\n\nconst Solvers = [$1    SolverDay${dayPadded},\n]`)

        this.fsHelper.writeFile(index, indexContent)

        const inputRoot = this.fsHelper.dayInput(day)
        this.fsHelper.touchFile(this.fsHelper.fileIn(inputRoot, 'input.txt'))
        this.scaffoldExample(day)
    }

    scaffoldExample(day: number) {
        const inputRoot = this.fsHelper.dayInput(day)
        const nextUncreatedExample = padNumber(this.nextExampleForDay(day))
        this.fsHelper.touchFile(this.fsHelper.fileIn(inputRoot, `example${nextUncreatedExample}.txt`))
        this.fsHelper.touchFile(this.fsHelper.fileIn(inputRoot, `example${nextUncreatedExample}.solution.txt`))
    }
}