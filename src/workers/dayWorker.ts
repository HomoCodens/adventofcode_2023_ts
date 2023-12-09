import { parentPort, workerData } from 'worker_threads'
import Solvers from '../solvers'
import { InputReader } from '../util/inputReader'

if(!parentPort) {
    console.log('Oy git, I\'m not supposed to be run directly...')
    process.exit(1)
}

const {
    day,
    input,
    example
} = workerData

const reader = new InputReader()

const inputData = input ? reader.readInput(day) : reader.readExample(day, example)[0]

const solver = new Solvers[day - 1]()

solver.getBothSolutions(inputData)
        .then((solutions) => parentPort!.postMessage(solutions))