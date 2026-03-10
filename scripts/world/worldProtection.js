import { world, system, Player, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, ExplosionBeforeEvent, PlayerInteractWithBlockBeforeEvent, PlayerInteractWithEntityBeforeEvent, BlockTypes } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { allPlacerBuckets, worldProtectionBadItems, worldProtectionWater } from "../data/arrays"
import { antiFastPlace } from "./anticheat"



/**
 * @param {PlayerBreakBlockBeforeEvent | PlayerPlaceBlockBeforeEvent | PlayerInteractWithBlockBeforeEvent} evd 
 */
export function placeBreakProtection(evd) {
    if (mcl.isCreating(evd.player)) return
    let places = mcl.listGetValues('darkoak:protection:')
    for (let index = 0; index < places.length; index++) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }, break: boolean, build: boolean, interactblocks: boolean}}
         */
        const area = JSON.parse(places[index])

        const block = evd.block

        const x = block.location.x
        const z = block.location.z

        if (mcl.locationInside({
            x: x,
            z: z,
        }, area?.p1, area?.p2)) {

            if ((evd instanceof PlayerBreakBlockBeforeEvent)) {
                const blocks = mcl.listGetValues('darkoak:gen:')
                for (let ind = 0; ind < blocks.length; ind++) {
                    const b = JSON.parse(blocks[ind])
                    const parts1 = b?.coords?.split(' ')
                    const coords1 = {
                        x: parseInt(parts1[0]),
                        y: parseInt(parts1[1]),
                        z: parseInt(parts1[2]),
                    }
                    const parts2 = b?.coords2?.split(' ')
                    const coords2 = {
                        x: parseInt(parts2[0]),
                        y: parseInt(parts2[1]),
                        z: parseInt(parts2[2]),
                    }
                    const minX = Math.min(coords1.x, coords2.x)
                    const maxX = Math.max(coords1.x, coords2.x)
                    const minY = Math.min(coords1.y, coords2.y)
                    const maxY = Math.max(coords1.y, coords2.y)
                    const minZ = Math.min(coords1.z, coords2.z)
                    const maxZ = Math.max(coords1.z, coords2.z)
                    if (
                        block.x >= minX && block.x <= maxX &&
                        block.y >= minY && block.y <= maxY &&
                        block.z >= minZ && block.z <= maxZ
                    ) {
                        return
                    }
                }
            }

            const isInteract = (evd instanceof PlayerInteractWithBlockBeforeEvent)
            const isPlacing = (evd instanceof PlayerPlaceBlockBeforeEvent)
            // if thing to "interact" is water or lava bucket, 

            const allowed = mcl.allowCheck(block)
            if ((evd instanceof PlayerBreakBlockBeforeEvent)) {
                if (area?.break || (area?.breakallow && allowed)) return
                cancelEvent()
                return
            }
            if (isPlacing) {
                if (area?.build || (area?.buildallow && allowed)) return
                cancelEvent()
                return
                // const ploc = evd.player.location
                // //if (Math.floor(ploc.x) === evd.block.x && Math.floor(ploc.y - 1) === evd.block.y && Math.floor(ploc.z) === evd.block.z) 
                // 
            }
            if (isInteract) {
                if (!(area?.build || (area?.buildallow && allowed)) && allPlacerBuckets.includes(evd?.itemStack?.typeId)) {
                    cancelEvent()
                    return
                }
                if (area?.interactblocks || (area?.interactblocksallow && allowed)) return
                if (evd?.itemStack && BlockTypes.get(evd?.itemStack.typeId)) {
                    return
                }
                cancelEvent()
                return
            }
            function cancelEvent() {
                if (isInteract) {
                    if (evd.isFirstEvent) evd.player.sendMessage('§cThis Land Is Protected!§r')
                } else {
                    evd.player.sendMessage('§cThis Land Is Protected!§r')
                }
                evd.cancel = true
            }
        }
    }
}

/**
 * @param {PlayerBreakBlockBeforeEvent | PlayerPlaceBlockBeforeEvent | PlayerInteractWithBlockBeforeEvent} evd 
 */
export function placeBreakLandclaim(evd) {
    if (mcl.isCreating(evd.player)) return

    let places = mcl.listGetValues('darkoak:landclaim:')
    if (!places || places?.length === 0) return
    for (let index = 0; index < places.length; index++) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }, owner: "dark", players: ["", ""]}}
         */
        const area = JSON.parse(places[index])
        if (evd.player.name === area.owner || area.players.includes(evd.player.name)) continue

        const block = evd.block

        const x = block.location.x
        const z = block.location.z

        if (mcl.locationInside({
            x: x,
            z: z,
        }, area.p1, area.p2)) {
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

            if (mcl.locationInside({
                x: x,
                z: z
            }, area.p1, area.p2)) {
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
        if (mcl.compareLocations(loc, { x: parts.x, y: parts.y, z: parts.z })) {
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
        if (d?.tp) {
            const loc = player.getSpawnPoint()
            player.teleport({ x: loc.x, y: loc.y, z: loc.z }, {
                dimension: world.getDimension('minecraft:overworld')
            })
        } else {
            player?.kill()
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
    const isCreating = mcl.isCreating(player)
    const item = mcl.getHeldItem(player)

    const d = mcl.jsonWGet('darkoak:worldprotection')

    if (item && !isCreating) {
        const contain = mcl.getItemContainer(player)
        if (d?.water) {
            const wpw = worldProtectionWater
            if (wpw.includes(item.typeId)) contain.setItem(player.selectedSlotIndex)
        }

        if (d?.pearls && item.typeId === 'minecraft:ender_pearl') {
            contain.setItem(player.selectedSlotIndex)
        }

        if (d?.pistons && item.typeId === 'minecraft:piston' || item.typeId === 'minecraft:sticky_piston') {
            contain.setItem(player.selectedSlotIndex)
        }
    }

    if (d?.boats) {
        let boats = mcl.getEntityByTypeId('minecraft:boat', player.dimension).concat(mcl.getEntityByTypeId('minecraft:chest_boat', player.dimension))
        for (let index = 0; index < boats.length; index++) {
            boats[index].kill()
        }
    }

    if (d?.dragons) {
        let dragons = mcl.getEntityByTypeId('minecraft:ender_dragon', player.dimension)
        for (let index = 0; index < dragons.length; index++) {
            dragons[index].remove()
        }
    }
    if (d?.withers) {
        let ents = mcl.getEntityByTypeId('minecraft:wither', player.dimension)
        for (let index = 0; index < ents.length; index++) {
            ents[index].remove()
        }
    }
    if (d?.cmdbm) {
        let ents = mcl.getEntityByTypeId('minecraft:command_block_minecart', player.dimension)
        for (let index = 0; index < ents.length; index++) {
            ents[index].remove()
        }
    }


    /**@type {{type: string}[]} */
    const bans = mcl.jsonWGet('darkoak:banneditems') || []
    if (bans.length > 0 && !isCreating) {
        for (let index = 0; index < bans.length; index++) {
            const b = bans[index]
            player.runCommand(`clear @s ${b?.type || 'minecraft:air'}`)
        }
    }
}
