import { world, system, Player } from "@minecraft/server";
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { mcl } from "./logic";
import { worldProtectionBadItems } from "./data/arrays";

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
})

world.afterEvents.playerPlaceBlock.subscribe((evd) => {
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
            const l = block.location
            world.getDimension(evd.dimension.id).runCommandAsync(`fill ${l.x} ${l.y} ${l.z} ${l.x} ${l.y} ${l.z} air destroy`)
            evd.player.sendMessage('§cThis Land Is Protected!§r')
            return
        }

    }
})

world.beforeEvents.itemUseOn.subscribe((evd) => {
    if (mcl.isCreating(evd.source)) return
    if (!worldProtectionBadItems.includes(evd.itemStack.typeId)) return

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
            evd.source.sendMessage('§cThis Land Is Protected!§r')
            return
        }

    }
})