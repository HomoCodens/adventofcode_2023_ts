import { assign, createMachine, fromPromise, log, sendTo } from 'xstate'
import { chooseDay, mainMenu } from './menus'
import Solvers from '../solvers'
import { InputReader } from './inputReader'

export const aocMachine = createMachine({
    id: 'elfMasheen',
    initial: 'menu',
    context: {
        inputRoot: './input',
        activeDay: 0,
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
                        input: ({ context }) => {
                            return {
                                activeDay: context.activeDay
                            }
                        },
                        onDone: {
                            actions: [
                                sendTo(({ self }) => self, ({ event }) => {
                                    return {
                                        type: event.output.transition,
                                        params: event.output.params
                                    }
                                }),
                            ],
                        },
                    },
                },
            },
        },
        running: {
            initial: '#runSingleDay',
            entry: [
                assign({
                    activeDay: ({ event }) => event.params.dayToRun - 1,
                }),
            ],
            states: {
                runSingleDay: {
                    id: 'runSingleDay',
                    invoke: {
                        src: fromPromise(({ input }) => {
                            const solver = new Solvers[input.day - 1]
                            const inputReader = new InputReader(input.inputFileRoot)
                            return Promise.all([
                                solver.getSolutionOne(inputReader.readExample(input.day, 2)[0]),
                                // solver.getSolutionTwo(inputReader.readExample(input.day, 2)[0]),
                                // solver.getSolutionOne(inputReader.readInput(input.day)),
                                // solver.getSolutionTwo(inputReader.readInput(input.day)),
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
