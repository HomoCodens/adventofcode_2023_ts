import inquirer from 'inquirer'
import { fromPromise } from 'xstate'
import Solvers from '../solvers'
import { spawn } from 'child_process'
import Scaffolder from './scaffolder'

export const mainMenu = fromPromise(() => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'transition',
            message: 'Main menu',
            prefix: '🎄',
            choices: [
                {
                    name: 'Run a single day',
                    value: 'CHOOSEDAY'
                },
                new inquirer.Separator(),
                {
                    name: 'Exit',
                    value: 'QUIT'
                }
            ]
        }
    ])
})

export const chooseDay = fromPromise(({ input: { activeDay } }) => {
    const choices = [
        ...Solvers.map(({ day }) => ({ name: `Day ${day}`, value: day})),
        {
            name: 'Create new day...',
            value: 'CREATEDAY',
        },
        new inquirer.Separator(),
        {
            name: 'Back',
            value: 'MAINMENU'
        }
    ]
    
    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Run a day',
            prefix: '📅',
            choices,
            default: activeDay,
        }
    ]).then((choice) => {
        if(choice.choice === 'MAINMENU') {
            return {
                transition: 'MAINMENU'
            }
        }

        if(choice.choice === 'CREATEDAY') {
            return {
                transition: 'CREATEDAY'
            }
        }

        return {
            transition: 'DAYMENU',
            params: {
                day: choice.choice
            }
        }
    })
})

export const createDayMenu = fromPromise(({ input }) => {

    return inquirer.prompt([
        {
            type: 'number',
            name: 'dayToCreate',
            message: 'Number of day to create',
            prefix: '🎨',
            default: (new Scaffolder('./')).nextUncreatedDay(),
        }
    ])
})