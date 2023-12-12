import Point from '@mapbox/point-geometry'
import { transpose } from 'mathjs'

import SolverBase, { Solvution } from './solverbase'
import { manhattanDistance } from '../util/aochelpers'

const NonPoint = new Point(-1, -1)

class Verse {
    galaxies: Point[]
    starlessVoidsX: number[] = []
    starlessVoidsY: number[] = []

    constructor(galaxies: Point[], starlessVoidsX: number[] = [], starlessVoidsY: number[] = []) {
        this.galaxies = galaxies,
        this.starlessVoidsX = starlessVoidsX
        this.starlessVoidsY = starlessVoidsY
    }

    static fromString(def: string): Verse {
        const chars = def.lines().map((line) => line.lines('').map((c) => c === '#' ? 1 : 0))

        const galaxies: Point[] = chars.flatMap((row, i) => {
            return row.map((cell, j) => {
                if(cell === 1) {
                    return new Point(j, i)
                } else {
                    return NonPoint
                }
            })
        }).filter((p) => !p.equals(NonPoint))

        const rowsWithoutStars = chars.map((row, i) => ({
            index: i,
            hasStars: row.some((c) => c === 1)
        }))
        .filter(({ hasStars }) => !hasStars)
        .map(({ index }) => index)
        const colsWithoutStars = transpose(chars).map((row, i) => ({
            index: i,
            hasStars: row.some((c) => c === 1)
        }))
        .filter(({ hasStars }) => !hasStars)
        .map(({ index }) => index)

        return new Verse(galaxies, colsWithoutStars, rowsWithoutStars)
    }

    starlessityIndex(i: number, j: number) {
        const galaxyI = this.galaxies[i]
        const galaxyJ = this.galaxies[j]

        const starlessityX = this.starlessVoidsX.filter((col) => col > Math.min(galaxyI.x, galaxyJ.x) && col < Math.max(galaxyI.x, galaxyJ.x))
        const starlessityY = this.starlessVoidsY.filter((row) => row > Math.min(galaxyI.y, galaxyJ.y) && row < Math.max(galaxyI.y, galaxyJ.y))

        if(i === 4 && j === 8) {
            console.log(starlessityX)
            console.log(starlessityY)
        }

        return starlessityX.length + starlessityY.length
    }

    cumulativeDistances(expansionFactor: number = 1) {
        expansionFactor = expansionFactor > 1 ? expansionFactor - 1 : expansionFactor
        let out = 0
        for(let i = 0; i < this.galaxies.length - 1; i++) {
            for(let j = i + 1; j < this.galaxies.length; j++) {
                out += manhattanDistance(this.galaxies[i], this.galaxies[j]) + expansionFactor*this.starlessityIndex(i, j)
            }
        }

        return out
    }
}

export default class SolverDay11 extends SolverBase<Verse> {
    static override day = 11

    prepareInput(rawInput: string): Verse {
        return Verse.fromString(rawInput)
    }

    solvePartOne(input: Verse): Solvution {
        return new Solvution(
            input.cumulativeDistances(1)
        )
    }
    
    solvePartTwo(input: Verse): Solvution {
        return new Solvution(
            input.cumulativeDistances(1e6)
        )
    }

}
