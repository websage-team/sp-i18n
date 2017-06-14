const I18N_INIT = 'I18N_INIT'
const I18N_LOCALES = 'I18N_LOCALES'

// 当前项目可用的语言包代码，与语言包文件名精确匹配
// 注：无论何种环境，在使用任何函数前，需要使用 register() 函数定义/初始化该 Array
let availableLocales = []

// 当前语言包名代码，与语言包文件名精确匹配
export let localeId = null

// 存储文本，按语言包名，如 locales.en、locales['zh-cn']
export let locales = {}


/**
 * 初始化
 * 
 * @param {array|object} args[0] (服务器环境)项目可用的语言包代码；(客户端环境)redux state
 * @param {object} args[1] (服务器环境)locales 处理后的值
 */
export const register = (...args) => {
    if (__SERVER__) {
        if (availableLocales.length) return

        availableLocales = args[0]
        locales = args[1]
    }
    if (__CLIENT__) {
        localeId = args[0].localeId
        locales[localeId] = args[0].locales
        if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined') {
            const Cookies = require('js-cookie')
            Cookies.set('spLocaleId', localeId, { expires: 365 })
        }
    }
}


/**
 * 初始化 (非同构项目)
 * 
 * @param {array|object} arg 可用语言列表(Array) | 语言包内容(object)
 */
export const registerNonIsomorphic = (arg) => {
    if (Array.isArray(arg)) {
        availableLocales = arg
        localeId = getLocaleId()

        return {
            type: I18N_INIT,
            localeId: '' + localeId
        }
    } else if (typeof arg === 'object') {
        locales[localeId] = arg
        return actionLocales()
    }
}


/**
 * 根据输入内容返回availableLocales内匹配的语言包ID(localeId)
 * 如果没有匹配，返回availableLocales的第一项
 * 注：仅为返回，没有赋值操作
 * 
 * @param {string, array} input 
 * 
 * @returns 匹配的语言包ID localeId 或 availableLocales[0]
 */
export const getLocaleId = (input) => {
    /**
     * 检查单项，如果和availableLocales内的项目有匹配，返回匹配，否则返回null
     * @param {string} input 检查项
     * @returns 匹配的 localeId 或 null
     */
    const checkItem = (input) => {
        let id

        input = input.toLowerCase().replace(/\_/g, '-')

        availableLocales.some(_localeId => {
            if (_localeId == input)
                id = _localeId
            return id
        })

        const parseSeg = (id, localeId, str) => {
            if (id) return id

            const seg = localeId.split(str)

            if (!id) {
                availableLocales.some(_localeId => {
                    if (_localeId == seg[0] + '-' + seg[seg.length - 1])
                        id = _localeId
                    return id
                })
            }

            if (!id) {
                availableLocales.some(_localeId => {
                    if (_localeId == seg[0])
                        id = _localeId
                    return id
                })
            }

            return id || null
        }

        id = parseSeg(id, input, '-')

        return id || null
    }

    // 检查是否包含分号，如果是，按语言列表处理为array
    // eg: zh-CN,zh;q=0.8,en;q=0.6
    if (typeof input === 'string' && input.indexOf(';') > -1)
        input = parseLanguageList(input)

    // 检查是否为array
    if (Array.isArray(input)) {
        let id

        input.some(thisId => {
            id = checkItem(thisId)
            return id
        })

        return id || availableLocales[0]
    }

    else if (!input && typeof navigator !== 'undefined')
        return getLocaleId(navigator.languages || navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || availableLocales[0])

    else if (input)
        return checkItem(input) || availableLocales[0]

    return availableLocales[0]
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
 * 根据输入的语言列表字符串，返回语言列表array
 * 
 * @param {string} langList 语言列表字符串，eg: zh-CN,zh;q=0.8,en;q=0.6
 * 
 * @returns {array} 语言列表
 */
export const parseLanguageList = (langList) => {
    langList = langList.split(',').map(thisLang => {
        return thisLang.split(';')[0]
    })

    return langList
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
    let str = (l && l[key]) ? l[key] : null

    if (!str) {
        try {
            str = eval('l.' + key)
        } catch (e) { }
    }

    if (!str) str = key

    if (typeof str === 'string')
        return str.replace(
            /\$\{([^\}]+)\}/g,
            (match, p) => typeof obj[p] === 'undefined' ? p : obj[p]
        )

    else
        return str
}


export default translate