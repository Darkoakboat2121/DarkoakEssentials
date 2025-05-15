import { world, system, Player, Entity, ItemStack, Block } from "@minecraft/server"
import { ActionFormData, MessageFormData, ModalFormData, uiManager, UIManager } from "@minecraft/server-ui"
import { mcl } from "../logic"
import * as interfaces from "./interfaces"
import { customEnchantActions, customEnchantEvents } from "../enchanting"
import { hashtags, preBannedList } from "../data/arrays"
import { bui } from "./baseplateUI"
import * as modal from "./modalUI"


/**UI for data editor item
 * @param {Player} player 
 * @param {Entity} entity 
 */
export function dataEditorEntityUI(player, entity) {
    let f = new ModalFormData()
    f.title('Data Editor')

    f.textField('\nName:', '', {
        defaultValue: entity.nameTag || ''
    })
    f.toggle('Remove Entity?', {
        defaultValue: false
    })
    f.textField('Command On Interact:', 'Example: tp @s 0 0 0', {
        defaultValue: entity.getDynamicProperty('darkoak:interactcommand') || ''
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        if (e[1]) {
            entity.remove()
            return
        }
        entity.nameTag = e[0]
        entity.setDynamicProperty('darkoak:interactcommand', e[2])
    })
}

/**
 * @param {Player} player 
 * @param {Block} block 
 */
export function dataEditorBlockUI(player, block) {
    let f = new ModalFormData()
    f.title('Data Editor')

    const loc = block.location
    let d = ''

    const defaults = mcl.listGetValues('darkoak:blockinteractcommand:')
    for (let index = 0; index < defaults.length; index++) {
        const p = JSON.parse(defaults[index])
        if (p.coords.x === loc.x && p.coords.y === loc.y && p.coords.z === loc.z) {
            d = p.command
        }
    }

    f.textField('Command On Interact:', 'Example: tp @s 0 0 0', {
        defaultValue: d
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return

        mcl.jsonWSet(`darkoak:blockinteractcommand:${mcl.timeUuid()}`, {
            command: evd.formValues[0],
            coords: { x: loc.x, z: loc.z, y: loc.y }
        })
    })
}

export function genMainUI(player) {
    let f = new ActionFormData()
    f.title('Generator Settings')

    f.button('Add New\n§7Create A New Generator')
    f.button('Remove One\n§7Remove an Existing Generator')
    f.button('Modify One\n§7Modify An Existing Generator')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch (evd.selection) {
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
    let n
    if (b) {
        n = b.block.location
    } else {
        n = {x: '', y: '', z: ''}
    }

    f.textField('Block ID:', 'Example: minecraft:diamond_ore')
    f.textField('Co-ords:', 'Example: 10 1 97', {
        defaultValue: `${n.x || ''} ${n.y || ''} ${n.z || ''}`.trim()
    })

    const dimensions = ['overworld', 'nether', 'the_end']
    let def = 0
    switch (player.dimension.id) {
        case 'overworld':
            def = 0
            break
        case 'nether':
            def = 1
            break
        case 'the_end':
            def = 2
            break
    }
    f.dropdown('Dimension:', dimensions, {
        defaultValueIndex: def
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        const blockId = e[0].trim()
        const coords1 = e[1].trim()
        mcl.jsonWSet(`darkoak:gen:${mcl.timeUuid()}`, { 
            block: blockId, coords: coords1, dimension: dimensions[e[2]]
        })
    })
}

export function genRemoveUI(player) {
    let f = new ActionFormData()
    f.title('Remove A Generator')

    const raw = mcl.listGet('darkoak:gen:')
    const gens = mcl.listGetValues('darkoak:gen:')

    if (gens === undefined || gens.length === 0) {
        player.sendMessage('§cNo Generators Found§r')
        return
    }

    for (let index = 0; index < gens.length; index++) {
        const g = JSON.parse(gens[index])
        f.button(`Delete: ${g.block}\n${g.coords}, ${g.dimension || 'overworld'}`)
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

    if (gens === undefined || gens.length === 0) {
        player.sendMessage('§cNo Generators Found§r')
        return
    }

    for (let index = 0; index < gens.length; index++) {
        const g = JSON.parse(gens[index])
        f.button(`Modify: ${g.block}\n${g.coords}, ${g.dimension || 'overworld'}`)
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

    f.textField('Block ID:', '', {
        defaultValue: data.block
    })
    f.textField('Co-ords:', '', {
        defaultValue: data.coords
    })

    const dimensions = ['overworld', 'nether', 'the_end']
    let def = 0
    switch (player.dimension.id) {
        case 'overworld':
            def = 0
            break
        case 'nether':
            def = 1
            break
        case 'the_end':
            def = 2
            break
    }
    f.dropdown('Dimension:', dimensions, {
        defaultValueIndex: def
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        const blockId = e[0].trimStart()
        const coords1 = e[1].trimStart()
        mcl.jsonWSet(gen, { block: blockId, coords: coords1, dimension: dimensions[e[2]] })
    })
}

export function tpaSettings(player) {
    let f = new ModalFormData()

    const d = mcl.jsonWGet('darkoak:tpa')

    f.toggle('Enabled?', {
        defaultValue: d.enabled
    })
    f.toggle('Can TP To Admins In Creative?', {
        defaultValue: d.adminTp
    })

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.warpSettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet('darkoak:tpa', { enabled: e[0], adminTp: e[1] })
    })
}

export function createWarpUI(player) {
    let f = new ModalFormData()
    f.title('Create Warp')

    f.textField('Warp Name:', 'Example: Spawn')
    f.textField('Co-ords To TP:', 'Example: 0 1 0')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.warpSettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet(`darkoak:warp:${mcl.timeUuid()}`, { name: e[0].trim(), coords: e[1].trim() })
    })
}

