import * as fs from 'fs'
import path from 'path'

export class InputReader {
    private root: string

    constructor(root: string) {
        this.root = root
    }

    readInput(day: number): string {
        return this.read(path.join(
            this.root,
            `day${this.padNumber(day)}`,
            'input.txt'
        ))
    }

    readExample(day: number, example: number): [string, string] {
        // TODO: some sort of fancy self-verifying ExpectedSolution class
        return [
            this.read(
                path.join(
                    this.root,
                    `day${this.padNumber(day)}`,
                    `example${this.padNumber(example)}.txt`
                )
            ),
            this.read(
                path.join(
                    this.root,
                    `day${this.padNumber(day)}`,
                    `example${this.padNumber(example)}.solution.txt`
                )
            )
        ]
    }
    
    private padNumber(x: number): string {
        return `${x.toString().padStart(2, '0')}`
    }

    private read(path: string): string {
        if(!fs.existsSync(path)) {
            throw 'Catch!'
        }
    
        return fs.readFileSync(path).toString()
    }
}