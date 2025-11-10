import { world, Player, PlayerInteractWithEntityBeforeEvent, ItemStack } from "@minecraft/server"
import { mcl } from "../logic"


/**
 * @param {PlayerInteractWithEntityBeforeEvent} evd 
 */
export function invSeeLocker(evd) {
    const invSeer = evd.target
    const player = evd.player
    if (invSeer.typeId != 'darkoak:inv_accessor') return
    const set = JSON.parse(invSeer.getDynamicProperty('darkoak:invsee'))
    if (!set) {
        console.log('DEBUG: Invalid invseer (no property)')
        invSeer.remove()
        return
    }
    if (set?.allowed != player.name) evd.cancel = true
}

const invHistoryMap = new Map()
const playerHistoryMap = new Map()

export function invSeeLinker() {
    if (mcl.tickTimer(2)) return
    const invSeers = mcl.getAllEntities('darkoak:inv_accessor')

    for (let index = 0; index < invSeers.length; index++) {
        const invseer = invSeers[index]
        const set = JSON.parse(invseer.getDynamicProperty('darkoak:invsee'))
        if (!set) continue

        const allowed = mcl.getPlayer(set?.allowed)
        if ((mcl.distance(invseer.location, allowed?.location) || 2) > 1.7) {
            invseer.remove()
            allowed?.sendMessage('§aClosed Invsee!§r')
            continue
        }
        const player = mcl.getPlayer(set?.target)
        if (!player) continue

        const invseerContainer = mcl.getItemContainer(invseer)
        const playerContainer = mcl.getItemContainer(player)

        let invHistory = invHistoryMap.get(invseer.id) || Array(invseerContainer.size).fill(undefined);
        let playerHistory = playerHistoryMap.get(player.name) || Array(playerContainer.size).fill(undefined);


        for (let slot = 0; slot < invseerContainer.size; slot++) {
            const playerSlot = slot + 9
            const invItem = invseerContainer.getItem(slot)
            const playerItem = playerContainer.getItem(playerSlot)

            if (!itemsEqual(playerItem, playerHistory[playerSlot])) {
                invseerContainer.setItem(slot, playerItem)
                invHistory[slot] = playerItem
            } else if (!itemsEqual(invItem, invHistory[slot])) {
                playerContainer.setItem(playerSlot, invItem)
                playerHistory[playerSlot] = invItem
            }

            invHistory[slot] = invseerContainer.getItem(slot)
            playerHistory[playerSlot] = playerContainer.getItem(playerSlot)
        }

        invHistoryMap.set(invseer.id, invHistory)
        playerHistoryMap.set(player.name, playerHistory)
    }
}

/**
 * @param {ItemStack} a 
 * @param {ItemStack} b 
 */
function itemsEqual(a, b) {
    if (!a && !b) return true
    if (!a || !b) return false
    return a.typeId === b.typeId && a.amount === b.amount && a.nameTag === b.nameTag
}