export function deleteWarpUI(player) {
    let f = new ActionFormData()
    f.title('Delete A Warp')

    const raw = mcl.listGet('darkoak:warp:')
    const warps = mcl.listGetValues('darkoak:warp:')

    if (warps.length === 0 || warps === undefined) {
        player.sendMessage('§cNo Warps Found§r')
        return
    }

    for (let index = 0; index < array.length; index++) {
        const data = JSON.parse(warps[index])
        f.button(`${data.name}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.warpSettingsUI(player)
            return
        }
        mcl.wSet(raw[evd.selection])
    })
}

export function tpaUI(player) {
    let f = new ModalFormData()
    f.title('TPA')

    const names = bui.namePicker(f, undefined, '\nPlayer:')

    const data = mcl.jsonWGet('darkoak:tpa')
    if (!data.enabled) {
        player.sendMessage('§cTPA Is Disabled§r')
        return
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.warpsUI(player)
            return
        }
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
        switch (evd.selection) {
            case 0:
                reciever.runCommand(`tp "${sender.name}" "${reciever.name}"`)
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

    f.label('§cRemember To Always Verify If The Player Is Actually Hacking. Anticheat Always Has A Chance Of False Positives.')

    f.toggle('Pre-bans', {
        defaultValue: d.prebans || false
    })
    f.label('Automatically Bans Hackers Darkoakboat2121 Knows About')
    f.label(`Full list:\n${preBannedList.join(' | ')}`)
    
    f.divider()
    
    f.toggle('Anti-nuker', {
        defaultValue: d.antinuker || false
    })
    f.label('Checks If A Player Is Breaking Blocks Too Fast')
    
    f.divider()
    
    f.toggle('Anti-fast-place', {
        defaultValue: d.antifastplace || false
    })
    f.label('Checks If A Player Is Placing Blocks Too Fast')
    
    f.divider()
    
    f.toggle('Anti-fly 1', {
        defaultValue: d.antifly1 || false
    })
    f.label('Checks If A Player Is Flying Like In Creative Mode But Without Creative')
    
    f.divider()
    
    f.toggle('Anti-speed 1', {
        defaultValue: d.antispeed1 || false
    })
    f.label('Checks If Player Is Moving Too Fast')
    
    f.divider()
    
    f.toggle('Anti-spam', {
        defaultValue: d.antispam || false
    })
    f.label('Checks The Players Recent Messages For Repeats, Automatically Formats To Ensure Spaces And Formatting Codes Don\'t Bypass It')
    f.label('This Also Checks If The Message Matches Common Hack Client Messages')
    
    f.divider()
    
    f.toggle('Anti-illegal-enchant', {
        defaultValue: d.antiillegalenchant || false
    })
    f.label('Checks If The Held Item Of A Player Has Illegal Enchants')
    
    f.divider()
    
    f.toggle('Anti-killaura', {
        defaultValue: d.antikillaura || false
    })
    f.label('Checks If The Players CPS Is Too High')
    
    f.divider()
    
    f.toggle('Anti-gamemode-switcher', {
        defaultValue: d.antigamemode || false
    })
    f.label('Prevents Non-Admins From Changing Gamemodes §c(Buggy)§r')
    
    f.divider()
    
    f.toggle('Npc detector', {
        defaultValue: d.npcdetect || false
    })
    f.label('Sends Chat Message To Admins When A Npc Is Interacted With, Also Prevents Usage Of Npc\'s §c(Don\'t Enable If You Use Npc\'s)§r')
    
    f.divider()
    
    f.toggle('Anti-fly 2', {
        defaultValue: d.antifly2 || false
    })
    f.label('Checks If The Player Is Flying And Gliding At The Same Time')
    
    f.divider()
    
    f.toggle('Anti-fly 3', {
        defaultValue: d.antifly3 || false
    })
    f.label('Checks If The Player Is Gliding Weirdly (If Player Is Going Up Without Looking Up)')
    
    f.divider()
    
    f.toggle('Anti-invalid 1', {
        defaultValue: d.antiinvalid1 || false
    })
    f.label('Checks If The Player Is Sneaking And Sprinting At The Same Time')
    
    f.divider()
    
    f.toggle('Anti-invalid 2', {
        defaultValue: d.antiinvalid2 || false
    })
    f.label('Checks If The Player Is Sprinting Backwards')
    
    f.divider()
    
    f.toggle('Anti-invalid 3', {
        defaultValue: d.antiinvalid3 || false
    })
    f.label('Checks If The Player Is Climbing A Ladder Too Quickly')
    
    f.divider()
    
    f.toggle('Anti-speed 2', {
        defaultValue: d.antispeed2 || false
    })
    f.label('Checks If The Player Is Going At Insane Speeds')
    
    f.divider()
    
    f.toggle('Anti-block-reach', {
        defaultValue: d.antiblockreach || false
    })
    f.label('Checks If The Player Places A Block Farther Away Than Allowed (Also Cancels Block Placement If Too Far)')
    
    f.divider()
    
    f.toggle('Notify Admins In Chat', {
        defaultValue: d.notify || false
    })
    f.label('If This Is On It Notifies Admins When An Anticheat Module Goes Off')
    f.divider()

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
            antiillegalenchant: e[6],
            antikillaura: e[7],
            antigamemode: e[8],
            npcdetect: e[9],
            antifly2: e[10],
            antifly3: e[11],
            antiinvalid1: e[12],
            antiinvalid2: e[13],
            antiinvalid3: e[14],
            antispeed2: e[15],
            antiblockreach: e[16],
            notify: e[17],
        })
    })
}


export function auctionMain(player) {
    let f = new ActionFormData()
    f.title('Auction House')

    f.button('Add Item')
    f.button('Buy Item')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.communityMoneyUI(player)
            return
        }

        switch (evd.selection) {
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
    let f = new ModalFormData()
    f.title('Add Item')

    f.textField('\nAdd An Item Into The Auction House? It\'s Permanant! Also This Will Remove Any Enchantments.\nPrice:', 'Example: 100')

    f.slider('Slot', 1, 9)

    f.submitButton(`Add Item?`)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        if (isNaN(evd.formValues[0])) {
            auctionAddUI(player)
            return
        }
        const item = mcl.getItemContainer(player).getItem(evd.formValues[1])
        mcl.jsonWSet(`darkoak:auction:item${mcl.timeUuid()}`, mcl.itemToData(item))
    })
}

/**
 * @param {Player} player 
 */
export function auctionHouse(player) {
    let f = new ActionFormData()
    f.title('Auction House')

    const raw = mcl.listGet('darkoak:auction:item')
    const value = mcl.listGetValues('darkoak:auction:item')

    if (value.length === 0 || value === undefined) {
        player.sendMessage('§cNo Warps Found§r')
        return
    }

    for (let index = 0; index < value.length; index++) {
        const d = JSON.parse(value[index])
        f.button(`${d.itemTypeId} x${d.itemAmount} for ${d.price}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const selected = JSON.parse(value[evd.selection])
        if (mcl.buy(player, selected.price)) {
            player.runCommand(`give "${player.name}" ${selected.itemTypeId} ${selected.itemAmount}`)
            mcl.wSet(raw[evd.selection])
        }
    })
}

