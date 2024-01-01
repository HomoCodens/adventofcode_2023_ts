import { exec } from 'child_process'

import { chooseDay, createDayMenu, dayMenu, mainMenu } from './util/menus'
import Scaffolder from './util/scaffolder'
import { TransitionType } from './util/transitions'

async function doMainMenu() {
    const tran = await mainMenu()
    const { type } = tran
    //const { type } = await mainMenu()

    switch (type) {
        case TransitionType.CHOOSEDAY:
            setImmediate(doChooseDay)            
            break
        case TransitionType.QUIT:
            break
    }
}

async function doChooseDay() {
    const { type, params } = await chooseDay()

    switch (type) {
        case TransitionType.MAINMENU:
            setImmediate(doMainMenu)
            break
        case TransitionType.DAYMENU:
            setImmediate(() => doDay(params))
            break
        case TransitionType.CREATEDAY:
            setImmediate(doCreateDay)
    }
}

async function doCreateDay() {
    const dayToCreate = await createDayMenu()

    const scaffy = new Scaffolder()
    scaffy.scaffoldDay(dayToCreate)

    setImmediate(() => doDay(dayToCreate))
}

async function doDay(day: number) {
    const { type, params } = await dayMenu(day)

    if(type === TransitionType.RUNDAY) {
        exec(
            `tsx src/scripts/dayrunner.ts ${day} ${params.example ? `-e ${params.example}` : ''}`,
            (error, stdout, stderr) => {
                console.log(stdout)
                if(error) {
                    console.log('Whoopsie:')
                    console.log(error)
                    console.log(stderr)
                }
                setImmediate(() => doDay(day))
            }
        )
    }

    if(type === TransitionType.CREATEEXAMPLE) {
        setImmediate(() => createExample(day))
    }

    if(type === TransitionType.BACK) {
        setImmediate(chooseDay)
    }
}

async function createExample(day: number) {
    const scaffy = new Scaffolder()
    scaffy.scaffoldExample(day)
    setImmediate(() => doDay(day))
}

doMainMenu()