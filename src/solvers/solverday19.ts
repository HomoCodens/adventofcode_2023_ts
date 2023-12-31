import { rejects } from 'assert'
import SolverBase, { Solvution } from './solverbase'

const ACCEPTED = 'A'
const REJECTED = 'R'

type PartPropertyKey = 'x' | 'm' | 'a' | 's'

type ParameterRange = {
    min: number,
    max: number,
}

// As in "It plumbs the depths of..." 🤷🏻
type Bathysphere = {
    x: ParameterRange,
    m: ParameterRange,
    a: ParameterRange,
    s: ParameterRange,
}

class Part {
    constructor(public x: number, public m: number, public a: number, public s: number) {}

    get weight(): number {
        return this.x + this.m + this.a + this.s
    }

    static fromString(def: string): Part {
        const [_, x, m, a, s] = /^\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}/.exec(def.trim())!
        return new Part(Number(x), Number(m), Number(a), Number(s))
    }
}

abstract class Check {
    constructor(public propertyKey: PartPropertyKey, public threshold: number, public targetWorkflow: string) {}

    abstract testPart(part: Part): boolean
    abstract shnipPart(part: Bathysphere): Bathysphere
    abstract antiShnipPart(part: Bathysphere): Bathysphere

    static fromString(def: string): Check {
        const [_, propertyKey, operator, threshold, targetWorkflow] = /([xmas])([<>])(\d+):(\w+)/.exec(def)!

        if(operator === '<') {
            return new LtCheck(propertyKey as PartPropertyKey, Number(threshold), targetWorkflow)
        }

        return new GtCheck(propertyKey as PartPropertyKey, Number(threshold), targetWorkflow)
    }
}

// such oop, much wow
class GtCheck extends Check {
    override testPart(part: Part) {
        return part[this.propertyKey] > this.threshold
    }

    override shnipPart(part: Bathysphere): Bathysphere {
        const out = JSON.parse(JSON.stringify(part))
        
        out[this.propertyKey].min = Math.max(out[this.propertyKey].min, this.threshold + 1)
        return out
    }

    override antiShnipPart(part: Bathysphere): Bathysphere {
        const out = JSON.parse(JSON.stringify(part))

        out[this.propertyKey].max = Math.min(out[this.propertyKey].max, this.threshold)
        return out
    }
}

class LtCheck extends Check {
    override testPart(part: Part): boolean {
        return part[this.propertyKey] < this.threshold    
    }

    override shnipPart(part: Bathysphere): Bathysphere {
        const out = JSON.parse(JSON.stringify(part))
        
        out[this.propertyKey].max = Math.min(out[this.propertyKey].max, this.threshold - 1)
        return out
    }

    override antiShnipPart(part: Bathysphere): Bathysphere {
        const out = JSON.parse(JSON.stringify(part))

        out[this.propertyKey].min = Math.max(out[this.propertyKey].min, this.threshold)
        return out
    }
}

class Workflow {

    constructor(public id: string, public checks: Check[], public defaultTarget: string) {}

    static fromString(def: string) {
        const [_, id, checkDef] = /([\w]+)(\{.+)\}/.exec(def)!

        const checkDefs = checkDef.split(',')
        const defaultTarget = checkDefs.pop()
        const checks = checkDefs.map((cd) => Check.fromString(cd))

        return new Workflow(id, checks, defaultTarget!)
    }

    exec(part: Part): string {
        const target = this.checks.find((check) => check.testPart(part))
        return target?.targetWorkflow || this.defaultTarget
    }
}

class PartFilter {
    private workflows: Map<string, Workflow> = new Map()
    constructor(workflows: Workflow[], public parts: Part[]) {
        workflows.forEach((w) => this.workflows.set(w.id, w))
    }

    static fromString(def: string) {
        const [workflowLines, partLines] = def.trim().lines('\n\n')

        const workflows = workflowLines.lines().map((line) => Workflow.fromString(line.trim()))

        const parts = partLines.lines().map((line) => Part.fromString(line))

        return new PartFilter(workflows, parts)
    }

    getPassingParts(): Part[] {
        return this.parts.filter((part) => {
            let currentWorkflowId = 'in'
            while(true) {
                const workflow = this.workflows.get(currentWorkflowId)
                if(workflow) {
                    currentWorkflowId = workflow.exec(part)
                    if(currentWorkflowId === ACCEPTED) {
                        return true
                    }

                    if(currentWorkflowId === REJECTED) {
                        return false
                    }
                } else {
                    throw 'tantrum'
                }
            }
        })
    }

    goDeepa(propertyMax: number = 4000): number {
        return this.dive(
            'in',
            {
                x: { min: 1, max: propertyMax },
                m: { min: 1, max: propertyMax },
                a: { min: 1, max: propertyMax },
                s: { min: 1, max: propertyMax },
            })
    }

    private dive(currentWorkflowId: string, testPart: Bathysphere): number {
        if(testPart.x.min > testPart.x.max ||
            testPart.m.min > testPart.m.max ||
            testPart.a.min > testPart.a.max ||
            testPart.s.min > testPart.s.max) {
                return 0;
            }
        
        if(currentWorkflowId === REJECTED) {
            return 0;
        }

        if(currentWorkflowId === ACCEPTED) {
            return (testPart.x.max - testPart.x.min + 1) *
                        (testPart.m.max - testPart.m.min + 1) *
                        (testPart.a.max - testPart.a.min + 1) *
                        (testPart.s.max - testPart.s.min + 1)
        }

        let antiPart = JSON.parse(JSON.stringify(testPart))
        const currentWorkflow = this.workflows.get(currentWorkflowId)!
        let out = 0;
        currentWorkflow.checks.forEach((check) => {
            out += this.dive(check.targetWorkflow, check.shnipPart(antiPart))
            antiPart = check.antiShnipPart(antiPart)
        })

        out += this.dive(currentWorkflow.defaultTarget, antiPart)

        return out
    }
}

export default class SolverDay19 extends SolverBase<PartFilter> {
    static override day = 19

    prepareInput(rawInput: string): PartFilter {
        return PartFilter.fromString(rawInput)
    }

    solvePartOne(input: PartFilter): Solvution {
        return new Solvution(
            input.getPassingParts().map((p) => p.weight).sum(),
            'There\'s a total of $$ parts passing the test.',
        )
    }
    
    solvePartTwo(input: PartFilter): Solvution {
        return new Solvution(
            input.goDeepa(),
            'Employing Quantum Gear Computation Technologs, we determine there are a total of $$ possible passing parts (probably).'
        )
    }

}
