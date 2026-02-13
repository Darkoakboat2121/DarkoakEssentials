import { world, system } from "@minecraft/server"
import { mcl } from "../logic"

export function lagClear() {
    const d = mcl.jsonWGet('darkoak:lagclear')
    if (!d?.enabled) return

    if (d?.xpcleaner && mcl.tickTimer(2)) {
        const xps = mcl.getAllEntities('minecraft:xp_orb')
        for (let index = 0; index < xps.length; index++) {
            const xp = xps[index]
            const p = mcl.getNearestPlayer(xp.dimension, xp.location)
            if (p) xp.teleport(p.location, {
                dimension: xp.dimension
            })
        }
    }

    if (d?.itemmoving && mcl.tickTimer(20)) {
        const items = mcl.getAllEntities('minecraft:item')
        mcl.arraySpreader(items, 20, (item, index) => {
            if (item && item.isValid) {
                const p = mcl.getNearestPlayer(item?.dimension, item?.location)
                if (p) {
                    //const dot = p.location.x * item.location.x + p.location.z * item.location.z
                    const diff = {
                        x: clamp(p.location.x - item.location.x),
                        z: clamp(p.location.z - item.location.z),
                    }
                    item.applyImpulse({
                        x: diff.x,
                        y: 0.0,
                        z: diff.z,
                    })
                }
            }
        })
        // for (let index = 0; index < items.length; index++) {
        //     const item = items[index]
        //     const p = mcl.getNearestPlayer(item.dimension, item.location)
        //     if (!p) continue
        //     //const dot = p.location.x * item.location.x + p.location.z * item.location.z
        //     const diff = {
        //         x: clamp(p.location.x - item.location.x),
        //         z: clamp(p.location.z - item.location.z),
        //     }
        //     item.applyImpulse({
        //         x: diff.x,
        //         y: 0.0,
        //         z: diff.z,
        //     })
        // }
    }
}

function clamp(n) {
    if (n > 0.5) return 0.5
    if (n < -0.5) return -0.5
    return 0
}