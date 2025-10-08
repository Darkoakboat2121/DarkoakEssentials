import { world, system, Container, ItemEnchantableComponent, ItemStack, Player, PlayerPlaceBlockBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerGameModeChangeBeforeEvent, GameMode, EntityComponentTypes, ItemComponentTypes, EntityHitEntityAfterEvent, ItemReleaseUseAfterEvent, MemoryTier, PlayerInteractWithEntityBeforeEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { logcheck } from "../data/defaults"
import { badBlocksList, hackedItemsList, hackedItemsVanilla } from "../data/arrays"

let nukerMap = new Map()

/**Anti nuker, works by checking the number of blocks broken in a small timeframe
 * @param {PlayerBreakBlockBeforeEvent} evd 
 */
export function antiNuker(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    const player = evd.player

    const current = nukerMap.get(player.name) || 0

    if (d?.antinuker) {
        nukerMap.set(player.name, current + 1)

        if (current > 45) {
            evd.cancel = true
            log(`${player.name} -> anti-nuker`)
        }
    }

    if (d?.antinuker2) {
        const b = player.getBlockFromViewDirection()
        const l = evd.block.location
        if (b && b.block.isSolid && (b.block.location.x != l.x && b.block.location.y != l.y && b.block.location.z != l.z)) {
            evd.cancel = true
            log(`${player.name} -> anti-nuker 2`)
        }
    }
}

let placeMap = new Map()

/**Anti fast place, works by checking the number of blocks placed in a small timeframe
 * @param {PlayerPlaceBlockBeforeEvent} evd 
 */
export function antiFastPlace(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    const player = evd.player
    const block = evd.block

    const current = placeMap.get(player.name) || 0

    if (d?.antifastplace) {
        placeMap.set(player.name, current + 1)
        if (current > 20) {
            evd.cancel = true
            log(`${player.name} -> anti-fast-place`)
        }
    }

    if (d?.antiblockreach) {
        if (block.typeId === 'minecraft:scaffolding') return
        const bl = block.location
        const pl = player.location
        const distance = Math.sqrt(
            Math.pow(bl.x - pl.x, 2) +
            Math.pow(bl.y - pl.y, 2) +
            Math.pow(bl.z - pl.z, 2)
        )
        if (distance > 8.5) {
            log(`${player.name} -> anti-block-reach\nDistance: ${distance.toString()}`)
            evd.cancel = true
        }
    }

    if (d?.antiairplace) {
        if (!block.above() && !block.below() && !block.east() && !block.west() && !block.north() && !block.south()) {
            log(`${player.name} -> anti-air-place`)
        }
    }

    if (d?.antiscaffold && block.location.y <= player.location.y && player.getViewDirection().y > 0) {
        log(`${player.name} -> anti-scaffold`)
        evd.cancel = true
    }
}

/**Anti killaura, works by checking the number of clicks in a small timeframe
 * @param {EntityHitEntityAfterEvent} evd 
 */
export function antiCps(evd) {
    const player = evd.damagingEntity
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (player.typeId != 'minecraft:player') return

    const currentCPS = mcl.pGet(player, 'darkoak:ac:cps') || 0
    mcl.pSet(player, 'darkoak:ac:cps', currentCPS + 1)

    if (currentCPS > 15 && d?.antikillaura) {
        log(`${player.name} -> anti-killaura (${currentCPS})`)
    }
}

/**Anti reach
 * @param {EntityHitEntityAfterEvent} evd 
 */
export function antiReach(evd) {
    /**@type {Player} */
    const player = evd.damagingEntity
    if (player.typeId != 'minecraft:player') return
    const hit = evd.hitEntity

    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!d?.antireach) return

    const bl = hit.location
    const pl = player.location
    const distance = Math.sqrt(
        Math.pow(bl.x - pl.x, 2) +
        Math.pow(bl.y - pl.y, 2) +
        Math.pow(bl.z - pl.z, 2)
    )
    if (distance > 5.2) {
        log(`${player.name} -> anti-reach\nDistance: ${distance.toString()}`)
    }
}

/**
 * @param {Player} player 
 */
export function cpsTester(player) {
    if (system.currentTick % 20 == 0) return

    mcl.pSet(player, 'darkoak:ac:cps', 0)
    nukerMap.set(player.name, 0)
    placeMap.set(player.name, 0)
}

/**
 * @param {PlayerGameModeChangeBeforeEvent} evd 
 */
export function antiGameMode(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (!mcl.isDOBAdmin(evd.player) && d?.antigamemode) {
        evd.player.setGameMode(evd.fromGameMode)
        evd.cancel = true
    }
}

/**
 * 
 * @param {PlayerInteractWithEntityBeforeEvent} evd 
 */
export function antiNpc(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (d?.npcdetect && evd.target.typeId == 'minecraft:npc' && !mcl.isDOBAdmin(evd.player)) {
        log(`${evd.player.name} -> npc detected`)
        mcl.adminMessage(`${evd.player.name} -> npc detected`)
        evd.cancel = true
    }
}

