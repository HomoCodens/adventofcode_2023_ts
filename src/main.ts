import { createActor } from 'xstate'
import { aocMachine } from './util/aocfsm'

createActor(aocMachine).start()