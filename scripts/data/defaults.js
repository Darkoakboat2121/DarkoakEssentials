import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet and it manages data size / limits



export function logcheck() {
    const log = mcl.wGet('darkoak:log')
    let data = JSON.parse(log)

    if (data.logs.length > 100) {
        data.logs.shift()
    }

    mcl.wSet('darkoak:log', JSON.stringify(data))
}


system.runInterval(() => {
    const byte = world.getDynamicPropertyTotalByteCount()
    if (byte > 20000) {
        mcl.adminMessage(`Possibly Dangerous Property Count: ${byte.toString()}, Please Print The World Data`)
    }
}, 6000)

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (mcl.pGet(player, 'darkoak:ac:blocksbroken') == undefined) {
            mcl.pSet(player, 'darkoak:ac:blocksbroken', 0)
        }

        if (mcl.pGet(player, 'darkoak:ac:blocksplaced') == undefined) {
            mcl.pSet(player, 'darkoak:ac:blocksplaced', 0)
        }

        if (mcl.pGet(player, 'darkoak:antispam') == undefined) {
            mcl.pSet(player, 'darkoak:antispam', JSON.stringify({
                message: 'placeholder'
            }))
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

    if (mcl.wGet('darkoak:welcome') === undefined) {
        mcl.wSet('darkoak:welcome', 'Welcome! Use The Main UI Item To Start.')
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
        

        mcl.wSet('darkoak:setup', true)
    }
})
