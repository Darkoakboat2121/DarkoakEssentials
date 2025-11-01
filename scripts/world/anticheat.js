import { world, system, Container, ItemEnchantableComponent, ItemStack, Player, PlayerPlaceBlockBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerGameModeChangeBeforeEvent, GameMode, EntityComponentTypes, ItemComponentTypes, EntityHitEntityAfterEvent, ItemReleaseUseAfterEvent, MemoryTier, PlayerInteractWithEntityBeforeEvent, EffectTypes, InputPermissionCategory, EquipmentSlot, PlayerJoinAfterEvent, CommandPermissionLevel } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { badBlocksList, hackedItemsList, hackedItemsVanilla } from "../data/arrays"
import { transferPlayer } from "@minecraft/server-admin"

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

        if (current > (d?.antinukersense || 40)) {
            evd.cancel = true
            log(player, `anti-nuker (${current})`)
        }
    }

    if (d?.antinuker2) {
        const b = player.getBlockFromViewDirection({ maxDistance: 10 })
        const l = evd.block.location
        if (b && b?.block && b.block.isSolid && (b.block.location.x != l.x && b.block.location.y != l.y && b.block.location.z != l.z)) {
            evd.cancel = true
            log(player, `anti-nuker 2`)
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
        if (current > (d?.antifastplacesense || 15)) {
            evd.cancel = true
            log(player, `anti-fast-place (${current})`)
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
            log(player, `anti-block-reach\nDistance: ${distance.toString()}`)
            evd.cancel = true
        }
    }

    if (d?.antiairplace) {
        if (!block.above() && !block.below() && !block.east() && !block.west() && !block.north() && !block.south()) {
            log(player, `anti-air-place`)
        }
    }

    if (d?.antiscaffold && block.location.y <= player.location.y && player.getViewDirection().y > 0) {
        log(player, `anti-scaffold`)
        evd.cancel = true
    }
}

let antiAutoMap = new Map()
/**Anti killaura, works by checking the number of clicks in a small timeframe
 * @param {EntityHitEntityAfterEvent} evd 
 */
