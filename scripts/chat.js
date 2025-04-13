import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./uis/interfaces"
import { mcl } from "./logic"
import { emojis, replacer } from "./data/arrays"
import { landclaimMainUI } from "./uis/interfacesTwo"


// This file handles all chat interactions such as:
// Custom commands, ranks, censoring, antispam

world.beforeEvents.chatSend.subscribe((evd) => {

    let commands = mcl.listGetValues('darkoak:command:')
    for (let index = 0; index < commands.length; index++) {
        const p = JSON.parse(commands[index])
        if (evd.message.trimEnd() === p.message.trimEnd()) {
            if (!p.tag || evd.sender.hasTag(p.tag)) {
                if (p.command.startsWith('#')) {
                    hashtag(p.command, evd.sender)
                    evd.cancel = true
                    return
                } else {
                    system.runTimeout(() => {
                        try {
                            if (p.command) evd.sender.runCommand(replacer(evd.sender, p.command))
                            if (p.command2) evd.sender.runCommand(replacer(evd.sender, p.command2))
                            if (p.command3) evd.sender.runCommand(replacer(evd.sender, p.command3))
                        } catch {
                            mcl.adminMessage(`${p.message} Command Has An Error§r`)
                        }
                    })
                    evd.cancel = true
                    return
                }
            }
        }
    }

    // mutes
    if (evd.sender.hasTag('darkoak:muted')) {
        evd.cancel = true
        return
    }

    // censoring
    let censor = mcl.listGetValues('darkoak:censor:')
    for (let index = 0; index < censor.length; index++) {
        /**@type {string} */
        let message = evd.message
        let newMessage = ''

        for (let index = 0; index < message.length; index++) {
            if (message.charAt(index - 1) == '§' && index > 0) {
                // skip the current character
                continue
            }
            newMessage += message.charAt(index)
        }

        newMessage = newMessage.replaceAll('1', 'i').replaceAll('0', 'o').replaceAll('4', 'a').replaceAll('6', 'k').replaceAll('8', 'b').replaceAll('9', 'q')

        if (newMessage.toLowerCase().replaceAll('§', '').includes(censor[index].toLowerCase())) {
            evd.cancel = true
            return
        }
    }

    // anti spam
    const d = mcl.jsonWGet('darkoak:anticheat')
    const h = JSON.parse(mcl.pGet(evd.sender, 'darkoak:antispam'))
    if (h.message === evd.message.trim() && !mcl.isOp(evd.sender) && d.antispam && !evd.sender.hasTag('darkoak:admin')) {
        evd.cancel = true
        return
    }
    mcl.pSet(evd.sender, 'darkoak:antispam', JSON.stringify({
        message: evd.message.trim()
    }))

    // message logs
    if (mcl.jsonWGet('darkoak:chat:other')) {
        /**@type {Array<string>} */
        let logs2 = mcl.jsonWGet('darkoak:messagelogs').log || []
        if (logs2.length > 100) {
            while (logs2.length > 100) {
                logs2.shift()
            }
        }
        logs2.push(`${evd.sender.name} -> ${evd.message}`)
        mcl.jsonWSet('darkoak:messagelogs', {
            log: logs2
        })
    }

    let formattedMessage = evd.message
    for (const replacement of emojis) {
        formattedMessage = formattedMessage.replaceAll(replacement.m, replacement.e)
    }

    const p = evd.sender
    const ocs = mcl.jsonWGet('darkoak:chat:other')
    if (ocs.nametag && !ocs.healthDisplay) {
        /**@type {Player} */
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n${formattedMessage}`
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
            p.nameTag = `${p.name}\n§aHealth: ${mcl.healthValue(p)}§r§f\n${formattedMessage}`
        })
    }
    if (!ocs.healthDisplay && !ocs.nametag) {
        /**@type {Player} */
        system.runTimeout(() => {
            p.nameTag = p.name
        })
    }

    /**@type {Array<string>} */
    const tags = evd.sender.getTags()
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))
    let nameColors = tags.filter(tag => tag.startsWith('namecolor:')).map(tag => tag.replace('namecolor:', ''))
    let chatColors = tags.filter(tag => tag.startsWith('chatcolor:')).map(tag => tag.replace('chatcolor:', ''))
    let cr = mcl.jsonWGet('darkoak:chatranks')

    ranks = ranks.length ? ranks : [cr.defaultRank]
    nameColors = nameColors.length ? nameColors : [``]
    chatColors = chatColors.length ? chatColors : [``]

    const text = `${cr.start}${replacer(evd.sender, ranks.join(cr.middle))}${cr.end}§r§f${nameColors.join('')}${evd.sender.name}§r§f${cr.bridge} §r§f${chatColors.join('')}${formattedMessage}`

    if (ocs.proximity) {
        system.runTimeout(() => {
            evd.sender.runCommand(`tellraw @a [r=15] {"rawtext": [{"text":"${text}"}]}`)
        }, 1)
    } else {
        world.sendMessage({ rawtext: [{ text: text }] })
    }
    evd.cancel = true
})

/**
 * @param {string} hashtagKey 
 * @param {Player} sender 
 */
function hashtag(hashtagKey, sender) {
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
    }
}