// let tickerDupe = 0

// // antidupe, every tick applys a unique id to an item, and checks if 2 items have same id, doesnt id items held by admins in c-mode (for allowed duping)
// /**
//  * @param {Player} player 
//  */
// export function antiDupeID(player) {
//     if (tickerDupe < 1) {
//         tickerDupe++
//         return
//     }
//     tickerDupe = 0

//     const d = mcl.jsonWGet('darkoak:anticheat')
//     if (!d?.antidupe1) return

//     const item = mcl.getHeldItem(player)

//     if (!item || item.isStackable || player.getGameMode() === GameMode.Creative || item.typeId === '') return

//     const idCycle = mcl.wGet('darkoak:idsystem') || 0

//     let lore = item.getLore()
//     let hasID = lore.some(line => /\[.*?\]/.test(line))

//     if (!hasID) {
//         const newID = `[${idCycle + 1}]`
//         lore.push(newID)
//         let newItem = new ItemStack(item.type, 1)
//         newItem = item
//         newItem.setLore(lore)
//         mcl.getItemContainer(player).setItem(player.selectedSlotIndex, newItem)
//         mcl.wSet('darkoak:idsystem', idCycle + 1)
//         return
//     }

// }



/**
 * @param {Player} player 
 */
export function dupeIDChecker(player, d) {
    const inventory = mcl.getItemContainer(player)
    const idLog = new Set()


    for (let index = 0; index < inventory.size; index++) {
        const item = inventory.getItem(index)
        if (!item) continue

        // anti dupe
        if (d?.antidupe1) {
            // anti dupe id adder
            addID(player, item, inventory, index)


            // const content = item.getComponent(ItemComponentTypes.Inventory)
            // if (content) {
            //     const contents = content.container
            //     for (let findex = 0; index < contents.size; index++) {
            //         const fitem = contents.getItem(findex)
            //         if (!fitem) continue
            //         addID(player, fitem, contents, findex)
            //     }
            // }



            // anti dupe checker
            const lore = item.getLore() || []
            for (let index2 = 0; index2 < lore.length; index2++) {
                const match = lore[index2].match(/\[(\d+)\]/)

                if (match) {
                    const id = match[1]
                    if (idLog.has(id)) {
                        log(`${player.name} -> anti-dupe 1\nItem: ${item.typeId}, ID: ${id}`)
                        mcl.getItemContainer(player).setItem(index)
                    } else {
                        idLog.add(id)
                    }
                }
            }
        }

        // anti-nbt 1
        if (d?.antinbt) {
            const hv = hackedItemsVanilla
            if (hv.includes(item.typeId)) {
                log(`${player.name} -> anti-nbt 1: ${item.typeId}`)
                mcl.getItemContainer(player).setItem(index)
            }
        }

        // anti nbt 2
        if (d?.antinbt2) {
            const hil = hackedItemsList
            if (hil.includes(item.nameTag)) {
                log(`${player.name} -> anti-nbt 2: ${item.nameTag}`)
                mcl.getItemContainer(player).setItem(index)
            }
        }

        // anti admin items
        if (d?.antiadminitems && !mcl.isOp(player)) {
            const bbl = badBlocksList
            if (bbl.includes(item.typeId)) mcl.getItemContainer(player).setItem(index)
        }

        // anti illegal enchants
        if (d?.antiillegalenchant) {
            const en = item.getComponent("minecraft:enchantable")
            if (en) {
                const t = en.getEnchantments()
                for (let index3 = 0; index3 < t.length; index3++) {
                    if (t[index3].level <= 5) continue

                    log(`${player.name} -> anti-illegal-enchant: ${t[index3].type.id} ${t[index3].level}`)
                    let item2 = new ItemStack(item.type, item.amount)
                    item2.setLore(item.getLore())
                    mcl.getItemContainer(player).setItem(index, item2)
                }
            }
        }
    }
}

/**
 * @param {Player} player Player to add ID too
 * @param {ItemStack} item Item to add ID too
 * @param {Container} inventory Inventory of the player
 * @param {number} index Index of the item (here for performance)
 */
export function addID(player, item, inventory, index) {
    if (!item.isStackable && player.getGameMode() != GameMode.Creative) {
        let lore = item.getLore()
        let hasID = lore.some(line => /\[.*?\]/.test(line))
        if (!hasID) {
            const newID = `[${mcl.timeUuid()}]`
            lore.push(newID)
            let newItem = new ItemStack(item.type, 1)
            newItem = item
            newItem.setLore(lore)
            inventory.setItem(index, newItem)
        }
    }
}
// idea, stacks of 64 can have ids but if you make them not 64, removes the id; if two stacks have same id, log

/**system interval function, player type
 * @param {Player} player 
 */
