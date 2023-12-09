import * as fs from 'fs'
import path from 'path'
import { padNumber } from './helpers'

export class InputReader {
    private root: string

    constructor(root: string = './input') {
        this.root = root
    }

    readInput(day: number): string {
        return this.read(path.join(
            this.root,
            `day${padNumber(day)}`,
            'input.txt'
        ))
    }

    readExample(day: number, example: number): [string, string] {
        // TODO: some sort of fancy self-verifying ExpectedSolution class
        return [
            this.read(
                path.join(
                    this.root,
                    `day${padNumber(day)}`,
                    `example${padNumber(example)}.txt`
                )
            ),
            this.read(
                path.join(
                    this.root,
                    `day${padNumber(day)}`,
                    `example${padNumber(example)}.solution.txt`
                )
            )
        ]
    }

    private read(path: string): string {
        if(!fs.existsSync(path)) {
            throw 'Catch!'
        }
    
        return fs.readFileSync(path).toString()
    }
}