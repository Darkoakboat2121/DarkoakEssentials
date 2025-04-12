import { world, system, EntityDamageCause, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as arrays from "../data/arrays"
import { mcl } from "../logic"

// This file holds world settings and player tracking

world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    if (!mcl.isCreating(evd.player)) {
        switch (mcl.wGet('darkoak:cws:breakblocks')) {
            case 2:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame')) {
                    evd.cancel = true
                }
                break

            case 3:
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
})

world.beforeEvents.playerInteractWithBlock.subscribe((evd) => {
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
                return
                break
        }
    }
    // const loc = evd.block.location
    // for (const command of mcl.listGetValues('darkoak:blockinteractcommand:')) {
    //     const p = JSON.parse(command)
    //     if (p.coords.x == loc.x && p.coords.y == loc.y && p.coords.z == loc.z) {
    //         if (p.command) {
    //             system.runTimeout(() => {
    //                 evd.player.runCommand(p.command)
    //             }, 0)
    //         }
    //     }
    // }
})

world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
    const command = evd.target.getDynamicProperty('darkoak:interactcommand')
    if (command) {
        system.runTimeout(() => {
            evd.player.runCommand(command)
        }, 0)
    }
})


world.afterEvents.playerSpawn.subscribe((evd) => {

    system.runTimeout(() => {
        if (!evd.initialSpawn) return
        /**@type {string} */
        let text = mcl.wGet('darkoak:welcome')

        if (!text || text.trim().length < 1) return
        evd.player.sendMessage(arrays.replacer(evd.player, text))
    }, 100)
})


// Player tracking and world border

system.runInterval(() => {
    const worldBorder = mcl.wGet('darkoak:cws:border')

    let players = world.getAllPlayers()
    for (let index = 0; index < players.length; index++) {
        const player = players[index]
        const x = player.location.x
        const y = player.location.y
        const z = player.location.z

        tracking(player, mcl.jsonWGet('darkoak:tracking'))

        
        // World border
        if (worldBorder != 0) {

            if (Math.abs(x) > worldBorder) {
                player.applyDamage(1, { cause: EntityDamageCause.magic })
                const k = (x / worldBorder - 1) * -1
                // player.applyKnockback(k, 0, Math.abs(k) * 2, 0)
                player.applyKnockback({x: k * Math.abs(k * 2), z: 0}, 0)
            }

            if (Math.abs(z) > worldBorder) {
                player.applyDamage(1, { cause: EntityDamageCause.magic })
                const k = (z / worldBorder - 1) * -1
                // player.applyKnockback(0, k, Math.abs(k) * 2, 0)
                player.applyKnockback({x: 0, z: k * Math.abs(k * 2)}, 0)
            }

        }
    }
}, 10)

/**
 * @param {Player} player 
 * @param {Object} d 
 */
function tracking(player, d) {
    if (d.flying && player.isFlying) {
        player.addTag('darkoak:flying')
    } else {
        player.removeTag('darkoak:flying')
    }

    if (d.gliding && player.isGliding) {
        player.addTag('darkoak:gliding')
    } else {
        player.removeTag('darkoak:gliding')
    }

    if (d.climbing && player.isClimbing) {
        player.addTag('darkoak:climbing')
    } else {
        player.removeTag('darkoak:climbing')
    }

    if (d.emoting && player.isEmoting) {
        player.addTag('darkoak:emoting')
    } else {
        player.removeTag('darkoak:emoting')
    }

    if (d.falling && player.isFalling) {
        player.addTag('darkoak:falling')
    } else {
        player.removeTag('darkoak:falling')
    }

    if (d.inwater && player.isInWater) {
        player.addTag('darkoak:inwater')
    } else {
        player.removeTag('darkoak:inwater')
    }

    if (d.jumping && player.isJumping) {
        player.addTag('darkoak:jumping')
    } else {
        player.removeTag('darkoak:jumping')
    }

    if (d.onground && player.isOnGround) {
        player.addTag('darkoak:onground')
    } else {
        player.removeTag('darkoak:onground')
    }
    
    

}