import cookie from 'cookie'
import { CHANGE_LANGUAGE } from './redux'
import {
    actionInit,
    actionLocales
} from '../'

export default (obj) => {
    let { koaCtx, reduxStore } = obj

    let lang = (() => {

        // 先查看URL参数是否有语音设置
        // hl 这个参数名是参考了Instargram
        let lang = koaCtx.query.hl

        // 如果没有，检查cookie
        const cookies = cookie.parse(koaCtx.request.header.cookie || '')
        if (!lang && cookies.spLocaleId && cookies.spLocaleId !== 'null')
            lang = cookies.spLocaleId

        // 如果没有，再看header里是否有语言设置
        if (!lang)
            lang = koaCtx.header['accept-language']

        // 如没有，再用默认
        if (!lang)
            lang = 'en'

        return lang
    })()

    reduxStore.dispatch({ type: CHANGE_LANGUAGE, data: lang })
    reduxStore.dispatch(actionInit(reduxStore.getState()))
    reduxStore.dispatch(actionLocales())

}