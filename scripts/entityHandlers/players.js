import { world, Player, EntityComponentTypes, ItemUseAfterEvent, system, EntityHitEntityAfterEvent, EntityDamageCause, ItemComponentTypes, EnchantmentTypes, EffectTypes, ItemStack } from "@minecraft/server"
import { mcl } from "../logic"
import { itemToDamage } from "../data/arrays"

let sitMap = new Map()
let sittersMap = new Map()

/**
 * @param {Player} player 
 */
export function sitCheck(player) {
    const sitters = mcl.getAllEntities('darkoak:sitter')
    for (let index = 0; index < sitters.length; index++) {
        const s = sitters[index]
        if (s.getComponent(EntityComponentTypes.Rideable).getRiders().length < 1) {
            const ls = s.location
            mcl.getPlayer(sittersMap.get(s.nameTag))?.teleport({
                x: ls.x,
                y: ls.y + 0.3,
                z: ls.z,
            })
            sittersMap.delete(s.nameTag)
            s.remove()
        }
        system.runTimeout(() => {
            try {
                mcl.stopPlayer(s)
            } catch {

            }
        })
    }

    const d = mcl.jsonWGet('darkoak:community:general')
    if (!d?.sittingenabled) return

    const vd = player.getViewDirection()
    if (!player.isOnGround || !player.isSneaking || vd.y > -0.8) {
        sitMap.set(player.name, 0)
        return
    }
    sitMap.set(player.name, (sitMap.get(player.name) || 0) + 1)
    if (sitMap.get(player.name) > ((d?.sittingtime || 2) * 20)) {
        sitMap.set(player.name, 0)
        const l = player.location
        const sitter = player.dimension.spawnEntity('darkoak:sitter', {
            x: l.x,
            y: l.y - 0.2,
            z: l.z
        }, {
            initialRotation: player.getRotation().y
        })
        sitter.getComponent(EntityComponentTypes.Rideable)?.addRider(player)
        const g = mcl.timeUuid()
        sitter.nameTag = g
        sittersMap.set(g, player.name)
    }
}


let magicMap = new Map()

/**
 * @param {ItemUseAfterEvent} evd 
 */
export function magicItem(evd) {
    const d = mcl.jsonWGet('darkoak:magic')
    const player = evd.source
    const magic = magicMap.get(player.name)

    if (!d?.enabled) return

    /**@type {string} */
    const spell = magic?.slot1 + magic?.slot2 + magic?.slot3 + magic?.slot4
    // 1 = sneak, 2 = jump, 3 = look up, 4 = look down, 5 = sprint, 6 = sneak jump 

    // if (evd.itemStack.typeId === 'darkoak:magic_talisman') {

    //     if (magic?.cast) {
    //         let newItem = new ItemStack(evd.itemStack.type, evd.itemStack.amount)
    //         newItem = evd.itemStack
    //         let ogLore = evd.itemStack.getLore()
    //         ogLore.push(`Spell: ${spell}`)
    //         newItem.setLore(ogLore)
    //         mcl.getInventory(player).container.setItem(mcl.getInventory(player).container.find(mcl.getHeldItem(player)), newItem)
    //     } else if (magic?.mana >= (d?.cost || 1)) {
    //         const newSpell = evd.itemStack.getLore().filter(e => e.startsWith('Spell: '))[0].replace('Spell: ', '')
    //         spellTyper(newSpell, d, player)
    //     }

    //     magicMap.set(player.name, {
    //         enabled: false,
    //         mana: magic?.mana - (d?.cost || 1),
    //         slot1: '0',
    //         slot2: '0',
    //         slot3: '0',
    //         slot4: '0',
    //         cast: false
    //     })
    //     return
    // }

    if (evd.itemStack.typeId != 'darkoak:magic_book') return
    if (magic?.cast && magic?.mana >= (d?.cost || 1)) {
        let type = ''
        // add: freeze spell, disorient 
        type = spellTyper(spell, d, player)

        if (d?.messages) {
            if (type) {
                player.sendMessage(`§aYou Casted... ${type}!§r`)
            } else {
                player.sendMessage(`§cYou Miscasted!§r`)
            }
        }

        magicMap.set(player.name, {
            enabled: false,
            mana: magic?.mana - (d?.cost || 1),
            slot1: '0',
            slot2: '0',
            slot3: '0',
            slot4: '0',
            cast: false
        })
    } else {
        magicMap.set(player.name, {
            enabled: true,
            mana: magic?.mana || (d?.maxmana || 20),
            slot1: '0',
            slot2: '0',
            slot3: '0',
            slot4: '0',
            cast: false
        })
    }
}

