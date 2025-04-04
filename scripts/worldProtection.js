import { world, system, Player } from "@minecraft/server";
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { mcl } from "./logic";
import { worldProtectionBadItems, worldProtectionWater } from "./data/arrays";

world.beforeEvents.explosion.subscribe((evd) => {
    for (const place of mcl.listGetValues('darkoak:protection:')) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
         */
        const area = JSON.parse(place)

        for (const block of evd.getImpactedBlocks()) {
            const x = block.location.x
            const z = block.location.z

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

    for (const place of mcl.listGetValues('darkoak:landclaim:')) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }, players: ['', '']}}
         */
        const area = JSON.parse(place)

        for (const block of evd.getImpactedBlocks()) {
            const x = block.location.x
            const z = block.location.z

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
})

world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    if (mcl.isCreating(evd.player)) return
    for (const place of mcl.listGetValues('darkoak:protection:')) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
         */
        const area = JSON.parse(place)

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

    for (const place of mcl.listGetValues('darkoak:landclaim:')) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
         */
        const area = JSON.parse(place)

        const block = evd.block

        const x = block.location.x
        const z = block.location.z

        const minX = Math.min(area.p1.x, area.p2.x)
        const maxX = Math.max(area.p1.x, area.p2.x)
        const minZ = Math.min(area.p1.z, area.p2.z)
        const maxZ = Math.max(area.p1.z, area.p2.z)

        if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
            for (const player of area.players) {
                if (evd.player.name === player) return
            }
            evd.cancel = true
            evd.player.sendMessage('§cThis Land Is Protected!§r')
            return
        }

    }
})

world.beforeEvents.playerPlaceBlock.subscribe((evd) => {
    if (mcl.isCreating(evd.player)) return
    for (const place of mcl.listGetValues('darkoak:protection:')) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
         */
        const area = JSON.parse(place)

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

    for (const place of mcl.listGetValues('darkoak:landclaim:')) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }}}
         */
        const area = JSON.parse(place)

        const block = evd.block

        const x = block.location.x
        const z = block.location.z

        const minX = Math.min(area.p1.x, area.p2.x)
        const maxX = Math.max(area.p1.x, area.p2.x)
        const minZ = Math.min(area.p1.z, area.p2.z)
        const maxZ = Math.max(area.p1.z, area.p2.z)

        if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
            for (const player of area.players) {
                if (evd.player.name === player) return
            }
            evd.cancel = true
            evd.player.sendMessage('§cThis Land Is Protected!§r')
            return
        }

    }
})

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

system.runInterval(() => {
    const d = mcl.jsonWGet('darkoak:worldprotection')
    for (const player of world.getPlayers({ excludeTags: ['darkoak:admin'] })) {
        const item = mcl.getHeldItem(player)
        if (d.water) {
            for (const i of worldProtectionWater) {
                if (!item || !item.typeId) continue
                if (item.typeId === i) {
                    mcl.getItemContainer(player).setItem(player.selectedSlotIndex)
                    continue
                }
            }
        }

        if (d.pearls && item && item.typeId && item.typeId === 'minecraft:ender_pearl') {
            mcl.getItemContainer(player).setItem(player.selectedSlotIndex)
        }

        if (d.boats) {
            for (const boat of mcl.getEntityByTypeId('minecraft:boat', player.dimension)) {
                boat.kill()
            }
        }
    }
}, 10)