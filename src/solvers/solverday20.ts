import SolverBase, { Solvution } from './solverbase'

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

    abstract type: string

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
    
    registerInput(input: string) { }

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
    override type = 'flipflip'
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
    state: any = {}
    override type = 'conjunction'
    
    override excite(sender: string, pulse: boolean): boolean | undefined {
        this.state[sender] = pulse
        if(Object.values(this.state).every(Boolean)) {
            return false
        } else {
            return true
        }
    }

    registerInput(id: string) {
        this.state[id] = false
    }
}

// Hi to all my friends from <Nerezza>!
class BrotKasten extends Module {
    override type = 'brotkasten'

    override excite(sender: string, pulse: boolean): boolean | undefined {
        return pulse
    }
}

class Sink extends Module {
    override type = 'holeOfBlackness'

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
    rxHitSinglely = false

    nextPulses: Pulse[] = []
    
    constructor(public modules: { [k in string]: Module } = {}) {
        const machinesWhatItDoesNotGive = Object.values(modules)
                                                .flatMap(({ targets }) => targets)
                                                .filter((id) => !modules[id])
        machinesWhatItDoesNotGive.forEach((sinkId) => modules[sinkId] = new Sink(sinkId))

        Object.values(modules).forEach((module) => {
            module.targets.forEach((targetId) => {
                const derGet = modules[targetId]
                if(derGet && derGet.type === 'conjunction') {
                    derGet.registerInput(module.id)
                }
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
        let nPushes = 0
        while(true) {
            console.log(++nPushes)
            this.pushTheButtonPuPushTheButton()
        }
    }

    pushTheButtonPuPushTheButton() {
        this.nextPulses = [{
            targets: ['broadcaster'],
            onOffity: false,
            fires: true,
            sender: 'butten',
        }]
        
        this.lowPulsesSended += 1

        while(this.nextPulses.length) {
            this.step()
            
            const pulsesToRx = this.nextPulses.filter(({ targets }) => targets?.includes('rx'))
            if(pulsesToRx.length === 1 && pulsesToRx[0].onOffity === false) {
                this.rxHitSinglely = true
            }
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
            input.findRx()
        )
    }

}
        