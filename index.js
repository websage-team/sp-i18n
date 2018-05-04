import React from 'react'

export const I18N_INIT = 'I18N_INIT'
export const I18N_LOCALES = 'I18N_LOCALES'

// 当前项目可用的语言包代码，与语言包文件名精确匹配
// 注：无论何种环境，在使用任何函数前，需要使用 register() 函数定义/初始化该 Array
export let availableLocales = []
export const setAvailableLocales = arr => availableLocales = arr

// 当前语言包名代码，与语言包文件名精确匹配
export let localeId = null
export const setLocaleId = newLlocalId => {
    if (typeof newLlocalId === 'undefined' || newLlocalId === null)
        return
    if (__DEV__ && __SERVER__)
        console.log(`\n\x1b[93m[super/i18n]\x1b[0m setLocaleId -> \x1b[32m${newLlocalId}\x1b[0m\n`)
    localeId = newLlocalId
    return localeId
}

// 存储文本，按语言包名，如 locales.en、locales['zh-cn']
export let locales = {}
export const setLocales = (locale = localeId, obj) => {
    locales[locale] = obj
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
 * 翻译文本
 * 语言包中源文本中的 ${replaceKey} 表示此处需要替换，replaceKey 就是传入的 obj 中对应的值
 * 
 * @param {string} key 要翻译的文本 Key
 * @param {*object} obj 文本内对应的替换内容
 * 
 * @returns {string} 翻译的文本；如果语言包中没有对应的项，返回 key
 */
const translate = (...args) => {
    let key = ''
    let str
    let options = {}
    let length = args.length

    if (typeof args[args.length - 1] === 'object') {
        length -= 1
        options = args[args.length - 1]
    }

    if (typeof args[0] === 'object') {
        key = args[0]
        console.log('============')
        console.log(args)
        for (let i = 1; i < length; i++) {
            if (typeof key[args[i]] !== 'undefined')
                key = key[args[i]]
            console.log(i, key)
        }
        if (typeof key === 'object') key = args[length - 1]
        console.log('============')
    } else {
        for (let i = 0; i < length; i++) {
            key += args[i]
        }
    }

    // console.log(args, length, key)

    if (__CLIENT__) {
        str = key
    }
    if (__SERVER__) {
        const l = locales[localeId]
        str = (l && typeof l[key] !== 'undefined') ? l[key] : undefined
    }
    // const localeId = _self.curLocaleId

    if (typeof str === 'undefined') {
        try {
            str = eval('l.' + key)
        } catch (e) { }
    }

    if (typeof str === 'undefined') str = key

    if (typeof str === 'string')
        return str.replace(
            /\$\{([^}]+)\}/g,
            (match, p) => typeof options[p] === 'undefined' ? p : options[p]
        )

    else
        return str
}

// export const decorator = () => (Wrapped) => {
//     // const L = {
//     //     A: {
//     //         B: '啊啊啊-啊啊啊'
//     //     }
//     // }
//     // return Wrapped
//     if (__CLIENT__) return Wrapped
//     return (props) => (
//         <Wrapped
//             L={L}
//             locales={locales[localeId]}
//             {...props}
//         />
//     )
// }


export default translate