/**
 * @param {Player} player 
 */
export function customEnchantsMain(player) {
    let f = new ModalFormData()
    f.title('Custom Enchant')

    const events = customEnchantEvents
    const actions = customEnchantActions

    f.dropdown('\n(While Holding Item)\nEvent:', events)
    f.dropdown('\nAction:', actions)

    f.slider('\nExplode: Explosion Radius\nExtra Damage: Damage Amount\nDash: Dash Distance\nPower', 1, 20)

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
        switch (evd.selection) {
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

    f.toggle('Ban Boats?', {
        defaultValue: data.boats
    })
    f.toggle('Ban Ender Pearls?', {
        defaultValue: data.pearls
    })
    f.toggle('Ban Water Buckets?', {
        defaultValue: data.water
    })

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
    f.textField('\n(x z)\nCoordinates 2:', 'Example: 10 20', {
        defaultValue: `${loc.x.toFixed(0)} ${loc.z.toFixed(0)}`
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const coords1 = evd.formValues[0].trim().split(' ')
        const coords2 = evd.formValues[1].trim().split(' ')

        const pa = {
            p1: { x: coords1[0], z: coords1[1] },
            p2: { x: coords2[0], z: coords2[1] }
        }
        mcl.jsonWSet(`darkoak:protection:${mcl.timeUuid()}`, pa)
    })
}

export function protectedAreasRemoveUI(player) {
    let f = new ActionFormData()
    f.title('Remove Protected Area')

    const raw = mcl.listGet('darkoak:protection:')
    const values = mcl.listGetValues('darkoak:protection:')

    if (values.length === 0 || values === undefined) {
        player.sendMessage('§cNo Warps Found§r')
        return
    }

    for (let index = 0; index < values.length; index++) {
        const p = JSON.parse(values[index])
        f.button(`${p.p1.x} ${p.p1.z} to ${p.p2.x} ${p.p2.z}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(raw[evd.selection])
    })
}

/**
 * @param {Player} player 
 */
export function personalLogUI(player) {
    let f = new ModalFormData()
    f.title('Personal Log')

    f.textField('\nAdd Entry:', '')

    let personalLogs = mcl.pListGetBoth(player, 'darkoak:personallog:')
    personalLogs.sort((a, b) => {
        const logA = JSON.parse(a.value)
        const logB = JSON.parse(b.value)
        return logB.time - logA.time
    })
    if (personalLogs.length > 100) {
        while (personalLogs.length > 100) {
            personalLogs.pop()
        }
    }
    if (personalLogs.length != 0) {
        for (let index = 0; index < personalLogs.length; index++) {
            const log = JSON.parse(personalLogs[index].value)
            f.label(log.message)
            f.divider()
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.communityMain(player)
            return
        }
        const uuid = mcl.timeUuid()
        mcl.jsonPSet(player, `darkoak:personallog:${uuid}`, {
            message: evd.formValues[0],
            time: uuid.split('T')[1]
        })
        personalLogUI(player)
    })
}

export function messageLogUI(player) {
    let f = new ActionFormData()
    f.title('Message Log')

    let logs = mcl.jsonWGet('darkoak:messagelogs').log
    for (let index = 0; index < logs.length; index++) {
        f.label(logs[index])
        f.divider()
    }

    f.button('Dismiss')

    f.show(player)
}

export function landclaimMainUI(player) {
    let f = new ActionFormData()
    f.title('Landclaim Manager')

    if (!mcl.jsonWGet(`darkoak:landclaim:${player.name}`)) {
        player.sendMessage('§cYou Don\'t Own A Landclaim!§r')
        return
    }

    f.button('Add Player To Landclaim')
    f.button('Remove Player From Landclaim')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch (evd.selection) {
            case 0:
                landclaimAddPlayerUI(player)
                break
            case 1:
                landclaimRemovePlayerUI(player)
                break
        }
    })
}

export function landclaimAddPlayerUI(player) {
    let f = new ModalFormData()

    f.title('Add Player')

    const pl = bui.namePicker(f, undefined, '\nPlayer:')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        let d = mcl.jsonWGet(`darkoak:landclaim:${player.name}`)
        mcl.jsonWSet(`darkoak:landclaim:${player.name}`, {
            p1: { x: d.p1.x, z: d.p1.z },
            p2: { x: d.p2.x, z: d.p2.z },
            owner: d.owner,
            players: d.players.push(pl[evd.formValues[0]])
        })
    })
}

export function landclaimRemovePlayerUI(player) {
    let f = new ModalFormData()
    let d = mcl.jsonWGet(`darkoak:landclaim:${player.name}`)
    f.title('Remove Player')

    f.dropdown('Player:', d.players)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.jsonWSet(`darkoak:landclaim:${player.name}`, {
            p1: { x: d.p1.x, z: d.p1.z },
            p2: { x: d.p2.x, z: d.p2.z },
            owner: d.owner,
            players: d.players.slice(evd.formValues[0], evd.formValues[0])
        })
        // remove the player that was picked, not sure if working, check please
    })
}


export function addRankUI(player) {
    let f = new ModalFormData()
    f.title('Add Rank')

    const pl = bui.namePicker(f, undefined, '\nPlayer:')
    f.textField('Rank To Add:', 'Example: §1Admin§r')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        mcl.getPlayer(pl[evd.formValues[0]]).addTag(`rank:${evd.formValues[1]}`)
    })
}

export function removeRankUI(player) {
    let f = new ModalFormData()
    f.title('Remove Rank')

    const tl = mcl.playerTagsArray().filter(e => e.startsWith('rank:'))

    const pl = bui.namePicker(f, undefined, '\nPlayer:')
    f.dropdown('Rank To Remove:', tl.map(e => e.replace('rank:', '')))

    f.show(player).then((evd) => {
        if (evd.canceled) return

        mcl.getPlayer(pl[evd.formValues[0]]).removeTag(tl[evd.formValues[1]])
    })
}

export function addGiftcode(player) {
    let f = new ModalFormData()
    f.title('Add Giftcode')

    f.textField('Code:', 'Example: secretcode123')
    f.textField('Command On Redeem:', 'Example: give @s diamond 1')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const e = evd.formValues
        mcl.jsonWSet(`darkoak:giftcode:${mcl.timeUuid()}`, {
            code: e[0],
            command: e[1],
        })
    })
}

export function redeemGiftcodeUI(player, priorCode, failMessage) {
    let f = new ModalFormData()
    f.title('Redeem Giftcode')

    f.label(failMessage || '')
    f.textField('Code:', 'Example: secretcode123', {
        defaultValue: priorCode || ''
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return

        let codes = mcl.listGetBoth('darkoak:giftcode:')
        for (let index = 0; index < codes.length; index++) {
            const code = JSON.parse(codes[index].value)
            if (evd.formValues[0] === code.code) {
                if (code.command) player.runCommand(code.command)
                mcl.wRemove(codes[index].id)
                return
            }
        }
        redeemGiftcodeUI(player, evd.formValues[0], '§cNot A Code!§r')
    })
}

export function CUIEditPicker(player) {
    let f = new ActionFormData()
    f.title('CUI Picker')

    const uis = mcl.listGetBoth('darkoak:ui:')
    for (let index = 0; index < uis.length; index++) {
        const ui = uis[index]
        const v = JSON.parse(ui.value)
        f.button(`Type: ${ui.id.split(':')[2]}, Title: ${v.title}, Tag: ${v.tag}\nBody: ${v.body}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        if (uis[evd.selection].id.split(':')[2] == 'action') {
            CUIEditUI(player, true, uis[evd.selection].id)
        } else {
            CUIEditUI(player, false, uis[evd.selection].id)
        }
    })
}

/**
 * @param {Player} player 
 * @param {boolean} action 
 * @param {string} id 
 */
export function CUIEditUI(player, action, id) {
    const ui = mcl.jsonWGet(id)
    if (action) {
        let f = new ModalFormData()
        f.title('Action UI Button Picker')
        f.slider('Amount Of Buttons', 1, 10, {
            defaultValue: ui.buttons.length
        })

        f.show(player).then((evd) => {
            if (evd.canceled) return
            actionUIEditUI(player, evd.formValues[0], id)
        })
    } else {
        let rf = new ModalFormData()
        const d = mcl.jsonWGet(id)
        rf.title('Message UI Editor')

        rf.textField('UI Title:', 'Example: Welcome!', {
            defaultValue: d.title
        })
        rf.textField('UI Body Text:', 'Example: Hello there!', {
            defaultValue: d.body
        })
        rf.textField('Tag To Open:', 'Example: welcomemessage', {
            defaultValue: d.tag
        })
        rf.textField('UI Button 1:', 'Example: Hi!', {
            defaultValue: d.button1
        })
        rf.textField('UI Button 2:', 'Example: Hello!', {
            defaultValue: d.button2
        })
        rf.textField('Button1 Command:', 'Example: tp @s 0 0 0', {
            defaultValue: d.command1
        })
        rf.textField('Button2 Command:', 'Example: tp @s 6 2 7', {
            defaultValue: d.command2
        })

        rf.show(player).then((revd) => {
            if (revd.canceled) return

            const e = revd.formValues
            const ui = { title: e[0], body: e[1], tag: e[2], button1: e[3], command1: e[5], button2: e[4], command2: e[6] }
            mcl.jsonWSet(id, ui)
        })
    }
}

export function actionUIEditUI(player, amount, id) {
    let f = new ModalFormData()
    const d = mcl.jsonWGet(id)
    f.title('Action UI Editor')

    f.label(hashtags)

    f.textField('Title:', 'Example: Warps', {
        defaultValue: d.title || ''
    })
    f.textField('Body:', 'Example: Click A Button To TP', {
        defaultValue: d.body || ''
    })
    f.textField('Tag To Open:', 'Example: warpmenu', {
        defaultValue: d.tag || ''
    })

    for (let index = 1; index <= amount; index++) {
        f.textField(`Button ${index}:`, '', {
            defaultValue: d.buttons[index - 1].title || ''
        })
        f.textField(`Command ${index}:`, '', {
            defaultValue: d.buttons[index - 1].command || ''
        })
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues

        const title = e[0]
        const body = e[1]
        const tag = e[2]

        let buttons = []
        for (let index = 3; index < e.length; index += 2) {
            buttons.push({ title: e[index], command: e[index + 1] })
        }

        const ui = { title, body, tag, buttons }

        mcl.jsonWSet(id, ui)
    })
}

