import { world, system, Container, ItemEnchantableComponent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "./logic"
import { logcheck } from "./data/defaults"



// Anti nuker, works by checking the number of blocks broken in a small timeframe
world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    const player = evd.player
    
    player.setDynamicProperty('darkoak:ac:blocksbroken', player.getDynamicProperty('darkoak:ac:blocksbroken') + 1)

    system.runTimeout(() => {
        if (player.getDynamicProperty('darkoak:ac:blocksbroken') > 5) {
            log(`${player.name} -> anti-nuker`)
            evd.cancel = true
        }

        player.setDynamicProperty('darkoak:ac:blocksbroken', 0)
    }, 5)
})

// Anti fast place, works by checking the number of blocks placed in a small timeframe
world.afterEvents.playerPlaceBlock.subscribe((evd) => {
    const player = evd.player

    player.setDynamicProperty('darkoak:ac:blocksplaced', player.getDynamicProperty('darkoak:ac:blocksplaced') + 1)

    system.runTimeout(() => {
        if (player.getDynamicProperty('darkoak:ac:blocksplaced') > 5) {
            log(`${player.name} -> anti-fast-place`)
        }

        player.setDynamicProperty('darkoak:ac:blocksplaced', 0)
    }, 5)
})

// world.afterEvents.entityHitEntity.subscribe((evd) => {
//     if (evd.damagingEntity.typeId != 'minecraft:player') return
//     const player = evd.damagingEntity

//     const held = mcl.getHeldItem(player)
//     /**@type {ItemEnchantableComponent} */
//     if (held === undefined) return
//     const en = held.getComponent("minecraft:enchantable")
//     const t = en.getEnchantments()
//     for (const c of t) {
//         if (!en.canAddEnchantment(c)) {
//             en.removeAllEnchantments()
//         }
//         world.sendMessage(c.type.id)
//     }
// })


system.runInterval(() => {
    for (const player of world.getAllPlayers()) {

        // Anti fly 1
        if (player.getGameMode() != "creative" && player.getGameMode() != "spectator" && player.isFlying) {
            log(`${player.name} -> anti-fly 1`)
        }

        if (Math.abs(player.getVelocity().x) >= 3 || Math.abs(player.getVelocity().z) >= 3) {
            log(`${player.name} -> speed 1`)
        }
    }
})


function log(mess) {
    const data1 = {message: mess}
    if (mcl.wGet(`darkoak:log`) === undefined) {
        mcl.wSet('darkoak:log', JSON.stringify({logs: [{message: mess}]}))
    }
    let data2 = JSON.parse(mcl.wGet(`darkoak:log`))
    data2.logs.push(data1)
    mcl.wSet(`darkoak:log`, JSON.stringify(data2))
    logcheck()
}