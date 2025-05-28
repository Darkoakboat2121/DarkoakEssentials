import { world, system, EntityDamageCause, Player, PlayerSpawnAfterEvent, PlayerBreakBlockAfterEvent, PlayerBreakBlockBeforeEvent, PlayerInteractWithBlockAfterEvent, PlayerInteractWithBlockBeforeEvent } from "@minecraft/server"
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
 * @param {PlayerSpawnAfterEvent} evd 
 */
export function welcomeMessage(evd) {
    if (!evd.initialSpawn) return

    /**@type {string} */
    let text = mcl.wGet('darkoak:welcome')
    if (!text || text.trim().length < 1) return

    system.runTimeout(() => {
        evd.player.sendMessage(arrays.replacer(evd.player, text))
    }, 100)
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

/**
 * @param {Player} player 
 * @param {Object} d 
 */
function tracking(player, d) {
    if (d.flying && player.isFlying) {
        player.addTag('darkoak:flying')
        if (d.flyingC) player.runCommand(d.flyingC)
    } else {
        player.removeTag('darkoak:flying')
    }

    if (d.gliding && player.isGliding) {
        player.addTag('darkoak:gliding')
        if (d.glidingC) player.runCommand(d.glidingC)
    } else {
        player.removeTag('darkoak:gliding')
    }

    if (d.climbing && player.isClimbing) {
        player.addTag('darkoak:climbing')
        if (d.climbingC) player.runCommand(d.climbingC)
    } else {
        player.removeTag('darkoak:climbing')
    }

    if (d.emoting && player.isEmoting) {
        player.addTag('darkoak:emoting')
        if (d.emotingC) player.runCommand(d.emotingC)
    } else {
        player.removeTag('darkoak:emoting')
    }

    if (d.falling && player.isFalling) {
        player.addTag('darkoak:falling')
        if (d.fallingC) player.runCommand(d.fallingC)
    } else {
        player.removeTag('darkoak:falling')
    }

    if (d.inwater && player.isInWater) {
        player.addTag('darkoak:inwater')
        if (d.inwaterC) player.runCommand(d.inwaterC)
    } else {
        player.removeTag('darkoak:inwater')
    }

    if (d.jumping && player.isJumping) {
        player.addTag('darkoak:jumping')
        if (d.jumpingC) player.runCommand(d.jumpingC)
    } else {
        player.removeTag('darkoak:jumping')
    }

    if (d.onground && player.isOnGround) {
        player.addTag('darkoak:onground')
        if (d.ongroundC) player.runCommand(d.ongroundC)
    } else {
        player.removeTag('darkoak:onground')
    }



}