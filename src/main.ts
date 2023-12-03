import { createActor, createMachine, fromPromise, sendTo } from 'xstate'
import * as Solvers from './solvers'
import { InputReader } from './util/inputReader'
import inquirer from 'inquirer'
import PressToContinuePrompt, { KeyDescriptor } from 'inquirer-press-to-continue';

inquirer.registerPrompt('press-to-continue', PressToContinuePrompt);

const m = createMachine({
    id: 'elfMasheen',
    initial: 'mainMenu',
    states: {
        mainMenu: {
            on: {
                QUIT: 'quit',
                RUNDAY: 'runSingleDay',
            },
            invoke: {
                src: fromPromise(() => {
                    return inquirer.prompt([
                        {
                            type: 'list',
                            name: 'transition',
                            message: 'Mein Menu',
                            prefix: '🎄',
                            choices: [
                                {
                                    name: 'Run a single day',
                                    value: 'RUNDAY'
                                },
                                {
                                    name: 'Quitarooney',
                                    value: 'QUIT'
                                }
                            ]
                        }
                    ])
                }),
                onDone: {
                    actions: sendTo(({ self }) => self, ({ event }) => {
                        return {
                            type: event.output.transition
                        }
                    })
                }
            }
        },
        runSingleDay: {
            entry: () => console.clear(),
            exit: () => console.clear(),
            on: {
                MAINMENU: 'mainMenu',
            },
            invoke: {
                src: fromPromise(() => {
                    return inquirer.prompt<{ key: KeyDescriptor }>({
                        type: 'press-to-continue',
                        enter: true,
                        name: 'transition',
                        prefix: 'hahaha',
                        pressToContinueMessage: 'Ohai, pls bai...',
                    })
                    /*inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'transition',
                            message: 'Day runner',
                        }
                    ])*/
                }),
                onDone: {
                    actions: sendTo(({ self }) => self, () => {
                        return {
                            type: 'MAINMENU'
                        }
                    })
                }
            }
        },
        quit: {
            type: 'final'
        }
    }
})

//const a = createActor(m).start()

const ir = new InputReader('./input/')

const d03 = new Solvers.SolverDay03()

d03.getSolutionOne(ir.readExample(3, 1)[0]).then(console.log).catch((e) => {
    console.log(e)
})
d03.getSolutionTwo(ir.readExample(3, 1)[0]).then(console.log).catch((e) => {
    console.log(e)
})

d03.getSolutionOne(ir.readInput(3)).then(console.log)
d03.getSolutionTwo(ir.readInput(3)).then(console.log)