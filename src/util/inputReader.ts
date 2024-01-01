import { padNumber } from './helpers'
import FsThing from './fsthing'
import { Input, InputWithKnownAnswer } from './input'

export class InputReader {
    private fsHelper: FsThing

    constructor(root: string = './') {
        this.fsHelper = new FsThing(root)
    }

    listExamples(day: number): string[] {
        return this.fsHelper.listAvailableExampleFiles(day)
    }

    hasInput(day: number): boolean {
        return this.fsHelper.fileExists(this.fsHelper.dayInput(day))
    }

    readInput(day: number): Input {
        return new Input(this.fsHelper.readFile(this.fsHelper.fileIn(this.fsHelper.dayInput(day), 'input.txt')))
    }

    readExample(day: number, example: number): InputWithKnownAnswer {
        return new InputWithKnownAnswer(
            this.fsHelper.readFile(this.fsHelper.fileIn(this.fsHelper.dayInput(day), `example${padNumber(example)}.txt`)),
            this.fsHelper.readFile(this.fsHelper.fileIn(this.fsHelper.dayInput(day), `example${padNumber(example)}.solution.txt`)).trim(),
        )
    }
}