export function anticheatMain(player) {
    const d = mcl.jsonWGet('darkoak:anticheat')

    const v = player.getVelocity()
    const vd = player.getViewDirection()
    const gm = player.getGameMode()
    const dot = v.x * vd.x + v.z * vd.z

    const ppl = mcl.jsonWGet('darkoak:fired') || []
    if (ppl.includes(player.name)) {
        player.setOnFire(10, false)
    }

    if (gm != GameMode.Creative && gm != GameMode.Spectator) {
        // anti fly 1
        if (player.isFlying && d?.antifly1) {
            log(`${player.name} -> anti-fly 1`)
        }

        // anti fly 2
        if (player.isFlying && d?.antifly2 && player.isGliding) {
            log(`${player.name} -> anti-fly 2`)
        }

        // anti fly 3
        if (d?.antifly3 && player.isGliding && v.y > 0.8 && v.x < 0.2 && v.z < 0.2 && vd.y < 1) {
            log(`${player.name} -> anti-fly 3`)
        }
    }

    // anti invalid movements 1
    if (d?.antiinvalid1 && player.isSneaking && player.isSprinting && !player.isFlying && !player.isInWater) {
        log(`${player.name} -> anti-invalid 1`)
    }

    // anti invalid movements 2
    if (d?.antiinvalid2 && player.isSprinting && player.isOnGround && dot < -0.3) {
        log(`${player.name} -> anti-invalid 2`)
    }

    // anti invalid movements 3
    if (d?.antiinvalid3 && player.isClimbing && v.y > 1) {
        log(`${player.name} -> anti-invalid 3`)
    }

    // anti speed 2
    if ((Math.abs(v.x) >= 10 || Math.abs(v.z) >= 10) && d?.antispeed1) {
        log(`${player.name} -> speed 2`)
        mcl.stopPlayer(player)
    }

    if (d?.antidupe2) {

    }

    const mil = 1000000
    if (d?.anticrasher2 && (Math.abs(player.location.x) > mil || Math.abs(player.location.z) > mil || Math.abs(player.location.y) > mil)) {
        const sl = player.getSpawnPoint()
        if (!player.kill()) player.teleport({
            x: sl.x,
            y: sl.y,
            z: sl.z
        }, {
            dimension: sl.dimension
        })
        log(`${player.name} -> anti-crasher 2`)
    }

    if (d?.antiinvalid4) {
        if (player.selectedSlotIndex > 8 || player.selectedSlotIndex < 0) player.selectedSlotIndex = 0
        if (system.currentTick % 100 === 0) {
            const mrd = player.clientSystemInfo
            if (mrd.maxRenderDistance < 1) log(`${player.name} -> anti-invalid 4, max-render-distance: ${mrd.maxRenderDistance.toString()}`)
            if (mrd.memoryTier < 0 || mrd.memoryTier > 4) log(`${player.name} -> anti-invalid 4, memory-tier: ${mrd.memoryTier}`)

        }
    }

    if (d?.antiphase && system.currentTick % (d?.antiphasesense || 10) === 0 && gm != GameMode.Spectator) {
        const block = player.dimension.getBlock(player.location)
        if (block.isSolid) mcl.knockback(player, v.x * -3, v.z * -3, v.y * -1)
    }
}

let bowSpam = new Map()
/**
 * @param {ItemReleaseUseAfterEvent} evd 
 */
export function antiBowSpam(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (evd?.itemStack?.typeId != 'minecraft:bow' || !d?.antibowspam) return
    const now = Date.now()

    const delay = now - (bowSpam.get(evd.source.name) || 0)

    if (delay < 200) {
        log(`${evd.source.name} -> anti-bowspam`)
    }
    bowSpam.set(evd.source.name, now)
}

/**
 * @param {EntityHitEntityAfterEvent} evd 
 */
export function antiVelocity(evd) {
    /**
     * @type {Player}
     */
    const player = evd.hitEntity
    if (player.typeId !== 'minecraft:player' || player.getGameMode() === GameMode.Creative) return
    const cl = player.location
    system.runTimeout(() => {
        const p = mcl.getPlayer(player.name)
        if (!p) return
        if (mcl.compareLocations(cl, p.location)) {

        }
    }, 2)
}

/**
 * @param {string} mess 
 */
export function log(mess) {
    let d = new Date()
    let data2 = mcl.jsonWGet(`darkoak:log`) || { logs: [{ message: 'placeholder' }] }
    data2.logs.push({ message: `${mess}\n[${d.getTime()}]` })
    const da = mcl.jsonWGet('darkoak:anticheat')
    if (da?.notify) {
        system.runTimeout(() => mcl.adminMessage(`Anticheat: ${mess}`))
    }
    mcl.jsonWSet(`darkoak:log`, data2)

    const player = mcl.getPlayer(mess.split('->').at(0).trim())
    if (player && da?.strike) {
        const current = mcl.pGet(player, 'darkoak:strikes') || 0
        mcl.pSet(player, 'darkoak:strikes', current + 1)
        if (current >= da?.strikeamount) {
            mcl.pSet(player, 'darkoak:strikes', 0)
            system.runTimeout(() => {
                try {
                    player.kill()
                } catch {

                }
            })
        }
    }
    logcheck()
}
