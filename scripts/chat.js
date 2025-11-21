import { world, system, Player, ChatSendBeforeEvent, PlayerSpawnAfterEvent, PlayerLeaveBeforeEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./uis/interfaces"
import { mcl } from "./logic"
import { boatTypes, colorCodes, crasherSymbol, crasherSymbol2, emojis, professionalism, replacer, spanishToEnglish, specialRanks, version } from "./data/arrays"
import { landclaimMainUI, queueMessageUI } from "./uis/interfacesTwo"
import { log } from "./world/anticheat"
import { cd } from "./data/defaults"


// This file handles all chat interactions such as:
// Custom commands, ranks, censoring, antispam

let messageMap = new Map()
let lastSender = ''

/**@type {Map<string, {name: string, score: number}>} */
let spammerMap = new Map()

/**
 * @param {ChatSendBeforeEvent} evd
 * @param {string} message 
 * @param {Player} player 
 */
export function chatSystem(evd = undefined, player, message) {
    const enabled = mcl.jsonWGet('darkoak:scriptsettings')
    if (enabled?.chatmaster === true) return

    if (evd) evd.cancel = true

    let chat = {
        name: player.name,
        message: message,
        reference: ''
    }

    const commands = mcl.listGetValues('darkoak:command:')
    for (let index = 0; index < commands.length; index++) {
        const p = JSON.parse(commands[index])

        const msgCmd = message.trim().split(' ', 1)[0]
        const pCmd = p.message.trim().split(' ', 1)[0]
        if (msgCmd !== pCmd) continue

        if (!p.tag || player.hasTag(p.tag)) {
            if (p.command.startsWith('#')) {
                hashtag(p.command, player)
                return
            } else {
                system.runTimeout(() => {
                    try {
                        chatCommand(player, { ...p, message })
                    } catch {
                        mcl.adminMessage(`${p.message} Command Has An Error§r`)
                    }
                })
                return
            }
        }
    }

    // chat games
    /**@type {{unscrambleEnabled: boolean, unscrambleWords: string, unscrambleInterval: number, unscrambleCommand: string}} */
    const game = mcl.jsonWGet('darkoak:chatgames')
    const word = mcl.wGet('darkoak:chatgame1:word')
    if (word) {
        if (message.trim() == word.trim()) {
            world.sendMessage(`§a${player.name} won! The word was: §r§f${word}`)
            mcl.wRemove('darkoak:chatgame1:word')
            system.runTimeout(() => {
                if (game.unscrambleCommand) player.runCommand(replacer(player, game.unscrambleCommand))
            }, 2)
            return
        }
    }

    const boat = mcl.wGet('darkoak:boatcatcher:boat')
    if (boat) {
        if (message.trim() == 'CATCH') {
            let bac = mcl.jsonPGet(player, 'darkoak:boatcatcher') || {}

            bac[boat] = (bac[boat] || 0) + 1
            mcl.jsonPSet(player, 'darkoak:boatcatcher', bac)

            world.sendMessage(`§a${player.name} Caught A(n) ${boat}!`)
            mcl.wRemove('darkoak:boatcatcher:boat')
            return
        }
    }

    const spammerGame = mcl.jsonWGet('darkoak:spammer:game')
    if (spammerGame?.enabled && message === 'SPAM') {
        spammerMap.set(player.name, {
            name: player.name,
            score: (spammerMap.get(player.name)?.score || 0) + 1
        })
        return
    }

    if (chatPreventives(player, message)) return


    // auto response
    const res = mcl.listGetValues('darkoak:autoresponse:')
    for (let index = 0; index < res.length; index++) {
        const parts = JSON.parse(res[index])
        if (message.includes(parts.word)) {
            system.runTimeout(() => {
                player.sendMessage(`§aAuto-Response: §r§f${parts.response}`)
            }, 5)
        }
    }

    const ocs = mcl.jsonWGet('darkoak:chat:other')

    // message logs
    if (ocs?.chatLogs) messageLog(player, message)

    messageModifiers(ocs, chat, player)

    let ranks = mcl.getChatModifiers(player)

    let cr = mcl.jsonWGet('darkoak:chatranks') || {
        start: '[',
        middle: '][',
        end: ']',
        bridge: '->',
        defaultRank: 'New',
        cStart: '(',
        cEnd: ')',
    }

    let clan = ''
    if (ranks.clan) clan = cr.cStart + ranks.clan + cr.cEnd

    const text = `${clan}${cr.start}${replacer(player, (ranks.ranks.join(cr.middle) || cr.defaultRank))}${cr.end}§r§f${ranks.namecolors.join('')}%REFER%${chat.name}§r§f${cr.bridge} §r§f${ranks.chatColors.join('')}${chat.message}`


    if (ocs?.proximity) {
        system.runTimeout(() => {
            if (player.hasTag('darkoak:radio')) {
                player.runCommand(`tellraw @a [tag="darkoak:radio"] {"rawtext": [{"text":"${text}"}]}`)
                player.runCommand(`tellraw @a [r=15,tag=!"darkoak:radio"] {"rawtext": [{"text":"${text}"}]}`)
            } else {
                player.runCommand(`tellraw @a [r=15] {"rawtext": [{"text":"${text}"}]}`)
            }
        }, 1)
    } else {
        if (ocs?.discordstyle) {
            if (lastSender === chat.name) {
                world.sendMessage({ rawtext: [{ text: `| §r§f${chatColors.join('')}${chat.message}` }] })
            } else {
                mcl.sendMessagesByTag([
                    { tag: 'darkoak:admin', message: text.replace('%REFER%', chat.reference) },
                    { tag: undefined, message: text.replace('%REFER%', '') }
                ])
            }
        } else {
            mcl.sendMessagesByTag([
                { tag: 'darkoak:admin', message: text.replace('%REFER%', chat.reference) },
                { tag: undefined, message: text.replace('%REFER%', '') }
            ])
        }
    }

    lastSender = chat.name
}

/**
 * @param {string} hashtagKey 
 * @param {Player} sender 
 */
function hashtag(hashtagKey, sender) {
    try {
        switch (hashtagKey.replaceAll('#', '')) {
            case 'commands':
                let cMessage = ['------------------------------------------------------------']
                const c = mcl.listGetValues('darkoak:command:')
                for (let index = 0; index < c.length; index++) {
                    const p = JSON.parse(c[index])
                    cMessage.push(`${p?.message} | ${p?.tag || 'No Tag'} -> ${p?.command}`)
                }
                cMessage.push('------------------------------------------------------------')
                sender.sendMessage(cMessage.join('\n'))
                break
            case 'noob':
                sender.sendMessage('ALL HAIL THE NOOBSLAYER')
                break
            case 'datadeleter':
                sender.sendMessage('Close Chat!')
                system.runInterval(() => {
                    i.dataDeleterUI(sender)
                }, 20)
                break
            case 'cc':
                let i = 0
                while (i++ < 100) {
                    world.sendMessage(' \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n ')
                    world.sendMessage(' \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n ')
                }
                break
            case 'cclocal':
                let o = 0
                while (o++ < 100) {
                    sender.sendMessage(' \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n ')
                    sender.sendMessage(' \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n ')
                }
                break
            case 'random':
                world.sendMessage(mcl.randomNumber(100).toString())
                break
            case 'emojis':
                for (let index = 0; index < emojis.length; index++) {
                    const emoji = emojis[index]
                    sender.sendMessage(`${emoji.m} -> ${emoji.e}`)
                }
                break
            case 'bind':
                sender.sendMessage('Close Chat!')
                system.runTimeout(() => {
                    sender.runCommand('scriptevent darkoak:bind')
                }, 20)
                break
            case 'version':
                sender.sendMessage(version)
                break
            case 'message':
                sender.sendMessage('Close Chat!')
                system.runTimeout(() => {
                    queueMessageUI(sender)
                }, 20)
                break
        }
    } catch (e) {
        mcl.adminMessage(`A Custom Command That Uses A Hashtag-Key Is Having An Error: ${hashtagKey} From ${sender.name}`)
    }
}

let loops = 0
let time1 = 0
let time2 = 205
/**Chat games handler
 * @param {object} chat 
 */
export function chatGames(chat) {
    if (chat?.chatmaster === true) return

    /**@type {{unscrambleEnabled: boolean, unscrambleWords: string, unscrambleInterval: number, unscrambleCommand: string, catcherEnabled: boolean, catcherInterval: number}} */
    const d = mcl.jsonWGet('darkoak:chatgames')
    if (!d) return
    if (d?.unscrambleEnabled) {
        time1++

        if (time1 >= (d.unscrambleInterval * 60) * 20) {
            time1 = 0
            loops++

            let words = d.unscrambleWords.split(',')
            let word = words[mcl.randomNumber(words.length - 1)].trim()

            world.sendMessage(`§a[${loops}] Unscramble for a prize! Word:§r§f ${mcl.stringScrambler(word)}`)

            mcl.wSet('darkoak:chatgame1:word', word)
        }
    }

    if (d?.catcherEnabled) {
        time2++

        if (time2 >= (d.catcherInterval * 60) * 20) {
            time2 = 0
            loops++

            const btc = boatTypes[mcl.randomNumber(boatTypes.length - 1)]

            world.sendMessage(`§a[${loops}] Boat-Catcher! Type 'CATCH' To Catch A(n) ${btc}!`)
            mcl.wSet('darkoak:boatcatcher:boat', btc)
        }
    }

    if (d?.spammerEnabled && mcl.tickTimer((d?.spammerInterval * 60) * 20)) {
        world.sendMessage(`§aSpammer! Type 'SPAM' As Fast As You Can! You Only Have 10 Seconds!`)
        mcl.jsonWSet('darkoak:spammer:game', {
            enabled: true
        })
        system.runTimeout(() => {
            mcl.jsonWSet('darkoak:spammer:game', {
                enabled: false
            })

            let spammerArray = Array.from(spammerMap).map(([key, value]) => ({
                name: value?.name,
                score: value?.score
            }))
            spammerArray.sort((a, b) => b.score - a.score)
            spammerMap.clear()

            const w = spammerArray[0]

            if (w?.score > 0) {
                world.sendMessage(`§a${w?.name} Has Won With ${w?.score || 0} Spams!§r`)
                const winner = mcl.getPlayer(w?.name)
                if (d?.spammerCommand) winner.runCommand(d?.spammerCommand)
            } else {
                world.sendMessage('§iNobody Spammed.§r')
            }
        }, mcl.secondsToTicks(10))
    }
}

/**Interval event for nametags
 * @param {Player} p 
 * @param {object} ocs 
 * @param {{antinametags: boolean | undefined}} d 
 */
export function nametag(p, ocs, d) {

    if (d?.antinametags && mcl.tickTimer(20)) {
        system.runTimeout(() => {
            p.nameTag = ''
        })
    }

    let cr = mcl.jsonWGet('darkoak:chatranks') || {
        start: '[',
        middle: '][',
        end: ']',
        bridge: '->',
        defaultRank: 'New',
        cStart: '(',
        cEnd: ')',
    }

    const tags = p.getTags()

    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => {

        if (specialRanks[tag]) return `§r${specialRanks[tag]}`

        return tag.replace('rank:', '')
    })

    ranks = ranks.length ? ranks : [cr.defaultRank]

    let lines = [p.name]
    if (ocs?.nonametags) lines = []

    if (ocs?.healthDisplay) lines.push(`§aHealth: ${Math.round(mcl.healthValue(p))}§r§f`)
    if (ocs?.nametag) lines.push(mcl.jsonPGet(p, 'darkoak:antispam').message)
    if (ocs?.nametag) lines.push((messageMap.get(p.name) || ''))
    if (ocs?.nametagRanks) lines.push(`${cr.start}${replacer(p, ranks.join(cr.middle))}${cr.end}`)

    system.runTimeout(() => {
        try {
            p.nameTag = lines.join('\n')
        } catch {

        }
    })
}

