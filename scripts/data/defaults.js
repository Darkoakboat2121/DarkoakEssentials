import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet and it manages data size / limits


export function logcheck() {
    let log = mcl.jsonWGet('darkoak:log')

    if (log.logs.length > 100) {
        log.logs.shift()
    }

    mcl.jsonWSet('darkoak:log', log)
}

let ticker = 0
/**Checks the byte count for massive sizes (mb) */
export function byteChecker() {
    if (ticker <= 6000) {
        ticker += 1
        return
    }
    const byte = world.getDynamicPropertyTotalByteCount()
    if (byte > 1048576) {
        mcl.adminMessage(`Possibly Dangerous Property Count: ${byte.toString()}, Please Print The World Data`)
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
    const players = world.getAllPlayers()
    for (let index = 0; index < players.length; index++) {
        const player = players[index]
        if (mcl.pGet(player, 'darkoak:ac:blocksbroken') == undefined) {
            mcl.pSet(player, 'darkoak:ac:blocksbroken', 0)
        }

        if (mcl.pGet(player, 'darkoak:ac:blocksplaced') == undefined) {
            mcl.pSet(player, 'darkoak:ac:blocksplaced', 0)
        }

        if (mcl.pGet(player, 'darkoak:antispam') == undefined) {
            mcl.jsonPSet(player, 'darkoak:antispam', {
                message: 'placeholder'
            })
        }
    }

    if (mcl.wGet('darkoak:chatranks') === undefined) {
        mcl.jsonWSet('darkoak:chatranks', {
            defaultRank: 'New',
            bridge: '->',
            middle: '][',
            start: '[',
            end: ']'
        })
    }

    if (mcl.wGet('darkoak:messagelogs') === undefined) {
        mcl.jsonWSet('darkoak:messagelogs', {
            log: ['placeholder', 'placeholder2']
        })
    }

    if (mcl.wGet('darkoak:anticheat') === undefined) {
        mcl.jsonWSet('darkoak:anticheat', {
            prebans: false
        })
    }

    if (mcl.wGet('darkoak:tracking') === undefined) {
        mcl.jsonWSet('darkoak:tracking', {
            flying: false,
            gliding: false,
            climbing: false,
            emoting: false,
            falling: false,
            inwater: false,
            jumping: false,
            onground: false
        })
    }

    if (mcl.wGet('darkoak:cws:rtp:enabled') === undefined) {
        mcl.wSet('darkoak:cws:rtp:enabled', false)
    }
    if (mcl.wGet('darkoak:cws:rtp:center') === undefined) {
        mcl.wSet('darkoak:cws:rtp:center', '0')
    }
    if (mcl.wGet('darkoak:cws:rtp:distance') === undefined) {
        mcl.wSet('darkoak:cws:rtp:distance', '100')
    }

    if (mcl.wGet('darkoak:communityshowhide') === undefined) {
        mcl.jsonWSet('darkoak:communityshowhide', {
            payshop0: true,
            payshop1: true,
            payshop2: true,
            payshop3: true,
            warps: true,
            report: true,
            myprofile: true,
            personallog: true,
            credits: true,
        })
    }

    if (mcl.wGet('darkoak:chatgames') === undefined) {
        mcl.jsonWSet('darkoak:chatgames', {
            unscrambleEnabled: false
        })
    }

    if (mcl.wGet('darkoak:scriptsettings') === undefined) {
        mcl.jsonWSet('darkoak:scriptsettings', {
            cancelWatchdog: false,
            datalog: false
        })
    }

    if (mcl.wGet('darkoak:welcome') === undefined) {
        mcl.jsonWSet('darkoak:welcome', {
            welcome: 'Welcome! Use The Main UI Item To Start.',
            welcomeS: false,
            bye: 'Goodbye #name#!',
            byeS: false,
        })
    }

    if (mcl.wGet('darkoak:worldprotection') === undefined) {
        mcl.jsonWSet('darkoak:worldprotection', {
            boats: false
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
            id: '',
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