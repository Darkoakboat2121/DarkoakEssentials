import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

world.beforeEvents.explosion.subscribe((evd) => {
    let places = mcl.listGetValues('darkoak:landclaim:')
    for (let index = 0; index < places.length; index++) {
        /**
         * @type {{ p1: { x: number, z: number }, p2: { x: number, z: number }, players: ['', '']}}
         */
        const area = JSON.parse(places[index])

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
            evd.cancel = true
            evd.player.sendMessage(`§cThis Land Is Owned By ${area.owner}§r`)
            return
        }

    }
})

world.beforeEvents.playerPlaceBlock.subscribe((evd) => {
    if (mcl.isCreating(evd.player)) return

    let places = mcl.listGetValues('darkoak:landclaim:')
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
            for (let index = 0; index < area.players.length; index++) {
                if (evd.player.name === area.players[index]) return
            }
            evd.cancel = true
            evd.player.sendMessage(`§cThis Land Is Owned By ${area.owner}§r`)
            return
        }

    }
})