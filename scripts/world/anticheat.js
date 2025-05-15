import { world, system, Container, ItemEnchantableComponent, ItemStack, Player, PlayerPlaceBlockBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerGameModeChangeBeforeEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { logcheck } from "../data/defaults"


/**Anti nuker, works by checking the number of blocks broken in a small timeframe
 * @param {PlayerBreakBlockBeforeEvent} evd 
 */
export function antiNuker(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!d.antinuker) return
    const player = evd.player

    player.setDynamicProperty('darkoak:ac:blocksbroken', (player.getDynamicProperty('darkoak:ac:blocksbroken') || 0) + 1)

    if ((player.getDynamicProperty('darkoak:ac:blocksbroken') || 0) > 45) {
        evd.cancel = true
    }
}

/**Anti fast place, works by checking the number of blocks placed in a small timeframe
 * @param {PlayerPlaceBlockBeforeEvent} evd 
 */
export function antiFastPlace(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    const player = evd.player
    const block = evd.block

    if (d.antifastplace) {
        player.setDynamicProperty('darkoak:ac:blocksplaced', (player.getDynamicProperty('darkoak:ac:blocksplaced') || 0) + 1)
        if ((player.getDynamicProperty('darkoak:ac:blocksplaced') || 0) > 20) {
            evd.cancel = true
        }
    }

    if (d.antiblockreach) {
        const bl = block.location
        const pl = player.location
        const distance = Math.sqrt(
            Math.pow(bl.x - pl.x, 2) +
            Math.pow(bl.y - pl.y, 2) +
            Math.pow(bl.z - pl.z, 2)
        )
        if (distance > 8) {
            log(`${player.name} -> anti-block-reach`)
            evd.cancel = true
        }
    }
}

// Anti killaura, works by checking the number of clicks in a small timeframe
export function antiCps(evd) {
    const player = evd.damagingEntity
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!(player instanceof Player)) return

    const currentCPS = player.getDynamicProperty('darkoak:ac:cps') || 0
    player.setDynamicProperty('darkoak:ac:cps', currentCPS + 1)

    if (!d.antikillaura) return
    if (currentCPS > 15) {
        log(`${player.name} -> anti-killaura (${currentCPS})`)
    }
}

let ticker = 0
/**
 * @param {Player} player 
 */
export function cpsTester(player) {
    if (ticker <= 20) {
        ticker++
        return
    }
    player.setDynamicProperty('darkoak:ac:cps', 0)

    if ((player.getDynamicProperty('darkoak:ac:blocksplaced') || 0) > 20) {
        log(`${player.name} -> anti-fast-place`)
    }
    player.setDynamicProperty('darkoak:ac:blocksplaced', 0)

    if ((player.getDynamicProperty('darkoak:ac:blocksbroken') || 0) > 45) {
        log(`${player.name} -> anti-nuker`)
    }
    player.setDynamicProperty('darkoak:ac:blocksbroken', 0)
    ticker = 0
}

/**
 * @param {PlayerGameModeChangeBeforeEvent} evd 
 */
export function antiGameMode(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!mcl.isDOBAdmin(evd.player) && d.antigamemode) {
        evd.cancel = true
    }
}

export function antiNpc(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (d.npcdetect && evd.target.typeId == 'minecraft:npc' && !mcl.isDOBAdmin(evd.player)) {
        log(`${evd.player.name} -> npc detected`)
        mcl.adminMessage(`${evd.player.name} -> npc detected`)
        evd.cancel = true
    }
}

/**system interval function, player type
 * @param {Player} player 
 */
export function anticheatMain(player) {
    const d = mcl.jsonWGet('darkoak:anticheat')

    const v = player.getVelocity()
    const vd = player.getViewDirection()
    const dot = v.x * vd.x + v.z * vd.z

    // Anti fly 1
    if (player.getGameMode() != "creative" && player.getGameMode() != "spectator" && player.isFlying && d.antifly1) {
        log(`${player.name} -> anti-fly 1`)
    }

    // anti fly 2
    if (player.getGameMode() != "creative" && player.getGameMode() != "spectator" && player.isFlying && d.antifly2 && player.isGliding) {
        log(`${player.name} -> anti-fly 2`)
    }

    // anti fly 3
    if (player.getGameMode() != "creative" && player.getGameMode() != "spectator" && d.antifly3 && player.isGliding && v.y > 0.8 && v.x < 0.2 && v.z < 0.2 && vd.y < 1) {
        log(`${player.name} -> anti-fly 3`)
    }

    // anti invalid movements 1
    if (player.isSneaking && player.isSprinting && d.antiinvalid1) {
        log(`${player.name} -> anti-invalid 1`)
    }

    // anti invalid movements 2
    if (d.antiinvalid2 && player.isSprinting && player.isOnGround && dot < -0.1) {
        log(`${player.name} -> anti-invalid 2`)
    }

    // anti invalid movements 3
    if (d.antiinvalid3 && player.isClimbing && v.y > 1) {
        log(`${player.name} -> anti-invalid 3`)
    }

    // anti speed 1
    if ((Math.abs(v.x) >= 3 || Math.abs(v.z) >= 3) && d.antispeed1) {
        log(`${player.name} -> speed 1`)
    }

    // anti speed 2
    if ((Math.abs(v.x) >= 10 || Math.abs(v.z) >= 10) && d.antispeed1) {
        log(`${player.name} -> speed 2`)
    }

    // anti illegal enchant
    const held = mcl.getHeldItem(player)
    if (!held || !d.antiillegalenchant) return

    /**@type {ItemEnchantableComponent} */
    const en = held.getComponent("minecraft:enchantable")
    if (!en) return
    const t = en.getEnchantments()
    for (let index = 0; index < t.length; index++) {
        if (t[index].level <= 5) continue

        log(`${player.nameTag} -> anti-illegal-enchant: ${t[index].type.id} ${t[index].level}`)
        let item = new ItemStack(held.type, held.amount)
        item.setLore(held.getLore())
        mcl.getItemContainer(player).setItem(player.selectedSlotIndex, item)
    }
}

/**
 * @param {string} mess 
 */
export function log(mess) {
    let d = new Date()
    let data2 = mcl.jsonWGet(`darkoak:log`) || { logs: [{ message: 'placeholder' }] }
    data2.logs.push({ message: `${mess}\n[${d.getTime()}]` })
    const da = mcl.jsonWGet('darkoak:anticheat')
    if (da.notify) {
        system.runTimeout(() => mcl.adminMessage(`Anticheat: ${mess}`))
    }
    mcl.wSet(`darkoak:log`, JSON.stringify(data2))
    logcheck()
}