// first is minecraft resources
import { world, system, Player, GameMode, ItemStack, ItemUseAfterEvent, PlayerInteractWithBlockBeforeEvent, Entity, ScriptEventCommandMessageAfterEvent, PlayerJoinAfterEvent, PlayerSpawnAfterEvent, StartupEvent, CommandPermissionLevel, CustomCommandParamType, StructureSaveMode, EntityComponentTypes, CustomCommandStatus, CustomCommandError, CustomCommandSource, ItemComponentTypes } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData, uiManager } from "@minecraft/server-ui"
import { transferPlayer } from "@minecraft/server-admin"
import { getPlayerSkin, SimulatedPlayer, spawnSimulatedPlayer } from "@minecraft/server-gametest"

// second initializing mcl module
import { mcl } from "./logic"

// third is setting defaults
import { timers, defaultData, cd, updateData, playerDataLogger } from "./data/defaults" // defaults finally has a use lets gooooo
import * as arrays from "./data/arrays"

// fourth initialize the interfaces
import * as interfaces from "./uis/interfaces"
import * as interfacesTwo from "./uis/interfacesTwo"

// fifth initialize chat
import * as chat from "./chat"

// sixth initialize world based things
import * as anticheat from "./world/anticheat"
import * as worldSettings from "./world/worldSettings"
import * as worldProtection from "./world/worldProtection"
import * as worldEdit from "./world/worldEdit"
import * as roles from "./world/roles"

import { combatManager, fakePlayerCommand } from "./entityHandlers/fakeplayers"
import { scoreboardHandler } from "./entityHandlers/floatingtext"
import { invSeeLinker, invSeeLocker } from "./entityHandlers/invAccessor"
import { magicItem, magicSlotter, sitCheck } from "./entityHandlers/players"

// seventh set up external uis / commands
import * as external from "./external/external"
import { customEnchantActions, customEnchantEvents, enchantOnDamaged, enchantOnDeathKill, enchantOnHit, enchantOnJump, enchantOnUse } from "./enchanting"
import { bui } from "./uis/baseplateUI"

let act = 0

const cooldown = new Map()
// main ui opener, see interfaces, also manages bindable/dummy items
world.afterEvents.itemUse.subscribe((evd) => {
    itemOpeners(evd)
    enchantOnUse(evd, cd.get('darkoak:scriptsettings'))
    worldSettings.bindedItems(evd)
    magicItem(evd)

    // system.sendScriptEvent('darkoak:afteritemuse', JSON.stringify({
    //     itemStack: evd.itemStack,
    //     source: evd.source
    // }))
})

// anticps and onhitenchants
world.afterEvents.entityHitEntity.subscribe((evd) => {
    anticheat.antiCps(evd)
    enchantOnHit(evd, cd.get('darkoak:scriptsettings'))
    worldSettings.smiteDataEditor(evd)
    anticheat.antiVelocity(evd)
    anticheat.antiReach(evd)

    // system.sendScriptEvent('darkoak:afterentityhitentity', JSON.stringify({
    //     damagingEntity: evd.damagingEntity,
    //     hitEntity: evd.hitEntity
    // }))
})

// on spawn community giver and welcome message and queue message system
world.afterEvents.playerSpawn.subscribe((evd) => {
    communityGiver(evd)
    worldSettings.welcomeMessage(evd)
    chat.messageQueueAndPlayerList(evd)
    moneySetter(evd)
    chat.logJoinsLeaves(evd)

    // system.sendScriptEvent('darkoak:afterplayerspawn', JSON.stringify({
    //     initialSpawn: evd.initialSpawn,
    //     player: mcl.playerToData(evd.player)
    // }))
})

world.afterEvents.playerInteractWithBlock.subscribe((evd) => {
    
})

// chest lock, world interact settings, landclaims, data editor, data editor block
world.beforeEvents.playerInteractWithBlock.subscribe((evd) => {
    chestLock(evd)
    worldSettings.worldSettingsInteract(evd)
    worldProtection.placeBreakLandclaim(evd)
    dataEditorBlock(evd)
    worldSettings.interactCommandBlock(evd)
    worldEdit.WEselector(evd)
    worldSettings.cratesOpener(evd)

    // system.runTimeout(() => {
    //     system.sendScriptEvent('darkoak:beforeplayerinteractwithblock', JSON.stringify({
    //         block: evd.block,
    //         blockFace: evd.blockFace,
    //         faceLocation: evd.faceLocation,
    //         isFirstEvent: evd.isFirstEvent,
    //         itemStack: evd.itemStack,
    //         player: evd.player
    //     }))
    // })
})

// antinpc, dataeditorentity, and on interact commands
world.beforeEvents.playerInteractWithEntity.subscribe((evd) => {
    anticheat.antiNpc(evd)
    dataEditor(evd)
    worldSettings.interactCommand(evd)
    invSeeLocker(evd)

    // system.sendScriptEvent('darkoak:beforeplayerinteractwithentity', JSON.stringify({
    //     itemStack: evd.itemStack,
    //     player: evd.player,
    //     target: evd.target
    // }))
})

// Entity hurt
world.afterEvents.entityHurt.subscribe((evd) => {
    enchantOnDamaged(evd, mcl.jsonWGet('darkoak:scriptsettings'))

    // system.sendScriptEvent('darkoak:afterentityhurt', JSON.stringify({
    //     damage: evd.damage,
    //     damageSource: evd.damageSource,
    //     hurtEntity: evd.hurtEntity
    // }))
})

world.afterEvents.projectileHitEntity.subscribe((evd) => {

})

// Entity Die
world.afterEvents.entityDie.subscribe((evd) => {
    enchantOnDeathKill(evd, cd.get('darkoak:scriptsettings'))

    // system.sendScriptEvent('darkoak:afterentitydie', JSON.stringify({
    //     damageSource: evd.damageSource,
    //     deadEntity: evd.deadEntity
    // }))
})

// Player Chat send
world.beforeEvents.chatSend.subscribe((evd) => {
    chat.chatSystem(evd, evd.sender, evd.message)

    // system.runTimeout(() => {
    //     system.sendScriptEvent('darkoak:beforechatsend', JSON.stringify({
    //         message: evd.message,
    //         sender: mcl.playerToData(evd.sender),
    //         targets: evd.targets
    //     }))
    // })
})

// Player break block
world.afterEvents.playerBreakBlock.subscribe((evd) => {
    worldSettings.breakBlockTracking(evd)
    worldSettings.signFixer(evd)
    worldSettings.autoPickup(evd)

    // system.sendScriptEvent('darkoak:afterplayerbreakblock', JSON.stringify({
    //     block: evd.block,
    //     brokenBlockPermutation: evd.brokenBlockPermutation,
    //     dimension: evd.dimension,
    //     itemStackAfterBreak: evd.itemStackAfterBreak,
    //     itemStackBeforeBreak: evd.itemStackBeforeBreak,
    //     player: evd.player
    // }))
})

// worldSettingsBreak, antiNuker, lockedchestprotection
world.beforeEvents.playerBreakBlock.subscribe((evd) => {
    worldSettings.worldSettingsBreak(evd)
    worldProtection.placeBreakProtection(evd)
    worldProtection.placeBreakLandclaim(evd)
    anticheat.antiNuker(evd)
    worldProtection.lockedChestProtection(evd)
    roles.roleBreak(evd)

    // system.runTimeout(() => {
    //     system.sendScriptEvent('darkoak:beforeplayerbreakblock', JSON.stringify({
    //         block: evd.block,
    //         dimension: evd.dimension,
    //         itemStack: evd.itemStack,
    //         player: mcl.playerToData(evd.player)
    //     }))
    // })
})

world.afterEvents.playerPlaceBlock.subscribe((evd) => {
    worldSettings.placeBlockTracking(evd)
})

// Breakprotection & Landclaim
world.beforeEvents.playerPlaceBlock.subscribe((evd) => {
    worldProtection.placeBreakProtection(evd)
    worldProtection.placeBreakLandclaim(evd)
    anticheat.antiFastPlace(evd)
    worldSettings.worldSettingsBuild(evd)
    roles.roleBuild(evd)

    // system.sendScriptEvent('darkoak:beforeplayerplaceblock', JSON.stringify({
    //     block: evd.block,
    //     dimension: evd.dimension,
    //     face: evd.face,
    //     faceLocation: evd.faceLocation,
    //     permutationBeingPlaced: evd.permutationBeingPlaced,
    //     player: evd.player
    // }))
})

// Before explosion
world.beforeEvents.explosion.subscribe((evd) => {
    worldProtection.explosionProtectionLandclaim(evd)

    // system.sendScriptEvent('darkoak:beforeexplosion', JSON.stringify({
    //     dimension: evd.dimension,
    //     impactedBlocks: evd.getImpactedBlocks(),
    //     source: evd.source
    // }))
})

// Gamemode change
world.beforeEvents.playerGameModeChange.subscribe((evd) => {
    anticheat.antiGameMode(evd)

    system.runTimeout(() => {
        // system.sendScriptEvent('darkoak:beforeplayergamemodechange', JSON.stringify({
        //     fromGamemode: evd.fromGameMode,
        //     player: evd.player,
        //     toGameMode: evd.toGameMode
        // }))
    })
})

