import {
    actionInit,
    actionLocales
} from 'sp-i18n'

export default (obj) => {
    let { reduxStore } = obj
    
    reduxStore.dispatch(actionInit(reduxStore.getState()))
    reduxStore.dispatch(actionLocales())

}