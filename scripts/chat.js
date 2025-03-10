import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./uis/interfaces"
import { mcl } from "./logic"
import { emojis } from "./data/arrays"


// This file handles all chat interactions such as:
// Custom commands, ranks, censoring

world.beforeEvents.chatSend.subscribe((evd) => {

    for (const c of mcl.listGetValues('darkoak:command:')) {
        const p = JSON.parse(c)
        if (evd.message === p.message) {
            if (!p.tag | evd.sender.hasTag(p.tag)) {
                if (p.command.startsWith('#')) {
                    hashtag(p.command, evd.sender)
                    evd.cancel = true
                    return
                } else {
                    evd.sender.runCommandAsync(p.command)
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
    for (const c of mcl.listGetValues('darkoak:censor:')) {
        /**@type {string} */
        let message = evd.message
        let newMessage = ''

        for (let index = 0; index < message.length; index++) {
            if (message.charAt(index - 1) == '§' && index > 0) {
                // Skip the current character
                continue
            }
            newMessage += message.charAt(index)
        }

        newMessage = newMessage.replaceAll('1', 'i').replaceAll('0', 'o').replaceAll('4', 'a').replaceAll('8', 'b')

        if (newMessage.toLowerCase().replaceAll('§', '').includes(c.toLowerCase())) {
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

    let formattedMessage = evd.message
    for (const replacement of emojis) {
        formattedMessage = formattedMessage.replaceAll(replacement.m, replacement.e)
    }

    const ocs = mcl.jsonWGet('darkoak:chat:other')
    if (ocs.nametag) {
        /**@type {Player} */
        const p = evd.sender
        system.runTimeout(() => {
            p.nameTag = `${p.name}\n${evd.message}`
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

    const text = `${cr.start}${ranks.join(cr.middle)}${cr.end}§r§f${nameColors.join('')}${evd.sender.name}§r§f${cr.bridge} §r§f${chatColors.join('')}${formattedMessage}`
    world.sendMessage({ rawtext: [{ text: text }] })
    evd.cancel = true
})

/**
 * @param {string} hashtagKey 
 * @param {Player} sender 
 */
function hashtag(hashtagKey, sender) {
    switch (hashtagKey.replaceAll('#', '')) {
        case 'commands':
            for (const c of mcl.listGetValues('darkoak:command:')) {
                const p = JSON.parse(c)
                sender.sendMessage(`${p.message} | ${p.tag} -> ${p.command}`)
            }
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
    }
}