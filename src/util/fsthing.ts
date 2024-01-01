import path from 'path'
import * as fs from 'fs'

import { padNumber } from './helpers'

export default class FsThing {
    constructor(private root: string) {}

    get solversRoot(): string {
        return path.join(this.root, 'src')
    }

    get inputsRoot(): string {
        return path.join(this.root, 'input')
    }

    dayInput(day: number): string {
        return path.join(this.inputsRoot, `day${padNumber(day)}`)
    }

    listAvailableDays(): number[] {
        return fs.readdirSync(this.solversRoot)
                    .filter((fileName) => fileName.match(/solverday\d+/))
                    .map((fileName) => +fileName.replace(/solverday(\d+).ts/, '$1'))
    }

    listAvailableExamples(day: number): number[] {
        return this.listAvailableExampleFiles(day)
                    .map((fileName) => +fileName.replace(/example(\d+).txt/, '$1'))
    }

    listAvailableExampleFiles(day: number): string[] {
        return fs.readdirSync(this.dayInput(day))
                    .filter((fileName) => fileName.match(/example\d+.txt/))
    }

    daySolver(day: number): string {
        return path.join(this.solversRoot, `solverday${padNumber(day)}.ts`)
    }

    fileIn(folder: string, filename: string): string {
        return path.join(folder, filename)
    }

    fileExists(filePath: string): boolean {
        return fs.existsSync(filePath)
    }

    touchFile(filePath: string): void {
        if(!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath))
        }
        fs.writeFileSync(filePath, '')
    }

    readFile(filePath: string): string {
        return fs.readFileSync(filePath).toString()
    }

    writeFile(filePath: string, content: string): void {
        if(fs.existsSync(filePath)) {
            throw `${filePath} already exists.`
        }

        fs.writeFileSync(filePath, content)
    }
}