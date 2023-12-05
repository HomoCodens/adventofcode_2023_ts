import { createActor } from 'xstate'
import { aocMachine } from './util/aocfsm'
import './util/aochelpers'

createActor(aocMachine).start()