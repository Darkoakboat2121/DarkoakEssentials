import { world, system, Container, ItemEnchantableComponent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "./logic"
import { logcheck } from "./defaults"



// Anti nuker, works by checking the number of blocks broken in a small timeframe
world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    const player = evd.player
    if (player.getDynamicProperty('darkoak:ac:blocksbroken') === undefined) {
        player.setDynamicProperty('darkoak:ac:blocksbroken', 0)
    }
    player.setDynamicProperty('darkoak:ac:blocksbroken', player.getDynamicProperty('darkoak:ac:blocksbroken') + 1)

    system.runTimeout(() => {
        if (player.getDynamicProperty('darkoak:ac:blocksbroken') > 5) {
            log(`${player.name} triggered anti-nuker`)
            evd.cancel = true
        }

        player.setDynamicProperty('darkoak:ac:blocksbroken', 0)
    }, 5)
})

// Anti fast place, works by checking the number of blocks placed in a small timeframe
world.afterEvents.playerPlaceBlock.subscribe((evd) => {
    const player = evd.player
    if (player.getDynamicProperty('darkoak:ac:blocksplaced') === undefined) {
        player.setDynamicProperty('darkoak:ac:blocksplaced', 0)
    }
    player.setDynamicProperty('darkoak:ac:blocksplaced', player.getDynamicProperty('darkoak:ac:blocksplaced') + 1)

    system.runTimeout(() => {
        if (player.getDynamicProperty('darkoak:ac:blocksplaced') > 5) {
            log(`${player.name} triggered anti-fast-place`)
        }

        player.setDynamicProperty('darkoak:ac:blocksplaced', 0)
    }, 5)
})

world.afterEvents.entityHitEntity.subscribe((evd) => {
    if (evd.damagingEntity.typeId != 'minecraft:player') return
    const player = evd.damagingEntity

    const held = mcl.getHeldItem(player)
    /**@type {ItemEnchantableComponent} */
    if (held === undefined) return
    const en = held.getComponent("minecraft:enchantable")
    const t = en.getEnchantments()
    for (const c of t) {
        if (!en.canAddEnchantment(c)) {
            en.removeAllEnchantments()
        }
        world.sendMessage(c.type.id)
    }
})


system.runInterval(() => {
    for (const player of world.getAllPlayers()) {

        // Anti fly 1
        if (player.getGameMode() != "creative" && player.getGameMode() != "spectator" && player.isFlying) {
            log(`${player.name} triggered anti-fly 1`)
        }

        if (player.getVelocity().x >= 3 || player.getVelocity().z >= 3) {
            log(`${player.name} triggered speed 1`)
        }
    }
})


function log(message) {
    mcl.wSet(`darkoak:log:${mcl.timeUuid()}`, `${message}|${Date.now()}`)
    logcheck()
}