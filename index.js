import getLocaleId from './get-locale-id'
import parseLanguageList from './parse-language-list'

export const I18N_INIT = 'I18N_INIT'
export const I18N_LOCALES = 'I18N_LOCALES'

// 当前项目可用的语言包代码，与语言包文件名精确匹配
// 注：无论何种环境，在使用任何函数前，需要使用 register() 函数定义/初始化该 Array
export let availableLocales = []
export const setAvailableLocales = arr => availableLocales = arr

// 当前语言包名代码，与语言包文件名精确匹配
export let localeId = null
export const setLocaleId = locale => localeId = locale

// 存储文本，按语言包名，如 locales.en、locales['zh-cn']
export let locales = {}
export const setLocales = (locale = localeId, obj) => {
    locales[locale] = obj
}


/**
 * 服务器环境：根据语言列表，初始化i18n，获得并赋值 localeId
 * 
 * @param {array|string} langList 语言列表
 * 
 * @returns (如果已初始化)locales[localeId]
 */
const init = (langList = []) => {
    if (__SERVER__) {
        // console.log(locales[localeId])
        if (typeof langList === 'string')
            if (langList.indexOf(';') > -1)
                langList = parseLanguageList(langList)
            else
                return init([langList])

        localeId = localeId || getLocaleId(langList)

        if (locales[localeId]) return locales[localeId]
    }
}


/**
 * 检查目标语言包ID的语言包内容是否已初始化
 * 
 * @param {*string} theLocaleId 目标语言包ID
 * 
 * @returns {boolean}
 */
export const checkLocalesReady = (theLocaleId = localeId) => {
    return (typeof locales[theLocaleId] !== 'undefined')
}


/**
 * 从当前的 Redux state 中获取语言列表字符串
 * 如果 uri search 中存在 fb_locale，将该值放在第一位
 * 
 * @param {object} state 当前的 Redux state
 * 
 * @returns {string} 语言列表，使用分号(;)分割
 */
export const getLanglistFromState = (state) => {
    const serverState = state.server || {}
    const fb_locale = state.routing && state.routing.locationBeforeTransitions && state.routing.locationBeforeTransitions.query ? state.routing.locationBeforeTransitions.query.fb_locale : null

    let lang = serverState.lang
    if (fb_locale) lang = fb_locale + ';' + lang

    return lang || ''
}


/**
 * Redux reducer: 初始化 localeId
 * 
 * @param {*} state 
 * @param {*} action
 * 
 * @returns {*} state
 */
export const reducerLocaleId = (state = null, action) => {
    switch (action.type) {
        case I18N_INIT:
            return action.localeId
    }
    return state
}


/**
 * Redux reducer: 初始化 locales
 * 
 * @param {*} state 
 * @param {*} action
 * 
 * @returns {*} state
 */
export const reducerLocales = (state = {}, action) => {
    switch (action.type) {
        case I18N_LOCALES:
            return Object.assign({}, state, action.locales)
    }
    return state
}


export const actionInit = (state) => {
    localeId = null

    init(parseLanguageList(
        (typeof state === 'object') ? getLanglistFromState(state) : state
    ))

    return {
        type: I18N_INIT,
        localeId: '' + localeId
    }
}


export const actionLocales = () => {
    return {
        type: I18N_LOCALES,
        locales: locales[localeId]
    }
}


/**
 * 翻译文本
 * 语言包中源文本中的 ${replaceKey} 表示此处需要替换，replaceKey 就是传入的 obj 中对应的值
 * 
 * @param {string} key 要翻译的文本 Key
 * @param {*object} obj 文本内对应的替换内容
 * 
 * @returns {string} 翻译的文本；如果语言包中没有对应的项，返回 key
 */
const translate = (key, obj = {}) => {
    // const localeId = _self.curLocaleId
    const l = locales[localeId]
    let str = (l && typeof l[key] !== 'undefined') ? l[key] : undefined

    if (typeof str === 'undefined') {
        try {
            str = eval('l.' + key)
        } catch (e) { }
    }

    if (typeof str === 'undefined') str = key

    if (typeof str === 'string')
        return str.replace(
            /\$\{([^\}]+)\}/g,
            (match, p) => typeof obj[p] === 'undefined' ? p : obj[p]
        )

    else
        return str
}


export default translate
