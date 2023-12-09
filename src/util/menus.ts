import inquirer from 'inquirer'
import Solvers from '../solvers'
import Scaffolder from './scaffolder'
import { Transition } from './transitions'

export const mainMenu = () =>
    inquirer.prompt({
        type: 'list',
        name: 'transition',
        message: 'Main menu',
        prefix: '🎄',
        choices: [
            {
                name: 'Run a single day',
                value: Transition.CHOOSEDAY
            },
            new inquirer.Separator(),
            {
                name: 'Exit',
                value: Transition.QUIT
            }
        ]
    })

export const chooseDay = (activeDay: number = 0): Promise<{ transition: Transition, day?: number }> => {
    const choices = [
        ...Solvers.map(({ day }) => ({ 
            name: `Day ${day}`,
            value: {
                transition: Transition.DAYMENU,
                day
            }
        })),
        {
            name: 'Create new day...',
            value: {
                transition: Transition.CREATEDAY,
            }
        },
        new inquirer.Separator(),
        {
            name: 'Back',
            value: {
                transition: Transition.MAINMENU,
            }
        }
    ]
    
    return inquirer.prompt({
        type: 'list',
        message: 'Run a day',
        name: 'choice',
        prefix: '📅',
        choices,
        default: activeDay,
    }).then(({ choice }) => choice)
}

export const createDayMenu = () =>
    inquirer.prompt({
            type: 'number',
            name: 'dayToCreate',
            message: 'Number of day to create',
            prefix: '🎨',
            default: (new Scaffolder('./')).nextUncreatedDay(),
    })