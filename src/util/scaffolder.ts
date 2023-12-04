import * as fs from 'fs'
import path from 'path'
import { padNumber } from './helpers'

export default class Scaffolder {
    root: string

    constructor(root: string) {
        this.root = root
    }

    scaffoldDay(day: number) {
        const dayPadded = padNumber(day)

        const solver = path.join(
            this.root,
            'src',
            'solvers',
            `solverday${dayPadded}.ts`
        )

        if(fs.existsSync(solver)) {
            // TODO: handle more gracefully ;)
            throw `${solver} already exists. Get it together, man.`
        }

        fs.writeFileSync(solver, `import SolverBase, { Solvution } from './solverbase'
        
export default class SolverDay${dayPadded} extends SolverBase<TInput> {
    static override day = ${day}

    prepareInput(rawInput: string): TInput {
        return rawInput.trim().split('\\n')
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
        `)

        const index = path.join(
            this.root,
            'src',
            'solvers',
            'index.ts'
        )

        let indexContent = fs.readFileSync(index).toString()

        indexContent = indexContent.replace(
            /\n\nconst Solvers = \[([^]+)\]/,
            `\nimport SolverDay${dayPadded} from './solverday${dayPadded}'\n\nconst Solvers = \[$1    SolverDay${dayPadded},\n\]`)

        fs.writeFileSync(index, indexContent)

        fs.mkdirSync(path.join(this.root, 'input', `day${dayPadded}`))
        fs.writeFileSync(path.join(this.root, 'input', `day${dayPadded}`, 'example01.txt'), '')
        fs.writeFileSync(path.join(this.root, 'input', `day${dayPadded}`, 'example01.solution.txt'), '')
        fs.writeFileSync(path.join(this.root, 'input', `day${dayPadded}`, 'input.txt'), '')
    }
}