function spellTyper(spell, d, player) {
    const vd = player.getViewDirection()
    const loc = player.location
    let type
    switch (spell) {
        case '1111':
            if (d?.teleport?.enabled) {
                for (let index = 0; index < (d?.teleport?.distance || 5); index++) {
                    mcl.pCommand(player, `tp @s ^ ^ ^1 ${!d?.teleport?.blocks}`)
                }
                type = 'Teleport'
            }
            break
        case '1112':
            if (d?.jump?.enabled) {
                mcl.knockback(player, 0, 0, (d?.jump?.height || 1) / 10)
                type = 'Jump'
            }
            break
        case '1113':
            const ran = mcl.ranNumInRange2(1, 50)
            if (ran === 30) {
                const efd = {
                    showParticles: false,
                    amplifier: 5
                }
                player.addEffect('strength', mcl.secondsToTicks(10), efd)
                player.addEffect('speed', mcl.secondsToTicks(10), efd)
                player.addEffect('jump_boost', mcl.secondsToTicks(10), efd)
                player.addEffect('instant_health', 1, { amplifier: 1 })
                type = 'Prayer (Success)'
            } else {
                type = 'Prayer (§cFailed§a)'
            }
            break
        case '1114':

            break
        case '1121':

            break
        case '1122':

            break
        case '1132':
            if (d?.firewave?.enabled) {
                const a = (d?.firewave?.size || 5)
                mcl.pCommand(player, `fill ~${a} ~ ~${a} ~-${a} ~ ~-${a} fire replace air`)
                system.runTimeout(() => {
                    mcl.pCommand(player, `fill ~${a} ~ ~${a} ~-${a} ~-1 ~-${a} air replace fire`)
                }, 5)
                type = 'Fire Wave'
            }
            break
        case '1166':
            if (d?.heal?.enabled) {
                system.runTimeout(() => {
                    mcl.pCommand(player, `effect @a [r=${d?.heal?.size || 5}] regeneration 1 ${d?.heal?.amount || 10} true`)
                })
                type = 'Heal'
            }
            break
        case '1341':
            if (d?.domainexpansion?.enabled) {
                const locF = {
                    x: Math.floor(loc.x),
                    y: Math.floor(loc.y),
                    z: Math.floor(loc.z),
                }
                mcl.sphereGenerator(locF, player.dimension.id, (d?.domainexpansion?.size || 10), (d?.domainexpansion?.type || 'minecraft:obsidian'), true)
                player.addEffect('minecraft:strength', 300, {
                    amplifier: 3,
                    showParticles: false,
                })
                player.runCommand(`effect @a [r=${(d?.domainexpansion?.size || 10)},name=!"${player.name}"] weakness 15 3 true`)
                player.runCommand(`effect @a [r=${(d?.domainexpansion?.size || 10)}] night_vision 15 3 true`)
                system.runTimeout(() => {
                    mcl.sphereGenerator(locF, player.dimension.id, (d?.domainexpansion?.size || 10), 'minecraft:air', true)
                }, 300)

                type = 'DOMAIN EXPANSION'
            }
            break
        case '2222':
            mcl.knockback(player, vd.x * 2, vd.z * 2, vd.y)
            type = 'Dash'
            break
        case '3222':
            if (d?.fireball?.enabled) {
                player.getEntitiesFromViewDirection({
                    maxDistance: (d?.fireball?.distance || 30)
                })[0]?.entity?.setOnFire((d?.fireball?.time || 5))
                type = 'FIRE BALL'
            }
            break
        case '3331':
            mcl.pCommand(player, `summon lightning_bolt ^ ^ ^5`)
            type = 'Lightning'
            break
        case '3322':
            player.addEffect('levitation', 100, {
                amplifier: 1,
                showParticles: false
            })
            type = 'Levitation'
            break
        case '3332':
            if (d?.firespew?.enabled) {
                for (let index = 2; index < ((d?.firespew?.distance || 5) + 2); index++) {
                    mcl.archimedesSpiral((d?.firespew?.size || 1), 10, 0.07, (x, z) => {
                        mcl.pCommand(player, `fill ^${x} ^${z} ^${index} ^${x} ^${z} ^${index} fire replace air`)
                    })
                }
                type = 'Fire Spew'
            }
            break
        case '3434':
            const blown = player.getEntitiesFromViewDirection({
                maxDistance: 20,
            })
            for (let index = 0; index < blown.length; index++) {
                const b = blown[index]?.entity
                mcl.knockback(b, vd.x * 3, vd.z * 3, 0)
            }
            type = 'Push'
            break
        case '3455':
            mcl.archimedesSpiral(2, 10, 0.35, (x, z) => {
                system.runTimeout(() => {
                    player.teleport({
                        x: loc.x + x,
                        y: loc.y,
                        z: loc.z + z,
                    }, {
                        checkForBlocks: true,
                        keepVelocity: true,
                    })
                }, Math.abs(x * 4))
            })
            system.runTimeout(() => {
                player.teleport(loc, {
                    checkForBlocks: true,
                    keepVelocity: true,
                })
            }, 20)
            type = 'Disorient'
            break
        case '4111':

            break
        case '4411':
            if (d?.earthquake?.enabled) {
                for (let index = 0; index < (d?.earthquake?.length || 5); index++) {
                    mcl.pCommand(player, `summon evocation_fang ^ ^ ^${index + 1}`)
                }
                type = 'Earthquake'
            }
            break
        case '4433':

            break
        case '4441':
            let o = 0
            mcl.archimedesSpiral(2, 20, 0.35, (x, z) => {
                o++
                if (o > 7) mcl.pCommand(player, `summon evocation_fang ~${x} ~ ~${z}`)
            })
            type = 'Rumble'
            break
        case '5432':
            player.addLevels(1)
            type = 'Level Up'
            break
        case '5552':
            if (d?.sneak?.enabled) {
                player.addEffect('invisibility', ((d?.sneak?.time || 5) * 20), {
                    amplifier: 1,
                    showParticles: (d?.sneak?.particles || false)
                })
                type = 'Sneak'
            }
            break
        case '5556':
            player.dimension.createExplosion({
                x: loc.x + (vd.x * 5),
                y: loc.y + (vd.y * 5),
                z: loc.z + (vd.z * 5),
            }, 4, {
                breaksBlocks: false,
                causesFire: false
            })
            type = 'Explode'
            break
    }
    return type
}

