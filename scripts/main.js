// first is minecraft resources
import { world, system, Player, GameMode, ItemStack } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"

// second is setting defaults
import * as defaults from "./data/defaults"
import * as arrays from "./data/arrays"

// third initializing mcl module
import { mcl } from "./logic"

// fourth initialize the interfaces
import * as interfaces from "./uis/interfaces"
import * as interfacesTwo from "./uis/interfacesTwo"

// fifth initialize chat
import * as chat from "./chat"

// sixth initialize world based things
import * as anticheat from "./world/anticheat"
import * as worldSettings from "./world/worldSettings"
import * as worldProtection from "./world/worldProtection"
import * as landclaims from "./world/landclaims"

// seventh set up external uis / commands
import * as external from "./external/external"

// main ui opener, see interfaces, also manages bindable/dummy items
world.afterEvents.itemUse.subscribe((evd) => {
    const player = evd.source
    if (evd.itemStack.typeId === 'darkoak:main') {
        if (player.hasTag('darkoak:admin')) {
            interfaces.mainUI(player)
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }

    if (evd.itemStack.typeId === 'darkoak:community') {
        if (player.isSneaking) {
            const playerToView = evd.source.getEntitiesFromViewDirection({ type: 'minecraft:player', maxDistance: 3 })[0]
            if (playerToView === undefined) {
                interfaces.communityMain(player)
                return
            }
            interfaces.viewProfile(player, playerToView.entity)
            return
        } else {
            interfaces.communityMain(player)
            return
        }
    }

    if (evd.itemStack.typeId === 'darkoak:generators' && player.hasTag('darkoak:admin')) {
        interfacesTwo.genMainUI(player)
        return
    }

    if (evd.itemStack.typeId === 'darkoak:anticheat') {
        interfacesTwo.anticheatMain(player)
        return
    }

    if (evd.itemStack.typeId === 'darkoak:world_protection') {
        if (player.hasTag('darkoak:admin')) {
            interfacesTwo.protectedAreasMain(player)
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }

    if (evd.itemStack.typeId === 'darkoak:hop_feather' && (player.isOnGround || player.isClimbing)) {
        const direction = player.getViewDirection()
        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, 1)
        return
    }

    if (evd.itemStack.typeId === 'darkoak:dash_feather' && (player.isOnGround || player.isClimbing)) {
        const direction = player.getViewDirection()
        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, direction.y * 1.5)
        return
    }


    if (evd.itemStack.typeId.startsWith('darkoak:dummy')) {
        for (let index = 0; index <= arrays.dummySize; index++) {
            if (evd.itemStack.typeId === `darkoak:dummy${index}`) {
                const c = mcl.jsonWGet(`darkoak:bind:${index}`)
                if (!c) return
                if (c.command1) evd.source.runCommand(arrays.replacer(player, c.command1))
                if (c.command2) evd.source.runCommand(arrays.replacer(player, c.command2))
                if (c.command3) evd.source.runCommand(arrays.replacer(player, c.command3))
                return
            }
        }
    }
})


// preban, ban system, on spawn community giver
world.afterEvents.playerSpawn.subscribe((evd) => {
    const p = world.getAllPlayers()[0]
    const d = mcl.jsonWGet('darkoak:anticheat')
    const s = mcl.jsonWGet('darkoak:community:general')

    if (d.prebans) {
        let prebans = arrays.preBannedList
        for (let index = 0; index < prebans.length; index++) {
            p.runCommand(`kick "${prebans[index]}"`)
        }
    }

    let bans = mcl.listGetValues('darkoak:bans:')
    for (let index = 0; index < bans.length; index++) {
        const data = JSON.parse(bans[index])
        p.runCommand(`kick "${data.player}" ${data.message}`)
    }

    if (evd.player.runCommand('testfor @s [hasitem={item=darkoak:community}]').successCount === 0 && s.giveOnJoin) {
        evd.player.runCommand('give @s darkoak:community')
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
        let locks = mcl.listGetValues('darkoak:chestlock:')
        for (let index = 0; index < locks.length; index++) {
            const parts = locks[index].split('|')
            const loc = evd.block.location
            if (loc.x.toString() === parts[1] && loc.y.toString() === parts[2] && loc.z.toString() === parts[3] && evd.player.name != parts[0]) {
                evd.cancel = true
                break
            }
        }
    }
    //else if (evd.itemStack != undefined && evd.itemStack.typeId === 'darkoak:data_editor' && evd.player.hasTag('darkoak:admin')) {
    //     let ticker = false
    //     system.runTimeout(() => {
    //         if (!ticker) {
    //             interfacesTwo.dataEditorBlockUI(evd.player, evd.block)
    //         }
    //         ticker = true
    //         system.runTimeout(() => {
    //             ticker = false
    //         }, 20)
    //     }, 1)
    //     evd.cancel = true
    // }

})


world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
    if (evd.itemStack && evd.itemStack.typeId === 'darkoak:data_editor' && evd.player.hasTag('darkoak:admin')) {
        evd.cancel = true
        system.runTimeout(() => {
            interfacesTwo.dataEditorEntityUI(evd.player, evd.target)
        }, 0)
    }
})

