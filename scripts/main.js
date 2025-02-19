import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as interfaces from "./interfaces"
import * as chat from "./chat"
import * as defaults from "./defaults"
import * as arrays from "./arrays"
import { mcl } from "./logic"
import * as anticheat from "./anticheat"
import * as worldSettings from "./worldSettings"

// main ui opener, see interfaces, also manages bindable/dummy items
world.afterEvents.itemUse.subscribe((evd) => {
    const player = evd.source
    if (evd.itemStack.typeId === 'darkoak:main') {
        if (player.hasTag('darkoak:admin')) {
            interfaces.mainUI(player)
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
        }
    }

    if (evd.itemStack.typeId === 'darkoak:community') {
        if (player.isSneaking) {
            const playerToView = evd.source.getEntitiesFromViewDirection({type: 'minecraft:player', maxDistance: 3})[0]
            if (playerToView === undefined) {
                interfaces.communityMain(player)
                return
            }
            interfaces.viewProfile(player, playerToView.entity)
        } else {
            interfaces.communityMain(player)
        }
    }

    if (!evd.itemStack.typeId.startsWith('darkoak:dummy')) return
    for (let index = 0; index <= arrays.dummySize; index++) {
        if (evd.itemStack.typeId === `darkoak:dummy${index}`) {
            evd.source.runCommandAsync(mcl.wGet(`darkoak:bind:${index}`))
        }
    }
})

// preban, wip ban system
world.afterEvents.playerSpawn.subscribe((evd) => {
    const p = world.getAllPlayers()[0]
    for (const n of arrays.preBannedList) {
        p.runCommandAsync(`kick "${n}"`)
    }

    for (const n of mcl.listGetValues('darkoak:bans:')) {
        p.runCommandAsync(`kick "${n}"`)
    }
})

// chest lock system, wip
world.beforeEvents.playerInteractWithBlock.subscribe((evd) => {
    if (evd.player.hasTag('darkoak:admin') && evd.itemStack != undefined && evd.itemStack.typeId === 'darkoak:chest_lock' && evd.block.matches('minecraft:chest')) {
        system.runTimeout(() => {
            interfaces.chestLockUI(evd.player, evd.block.location)
        }, 1)
        evd.cancel = true
    } else if (evd.block.matches('minecraft:chest')) {
        for (const chest of mcl.listGetValues('darkoak:chestlock:')) {
            const parts = chest.split('|')
            const loc = evd.block.location
            if (loc.x.toString() === parts[1] && loc.y.toString() === parts[2] && loc.z.toString() === parts[3] && evd.player.name != parts[0]) {
                evd.cancel = true
                break
            }
        }
    }
})

// system for handling message cui (see interfaces) based on the tag
system.runInterval(() => {
    for (const ui of mcl.listGetValues('darkoak:ui:message:')) {
        const parts = ui.split('|')
        for (const player of world.getPlayers()) {
            // index: 0 = title, 1 = body, 2 = button1, 3 = button2, 4 = tag, 5 = button1 command, 6 = button2 command
            if (player.hasTag(parts[4])) {
                messageUIBuilder(player, parts[0], parts[1], parts[2], parts[3], parts[5], parts[6])
                player.removeTag(parts[4])
            }
        }
    }
}, 20)

// system for displaying message cui
function messageUIBuilder(playerToShow, title, body, button1, button2, command1, command2) {
    let f = new MessageFormData()
    f.title(title)
    f.body(body)
    f.button1(button1)
    f.button2(button2)

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        if (evd.selection === 0 && command1 != '') {
            playerToShow.runCommandAsync(command1)
        } else if (evd.selection === 1 && command2 != '') {
            playerToShow.runCommandAsync(command2)
        }
    })
}



// System for displaying the actionbar
if (mcl.wGet('darkoak:actionbar') != '' && mcl.wGet('darkoak:actionbar') != undefined) {
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            var text = mcl.wGet('darkoak:actionbar')
            const replacements = arrays.actionbarReplacements(player)
            for (const hashtag in replacements) {
                if (text.includes(hashtag)) {
                    text = text.replaceAll(hashtag, replacements[hashtag])
                }
            }
            player.runCommandAsync(`titleraw @s actionbar {"rawtext":[{"text":"${text}"}]}`)
        }
    })
}