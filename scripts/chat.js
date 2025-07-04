import { world, system, Player, ChatSendBeforeEvent, PlayerSpawnAfterEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./uis/interfaces"
import { mcl } from "./logic"
import { boatTypes, crasherSymbol, crasherSymbol2, emojis, professionalism, replacer, version } from "./data/arrays"
import { landclaimMainUI, queueMessageUI } from "./uis/interfacesTwo"
import { log } from "./world/anticheat"


// This file handles all chat interactions such as:
// Custom commands, ranks, censoring, antispam

/**
 * @param {ChatSendBeforeEvent} evd
 */
export function chatSystem(evd) {
    const chat = mcl.jsonWGet('darkoak:scriptsettings')
    if (chat.chatmaster === true) return

    evd.cancel = true
    const player = evd.sender
    const message = evd.message

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

    // mutes
    if (player.hasTag('darkoak:muted')) return

    // censoring
    let censor = mcl.listGetValues('darkoak:censor:')
    if (censor && censor.length != 0) {
        for (let index = 0; index < censor.length; index++) {
            if (mcl.deleteFormatting(message).toLowerCase().includes(censor[index].toLowerCase())) return
        }
    }

    // anti spam
    const d = mcl.jsonWGet('darkoak:anticheat')
    const h = mcl.jsonPGet(player, 'darkoak:antispam')

    if (d.antispam) {
        if (h.message == message.trim() && !mcl.isOp(player) && !player.hasTag('darkoak:admin')) return
        if (
            message.trim().includes('Horion - the best minecraft bedrock utility mod - horion.download') ||
            message.trim().includes('horion.download')
        ) {
            log(`${player.name} -> hack client message`)
            return
        }
    }

    mcl.jsonPSet(player, 'darkoak:antispam', {
        message: message.trim()
    })

    // anti crasher 1
    if (d.anticrasher1 && (message.includes(crasherSymbol) || message.includes(crasherSymbol2))) return

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
            const bac = mcl.jsonPGet(player, 'darkoak:boatcatcher')
            if (!bac) {
                mcl.jsonPSet(player, 'darkoak:boatcatcher', {
                    
                })
            }

            world.sendMessage(`§a${player.name} Caught A(n) ${boat}!`)
            mcl.wRemove('darkoak:boatcatcher:boat')
            return
        }
    }


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

    // message logs
    if (mcl.jsonWGet('darkoak:chat:other')) {
        /**@type {Array<string>} */
        let logs2 = mcl.jsonWGet('darkoak:messagelogs').log || []
        if (logs2.length > 250) {
            while (logs2.length > 250) {
                logs2.shift()
            }
        }
        logs2.push(`${player.name} -> ${message}`)
        mcl.jsonWSet('darkoak:messagelogs', {
            log: logs2
        })
    }

    let formattedMessage = message
    for (let index = 0; index < emojis.length; index++) {
        const e = emojis[index]
        formattedMessage = formattedMessage.replaceAll(e.m, e.e)
    }

    const ocs = mcl.jsonWGet('darkoak:chat:other')

    if (ocs.professional) {
        formattedMessage = ' ' + formattedMessage + ' '
        for (let index = 0; index < professionalism.length; index++) {
            const pro = professionalism[index]
            formattedMessage = formattedMessage.replaceAll((' ' + pro.m + ' '), (' ' + pro.e + ' '))
        }
        formattedMessage = formattedMessage.trimStart()
        formattedMessage = mcl.uppercaseFirstLetter(formattedMessage)
    }


    /**@type {Array<string>} */
    const tags = player.getTags()
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))
    let nameColors = tags.filter(tag => tag.startsWith('namecolor:')).map(tag => tag.replace('namecolor:', ''))
    let chatColors = tags.filter(tag => tag.startsWith('chatcolor:')).map(tag => tag.replace('chatcolor:', ''))

    let cr = mcl.jsonWGet('darkoak:chatranks')

    let clanS = cr.cStart || '['
    let clanE = cr.cEnd || ']'
    let clan = tags.find(tag => tag.startsWith('clan:'))?.replace('clan:', '') || ''
    if (clan.length == 0) {
        clanS = ''
        clanE = ''
    }

    ranks = ranks.length ? ranks : [cr.defaultRank]
    nameColors = nameColors.length ? nameColors : [``]
    chatColors = chatColors.length ? chatColors : [``]

    const text = `${clanS}${clan}${clanE}${cr.start}${replacer(player, ranks.join(cr.middle))}${cr.end}§r§f${nameColors.join('')}${player.name}§r§f${cr.bridge} §r§f${chatColors.join('')}${formattedMessage}`

    if (ocs.proximity) {
        system.runTimeout(() => {
            player.runCommand(`tellraw @a [r=15] {"rawtext": [{"text":"${text}"}]}`)
        }, 1)
    } else {
        world.sendMessage({ rawtext: [{ text: text }] })
    }
}

