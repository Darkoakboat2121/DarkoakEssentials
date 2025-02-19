import { world, system, EntityDamageCause } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as arrays from "./arrays"
import { mcl } from "./logic"

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
        for (const block of mcl.listGetValues('darkoak:cws:unbreakableBlocks')) {
            if (evd.block.typeId === block) {
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
                }
                break
            case 3:
                if (evd.block.matches('minecraft:ender_chest')) {
                    evd.cancel = true
                }
                break
            case 4:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame') || evd.block.matches('minecraft:ender_chest')) {
                    evd.cancel = true
                }
                break
            case 5:
                evd.cancel = true
                break
        }
    }
})

world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {

})

world.afterEvents.playerSpawn.subscribe((evd) => {

    system.runTimeout(() => {
        const replacements = arrays.actionbarReplacements(evd.player)
        var text = mcl.wGet('darkoak:welcome')

        for (const hashtag in replacements) {
            if (text.includes(hashtag)) {
                text = text.replaceAll(hashtag, replacements[hashtag])
            }
        }
        evd.player.sendMessage(text)
    }, 100)
})


// Player tracking and world border

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const x = player.location.x
        const y = player.location.y
        const z = player.location.z

        if (mcl.wGet('darkoak:track:flying') && player.isFlying) {
            player.addTag('darkoak:flying')
        } else {
            player.removeTag('darkoak:flying')
        }

        if (mcl.wGet('darkoak:track:gliding') && player.isGliding) {
            player.addTag('darkoak:gliding')
        } else {
            player.removeTag('darkoak:gliding')
        }

        // World border
        const worldBorder = mcl.wGet('darkoak:cws:border')
        if (worldBorder != 0) {

            if (Math.abs(x) > worldBorder) {
                player.applyDamage(1, { cause: EntityDamageCause.magic })
                const k = (x / worldBorder - 1) * -1
                player.applyKnockback(k, 0, Math.abs(k) * 2, 0)
            }

            if (Math.abs(z) > worldBorder) {
                player.applyDamage(1, { cause: EntityDamageCause.magic })
                const k = (z / worldBorder - 1) * -1
                player.applyKnockback(0, k, Math.abs(k) * 2, 0)
            }
        }
    }
})

