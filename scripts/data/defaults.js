import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet and it manages data size / limits

/**Only used for updateData
 * @type {Map<string, object>} 
 */
export const cd = new Map()

system.runTimeout(() => {
    updateData(true)
})

export function updateData(initial = false) {

    const properties = world.getDynamicPropertyIds()
    const d = mcl.jsonWGet('darkoak:scriptsettings')
    let num = (d?.updateinterval ?? 0)

    if (initial || num === 0) {
        for (let index = 0; index < properties.length; index++) {
            const pro = properties[index]
            try {
                cd.set(pro, dataGet(pro))
            } catch (e) {
                mcl.debugLog(`cd setting: ${pro}`, String(e))
            }
        }
    } else {
        if (!mcl.tickTimer((num * 20))) return
        const interval = num * 1000
        const step = properties.length > 0 ? interval / properties.length : interval

        for (let index = 0; index < properties.length; index++) {
            const pro = properties[index]
            system.runTimeout(() => {
                try {
                    cd.set(pro, dataGet(pro))
                } catch (e) {
                    mcl.debugLog(`cd setting: ${pro}`, String(e))
                }
            }, Math.floor(step * index / 50))
        }
    }
}

/**ONLY FOR THE UPDATEDATA FUNCTION (except for when instant data retrieval is neccessary)
 * @param {string} id 
 * @returns {object | any[] | undefined}
 */
export function dataGet(id) {
    const t = world.getDynamicProperty(id)
    if (t == undefined) {
        return undefined
    } else {
        try {
            try {
                return JSON.parse(t)
            } catch {
                return t
            }
        } catch (e) {
            console.error(`DATA ERROR ${id}: ` + String(e))
            mcl.debugLog('ERROR', `DATA ERROR ${id}: ` + String(e))
            const pla = world.getPlayers({ name: 'Darkoakboat2121' })
            if (pla.length > 0) pla[0]?.sendMessage(`DATA ERROR ${id}: ` + String(e))
            return undefined
        }
    }
}

let lastTime = Date.now()
let sessionSeconds = 0
/**Gets tps, seconds, and minutes */
export function timers() {
    if (mcl.tickTimer(20)) {
        sessionSeconds++
        mcl.jsonWSet('darkoak:sseconds', {
            seconds: sessionSeconds
        })
        mcl.jsonWSet('darkoak:sminutes', {
            minutes: (sessionSeconds / 60)
        })

        const currentTime = Date.now()
        const elapsedTime = (currentTime - lastTime) / 1000
        let tps = 20 / elapsedTime
        if (tps > 20) tps = 20
        mcl.jsonWSet('darkoak:tps', {
            tps: tps.toFixed(0)
        })
        lastTime = currentTime
    }

}

// world.broadcastClientMessage('ping', 'now')
// world.afterEvents.messageReceive.subscribe((evd) => {
//     mcl.adminMessage(`${evd.id} by ${evd.player?.name} sent ${evd.message}`)
// })

/**@type {Map<string, Player>} */
export const playerLog = new Map()
/**
 * @param {Player[]} players 
 */
export function playerDataLogger(players) {
    if (!mcl.tickTimer(1200)) return

    const d = mcl.jsonWGet('darkoak:scriptsettings')

    mcl.arraySpreader(players, 60, (player, i) => {
        if (player.isValid) {
            try {
                const data = mcl.playerToData(player)
                playerLog.set(player?.name, data)
                if (d?.collectPlayers) mcl.jsonWSet(`darkoak:player:${player?.name}`, data)
            } catch {

            }
        }
    })
}

export function defaultData() {
    // if (mcl.wGet('darkoak:chat:other') === undefined) {
    //     mcl.jsonWSet('darkoak:chat:other', {
    //         proximity: false
    //     })
    // }

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
    if (!mcl.jsonWGet('darkoak:setup')) {
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
        mcl.jsonWSet('darkoak:setup', {
            set: true
        })
    }
}

// system.runTimeout(() => {
//     const d = mcl.jsonWGet('darkoak:anticheat')
//     const host = world.getAllPlayers().filter(e => ((e?.name ?? 'EMPTY') === d?.antiforceopowner))[0]
//     if (!host) {
//         mcl.adminMessage('Please Assign A Host / Owner In The Anticheat Settings')
//         return
//     }
//     const stn = mcl.stringToNumber(host?.name)
//     const key = stn //mcl.decide(stn.toString().length > 10, parseInt(stn.toString().slice(0, 10)), stn)
//     host.sendMessage(`Your Reset Key Is: ${key}, Use This If You Need To Reset The Entire Addon`)
//     mcl.jsonWUpdate('darkoak:setup', 'resetKey', mcl.stringEncrypt(key.toString()))
//     mcl.jsonWUpdate('darkoak:setup', 'hostName', mcl.stringEncrypt(host?.name))
// }, 60 * 20)