export function landclaimCheck(a, b) {
    // a and b are objects with p1 and p2, each having x and z
    const aMinX = Math.min(a.p1.x, a.p2.x)
    const aMaxX = Math.max(a.p1.x, a.p2.x)
    const aMinZ = Math.min(a.p1.z, a.p2.z)
    const aMaxZ = Math.max(a.p1.z, a.p2.z)

    const bMinX = Math.min(b.p1.x, b.p2.x)
    const bMaxX = Math.max(b.p1.x, b.p2.x)
    const bMinZ = Math.min(b.p1.z, b.p2.z)
    const bMaxZ = Math.max(b.p1.z, b.p2.z)

    // check for overlap
    return !(aMaxX < bMinX || aMinX > bMaxX || aMaxZ < bMinZ || aMinZ > bMaxZ)
}

/**
 * @param {PlayerSpawnAfterEvent} evd 
 */
export function messageQueueAndPlayerList(evd) {
    const player = evd.player

    // let players = mcl.getPlayerList() || []
    // if (!players.includes(player.name)) {
    //     players.push(player.name)
    //     mcl.jsonWSet('darkoak:playerlist', players)
    // }

    // let admins = mcl.getAdminList() || []
    // if (mcl.isDOBAdmin(player) && !admins.includes(player.name)) {
    //     admins.push(player.name)
    //     mcl.jsonWSet('darkoak:adminlist', admins)
    // } else if (!mcl.isDOBAdmin(player) && admins.includes(player.name)) {
    //     admins = admins.filter(e => e !== player.name)
    //     mcl.jsonWSet('darkoak:adminlist', admins)
    // }

    const messages = mcl.listGetBoth('darkoak:queuemessage:')
    for (let index = 0; index < messages.length; index++) {
        const message = JSON.parse(messages[index].value)
        if (message.player == player.name) {
            player.sendMessage(`§a[Message Queue] §r§f${message.player} -> ${message.message}`)
            mcl.wRemove(messages[index].id)
        }
    }
}