/**
 * @param {Player} player 
 */
export function magicSlotter(player) {
    const magic = magicMap.get(player.name)

    manaRegen(player)

    if (!magic?.enabled) return

    // if (mcl.getHeldItem(player)?.typeId != 'darkoak:magic_book') {
    //     magicMap.set(player.name, {
    //         enabled: false,
    //         mana: magic?.mana,
    //         slot1: '0',
    //         slot2: '0',
    //         slot3: '0',
    //         slot4: '0',
    //         cast: false
    //     })
    //     return
    // }

    // check player action (eg sneaking) apply number to slot1, wait for player to stop the action and detect next action to put into slot2
    if (magic?.slot1 === '0' && mcl.tickTimer(10)) {
        indivSlotter(player, 1)
        return
    } else if (magic?.slot2 === '0' && mcl.tickTimer(10)) {
        indivSlotter(player, 2)
        return
    } else if (magic?.slot3 === '0' && mcl.tickTimer(10)) {
        indivSlotter(player, 3)
        return
    } else if (magic?.slot4 === '0' && mcl.tickTimer(10)) {
        indivSlotter(player, 4)
        return
    } else if (magic?.slot1 != '0' && magic?.slot2 != '0' && magic?.slot3 != '0' && magic?.slot4 != '0') {
        magicMap.set(player.name, {
            enabled: magic?.enabled,
            mana: magic?.mana,
            slot1: magic?.slot1,
            slot2: magic?.slot2,
            slot3: magic?.slot3,
            slot4: magic?.slot4,
            cast: true
        })
    }
    // console.log(JSON.stringify(magicMap.get(player.name)))
    player.onScreenDisplay.setActionBar(`§${magic?.slot1}& §${magic?.slot2}& §${magic?.slot3}& §${magic?.slot4}&\n§rMana: ${magic?.mana}`)
    // player.sendMessage({rawtext: [{text: `§${magic?.slot1}& §${magic?.slot2}& §${magic?.slot3}& §${magic?.slot4}&`}]})

}

/**
 * @param {Player} player 
 */
function manaRegen(player) {
    const magic = magicMap.get(player.name)
    const d = mcl.jsonWGet('darkoak:magic')
    if (d?.enabled && mcl.tickTimer(21) && magic?.mana < d?.maxmana) {
        let setto = (magic?.mana || 0) + (d?.regenrate || 1)
        while (setto > d?.maxmana) {
            setto--
        }
        magicMap.set(player.name, {
            enabled: magic?.enabled,
            mana: setto,
            slot1: magic?.slot1,
            slot2: magic?.slot2,
            slot3: magic?.slot3,
            slot4: magic?.slot4,
            cast: magic?.cast
        })
    }
}

/**
 * @param {Player} player 
 * @param {number} slotnum 
 */