/**
 * @param {string} hashtagKey 
 * @param {Player} sender 
 */
function hashtag(hashtagKey, sender) {
    try {
        switch (hashtagKey.replaceAll('#', '')) {
            case 'commands':
                sender.sendMessage('----------------------------------')
                for (const c of mcl.listGetValues('darkoak:command:')) {
                    const p = JSON.parse(c)
                    sender.sendMessage(`${p.message} | ${p.tag || 'No Tag'} -> ${p.command}`)
                }
                sender.sendMessage('----------------------------------')
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
            case 'landclaim add':
                const loc = sender.location
                let places = mcl.listGetValues('darkoak:landclaim:')

                const newClaim = {
                    p1: { x: loc.x + 16, z: loc.z + 16 },
                    p2: { x: loc.x - 16, z: loc.z - 16 }
                }

                for (let index = 0; index < places.length; index++) {
                    const place = JSON.parse(places[index])

                    if (place.p1 && place.p2 && landclaimCheck(newClaim, place)) {
                        sender.sendMessage('§cLand Has Already Been Claimed!§r')
                        return
                    }
                }
                mcl.jsonWSet(`darkoak:landclaim:${sender.name}`, {
                    ...newClaim,
                    owner: sender.name,
                    players: [""]
                })
                sender.sendMessage('§aLand Claimed!§r')
                break
            case 'landclaim remove':
                if (!mcl.wRemove(`darkoak:landclaim:${sender.name}`)) {
                    sender.sendMessage('§cYou Don\'t Own A Landclaim!§r')
                } else {
                    sender.sendMessage('§cYou No Longer Own A Landclaim!§r')
                }
                break
            case 'landclaim players':
                sender.sendMessage('Close Chat!')
                system.runTimeout(() => {
                    landclaimMainUI(sender)
                }, 20)
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
        mcl.adminMessage(`A Custom Command That Uses A Hashtag-Key Is Having An Error: ${hashtagKey} from ${sender.name}`)
        console.log(`DEBUG CHATCOMMANDS: ${String(e)}`)
    }
}

let loops = 0
let time1 = 0
let time2 = 205
/**Chat games handler */
export function chatGames() {
    const chat = mcl.jsonWGet('darkoak:scriptsettings')
    if (chat.chatmaster === true) return

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
}

/**Interval event for nametags
 * @param {Player} p 
 * @param {object} ocs 
 */
export function nametag(p, ocs) {
    if (ocs.nametag && !ocs.healthDisplay) {
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n${mcl.jsonPGet(p, 'darkoak:antispam').message}`
        })
    }
    if (ocs.healthDisplay && !ocs.nametag) {
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n§aHealth: ${mcl.healthValue(p)}§r§f`
        })
    }
    if (ocs.healthDisplay && ocs.nametag) {
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n§aHealth: ${mcl.healthValue(p)}§r§f\n${mcl.jsonPGet(p, 'darkoak:antispam').message}`
        })
    }
    if (!ocs.healthDisplay && !ocs.nametag) {
        system.runTimeout(() => {
            p.nameTag = p.name
        })
    }
}

function landclaimCheck(a, b) {
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

    let players = mcl.getPlayerList() || []
    if (!players.includes(player.name)) {
        players.push(player.name)
        mcl.jsonWSet('darkoak:playerlist', players)
    }
    
    let admins = mcl.getAdminList() || []
    if (mcl.isDOBAdmin(player) && !admins.includes(player.name)) {
        admins.push(player.name)
        mcl.jsonWSet('darkoak:adminlist', admins)
    } else if (!mcl.isDOBAdmin(player) && admins.includes(player.name)) {
        admins = admins.filter(e => e !== player.name)
        mcl.jsonWSet('darkoak:adminlist', admins)
    }

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
