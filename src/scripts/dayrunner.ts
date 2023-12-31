import { program, InvalidArgumentError } from 'commander'
import { InputReader } from '../util/inputReader'
import Solvers from '../solvers'

const validateInt = (value: string) => {
    const day = Number.parseInt(value)
    if(Number.isNaN(day)) {
        throw new InvalidArgumentError('Not an integer.')
    }
    return day
}

program
    .argument('<day>', 'the day to run', validateInt, )
    .option('-e, --example <n>', 'run example n instead of real input', validateInt)
    .option('-r, --root <path>', 'location of the input files', './input')

program.parse()

const options = program.opts()

const day = +program.args[0]

const reader = new InputReader(options.root)
const solver = new Solvers[day - 1]()

let input: string
if(options.example) {
    input = reader.readExample(day, options.example)[0]
} else {
    input = reader.readInput(day)
}

console.log(`Begin crunching day ${day}`)
solver.getSolutionOne(input)
        .then((part1) => {
            console.log('Part 1:')
            console.log(part1.fancyFunnyString)
            console.log()
        })
    
solver.getSolutionTwo(input)
        .then((part2) => {
            console.log('Part 2:')
            console.log(part2.fancyFunnyString)
        })
