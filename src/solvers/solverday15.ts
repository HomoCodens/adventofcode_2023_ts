import SolverBase, { Solvution } from './solverbase'

class Lens {
    constructor(public tag: string, public focalLength: number) {}

    toWastl(): string {
        return `[${this.tag} ${this.focalLength}]`
    }
}

abstract class Instruction {
    constructor(protected tag: string) {}
    
    static fromString(def: string): Instruction {
        const [tag, focalLength, ..._] = def.split('=')

        if(focalLength) {
            return new Istruction(tag, Number.parseInt(focalLength))
        }
        
        return new Isntruction(def.replace(/-$/, ''))
    }

    abstract toString(): string
    abstract apply(box: Bahks): void // Mutability, ew...

    hash(tagOnly: boolean = true): number {
        return tagOnly ? this.holidayASCIIStringHelper(this.tag) : this.holidayASCIIStringHelper(this.toString())
    }

    private holidayASCIIStringHelper(x: string): number {
        return x.csv('', (char: string) => char.charCodeAt(0))
                .reduce((hash, x) => (17*(hash + x)) % 256, 0)
    }
}

class Isntruction extends Instruction {
    toString(): string {
        return this.tag + '-'
    }

    apply(box: Bahks): void {
        box.removeLens(this.tag)
    }
}

class Istruction extends Instruction {
    constructor(tag: string, private focalLength: number) {
        super(tag)
    }

    toString(): string {
        return this.tag + '=' + this.focalLength
    }

    apply(box: Bahks): void {
        box.addLens(new Lens(this.tag, this.focalLength))
    }

}

class Bahks {
    lensis: Lens[] = []

    constructor(private id: number) {}

    addLens(lens: Lens): void {
        const existing = this.findLens(lens.tag)
        if(existing >= 0) {
            this.lensis.splice(existing, 1, lens)
        } else {
            this.lensis.push(lens)
        }
    }

    removeLens(tag: string): void {
        const existing = this.findLens(tag)
        if(existing >= 0) {
            this.lensis.splice(existing, 1)
        }
    }

    findLens(tag: string): number {
        return this.lensis.findIndex((l) => l.tag === tag)
    }

    hash(): number {
        if(this.isEmpty()) {
            return 0
        }

        return (this.id + 1)*this.lensis.map((l, li) => l.focalLength*(li + 1)).sum()
    }

    isEmpty(): boolean {
        return this.lensis.length === 0
    }

    toWastl(): string {
        return `Box ${this.id}: ${this.lensis.map((l) => l.toWastl()).join(' ')}`
    }
}

class LavaPlace {
    // Don't ask me why I thought this was an angular thing until now... 🤦🏻
    constructor(private boxes: Bahks[], private instructions: Instruction[]) {}

    static fromString(def: String): LavaPlace {
        const boxes = Array.seq(256).map((i) => new Bahks(i))
        const instructions = def.csv(',', Instruction.fromString)
        return new LavaPlace(boxes, instructions)
    }

    calibrationHash(): number {
        return this.instructions.map((i) => i.hash(false)).sum()
    }

    run(): void {
        this.instructions.forEach((instruction) => {
            const targetBox = instruction.hash()
            instruction.apply(this.boxes[targetBox])
        })
    }

    finalHash(): number {
        return this.boxes.map((b) => b.hash()).sum()
    }

    toWastl(): string {
        return this.boxes.filter((b) => !b.isEmpty()).map((b) => b.toWastl()).join('\n')
    }
}

export default class SolverDay15 extends SolverBase<LavaPlace> {
    static override day = 15

    prepareInput(rawInput: string): LavaPlace {
        return LavaPlace.fromString(rawInput)
    }

    solvePartOne(input: LavaPlace): Solvution {
        return new Solvution(
            input.calibrationHash(),
            'Calibrating... The hash is $$.',
        )
    }
    
    solvePartTwo(input: LavaPlace): Solvution {
        input.run()
        return new Solvution(
            input.finalHash(),
            'The final focusing power of this contraption works out to about exactly $$.'
        )
    }
}
        