import { world, system, Container, ItemEnchantableComponent, ItemStack, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { logcheck } from "../data/defaults"

// Anti nuker, works by checking the number of blocks broken in a small timeframe
world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!d.antinuker) return
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
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!d.antifastplace) return
    const player = evd.player

    player.setDynamicProperty('darkoak:ac:blocksplaced', player.getDynamicProperty('darkoak:ac:blocksplaced') + 1)

    system.runTimeout(() => {
        if (player.getDynamicProperty('darkoak:ac:blocksplaced') > 5) {
            log(`${player.name} -> anti-fast-place`)
        }

        player.setDynamicProperty('darkoak:ac:blocksplaced', 0)
    }, 5)
})

world.afterEvents.entityHitEntity.subscribe((evd) => {
    const player = evd.damagingEntity
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!(player instanceof Player)) return

    const currentCPS = player.getDynamicProperty('darkoak:ac:cps') || 0
    player.setDynamicProperty('darkoak:ac:cps', currentCPS + 1)

    if (!d.antikillaura) return
    if (currentCPS > 15) {
        log(`${player.name} -> anti-killaura (${currentCPS})`)
    }
})

system.runInterval(() => {
    let players = world.getAllPlayers()
    for (let index = 0; index < players.length; index++) {
        players[index].setDynamicProperty('darkoak:ac:cps', 0)
    }
}, 20)

world.beforeEvents.playerGameModeChange.subscribe((evd) => {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!mcl.isDOBAdmin(evd.player) && d.antigamemode) {
        evd.cancel = true
    }
})

world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (d.npcdetect && evd.target.typeId == 'minecraft:npc' && !mcl.isDOBAdmin(evd.player)) {
        log(`${evd.player.name} -> npc detected`)
        mcl.adminMessage(`${evd.player.name} -> npc detected`)
        evd.cancel = true
    }
})

system.runInterval(() => {
    const d = mcl.jsonWGet('darkoak:anticheat')

    let players = world.getAllPlayers()
    for (let index = 0; index < players.length; index++) {
        const player = players[index]

        // Anti fly 1
        if (player.getGameMode() != "creative" && player.getGameMode() != "spectator" && player.isFlying && d.antifly1) {
            log(`${player.name} -> anti-fly 1`)
        }

        // anti speed 1
        if ((Math.abs(player.getVelocity().x) >= 3 || Math.abs(player.getVelocity().z) >= 3) && d.antispeed1) {
            log(`${player.name} -> speed 1`)
        }

        // anti illegal enchant
        const held = mcl.getHeldItem(player)
        if (!held || !d.antiillegalenchant) return

        /**@type {ItemEnchantableComponent} */
        const en = held.getComponent("minecraft:enchantable")
        if (!en) return
        const t = en.getEnchantments()
        for (let index = 0; index < t.length; index++) {
            if (t[index].level <= 5) return

            log(`${player.nameTag} -> anti-illegal-enchant: ${t[index].type.id} ${t[index].level}`)
            let item = new ItemStack(held.type, held.amount)
            item.setLore(held.getLore())
            mcl.getItemContainer(player).setItem(player.selectedSlotIndex, item)
        }
    }
})


function log(mess) {
    let d = new Date()
    let data2 = mcl.jsonWGet(`darkoak:log`) || { logs: [{ message: 'placeholder' }] }
    data2.logs.push({ message: `${mess}\n[${d.getTime()}]` })
    mcl.wSet(`darkoak:log`, JSON.stringify(data2))
    logcheck()
}