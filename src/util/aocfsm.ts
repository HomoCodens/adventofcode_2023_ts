import { createMachine, fromPromise, log, sendTo } from 'xstate'
import { chooseDay, mainMenu } from './menus'
import Solvers from '../solvers'
import { InputReader } from './inputReader'

export const aocMachine = createMachine({
    id: 'elfMasheen',
    initial: 'menu',
    context: {
        inputRoot: './input',
    },
    states: {
        menu: {
            initial: 'mainMenu',
            states: {
                mainMenu: {
                    on: {
                        QUIT: '#quit',
                        CHOOSEDAY: 'chooseDay',
                    },
                    invoke: {
                        src: mainMenu,
                        onDone: {
                            actions: sendTo(({ self }) => self, ({ event }) => {
                                return {
                                    type: event.output.transition
                                }
                            })
                        }
                    }
                },
                chooseDay: {
                    id: 'chooseDay',
                    on: {
                        MAINMENU: 'mainMenu',
                        RUNDAY: '#runSingleDay',
                    },
                    invoke: {
                        src: chooseDay,
                        onDone: {
                            actions: sendTo(({ self }) => self, ({ event }) => {
                                return {
                                    type: event.output.transition,
                                    params: event.output.params
                                }
                            })
                        }
                    }
                },
            },
        },
        running: {
            initial: '#runSingleDay',
            states: {
                runSingleDay: {
                    id: 'runSingleDay',
                    entry: log(({ event }) => event),
                    invoke: {
                        src: fromPromise(({ input }) => {
                            console.log(input)
                            const solver = new Solvers[input.day - 1]
                            const inputReader = new InputReader(input.inputFileRoot)
                            return Promise.all([
                                solver.getSolutionOne(inputReader.readExample(input.day, 1)[0]),
                                solver.getSolutionTwo(inputReader.readExample(input.day, 1)[0]),
                                solver.getSolutionOne(inputReader.readInput(input.day)),
                                solver.getSolutionTwo(inputReader.readInput(input.day)),
                            ]).then(console.log)
                        }),
                        input: ({ event, context }) => {
                            return {
                                day: (event as any).params.dayToRun,
                                inputFileRoot: context.inputRoot
                            }
                        },
                        onDone: '#chooseDay'
                    }
                }
            }
        },
        quit: {
            id: 'quit',
            type: 'final'
        }
    }
})