import SolverBase, { Solvution } from './solverbase'

class MappingInterval {
    sourceStart: number
    destinationStart: number
    length: number

    constructor(sourceStart: number, destinationStart: number, length: number) {
        this.sourceStart = sourceStart
        this.destinationStart = destinationStart
        this.length = length
    }

    static fromString(def: string): MappingInterval {
        const params = def.csvNumbers(' ')
        return new MappingInterval(params[1], params[0], params[2])
    }

    contains(value: number): boolean {
        const offset = value - this.sourceStart
        return offset >= 0 && offset < this.length
    }
}

class Mapping {
    type: string
    intervals: MappingInterval[]

    constructor(type: string, intervals: MappingInterval[]) {
        this.type = type
        this.intervals = intervals
    }

    static fromString(def: string): Mapping {
        const parts = /(?<type>[\w-:]+) map:(?<intervals>[^]+)/.exec(def)?.groups
        if(parts === undefined) {
            return new Mapping('nil', [])
        }

        const intervals = parts['intervals'].lines().map(MappingInterval.fromString)

        return new Mapping(
            parts['type'],
            intervals,
        )
    }


    mapValue(value: number): number {
        const theInterval = this.intervals.filter((interval) => interval.contains(value)).at(0)

        if(theInterval === undefined) {
            return value
        } else {
            return theInterval.destinationStart + value - theInterval.sourceStart
        }
    }
}

class IslandAlmanac {
    seeds: number[]
    mappings: Mapping[]

    constructor(seeds: number[], mappings: Mapping[]) {
        this.seeds = seeds
        this.mappings = mappings
    }

    static fromString(def: string): IslandAlmanac {
        const parts = /seeds: (?<seeds>[\d ]+\n)(?<mappings>[^]+)/g.exec(def)
        if(parts?.groups === undefined) {
            return new IslandAlmanac([], [])
        }

        const seeds = parts.groups['seeds'].csvNumbers(' ')
        const mappings = parts.groups['mappings'].lines('\n\n').map((line) => Mapping.fromString(line.trim()))

        return new IslandAlmanac(seeds, mappings)
    }

    mapValue(value: number) {
        return this.mappings.reduce((mapped, mapping) => mapping.mapValue(mapped), value)
    }

    getMappedSeeds(): number[] {
        return this.seeds.map((seed) => this.mapValue(seed))
    }

    getMappedSeedRanges(): number {
        let minLoc = Infinity
        for(let i = 0; i < this.seeds.length - 1; i += 2) {
            console.log(i)
            const rangeStart = this.seeds[i]
            const rangeLength = this.seeds[i+1]
            for(let j = 0; j < rangeLength; j++) {
                const mapped = this.mapValue(rangeStart + j)
                if(mapped < minLoc) {
                    minLoc = mapped
                }
            }
        }
        return minLoc
    }
}

export default class SolverDay05 extends SolverBase<IslandAlmanac> {
    static override day = 5

    prepareInput(rawInput: string): IslandAlmanac {
        return IslandAlmanac.fromString(rawInput.trim())
    }

    solvePartOne(input: IslandAlmanac): Solvution {
        return new Solvution(
            Math.min(...input.getMappedSeeds())
        )
    }
    
    solvePartTwo(input: IslandAlmanac): Solvution {
        return new Solvution(
            input.getMappedSeedRanges()
        )
    }

}
        