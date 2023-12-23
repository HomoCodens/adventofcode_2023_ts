import SolverBase, { Solvution } from "./solverbase.js";

export default class SolverDay01 extends SolverBase<string[]> {
    static override day = 1

    prepareInput(input: string): string[] {
        return input.lines().filter(line => line.length > 0)
    }

    override solvePartOne(parsedInput: string[]): Solvution {
        return new Solvution(
            this.calculateSolution(parsedInput.map(this.getDigitsPartOne)),
            '$$... Whee, I can fly!'
        )
    }

    override solvePartTwo(parsedInput: string[]): Solvution {
        return new Solvution(
            this.calculateSolution(parsedInput.map((line) => [
                this.getFirstDigitPartTwo(line),
                this.getLastDigitPartTwo(line)
            ])),
            'Oh Sh!t, $$...'
        )
    }

    private findHumanNumber(str: string): number {
        const numberses = {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9
        }

        for(let [human, compooter] of Object.entries(numberses)) {
            if(str.startsWith(human) || str.endsWith(human)) {
                return compooter
            }
        }

        return NaN
    }

    private getDigitsPartOne(line: string): [number, number] {
        const numbers = line.csvNumbers('', null, true)
        const nNumbers = numbers.length
        return [
            numbers[0],
            numbers[nNumbers - 1],
        ]
    }

    private getFirstDigitPartTwo(line: string, likeARogue = false): number {
        const letters = line.split('')

        if(likeARogue) {
            letters.reverse()
        }

        let readBuffer = ''
        for(const ltr of letters) {
            const parsed = Number(ltr)
            if(!Number.isNaN(parsed)) {
                return parsed
            } else {
                readBuffer = likeARogue ? ltr + readBuffer : readBuffer + ltr
                const parsedHumanreadable = this.findHumanNumber(readBuffer)
                if(!Number.isNaN(parsedHumanreadable)) {
                    return parsedHumanreadable
                }
            }
        }
        
        return NaN
    }

    private getLastDigitPartTwo(line: string): number {
        return this.getFirstDigitPartTwo(line, true)
    }

    private calculateSolution(digitz: [number, number][]): number {
        return digitz.reduce((acc, [firstDigit, lastDigit]) => acc + 10*firstDigit + lastDigit, 0)
    }
}