export function chatGamesSettings(player) {
    let f = new ModalFormData()
    f.title('Chat Games')

    const d = mcl.jsonWGet('darkoak:chatgames')

    f.toggle('Unscrambler Enabled?', {
        tooltip: 'Toggles Whether The Game Runs',
        defaultValue: d.unscrambleEnabled || false
    })
    f.textField('List Of Words', 'Example: word1, word2, word3', {
        tooltip: 'Seperate Words With , ',
        defaultValue: d.unscrambleWords || ''
    })
    f.slider('Interval', 1, 10, {
        tooltip: 'Interval In Minutes Between Games',
        defaultValue: d.unscrambleInterval || 1,
        valueStep: 1
    })
    f.textField('Reward Command:', 'Example: give @s diamond 1', {
        tooltip: 'Command To Run On Successful Guess, Runs From The Guesser',
        defaultValue: d.unscrambleCommand || ''
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        if (!e[0]) {
            mcl.wRemove('darkoak:chatgame1:word')
        }
        mcl.jsonWSet('darkoak:chatgames', {
            unscrambleEnabled: e[0],
            unscrambleWords: e[1],
            unscrambleInterval: e[2],
            unscrambleCommand: e[3],
        })
    })
}

export function scriptSettings(player) {
    let f = new ModalFormData()
    f.title('Script Settings')
    f.label('§cIt\'s Not Recommended To Change These Settings§r')

    const d = mcl.jsonWGet('darkoak:scriptsettings')

    f.toggle('Cancel Watchdog Terminating', {
        tooltip: 'If Enabled, Attempts To Cancel A Scripting Crash',
        defaultValue: d.cancelWatchdog || false
    })
    f.toggle('Log Data To Console', {
        tooltip: 'Logs Data Changes To The Console' ,
        defaultValue: d.datalog || false
    })
    f.toggle('Disable All Chat Systems', {
        tooltip: 'Toggles The Chat System, Useful For Compatibility',
        defaultValue: d.chatmaster || false
    })

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.jsonWSet('darkoak:scriptsettings', {
            cancelWatchdog: e[0],
            datalog: e[1],
            chatmaster: e[2],
        })
    })
}

