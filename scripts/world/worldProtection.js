import { world, system, Player, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, ExplosionBeforeEvent, PlayerInteractWithBlockBeforeEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { worldProtectionBadItems, worldProtectionWater } from "../data/arrays"
import { antiFastPlace } from "./anticheat"



/**
 * @param {PlayerBreakBlockBeforeEvent | PlayerPlaceBlockBeforeEvent} evd 
 */
export function placeBreakProtection(evd) {
    if (mcl.isCreating(evd.player)) return
    let places = mcl.listGetValues('darkoak:protection:')
    for (let index = 0; index < places.length; index++) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
         */
        const area = JSON.parse(places[index])

        const block = evd.block

        const x = block.location.x
        const z = block.location.z

        const minX = Math.min(area.p1.x, area.p2.x)
        const maxX = Math.max(area.p1.x, area.p2.x)
        const minZ = Math.min(area.p1.z, area.p2.z)
        const maxZ = Math.max(area.p1.z, area.p2.z)

        if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
            evd.cancel = true
            evd.player.sendMessage('§cThis Land Is Protected!§r')
            return
        }
    }
}

/**
 * @param {PlayerBreakBlockBeforeEvent | PlayerPlaceBlockBeforeEvent | PlayerInteractWithBlockBeforeEvent} evd 
 */
export function placeBreakLandclaim(evd) {
    if (mcl.isCreating(evd.player)) return

    let places = mcl.listGetValues('darkoak:landclaim:')
    for (let index = 0; index < places.length; index++) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }, owner: "dark", players: ["", ""]}}
         */
        const area = JSON.parse(places[index])

        const block = evd.block

        const x = block.location.x
        const z = block.location.z

        const minX = Math.min(area.p1.x, area.p2.x)
        const maxX = Math.max(area.p1.x, area.p2.x)
        const minZ = Math.min(area.p1.z, area.p2.z)
        const maxZ = Math.max(area.p1.z, area.p2.z)

        if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
            for (let index = 0; index < area.players.length; index++) {
                if (evd.player.name === area.players[index]) return
            }
            if (evd.player.name === area.owner) return
            evd.cancel = true
            evd.player.sendMessage(`§cThis Land Is Owned By ${area.owner}§r`)
            return
        }

    }
}


/**
 * @param {ExplosionBeforeEvent} evd 
 */
export function explosionProtectionLandclaim(evd) {
    let places = mcl.listGetValues('darkoak:protection:')
    let blocks = evd.getImpactedBlocks()
    for (let index = 0; index < places.length; index++) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
         */
        const area = JSON.parse(places[index])

        for (let index = 0; index < blocks.length; index++) {
            const x = blocks[index].location.x
            const z = blocks[index].location.z

            const minX = Math.min(area.p1.x, area.p2.x)
            const maxX = Math.max(area.p1.x, area.p2.x)
            const minZ = Math.min(area.p1.z, area.p2.z)
            const maxZ = Math.max(area.p1.z, area.p2.z)

            if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
                evd.cancel = true
                return
            }
        }
    }

    let places2 = mcl.listGetValues('darkoak:landclaim:')
    for (let index = 0; index < places2.length; index++) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }, players: ['', '']}}
         */
        const area = JSON.parse(places2[index])

        for (let index = 0; index < blocks.length; index++) {
            const x = blocks[index].location.x
            const z = blocks[index].location.z

            const minX = Math.min(area.p1.x, area.p2.x)
            const maxX = Math.max(area.p1.x, area.p2.x)
            const minZ = Math.min(area.p1.z, area.p2.z)
            const maxZ = Math.max(area.p1.z, area.p2.z)

            if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
                evd.cancel = true
                return
            }
        }
    }
}

/**
 * @param {PlayerBreakBlockBeforeEvent} evd 
 */
export function lockedChestProtection(evd) {
    const locks = mcl.listGetBoth('darkoak:chestlock:')
    for (let index = 0; index < locks.length; index++) {
        const parts = JSON.parse(locks[index].value)
        const loc = evd.block.location
        if (loc.x.toString() === parts.x && loc.y.toString() === parts.y && loc.z.toString() === parts.z) {
            if (evd.player.name != parts.player) {
                evd.cancel = true
                return
            } else {
                mcl.wRemove(locks[index].id)
                evd.player.sendMessage('§aChest Lock Removed§r')
            }
        }
    }
}

/**
 * @param {Player} player 
 */
export function dimensionBan(player) {
    if (mcl.isDOBAdmin(player)) return
    const d = mcl.jsonWGet('darkoak:dimensionbans')

    if ((d?.nether && player.dimension.id == 'minecraft:nether') || (d?.end && player.dimension.id == 'minecraft:the_end')) {
        try {
            player.kill()
        } catch {
            const loc = player.getSpawnPoint()
            player.teleport({x: loc.x, y: loc.y, z: loc.z}, {
                dimension: world.getDimension('minecraft:overworld')
            })
        }
    }
}

// world.beforeEvents.itemUse.subscribe((evd) => {
//     if (mcl.isCreating(evd.source)) return
//     if (!worldProtectionBadItems.includes(evd.itemStack.typeId)) return

//     for (const place of mcl.listGetValues('darkoak:protection:')) {
//         /**
//          * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
//          */
//         const area = JSON.parse(place)

//         const block = evd.block

//         const x = block.location.x
//         const z = block.location.z

//         const minX = Math.min(area.p1.x, area.p2.x)
//         const maxX = Math.max(area.p1.x, area.p2.x)
//         const minZ = Math.min(area.p1.z, area.p2.z)
//         const maxZ = Math.max(area.p1.z, area.p2.z)

//         if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
//             evd.cancel = true
//             evd.source.sendMessage('§cThis Land Is Protected!§r')
//             return
//         }

//     }
// })


/**
 * @param {Player} player 
 */
export function worldProtectionOther(player) {
    if (mcl.isCreating(player)) return
    const d = mcl.jsonWGet('darkoak:worldprotection')
    const item = mcl.getHeldItem(player)
    if (d.water) {
        const wpw = worldProtectionWater
        for (let index = 0; index < wpw.length; index++) {
            if (!item) continue
            if (item.typeId === wpw[index]) {
                mcl.getItemContainer(player).setItem(player.selectedSlotIndex)
                continue
            }
        }
    }

    if (d.pearls && item && item.typeId === 'minecraft:ender_pearl') {
        mcl.getItemContainer(player).setItem(player.selectedSlotIndex)
    }

    if (d.boats) {
        const boats = mcl.getEntityByTypeId('minecraft:boat', player.dimension)
        for (let index = 0; index < boats.length; index++) {
            boats[index].kill()
        }
    }
}