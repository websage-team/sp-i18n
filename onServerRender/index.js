import {
    actionInit,
    actionLocales
} from '../redux'
import {
    type
} from '../index'

export default ({
    reduxStore
}) => {
    reduxStore.dispatch(actionInit(reduxStore.getState()))
    if (type === 'redux')
        reduxStore.dispatch(actionLocales())
}
