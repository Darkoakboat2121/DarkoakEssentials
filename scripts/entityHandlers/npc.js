import { world, Player } from "@minecraft/server"
import { mcl } from "../logic"
import { log } from "../world/anticheat"

export function npcHandler() {
    const npcs = mcl.getAllEntities('minecraft:npc')

    for (let index = 0; index < npcs.length; index++) {
        const npc = npcs[index]
        const data = JSON.parse(npc.getDynamicProperty('darkoak:npc'))
        if (!data?.allowed) {
            const player = mcl.getNearestPlayer(npc.dimension, npc.location)
            log(player ?? { name: 'EMPTY' }, `npc at ${mcl.stringToLoc(npc.location, false)}`)
            npc.remove()
        }
    }
}