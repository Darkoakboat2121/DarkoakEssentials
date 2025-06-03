// first is minecraft resources
import { world, system, Player, GameMode, ItemStack, ItemUseAfterEvent, PlayerInteractWithBlockBeforeEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData, uiManager } from "@minecraft/server-ui"

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

// seventh set up external uis / commands
import * as external from "./external/external"
import { customEnchantActions, customEnchantEvents, enchantOnDamaged, enchantOnDeathKill, enchantOnHit, enchantOnJump, enchantOnUse } from "./enchanting"
import { bui } from "./uis/baseplateUI"

const cooldown = new Map()

// main ui opener, see interfaces, also manages bindable/dummy items
world.afterEvents.itemUse.subscribe((evd) => {
    itemOpeners(evd)
    enchantOnUse(evd)
})

// anticps and onhitenchants
world.afterEvents.entityHitEntity.subscribe((evd) => {
    anticheat.antiCps(evd)
    enchantOnHit(evd)
})

// on spawn community giver and welcome message and queue message system
world.afterEvents.playerSpawn.subscribe((evd) => {
    communityGiver(evd)
    worldSettings.welcomeMessage(evd)
    chat.messageQueueAndPlayerList(evd)
})

// chest lock, world interact settings, landclaims, data editor, data editor block
world.beforeEvents.playerInteractWithBlock.subscribe((evd) => {
    chestLock(evd)
    worldSettings.worldSettingsInteract(evd)
    worldProtection.placeBreakLandclaim(evd)
    dataEditorBlock(evd)
    worldSettings.interactCommandBlock(evd)
})

// antinpc, dataeditorentity, and on interact commands
world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
    anticheat.antiNpc(evd)
    dataEditor(evd)
    worldSettings.interactCommand(evd)
})

world.afterEvents.entityHurt.subscribe((evd) => {
    enchantOnDamaged(evd)
})

world.afterEvents.entityDie.subscribe((evd) => {
    enchantOnDeathKill(evd)
})

world.beforeEvents.chatSend.subscribe((evd) => {
    chat.chatSystem(evd)
})

world.afterEvents.playerBreakBlock.subscribe((evd) => {
    worldSettings.signFixer(evd)
})

world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    worldSettings.worldSettingsBreak(evd)
    worldProtection.placeBreakProtection(evd)
    worldProtection.placeBreakLandclaim(evd)
    anticheat.antiNuker(evd)
    worldProtection.lockedChestProtection(evd)
})

world.beforeEvents.playerPlaceBlock.subscribe((evd) => {
    worldProtection.placeBreakProtection(evd)
    worldProtection.placeBreakLandclaim(evd)
    anticheat.antiFastPlace(evd)
})

world.beforeEvents.explosion.subscribe((evd) => {
    worldProtection.explosionProtectionLandclaim(evd)
})

world.beforeEvents.playerGameModeChange.subscribe((evd) => {
    anticheat.antiGameMode(evd)
})

world.beforeEvents.playerLeave.subscribe((evd) => {
    worldSettings.welcomeMessage(evd)
    system.runTimeout(() => {
        try {
            uiManager.closeAllForms(evd.player)
        } catch {

        }
    })
})

world.afterEvents.playerLeave.subscribe((evd) => {

})

world.afterEvents.itemReleaseUse.subscribe((evd) => {
    worldSettings.pacifistArrowFix(evd)
})

// system for handling most system intervals
system.runInterval(() => {
    defaults.defaultData()

    uis()
    gens()
    bans()
    chat.chatGames()
    defaults.byteChecker()
    defaults.timers()

    const players = world.getAllPlayers()
    for (let index = 0; index < players.length; index++) {
        const player = players[index]
        worldProtection.worldProtectionOther(player)
        worldSettings.borderAndTracking(player)
        enchantOnJump(player)
        actionBar(player)
        anticheat.anticheatMain(player)
        anticheat.cpsTester(player)
        chat.nametag(player, mcl.jsonWGet('darkoak:chat:other'))
        glideFeather(player)
    }
})

// on player shoot arrow, if player has tag pacifist, apply pacifist tag to arrow

/**
 * @param {ItemUseAfterEvent} evd 
 */
