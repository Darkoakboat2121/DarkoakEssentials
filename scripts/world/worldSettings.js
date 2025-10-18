import { world, system, EntityDamageCause, Player, PlayerSpawnAfterEvent, PlayerBreakBlockAfterEvent, PlayerBreakBlockBeforeEvent, PlayerInteractWithBlockAfterEvent, PlayerInteractWithBlockBeforeEvent, PlayerLeaveAfterEvent, PlayerLeaveBeforeEvent, ItemReleaseUseAfterEvent, ItemUseAfterEvent, EntityHitEntityAfterEvent, PlayerPlaceBlockBeforeEvent } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData, uiManager } from "@minecraft/server-ui"
import * as arrays from "../data/arrays"
import { mcl } from "../logic"
import { bui } from "../uis/baseplateUI"
import { transferPlayer } from "@minecraft/server-admin"

// This file holds world settings and player tracking

/**
 * @param {PlayerBreakBlockBeforeEvent} evd 
 */
export function worldSettingsBreak(evd) {

    if (evd.player.getGameMode() != "creative") {
        let blocks = mcl.listGetValues('darkoak:cws:unbreakableBlocks')
        for (let index = 0; index < blocks.length; index++) {
            if (evd.block.typeId === blocks[index]) {
                evd.cancel = true
                return
            }
        }
    }

    const d = mcl.jsonWGet('darkoak:cws')
    if (!mcl.isCreating(evd.player)) {
        const loc = evd.block.location
        if (mcl.allowCheck(evd.block)) return
        if (d?.breakblocks) {
            evd.cancel = true
            return
        }
        if (d?.breakitemframes && (evd.block.typeId == 'minecraft:frame' || evd.block.typeId == 'minecraft:glow_frame')) {
            evd.cancel = true
            return
        }
        if (d?.breakregen) {
            const cType = evd.block.type
            system.runTimeout(() => {
                evd.block.setType(cType)
                const pl = evd.player.location
                const bl = evd.block.location
                if (Math.floor(pl.x) === Math.floor(bl.x) && Math.floor(pl.y) === Math.floor(bl.y) && Math.floor(pl.z) === Math.floor(bl.z)) {
                    evd.player.runCommand('tp @s ~ ~1 ~')
                }
            }, d?.breakregenrate * 20)
        }
    }
}

/**
 * @param {PlayerPlaceBlockBeforeEvent} evd 
 */
export function worldSettingsBuild(evd) {
    const d = mcl.jsonWGet('darkoak:cws')
    if (!mcl.isCreating(evd.player)) {
        const loc = evd.block.location
        if (mcl.allowCheck(evd.block)) return
        if (d?.builddecay) {
            system.runTimeout(() => {
                if (d?.buildreturn) evd.player.runCommand(`give @s ${evd.block.typeId} 1`)
                evd.block.setType('minecraft:air')
            }, d?.builddecayrate * 20)
        }
    }
}

/**
 * 
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 * @returns 
 */
export function worldSettingsInteract(evd) {
    
    if (!mcl.isCreating(evd.player)) {
        const d = mcl.jsonWGet('darkoak:cws')
        const loc = evd.block.location
        if (mcl.allowCheck(evd.block)) return
        if (d?.interactwithblocks) {
            evd.cancel = true
            return
        }
        if (d?.interactwithitemframes && (evd.block.typeId == 'minecraft:frame' || evd.block.typeId == 'minecraft:glow_frame')) {
            evd.cancel = true
            return
        }
        if (d?.interactwithenderchests && evd.block.typeId == 'minecraft:ender_chest') {
            evd.cancel = true
            return
        }
        if (d?.interactwithsigns && evd.block.typeId.endsWith('_sign')) {
            evd.cancel = true
            return
        }
        if (d?.interactwithlogs && evd.block.typeId.endsWith('_log')) {
            evd.cancel = true
            return
        }
        if (d?.interactwithgrass && evd.block.typeId == 'minecraft:grass_block') {
            evd.cancel = true
            return
        }
    }
}

export function worldSettingsEntityInteract(evd) {
    if (!mcl.isCreating(evd.player)) {
        const d = mcl.jsonWGet('darkoak:cws')
        if (d?.interactwithentities) {
            evd.cancel = true
            return
        }
        if (d?.interactwithvillagers && evd.entity.typeId == 'minecraft:villager_v2') {
            evd.cancel = true
            return
        }
    }
}

/**
 * @param {PlayerBreakBlockAfterEvent} evd 
 */
export function signFixer(evd) {
    const block = evd.block
    if (mcl.wGet('darkoak:cws:breakblocks') == 3) {
        if (block.typeId == 'minecraft:sign') {
            const sign = mcl.jsonWGet('darkoak:signrestore')
            mcl.rewriteSign(block, sign.waxed, sign.text, sign.color)
        }
    }
}

