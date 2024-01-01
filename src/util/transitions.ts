export enum TransitionType {
    MAINMENU = 'MAINMENU',
    CHOOSEDAY = 'CHOOSEDAY',
    CREATEDAY = 'CREATEDAY',
    DAYMENU = 'DAYMENU',
    RUNDAY = 'RUNDAY',
    CREATEEXAMPLE = 'CREATEEXAMPLE',
    BACK = 'BACK',
    QUIT = 'QUIT',
}

export type Transition<T> = {
    type: TransitionType,
    params: T,
}