world.beforeEvents.playerLeave.subscribe((evd) => {
    worldSettings.welcomeMessage(evd)
    arrays.storePlayerData(evd.player)
    chat.logJoinsLeaves(evd)
    system.runTimeout(() => {
        try {
            // system.sendScriptEvent('darkoak:beforeplayerleave', JSON.stringify({
            //     player: evd.player
            // }))
            uiManager.closeAllForms(evd.player)
        } catch {

        }
    })
})

world.afterEvents.playerLeave.subscribe((evd) => {

    // system.sendScriptEvent('darkoak:afterplayerleave', JSON.stringify({
    //     playerId: evd.playerId,
    //     playerName: evd.playerName
    // }))
})

world.afterEvents.itemReleaseUse.subscribe((evd) => {
    worldSettings.pacifistArrowFix(evd)
    anticheat.antiBowSpam(evd)

    // system.sendScriptEvent('darkoak:afteritemreleaseuse', JSON.stringify({
    //     itemStack: evd.itemStack,
    //     source: mcl.playerToData(evd.source)
    // }))
})

system.afterEvents.scriptEventReceive.subscribe((evd) => {
    scriptEvents(evd)

    // if (evd.id != 'darkoak:scriptevent') system.sendScriptEvent('darkoak:scriptevent', JSON.stringify({
    //     id: evd.id,
    //     initiator: evd.initiator,
    //     message: evd.message,
    //     sourceBlock: evd.sourceBlock,
    //     sourceEntity: evd.sourceEntity,
    //     sourceType: evd.sourceType
    // }))
    // world.sendMessage(evd.message)
})

system.beforeEvents.startup.subscribe((evd) => {
    customSlashCommands(evd)
})

// system for handling most system intervals
system.runInterval(() => {

    uis()
    gens()
    chat.chatGames(cd.get('darkoak:scriptsettings'))
    timers()
    defaultData()

    invSeeLinker()


    const players = world.getAllPlayers()
    bans(players, cd.get('darkoak:anticheat'))
    landclaimBorders(players, cd.get('darkoak:community:general'))
    scoreboardHandler(players)

    for (let index = 0; index < players.length; index++) {
        const player = players[index]
        worldProtection.worldProtectionOther(player)
        worldSettings.borderAndTracking(player, mcl.jsonWGet('darkoak:worldborder'))
        enchantOnJump(player, cd.get('darkoak:scriptsettings'))
        actionBar(player)
        anticheat.anticheatMain(player)
        anticheat.cpsTester(player)
        chat.nametag(player, cd.get('darkoak:chat:other'), cd.get('darkoak:anticheat'))
        glideFeather(player)
        playerLister(player)
        worldProtection.dimensionBan(player)
        anticheat.dupeIDChecker(player, cd.get('darkoak:anticheat'))
        worldSettings.verify(player)
        combatManager(player)
        sitCheck(player)
        playerDataLogger(player)
        magicSlotter(player)
        // mcl.particleOutline({x: -167, y: 62, z: -76}, {x: -171, y: 66, z: -80}, undefined, 0.1, player.dimension.id)
    }

    anticheat.antiZDInterval(cd.get('darkoak:anticheat'))

    updateData()

    // system.sendScriptEvent('darkoak:interval', JSON.stringify({
    //     sentTime: Date.now(),
    //     currentTick: system.currentTick
    // }))

    // mcl.archimedesSpiral(2, 1, 1, (x, z) => {
    //     world.getDimension('overworld').runCommand(`setblock ${-204 + x} 88 ${36 + z} grass_block`)
    // })
})

/**
 * @param {ItemUseAfterEvent} evd 
 */
function itemOpeners(evd) {
    const player = evd.source
    const item = evd.itemStack
    const direction = player.getViewDirection()
    if (item.typeId == 'darkoak:main') {
        if (mcl.isDOBAdmin(player) || mcl.roleCheck(player)?.mainUI) {
            interfaces.mainUI(player)
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }

    if (item.typeId == 'darkoak:community') {
        if (player.isSneaking) {
            const playerToView = evd.source.getEntitiesFromViewDirection({ type: 'minecraft:player', maxDistance: 3 })[0]
            if (playerToView === undefined) {
                interfaces.communityMain(player)
                return
            }
            interfaces.viewProfile(player, playerToView.entity)
            return
        } else {
            interfaces.communityMain(player)
            return
        }
    }

    if (item.typeId == 'darkoak:generators' && player.hasTag('darkoak:admin')) {
        const block = player.getBlockFromViewDirection()
        if (block && block?.block.typeId.endsWith('_sign')) {
            interfacesTwo.signsPlusMainUI(player)
        } else {
            interfacesTwo.genMainUI(player)
        }
        return
    }

    if (item.typeId == 'darkoak:anticheat') {
        interfacesTwo.anticheatMain(player)
        return
    }

    if (item.typeId == 'darkoak:world_protection') {
        if (player.hasTag('darkoak:admin')) {
            interfacesTwo.protectedAreasMain(player)
            return
        } else {
            player.sendMessage('§cYou Aren\'t An Admin! Tag Yourself With darkoak:admin§r')
            return
        }
    }

    if (item.typeId == 'darkoak:hop_feather' && (player.isOnGround || player.isClimbing || player.isInWater)) {
        const now = Date.now()
        const lastUsed = cooldown.get(player.name) || 0
        const time = mcl.jsonWGet('darkoak:itemsettings')

        // checks if the cooldown has expired
        if (now - lastUsed < (time.hopfeather * 1000)) {
            const remainingTime = Math.ceil(((time.hopfeather * 1000) - (now - lastUsed)) / 1000)
            if (time.hopfeatherM) player.sendMessage(`§cYou Must Wait ${remainingTime} More Seconds To Use This Item Again!`)
            return
        }

        // applies knockback to the player in the direction they are looking
        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, 1)
        cooldown.set(player.name, now)
        return
    }

    if (item.typeId == 'darkoak:dash_feather' && (player.isOnGround || player.isClimbing)) {
        player.applyKnockback({ x: direction.x * 2, z: direction.z * 2 }, direction.y * 1.5)
        return
    }


    if (item.typeId.startsWith('darkoak:dummy')) {
        for (let index = 0; index <= arrays.dummySize; index++) {
            if (item.typeId == `darkoak:dummy${index}`) {
                const c = mcl.jsonWGet(`darkoak:bind:${index}`)
                if (!c) return
                const keys = Object.keys(c)
                for (let index = 0; index < keys.length; index++) {
                    const command = keys[index]
                    if (c[command]) evd.source.runCommand(arrays.replacer(player, c[command]))
                }
                return
            }
        }
    }
}

