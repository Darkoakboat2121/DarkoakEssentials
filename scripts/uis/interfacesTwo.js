import { world, system, Player, Entity, ItemStack } from "@minecraft/server"
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import * as interfaces from "./interfaces"
import { customEnchantActions, customEnchantEvents } from "../enchanting"


/**UI for data editor item
 * @param {Player} player 
 * @param {Entity} entity 
 */
export function dataEditorEntityUI(player, entity) {
    let f = new ModalFormData()
    f.title('Data Editor')

    f.textField('\nName:', '', entity.nameTag)
    f.toggle('Remove Entity?', false)
    f.textField('Command On Interact:', 'Example: tp @s 0 0 0')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        entity.nameTag = e[0]
        if (e[1]) {
            entity.remove()
        }
    })
}

export function genMainUI(player) {
    let f = new ActionFormData()
    f.title('Generator Settings')

    f.button('Add New')
    f.button('Remove One')
    f.button('Modify One')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch(evd.selection) {
            case 0:
                genAddUI(player)
                break
            case 1:
                genRemoveUI(player)
                break
            case 2:
                genModifyPickerUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    })
}

/**
 * @param {Player} player 
 */
export function genAddUI(player) {
    let f = new ModalFormData()

    let b = player.getBlockFromViewDirection()
    let n = undefined
    if (b != undefined && b.block.isValid()) {
        n = b.block.location
    } else {
        n = {x: '', y: '', z: ''}
    }

    f.textField('Block ID:', 'Example: minecraft:diamond_ore')
    f.textField('Co-ords:', 'Example: 10 1 97', `${n.x} ${n.y} ${n.z}`.trimStart())

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        const blockId = e[0].trimStart()
        const coords1 = e[1].trimStart()
        mcl.jsonWSet(`darkoak:gen:${mcl.timeUuid()}`, {block: blockId, coords: coords1})
    })
}

export function genRemoveUI(player) {
    let f = new ActionFormData()
    f.title('Remove A Generator')

    const raw = mcl.listGet('darkoak:gen:')
    const gens = mcl.listGetValues('darkoak:gen:')

    for (const gen of gens) {
        const g = JSON.parse(gen)
        f.button(`Delete: ${g.block}, ${g.coords}`)
    }

    if (gens === undefined || gens.length === 0) {
        player.sendMessage('§cNo Generators Found§r')
        return
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(raw[evd.selection])
    })
}

export function genModifyPickerUI(player) {
    let f = new ActionFormData()
    f.title('Generator To Modify')

    const raw = mcl.listGet('darkoak:gen:')
    const gens = mcl.listGetValues('darkoak:gen:')

    for (const gen of gens) {
        const g = JSON.parse(gen)
        f.button(`Modify: ${g.block}, ${g.coords}`)
    }

    if (gens === undefined || gens.length === 0) {
        player.sendMessage('§cNo Generators Found§r')
        return
    }
    
    f.show(player).then((evd) => {
        if (evd.canceled) return
        genModifyUI(player, raw[evd.selection])
    })
}

export function genModifyUI(player, gen) {
    let f = new ModalFormData()
    const data = mcl.jsonWGet(gen)
    f.title('Modify')

    f.textField('Block ID:', '', data.block)
    f.textField('Co-ords:', '', data.coords)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        const blockId = e[0].trimStart()
        const coords1 = e[1].trimStart()
        mcl.jsonWSet(gen, {block: blockId, coords: coords1})
    })
}


export function tpaSettings(player) {
    let f = new ModalFormData()

    f.toggle('Enabled?')
    f.toggle('Can TP To Admins In Creative?')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.jsonWSet('darkoak:tpa', {enabled: e[0], adminTp: e[1]})
    })
}

export function createWarpUI(player) {
    let f = new ModalFormData()
    f.title('Create Warp')

    f.textField('Warp Name:', 'Example: Spawn')
    f.textField('Co-ords To TP:', 'Example: 0 1 0')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.jsonWSet(`darkoak:warp:${mcl.timeUuid()}`, {name: e[0].trim(), coords: e[1].trim()})
    })
}

export function deleteWarpUI(player) {
    let f = new ActionFormData()
    f.title('Delete A Warp')

    const raw = mcl.listGet('darkoak:warp:')
    const warps = mcl.listGetValues('darkoak:warp:')
    for (const warp of warps) {
        const data = JSON.parse(warp)
        f.button(`${data.name}`)
    }
    if (warps.length === 0 || warps === undefined) {
        player.sendMessage('§cNo Warps Found§r')
        return
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(raw[evd.selection])
    })
}

export function tpaUI(player) {
    let f = new ModalFormData()
    f.title('TPA')

    const names = mcl.playerNameArray()
    f.dropdown('\nPlayer:', names)

    const data = mcl.jsonWGet('darkoak:tpa')
    if (!data.enabled) return

    f.show(player).then((evd) => {
        if (evd.canceled) return
        tpaRecieveUI(mcl.getPlayer(names[evd.formValues[0]]), player)
    })
}

/**
 * @param {Player} reciever 
 * @param {Player} sender 
 */
export function tpaRecieveUI(reciever, sender) {
    let f = new ActionFormData()
    f.title('TPA')
    f.body(`\nCan ${sender.name} TP to You?`)

    f.button('Yes')
    f.button('No')
    f.button('No And Notify')

    f.show(reciever).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                reciever.runCommandAsync(`tp ${sender.name} ${reciever.name}`)
                sender.sendMessage('§aTPA Request Accepted!§r')
                break
            case 1:
                break
            case 2:
                sender.sendMessage('§cTPA Request Denied§r')
                break
        }
    })
}

