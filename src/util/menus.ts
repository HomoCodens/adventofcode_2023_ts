import inquirer from 'inquirer'
import { fromPromise } from 'xstate'
import Solvers from '../solvers'

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

export const chooseDay = fromPromise(() => {
    const choices = Solvers.map(({ day }) => ({ name: `Day ${day}`, value: day}))
    return inquirer.prompt([
        {
            type: 'list',
            name: 'day',
            message: 'Run a day',
            prefix: '📅',
            choices
        }
    ]).then((choice) => {
        console.log(choice)
        return {
            transition: 'RUNDAY',
            params: {
                dayToRun: choice.day
            }
        }
    })
})