export function modalUIMakerUI(player, uiData = { title: 'New UI', tag: 'tag', elements: [] }) {
    let f = new ActionFormData()
    f.title('Modal UI Maker')

    f.button('Add Element')
    f.button('Edit Elements')
    f.button('Save UI')
    f.button('Preview UI')
    f.button('Settings')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch (evd.selection) {
            case 0:
                modal.modalUIAddElement(player, uiData)
                break
            case 1:
                modal.modalUIEditElements(player, uiData)
                break
            case 2:
                modal.saveModalUI(uiData)
                break
            case 3:
                modal.previewModalUI(player, uiData)
                break
            case 4:
                modal.modalSettingsUI(player, uiData)
                break
        }
    })
}

export function autoResponseMainUI(player) {
    let f = new ActionFormData()
    f.title('Auto-Response')

    f.button('Add')
    f.button('Remove')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch (evd.selection) {
            case 0:
                autoResponseAddUI(player)
                break
            case 1:
                autoResponseRemoveUI(player)
                break
        }
    })
}

export function autoResponseAddUI(player) {
    let f = new ModalFormData()
    f.title('Auto-Response Adding')

    f.label(hashtags)

    f.textField('Word / Phrase:', 'Example: plot')

    f.textField('Response:', 'Example: Plots are $30000')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.jsonWSet(`darkoak:autoresponse:${mcl.timeUuid()}`, {
            word: e[0],
            response: e[1],
        })
    })
}

