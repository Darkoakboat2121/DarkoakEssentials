import { world, system, BlockComponentTypes, Player, EntityComponentTypes, ItemUseAfterEvent } from "@minecraft/server"
import { mcl } from "../logic"

export let leashMap = new Map()

/**
 * @param {ItemUseAfterEvent} evd 
 */
export function grapple(evd) {
    const sp = evd.source.getBlockFromViewDirection({ maxDistance: 100 })?.block
    if (!sp) return false
    
    if (evd.itemStack.typeId === 'darkoak:grapple_hook') {
        if (leashMap.get(evd.source.name) === true) return false

        const point = evd.source.dimension.spawnEntity('darkoak:floating_text', sp.location)

        evd.source.triggerEvent('darkoak:grapple')

        const l = evd.source.getComponent(EntityComponentTypes.Leashable)
        l.leashTo(point)
        leashMap.set(evd.source.name, true)


        const r = system.runInterval(() => {
            if (point?.isValid && (!l?.isLeashed || evd?.source?.isSneaking)) {
                point.remove()
                leashMap.delete(evd?.source?.name)
                //evd.source.triggerEvent('darkoak:grapplefalse')
                system.clearRun(r)
            }
        })



        function getGrapplePoint() {
            const entities = evd.source.getEntities({ type: 'darkoak:floating_text' })
            let distances = entities.map(e => ({
                e,
                distance: mcl.distance(e.location, loc)
            }))
            distances.sort((a, b) => a?.distance - b?.distance)

            distances.map(e => e.e)[0]
        }
    } else if (evd.itemStack.typeId === 'darkoak:grapple_hook2') {
        const l = evd.source.location
        let diff = {
            x: (sp.x - l.x) / 2,
            y: (sp.y - l.y) / 2,
            z: (sp.z - l.z) / 2,
        }
        const max = 1.5
        for (let value in diff) {
            let g = diff[value]
            if (g > max) diff[value] = max
            if (g < -max) diff[value] = -max
            
        }
        console.error(JSON.stringify(diff))

        evd.source.applyImpulse(diff)

    } else return false
}