function itemOpeners(evd) {
    const player = evd.source
    const item = evd.itemStack
    const direction = player.getViewDirection()
    if (item.typeId == 'darkoak:main') {
        if (mcl.isDOBAdmin(player)) {
            interfaces.mainUI(player)
            player.addTag('darkoak:admin')
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }

    if (item.typeId == 'darkoak:community') {
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

    if (item.typeId == 'darkoak:generators' && player.hasTag('darkoak:admin')) {
        interfacesTwo.genMainUI(player)
        return
    }

    if (item.typeId == 'darkoak:anticheat') {
        interfacesTwo.anticheatMain(player)
        return
    }

    if (item.typeId == 'darkoak:world_protection') {
        if (player.hasTag('darkoak:admin')) {
            interfacesTwo.protectedAreasMain(player)
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }

    if (item.typeId == 'darkoak:hop_feather' && (player.isOnGround || player.isClimbing || player.isInWater)) {
        const now = Date.now()
        const lastUsed = cooldown.get(player.name) || 0
        const time = mcl.jsonWGet('darkoak:itemsettings')

        // checks if the cooldown has expired
        if (now - lastUsed < (time.hopfeather * 1000)) {
            const remainingTime = Math.ceil(((time.hopfeather * 1000) - (now - lastUsed)) / 1000)
            if (time.hopfeatherM) player.sendMessage(`§cYou Must Wait ${remainingTime} More Seconds To Use This Item Again!`)
            return
        }

        // applies knockback to the player in the direction they are looking
        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, 1)
        cooldown.set(player.name, now)
        return
    }

    // checks if the player is using the dash feather item
    if (item.typeId == 'darkoak:dash_feather' && (player.isOnGround || player.isClimbing)) {
        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, direction.y * 1.5)
        return
    }


    if (item.typeId.startsWith('darkoak:dummy')) {
        for (let index = 0; index <= arrays.dummySize; index++) {
            if (item.typeId == `darkoak:dummy${index}`) {
                const c = mcl.jsonWGet(`darkoak:bind:${index}`)
                if (!c) return
                const keys = Object.keys(c)
                for (let index = 0; index < keys.length; index++) {
                    const command = keys[index]
                    if (c[command]) evd.source.runCommand(arrays.replacer(player, c[command]))
                }
                return
            }
        }
    }
}

function communityGiver(evd) {
    const s = mcl.jsonWGet('darkoak:community:general') || { giveOnJoin: false }

    if (s.giveOnJoin && evd.player.runCommand('testfor @s [hasitem={item=darkoak:community}]').successCount == 0) {
        evd.player.runCommand('give @s darkoak:community')
    }
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
function chestLock(evd) {
    if (evd.player.hasTag('darkoak:admin') && evd.itemStack && evd.itemStack.typeId == 'darkoak:chest_lock' && evd.block.matches('minecraft:chest')) {
        system.runTimeout(() => {
            interfaces.chestLockUI(evd.player, evd.block.location)
        })
        evd.cancel = true
    } else if (evd.block.matches('minecraft:chest')) {
        const locks = mcl.listGetValues('darkoak:chestlock:')
        for (let index = 0; index < locks.length; index++) {
            const parts = JSON.parse(locks[index])
            const loc = evd.block.location
            if (loc.x.toString() === parts.x && loc.y.toString() === parts.y && loc.z.toString() === parts.z && evd.player.name != parts.player) {
                evd.cancel = true
                return
            }
        }
    }
}

function dataEditor(evd) {
    if (evd.itemStack && evd.itemStack.typeId === 'darkoak:data_editor' && evd.player.hasTag('darkoak:admin')) {
        evd.cancel = true
        system.runTimeout(() => {
            interfacesTwo.dataEditorEntityUI(evd.player, evd.target)
        })
    }
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
function dataEditorBlock(evd) {
    if (evd.itemStack && evd.itemStack.typeId === 'darkoak:data_editor' && evd.player.hasTag('darkoak:admin') && evd.isFirstEvent) {
        evd.cancel = true
        system.runTimeout(() => {
            interfacesTwo.dataEditorBlockUI(evd.player, evd.block)
        })
    }
}

function uis() {
    let uis = mcl.listGetValues('darkoak:ui:message:')
    for (let index = 0; index < uis.length; index++) {
        /** @type {{ title: string, body: string, button1: string, button2: string, tag: string, command1: string, command2: string }} */
        const parts = JSON.parse(uis[index])
        const players = world.getPlayers({ tags: [parts.tag] })
        for (let index = 0; index < players.length; index++) {
            const player = players[index]
            // index: 0 = title, 1 = body, 2 = button1, 3 = button2, 4 = tag, 5 = button1 command, 6 = button2 command
            messageUIBuilder(player, parts.title, parts.body, parts.button1, parts.button2, parts.command1, parts.command2)
            player.removeTag(parts.tag)
        }
    }

    let uis2 = mcl.listGetValues('darkoak:ui:action:')
    for (let index = 0; index < uis2.length; index++) {
        const parts = JSON.parse(uis2[index])
        const players = world.getPlayers({ tags: [parts.tag] })
        for (let index = 0; index < players.length; index++) {
            const player = players[index]
            actionUIBuilder(player, parts.title, parts.body, parts.buttons)
            player.removeTag(parts.tag)
        }
    }

    let uis3 = mcl.listGetValues('darkoak:ui:modal:')
    for (let index = 0; index < uis3.length; index++) {
        const parts = JSON.parse(uis3[index])
        const players = world.getPlayers({ tags: [parts.tag] })
        for (let index = 0; index < players.length; index++) {
            const player = players[index]
            modalUIBuilder(player, parts)
            player.removeTag(parts.tag)
        }
    }
}

// gen system
function gens() {
    const blocks = mcl.listGetValues('darkoak:gen:')
    for (let index = 0; index < blocks.length; index++) {
        const b = JSON.parse(blocks[index])
        const parts = b.coords.split(' ')
        try {
            const block = world.getDimension(b.dimension || 'overworld')
            const coords = {
                x: parseInt(parts[0]),
                y: parseInt(parts[1]),
                z: parseInt(parts[2])
            }
            if (!block.getBlock({
                x: coords.x,
                y: coords.y,
                z: coords.z
            })) continue
            block.setBlockType({
                x: coords.x,
                y: coords.y,
                z: coords.z
            }, b.block)
        } catch {
            mcl.adminMessage(`Failed To Set Block ${b.block} At ${parts[0]} ${parts[1]} ${parts[2]}`)
        }
    }

    const mobs = mcl.listGetBoth('darkoak:mobgen:')
    for (let index = 0; index < mobs.length; index++) {
        const m = JSON.parse(mobs[index].value)
        try {
            if (m.current == 0) {
                const spawn = world.getDimension(m.dimension || 'overworld')
                mcl.jsonWSet(mobs[index].id, {
                    mob: m.mob,
                    loc: m.loc,
                    interval: m.interval,
                    current: m.interval,
                    max: m.max,
                    dimension: m.dimension
                })
                if (spawn.runCommand(`execute positioned ${m.loc.x} ${m.loc.y} ${m.loc.z} run testfor @e [type=${m.mob},r=10]`).successCount <= m.max) {
                    spawn.spawnEntity(m.mob, m.loc)
                }
            } else {
                mcl.jsonWUpdate(mobs[index].id, 'current', m.current - 1)
            }
        } catch (e) {
            mcl.adminMessage(`Failed To Spawn Mob ${m.mob} At ${m.loc.x} ${m.loc.y} ${m.loc.z}, ${e}`)
        }
    }
}

let ticker = 0
/**Ban system */
function bans() {
    if (ticker < 200) {
        ticker++
        return
    }

    const p = world.getAllPlayers()[0]
    const d = mcl.jsonWGet('darkoak:anticheat')

    if (d.prebans) {
        const prebans = arrays.preBannedList
        for (let index = 0; index < prebans.length; index++) {
            const preban = prebans[index]
            if (!mcl.getPlayer(preban)) continue
            p.runCommand(`kick "${preban}"`)
        }
    }

    const bans = mcl.listGetBoth('darkoak:bans:')
    if (!bans) return
    for (let index = 0; index < bans.length; index++) {
        const ban = bans[index]
        const data = JSON.parse(ban.value)
        if (data.time == 0) {
            mcl.adminMessage(`${data.player} Has Been Unbanned`)
            mcl.wRemove(ban.id)
            continue
        }
        mcl.jsonWUpdate(ban.id, 'time', data.time - 1)
        if (!mcl.getPlayer(data.player)) continue
        p.runCommand(`kick "${data.player}" ${data.message || ''}`)
    }
}


system.afterEvents.scriptEventReceive.subscribe((evd) => {
    const player = evd.sourceEntity
    if (evd.id === 'darkoak:enchant') {
        if (!evd.sourceEntity) return
        if (evd.message.trim() == '') {
            interfacesTwo.customEnchantsMain(evd.sourceEntity)
            return
        } else {
            const parts = evd.message.split(' ')
            const event = parseInt(parts[0])
            const action = parseInt(parts[1])
            const power = parseInt(parts[2])

            const i = mcl.getHeldItem(player)
            let item = new ItemStack(i.type, i.amount)
            let lore = i.getLore()
            lore.push(`§r§5${customEnchantEvents[event]}-${customEnchantActions[action]}-${power}`)
            item.setLore(lore)
            item.nameTag = i.nameTag || item.nameTag

            mcl.getItemContainer(player).setItem(player.selectedSlotIndex, item)
            return
        }
    }
    // if (evd.id === 'darkoak:bind') {
    //     if (!evd.sourceEntity) return
    //     interfacesTwo.itemBindingUI(evd.sourceEntity)
    //     return
    // }
    if (evd.id === 'darkoak:spawn') {
        const b = evd.sourceBlock || player
        if (!b) {
            mcl.adminMessage(`The darkoak:spawn Scriptevent Needs To Execute From A Block Or Entity`)
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
            mcl.adminMessage(`Scriptevent darkoak:spawn From Block / Entity ${b.location.x} ${b.location.y} ${b.location.z} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:command') {
        if (!player) {
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
            player.applyKnockback({ x: 0, z: 0 }, player.getVelocity().y * -1)
            player.applyKnockback({ x: parseFloat(p[0]), z: parseFloat(p[1]), }, parseFloat(p[2]))
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
    if (evd.id == 'darkoak:variable') {
        if (!player) {
            mcl.adminMessage(`The darkoak:variable Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            const p = arrays.replacer(player, evd.message).split(' ')
            mcl.wSet(`darkoak:vars:${p[0]}`, p[1])
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:variable From ${player.nameTag} Has An Error`)
            return
        }
    }

    // DEBUG EVENTS
    if (evd.id == 'darkoak:debug') {
        try {
            switch (evd.message) {
                case '':
                case 'help':
                    mcl.adminMessage(arrays.debugEvents)
                    break
                case 'aclog':
                    anticheat.log(`${player.nameTag} -> DEBUG TEST`)
                    break
                case 'playerlist':
                    mcl.adminMessage(mcl.getPlayerList().join('\n'))
                    break
                case 'bytes':
                case 'bytesize':
                    mcl.adminMessage(world.getDynamicPropertyTotalByteCount().toString())
                    break
            }
        } catch (e) {
            mcl.adminMessage(`AW HECK IT BROK: ${String(e)}`)
        }
    }
})

system.beforeEvents.watchdogTerminate.subscribe((evd) => {
    const d = mcl.jsonWGet('darkoak:scriptsettings')
    if (!d) return
    if (d.cancelWatchdog) {
        mcl.adminMessage(`Script Shutdown, Reason: ${evd.terminateReason.toString()}`)
        evd.cancel = true
    }
})

function actionUIBuilder(playerToShow, title, body, buttons) {
    let f = new ActionFormData()

    bui.title(f, arrays.replacer(playerToShow, title))
    bui.body(f, arrays.replacer(playerToShow, body))

    for (let index = 0; index < buttons.length; index++) {
        bui.button(f, arrays.replacer(playerToShow, buttons[index].title))
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

/**system for displaying message cui
 * @param {Player} playerToShow 
 * @param {string} title 
 * @param {string} body 
 * @param {string} button1 
 * @param {string} button2 
 * @param {string} command1 
 * @param {string} command2 
 */
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
    f.title(ui.title)

    for (const el of uiData.elements) {
        if (el.type === 'textField') {
            f.textField(el.label, el.placeholder, { defaultValue: el.defaultValue })
        } else if (el.type === 'toggle') {
            f.toggle(el.label, { defaultValue: el.defaultValue })
        } else if (el.type === 'dropdown') {
            f.dropdown(el.label, el.options, { defaultValue: el.defaultValue })
        }
    }

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
    })
}

/**System for displaying the actionbar and sidebar
 * @param {Player} player 
 */
function actionBar(player) {
    const text = mcl.wGet('darkoak:actionbar')
    if (text) player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"${arrays.replacer(player, text)}"}]}`)

    /**@type {{lines: ["a", "b", "c"]}} */
    const text2 = mcl.jsonWGet('darkoak:sidebar')
    if (text2) player.runCommand(`titleraw @s title {"rawtext":[{"text":"${arrays.replacer(player, text2.lines.join('\n'))}"}]}`)
}

/**Glide feather
 * @param {Player} player 
 */
function glideFeather(player) {
    const view = player.getViewDirection()
    const item = mcl.getHeldItem(player)
    if (item && item.typeId == 'darkoak:glide_feather' && !player.isOnGround && !player.isJumping && !player.isSneaking) player.applyKnockback({ x: view.x / 2, z: view.z / 2 }, player.getVelocity().y * -1)
}