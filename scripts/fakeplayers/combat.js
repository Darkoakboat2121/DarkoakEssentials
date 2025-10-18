import { world, system } from "@minecraft/server"
import { mcl } from "../logic"
import { SimulatedPlayer } from "@minecraft/server-gametest"


const combatDistance = 5
/**
 * @param {SimulatedPlayer} player Simulated player
 */
export function combatManager(player) {
    if (!(player instanceof SimulatedPlayer)) return
    const set = mcl.jsonPGet(player, 'darkoak:sim')
    if (!set) return

    const loc = player.location

    let target
    if (set.target === 'closest') {
        target = mcl.closestPlayer(loc, player.dimension.id, player.name)
    } else {
        target = mcl.getPlayer(set.target)
    }

    if (target) {

        const tloc = target.location

        const distance = Math.sqrt(
            Math.pow(tloc.x - loc.x, 2) +
            Math.pow(tloc.y - loc.y, 2) +
            Math.pow(tloc.z - loc.z, 2)
        )

        if (set.type === 'combat') {
            if (distance > (combatDistance / 2) && mcl.tickTimer(20)) player.navigateToLocation(tloc)
            if (distance <= combatDistance) {
                player.attackEntity(target)
                player.lookAtEntity(target)
            }
        }

        if (set.type === 'follow' && mcl.tickTimer(40) && distance > 3) player.navigateToEntity(target)
    }

    if (set.type === 'jump' && mcl.tickTimer(set.interval)) player.jump()
    
    if (set.respawn === 'true') player.respawn()
}