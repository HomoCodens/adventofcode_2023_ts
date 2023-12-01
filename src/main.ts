import * as Solvers from './solvers'
import { InputReader } from './util/inputReader'

const ir = new InputReader('./input/')

const d01 = new Solvers.SolverDay01()

d01.getSolutionOne(ir.readExample(1, 1)[0]).then(console.log)
d01.getSolutionTwo(ir.readExample(1, 2)[0]).then(console.log)