export function interactCommand(evd) {
    const command = evd.target.getDynamicProperty('darkoak:interactcommand')
    if (command) {
        system.runTimeout(() => {
            evd.player.runCommand(command)
        })
    }
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
export function interactCommandBlock(evd) {
    if (!evd.isFirstEvent) return
    const defaults = mcl.listGetValues('darkoak:blockinteractcommand:')
    const loc = evd.block.location
    for (let index = 0; index < defaults.length; index++) {
        const p = JSON.parse(defaults[index])
        if (mcl.compareLocations(loc, p.coords)) {
            system.runTimeout(() => {
                try {
                    evd.player.runCommand(arrays.replacer(evd.player, p.command))
                } catch {

                }
            })
            return
        }
    }
}

/**
 * @param {PlayerSpawnAfterEvent | PlayerLeaveBeforeEvent} evd 
 */
export function welcomeMessage(evd) {
    /**@type {{welcome: string, welcomeS: boolean, bye: string, byeS: string}} */
    const d = mcl.jsonWGet('darkoak:welcome')
    if (!d) return
    if (evd instanceof PlayerSpawnAfterEvent) {
        if (!evd.initialSpawn) return
        system.runTimeout(() => {
            if (d?.welcomeS) {
                world.sendMessage(arrays.replacer(evd.player, d?.welcome || ''))
            } else {
                evd.player.sendMessage(arrays.replacer(evd.player, d?.welcome || ''))
            }
        }, 100)
    } else {
        if (d?.byeS) {
            world.sendMessage(arrays.replacer(evd.player, d?.bye || ''))
        } else {
            evd.player.sendMessage(arrays.replacer(evd.player, d?.bye || ''))
        }
    }
}

/**Player tracking and world border
 * @param {Player} player 
 */
export function borderAndTracking(player, worldBorder, track) {
    

    const x = player.location.x
    const z = player.location.z

    tracking(player, track || {
        flying: false,
        gliding: false,
        climbing: false,
        emoting: false,
        falling: false,
        inwater: false,
        jumping: false,
        onground: false
    })

    // World border
    if (worldBorder != 0) {

        if (Math.abs(x) > worldBorder) {
            const k = (x / worldBorder - 1) * -1
            player.applyDamage(Math.abs(k) * 1.5, { cause: EntityDamageCause.magic })
            // player.applyKnockback(k, 0, Math.abs(k) * 2, 0)
            player.applyKnockback({ x: k * Math.abs(k / 2.5), z: 0 }, 0)
        }

        if (Math.abs(z) > worldBorder) {
            const k = (z / worldBorder - 1) * -1
            player.applyDamage(Math.abs(k) * 1.5, { cause: EntityDamageCause.magic })
            // player.applyKnockback(0, k, Math.abs(k) * 2, 0)
            player.applyKnockback({ x: 0, z: k * Math.abs(k / 2.5) }, 0)
        }

    }
}

/**Don't recommend touching lol, hehe ima touch it
 * @param {Player} player 
 * @param {Object} d 
 */
function tracking(player, d) {

    const objectKeys = arrays.trackingKeysObject
    const playerKeys = arrays.trackingKeysPlayer
    for (let index = 0; index < objectKeys.length; index++) {
        const oKey = objectKeys[index]
        const pKey = playerKeys[index]

        if (d[oKey] && player[pKey]) {
            player.addTag(`darkoak:${oKey}`)
            const keyC = d[`${oKey}C`]
            if (keyC) player.runCommand(arrays.replacer(player, keyC))
        } else {
            player.removeTag(`darkoak:${oKey}`)
        }
    }
}

/**
 * @param {ItemReleaseUseAfterEvent} evd 
 */
export function pacifistArrowFix(evd) {
    if (!evd.itemStack) return
    if (evd.itemStack.typeId != 'minecraft:bow' || evd.itemStack.typeId != 'minecraft:crossbow') return
    const tags = ['darkoak:pacifist', 'darkoak:team1', 'darkoak:team2', 'darkoak:team3', 'darkoak:team4']
    for (let index = 0; index < tags.length; index++) {
        if (evd.source.hasTag(tags[index])) evd.source.runCommand(`tag @e [type=arrow,r=0.5,c=1] add ${tags[index]}`)
    }
}

/**
 * @param {ItemUseAfterEvent} evd 
 */
export function bindedItems(evd) {
    const item = mcl.jsonWGet(`darkoak:bind:${evd.itemStack.typeId}`)
    if (!item) return
    if (item?.command1) {
        system.runTimeout(() => {
            evd.source.runCommand(arrays.replacer(evd.source, item?.command1))
        })
    }
}


/**
 * @param {Player} player 
 */
export function verify(player, old = '') {
    if (system.currentTick % 2 != 0) return

    const d = mcl.jsonWGet('darkoak:whitelist')
    if (player.hasTag('darkoak:verified') || !d?.venabled) return
    if (mcl.isDOBAdmin(player)) {
        player.addTag('darkoak:verified')
        return
    }

    let f = new ModalFormData()
    bui.title(f, 'Verify')

    bui.label(f, 'You Must Verify To Join This Server')
    bui.label(f, `Hint: ${d?.vhint}`)

    bui.textField(f, 'Code:', 'Example: password', old)
    bui.toggle(f, 'Leave?', false)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        if (e[0] === arrays.replacer(player, d?.vcode)) {
            player.addTag('darkoak:verified')
            uiManager.closeAllForms(player)
        }
        if (e[1]) transferPlayer(player, { hostname: '127.0.0.0', port: 0 })
    }).catch()
}

/**
 * @param {PlayerBreakBlockAfterEvent} evd 
 */
export function autoPickup(evd) {
    const d = mcl.jsonWGet('darkoak:community:general')
    if (!d?.autopickup) return

    const l = evd.block.location
    evd.player.runCommand(`tp @e [type=item,x=${l.x},y=${l.y},z=${l.z},dx=0,dy=0,dz=0] ~ ~ ~`)
}

/**
 * @param {EntityHitEntityAfterEvent} evd 
 */
export function smiteDataEditor(evd) {
    const player = evd.damagingEntity
    if (player.typeId === 'minecraft:player' && mcl.getHeldItem(player)?.typeId === 'darkoak:data_editor') {
        evd.hitEntity.kill()
    }
}