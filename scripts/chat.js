import { world, system, Player, ChatSendBeforeEvent, PlayerSpawnAfterEvent, PlayerLeaveBeforeEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./uis/interfaces"
import { mcl } from "./logic"
import { boatTypes, colorCodes, crasherSymbol, crasherSymbol2, emojis, professionalism, replacer, spanishToEnglish, specialRanks, version } from "./data/arrays"
import { landclaimMainUI, queueMessageUI } from "./uis/interfacesTwo"
import { log } from "./world/anticheat"
import { cd } from "./data/defaults"
import { boatbot } from "./miscellaneous/boatbot"


// This file handles all chat interactions such as:
// Custom commands, ranks, censoring, antispam

/**@type {Map<string, {message: string, time: number}>} */
export let messageMap = new Map()
let lastSender = ''

/**@type {Map<string, {name: string, score: number}>} */
export let spammerMap = new Map()

let chatGamesToggles = {
    spammer: false,
    scramble: false,
    catcher: false
}

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

    if (mcl.jsonPGet(player, 'darkoak:privatechat') && !message.startsWith('*')) {
        privateChat(player, message)
        return
    }

    // chat games
    /**@type {{unscrambleEnabled: boolean, unscrambleWords: string, unscrambleInterval: number, unscrambleCommand: string}} */
    const game = mcl.jsonWGet('darkoak:chatgames')
    const word = mcl.jsonWGet('darkoak:chatgame1:word')?.word
    if (word && chatGamesToggles.scramble) {
        if (message.trim() == word.trim()) {
            world.sendMessage(`§a${player.name} won! The word was: §r§f${word}`)
            mcl.wRemove('darkoak:chatgame1:word')
            chatGamesToggles.scramble = false
            system.runTimeout(() => {
                if (game.unscrambleCommand) player.runCommand(replacer(player, game.unscrambleCommand))
            }, 2)
            return
        }
    }

    const boat = mcl.jsonWGet('darkoak:boatcatcher:boat')?.boat
    if (boat && chatGamesToggles.catcher) {
        if (message.trim() == 'CATCH') {
            let bac = mcl.jsonPGet(player, 'darkoak:boatcatcher') || {}

            bac[boat] = (bac[boat] || 0) + 1
            mcl.jsonPSet(player, 'darkoak:boatcatcher', bac)

            world.sendMessage(`§a${player.name} Caught A(n) ${boat}!`)
            mcl.wRemove('darkoak:boatcatcher:boat')
            chatGamesToggles.catcher = false
            return
        }
    }

    const spammerGame = mcl.jsonWGet('darkoak:spammer:game')
    if (spammerGame?.enabled && message === 'SPAM' && chatGamesToggles.spammer) {
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
        /**@type {string[]} */
        const words = parts.word.split(',')
        for (let index = 0; index < words.length; index++) {
            const w = words[index];
            if (message.includes(w)) {
                system.runTimeout(() => {
                    player.sendMessage(`§aAuto-Response: §r§f${parts.response}`)
                }, 5)
            }
        }
    }

    const ocs = mcl.jsonWGet('darkoak:chat:other')

    // message logs
    if (ocs?.chatLogs) messageLog(player, message)

    messageModifiers(ocs, chat, player, mcl.jsonWGet('darkoak:anticheat'))

    if (message.toLowerCase().includes('boatbot')) {
        const botsMessage = message.toLowerCase().replaceAll('boatbot', '').replaceAll('.', '').replaceAll(',', '').replaceAll('?', '').replaceAll('\'', '')
        const response = boatbot(player, botsMessage)
        system.runTimeout(() => {
            world.sendMessage(`[§tBoatbot§r] -> ${response}`)
        }, 20)
    }

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

    const text = `${clan}${cr.start}${replacer(player, (ranks.ranks.join(cr.middle) || cr.defaultRank))}${cr.end}§r§f%REFER%${ranks.namecolors.join('')}${chat.name}§r§f${cr.bridge} §r§f${ranks.chatColors.join('')}${chat.message}`


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
                    world.sendMessage('*')
                }
                break
            case 'cclocal':
                let o = 0
                while (o++ < 100) {
                    sender.sendMessage('*')
                }
                break
            case 'random':
                world.sendMessage(mcl.randomNumber(100).toString())
                break
            case 'emojis':
                // let emojisList = []
                // for (let index = 0; index < emojis.length; index++) {
                //     const emoji = emojis[index]
                //     sender.sendMessage(`${emoji.m} -> ${emoji.e}`)

                // }
                sender.sendMessage(emojis.map(e => {
                    switch (e.m) {
                        case ':format:': return `${e.m} -> Formatting Code`
                        case '\\n': return `${e.m} -> Newline`
                        default: return `${e.m} -> ${e.e}`
                    }
                }).join('\n'))
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
            let word = words[mcl.xorRandomNum(0, words.length - 1, (time1 + time2))].trim()

            world.sendMessage(`§a[${loops}] Unscramble for a prize! Word:§r§f "${mcl.stringScrambler(word)}"`)

            mcl.jsonWSet('darkoak:chatgame1:word', {
                word: word
            })
            chatGamesToggles.scramble = true
        }
    }

    if (d?.catcherEnabled) {
        time2++

        if (time2 >= (d.catcherInterval * 60) * 20) {
            time2 = 0
            loops++

            const btc = boatTypes[mcl.randomNumber(boatTypes.length - 1)]

            world.sendMessage(`§a[${loops}] Boat-Catcher! Type 'CATCH' To Catch A(n) ${btc}!`)
            mcl.jsonWSet('darkoak:boatcatcher:boat', {
                boat: btc
            })
            chatGamesToggles.catcher = true
        }
    }

    if (d?.spammerEnabled && mcl.tickTimer((d?.spammerInterval * 60) * 20)) {
        world.sendMessage(`§aSpammer! Type 'SPAM' As Fast As You Can! You Only Have 10 Seconds!`)
        mcl.jsonWSet('darkoak:spammer:game', {
            enabled: true
        })
        chatGamesToggles.spammer = true
        system.runTimeout(() => {
            mcl.jsonWSet('darkoak:spammer:game', {
                enabled: false
            })
            chatGamesToggles.spammer = false

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
    let delay = 0
    if (d?.antinametags && mcl.tickTimer(40)) {
        system.runTimeout(() => {
            p.nameTag = ''
        })
        delay = 1
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

    let na = p.name
    const nick = mcl.jsonPGet(p, 'darkoak:nickname')
    if (nick && mcl.jsonWGet('darkoak:nicknamesettings')?.enabled) {
        na = nick?.nick
    }

    let lines = [na]
    if (ocs?.nonametags) lines = []

    if (ocs?.healthDisplay) lines.push(`§aHealth: ${Math.round(mcl.healthValue(p))}§r§f`)
    if (ocs?.nametag) lines.push(mcl.jsonPGet(p, 'darkoak:antispam').message)
    if (ocs?.nametag) lines.push(((messageMap.get(p.name)?.message) ?? ''))
    if (ocs?.nametagRanks) lines.push(`${cr.start}${replacer(p, ranks.join(cr.middle))}${cr.end}`)

    system.runTimeout(() => {
        try {
            p.nameTag = lines.join('\n')
        } catch {

        }
    }, delay)
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

    const args = p.message.match(/"[^"]*"|\S+/g)?.map(arg => arg.replace(/"/g, '')) || []

    function replaceArgs(command) {
        return command.replace(/\$(\d+)\$/g, (_, index) => args[parseInt(index)] || '')
    }

    if (p?.command) {
        try {
            let commandToRun = replaceArgs(p.command)
            player.runCommand(replacer(player, commandToRun))
        } catch (e) {
            mcl.debugLog('Chat Command', String(e))
        }
    }

    if (p?.command2) {
        try {
            let commandToRun2 = replaceArgs(p.command2)
            player.runCommand(replacer(player, commandToRun2))
        } catch (e) {
            mcl.debugLog('Chat Command', String(e))
        }
    }

    if (p?.command3) {
        try {
            let commandToRun3 = replaceArgs(p.command3)
            player.runCommand(replacer(player, commandToRun3))
        } catch (e) {
            mcl.debugLog('Chat Command', String(e))
        }
    }

    // const mess = p.message.split(' ', 2)

    // const playerSelect = mess[1] ? (mcl.getStringBetweenChars(mess[1], '"', '"') || mess[1]) : undefined

    // let commandToRun = p.command
    // if (playerSelect && commandToRun.includes('[player]')) {
    //     commandToRun = commandToRun.replaceAll('[player]', playerSelect)
    // }
    // player.runCommand(replacer(player, commandToRun))

    // let commandToRun2 = p.command2
    // if (playerSelect && commandToRun2.includes('[player]')) {
    //     commandToRun2 = commandToRun2.replaceAll('[player]', playerSelect)
    // }
    // player.runCommand(replacer(player, commandToRun2))

    // let commandToRun3 = p.command3
    // if (playerSelect && commandToRun3.includes('[player]')) {
    //     commandToRun3 = commandToRun3.replaceAll('[player]', playerSelect)
    // }
    // player.runCommand(replacer(player, commandToRun3))

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
        /**@type {{word: string, warning: string}[] | string[]} */
        let censor = mcl.jsonWGet('darkoak:censor')
        if (censor && censor.length != 0 && !mcl.isDOBAdmin(player)) {
            for (let index = 0; index < censor.length; index++) {
                let c = censor[index]
                if (mcl.deleteFormatting(message).toLowerCase().includes((c?.word || c)?.toLowerCase())) {
                    if (c?.warning) player.sendMessage(c?.warning)
                    return true
                }
            }
        }


        const d = mcl.jsonWGet('darkoak:anticheat')

        // anti spam
        if (d?.antispam && !mcl.isOp(player) && !mcl.isDOBAdmin(player)) {
            const trimmed = message.trim()
            if (mcl.deleteFormatting(messageMap.get(player.name)?.message ?? '') === trimmed) {
                player.sendMessage('§aYour Message Is The Same As Your Last Message')
                return true
            }
            if (
                trimmed.includes('horion.download') ||
                trimmed.includes('lumineproxy.org') ||
                trimmed.includes('packet.sell.app') ||
                trimmed.includes('LUMINE UTILITY PROXY')
            ) {
                log(player, `hack client message`)
                player.sendMessage('§aYour Message Included Common Messages Made By Hack Clients')
                return true
            }
            if (d?.antispam2) {
                const past = messageMap.get(player?.name)?.message
                if (past) {
                    const length = trimmed.length
                    let amount = 0
                    for (let index = 0; index < length; index++) {
                        const l = trimmed.charAt(index)
                        if (past.charAt(index).length > 0 && past.charAt(index) === l) {
                            amount++
                        }
                    }

                    const percent = (amount / length) * 100
                    if (percent >= (d?.antispam2sense ?? 50)) {
                        player.sendMessage('§cYour Message Matched Your Last Message Too Closely')
                        return true
                    }
                }
            }
        }

        if (d?.antichatflood && message.length > (d?.antichatfloodsense ?? 100) && !mcl.isDOBAdmin(player)) {
            player.sendMessage(`§cMessage Exceded Max Length: ${message.length}/${d?.antichatfloodsense ?? 100}`)
            return true
        }

        if (d?.antispam3 && !mcl.isDOBAdmin(player)) {
            const past = messageMap.get(player?.name)
            if (past) {
                const td = mcl.timeDifference(past.time)
                if (Math.abs(td.timeDiff) < 800) {
                    player.sendMessage('§aYour Message Was Sent Too Quickly, Try Sending It Again')
                    return true
                }
            }
        }

        if (d?.antispamactive) {
            if (player.isJumping || player.isSprinting) {
                log(player, `anti-spam-active`)
                player.sendMessage('§aYou Were Moving While The Message Was Sent, This Could Be Lag')
                return true
            }
        }

        // anti crasher 1
        if (d?.anticrasher1 && (message.includes(crasherSymbol) || message.includes(crasherSymbol2))) return true

        messageMap.set(player.name, {
            message: message.trim(),
            time: Date.now(),
        })
        return false
    } catch (e) {
        system.runTimeout(() => {
            mcl.adminMessage(`Chat Preventatives Failed For: ${player.name}`)
            mcl.debugLog('Chat Preventitives', String(e))
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
    if (mcl.jsonWGet('darkoak:community:general')?.emojisenabled) {
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
        const ranks = mcl.getChatModifiers(player)
        /**@type {string} */
        let nameToChange = chat.name

        const sliceLoc = Math.floor(nameToChange.length / 2)
        const top = nameToChange.slice(0, sliceLoc)
        const bottom = nameToChange.slice(sliceLoc)

        chat.name = top + (ranks?.namecolors?.join('') || '§r') + bottom
        // chat.name = chat.name
        //     .replace('A', 'Α')
        //     .replace('B', 'Β')
        //     .replace('D', String.fromCharCode(394))
        //     .replace('E', 'Ε')
        //     .replace('H', 'ʜ')
        //     .replace('H', 'Η')
        //     .replace('I', 'ɪ')
        //     .replace('Y', 'ʏ')
        //     .replace('K', 'Κ')
        //     .replace('M', 'Μ')
        //     .replace('N', 'Ν')

    }
}

/**
 * @param {Player} player 
 * @param {string} message 
 */
export function messageLog(player, message) {
    try {
        /**@type {{name: string, message: string, time: number}[]} */
        let logs2 = mcl.jsonWGet('darkoak:messagelogs:v2') || [{ name: 'Default', message: 'Default', time: Date.now() }]
        if (logs2.length > 0 && logs2[logs2.length - 1].name === player.name) {
            logs2[logs2.length - 1].message += `\n| ${message}`
        } else {
            logs2.push({
                name: player.name,
                message: message,
                time: Date.now()
            })
        }
        while (!mcl.jsonWSet('darkoak:messagelogs:v2', logs2)) {
            logs2.shift()
        }
    } catch {

    }
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

export function privateChat(player, message) {
    /**@type {{code: string}} */
    const pc = mcl.jsonPGet(player, 'darkoak:privatechat')

    if (chatPreventives(player, message)) return

    const players = world.getAllPlayers().filter(e => ((mcl.jsonPGet(e, 'darkoak:privatechat')?.code === pc.code) || (e.hasTag('darkoak:mod') || e.hasTag('darkoak:admin'))))

    for (let index = 0; index < players.length; index++) {
        const p = players[index]
        p.sendMessage(`§8[§7PVC-${pc.code}§8]§r ${player.name} -> ${message}`)
    }
}