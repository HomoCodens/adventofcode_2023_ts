import { Worker } from 'worker_threads'

import { chooseDay, createDayMenu, dayMenu, mainMenu } from './util/menus'
import Scaffolder from './util/scaffolder';
import { Transition } from './util/transitions';

async function doMainMenu() {
    const { transition } = await mainMenu()

    switch (transition) {
        case Transition.CHOOSEDAY:
            setImmediate(doChooseDay)            
            break;
        case Transition.QUIT:
            break;
    }
}

async function doChooseDay() {
    const { transition, day } = await chooseDay()

    switch (transition) {
        case Transition.MAINMENU:
            setImmediate(doMainMenu)
            break;
        case Transition.DAYMENU:
            setImmediate(() => doDay(day!))
            break;
        case Transition.CREATEDAY:
            setImmediate(doCreateDay)
    }
}

async function doCreateDay() {
    const { dayToCreate } = await createDayMenu()

    const scaffy = new Scaffolder()
    scaffy.scaffoldDay(dayToCreate)

    setImmediate(() => doDay(dayToCreate))
}

async function doDay(day: number) {
    const { input, example } = await dayMenu(day)

    console.log(`doing the thing with ${input}`)

    const w = new Worker('./src/workers/dayWorker.ts', {
        workerData: {
            day,
            input,
            example,
        }
    })
    w.on('message', (solutions) => {
        console.log(solutions)

        setImmediate(() => doDay(day))
    })

}

doMainMenu()