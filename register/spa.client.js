import {
    I18N_INIT,
    setAvailableLocales,
    localeId,
    setLocaleId,
    setLocales,
    getLocaleId,
    actionLocales,
} from '../index'


/**
 * 初始化 (非同构项目)
 * 
 * @param {array|object} arg 可用语言列表(Array) | 语言包内容(object)
 */
export default (arg) => {
    if (Array.isArray(arg)) {
        setAvailableLocales(arg)
        setLocaleId(getLocaleId())

        return {
            type: I18N_INIT,
            localeId: '' + localeId
        }
    } else if (typeof arg === 'object') {
        setLocales(localeId, arg)
        return actionLocales()
    }
}
