import SolverBase, { Solvution } from './solverbase'

class CoobRound {
    red: number
    green: number
    blue: number

    private constructor(red: number, green: number, blue: number) {
        this.red = red ?? 0
        this.green = green ?? 0
        this.blue = blue ?? 0
    }

    static fromString(def: string): CoobRound {
        const coobs = def.split(',')
        const params = coobs.reduce((acc: any, x: string) => {
            const params = x.trim().split(' ')
            acc[params[1]] = +params[0]
            return acc
        }, {})

        return new CoobRound(params.red, params.green, params.blue)
    }

    izLeegl(red: number, green: number, blue: number): boolean {
        return this.red <= red && this.green <= green && this.blue <= blue
    }
}

type GameParams = {
    id: number,
    rounds: string
} | undefined

class CoobGame {
    id: number
    rounds: CoobRound[]

    private static re = /^Game (?<id>\d+):(?<rounds>( \d+ \w+[,;]?)+)$/

    private constructor(id: number, rounds: CoobRound[]) {
        this.id = id
        this.rounds = rounds
    }

    static fromString(def: string): CoobGame {
        const params: GameParams = CoobGame.re.exec(def)?.groups as GameParams
        if(params) {
            return new CoobGame(+params.id, params.rounds.split(';').map(CoobRound.fromString))
        } else {
            throw 'Physics still works though, right?'
        }
    }

    izLeegl(red: number, green: number, blue: number): boolean {
        return this.rounds.every((r) => r.izLeegl(red, green, blue))
    }

    gitMaximinPower(): number {
        return Object.values<number>(this.rounds.reduce((acc: any, x) => {
            return {
                red: Math.max(acc.red, x.red),
                green: Math.max(acc.green, x.green),
                blue: Math.max(acc.blue, x.blue)
            }
        }, {
            red: 0,
            green: 0,
            blue: 0
        })).prod()
    }
}

export default class SolverDay02 extends SolverBase<CoobGame[]> {
    static override day = 2

    prepareInput(rawInput: string): CoobGame[] {
        return rawInput.lines().map(CoobGame.fromString)
    }

    solvePartOne(input: CoobGame[]): Solvution {
        return new Solvution(
            input.filter((g) => g.izLeegl(12, 13, 14)).reduce((acc: number, g: CoobGame) => acc + g.id, 0),
            'With R12G13B14 the IDs of possible games sum to $$.'
        )
    }

    solvePartTwo(input: CoobGame[]): Solvution {
        return new Solvution(
            input.map((g) => g.gitMaximinPower()).sum(),
            'The POWA of the minimul viable RGB sets is $$.'
        )
    }

}