/**
 * @param {Player} player 
 * @param {{tag: string, message: string, command: string, command2: string, command3: string}} p
 */
export function chatCommand(player, p) {
    const mess = p.message.split(' ', 2)

    const playerSelect = mess[1] ? (mcl.getStringBetweenChars(mess[1], '"', '"') || mess[1]) : undefined

    let commandToRun = p.command
    if (playerSelect && commandToRun.includes('[player]')) {
        commandToRun = commandToRun.replaceAll('[player]', playerSelect)
    }
    player.runCommand(replacer(player, commandToRun))

    let commandToRun2 = p.command2
    if (playerSelect && commandToRun2.includes('[player]')) {
        commandToRun2 = commandToRun2.replaceAll('[player]', playerSelect)
    }
    player.runCommand(replacer(player, commandToRun2))

    let commandToRun3 = p.command3
    if (playerSelect && commandToRun3.includes('[player]')) {
        commandToRun3 = commandToRun3.replaceAll('[player]', playerSelect)
    }
    player.runCommand(replacer(player, commandToRun3))

}

/**
 * @param {Player} player 
 * @param {string} message 
 */
function chatPreventives(player, message) {
    try {
        // mutes
        if (player.hasTag('darkoak:muted')) return true
        const canChat = mcl.roleCheck(player)?.chat
        if (canChat && canChat === false) return true

        // censoring
        /**@type {string[]} */
        let censor = mcl.jsonWGet('darkoak:censor')
        if (censor && censor.length != 0 && !mcl.isDOBAdmin(player)) {
            for (let index = 0; index < censor.length; index++) {
                if (mcl.deleteFormatting(message).toLowerCase().includes(censor[index].toLowerCase())) return true
            }
        }

        const d = mcl.jsonWGet('darkoak:anticheat')

        // anti spam
        if (d?.antispam) {
            const trimmed = message.trim()
            if ((messageMap.get(player.name) || '') === trimmed && !mcl.isOp(player) && !mcl.isDOBAdmin(player)) return true
            if (
                trimmed.includes('horion.download') ||
                trimmed.includes('lumineproxy') ||
                trimmed.includes('packet.sell.app')
            ) {
                log(player, `hack client message`)
                return true
            }
            if (d?.antispam2) {
                if (trimmed.split('|')[1]?.trim().length === 8) {
                    return true
                }
            }
        }
        if (d?.antispamactive) {
            if (player.isJumping || player.isSprinting) {
                log(player, `anti-spam-active`)
                return true
            }
        }

        // anti crasher 1
        if (d?.anticrasher1 && (message.includes(crasherSymbol) || message.includes(crasherSymbol2))) return true

        messageMap.set(player.name, message.trim())
        return false
    } catch {
        system.runTimeout(() => {
            mcl.adminMessage(`Chat Preventatives Failed For: ${player.name}`)
        })
        return false
    }
}

