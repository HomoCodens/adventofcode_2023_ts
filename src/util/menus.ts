import inquirer from 'inquirer'
import { fromPromise } from 'xstate'
import Solvers from '../solvers'
import { spawn } from 'child_process'

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

        return {
            transition: 'RUNDAY',
            params: {
                dayToRun: choice.choice
            }
        }
    })
})