import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./uis/interfaces"
import { mcl } from "./logic"
import { emojis } from "./data/arrays"


// This file handles all chat interactions such as:
// Custom commands, ranks, censoring

world.beforeEvents.chatSend.subscribe((evd) => {

    for (const c of mcl.listGet('darkoak:command:')) {
        const parts = mcl.wGet(c).split('|')
        if (evd.message === parts[0]) {
            if (parts[2] === '' | evd.sender.hasTag(parts[2])) {
                if (parts[1].startsWith('#')) {
                    hashtag(parts[1], evd.sender)
                    evd.cancel = true
                    return
                } else {
                    evd.sender.runCommandAsync(parts[1])
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
    if (h.message === evd.message && !mcl.isOp(evd.sender) && d.antispam && !evd.sender.hasTag('darkoak:admin')) {
        evd.cancel = true
        return
    }
    mcl.pSet(evd.sender, 'darkoak:antispam', JSON.stringify({
        message: evd.message
    }))

    let formattedMessage = evd.message
    for (const replacement of emojis) {
        formattedMessage = formattedMessage.replaceAll(replacement.m, replacement.e)
    }

    /**@type {Array<string>} */
    const tags = evd.sender.getTags()
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))
    let nameColors = tags.filter(tag => tag.startsWith('namecolor:')).map(tag => tag.replace('namecolor:', ''))
    let chatColors = tags.filter(tag => tag.startsWith('chatcolor:')).map(tag => tag.replace('chatcolor:', ''))
    const start = mcl.wGet('darkoak:cr:start')
    const middle = mcl.wGet('darkoak:cr:middle')
    const end = mcl.wGet('darkoak:cr:end')
    const bridge = mcl.wGet('darkoak:cr:bridge')
    const defaultrank = mcl.wGet('darkoak:cr:defaultrank')

    ranks = ranks.length ? ranks : [`${defaultrank}`]
    nameColors = nameColors.length ? nameColors : [``]
    chatColors = chatColors.length ? chatColors : [``]

    const text = `${start}${ranks.join(middle)}${end}§r§f${nameColors.join('')}${evd.sender.name}§r§f${bridge} §r§f${chatColors.join('')}${formattedMessage}`
    world.sendMessage({rawtext: [{text: text}]})
    evd.cancel = true
})

function hashtag(hashtagKey, sender) {
    switch(hashtagKey.replaceAll('#', '')) {
        case 'commands':
            for (const c of mcl.listGetValues('darkoak:command:').sort()) {
                sender.sendMessage(c.replaceAll('|', ' | '))
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
            var i = 0
            while(i++<100) {
                world.sendMessage(' \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n ')
            }
            break
        case 'random':
            world.sendMessage(mcl.randomNumber(100).toString())
            break
    }
}