/**
 * @param {object} ocs 
 * @param {object} chat 
 * @param {Player} player 
 * @param {{antistreamermode: boolean}} d 
 */
function messageModifiers(ocs, chat, player, d) {
    if (mcl.jsonWGet('darkoak:community:general').emojisenabled) {
        for (let index = 0; index < emojis.length; index++) {
            const e = emojis[index]
            chat.message = chat.message.replaceAll(e.m, e.e)
        }
        const matchAmount = mcl.findMatchingAmount(chat.message, '§?')
        for (let index = 0; index < matchAmount; index++) {
            chat.message = chat.message.replace('§?', colorCodes[mcl.randomNumber(colorCodes.length)])
        }
    }

    if (ocs?.translateToEng) {
        chat.message = ' ' + chat.message + ' '
        for (let index = 0; index < spanishToEnglish.length; index++) {
            const word = spanishToEnglish[index]
            chat.message = chat.message.replaceAll((' ' + word.spa + ' '), (' ' + word.eng + ' '))
        }
        chat.message = chat.message.trim()
    }

    if (ocs?.professional) {
        chat.message = ' ' + chat.message + ' '
        for (let index = 0; index < professionalism.length; index++) {
            const pro = professionalism[index]
            chat.message = chat.message.replaceAll((' ' + pro.m + ' '), (' ' + pro.e + ' '))
        }
        chat.message = chat.message.trim()
        chat.message = mcl.uppercaseFirstLetter(chat.message)
    }

    const nick = mcl.jsonPGet(player, 'darkoak:nickname')
    if (nick && mcl.jsonWGet('darkoak:nicknamesettings')?.enabled) {
        // const colorNum = Math.abs(world.getAllPlayers().findIndex(e => e.name === player.name)) % 10
        const colorNum = (mcl.stringToNumber(chat.name) % 9) + 1
        chat.reference = `<§${colorNum}${chat.name.slice(0, 4)}§f>`
        chat.name = nick?.nick
    }

    if (d?.antistreamermode) {
        chat.name = chat.name
            .replace('B', 'Β')
            .replace('A', 'Α')
            .replace('E', 'Ε')
            .replace('H', 'ʜ')
            .replace('H', 'Η')
            .replace('I', 'ɪ')
            .replace('Y', 'ʏ')
            .replace('K', 'Κ')
            .replace('M', 'Μ')
            .replace('N', 'Ν')
    }
}

