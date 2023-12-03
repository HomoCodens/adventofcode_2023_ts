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
        
export default class SolverDay${dayPadded} extends SolverBase<T> {
    prepareInput(rawInput: string): T {
        return rawInput.trim().split('\\n')
    }

    solvePartOne(input: T): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }
    
    solvePartTwo(input: T): Solvution {
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
            /\n\nexport \{([^]+)\}/,
            `\nimport SolverDay${dayPadded} from './solverday${dayPadded}'\n\nexport \{$1    SolverDay${dayPadded},\n\}`)

        fs.writeFileSync(index, indexContent)
    }
}