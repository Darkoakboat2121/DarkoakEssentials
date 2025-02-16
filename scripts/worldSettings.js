import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "./logic"

// This file holds world settings and player tracking

world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    if (mcl.isCreating(evd.player) === false) {
        switch(mcl.wGet('darkoak:cws:breakblocks')) {
            case 2:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame')) {
                    evd.cancel = true
                }
                break
            
            case 3:
                evd.cancel = true
                break
        }
    }
})

world.beforeEvents.playerInteractWithBlock.subscribe((evd) => {
    if (mcl.isCreating(evd.player) === false) {
        switch(mcl.wGet('darkoak:cws:interactwithblocks')) {
            case 2:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame')) {
                    evd.cancel = true
                }
                break
            case 3:
                if (evd.block.matches('minecraft:ender_chest')) {
                    evd.cancel = true
                }
                break
            case 4:
                if (evd.block.matches('minecraft:frame') || evd.block.matches('minecraft:glow_frame') || evd.block.matches('minecraft:ender_chest')) {
                    evd.cancel = true
                }
                break
            case 5:
                evd.cancel = true
                break
        }
    }
})

world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
    
})



// Player tracking

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {

        if (mcl.wGet('darkoak:track:flying') && player.isFlying) {
            player.addTag('darkoak:flying')
        } else {
            player.removeTag('darkoak:flying')
        }

        if (mcl.wGet('darkoak:track:gliding') && player.isGliding) {
            player.addTag('darkoak:gliding')
        } else {
            player.removeTag('darkoak:gliding')
        }
    }
})