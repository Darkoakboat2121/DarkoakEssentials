import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet and it manages data size / limits

/**Only use for jsonWGet things!
 * @type {Map<string, object>} 
 */
export const cd = new Map()

system.runTimeout(() => {
    updateData(true)
})

export function updateData(initial = false) {
    const d = mcl.jsonWGet('darkoak:scriptsettings')
    if (!mcl.tickTimer(((d?.updateinterval || 1) * 20)) && !initial) return
    const properties = world.getDynamicPropertyIds()
    for (let index = 0; index < properties.length; index++) {
        const pro = properties[index]
        cd.set(pro, dataGet(pro))
    }
}

/**ONLY FOR THE UPDATEDATA FUNCTION, DO NOT USE ELSEWHERE
 * @param {string} id 
 * @returns {object | any[] | undefined}
 */
function dataGet(id) {
    const t = world.getDynamicProperty(id)
    if (t == undefined) {
        return undefined
    } else {
        return JSON.parse(t)
    }
}

let lastTime = Date.now()
let sessionSeconds = 0
let tickcount = 0
/**Gets tps, seconds, and minutes */
export function timers() {
    tickcount++
    if (tickcount % 20 === 0) {
        sessionSeconds++
        mcl.wSet('darkoak:sseconds', sessionSeconds)
        mcl.wSet('darkoak:sminutes', (sessionSeconds / 60))

        const currentTime = Date.now()
        const elapsedTime = (currentTime - lastTime) / 1000
        let tps = 20 / elapsedTime
        if (tps > 20) tps = 20
        mcl.wSet('darkoak:tps', tps.toFixed(0))
        lastTime = currentTime
    }
}


export function defaultData() {
    if (mcl.wGet('darkoak:scriptsettings') === undefined) {
        mcl.jsonWSet('darkoak:scriptsettings', {
            cancelWatchdog: false,
            datalog: false,
        })
    }

    if (mcl.wGet('darkoak:chat:other') === undefined) {
        mcl.jsonWSet('darkoak:chat:other', {
            proximity: false
        })
    }

    if (mcl.wGet('darkoak:tpa') === undefined) {
        mcl.jsonWSet('darkoak:tpa', {
            enabled: false,
            adminTp: false,
        })
    }

    if (mcl.wGet('darkoak:itemsettings') === undefined) {
        mcl.jsonWSet('darkoak:itemsettings', {
            hopfeather: 0,
            hopfeatherM: false
        })
    }

    if (mcl.wGet('darkoak:reportsettings') === undefined) {
        mcl.jsonWSet('darkoak:reportsettings', {
            enabled: true,
            rules: ''
        })
    }

    if (mcl.wGet('darkoak:community:general') === undefined) {
        mcl.jsonWSet('darkoak:community:general', {
            giveOnJoin: false,

        })
    }

    if (mcl.wGet('darkoak:moneyscore') === undefined) {
        mcl.jsonWSet('darkoak:moneyscore', {
            tax: '0',
            compression: '0',
        })
    }


    // Setup on first load
    if (!mcl.wGet('darkoak:setup')) {
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: '!commands',
            command: '#commands',
            tag: ''
        })
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: '!noob',
            command: '#noob',
            tag: ''
        })
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: '!datadeleter',
            command: '#datadeleter',
            tag: 'darkoak:admin'
        })
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: '!cc',
            command: '#cc',
            tag: 'darkoak:admin'
        })
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: '!random',
            command: '#random',
            tag: 'darkoak:admin'
        })
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: '!emojis',
            command: '#emojis',
            tag: ''
        })
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: '!version',
            command: '#version',
            tag: ''
        })

        world.sendMessage('Darkoak Essentials Has Been Setup / Installed! Use The Main UI Item To Start')
        mcl.wSet('darkoak:setup', true)
    }
}

