import SolverBase, { Solvution } from './solverbase'

enum HandType {
    HighCard = 0,
    OnePair,
    TwoPair,
    ThreeOfAKind,
    FullHouse,
    FourOfAKind,
    Cheater,
}

class Card {
    value: string

    get strength(): number {
        const strengths: { [k: string]: number } = {
            '2': 0,
            '3': 1,
            '4': 2,
            '5': 3,
            '6': 4,
            '7': 5,
            '8': 6,
            '9': 7,
            'T': 8,
            'J': 9,
            'Q': 10,
            'K': 11,
            'A': 12,
        }

        return strengths[this.value]
    }

    constructor(value: string) {
        this.value = value
    }
}

class Hand {
    cards: Card[]
    bet: number

    constructor(cards: Card[], bet: number) {
        this.cards = cards
        this.bet = bet
    }

    static fromString(def: string) {
        const [hand, bet, ..._] = def.split(' ')
        return new Hand(
            hand.split('').map((c) => new Card(c)),
            +bet
        )
    }

    cardsOrderedByFrequency(): Card[] {
        type Map = { [key: string]: number }
        const freqs: Map = this.cards.reduce((freq: Map, card: Card): Map => {
            freq[card.value] = (freq[card.value] + 1) || 1
            return freq
        }, {} as Map)
        return Object.entries(freqs).sort((a, b) => b[1] - a[1]).flatMap(([cardValue, n]) => (new Array(n)).fill(n).map(() => new Card(cardValue)));
    }

    handType(): HandType {
        const orderedCards = this.cardsOrderedByFrequency().map((x) => x.value)
        
        // "State Machine" / "Decision Tree"
        if(orderedCards[0] === orderedCards[1]) {
            if(orderedCards[1] === orderedCards[2]) {
                if(orderedCards[2] === orderedCards[3]) {
                    if(orderedCards[3] === orderedCards[4]) {
                        return HandType.Cheater
                    } else {
                        return HandType.FourOfAKind
                    }
                } else {
                    if(orderedCards[3] === orderedCards[4]) {
                        return HandType.FullHouse
                    } else {
                        return HandType.ThreeOfAKind
                    }
                }
            } else {
                if(orderedCards[2] === orderedCards[3]) {
                    return HandType.TwoPair
                } else {
                    return HandType.OnePair
                }
            }
        } else {
            return HandType.HighCard
        }
    }

    compare(other: Hand): number {
        const relativeTypeStrength = this.handType() - other.handType()
        if(relativeTypeStrength === 0) {
            for(let c = 0; c < 5; c++) { // badum-tss
                if(this.cards[c].strength !== other.cards[c].strength) {
                    return this.cards[c].strength - other.cards[c].strength
                }
            }
        }

        return relativeTypeStrength
    }
}

export default class SolverDay07 extends SolverBase<Hand[]> {
    static override day = 7

    prepareInput(rawInput: string): Hand[] {
        return rawInput.lines().map(Hand.fromString)
    }

    solvePartOne(input: Hand[]): Solvution {
        const sortedHands = input.sort((a, b) => a.compare(b))
        return new Solvution(
            sortedHands.reduce((winnings, hand, i) => winnings + (i+1)*hand.bet, 0)
        )
    }
    
    solvePartTwo(input: Hand[]): Solvution {
        return new Solvution(
            'Answer goes here'
        )
    }

}
        