/**
 * 
 * @param {Player} player 
 * @param {string} message 
 */
export function messageLog(player, message) {
    /**@type {{name: string, message: string, time: number}[]} */
    let logs2 = mcl.jsonWGet('darkoak:messagelogs:v2') || [{ name: 'Default', message: 'Default', time: Date.now() }]
    while (logs2.length > 250) {
        logs2.shift()
    }
    if (logs2.length > 0 && logs2[logs2.length - 1].name === player.name) {
        logs2[logs2.length - 1].message += `\n| ${message}`
    } else {
        logs2.push({
            name: player.name,
            message: message,
            time: Date.now()
        })
    }
    mcl.jsonWSet('darkoak:messagelogs:v2', logs2)
}

/**
 * @param {PlayerSpawnAfterEvent | PlayerLeaveBeforeEvent} evd 
 */
export function logJoinsLeaves(evd) {
    let now = Date.now().toString().slice(5)
    const loc = evd.player.location
    if ((evd instanceof PlayerSpawnAfterEvent) && evd.initialSpawn) {
        messageLog(evd.player, `§eJoined The Game§r, Time: ${now}, Loc: ${loc.x.toFixed(0)}, ${loc.y.toFixed(0)}, ${loc.z.toFixed(0)}`)
    } else if ((evd instanceof PlayerLeaveBeforeEvent)) {
        messageLog(evd.player, `§eLeaved The Game§r, Time: ${now}, Loc: ${loc.x.toFixed(0)}, ${loc.y.toFixed(0)}, ${loc.z.toFixed(0)}`)
    }
}