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

    constructor(value: string) {
        this.value = value
    }

    getStrength(wildJoker: boolean = false): number {
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

        if(wildJoker) {
            strengths['J'] = -1
        }

        return strengths[this.value]
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
        const [hand, bet] = def.split(' ')
        return new Hand(
            hand.split('').map((c) => new Card(c)),
            +bet
        )
    }

    cardsOrderedByFrequency(wildJoker: boolean = false): Card[] {
        type Map = { [key: string]: number }
        const freqs: Map = this.cards.reduce((freq: Map, card: Card): Map => {
            freq[card.value] = (freq[card.value] + 1) || 1
            return freq
        }, {} as Map)

        const nJokers = freqs['J']
        const hasJokers = nJokers !== undefined

        return Object.entries(freqs)
                        .sort((a, b) => b[1] - a[1])
                        .flatMap(([cardValue, n], i, arr) => {
                            if(i === 0 && wildJoker) {
                                if(cardValue === 'J') {
                                    if(n < 5) {
                                        cardValue = arr[1][0]
                                    }
                                } else if(hasJokers) {
                                    n = n + nJokers
                                }
                            }
                            return (new Array(n)).fill(n).map(() => new Card(cardValue))
                        })
    }

    handType(wildJoker: boolean = false): HandType {
        const orderedCards = this.cardsOrderedByFrequency(wildJoker).map((x) => x.value)
        
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

    compare(other: Hand, wildJoker: boolean = false): number {
        const relativeTypeStrength = this.handType(wildJoker) - other.handType(wildJoker)

        if(relativeTypeStrength === 0) {
            for(let c = 0; c < 5; c++) { // badum-tss
                if(this.cards[c].getStrength(wildJoker) !== other.cards[c].getStrength(wildJoker)) {
                    return this.cards[c].getStrength(wildJoker) - other.cards[c].getStrength(wildJoker)
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
        const sortedHands = input.sort((a, b) => a.compare(b, false))
        return new Solvution(
            sortedHands.reduce((winnings, hand, i) => winnings + (i+1)*hand.bet, 0),
            '$$ winnings, I\'m rich bebbeh!'
        )
    }
    
    solvePartTwo(input: Hand[]): Solvution {
        const sortedHands = input.sort((a, b) => a.compare(b, true))
        return new Solvution(
            sortedHands.reduce((winnings, hand, i) => winnings + (i+1)*hand.bet, 0),
            'Jokers, even better! Now we make $$. Wait...'
        )
    }

}