export function autoResponseRemoveUI(player) {
    let f = new ActionFormData()
    f.title('Auto-Response Removing')

    const res = mcl.listGetBoth('darkoak:autoresponse:')

    for (let index = 0; index < res.length; index++) {
        const p = JSON.parse(res[index].value)
        f.label(`Word / Phrase: ${p.word}\nResponse: ${p.response}`)
        f.button('Delete?')
        f.divider()
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wRemove(res[evd.selection].id)
    })
}

/**UI for custom item settings
 * @param {Player} player 
 */
export function itemSettingsUI(player) {
    let f = new ModalFormData()
    f.title('Item Settings')

    const d = mcl.jsonWGet('darkoak:itemsettings')

    f.divider()
    f.slider('Hop Feather Cooldown', 0, 10, {
        defaultValue: d.hopfeather || 0
    })
    f.toggle('Show Cooldown Message?', {
        defaultValue: d.hopfeatherM || false
    })
    f.divider()

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.worldSettingsUI(player)
            return
        }
        const e = evd.formValues

        mcl.jsonWSet('darkoak:itemsettings', {
            hopfeather: e[0],
            hopfeatherM: e[1],
        })
    })
}

export function floatingTextMainUI(player) {
    let f = new ActionFormData()
    f.title('Floating Text')

    f.button('Add Floating Text')
    f.button('Remove Floating Text')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch (evd.selection) {
            case 0:
                floatingTextAddUI(player)
                break
            case 1:
                floatingTextRemoveUI(player)
                break
        }
    })
}

/**
 * @param {Player} player 
 */
export function floatingTextAddUI(player) {
    let f = new ModalFormData()
    f.title('Add Floating Text')

    f.label('Spawns Floating Text At Your Location')

    f.textField('Text:', 'Example: Hello World!')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const entity = player.dimension.spawnEntity('darkoak:floating_text', player.location)
        entity.nameTag = evd.formValues[0]
    })
}

/**
 * @param {Player} player 
 */
export function floatingTextRemoveUI(player) {
    let f = new ModalFormData()
    f.title('Remove Floating Text')

    const texts = player.dimension.getEntities({type: 'darkoak:floating_text'})
    f.dropdown('Floating Text To Remove:', texts.map(e => e.nameTag))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        texts.at(evd.formValues[0]).remove()
    })
}