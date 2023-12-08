import { assign, createMachine, fromPromise, log, sendTo } from 'xstate'
import { chooseDay, mainMenu, createDayMenu } from './menus'
import { exec } from 'child_process'

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
                        CREATEDAY: 'createDay',
                        DAYMENU: 'dayMenu',
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
                createDay: {
                    id: 'createDay',
                    on: {
                        DAYCREATED: 'dayMenu'
                    },
                    invoke: {
                        src: createDayMenu,
                        onDone: {
                            actions: [
                                sendTo(({ self }) => self, ({ event }) => {
                                    return {
                                        type: 'DAYCREATED',
                                        params: {
                                            day: event.output.dayToCreate
                                        }
                                    }
                                })
                            ]
                        }
                    }
                },
                dayMenu: {
                    id: 'dayMenu',
                    entry: [
                        assign({
                            activeDay: ({ event }) => event.params.day - 1,
                        }),
                        log('now here'),
                    ],
                },
            },
        },
        running: {
            initial: '#runSingleDay',
            
            states: {
                runSingleDay: {
                    id: 'runSingleDay',
                    invoke: {
                        src: fromPromise(({ input }) => {
                            return new Promise((resolve, reject) => {
                                exec(`tsx ./src/scripts/dayrunner.ts ${input.day}`, (error, stdout) => {
                                    if(error) {
                                        reject(error)
                                    }

                                    console.log(stdout)
                                    resolve('')
                                })
                            })
                        }),
                        input: ({ event, context }) => {
                            return {
                                day: (event as any).params.day,
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