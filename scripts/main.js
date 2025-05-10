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

const cooldown = new Map()

// main ui opener, see interfaces, also manages bindable/dummy items
world.afterEvents.itemUse.subscribe((evd) => {
    const player = evd.source
    const item = evd.itemStack
    const direction = player.getViewDirection()
    if (item.typeId === 'darkoak:main') {
        if (player.hasTag('darkoak:admin')) {
            interfaces.mainUI(player)
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }

    if (item.typeId === 'darkoak:community') {
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

    if (item.typeId === 'darkoak:generators' && player.hasTag('darkoak:admin')) {
        interfacesTwo.genMainUI(player)
        return
    }

    if (item.typeId === 'darkoak:anticheat') {
        interfacesTwo.anticheatMain(player)
        return
    }

    if (item.typeId === 'darkoak:world_protection') {
        if (player.hasTag('darkoak:admin')) {
            interfacesTwo.protectedAreasMain(player)
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }


    if (item.typeId === 'darkoak:hop_feather' && (player.isOnGround || player.isClimbing)) {
        const now = Date.now()
        const lastUsed = cooldown.get(player.name) || 0
        const time = mcl.jsonWGet('darkoak:itemsettings')

        // checks if the cooldown has expired
        if (now - lastUsed < (time.hopfeather * 1000)) {
            const remainingTime = Math.ceil(((time.hopfeather * 1000) - (now - lastUsed)) / 1000)
            if (time.hopfeatherM) player.sendMessage(`§cYou Must Wait ${remainingTime} More Seconds To Use This Item Again!`)
            return
        }

        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, 1)
        cooldown.set(player.name, now)
        return
    }

    if (item.typeId === 'darkoak:dash_feather' && (player.isOnGround || player.isClimbing)) {
        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, direction.y * 1.5)
        return
    }


    if (item.typeId.startsWith('darkoak:dummy')) {
        for (let index = 0; index <= arrays.dummySize; index++) {
            if (item.typeId === `darkoak:dummy${index}`) {
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
    const s = mcl.jsonWGet('darkoak:community:general')

    if (evd.player.runCommand('testfor @s [hasitem={item=darkoak:community}]').successCount == 0 && s.giveOnJoin) {
        evd.player.runCommand('give @s darkoak:community')
    }
})

// chest lock system, wip
world.beforeEvents.playerInteractWithBlock.subscribe((evd) => {
    if (evd.player.hasTag('darkoak:admin') && evd.itemStack && evd.itemStack.typeId == 'darkoak:chest_lock' && evd.block.matches('minecraft:chest')) {
        system.runTimeout(() => {
            interfaces.chestLockUI(evd.player, evd.block.location)
        })
        evd.cancel = true
    } else if (evd.block.matches('minecraft:chest')) {
        let locks = mcl.listGetValues('darkoak:chestlock:')
        for (let index = 0; index < locks.length; index++) {
            const parts = JSON.parse(locks)
            const loc = evd.block.location
            if (loc.x.toString() === parts.x && loc.y.toString() === parts.y && loc.z.toString() === parts.z && evd.player.name != parts.player) {
                evd.cancel = true
                continue
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

let ticker = 0
system.runInterval(() => {
    ticker++
    if (ticker < 10) return

    const p = world.getAllPlayers()[0]
    const d = mcl.jsonWGet('darkoak:anticheat')

    if (d.prebans) {
        let prebans = arrays.preBannedList
        for (let index = 0; index < prebans.length; index++) {
            if (!mcl.getPlayer(prebans[index])) continue
            p.runCommand(`kick "${prebans[index]}"`)
        }
    }

    let bans = mcl.listGetBoth('darkoak:bans:')
    if (!bans) return
    for (let index = 0; index < bans.length; index++) {
        const data = JSON.parse(bans[index].value)
        if (data.time == 0) {
            mcl.adminMessage(`${data.player} Has Been Unbanned`)
            mcl.wRemove(bans[index].id)
            continue
        }
        mcl.jsonWSet(bans[index].id, {
            player: data.player,
            message: data.message,
            time: data.time - 1
        })
        if (!mcl.getPlayer(data.player)) continue
        p.runCommand(`kick "${data.player}" ${data.message || ''}`)
    }
}, 20)


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
    if (evd.id == 'darkoak:knockback') {
        if (!player) {
            mcl.adminMessage(`The darkoak:knockback Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            const p = arrays.replacer(player, evd.message).split(' ')
            player.applyKnockback({x: parseFloat(p[0]), z: parseFloat(p[1]), }, parseFloat(p[2]))
            return
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:knockback From Entity ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:if') {
        if (!player) {
            mcl.adminMessage(`The darkoak:if Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            let p = arrays.replacer(player, evd.message).split(' ')
            if (p[0] == p[1]) {
                p.splice(0, 2)
                player.runCommand(p.join(' '))
            } 
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:if From Entity ${player.nameTag} Has An Error`)
            return
        }
    }
})

system.beforeEvents.watchdogTerminate.subscribe((evd) => {
    const d = mcl.jsonWGet('darkoak:scriptsettings')
    if (!d) return
    if (d.cancelWatchdog) {
        mcl.adminMessage(`Script Shutdown, Reason: ${evd.terminateReason}`)
        evd.cancel = true
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

function modalUIBuilder(playerToShow, ui) {
    let f = new ModalFormData()
    const data = JSON.parse(ui)

    for (let index = 0; index < data.elements.length; index++) {
        const el = data.elements[index]
        el()
    }

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
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


// actually works, modal editor time!
// function hi() {
//     // code here
// }

// function run(ggg) {
//     ggg()
// }
// run(hi)