import { Block, Entity, EntityComponentTypes, Player, PlayerJoinAfterEvent, PlayerLeaveBeforeEvent, system, world } from "@minecraft/server"
import { mcl } from "../logic"
import { messageMap, spammerMap } from "../chat"
import { jumpMap } from "../enchanting"
import { cooldown } from "../main"
import { combatMap, lightingMap, magicMap, sitMap } from "../entityHandlers/players"
import { antiAutoMap, bowSpam, nukerMap, placeMap, strikeMap } from "../world/anticheat"
import { undoMap } from "../world/worldEdit"

/**
 * @param {Player[]} players 
 */
export function cleanMapsAndSets(players) {
    if (!mcl.tickTimer(2400)) return
    const names = players.map(e => e.name)

    let mapsArray = [messageMap, spammerMap, jumpMap, cooldown, sitMap, magicMap, combatMap, lightingMap, nukerMap, placeMap, antiAutoMap, bowSpam, strikeMap, undoMap]
    mcl.arraySpreader3(mapsArray, 120, ((e, i) => {
        for (const key of e.keys()) {
            if (!names.includes(key)) {
                e.delete(key)
            }
        }
    }))
    // for (let index = 0; index < mapsArray.length; index++) {
    //     const map = mapsArray[index]
    //     for (const key of map.keys()) {
    //         if (!names.includes(key)) {
    //             map.delete(key)
    //         }
    //     }
    // }
}