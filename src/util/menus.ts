import inquirer from 'inquirer'
import Solvers from '../solvers'
import Scaffolder from './scaffolder'
import { Transition, TransitionType } from './transitions'
import { InputReader } from './inputReader'

export const mainMenu = (): Promise<Transition<void>> =>
    inquirer.prompt({
        type: 'list',
        name: 'transitionType',
        message: 'Main menu',
        prefix: '🎄',
        choices: [
            {
                name: 'Run a single day',
                value: TransitionType.CHOOSEDAY
            },
            new inquirer.Separator(),
            {
                name: 'Exit',
                value: TransitionType.QUIT
            }
        ]
    })
    .then(({ transitionType }) => {
        return { type: transitionType } as Transition<void>
    })

export const chooseDay = (activeDay: number = 0): Promise<Transition<number>> => {
    const choices = [
        ...Solvers.map(({ day }) => ({ 
            name: `Day ${day}`,
            value: {
                type: TransitionType.DAYMENU,
                params: day,
            }
        })),
        {
            name: 'Create new day...',
            value: {
                type: TransitionType.CREATEDAY,
            }
        },
        new inquirer.Separator(),
        {
            name: 'Back',
            value: {
                type: TransitionType.MAINMENU,
            }
        }
    ]
    
    return inquirer.prompt({
        type: 'list',
        loop: false,
        message: 'Run a day',
        name: 'choice',
        prefix: '📅',
        choices,
        default: activeDay,
    })
    .then(({ choice }) => choice)
}

export const createDayMenu = (): Promise<number> =>
    inquirer.prompt({
            type: 'number',
            name: 'dayToCreate',
            message: 'Number of day to create',
            prefix: '🎨',
            default: (new Scaffolder('./')).nextUncreatedDay(),
    })
    .then(({ dayToCreate }) => dayToCreate)

export const dayMenu = (activeDay: number): Promise<Transition<{day: number, input: boolean, example: number}>> => {
    const reader = new InputReader()

    return inquirer.prompt({
        type: 'list',
        name: 'action',
        message: `Run Day ${activeDay}`,
        prefix: '🏃‍♀️',
        choices: [
            ...(reader.hasInput(activeDay) ? [{
                name: 'input.txt',
                value: {
                    type: TransitionType.RUNDAY,
                    params: {
                        day: activeDay,
                        input: true,
                    }
                }
            }] : []),
            ...reader.listExamples(activeDay).map((name, i) => {
                return {
                    name,
                    value: {
                        type: TransitionType.RUNDAY,
                        params: {
                            day: activeDay,
                            input: false,
                            example: i + 1,
                        }
                    }
                }
            }),
            {
                name: 'Create new example...',
                value: {
                    type: TransitionType.CREATEEXAMPLE,
                    params: {
                        day: activeDay,
                    }
                }
            },
            {
                name: 'Back',
                value: {
                    type: TransitionType.BACK,
                }
            },
        ]
    })
    .then(({ action }) => action)
}