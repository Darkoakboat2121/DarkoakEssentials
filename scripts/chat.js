import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./interfaces"
import { mcl } from "./logic"
import { chatRankDefaults } from "./defaults"

// This file handles all chat interactions such as:
// Custom commands, ranks, possibly more at a later date

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

    if (evd.sender.hasTag('darkoak:muted')) {
        evd.cancel = true
        return
    }

    for (const c of mcl.listGetValues('darkoak:censor:')) {
        if (evd.message.includes(c.toLowerCase())) {
            evd.cancel = true
            return
        }
    }

    chatRankDefaults()

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

    const text = `${start}${ranks.join(middle)}${end}§r§f${nameColors.join('')}${evd.sender.name}§r§f${bridge} §r§f${chatColors.join('')}${evd.message}`
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
        case 'random':
            world.sendMessage(mcl.randomNumber(100).toString())
            break
    }
}