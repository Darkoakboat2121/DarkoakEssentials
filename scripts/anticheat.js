import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"



// Anti nuker, works by checking the number of blocks broken in a small timeframe
world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    const player = evd.player
    if (player.getDynamicProperty('darkoak:ac:blocksbroken') === undefined) {
        player.setDynamicProperty('darkoak:ac:blocksbroken', 0)
    }
    player.setDynamicProperty('darkoak:ac:blocksbroken', player.getDynamicProperty('darkoak:ac:blocksbroken') + 1)

    system.runTimeout(() => {
        if (player.getDynamicProperty('darkoak:ac:blocksbroken') > 5) {
            world.sendMessage(`${player.name} triggered anti-nuker`)
            evd.cancel = true
        }

        player.setDynamicProperty('darkoak:ac:blocksbroken', 0)
    }, 5)
})

// Anti fast place, works by checking the number of blocks placed in a small timeframe
world.afterEvents.playerPlaceBlock.subscribe((evd) => {
    const player = evd.player
    if (player.getDynamicProperty('darkoak:ac:blocksplaced') === undefined) {
        player.setDynamicProperty('darkoak:ac:blocksplaced', 0)
    }
    player.setDynamicProperty('darkoak:ac:blocksplaced', player.getDynamicProperty('darkoak:ac:blocksplaced') + 1)

    system.runTimeout(() => {
        if (player.getDynamicProperty('darkoak:ac:blocksplaced') > 5) {
            world.sendMessage(`${player.name} triggered anti-fast-place`)
        }

        player.setDynamicProperty('darkoak:ac:blocksplaced', 0)
    }, 5)
})

