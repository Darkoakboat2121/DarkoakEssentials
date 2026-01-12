import { world, system, DataDrivenEntityTriggerAfterEvent } from "@minecraft/server"
import { mcl } from "../logic"

/**
 * @param {DataDrivenEntityTriggerAfterEvent} evd 
 */
export function debugLog(evd) {
    const d = mcl.jsonWGet('darkoak:debug')

    let toSearch = d?.filter
    if (!toSearch || toSearch === 'none') toSearch = evd.eventId
    if (evd.eventId === toSearch) {
        mcl.debugLog(`DebugDetect(${toSearch || 'NONE'})`, `Type: ${evd?.entity?.typeId}, Name?: ${evd?.entity?.name || 'No Name'}`)
    }
}