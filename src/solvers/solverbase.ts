import '../util/aochelpers'

export type SolvutionValue = string | number

export class Solvution {
    value: SolvutionValue
    fancyFunnyStringTemplate: string = 'Aw snap, he couldn\'t come up with anything... (\'s $$ though)'

    constructor(value: SolvutionValue, template: string = '') {
        this.value = value
        if(template !== '') {
            this.fancyFunnyStringTemplate = template
        }
    }

    get fancyFunnyString(): string {
        return this.fancyFunnyStringTemplate.replace('$$', this.value.toString())
    }

    toString(funnynessLevel = false): string {
        return funnynessLevel ? this.fancyFunnyString : this.value.toString()
    }
}

export default abstract class SolverBase<T> {
    // TODO: have 'crunching day xx' be customizable
    static day: number

    abstract prepareInput(rawInput: string): T

    async getSolutionOne(rawInput: string): Promise<Solvution> {
        return this.solvePartOne(this.prepareInput(rawInput))
    }

    async getSolutionTwo(rawInput: string): Promise<Solvution> {
        return this.solvePartTwo(this.prepareInput(rawInput))
    }

    async getBothSolutions(rawInput: string): Promise<Solvution[]> {
        return Promise.all([
            this.getSolutionOne(rawInput),
            this.getSolutionTwo(rawInput),
        ])
    }

    abstract solvePartOne(input: T): Solvution

    abstract solvePartTwo(input: T): Solvution
}