/**
 * 
 * @param {Player} player 
 */
export function anticheatMain(player) {
    let f = new ActionFormData()
    f.title('Anticheat')

    if (!player.hasTag('darkoak:admin') && !player.hasTag('darkoak:mod')) {
        player.sendMessage('§cYou Aren\'t An Admin Or Mod§r')
        return
    }

    if (player.hasTag('darkoak:admin')) {
        f.button('Anticheat Settings')
    }
    if (player.hasTag('darkoak:admin') || player.hasTag('darkoak:mod')) {
        f.button('Punishments')
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        if (player.hasTag('darkoak:admin')) {
            if (evd.selection === 0) {
                anticheatSettings(player)
            } else {
                interfaces.playerPunishmentsMainUI(player)
            }
        } else {
            interfaces.playerPunishmentsMainUI(player)
        }

    })
}


export function anticheatSettings(player) {
    let f = new ModalFormData()
    f.title('Anticheat Settings')

    const d = mcl.jsonWGet('darkoak:anticheat')

    f.toggle('Pre-bans', d.prebans)
    f.toggle('Anti-nuker', d.antinuker)
    f.toggle('Anti-fast-place', d.antifastplace)
    f.toggle('Anti-fly 1', d.antifly1)
    f.toggle('Anti-speed 1', d.antispeed1)
    f.toggle('Anti-spam', d.antispam)
    f.toggle('Anti-illegal-enchant', d.antiillegalenchant)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.jsonWSet('darkoak:anticheat', {
            prebans: e[0], 
            antinuker: e[1], 
            antifastplace: e[2],
            antifly1: e[3],
            antispeed1: e[4],
            antispam: e[5],
            antiillegalenchant: e[6]
        })
    })
}


export function auctionMain(player) {
    let f = new ActionFormData()
    f.title('Auction House')

    f.button('Add Item')
    f.button('Buy Item')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch(evd.selection) {
            case 0:
                auctionAddUI(player)
                break
            case 1:
                auctionHouse(player)
                break
        }
    })
}

export function auctionAddUI(player) {

}

export function auctionHouse(player) {
    let f = new ActionFormData()
    f.title('Auction House')

    const raw = mcl.listGet('darkoak:auction:item')
    const value = mcl.listGetValues('darkoak:auction:item')

    for (const item of value) {
        const d = JSON.parse(item)
        f.button(`${d.item} for ${d.price}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
    })
}

/**
 * 
 * @param {Player} player 
 */
export function customEnchantsMain(player) {
    let f = new ModalFormData()
    f.title('Custom Enchant')

    const events = customEnchantEvents
    const actions = customEnchantActions

    f.dropdown('\n(While Holding Item)\nEvent:', events)
    f.dropdown('\nAction:', actions)

    f.slider('\nExplode: Explosion Radius\nExtra Damage: Damage Amount\nDash: Dash Distance\nPower', 1, 20, 1)
    
    f.submitButton('Enchant Held Item?')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues

        const ev = events[e[0]]
        const ac = actions[e.at(1)]
        const am = e[2]

        const i = mcl.getHeldItem(player)
        let item = new ItemStack(i.type, i.amount)
        let lore = i.getLore();
        lore.push(`§r§5${ev}-${ac}-${am}`);
        item.setLore(lore)
        item.nameTag = i.nameTag || item.nameTag

        mcl.getItemContainer(player).setItem(player.selectedSlotIndex, item)
    })
}

export function protectedAreasMain(player) {
    let f = new ActionFormData()
    f.title('World Protection')

    f.button('World Protection')
    f.button('Add New Area')
    f.button('Remove An Area')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                worldProtection(player)
                break
            case 1:
                protectedAreasAddUI(player)
                break
            case 2:
                protectedAreasRemoveUI(player)
                break
        }
    })
}


export function worldProtection(player) {
    let f = new ModalFormData()
    f.title('World Protection')

    const data = mcl.jsonWGet('darkoak:worldprotection')

    f.toggle('Ban Boats?', data.boats)
    f.toggle('Ban Ender Pearls?', data.pearls)
    f.toggle('Ban Water Buckets?', data.water)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.jsonWSet('darkoak:worldprotection', {
            boats: e[0],
            pearls: e[1],
            water: e[2]
        })
    })
}

/**
 * @param {Player} player 
 */
export function protectedAreasAddUI(player) {
    let f = new ModalFormData()
    f.title('Add Protected Area')
    const loc = player.location

    f.textField('\n(x z)\nCoordinates 1:', 'Example: 0 0')
    f.textField('\n(x z)\nCoordinates 2:', 'Example: 10 20', `${loc.x.toFixed(0)} ${loc.z.toFixed(0)}`)

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const coords1 = evd.formValues[0].trim().split(' ')
        const coords2 = evd.formValues[1].trim().split(' ')
        
        const pa = {
            p1: {x: coords1[0], z: coords1[1]},
            p2: {x: coords2[0], z: coords2[1]}
        }
        mcl.jsonWSet(`darkoak:protection:${mcl.timeUuid()}`, pa)
    })
}

export function protectedAreasRemoveUI(player) {
    let f = new ActionFormData()
    f.title('Remove Protected Area')

    const raw = mcl.listGet('darkoak:protection:')
    const values = mcl.listGetValues('darkoak:protection:')

    for (const area of values) {
        const p = JSON.parse(area)
        f.button(`${p.p1.x} ${p.p1.z} to ${p.p2.x} ${p.p2.z}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(raw[evd.selection])
    })
}


export function personalLogUI(player) {
    let f = new ModalFormData()
    f.title('Personal Log')

    f.textField('Log:', '')
}