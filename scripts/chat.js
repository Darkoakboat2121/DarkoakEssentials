import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./uis/interfaces"
import { mcl } from "./logic"
import { emojis, replacer, version } from "./data/arrays"
import { landclaimMainUI } from "./uis/interfacesTwo"
import { log } from "./world/anticheat"


// This file handles all chat interactions such as:
// Custom commands, ranks, censoring, antispam

world.beforeEvents.chatSend.subscribe((evd) => {

    const chat = mcl.jsonWGet('darkoak:scriptsettings')
    if (chat.chatmaster === true) return

    evd.cancel = true
    const player = evd.sender
    const message = evd.message

    let commands = mcl.listGetValues('darkoak:command:')
    for (let index = 0; index < commands.length; index++) {
        const p = JSON.parse(commands[index])
        if (message.trimEnd() != p.message.trimEnd()) continue
        if (!p.tag || player.hasTag(p.tag)) {
            if (p.command.startsWith('#')) {
                hashtag(p.command, player)
                return
            } else {
                system.runTimeout(() => {
                    try {
                        if (p.command) player.runCommand(replacer(player, p.command))
                        if (p.command2) player.runCommand(replacer(player, p.command2))
                        if (p.command3) player.runCommand(replacer(player, p.command3))
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
        if (logs2.length > 100) {
            while (logs2.length > 100) {
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
        let e = emojis[index]
        formattedMessage = formattedMessage.replaceAll(e.m, e.e)
    }

    const p = player
    const ocs = mcl.jsonWGet('darkoak:chat:other')
    nametag(p, ocs)

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

})

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
                sender.applyDamage(0)
                system.runInterval(() => {
                    i.dataDeleterUI(sender)
                }, 20)
                break
            case 'cc':
                let i = 0
                while (i++ < 100) {
                    world.sendMessage(' \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n ')
                }
                break
            case 'cclocal':
                let o = 0
                while (o++ < 100) {
                    sender.sendMessage(' \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n ')
                }
                break
            case 'random':
                world.sendMessage(mcl.randomNumber(100).toString())
                break
            case 'emojis':
                for (const emoji of emojis) {
                    sender.sendMessage(`${emoji.m} -> ${emoji.e}`)
                }
                break
            case 'landclaim add':
                const loc = sender.location
                let places = mcl.listGetValues('darkoak:landclaim:')
                for (let index = 0; index < places.length; index++) {
                    // WORK ON THIS PLEASE------------------------------------------------
                    let place = places[index]
                    if (place.p1.x === loc.x) {
                        sender.sendMessage('§cLand Has Already Been Claimed!§r')
                        return
                    }
                }
                mcl.jsonWSet(`darkoak:landclaim:${sender.name}`, {
                    p1: { x: sender.location.x + 16, z: sender.location.z + 16 },
                    p2: { x: sender.location.x - 16, z: sender.location.z - 16 },
                    owner: sender.name,
                    players: [""]
                })
                break
            case 'landclaim remove':
                mcl.wRemove(`darkoak:landclaim:${sender.name}`)
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
        }
    } catch {
        mcl.adminMessage(`A Custom Command That Uses A Hashtag-Key Is Having An Error: ${hashtagKey} from ${sender}`)
    }
}

let loops = 0
let time1 = 0

system.runInterval(() => {

    const chat = mcl.jsonWGet('darkoak:scriptsettings')
    if (chat.chatmaster === true) return

    /**@type {{unscrambleEnabled: boolean, unscrambleWords: string, unscrambleInterval: number, unscrambleCommand: string}} */
    const d = mcl.jsonWGet('darkoak:chatgames')
    if (!d) return
    if (d.unscrambleEnabled) {
        time1++

        if (time1 >= d.unscrambleInterval * 60) {
            time1 = 0
            loops++

            let words = d.unscrambleWords.split(',')
            let word = words[mcl.randomNumber(words.length - 1)].trim()

            world.sendMessage(`§a[${loops}] Unscramble for a prize! Word:§r§f ${mcl.stringScrambler(word)}`)

            mcl.wSet('darkoak:chatgame1:word', word)
        }
    }
}, 20)

function nametag(p, ocs) {
    if (ocs.nametag && !ocs.healthDisplay) {
        /**@type {Player} */
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n${mcl.jsonPGet(player, 'darkoak:antispam').message}`
        })
    }
    if (ocs.healthDisplay && !ocs.nametag) {
        /**@type {Player} */
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n§aHealth: ${mcl.healthValue(p)}§r§f`
        })
    }
    if (ocs.healthDisplay && ocs.nametag) {
        /**@type {Player} */
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n§aHealth: ${mcl.healthValue(p)}§r§f\n${mcl.jsonPGet(player, 'darkoak:antispam').message}`
        })
    }
    if (!ocs.healthDisplay && !ocs.nametag) {
        /**@type {Player} */
        system.runTimeout(() => {
            p.nameTag = p.name
        })
    }
}
