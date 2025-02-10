import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { isCreating, isOp, wGet } from "./logic"

world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    if (isCreating(evd.player) === false) {
        switch(wGet('darkoak:cws:breakblocks')) {
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
    if (isCreating(evd.player) === false) {
        switch(wGet('darkoak:cws:interactwithblocks')) {
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