function communityGiver(evd) {
    const s = mcl.jsonWGet('darkoak:community:general')
    const p = evd.player

    p.runCommand(`function utility/recycler`)

    if (s?.giveOnJoin && p.runCommand('testfor @s [hasitem={item=darkoak:community}]').successCount == 0) {
        p.runCommand('give @s darkoak:community')
    }
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
function chestLock(evd) {
    if (!evd.block.typeId.endsWith('chest')) return
    if (evd.player.hasTag('darkoak:admin') && evd.itemStack && evd.itemStack.typeId == 'darkoak:chest_lock' && evd.isFirstEvent) {
        system.runTimeout(() => {
            interfaces.chestLockUI(evd.player, evd.block.location)
        })
        evd.cancel = true
    } else {
        const locks = mcl.listGetValues('darkoak:chestlock:')
        for (let index = 0; index < locks.length; index++) {
            const parts = JSON.parse(locks[index])
            const loc = evd.block.location
            // if (loc.x.toString() === parts.x && loc.y.toString() === parts.y && loc.z.toString() === parts.z && evd.player.name != parts.player) {
            //     evd.cancel = true
            //     return
            // }
            if (mcl.compareLocations(loc, { x: parts.x, y: parts.y, z: parts.z })) {
                evd.cancel = true
                return
            }
        }
    }
}

function dataEditor(evd) {
    if (evd.itemStack && evd.itemStack.typeId === 'darkoak:data_editor' && evd.player.hasTag('darkoak:admin')) {
        evd.cancel = true
        system.runTimeout(() => {
            interfacesTwo.dataEditorEntityUI(evd.player, evd.target)
        })
    }
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
function dataEditorBlock(evd) {
    if (evd.itemStack && evd.itemStack.typeId === 'darkoak:data_editor' && evd.player.hasTag('darkoak:admin') && (system.currentTick % 15 == 0 || evd.isFirstEvent)) {
        evd.cancel = true
        const bl = evd.block
        const bi = bl.typeId
        const perm = bl.permutation
        system.runTimeout(() => {

            if (evd.player.isSneaking) {
                if (perm.getState('weirdo_direction') != undefined) {

                    let num = perm.getState('weirdo_direction') + 1

                    if (num > 3) {
                        bl.setPermutation(perm.withState('weirdo_direction', 0).withState('upside_down_bit', !perm.getState('upside_down_bit')))
                    } else {
                        bl.setPermutation(perm.withState('weirdo_direction', num))
                    }

                } else if (perm.getState('minecraft:vertical_half') != undefined) {

                    let tog = 'bottom'
                    if (perm.getState('minecraft:vertical_half') === 'bottom') tog = 'top'
                    bl.setPermutation(perm.withState('minecraft:vertical_half', tog))

                } else if (perm.getState('facing_direction') != undefined) {

                    let num = (perm.getState('facing_direction') + 1) % 6
                    bl.setPermutation(perm.withState('facing_direction', num))

                } else if (perm.getState('button_pressed_bit') != undefined) {

                    bl.setPermutation(perm.withState('button_pressed_bit', !perm.getState('button_pressed_bit')))

                } else if (perm.getState('ground_sign_direction') != undefined) {

                    let num = (perm.getState('ground_sign_direction') + 1) % 16
                    bl.setPermutation(perm.withState('ground_sign_direction', num))

                } else if (perm.getState('minecraft:cardinal_direction') != undefined) {

                    let states = ['north', 'east', 'south', 'west']
                    let current = perm.getState('minecraft:cardinal_direction')
                    let idx = states.findIndex(dir => dir === current)
                    let next = states[(idx + 1) % states.length]
                    bl.setPermutation(perm.withState('minecraft:cardinal_direction', next))

                } else if (perm.getState('bamboo_stalk_thickness') != undefined) {

                    let states = ['thick', 'thin']
                    let current = perm.getState('bamboo_stalk_thickness')
                    let idx = states.findIndex(dir => dir === current)
                    let next = states[(idx + 1) % states.length]
                    bl.setPermutation(perm.withState('bamboo_stalk_thickness', next))

                } else if (perm.getState('direction') != undefined) {

                    let num = (perm.getState('direction') + 1) % 4
                    bl.setPermutation(perm.withState('direction', num))

                } else if (perm.getState('fill_level') != undefined) {

                    let num = (perm.getState('fill_level') + 1) % 7
                    bl.setPermutation(perm.withState('fill_level', num))

                } else if (perm.getState('vine_direction_bits') != undefined) {

                    let num = (perm.getState('vine_direction_bits') + 1) % 16
                    bl.setPermutation(perm.withState('vine_direction_bits', num))

                } else if (perm.getState('stability') != undefined) {
                    let num = (perm.getState('stability') + 1) % 8
                    bl.setPermutation(perm.withState('stability', num))

                } else if (perm.getState('portal_axis') != undefined) {
                    let states = ['x', 'z']
                    let current = perm.getState('portal_axis')
                    let idx = states.findIndex(dir => dir === current)
                    let next = states[(idx + 1) % states.length]
                    bl.setPermutation(perm.withState('portal_axis', next))
                }

            } else {
                interfacesTwo.dataEditorBlockUI(evd.player, bl)
            }
        })
    }
}

function uis() {

    const c = mcl.jsonWGet('darkoak:scriptsettings')
    if (c?.cuimaster) return

    let uisF = mcl.listGetBoth('darkoak:ui:')
    for (let index = 0; index < uisF.length; index++) {
        const parts = JSON.parse(uisF[index].value)

        const type = uisF[index].id.split(':')[2]

        const players = world.getPlayers({ tags: [parts.tag] })
        for (let index = 0; index < players.length; index++) {
            const player = players[index]
            switch (type) {
                case 'message':
                    messageUIBuilder(player, parts.title, parts.body, parts.button1, parts.button2, parts.command1, parts.command2)
                    break
                case 'action':
                    actionUIBuilder(player, parts.title, parts.body, parts.buttons)
                    break
                case 'modaltext':
                    modalTextUIBuilder(player, parts)
                    break
                case 'animatedaction':
                    animatedActionUIBuilder(player, parts)
                    break
            }
            player.removeTag(parts.tag)
        }
    }
}

// gen system
function gens() {
    const blocks = mcl.listGetValues('darkoak:gen:')
    for (let index = 0; index < blocks.length; index++) {
        const b = JSON.parse(blocks[index])

        const block = world.getDimension(b?.dimension || 'overworld')

        if (!b?.coords2) {
            if (!mcl.tickTimer(b?.delay || 1)) continue
            const parts = b?.coords.split(' ')
            try {
                const coords = {
                    x: parseInt(parts[0]),
                    y: parseInt(parts[1]),
                    z: parseInt(parts[2])
                }
                if (!block.getBlock({
                    x: coords.x,
                    y: coords.y,
                    z: coords.z
                })) continue
                block.setBlockType({
                    x: coords.x,
                    y: coords.y,
                    z: coords.z
                }, b.block)
            } catch {
                mcl.adminMessage(`Failed To Set Block ${b.block} At ${parts[0]} ${parts[1]} ${parts[2]}`)
            }
        } else {
            if (!mcl.tickTimer(b?.delay || 0)) continue
            block.runCommand(`fill ${b.coords} ${b.coords2} ${b.block}`)
        }
    }

    const mobs = mcl.listGetBoth('darkoak:mobgen:')
    for (let index = 0; index < mobs.length; index++) {
        const m = JSON.parse(mobs[index].value)
        try {
            if (m.current == 0) {
                const spawn = world.getDimension(m.dimension || 'overworld')
                mcl.jsonWUpdate(mobs[index].id, 'current', m.interval)
                if (spawn.runCommand(`execute positioned ${m.loc.x} ${m.loc.y} ${m.loc.z} run testfor @e [type=${m.mob},r=10]`).successCount <= m.max) {
                    spawn.spawnEntity(m.mob, m.loc)
                }
            } else {
                mcl.jsonWUpdate(mobs[index].id, 'current', m.current - 1)
            }
        } catch (e) {
            mcl.adminMessage(`Failed To Spawn Mob ${m.mob} At ${m.loc.x} ${m.loc.y} ${m.loc.z}`)
            console.error(`Error: ${String(e)}`)
        }
    }

    const signs = mcl.listGetBoth('darkoak:signsplus:')
    for (let index = 0; index < signs.length; index++) {
        const sign = JSON.parse(signs[index].value)

        try {
            const block = mcl.getBlock(sign.location, sign.dimension)
            if (!block) return


        } catch (e) {
            mcl.adminMessage(`Failed To Use Signs+ On Sign: ${sign.location.x} ${sign.location.y} ${sign.location.z}`)
        }
    }
}


/**Ban system
 * @param {Player[]} players 
 * @param {object} d 
 */
function bans(players, d) {
    if (system.currentTick < 100) return

    const p = players[0]

    if (d?.prebans) {
        const prebans = arrays.preBannedList
        for (let index = 0; index < prebans.length; index++) {
            const preban = prebans[index]
            const prep = mcl.getPlayer(preban)
            if (!prep) continue
            try {
                p.runCommand(`kick "${preban}" "You\'ve Been Prebanned From This Server, Apply To Be Removed From The List Here: https://discord.gg/cE8cYYeFFx"`)
                transferPlayer(prep, { hostname: '127.0.0.0', port: 0 })
                prep.sendMessage(`§a§k`)
                prep.sendMessage(`§a§k`)
                prep.sendMessage(`§a§k`)
            } catch {

            }
        }
    }

    const bans = mcl.listGetBoth('darkoak:bans:')
    if (bans) {
        for (let index = 0; index < bans.length; index++) {
            const ban = bans[index]
            const data = JSON.parse(ban.value)
            if (data.time == 0) {
                mcl.adminMessage(`${data.player} Has Been Unbanned`)
                mcl.wRemove(ban.id)
                continue
            }
            mcl.jsonWUpdate(ban.id, 'time', data.time - 1)
            const banned = mcl.getPlayer(data.player)
            if (!banned) continue
            if (!data?.crash) {
                if (data?.soft) {
                    transferPlayer(gp, {
                        hostname: '127.0.0.0',
                        port: 0
                    })
                } else {
                    p.runCommand(`kick "${data.player}" ${data?.message || ''}`)
                }
            } else {
                let o = 0
                while (o++ < 100) {
                    banned.sendMessage(`§a§k`)
                    banned.sendMessage(`§a§k`)
                    banned.sendMessage(`§a§k`)
                    try {
                        mcl.stopPlayer(banned)
                        banned.teleport(banned.location)
                    } catch {
                        banned.sendMessage(`§a§k`)
                        banned.sendMessage(`§a§k`)
                        banned.sendMessage(`§a§k`)
                    }
                }
                p.runCommand(`kick "${data.player}" ${data?.message || ''}`)
            }
        }
    }

    /**@type {{enabled: boolean, whitelist: string}} */
    const whitelist = mcl.jsonWGet('darkoak:whitelist')
    if (whitelist?.enabled) {
        const wlp = whitelist?.whitelist.split(',').map(e => e.trim())

        const ps = players
        for (let index = 0; index < ps.length; index++) {
            const pl = ps[index]
            if (wlp.includes(pl.name)) continue
            p.runCommand(`kick "${pl.name}" You Aren\'t On The Whitelist!`)
        }
    }
}

/**
 * @param {Player[]} players 
 * @param {object} community 
 */
function landclaimBorders(players, community) {
    if (!mcl.tickTimer(10)) return

    const lcs = mcl.listGetBoth('darkoak:landclaim:')

    for (let index = 0; index < lcs.length; index++) {
        const area = JSON.parse(lcs[index].value)

        const minX = Math.min(area.p1.x, area.p2.x)
        const maxX = Math.max(area.p1.x, area.p2.x)
        const minZ = Math.min(area.p1.z, area.p2.z)
        const maxZ = Math.max(area.p1.z, area.p2.z)

        for (let index = 0; index < players.length; index++) {
            const player = players[index]

            const l = player.location

            if (l.x >= minX && l.x <= maxX && l.z >= minZ && l.z <= maxZ) {
                if (area.players.includes(player.name) || area.owner === player.name) {
                    player.spawnParticle('minecraft:endrod', {
                        x: l.x,
                        y: l.y + 0.2,
                        z: l.z
                    })
                } else {
                    player.spawnParticle('minecraft:falling_border_dust_particle', {
                        x: l.x,
                        y: l.y + 0.2,
                        z: l.z
                    })
                }
            }
            if (community?.landclaimsborder) {
                mcl.particleOutline({
                    x: area.p1.x,
                    y: l.y,
                    z: area.p1.z
                }, {
                    x: area.p2.x,
                    y: l.y,
                    z: area.p2.z
                }, undefined, 8.4)
            }
        }
    }
}

/**Holds non-UI script events
 * @param {ScriptEventCommandMessageAfterEvent} evd 
 */
function scriptEvents(evd) {
    /**@type {Player | Entity | undefined} */
    const player = evd.sourceEntity
    if (evd.id == 'darkoak:help') {
        if (!player) return
        player.sendMessage(arrays.scriptEvents.join('\n'))
    }
    if (evd.id === 'darkoak:enchant') {
        if (!player) return
        if (evd.message.trim() == '') {
            interfacesTwo.customEnchantsMain(player)
            return
        } else {
            const parts = evd.message.split(' ')
            const event = parseInt(parts[0])
            const action = parseInt(parts[1])
            const power = parseInt(parts[2])

            const i = mcl.getHeldItem(player)
            let item = new ItemStack(i.type, i.amount)
            let lore = i.getLore()
            lore.push(`§r§5${customEnchantEvents[event]}-${customEnchantActions[action]}-${power}`)
            item.setLore(lore)
            item.nameTag = i.nameTag || item.nameTag

            mcl.getItemContainer(player).setItem(player.selectedSlotIndex, item)
            return
        }
    }
    if (evd.id === 'darkoak:bind') {
        if (!player) return
        interfacesTwo.itemBindingUI(player)
        return
    }
    if (evd.id === 'darkoak:spawn') {
        const b = evd.sourceBlock || player
        if (!b) {
            mcl.adminMessage(`The darkoak:spawn Scriptevent Needs To Execute From A Block Or Entity`)
            return
        }
        try {
            const parts = evd.message.split(' ')
            const item = new ItemStack(`minecraft:${parts[0]}`, parseInt(parts[1]) || 1)
            world.getDimension(b.dimension.id).spawnItem(item, {
                x: parseInt(parts[2]) || b.location.x,
                y: parseInt(parts[3]) || b.location.y,
                z: parseInt(parts[4]) || b.location.z
            })
            return
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:spawn From Block / Entity ${b.location.x} ${b.location.y} ${b.location.z} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:command') {
        if (!player) {
            mcl.adminMessage(`The darkoak:command Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            player.runCommand(arrays.replacer(player, evd.message))
            return
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:command From Entity ${player.nameTag} At ${player.location.x.toFixed(0)} ${player.location.y.toFixed(0)} ${player.location.z.toFixed(0)} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:knockback') {
        if (!player) {
            mcl.adminMessage(`The darkoak:knockback Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            const p = arrays.replacer(player, evd.message).split(' ')
            player.applyKnockback({ x: 0, z: 0 }, player.getVelocity().y * -1)
            player.applyKnockback({ x: parseFloat(p[0]), z: parseFloat(p[1]), }, parseFloat(p[2]))
            return
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:knockback From Entity ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:if') {
        if (!player) {
            mcl.adminMessage(`The darkoak:if Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            let p = arrays.replacer(player, evd.message).split(' ')
            if (p[0] == p[1]) {
                p.splice(0, 2)
                player.runCommand(p.join(' '))
            }
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:if From Entity ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:variable') {
        if (!player) {
            mcl.adminMessage(`The darkoak:variable Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            const p = arrays.replacer(player, evd.message).split(' ')
            mcl.wSet(`darkoak:vars:${p[0]}`, p[1])
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:variable From ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:projectile') {
        if (!player) {
            mcl.adminMessage(`The darkoak:projectile Scriptevent Needs To Execute From An Entity`)
            return
        }
        try {
            // scriptevent darkoak:projectile [type] [towards x] [towards y] [towards z] [force]
            const parts = arrays.replacer(player, evd.message).split(' ')

            const spawnPos = {
                x: player.location.x + parseFloat(parts[1]),
                y: player.location.y + parseFloat(parts[2]),
                z: player.location.z + parseFloat(parts[3]),
            }

            const projectile = world.getDimension(player.dimension.id).spawnEntity(parts[0], spawnPos)
            const force = parseFloat(parts[4]) || 1
            const view = player.getViewDirection()
            projectile.applyImpulse({
                x: view.x * force,
                y: view.y * force,
                z: view.z * force,
            })

        } catch {
            mcl.adminMessage(`Scriptevent darkoak:projectile From ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:openui') {
        if (!player) {
            mcl.adminMessage(`The darkoak:openui Scriptevent Needs To Execute From A Player`)
            return
        }
        try {
            const parts = evd.message.split(' ')
            const uiName = parts[0]
            const args = parts.slice(1)

            if (typeof interfaces[uiName] === 'function') {
                interfaces[uiName](player, ...args)
            } else if (typeof interfacesTwo[uiName] === 'function') {
                interfacesTwo[uiName](player, ...args)
            } else {
                player.sendMessage(`§cUI "${uiName}" Not Found\nUse The Scriptevent darkoak:uihelp For A List Of Names§r`)
            }
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:openui From ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:uihelp') {
        if (!player) {
            mcl.adminMessage(`The darkoak:uihelp Scriptevent Needs To Execute From A Player`)
            return
        }
        try {
            const uis = Object.keys(interfaces).concat(Object.keys(interfacesTwo))
            player.sendMessage(`§uAvailable UIs:§a\n${uis.join('\n')}\n§rUse darkoak:openui [UI Name] [Args] To Open A UI.`)
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:uihelp From ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:transfer') {
        if (!player) {
            mcl.adminMessage(`The darkoak:transfer Scriptevent Needs To Execute From A Player`)
            return
        }
        try {
            const parts = evd.message.split(' ')
            transferPlayer(player, { hostname: parts[0], port: parseInt(parts[1]) })
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:transfer From ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:explode') {
        if (!player) {
            mcl.adminMessage(`The darkoak:explode Scriptevent Needs To Execute From An Entity`)
            return
        }
        // scriptevent darkoak:explode [x]0 [y]1 [z]2 [radius]3 [fire]4 [breaksBlocks]5
        // example: scriptevent darkoak:explode 0 64 0 5 true true
        try {
            const parts = arrays.replacer(player, evd.message).split(' ')
            const loc = {
                x: parseFloat(parts[0] || player.location.x),
                y: parseFloat(parts[1] || player.location.y),
                z: parseFloat(parts[2] || player.location.z),
            }
            world.getDimension(player.dimension.id).createExplosion(loc, parseFloat(parts[3]) || 5, {
                causesFire: Boolean(parts[4]) || false,
                breaksBlocks: Boolean(parts[5]) || false,
            })
        } catch {
            mcl.adminMessage(`Scriptevent darkoak:explode From ${player.nameTag} Has An Error`)
            return
        }
    }
    if (evd.id == 'darkoak:retrievedata') {
        try {
            system.sendScriptEvent('darkoak:data', mcl.wGet(evd.message))
            return
        } catch {
            system.sendScriptEvent('darkoak:data', undefined)
            return
        }
    }

    // DEBUG EVENTS
    if (evd.id == 'darkoak:debug') {
        try {
            switch (evd.message) {
                case '':
                case 'help':
                    mcl.adminMessage(arrays.debugEvents)
                    break
                case 'aclog':
                    anticheat.log(player, `DEBUG TEST`)
                    break
                case 'playerlist':
                    mcl.adminMessage(mcl.getPlayerList().join('\n'))
                    break
                case 'bytes':
                case 'bytesize':
                    mcl.adminMessage(world.getDynamicPropertyTotalByteCount().toString())
                    break
            }
            return
        } catch (e) {
            mcl.adminMessage(`AW HECK IT BROK: ${String(e)}`)
            return
        }
    }
}

system.beforeEvents.watchdogTerminate.subscribe((evd) => {
    const d = mcl.jsonWGet('darkoak:scriptsettings')
    if (!d) return
    if (d.cancelWatchdog) {
        mcl.adminMessage(`Script Shutdown, Reason: ${evd.terminateReason.toString()}`)
        evd.cancel = true
    }
})

/**
 * @param {Player} playerToShow 
 * @param {string} title 
 * @param {string} body 
 * @param {{title: string, command: string}} buttons 
 */
function actionUIBuilder(playerToShow, title, body, buttons) {
    let f = new ActionFormData()

    bui.title(f, arrays.replacer(playerToShow, title))
    bui.body(f, arrays.replacer(playerToShow, body))

    let leavers = []

    for (let index = 0; index < buttons.length; index++) {
        /**@type {{title: string, command: string}} */
        const cb = buttons[index]
        if (cb.title) {
            bui.button(f, arrays.replacer(playerToShow, cb.title))
        } else if (cb.command) {
            leavers.push(cb.command)
        }
    }

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        const selected = buttons[evd.selection]
        if (selected.command) {
            try {
                if (selected.command) playerToShow.runCommand(arrays.replacer(playerToShow, selected.command))
            } catch {
                mcl.adminMessage(`Custom UI ${title} At ${selected.command} Has An Error`)
            }
        }
        for (let index = 0; index < leavers.length; index++) {
            const c = leavers[index]
            playerToShow.runCommand(c)
        }
    })
}

/**system for displaying message cui
 * @param {Player} playerToShow 
 * @param {string} title 
 * @param {string} body 
 * @param {string} button1 
 * @param {string} button2 
 * @param {string} command1 
 * @param {string} command2 
 */
function messageUIBuilder(playerToShow, title, body, button1, button2, command1, command2) {
    let f = new MessageFormData()
    bui.title(f, arrays.replacer(playerToShow, title))
    bui.body(f, arrays.replacer(playerToShow, body))
    f.button1(arrays.replacer(playerToShow, button1))
    f.button2(arrays.replacer(playerToShow, button2))

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        if (evd.selection == 0 && command1) {
            playerToShow.runCommand(arrays.replacer(playerToShow, command1))
        } else if (evd.selection == 1 && command2) {
            playerToShow.runCommand(arrays.replacer(playerToShow, command2))
        }
    })
}

// function modalUIBuilder(playerToShow, ui) {
//     let f = new ModalFormData()
//     bui.title(f, arrays.replacer(playerToShow, ui.title))

//     for (const el of uiData.elements) {
//         if (el.type === 'textField') {
//             f.textField(el.label, el.placeholder, { defaultValue: el.defaultValue })
//         } else if (el.type === 'toggle') {
//             f.toggle(el.label, { defaultValue: el.defaultValue })
//         } else if (el.type === 'dropdown') {
//             f.dropdown(el.label, el.options, { defaultValue: el.defaultValue })
//         }
//     }

//     f.show(playerToShow).then((evd) => {
//         if (evd.canceled) return
//     })
// }

/**system for displaying modaltextuis
 * @param {Player} playerToShow 
 * @param {{title: string, tag: string, lines: string[]}} ui 
 */
function modalTextUIBuilder(playerToShow, ui) {
    let f = new ModalFormData()
    bui.title(f, ui.title)

    let commands = []

    for (let index = 0; index < ui.lines.length; index++) {
        const parts = ui.lines[index].split('|')
        switch (parts[0]) {
            case 'toggle':
                bui.toggle(f, parts[1], parts[2], parts[3])
                break
            case 'textfield':
                bui.textField(f, parts[1], parts[2], parts[3], parts[4])
                break
            case 'label':
                bui.label(f, parts[1])
                break
            case 'header':
                bui.header(f, parts[1])
                break
            case 'slider':
                bui.slider(f, parts[1], parts[2], parts[3], parts[4], parts[5], parts[6])
                break
            case 'divider':
                bui.divider(f)
                break
            case 'dropdown':
                bui.dropdown(f, parts[1], parts[2].split(','), parts[3], parts[4])
                break
            case 'submit':
                bui.submitButton(f, parts[1])
                break
            case 'command':
                commands.push(parts[1])
                break
        }
    }

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        for (let index = 0; index < commands.length; index++) {
            let command = commands[index]
            command = command.replace(/\$(\d+)\$/g, (_, n) => e[n - 1])
            playerToShow.runCommand(command)
        }
    })
}

function animatedActionUIBuilder(player, ui, frame = 0) {
    let f = new ActionFormData()


}


/**System for displaying the actionbar and sidebar
 * @param {Player} player 
 */
function actionBar(player) {

    const d = mcl.jsonWGet('darkoak:scriptsettings')

    /**@type {{lines: string[], ticks: number}} */
    const text = mcl.jsonWGet('darkoak:actionbar:v2')
    const lines = text?.lines.filter(e => e.length > 0)
    if (text && !d?.actionbarmaster) player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"${arrays.replacer(player, lines[act]?.replaceAll('\\n', '\n') || '')}"}]}`)

    /**@type {{lines: [string, string, string]}} */
    const text2 = mcl.jsonWGet('darkoak:sidebar')
    if (text2 && text2.lines.join('').length > 0) player.runCommand(`titleraw @s title {"rawtext":[{"text":"${arrays.replacer(player, text2.lines.join('\n').trim())}"}]}`)

    if (mcl.tickTimer(text?.ticks)) {
        act++
        if (act >= lines.length) act = 0
    }
}

/**Glide feather
 * @param {Player} player 
 */
function glideFeather(player) {
    const view = player.getViewDirection()
    const item = mcl.getHeldItem(player)
    if (item && item.typeId == 'darkoak:glide_feather' && !player.isOnGround && !player.isJumping && !player.isSneaking) player.applyKnockback({ x: view.x / 2, z: view.z / 2 }, player.getVelocity().y * -1)
}

/**
 * @param {PlayerSpawnAfterEvent} evd 
 */
function moneySetter(evd) {
    mcl.addScore(evd.player, 0)
}

/**
 * @param {Player} player 
 */
function playerLister(player) {

    let players = mcl.getPlayerList() || []
    if (!players.includes(player.name)) {
        players.push(player.name)
        mcl.jsonWSet('darkoak:playerlist', players)
    }

    let admins = mcl.getAdminList() || []
    if (mcl.isDOBAdmin(player) && !admins.includes(player.name)) {
        admins.push(player.name)
        mcl.jsonWSet('darkoak:adminlist', admins)
    } else if (!mcl.isDOBAdmin(player) && admins.includes(player.name)) {
        admins = admins.filter(e => e !== player.name)
        mcl.jsonWSet('darkoak:adminlist', admins)
    }

    let mods = mcl.getModList() || []
    if (mcl.isDOBMod(player) && !mods.includes(player.name)) {
        mods.push(player.name)
        mcl.jsonWSet('darkoak:modlist', mods)
    } else if (!mcl.isDOBMod(player) && mods.includes(player.name)) {
        mods = mods.filter(e => e !== player.name)
        mcl.jsonWSet('darkoak:modlist', mods)
    }
}

/**
 * @param {StartupEvent} evd 
 */
function customSlashCommands(evd) {
    worldEdit.WEcommands(evd)
    roles.roleCommand(evd)
    fakePlayerCommand(evd)
    worldEdit.betterVanillaCommands(evd)


    evd.customCommandRegistry.registerEnum('darkoak:dimensions', ['overworld', 'nether', 'end'])
    evd.customCommandRegistry.registerEnum('darkoak:compare', ['==', '!=', '<', '>', '<=', '>='])

    evd.customCommandRegistry.registerEnum('darkoak:moneyfunctions', ['add', 'remove', 'set', 'test'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:money',
        description: 'Command For Accessing The Money System',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:moneyfunctions'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'amount'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:compare'
            }
        ]
    }, (evd, players, moneyfunctions, amount, compare) => {
        let player = players[0]
        if (!player || player.typeId != 'minecraft:player') return {
            status: CustomCommandStatus.Failure,
            message: 'Missing Player'
        }

        let result = 0
        switch (moneyfunctions) {
            case 'add':
                mcl.addScore(player, amount)
                result = 1
                break
            case 'remove':
                mcl.removeScore(player, amount)
                result = 1
                break
            case 'set':
                mcl.setScore(player, amount)
                result = 1
                break
            case 'test':
                let bool = Function(`return (${amount} ${compare} ${mcl.getScore(player)})`)()
                if (bool) {
                    result = 2
                } else {
                    result = 3
                }
                break
        }

        switch (result) {
            case 0:
                return {
                    status: CustomCommandStatus.Failure,
                    message: 'Uncaught Result'
                }
                break
            case 1:
                return {
                    status: CustomCommandStatus.Success,
                    message: `${player.name} Now Has $${mcl.getScore(player).toString()}`
                }
                break
            case 2:
                return {
                    status: CustomCommandStatus.Success,
                    message: `${player.name}'s Test Result Was A Success`
                }
                break
            case 3:
                return {
                    status: CustomCommandStatus.Failure,
                    message: `${player.name}'s Test Result Was A Fail`
                }
                break
        }
        // if (result) {
        //     return {
        //         status: CustomCommandStatus.Success,
        //         message: `§a${player[0].name} Now Has $${mcl.getScore(player[0]).toString()}§r`
        //     }
        // } else {
        //     return {
        //         status: CustomCommandStatus.Failure,
        //         message: `Player: ${player[0].name}, Type: ${moneyfunctions}, Amount: ${amount}, Compare: ${compare}, Has: ${mcl.getScore(player[0])}, Result: ${result}`
        //     }
        // }
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:transfer',
        description: 'Transfer The Selected Player To A Specified Server',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            },
            {
                type: CustomCommandParamType.String,
                name: 'hostname'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'port'
            }
        ]
    }, (evd, player, hostname, port) => {
        system.runTimeout(() => {
            for (let index = 0; index < player.length; index++) {
                const p = player[index]
                transferPlayer(p, { hostname: hostname, port: port })
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:help',
        description: 'Shows The List Of Commands',
        permissionLevel: CommandPermissionLevel.GameDirectors
    }, (evd) => {
        evd?.sourceEntity.sendMessage(arrays.scriptEvents.join('\n'))
    })

    evd.customCommandRegistry.registerEnum('darkoak:enchantsevents', customEnchantEvents)
    evd.customCommandRegistry.registerEnum('darkoak:enchantsactions', customEnchantActions)
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:enchant',
        description: 'Applies Custom Enchants',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:enchantsevents'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:enchantsactions'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'power'
            }
        ]
    }, (evd, player, enchantsevents, enchantsactions, power) => {
        system.runTimeout(() => {
            if (enchantsevents === undefined) {
                interfacesTwo.customEnchantsMain(player[0])
                return
            }

            const i = mcl.getHeldItem(player[0])
            if (!i) return
            let item = new ItemStack(i.type, i.amount)
            let lore = i.getLore()
            lore.push(`§r§5${enchantsevents}-${enchantsactions}-${power}`)
            item.setLore(lore)
            item.nameTag = i.nameTag

            mcl.getItemContainer(player[0]).setItem(player[0].selectedSlotIndex, item)
            return
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:spawn',
        description: 'Spawns Items With Specified Parameters',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.ItemType,
                name: 'itemType'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'amount'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'location'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'name'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'data'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'keep_on_death'
            },
        ]
    }, (evd, itemType, amount, location, name, damage, keepondeath) => {
        system.runTimeout(() => {
            const dimen = evd.initiator?.dimension || evd.sourceBlock?.dimension || evd.sourceEntity?.dimension
            const item = new ItemStack(itemType, amount)

            item.nameTag = name

            const dura = item.getComponent(ItemComponentTypes.Durability)
            if (damage && dura) {
                if (damage <= 0) {
                    dura.damage = 0
                } else {
                    dura.damage = damage
                }
            }

            item.keepOnDeath = keepondeath || false

            world.getDimension(dimen?.id || 'overworld').spawnItem(item, location)
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:command',
        description: 'Runs A Command Using Replacer Hashtags',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.EntitySelector,
                name: 'entity'
            },
            {
                type: CustomCommandParamType.String,
                name: 'command'
            }
        ]
    }, (evd, entity, command) => {
        system.runTimeout(() => {
            for (let index = 0; index < entity.length; index++) {
                const e = entity[index]
                e.runCommand(arrays.replacer(e, command))
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:knockback',
        description: 'Applies Knockback To An Entity',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.EntitySelector,
                name: 'entity'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'x'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'y'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'z'
            },
        ]
    }, (evd, entity, x, y, z) => {
        system.runTimeout(() => {
            for (let index = 0; index < entity.length; index++) {
                /**@type {Entity} */
                const e = entity[index]
                e.applyKnockback({ x: 0, z: 0 }, e.getVelocity().y * -1)
                e.applyKnockback({ x: x, z: z, }, y)
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:if',
        description: 'Checks If Param1 Is Equal To Param2, If Equal Runs Command',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            },
            {
                type: CustomCommandParamType.String,
                name: 'param1'
            },
            {
                type: CustomCommandParamType.String,
                name: 'param2'
            },
            {
                type: CustomCommandParamType.String,
                name: 'command'
            }
        ]
    }, (evd, player, param1, param2, command) => {
        system.runTimeout(() => {
            for (let index = 0; index < player.length; index++) {
                const p = player[index]
                if (arrays.replacer(p, param1) != arrays.replacer(p, param2)) continue
                p.runCommand(arrays.replacer(p, command))
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:variable',
        description: 'Sets A Custom Variable',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            },
            {
                type: CustomCommandParamType.String,
                name: 'variable_name'
            },
            {
                type: CustomCommandParamType.String,
                name: 'data'
            }
        ]
    }, (evd, player, variable_name, data) => {
        for (let index = 0; index < player.length; index++) {
            const p = player[index]
            mcl.wSet(`darkoak:vars:${arrays.replacer(p, variable_name)}`, arrays.replacer(p, data))
        }
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:projectile',
        description: 'Summons And Shoots A Projectile',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            },
            {
                type: CustomCommandParamType.EntityType,
                name: 'type'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'x'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'y'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'z'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'force'
            },
        ]
    }, (evd, player, type, x, y, z, force) => {
        system.runTimeout(() => {
            for (let index = 0; index < player.length; index++) {
                /**@type {Player} */
                const p = player[index]
                const spawnPos = {
                    x: p.location.x + parseFloat(arrays.replacer(p, x)),
                    y: p.location.y + parseFloat(arrays.replacer(p, y)),
                    z: p.location.z + parseFloat(arrays.replacer(p, z)),
                }
                const projectile = world.getDimension(p.dimension.id).spawnEntity(type.id, spawnPos)
                const view = p.getViewDirection()
                projectile.applyImpulse({
                    x: view.x * force,
                    y: view.y * force,
                    z: view.z * force,
                })
            }
        })
    })

    const uis = Object.keys(interfaces).concat(Object.keys(interfacesTwo))
    evd.customCommandRegistry.registerEnum('darkoak:uilist', uis)
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:openui',
        description: 'Opens Any Non-Player Made UI From This Addon',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:uilist'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'args'
            }
        ]
    }, (evd, player, uilist, args) => {
        system.runTimeout(() => {
            for (let index = 0; index < player.length; index++) {
                const p = player[index]
                if (typeof interfaces[uilist] === 'function') {
                    interfaces[uilist](p, ...(args ? args.split(' ') : []))
                } else if (typeof interfacesTwo[uilist] === 'function') {
                    interfacesTwo[uilist](p, ...(args ? args.split(' ') : []))
                }
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:explode',
        description: 'Summons An Explosion With Specific Parameters',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:dimensions'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'location'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'radius'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'breaksblocks'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'fire'
            }
        ]
    }, (evd, dimension, location, radius, breaksblocks, fire) => {
        system.runTimeout(() => {
            world.getDimension(dimension).createExplosion(location, radius, {
                causesFire: fire,
                breaksBlocks: breaksblocks,
            })
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:debugtypes', ['aclog', 'playerlist', 'bytes', 'bytesize', 'what', 'http', 'uis', 'clipboard', 'fakeplayer', 'dupe', 'dupe_without_id'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:debug',
        description: 'Be Careful!',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:debugtypes'
            }
        ]
    }, (evd, play, debugtype) => {

        /**@type {Player} */
        const player = play[0]

        system.runTimeout(() => {
            switch (debugtype) {
                case 'aclog':
                    anticheat.log(player, `DEBUG TEST`)
                    break
                case 'playerlist':
                    mcl.adminMessage(mcl.getPlayerList().join('\n'))
                    break
                case 'bytes':
                case 'bytesize':
                    mcl.adminMessage(world.getDynamicPropertyTotalByteCount().toString())
                    break
                case 'what':
                    mcl.adminMessage(`\nItem: ${mcl.getHeldItem(player)?.typeId}\nBlock: ${player.getBlockFromViewDirection()?.block?.typeId}`)
                    break
                case 'http':

                    break
                case 'uis':
                    let messageToSend = []
                    const u = mcl.jsonListGetBoth('darkoak:ui:')
                    for (let index = 0; index < u.length; index++) {
                        const ui = u[index]
                        messageToSend.push(`§uID:§r ${ui.id}\n§uValue:§r ${JSON.stringify(ui.value)}§r`)
                    }
                    player.sendMessage('-----------------\n' + messageToSend.join('\n') + '\n-----------------')
                    break
                case 'clipboard':

                    break
                case 'fakeplayer':

                    break
                case 'dupe':
                    const held = mcl.getHeldItem(player)
                    if (held) mcl.getInventory(player)?.container.addItem(held)
                    break
                case 'dupe_without_id':
                    let newItem = mcl.getHeldItem(player)
                    newItem?.setLore(undefined)
                    if (newItem) mcl.getInventory(player)?.container.addItem(newItem)
                    break
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:boats',
        description: 'Checks Boat-Catcher Amounts',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            }
        ]
    }, (evd, player) => {
        system.runTimeout(() => {
            if (evd.sourceEntity && evd.sourceEntity.typeId == 'minecraft:player') {
                /**@type {Player} */
                const p = evd.sourceEntity

                if (player.length > 1) {
                    for (let index = 0; index < player.length; index++) {
                        const p = player[index]

                    }
                } else {
                    /**@type {Player} */
                    const ptc = player[0]
                    /**@type {{'darkoakboat': number, 'birch boat': number}} */
                    const boats = mcl.jsonPGet(ptc, 'darkoak:boatcatcher')
                    if (!boats) {
                        p.sendMessage(`§c${ptc.name} Has No Boats§r`)
                        return
                    }
                    p.sendMessage(`§a${ptc.name} Has The Following Boats:§r`)
                    const boatTypes = Object.keys(boats)
                    for (let index = 0; index < boatTypes.length; index++) {
                        const key = boatTypes[index]
                        p.sendMessage(`§u${key}§i: §a${boats[key]}§r`)
                    }
                }
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:delete',
        description: 'Deletes Entities',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.EntitySelector,
                name: 'entities'
            }
        ]
    }, (evd, entities) => {
        system.runTimeout(() => {
            for (let index = 0; index < entities.length; index++) {
                /**@type {Entity} */
                const entity = entities[index]
                try {
                    entity.remove()
                } catch {
                    mcl.adminMessage(`Could Not Remove Entity: ${entity.typeId} | ${entity.nameTag}`)
                }
            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:nicknametypes', ['set', 'reset', 'toggle'])

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:nick',
        description: 'Manage Nick Names',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:nicknametypes'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'nickname'
            }
        ]
    }, (evd, nicktypes, nickname) => {
        /**@type {Player | undefined} */
        const player = evd?.sourceEntity
        if (!player) return

        const enabled = mcl.jsonWGet('darkoak:nicknamesettings')?.enabled
        if ((nicktypes === 'reset' || nicktypes === 'set') && !enabled) {
            player.sendMessage('§cNicknames Are Disabled§r')
            return
        }
        
        system.runTimeout(() => {
            switch (nicktypes) {
                case 'reset':
                    player.sendMessage('§aNickname Reset!§r')
                    mcl.pRemove(player, 'darkoak:nickname')
                    break
                case 'set':
                    player.sendMessage(`§aNickname Set To §r§f${nickname || ''}`)
                    mcl.jsonPSet(player, 'darkoak:nickname', {
                        nick: nickname.substring(0, 20) || ''
                    })
                    break
                case 'toggle':
                    if (mcl.isDOBAdmin(player)) {
                        mcl.jsonWSet('darkoak:nicknamesettings', {
                            enabled: !enabled || false
                        })
                        player.sendMessage(`§aNicknames Are Now Set To ${!enabled}`)
                    } else {
                        player.sendMessage('§cYou Must Be An Admin To Toggle Nicknames§r')
                    }
                    break
            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:landclaims', ['add', 'remove', 'players', 'empty'])
    evd.customCommandRegistry.registerEnum('darkoak:landclaimadmin', ['add', 'remove'])

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:landclaim',
        description: 'Landclaims',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:landclaims'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:landclaimadmin'
            }
        ]
    }, (evd, landclaimtype, adm) => {
        /**@type {Player | undefined} */
        const player = evd?.sourceEntity
        if (!player) return

        const settings = mcl.jsonWGet('darkoak:community:general')
        if (!settings?.landclaimsenabled) {
            player.sendMessage('§cLandclaims Are Disabled§r')
            return
        }

        system.runTimeout(() => {
            switch (landclaimtype) {
                case 'add':
                case 'empty':
                    const centerX = Math.round(player.location.x)
                    const centerZ = Math.round(player.location.z)

                    const claimRadius = settings?.landclaimSize || 16

                    const newClaim = {
                        p1: { x: centerX + claimRadius, z: centerZ + claimRadius },
                        p2: { x: centerX - claimRadius, z: centerZ - claimRadius }
                    }

                    let places = mcl.listGetValues('darkoak:landclaim:')
                    for (let index = 0; index < places.length; index++) {
                        const place = JSON.parse(places[index])
                        if (place.p1 && place.p2 && chat.landclaimCheck(newClaim, place)) {
                            player.sendMessage('§cLand Has Already Been Claimed!§r')
                            return
                        }
                    }
                    if (landclaimtype === 'empty') {
                        const INVALID_NAME = 'INVALIDINVALIDINVALIDINVALIDINVALIDINVALIDINVALIDINVALID'
                        if (!mcl.isDOBAdmin(player)) {
                            player.sendMessage('§cYou Need To Be An Admin To Use "empty"§r')
                            return
                        }
                        if (adm === 'add') {
                            mcl.jsonWSet(`darkoak:landclaim:${player.name}`, {
                                ...newClaim,
                                owner: INVALID_NAME,
                                players: [INVALID_NAME]
                            })
                        } else if (adm === 'remove') {
                            ///////////////////////////FIXFIXFIXFIX///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        }
                    } else {
                        mcl.jsonWSet(`darkoak:landclaim:${player.name}`, {
                            ...newClaim,
                            owner: player.name,
                            players: [player.name]
                        })
                    }
                    player.sendMessage('§aLand Claimed!§r')
                    break
                case 'remove':
                    if (!mcl.wRemove(`darkoak:landclaim:${player.name}`)) {
                        player.sendMessage('§cYou Don\'t Own A Landclaim!§r')
                    } else {
                        player.sendMessage('§aYou No Longer Own A Landclaim!§r')
                    }
                    break
                case 'players':
                    interfacesTwo.landclaimMainUI(player)
                    break
            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:inventypes', ['save', 'load'])

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:inventory',
        description: 'Save And Load Player Inventories',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'players'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:inventypes'
            },
            {
                type: CustomCommandParamType.String,
                name: 'inventory_name'
            }
        ]
    }, (evd, players, inventype, nameInven) => {

        // evd?.sourceEntity?.sendMessage('§cCurrently Not Working')
        // return

        const dimen = mcl.customSlashDimen(evd)

        system.runTimeout(() => {
            for (let index = 0; index < players.length; index++) {
                /**@type {Player} */
                const player = players[index]

                switch (inventype) {
                    case 'save':

                        // entity creation
                        const inv = player.dimension.spawnEntity('darkoak:inv_accessor54', player.location)

                        // duping
                        const invenP = mcl.getInventory(player)
                        const invenA = mcl.getInventory(inv)
                        for (let index1 = 0; index1 < invenP.inventorySize; index1++) {
                            const item = invenP.container.getItem(index1)
                            invenA.container.setItem(index1, item)
                        }

                        // saving section
                        if (world.structureManager.getWorldStructureIds().includes(`darkoak:inventory_${nameInven}`)) world.structureManager.delete(`darkoak:inventory_${nameInven}`)
                        world.structureManager.createFromWorld(`darkoak:inventory_${nameInven}`, player.dimension, player.location, {
                            x: player.location.x,
                            y: player.location.y + 1,
                            z: player.location.z,
                        }, {
                            includeBlocks: false,
                            includeEntities: true,
                            saveMode: StructureSaveMode.World,
                        })
                        inv.remove()
                        break
                    case 'load':
                        // loading section
                        world.structureManager.place(`darkoak:inventory_${nameInven}`, player.dimension, player.location, {
                            includeBlocks: false,
                            includeEntities: true,
                        })

                        // clear, copy, and kill
                        const inv2 = player.dimension.getEntitiesAtBlockLocation(player.location).filter(e => e.typeId === 'darkoak:inv_accessor54')[0]
                        const invenP2 = mcl.getInventory(player)
                        const invenA2 = mcl.getInventory(inv2)
                        for (let index2 = 0; index2 < invenP2.inventorySize; index2++) {
                            invenA2.container.swapItems(index2, index2, invenP2.container)
                        }
                        inv2.remove()

                        break
                }

            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:kitstypes', ['add', 'remove', 'export', 'import', 'load', 'list'])
    // add = string remove = string  export = string  import = string  load = string, players

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:kits',
        description: 'Modify And Create Kits, Will Modify Your Held Item!',
        permissionLevel: CommandPermissionLevel.Admin,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:kitstypes'
            },
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'kitname_or_json'
            },
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'players'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'check'
            }
        ]
    }, (evd, kittype, kitname, players, check) => {

        evd?.sourceEntity?.sendMessage('§cCurrently Not Working')
        return

        /**@type {Player} */
        const runner = evd?.sourceEntity
        if (!runner) {
            mcl.adminMessage(`Command darkoak:kits Needs To Run From A Player`)
            return
        }

        system.runTimeout(() => {

            /**@type {{items: [{typeId: string, amount: number}, {typeId: string, amount: number}]}} */
            const kit = mcl.jsonWGet(`darkoak:kits:${kitname}`)

            const heldItemData = mcl.itemToData(mcl.getHeldItem(runner))

            switch (kittype) {
                case 'add':
                    if (!kit) {
                        runner.sendMessage('§aAdded New Kit!')
                    }
                    let newItems = kit?.items || []
                    newItems.push(heldItemData)
                    mcl.jsonWSet(`darkoak:kits:${kitname}`, {
                        items: newItems
                    })
                    runner.sendMessage('§aAdded New Item!§r')
                    break
                case 'remove':
                    if (!kit || kit.items.length == 0 || check) {
                        if (mcl.wRemove(`darkoak:kits:${kitname}`)) {
                            runner.sendMessage('§aKit Has Been Removed§r')
                        } else {
                            runner.sendMessage(`§cNo Such Kit Exists§r`)
                        }
                        return
                    }

                    if (kit.items.includes(heldItemData)) {
                        const filteredItems = kit.items.filter(e => !(item.typeId === heldItemData.typeId && item.amount === heldItemData.amount))

                        mcl.jsonWSet(`darkoak:kits:${kitname}`, {
                            items: filteredItems
                        })

                        runner.sendMessage('§aItem Removed')
                    } else {
                        runner.sendMessage('§cKit Does\'nt Have That Item. Use Any Player And Set \'check\' To True To Delete This Kit')
                    }

                    break
                case 'export':

                    break
                case 'import':

                    break
                case 'load':

                    break
                case 'list':
                    let itemsMessage = []
                    const kits = mcl.jsonListGetBoth('darkoak:kits:')
                    for (let index = 0; index < kits.length; index++) {
                        const item = JSON.parse(kits[index].value)
                        itemsMessage.push(`${kits[index].id.slice(13)}`)
                        for (let index = 0; index < item.items.length; index++) {
                            const item = item.items[index]
                            itemsMessage.push(`${item.typeId}: ${item.amount}`)
                        }
                    }
                    runner.sendMessage(itemsMessage.join('\n'))
                    break
            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:loretypes', ['add', 'remove'])

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:lore',
        description: 'Adds Lore To The Held Item',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'players'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:loretypes'
            },
            {
                type: CustomCommandParamType.String,
                name: 'lore'
            }
        ]
    }, (evd, players, loretype, loreString) => {
        system.runTimeout(() => {
            for (let index = 0; index < players.length; index++) {
                /**@type {Player} */
                const player = players[index]
                const item = mcl.getHeldItem(player)

                if (!item || item.isStackable) return

                let lore = item.getLore()
                let newItem = new ItemStack(item.type, 1)
                newItem = item

                switch (loretype) {
                    case 'add':
                        lore.push(loreString)
                        newItem.setLore(lore)
                        mcl.getItemContainer(player).setItem(player.selectedSlotIndex, newItem)
                        break
                    case 'remove':
                        lore = lore.filter(e => e != loreString)
                        newItem.setLore(lore)
                        mcl.getItemContainer(player).setItem(player.selectedSlotIndex, newItem)
                        break
                }
            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:tpatypes', ['to', 'ac'])

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:tpa',
        description: 'Manage TPA Requests',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:tpatypes'
            },
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player'
            }
        ]
    }, (evd, type, players) => {
        /**@type {Player} */
        const runner = evd?.sourceEntity
        if (!runner) return

        /**@type {Player} */
        const tpto = players[0]

        const d = mcl.jsonWGet('darkoak:tpa')
        if (!d?.enabled) {
            runner.sendMessage('§cTPA Is Disabled§r')
            return
        }

        system.runTimeout(() => {
            switch (type) {
                case 'to':
                    mcl.pSet(tpto, 'darkoak:tpr', runner.name)
                    tpto.sendMessage(`§a${runner.name} Wants To Tp To You! Use "/tpa ac" To Accept`)
                    break
                case 'ac':
                    const player = mcl.getPlayer(mcl.pGet(runner, 'darkoak:tpr'))
                    if (player && player.name === tpto.name) {
                        player.teleport(runner.location)
                        player.sendMessage('§aYour TPA Request Was Accepted!§r')
                    }
                    break
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:m',
        description: 'Send A Message In Chat',
        permissionLevel: CommandPermissionLevel.Any,
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'message_or_nothing'
            }
        ]
    }, (evd, message) => {
        system.runTimeout(() => {
            if (!evd?.sourceEntity) return
            if (message) {
                chat.chatSystem(undefined, evd?.sourceEntity, message)
            } else {
                interfacesTwo.messageSender(evd?.sourceEntity)
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:swap',
        description: 'Swaps Two Players Inventory Slots',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player1'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'slot1'
            },
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'player2'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'slot2'
            },
        ]
    }, (evd, player1, slot1, player2, slot2) => {
        system.runTimeout(() => {
            /**@type {Player} */
            const p1 = player1[0]
            /**@type {Player} */
            const p2 = player2[0]
            p1.getComponent(EntityComponentTypes.Inventory).container.swapItems(slot1, slot2, p2.getComponent(EntityComponentTypes.Inventory).container)
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:opencui',
        description: 'Opens A Custom UI',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'players'
            },
            {
                type: CustomCommandParamType.String,
                name: 'tag'
            }
        ]
    }, (evd, players, tag) => {
        system.runTimeout(() => {
            let uisF = mcl.listGetBoth('darkoak:ui:')
            for (let index = 0; index < uisF.length; index++) {
                const parts = JSON.parse(uisF[index].value)
                if (tag !== parts.tag) continue

                const type = uisF[index].id.split(':')[2]

                for (let index = 0; index < players.length; index++) {
                    const player = players[index]
                    switch (type) {
                        case 'message':
                            messageUIBuilder(player, parts.title, parts.body, parts.button1, parts.button2, parts.command1, parts.command2)
                            break
                        case 'action':
                            actionUIBuilder(player, parts.title, parts.body, parts.buttons)
                            break
                        case 'modaltext':
                            modalTextUIBuilder(player, parts)
                            break
                    }
                }
            }

        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:votetypes', ['1', '2', '3', '4', 'yes', 'no', 'open', 'close'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:vote',
        description: 'Voting System',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:votetypes'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'question'
            }
        ]
    }, (evd, type, question) => {
        const currentVote = mcl.jsonWGet('darkoak:voting')

        switch (type) {
            case 'open':
                if (!question) return {
                    status: CustomCommandStatus.Failure,
                    message: 'Question Must Be Filled For Opening A Vote'
                }
                mcl.jsonWSet('darkoak:voting', {
                    'question': question,
                    '1': 0,
                    '2': 0,
                    '3': 0,
                    '4': 0,
                    'yes': 0,
                    'no': 0,
                    'voted': []
                })
                world.sendMessage(`§aVOTE§f: ${question}`)
                break
            case 'close':
                if (!currentVote) return {
                    status: CustomCommandStatus.Failure,
                    message: 'No Open Vote Found'
                }
                world.sendMessage(`§aVOTE RESULTS§f:\nOption 1: ${currentVote['1']}\nOption 2: ${currentVote['2']}\nOption 3: ${currentVote['3']}\nOption 4: ${currentVote['4']}\nYes\'s: ${currentVote['yes']}\nNo\'s: ${currentVote['no']}`)
                mcl.wRemove('darkoak:voting')
                break
            case '1':
            case '2':
            case '3':
            case '4':
            case 'yes':
            case 'no':
                if (!currentVote) return {
                    status: CustomCommandStatus.Failure,
                    message: 'No Open Vote Found'
                }
                let toPush = ''
                switch (evd.sourceType) {
                    case CustomCommandSource.Block:
                        toPush = evd.sourceBlock.location.x.toString() + evd.sourceBlock.location.y.toString() + evd.sourceBlock.location.z.toString() + 'BLOCK'
                        break
                    case CustomCommandSource.Entity:
                        toPush = evd.sourceEntity.nameTag + 'ENTITY'
                        break
                    case CustomCommandSource.NPCDialogue:
                        toPush = evd.initiator.nameTag + 'NPC'
                        break
                    case CustomCommandSource.Server:
                        toPush = 'SERVER'
                        break
                }
                /**@type {string[]} */
                let newVoted = currentVote['voted']
                if (newVoted.includes(toPush)) return {
                    status: CustomCommandStatus.Failure,
                    message: 'You\'ve Already Voted!'
                }
                newVoted.push(toPush)
                mcl.jsonWUpdate('darkoak:voting', 'voted', newVoted)
                const newAmount = parseInt(currentVote[type]) + 1
                mcl.jsonWUpdate('darkoak:voting', type, newAmount)
                return {
                    status: CustomCommandStatus.Success,
                    message: `You\'ve Voted For Option ${type}, It Is Now ${newAmount}`
                }
                break
        }
    })

    evd.customCommandRegistry.registerEnum('darkoak:attributes', ['reset', 'size', 'health', 'damage', 'movement', 'pushable'])
    // ['0.1s', '0.5s', '1.0s', '1.5s', '2.0s']
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:attribute',
        description: 'Changes A Players Attributes',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'players',
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:attributes'
            },
            {
                type: CustomCommandParamType.String,
                name: 'value'
            },
        ]
    }, (evd, players, attribute, val, view) => {
        /**@type {string[]} */
        let modified = []
        let r = 0
        for (let index = 0; index < players.length; index++) {
            /**@type {Player} */
            const player = players[index]

            if (attribute === 'reset') {
                trigger(player, 'darkoak:reset')
            } else {
                trigger(player, `darkoak:${attribute}${val}`)
            }
            modified.push(player.name)

        }
        if (modified.length === players.length) {
            r = 1
        } else if (modified.length > 0) {
            r = 2
        } else if (modified.length < 1) {
            r = 3
        }

        switch (r) {
            case 1:
                return {
                    status: CustomCommandStatus.Success,
                    message: `All Players Were Modified`
                }
            case 2:
                return {
                    status: CustomCommandStatus.Success,
                    message: `Some Players Were Modified: ${modified.join()}`
                }
            case 3:
                return {
                    status: CustomCommandStatus.Failure,
                    message: `No Players Were Modified`
                }
        }

        function trigger(player, event) {
            system.runTimeout(() => {
                player.triggerEvent(event)
            })
        }
    })
}

// world.afterEvents.dataDrivenEntityTrigger.subscribe((evd) => {
//     console.log(evd.eventId)
//     if (evd.eventId === 'minecraft:entity_spawned') {
//         // try checking if this works!
//         console.log(evd.entity.typeId)
//     }
// })

// world.afterEvents.messageReceive.subscribe((evd) => {
//     console.log(evd.id, evd.message, evd.player.name)
// })