export function antiCps(evd) {
    /**@type {Player} */
    const player = evd.damagingEntity
    if (player.typeId != 'minecraft:player') return
    const d = mcl.jsonWGet('darkoak:anticheat')

    const currentCPS = mcl.pGet(player, 'darkoak:ac:cps') || 0
    mcl.pSet(player, 'darkoak:ac:cps', currentCPS + 1)

    if (currentCPS > (d?.antikillaurasense || 15) && d?.antikillaura) {
        log(player, `anti-killaura (${currentCPS})`)
    }

    if (d?.antiautoclicker) {
        const now = Date.now()
        let times = antiAutoMap.get(player.name) || []
        times.push(now)

        if (times.length > 4) times = times.slice(-4)
        antiAutoMap.set(player.name, times)

        if (times.length === 4) {
            const interval1 = times[1] - times[0]
            const interval2 = times[2] - times[1]
            const interval3 = times[3] - times[2]

            let sensitivity = d?.antiautoclickersense || 2
            if (Math.abs(interval1 - interval2) < sensitivity && Math.abs(interval2 - interval3) < sensitivity) {
                log(player, `anti-auto-clicker`)
            }
        }
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
    if (distance > ((d?.antireachsense || 7.5) / 10)) {
        log(player, `anti-reach\nDistance: ${distance.toString()}`)
    }
}

/**
 * @param {Player} player 
 */
export function cpsTester(player) {
    if (system.currentTick % 20 != 0) return

    mcl.pSet(player, 'darkoak:ac:cps', 0)
    nukerMap.set(player.name, 0)
    placeMap.set(player.name, 0)
}

/**
 * @param {PlayerGameModeChangeBeforeEvent} evd 
 */
export function antiGameMode(evd) {
    // const d = mcl.jsonWGet('darkoak:anticheat')
    // if (!mcl.isDOBAdmin(evd.player) && d?.antigamemode) {
    //     system.runTimeout(() => {
    //         evd.player.setGameMode(evd.fromGameMode)
    //     })
    //     evd.cancel = true
    // }
}

/**
 * 
 * @param {PlayerInteractWithEntityBeforeEvent} evd 
 */
export function antiNpc(evd) {
    const d = mcl.jsonWGet('darkoak:anticheat')
    if (d?.npcdetect && evd.target.typeId == 'minecraft:npc' && !mcl.isDOBAdmin(evd.player)) {
        log(evd.player, `npc detected`)
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
    const equiped = player.getComponent(EntityComponentTypes.Equippable)


    for (let index = 0; index < inventory.size; index++) {
        const item = inventory.getItem(index)
        if (!item) continue

        // anti dupe
        if (d?.antidupe1) {
            // anti dupe id adder
            addID(player, item, inventory, index)
            stackARID(player, item, inventory, index, d)

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
                const match = lore[index2].match(/\[R(\d+)T(\d+)\]/)
                if (match) {
                    const id = match[0]
                    if (idLog.has(id)) {
                        log(player, `anti-dupe 1\nItem: ${item.typeId}, ID: ${id}`)
                        if (d?.antidupeclear) mcl.getItemContainer(player).setItem(index)
                    } else {
                        idLog.add(id)
                    }
                }
                const matchOld = lore[index2].match(/\[(\d+)\]/)
                if (matchOld) {
                    const id = matchOld[1]
                    if (idLog.has(id)) {
                        log(player, `anti-dupe 1\nItem: ${item.typeId}, ID: ${id}`)
                        if (d?.antidupeclear) mcl.getItemContainer(player).setItem(index)
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
                log(player, `anti-nbt 1: ${item.typeId}`)
                mcl.getItemContainer(player).setItem(index)
            }
        }

        // anti nbt 2
        if (d?.antinbt2) {
            const hil = hackedItemsList
            if (hil.includes(item.nameTag)) {
                log(player, `anti-nbt 2: ${item.nameTag}`)
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

                    log(player, `anti-illegal-enchant: ${t[index3].type.id} ${t[index3].level}`)
                    let item2 = new ItemStack(item.type, item.amount)
                    item2.setLore(item.getLore())
                    mcl.getItemContainer(player).setItem(index, item2)
                }
            }
        }

    }

    const gm = player.getGameMode()
    if (gm != GameMode.creative && gm != GameMode.spectator) {
        if (d?.antifly4 && player.isGliding && equiped?.getEquipment(EquipmentSlot.Chest)?.typeId != 'minecraft:elytra') {
            log(player, `anti-fly 4`)
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
    let lore = item.getLore()
    let hasID = lore.some(line => /\[.*?\]/.test(line))
    if (!item.isStackable && player.getGameMode() != GameMode.creative) {
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

/**stacks of maxamount can have ids but if you make them not maxamount, removes the id; if two stacks have same id, log
 * @param {Player} player Player to add ID too
 * @param {ItemStack} item Item to add ID too
 * @param {Container} inventory Inventory of the player
 * @param {number} index Index of the item (here for performance)
 */
export function stackARID(player, item, inventory, index, d) {
    if (item.amount === item.maxAmount && player.getGameMode() != GameMode.Creative && d?.antidupe2) {
        let lore = item.getLore()
        let hasID = lore.some(line => /\[.*?\]/.test(line))
        if (!hasID) {
            const newID = `[${mcl.timeUuid()}]`
            lore.push(newID)
            let newItem = new ItemStack(item.type, item.amount)
            newItem = item
            newItem.setLore(lore)
            inventory.setItem(index, newItem)
        }
    } else if (item.amount < item.maxAmount && item.getLore().length > 0) {
        let newItem = new ItemStack(item.type, item.amount)
        newItem = item
        newItem.setLore([''])
        inventory.setItem(index, newItem)
    }
}

/**system interval function, player type
 * @param {Player} player 
 */
export function anticheatMain(player) {
    const d = mcl.jsonWGet('darkoak:anticheat')

    const v = player.getVelocity()
    const vd = player.getViewDirection()
    const gm = player.getGameMode()
    const dot = v.x * vd.x + v.z * vd.z

    const op = world.getAllPlayers().filter(e => e.commandPermissionLevel === CommandPermissionLevel.Admin)[0]

    const ppl = mcl.jsonWGet('darkoak:fired') || []
    if (ppl.includes(player.name)) {
        player.setOnFire(10, false)
    }

    if (gm != GameMode.Creative && gm != GameMode.Spectator) {
        // anti fly 1
        if (player.isFlying && d?.antifly1) {
            log(player, `anti-fly 1`)
        }

        // anti fly 2
        if (player.isFlying && d?.antifly2 && player.isGliding) {
            log(player, `anti-fly 2`)
        }

        // anti fly 3
        if (d?.antifly3 && player.isGliding && v.y > 0.8 && v.x < 0.2 && v.z < 0.2 && vd.y < 1) {
            log(player, `anti-fly 3`)
        }

        // anti air jump
        // fix, 9 blocks underneath have to be not air - P
        if (d?.antiairjump) {
            const loc = player.location
            const block = player.dimension.getBlock({
                x: loc.x,
                y: loc.y - 1,
                z: loc.z,
            })
            if (block && block.typeId === 'minecraft:air') {
                let allAir = 0
                const blocksToCheck = [block.below(1), block.below(2), block.west(1).below(1), block.east(1).below(1), block.north(1).below(1), block.south(1).below(1)]
                for (let index = 0; index < blocksToCheck.length; index++) {
                    const b = blocksToCheck[index]
                    if (!b) continue
                    if (b.typeId === 'minecraft:air') allAir += 1
                }

                if (player.isOnGround && allAir >= 6) {
                    log(player, `anti-air-jump`)
                }
            }
        }

        // anti no web
        // if (false) {
        //     const block = player.dimension.getBlock(player.location)

        // }
    }

    // anti invalid movements 1
    if (d?.antiinvalid1 && player.isSneaking && player.isSprinting && !player.isFlying && !player.isInWater) {
        log(player, `anti-invalid 1`)
    }

    // anti invalid movements 2
    if (d?.antiinvalid2 && player.isSprinting && player.isOnGround && dot < -0.3) {
        log(player, `anti-invalid 2`)
    }

    // anti invalid movements 3
    if (d?.antiinvalid3 && player.isClimbing && v.y > (d?.antiinvalid3sense || 1)) {
        log(player, `anti-invalid 3`)
    }


    if (d?.antiantiimmobile && (
        (!player.inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Sneak) && player.isSneaking) ||
        (!player.inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Jump) && player.isJumping)
    )) {
        log(player, `anti-anti-immobile`)
    }

    if (d?.antiairswim && player.isSwimming) {
        const block = player.dimension.getBlock(player.location)
        if (!block.isLiquid) log(player, `anti-air-swim`)
    }

    // anti speed 1
    const antispeedmax = d?.antispeedsense || 20
    if ((Math.abs(v.x) >= antispeedmax || Math.abs(v.z) >= antispeedmax) && d?.antispeed) {
        if (player.getEffect(EffectTypes.get('minecraft:speed'))) return
        log(player, `speed (X${Math.abs(v.x)}-Z${Math.abs(v.z)})`)
        mcl.stopPlayer(player)
    }

    const mil = 1000000
    if (d?.anticrasher2) {
        let crasherLog = false
        const loc = player.location
        const nameFL = player.name
        let copy = player
        if (isNaN(loc.x) || isNaN(loc.y) || isNaN(loc.z)) {
            transferPlayer(player, { hostname: '127.0.0.0', port: 0 })
            crasherLog = true
        }
        if (Math.abs(loc.x) > mil || Math.abs(loc.z) > mil || Math.abs(loc.y) > mil) {
            transferPlayer(player, { hostname: '127.0.0.0', port: 0 })
            crasherLog = true
        }
        if (crasherLog) log(copy, `anti-crasher 2`)
    }

    if (d?.antiinvalid4) {
        if (player.selectedSlotIndex > 8 || player.selectedSlotIndex < 0) player.selectedSlotIndex = 0
        if (system.currentTick % 100 === 0) {
            const mrd = player.clientSystemInfo
            if (mrd.maxRenderDistance < 1) log(player, `anti-invalid 4, max-render-distance: ${mrd.maxRenderDistance.toString()}`)
            if (mrd.memoryTier < 0 || mrd.memoryTier > 4) log(player, `anti-invalid 4, memory-tier: ${mrd.memoryTier.toString()}`)

        }
        if (vd.x > 1 || vd.x < -1 || vd.y > 1 || vd.y < -1 || vd.z > 1 || vd.z < -1) player.teleport(player.location, {
            facingLocation: player.location,
            keepVelocity: true
        })
    }

    if (d?.antiphase && system.currentTick % (d?.antiphasesense || 10) === 0 && gm != GameMode.Spectator) {
        const block = player.dimension.getBlock(player.location)
        if (block.isSolid) mcl.knockback(player, v.x * -3, v.z * -3, v.y * -1)
    }

    if (d?.antizd && player.name.length < 1) {
        mcl.kick(player, 'ANTI-ZD 1, Please Report If This Is A Bug!')
        mcl.softKick(player)
        log(player, `anti-ZD`)
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
        log(evd.source, `anti-bowspam`)
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
 * @param {object} d 
 */
export function antiZDInterval(d) {
    if (!d?.antizd) return
    const entities = world.getDimension('overworld').getEntities({
        excludeTypes: ['minecraft:player']
    })
    for (let index = 0; index < entities.length; index++) {
        const entity = entities[index]
        
    }
}

let strikeMap = new Map()

/**
 * @param {Player} player 
 * @param {string} mess 
 */
export function log(player, message) {
    // let d = new Date()
    // let data2 = mcl.jsonWGet(`darkoak:log`) || { logs: [{ message: 'placeholder' }] }
    // data2.logs.push({ message: `${mess}\n[${d.getTime()}]` })
    // const da = mcl.jsonWGet('darkoak:anticheat')
    // if (da?.notify) {
    //     system.runTimeout(() => mcl.adminMessage(`Anticheat: ${mess}`))
    // }
    // mcl.jsonWSet(`darkoak:log`, data2)

    // const player = mcl.getPlayer(mess.split('->').at(0).trim())
    // if (player && da?.strike) {
    //     const current = strikeMap.get(player.name) || 0
    //     strikeMap.set(player.name, current + 1)
    //     if (current >= (da?.strikeamount || 5)) {
    //         strikeMap.set(player.name, 0)
    //         system.runTimeout(() => {
    //             try {
    //                 player.applyDamage(da?.strikedamage || 20)
    //             } catch {

    //             }
    //         })
    //     }
    // }
    // logcheck()

    /**@type {{name: string, message: string, time: number}[]} */
    let logs = mcl.jsonWGet('darkoak:anticheatlogs:v2') || [{name: 'Default', message: 'Default', time: Date.now()}]
    while (logs.length > 500) {
        logs.shift()
    }
    let name = player?.name || player?.nameTag || 'EMPTY'
    logs.push({
        name: name,
        message: message,
        time: Date.now()
    })
    mcl.jsonWSet('darkoak:anticheatlogs:v2', logs)

    const da = mcl.jsonWGet('darkoak:anticheat')
    if (da?.notify) {
        system.runTimeout(() => mcl.adminMessage(`Anticheat: ${player.name} -> ${message}`))
    }
    if (da?.strike) {
        const current = strikeMap.get(player.name) || 0
        strikeMap.set(player.name, current + 1)
        if (current >= (da?.strikeamount || 5)) {
            strikeMap.set(player.name, 0)
            system.runTimeout(() => {
                try {
                    player.applyDamage(da?.strikedamage || 20)
                } catch {

                }
            })
        }
    }
}
