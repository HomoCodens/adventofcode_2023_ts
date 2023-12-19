import { rejects } from 'assert'
import SolverBase, { Solvution } from './solverbase'

const ACCEPTED = 'A'
const REJECTED = 'R'

type PartPropertyKey = 'x' | 'm' | 'a' | 's'

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
}

class LtCheck extends Check {
    override testPart(part: Part): boolean {
        return part[this.propertyKey] < this.threshold    
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

    goDeepa(): number {
        const BillionsAndBillionsOfParts = 42_000_000_000
        return BillionsAndBillionsOfParts
    }
}

export default class SolverDay19 extends SolverBase<PartFilter> {
    static override day = 19

    prepareInput(rawInput: string): PartFilter {
        return PartFilter.fromString(rawInput)
    }

    solvePartOne(input: PartFilter): Solvution {
        return new Solvution(
            input.getPassingParts().map((p) => p.weight).sum()
        )
    }
    
    solvePartTwo(input: PartFilter): Solvution {
        return new Solvution(
            input.goDeepa()
        )
    }

}
