import { world, system, EntityDamageCause, Player, PlayerSpawnAfterEvent, PlayerBreakBlockAfterEvent, PlayerBreakBlockBeforeEvent, PlayerInteractWithBlockAfterEvent, PlayerInteractWithBlockBeforeEvent, PlayerLeaveAfterEvent, PlayerLeaveBeforeEvent, ItemReleaseUseAfterEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as arrays from "../data/arrays"
import { mcl } from "../logic"

// This file holds world settings and player tracking

/**
 * @param {PlayerBreakBlockBeforeEvent} evd 
 */
export function worldSettingsBreak(evd) {
    if (!mcl.isCreating(evd.player)) {
        switch (mcl.wGet('darkoak:cws:breakblocks')) {
            case 2:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame')) {
                    evd.cancel = true
                }
                break

            case 3:
                if (evd.block.typeId == 'minecraft:sign') mcl.jsonWSet('darkoak:signrestore', mcl.getSign(evd.block))
                evd.cancel = true
                break
        }
    } else if (evd.player.getGameMode() != "creative") {
        let blocks = mcl.listGetValues('darkoak:cws:unbreakableBlocks')
        for (let index = 0; index < blocks.length; index++) {
            if (evd.block.typeId === blocks[index]) {
                evd.cancel
                return
            }
        }
    }
}

/**
 * @param {PlayerBreakBlockAfterEvent} evd 
 */
export function signFixer(evd) {
    const block = evd.block
    if (mcl.wGet('darkoak:cws:breakblocks') == 3) {
        if (block.typeId == 'minecraft:sign') {
            const sign = mcl.jsonWGet('darkoak:signrestore')
            mcl.rewriteSign(block, sign.waxed, sign.text, sign.color)
        }
    }
}


export function worldSettingsInteract(evd) {
    if (!mcl.isCreating(evd.player)) {
        switch (mcl.wGet('darkoak:cws:interactwithblocks')) {
            case 2:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame')) {
                    evd.cancel = true
                    return
                }
                break
            case 3:
                if (evd.block.matches('minecraft:ender_chest')) {
                    evd.cancel = true
                    return
                }
                break
            case 4:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame') || evd.block.matches('minecraft:ender_chest')) {
                    evd.cancel = true
                    return
                }
                break
            case 5:
                evd.cancel = true
                break
        }
    }
}

export function interactCommand(evd) {
    const command = evd.target.getDynamicProperty('darkoak:interactcommand')
    if (command) {
        system.runTimeout(() => {
            evd.player.runCommand(command)
        })
    }
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
export function interactCommandBlock(evd) {
    if (!evd.isFirstEvent) return
    const defaults = mcl.listGetValues('darkoak:blockinteractcommand:')
    const loc = evd.block.location
    for (let index = 0; index < defaults.length; index++) {
        const p = JSON.parse(defaults[index])
        if (p.coords.x === loc.x && p.coords.y === loc.y && p.coords.z === loc.z) {
            system.runTimeout(() => {
                evd.player.runCommand(p.command)
            })
            return
        }
    }
}

/**
 * @param {PlayerSpawnAfterEvent | PlayerLeaveBeforeEvent} evd 
 */
export function welcomeMessage(evd) {
    /**@type {{welcome: string, welcomeS: boolean, bye: string, byeS: string}} */
    const d = mcl.jsonWGet('darkoak:welcome')
    if (!d) return
    if (evd instanceof PlayerSpawnAfterEvent) {
        if (!evd.initialSpawn) return
        system.runTimeout(() => {
            if (d.welcomeS) {
                world.sendMessage(arrays.replacer(evd.player, d.welcome))
            } else {
                evd.player.sendMessage(arrays.replacer(evd.player, d.welcome))
            }
        }, 100)
    } else {
        if (d.byeS) {
            world.sendMessage(arrays.replacer(evd.player, d.bye))
        } else {
            evd.player.sendMessage(arrays.replacer(evd.player, d.bye))
        }
    }
}

/**Player tracking and world border
 * @param {Player} player 
 */
export function borderAndTracking(player) {
    const worldBorder = mcl.wGet('darkoak:cws:border')

    const x = player.location.x
    const z = player.location.z

    tracking(player, mcl.jsonWGet('darkoak:tracking'))

    // World border
    if (worldBorder != 0) {

        if (Math.abs(x) > worldBorder) {
            player.applyDamage(1, { cause: EntityDamageCause.magic })
            const k = (x / worldBorder - 1) * -1
            // player.applyKnockback(k, 0, Math.abs(k) * 2, 0)
            player.applyKnockback({ x: k * Math.abs(k / 2.5), z: 0 }, 0)
        }

        if (Math.abs(z) > worldBorder) {
            player.applyDamage(1, { cause: EntityDamageCause.magic })
            const k = (z / worldBorder - 1) * -1
            // player.applyKnockback(0, k, Math.abs(k) * 2, 0)
            player.applyKnockback({ x: 0, z: k * Math.abs(k / 2.5) }, 0)
        }

    }
}

/**Don't recommend touching lol
 * @param {Player} player 
 * @param {Object} d 
 */
function tracking(player, d) {

    const objectKeys = arrays.trackingKeysObject
    const playerKeys = arrays.trackingKeysPlayer
    for (let index = 0; index < objectKeys.length; index++) {
        const oKey = objectKeys[index]
        const pKey = playerKeys[index]
        
        if (d[oKey] && player[pKey]) {
            player.addTag(`darkoak:${oKey}`)
            if (d[`${oKey}C`]) player.runCommand(arrays.replacer(player, d[`${oKey}C`]))
        } else {
            player.removeTag(`darkoak:${oKey}`)
        }
    }
}

/**
 * @param {ItemReleaseUseAfterEvent} evd 
 */
export function pacifistArrowFix(evd) {
    if (!evd.itemStack) return
    if (evd.itemStack.typeId != 'minecraft:bow' || evd.itemStack.typeId != 'minecraft:crossbow') return
    evd.source.runCommand('tag @e [type=arrow,r=0.5,c=1] add darkoak:pacifist')
}