// system for handling message cui (custom ui) based on the tag
system.runInterval(() => {
    let uis = mcl.listGetValues('darkoak:ui:message:')
    for (let index = 0; index < uis.length; index++) {
        /** @type {{ title: string, body: string, button1: string, button2: string, tag: string, command1: string, command2: string }} */
        const parts = JSON.parse(uis[index])
        for (const player of world.getPlayers({ tags: [parts.tag] })) {
            // index: 0 = title, 1 = body, 2 = button1, 3 = button2, 4 = tag, 5 = button1 command, 6 = button2 command
            messageUIBuilder(player, parts.title, parts.body, parts.button1, parts.button2, parts.command1, parts.command2)
            player.removeTag(parts.tag)
        }
    }

    let uis2 = mcl.listGetValues('darkoak:ui:action:')
    for (let index = 0; index < uis2.length; index++) {
        const parts = JSON.parse(uis2[index])
        for (const player of world.getPlayers({ tags: [parts.tag] })) {
            actionUIBuilder(player, parts.title, parts.body, parts.buttons)
            player.removeTag(parts.tag)
        }
    }
}, 20)

system.runInterval(() => {
    let blocks = mcl.listGetValues('darkoak:gen:')
    for (let index = 0; index < blocks.length; index++) {
        const b = JSON.parse(blocks[index])
        const parts = b.coords.split(' ')
        world.getDimension('overworld').runCommand(`setblock ${parts[0]} ${parts[1]} ${parts[2]} ${b.block}`)
    }
})


system.afterEvents.scriptEventReceive.subscribe((evd) => {
    const player = evd.sourceEntity
    if (evd.id === 'darkoak:enchant') {
        if (!evd.sourceEntity) return
        interfacesTwo.customEnchantsMain(evd.sourceEntity)
        return
    }
    // if (evd.id === 'darkoak:bind') {
    //     if (!evd.sourceEntity) return
    //     interfacesTwo.itemBindingUI(evd.sourceEntity)
    //     return
    // }
    if (evd.id === 'darkoak:spawn') {
        const b = evd.sourceBlock
        if (!b) {
            mcl.adminMessage(`The darkoak:spawn Scriptevent Needs To Execute From A Block`)
            return
        }
        try {
            const parts = evd.message.split(' ')
            const item = new ItemStack(`minecraft:${parts[0]}`, parseInt(parts[1]) || 1)
            world.getDimension(b.dimension.id).spawnItem(item, {
                x: parseInt(parts[2]) || b.location.x,
                y: parseInt(parts[3]) || b.location.y,
                z: parseInt(parts[4]) || b.location.z
            })
            return
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:spawn From Block ${b.location.x} ${b.location.y} ${b.location.z} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:command') {
        if (!evd.sourceEntity) {
            mcl.adminMessage(`The darkoak:command Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            player.runCommand(arrays.replacer(player, evd.message))
            return
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:command From Entity ${player.nameTag} At ${player.location.x.toFixed(0)} ${player.location.y.toFixed(0)} ${player.location.z.toFixed(0)} Has An Error`)
            return
        }
    }
})


function actionUIBuilder(playerToShow, title, body, buttons) {
    let f = new ActionFormData()

    f.title(arrays.replacer(playerToShow, title))
    f.body(arrays.replacer(playerToShow, body))

    for (const button of buttons) {
        f.button(arrays.replacer(playerToShow, button.title))
    }

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        const selected = buttons[evd.selection]
        if (selected.command) {
            try {
                if (selected.command) playerToShow.runCommand(arrays.replacer(playerToShow, selected.command))
            } catch {
                mcl.adminMessage(`Custom UI ${title} At ${selected.command} Has An Error`)
            }
        }
    })
}

// system for displaying message cui
function messageUIBuilder(playerToShow, title, body, button1, button2, command1, command2) {
    let f = new MessageFormData()
    f.title(arrays.replacer(playerToShow, title))
    f.body(arrays.replacer(playerToShow, body))
    f.button1(arrays.replacer(playerToShow, button1))
    f.button2(arrays.replacer(playerToShow, button2))

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        if (evd.selection == 0 && command1) {
            playerToShow.runCommand(arrays.replacer(playerToShow, command1))
        } else if (evd.selection == 1 && command2) {
            playerToShow.runCommand(arrays.replacer(playerToShow, command2))
        }
    })
}


// System for displaying the actionbar
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (mcl.wGet('darkoak:actionbar')) {
            /**@type {string} */
            let text = mcl.wGet('darkoak:actionbar')
            player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"${arrays.replacer(player, text)}"}]}`)
        }
        if (mcl.wGet('darkoak:sidebar')) {
            /**@type {{lines: ["a", "b", "c"]}} */
            let text = mcl.jsonWGet('darkoak:sidebar')

            player.runCommand(`titleraw @s title {"rawtext":[{"text":"${arrays.replacer(player, text.lines.join('\n'))}"}]}`)
        }
    }
}, 5)
