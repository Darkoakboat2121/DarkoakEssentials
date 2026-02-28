import { world, system, Player, GameMode, ItemStack, ItemUseAfterEvent, PlayerInteractWithBlockBeforeEvent, Entity, ScriptEventCommandMessageAfterEvent, PlayerJoinAfterEvent, PlayerSpawnAfterEvent, StartupEvent, CommandPermissionLevel, CustomCommandParamType, StructureSaveMode, EntityComponentTypes, CustomCommandStatus, CustomCommandError, CustomCommandSource, ItemComponentTypes, BlockComponentTypes, EquipmentSlot, ChatSendBeforeEvent, ChatSendAfterEvent, BlockExplodeAfterEvent } from "@minecraft/server"
import { MessageFormData, ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

/**
 * @param {ChatSendBeforeEvent | ChatSendAfterEvent | BlockExplodeAfterEvent} evd 
 */
export function sendData(evd) {
    return
    const nameC = evd?.constructor?.name
    switch (nameC) {
        case 'BlockExplodeAfterEvent':
            sendEvent({
                f: evd.block,
                
            })
            break
        case 'ButtonPushAfterEvent':
            // handle buttonPush
            break
        case 'ChatSendAfterEvent':
            // handle chatSend
            break
        case 'DataDrivenEntityTriggerAfterEvent':
            // handle dataDrivenEntityTrigger
            break
        case 'EffectAddAfterEvent':
            // handle effectAdd
            break
        case 'EntityDieAfterEvent':
            // handle entityDie
            break
        case 'EntityHealAfterEvent':
            // handle entityHeal
            break
        case 'EntityHealthChangedAfterEvent':
            // handle entityHealthChanged
            break
        case 'EntityHitBlockAfterEvent':
            // handle entityHitBlock
            break
        case 'EntityHitEntityAfterEvent':
            // handle entityHitEntity
            break
        case 'EntityHurtAfterEvent':
            // handle entityHurt
            break
        case 'EntityItemDropAfterEvent':
            // handle entityItemDrop
            break
        case 'EntityItemPickupAfterEvent':
            // handle entityItemPickup
            break
        case 'EntityLoadAfterEvent':
            // handle entityLoad
            break
        case 'EntityRemoveAfterEvent':
            // handle entityRemove
            break
        case 'EntitySpawnAfterEvent':
            // handle entitySpawn
            break
        case 'ExplosionAfterEvent':
            // handle explosion
            break
        case 'GameRuleChangeAfterEvent':
            // handle gameRuleChange
            break
        case 'ItemCompleteUseAfterEvent':
            // handle itemCompleteUse
            break
        case 'ItemReleaseUseAfterEvent':
            // handle itemReleaseUse
            break
        case 'ItemStartUseAfterEvent':
            // handle itemStartUse
            break
        case 'ItemStartUseOnAfterEvent':
            // handle itemStartUseOn
            break
        case 'ItemStopUseAfterEvent':
            // handle itemStopUse
            break
        case 'ItemStopUseOnAfterEvent':
            // handle itemStopUseOn
            break
        case 'ItemUseAfterEvent':
            // handle itemUse
            break
        case 'LeverActionAfterEvent':
            // handle leverAction
            break
        case 'ServerMessageAfterEvent':
            // handle messageReceive
            break
        case 'PackSettingChangeAfterEvent':
            // handle packSettingChange
            break
        case 'PistonActivateAfterEvent':
            // handle pistonActivate
            break
        case 'PlayerBreakBlockAfterEvent':
            // handle playerBreakBlock
            break
        case 'PlayerButtonInputAfterEvent':
            // handle playerButtonInput
            break
        case 'PlayerDimensionChangeAfterEvent':
            // handle playerDimensionChange
            break
        case 'PlayerEmoteAfterEvent':
            // handle playerEmote
            break
        case 'PlayerGameModeChangeAfterEvent':
            // handle playerGameModeChange
            break
        case 'PlayerHotbarSelectedSlotChangeAfterEvent':
            // handle playerHotbarSelectedSlotChange
            break
        case 'PlayerInputModeChangeAfterEvent':
            // handle playerInputModeChange
            break
        case 'PlayerInputPermissionCategoryChangeAfterEvent':
            // handle playerInputPermissionCategoryChange
            break
        case 'PlayerInteractWithBlockAfterEvent':
            // handle playerInteractWithBlock
            break
        case 'PlayerInteractWithEntityAfterEvent':
            // handle playerInteractWithEntity
            break
        case 'PlayerInventoryItemChangeAfterEvent':
            // handle playerInventoryItemChange
            break
        case 'PlayerJoinAfterEvent':
            // handle playerJoin
            break
        case 'PlayerLeaveAfterEvent':
            // handle playerLeave
            break
        case 'PlayerPlaceBlockAfterEvent':
            // handle playerPlaceBlock
            break
        case 'PlayerSpawnAfterEvent':
            // handle playerSpawn
            break
        case 'PlayerSwingStartAfterEvent':
            // handle playerSwingStart
            break
        case 'PlayerUseNameTagAfterEvent':
            // handle playerUseNameTag
            break
        case 'PressurePlatePopAfterEvent':
            // handle pressurePlatePop
            break
        case 'PressurePlatePushAfterEvent':
            // handle pressurePlatePush
            break
        case 'ProjectileHitBlockAfterEvent':
            // handle projectileHitBlock
            break
        case 'ProjectileHitEntityAfterEvent':
            // handle projectileHitEntity
            break
        case 'TargetBlockHitAfterEvent':
            // handle targetBlockHit
            break
        case 'TripWireTripAfterEvent':
            // handle tripWireTrip
            break
        case 'WeatherChangeAfterEvent':
            // handle weatherChange
            break
        case 'WorldLoadAfterEvent':
            // handle worldLoad
            break
        default:
            //console.error(nameC)
            break
    }

    /**
     * @param {object} e 
     */
    function sendEvent(e) {
        //system.sendScriptEvent(`darkoakplugins:${nameC}`, JSON.stringify(e))
    }
}