function indivSlotter(player, slotnum) {
    const magic = magicMap.get(player.name)
    const vd = player.getViewDirection()
    if (player.isSneaking && !player.isJumping) {
        looper(slotnum, 1)
    } else if (player.isJumping && !player.isSneaking) {
        looper(slotnum, 2)
    } else if (vd.y > 0.8) {
        looper(slotnum, 3)
    } else if (vd.y < -0.8) {
        looper(slotnum, 4)
    } else if (player.isSprinting) {
        looper(slotnum, 5)
    } else if (player.isSneaking && player.isJumping) {
        looper(slotnum, 6)
    }

    /**
     * @param {number} number 
     * @param {number} spell 
     */
    function looper(number, spell) {
        switch (number) {
            case 1:
                magicMap.set(player.name, {
                    enabled: magic?.enabled,
                    mana: magic?.mana,
                    slot1: spell.toString(),
                    slot2: magic?.slot2,
                    slot3: magic?.slot3,
                    slot4: magic?.slot4,
                    cast: magic?.cast
                })
                break
            case 2:
                magicMap.set(player.name, {
                    enabled: magic?.enabled,
                    mana: magic?.mana,
                    slot1: magic?.slot1,
                    slot2: spell.toString(),
                    slot3: magic?.slot3,
                    slot4: magic?.slot4,
                    cast: magic?.cast
                })
                break
            case 3:
                magicMap.set(player.name, {
                    enabled: magic?.enabled,
                    mana: magic?.mana,
                    slot1: magic?.slot1,
                    slot2: magic?.slot2,
                    slot3: spell.toString(),
                    slot4: magic?.slot4,
                    cast: magic?.cast
                })
                break
            case 4:
                magicMap.set(player.name, {
                    enabled: magic?.enabled,
                    mana: magic?.mana,
                    slot1: magic?.slot1,
                    slot2: magic?.slot2,
                    slot3: magic?.slot3,
                    slot4: spell.toString(),
                    cast: magic?.cast
                })
                break
        }
    }
}

/**@type {Set<string>} */
export const crashSet = new Set()

/**
 * @param {Player[]} players 
 */
export function crashJob(players) {
    const pna = players.map(e => e.name)
    crashSet.forEach(e => {
        if (pna.includes(e)) {
            let i = 0
            let crashArray = []
            while (i < 40) {
                crashArray.push(`\uE51F`)
                i++
            }
            const m = `§c§k${crashArray.join(`\uE51F`)}§r[${mcl.timeUuid()}]`
            const p = players.filter(r => r.name === e)[0]
            p?.sendMessage(m + m)
            p?.sendMessage(m + m)
        } else {
            crashSet.delete(e)
        }
    })
}

const combatMap = new Map()

/**
 * @param {EntityHitEntityAfterEvent} evd 
 */
export function customCombatSystem(evd) {
    const d = mcl.jsonWGet('darkoak:customcombat')
    if (!d?.enabled) return

    /**@type {Player} */
    const attacker = evd?.damagingEntity
    /**@type {Player} */
    const victim = evd?.hitEntity

    if (attacker.typeId != 'minecraft:player' || victim.typeId != 'minecraft:player') return
    if (!attacker.hasTag('darkoak:combat')) attacker.addTag('darkoak:combat')
    if (!victim.hasTag('darkoak:combat')) victim.addTag('darkoak:combat')

    const current = combatMap.get(attacker.name)

    const now = Date.now()
    const delay = now - (current?.time || 0)

    let hit = false

    if (delay > (d?.delay * 1000)) {
        const weapon = mcl.getHeldItem(attacker)
        if (!weapon) {
            damage(1)
            hit = true
        } else {
            let toDamage = 1
            const itd = itemToDamage
            for (let index = 0; index < itd.length; index++) {
                const i = itd[index]
                if (weapon.typeId === i.type) {
                    toDamage += i.damage
                    break
                }
            }
            const enc = weapon.getComponent(ItemComponentTypes.Enchantable)
            if (enc) {
                const enchants = enc.getEnchantments()
                for (let index = 0; index < enchants.length; index++) {
                    const enchant = enchants[index]
                    if (enchant.type === EnchantmentTypes.get('minecraft:sharpness')) {
                        toDamage += Math.floor(1.25 * enchant.level)
                        break
                    }
                }
            }
            damage(toDamage)
            hit = true
        }
    }
    if (hit) combatMap.set(attacker.name, {
        time: now
    })

    function damage(damage = 1) {
        const vd = attacker.getViewDirection()
        let newDamage = damage

        let strengthLevel = attacker?.getEffect('minecraft:strength')?.amplifier
        if (strengthLevel) {
            let power = Math.pow(1.3, (strengthLevel + 1))
            let diver = ((power - 1) / 0.3)
            newDamage = (newDamage * power + diver)
        }

        if ((d?.maxdamage || 0) != 0) {
            while (newDamage > (d?.maxdamage || 10)) {
                newDamage--
            }
        }
        victim.applyDamage(newDamage, {
            cause: EntityDamageCause.entityAttack
        })

        if (d?.customknockback) {

        } else {
            mcl.knockback(victim, vd.x, vd.z, vd.y)
        }
    }
}

/**
 * @param {Player} player 
 */
export function customCombatToggle(player) {
    const d = mcl.jsonWGet('darkoak:customcombat')
    if (!d?.enabled && player.hasTag('darkoak:combat')) player.removeTag('darkoak:combat')
}