import { lcm } from 'mathjs'
import SolverBase, { Solvution } from './solverbase'

enum ModuleType {
    'flipflip',
    'conjunction',
    'brotkasten',
    'holeOfBlackness',
}

type Pulse = {
    targets?: string[],
    onOffity?: boolean,
    sender? : string,
    fires: boolean
}

abstract class Module {
    constructor(public id: string, public targets: string[]) {}

    // Typo, but an interesting idea... 🤔
    static FLIPFLIP = '%'
    static CONJUNCTION = '&'

    abstract type: ModuleType
    inputs: string[] = []

    static fromString(def: string): Module {
        console.log(def)
        const {spec, targetsCsv} = /^(?<spec>.+) -> (?<targetsCsv>.*)$/.exec(def.trim())?.groups!

        const targets = targetsCsv.split(', ')

        if(spec === 'broadcaster') {
            return new BrotKasten('broadcaster', targets)
        }

        // Stupid. and I only sort of hate it.
        const [kind, ...idChars] = spec
        const id = idChars.join('')

        if(kind === Module.FLIPFLIP) {
            return new FlippedyFloppedy(id, targets)
        }

        return new Conjunctivication(id, targets)
    }
    
    abstract excite(sender: string, pulse: boolean): boolean | undefined
    
    registerInput(input: string) {
        this.inputs.push(input)
    }

    poke(sender: string, pulse: boolean): Pulse {
        const meSponse = this.excite(sender, pulse)
        if(meSponse !== undefined) {
            return {
                targets: this.targets,
                onOffity: meSponse,
                fires: true,
                sender: this.id,
            }
        }

        return {
            fires: false
        }
    }
}

class FlippedyFloppedy extends Module {
    override type = ModuleType.flipflip
    state = false
    
    override excite(sender: string, pulse: boolean): boolean | undefined {
        if(pulse) {
            return undefined
        }

        this.state = !this.state
        return this.state
    }
}

class Conjunctivication extends Module {
    state: { [key in string]: boolean} = {}
    override type = ModuleType.conjunction
    
    override excite(sender: string, pulse: boolean): boolean | undefined {
        this.state[sender] = pulse
        if(Object.values(this.state).every(Boolean)) {
            return false
        } else {
            return true
        }
    }

    registerInput(id: string) {
        super.registerInput(id)
        this.state[id] = false
    }
}

// Hi to all my friends from <Nerezza>!
class BrotKasten extends Module {
    override type = ModuleType.brotkasten

    override excite(sender: string, pulse: boolean): boolean | undefined {
        return pulse
    }
}

class Sink extends Module {
    override type = ModuleType.holeOfBlackness

    constructor(id: string) {
        super(id, [])
    }

    override excite(sender: string, pulse: boolean): boolean | undefined {
        return undefined    
    }
}

class Masheen {
    lowPulsesSended = 0
    highPulsesSended = 0
    findies: {[k in string] : number } = {}
    nPushes = 0

    nextPulses: Pulse[] = []
    
    constructor(public modules: { [k in string]: Module } = {}) {
        const machinesWhatItDoesNotGive = Object.values(modules)
                                                .flatMap(({ targets }) => targets)
                                                .filter((id) => !modules[id])
        machinesWhatItDoesNotGive.forEach((sinkId) => modules[sinkId] = new Sink(sinkId))

        Object.values(modules).forEach((module) => {
            module.targets.forEach((targetId) => {
                modules[targetId].registerInput(module.id)
            })
        });
    }

    static fromString(def: string): Masheen {
        return new Masheen(def.lines().map((line) => Module.fromString(line)).reduce((acc: any, mod: Module) => {
            acc[mod.id] = mod
            return acc
        }, {}))
    }

    findRx(): number {
        // Assuming all the masheens are build like that
        const inputsOfRxInput = this.modules[this.modules['rx'].inputs[0]].inputs
        inputsOfRxInput.forEach((i) => this.findies[i] = 0)

        while(Object.values(this.findies).some((x) => x === 0)) {
            this.pushTheButtonPuPushTheButton()
        }
        
        return Object.values(this.findies).reduce((acc: number, pushes: number): number => lcm(acc, pushes))
    }

    pushTheButtonPuPushTheButton() {
        this.nextPulses = [{
            targets: ['broadcaster'],
            onOffity: false,
            fires: true,
            sender: 'butten',
        }]

        this.nPushes++
        
        this.lowPulsesSended += 1

        while(this.nextPulses.length) {
            this.step()
            
            Object.keys(this.findies).forEach((f) => {
                if(this.findies[f] === 0)
                {
                    const pulsesToFindie = this.nextPulses.filter(({ targets }) => targets?.includes(f))
                    if(pulsesToFindie.length > 0 && pulsesToFindie.some((p) => p.onOffity === false)) {
                        this.findies[f] = this.nPushes
                    } 
                }
            })
        }

    }

    step(): void {
        this.nextPulses = this.nextPulses.flatMap((pulse) => {
            return pulse.targets!.map((targetId) => {
                const response = this.modules[targetId].poke(pulse.sender!, pulse.onOffity!)
                if(response.fires) {
                    if(response.onOffity) {
                        this.highPulsesSended += response.targets!.length
                    } else {
                        this.lowPulsesSended += response.targets!.length
                    }
                }
                return response
            })
        }).filter(({ fires }) => fires)
    }

    toGraphViz(): string {
        const entries = Object.values(this.modules).flatMap((mod) => {
            const {id, targets, type} = mod
            const label = `"${type === ModuleType.conjunction ? '&' : type === ModuleType.flipflip ? '%' : ''}${id}"`
            return [`  ${mod.id} [label=${label}]`, ...targets.map((t) => `  ${id} -> ${t}`)]
        })
        return `digraph masheen {\n${entries.join('\n')}\n}`
    }
}

export default class SolverDay20 extends SolverBase<Masheen> {
    static override day = 20

    prepareInput(rawInput: string): Masheen {
        return Masheen.fromString(rawInput)
    }

    solvePartOne(input: Masheen): Solvution {
        for(let i = 0; i < 1000; i++) {
            input.pushTheButtonPuPushTheButton()
        }
        return new Solvution(
            input.highPulsesSended * input.lowPulsesSended
        )
    }
    
    solvePartTwo(input: Masheen): Solvution {
        return new Solvution(
            input.findRx(),
            '$$ pushes. Phew, thats gonna take a while..'
        )
    }

}
        