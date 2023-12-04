import SolverBase, { Solvution } from './solverbase'

class ScritchCard {
    winningNumbers: Set<Number>
    drawnNumbers: Set<Number>

    get nMatches(): number {
        return [...this.winningNumbers].filter((number) => this.drawnNumbers.has(number)).length
    }

    get score(): number {
        if(this.nMatches > 0) {
            return 2 ** (this.nMatches - 1)
        } else {
            return 0
        }
    }

    private constructor(winners: Set<Number>, havers: Set<Number>) {
        this.winningNumbers = winners
        this.drawnNumbers = havers
    }

    static fromString(def: string): ScritchCard {
        const parts = def.replace(/Card \d+: /, '')
                            .split(' | ')
                            .map((half: string) => 
                                    half.split(' ')
                                        .map(Number)
                                        .filter((x) => !Number.isNaN(x) && x > 0)
                                )

        return new ScritchCard(
            new Set(parts[0]),
            new Set(parts[1])
        )
    }
}
        
export default class SolverDay04 extends SolverBase<ScritchCard[]> {
    static override day = 4

    prepareInput(rawInput: string): ScritchCard[] {
        return rawInput.trim().split('\n').map(ScritchCard.fromString)
    }

    solvePartOne(input: ScritchCard[]): Solvution {
        return new Solvution(
            input.reduce((acc: number, card: ScritchCard) => acc + card.score, 0)
        )
    }

    solvePartTwo(input: ScritchCard[]): Solvution {
        let tickets = (new Array(input.length)).fill(1)
        for(let currentTicket = 0; currentTicket < input.length; currentTicket++) {
            const winnings = input[currentTicket].nMatches
            for(let nextTicket = currentTicket + 1; nextTicket <= currentTicket + winnings; nextTicket++) {
                tickets[nextTicket] += tickets[currentTicket]
            }
        }

        return new Solvution(
            tickets.reduce((acc, x) => acc + x)
        )
    }

}
        