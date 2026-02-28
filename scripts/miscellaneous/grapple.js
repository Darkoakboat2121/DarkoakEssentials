import { world, system, BlockComponentTypes, Player, EntityComponentTypes, ItemUseAfterEvent } from "@minecraft/server"
import { mcl } from "../logic"

export let leashMap = new Map()

/**
 * @param {ItemUseAfterEvent} evd 
 */
export function grapple(evd) {
    if (evd.itemStack.typeId != 'darkoak:grapple_hook') return false
    const sp = evd.source.getBlockFromViewDirection({ maxDistance: 100 })?.block
    if (!sp) return false
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
}