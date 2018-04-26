import {
    actionInit,
    actionLocales
} from '../redux'

export default ({
    reduxStore
}) => {
    reduxStore.dispatch(actionInit(reduxStore.getState()))
    reduxStore.dispatch(actionLocales())
}
