import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as i from "./interfaces"
import { wGet, wSet, listGet, listGetValues, randomString } from "./logic"
import { chatRankDefaults } from "./defaults"

// This file handles all chat interactions such as:
// Custom commands, ranks, possibly more at a later date

world.beforeEvents.chatSend.subscribe((evd) => {

    for (const c of listGet('darkoak:command:')) {
        const parts = wGet(c).split('|')
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

    chatRankDefaults()

    const tags = evd.sender.getTags()
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))
    const start = world.getDynamicProperty('darkoak:cr:start')
    const middle = world.getDynamicProperty('darkoak:cr:middle')
    const end = world.getDynamicProperty('darkoak:cr:end')
    const bridge = world.getDynamicProperty('darkoak:cr:bridge')
    const defaultrank = world.getDynamicProperty('darkoak:cr:defaultrank')

    ranks = ranks.length ? ranks : [`${defaultrank}`]

    const text = `${start}${ranks.join(middle)}${end}§r§f${evd.sender.name}${bridge} §r§f${evd.message}`
    world.sendMessage({rawtext: [{text: text}]})
    evd.cancel = true
})

function hashtag(hashtagKey, sender) {
    switch(hashtagKey.replaceAll('#', '')) {
        case 'commands':
            for (const c of listGetValues('darkoak:command:').sort()) {
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
        case 'realm':
            world.sendMessage(randomString(11))
            break
    }
}