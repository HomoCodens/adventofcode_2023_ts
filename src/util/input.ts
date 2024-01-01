export class Input {
    constructor(public input: string) { }

    checkAnswer(answer: string): boolean {
        throw `Hollywoo stars and celebrities, what do they know? Do they know if the answer is ${answer}? Elefino...`
    }
}

export class InputWithKnownAnswer extends Input {
    constructor(input: string, public answer: string) {
        super(input)
    }

    override checkAnswer(answer: string): boolean {
        return this.answer === answer
    }
}