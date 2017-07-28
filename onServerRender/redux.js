export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE'

export const SERVER_REDUCER_NAME = 'server'

export const serverReducer = (state = { lang: 'en', origin: '' }, action) => {
    switch (action.type) {
        case CHANGE_LANGUAGE:
            return Object.assign({}, state, {
                lang: action.data
            })
        default:
            return state
    }
}