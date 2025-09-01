import { world, system, Player, Entity, ItemStack, Block, ItemTypes } from "@minecraft/server"
import { ActionFormData, MessageFormData, ModalFormData, uiManager, UIManager } from "@minecraft/server-ui"
import { mcl } from "../logic"
import * as interfaces from "./interfaces"
import { customEnchantActions, customEnchantEvents } from "../enchanting"
import { hashtags, preBannedList, icons, compress, decompress, replacer, crasherSymbol, modalTextTypes } from "../data/arrays"
import { bui } from "./baseplateUI"
import * as modal from "./modalUI"
import { chatSystem } from "../chat"


/**UI for data editor item
 * @param {Player} player 
 * @param {Entity} entity 
 */
export function dataEditorEntityUI(player, entity) {
    let f = new ModalFormData()
    bui.title(f, 'Data Editor (Entity)')

    bui.textField(f, '\nName:', '', entity.nameTag)
    bui.toggle(f, 'Remove Entity?', false)
    bui.textField(f, 'Command On Interact:', 'Example: tp @s 0 0 0', entity.getDynamicProperty('darkoak:interactcommand'))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        if (e[1]) {
            entity.remove()
            return
        }
        entity.nameTag = e[0]
        entity.setDynamicProperty('darkoak:interactcommand', e[2])
    }).catch()
}

/**
 * @param {Player} player 
 * @param {Block} block 
 */
export function dataEditorBlockUI(player, block) {
    let f = new ModalFormData()
    bui.title(f, 'Data Editor (Block)')

    const loc = block.location
    let d = ''
    let id = ''

    const defaults = mcl.listGetBoth('darkoak:blockinteractcommand:')
    for (let index = 0; index < defaults.length; index++) {
        const p = JSON.parse(defaults[index].value)
        if (p.coords.x === loc.x && p.coords.y === loc.y && p.coords.z === loc.z) {
            d = p.command
            id = defaults[index].id
        }
    }

    bui.textField(f, 'Command On Interact:', 'Example: tp @s 0 0 0', d)

    bui.textField(f, 'Block ID:', 'Example: minecraft:stone', block.typeId)

    bui.toggle(f, 'Remove Block?', false)

    bui.toggle(f, 'Water Log?', block.isWaterlogged)

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const e = bui.formValues(evd)

        if (e[2]) {
            block.setType('minecraft:air')
            return
        }

        if (e[0] && e[0] != d) {
            mcl.jsonWSet(id || `darkoak:blockinteractcommand:${mcl.timeUuid()}`, {
                command: e[0],
                coords: { x: loc.x, z: loc.z, y: loc.y }
            })
        }
        if (e[1] && e[1] != block.typeId) block.setType(e[1])

        if (e[3] != block.isWaterlogged) block.setWaterlogged(e[3])

    }).catch()
}

export function genMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Generator Settings')

    bui.button(f, 'Add New Ore Gen\n§7Create A New Ore Generator', icons.block('emerald_ore'))
    bui.button(f, 'Remove An Ore Gen\n§7Remove an Existing Ore Generator', icons.block('redstone_ore'))
    bui.button(f, 'Modify An Ore Gen\n§7Modify An Existing Ore Generator', icons.block('gold_ore'))
    bui.button(f, 'Add New Mob Gen')
    bui.button(f, 'Remove A Mob Gen')
    bui.button(f, 'Modify A Mob Gen')

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
            case 3:
                mobGenAddUI(player)
                break
            case 4:
                mobGenRemoveUI(player)
                break
            case 5:
                mobGenModifyUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
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
        n = { x: '', y: '', z: '' }
    }

    bui.textField(f, 'Block ID:', 'Example: minecraft:diamond_ore')
    bui.textField(f, 'Co-ords:', 'Example: 10 1 97', `${n.x || ''} ${n.y || ''} ${n.z || ''}`.trim())

    const dimensions = bui.dimensionPicker(f, player, true)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        const blockId = e[0].trim()
        const coords1 = e[1].trim()
        mcl.jsonWSet(`darkoak:gen:${mcl.timeUuid()}`, {
            block: blockId,
            coords: coords1,
            dimension: dimensions[e[2]]
        })
    }).catch()
}

export function genRemoveUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Remove A Generator')

    const raw = mcl.listGet('darkoak:gen:')
    const gens = mcl.listGetValues('darkoak:gen:')

    if (gens === undefined || gens.length === 0) {
        player.sendMessage('§cNo Generators Found§r')
        return
    }

    for (let index = 0; index < gens.length; index++) {
        const g = JSON.parse(gens[index])
        bui.button(f, `Delete: ${g.block}\n${g.coords}, ${g.dimension || 'overworld'}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(raw[evd.selection])
    }).catch()
}

export function genModifyPickerUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Generator To Modify')

    const raw = mcl.listGet('darkoak:gen:')
    const gens = mcl.listGetValues('darkoak:gen:')

    if (gens === undefined || gens.length === 0) {
        player.sendMessage('§cNo Generators Found§r')
        return
    }

    for (let index = 0; index < gens.length; index++) {
        const g = JSON.parse(gens[index])
        bui.button(f, `Modify: ${g.block}\n${g.coords}, ${g.dimension || 'overworld'}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        genModifyUI(player, raw[evd.selection])
    }).catch()
}

export function genModifyUI(player, gen) {
    let f = new ModalFormData()
    const data = mcl.jsonWGet(gen)
    bui.title(f, 'Modify')

    bui.textField(f, 'Block ID:', '', data?.block)
    bui.textField(f, 'Co-ords:', '', data?.coords)

    const dimensions = bui.dimensionPicker(f, player, true)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        const blockId = e[0].trimStart()
        const coords1 = e[1].trimStart()
        mcl.jsonWSet(gen, { block: blockId, coords: coords1, dimension: dimensions[e[2]] })
    }).catch()
}

export function tpaSettings(player) {
    let f = new ModalFormData()

    const d = mcl.jsonWGet('darkoak:tpa')

    bui.toggle(f, 'Enabled?', d?.enabled)
    bui.toggle(f, 'Can TP To Admins In Creative?', d?.adminTp)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.warpSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:tpa', { enabled: e[0], adminTp: e[1] })
    }).catch()
}

export function createWarpUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Create Warp')

    bui.textField(f, 'Warp Name:', 'Example: Spawn')
    bui.textField(f, 'Co-ords To TP:', 'Example: 0 1 0')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.warpSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:warp:${mcl.timeUuid()}`, { name: e[0].trim(), coords: e[1].trim() })
    }).catch()
}

export function deleteWarpUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Delete A Warp')

    const raw = mcl.listGet('darkoak:warp:')
    const warps = mcl.listGetValues('darkoak:warp:')

    if (warps.length === 0 || warps === undefined) {
        player.sendMessage('§cNo Warps Found§r')
        return
    }

    for (let index = 0; index < array.length; index++) {
        const data = JSON.parse(warps[index])
        bui.button(f, `${data.name}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.warpSettingsUI(player)
            return
        }
        mcl.wSet(raw[evd.selection])
    }).catch()
}

export function tpaUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'TPA')

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
    }).catch()
}

/**
 * @param {Player} reciever 
 * @param {Player} sender 
 */
export function tpaRecieveUI(reciever, sender) {
    let f = new ActionFormData()
    bui.title(f, 'TPA')
    bui.body(f, `\nCan ${sender.name} TP to You?`)

    bui.button(f, 'Yes')
    bui.button(f, 'No')
    bui.button(f, 'No And Notify')

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
    }).catch()
}

/**
 * 
 * @param {Player} player 
 */
export function anticheatMain(player) {
    let f = new ActionFormData()
    bui.title(f, 'Anticheat')

    if (!player.hasTag('darkoak:admin') && !player.hasTag('darkoak:mod')) {
        player.sendMessage('§cYou Aren\'t An Admin Or Mod§r')
        return
    }

    if (mcl.isDOBAdmin(player)) {
        bui.button(f, 'Anticheat Settings')
    }
    if (mcl.isDOBAdmin(player)) {
        bui.button(f, 'Logs')
    }
    if (mcl.isDOBAdmin(player) || player.hasTag('darkoak:mod')) {
        bui.button(f, 'Punishments', icons.item('flint_and_steel'))
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        if (player.hasTag('darkoak:admin')) {
            if (evd.selection === 0) {
                anticheatSettings(player)
            } else if (evd.selection === 1) {
                interfaces.logsUI(player)
            } else {
                interfaces.playerPunishmentsMainUI(player)
            }
        } else {
            interfaces.playerPunishmentsMainUI(player)
        }

    }).catch()
}


export function anticheatSettings(player) {
    let f = new ModalFormData()
    bui.title(f, 'Anticheat Settings')

    const d = mcl.jsonWGet('darkoak:anticheat')

    bui.label(f, '§cRemember To Always Verify If The Player Is Actually Hacking. Anticheat Always Has A Chance Of False Positives.')

    bui.toggle(f, 'Pre-bans', d?.prebans)
    bui.label(f, 'Automatically Bans Hackers Darkoakboat2121 Knows About')
    bui.label(f, `Full list:\n${preBannedList.join(' | ')}`)

    bui.divider(f)

    bui.toggle(f, 'Anti-nuker 1', d?.antinuker)
    bui.label(f, 'Checks If A Player Is Breaking Blocks Too Fast')

    bui.divider(f)

    bui.toggle(f, 'Anti-fast-place', d?.antifastplace)
    bui.label(f, 'Checks If A Player Is Placing Blocks Too Fast')

    bui.divider(f)

    bui.toggle(f, 'Anti-fly 1', d?.antifly1)
    bui.label(f, 'Checks If A Player Is Flying Like In Creative Mode But Without Creative')

    bui.divider(f)

    bui.toggle(f, 'Anti-speed 1', d?.antispeed1)
    bui.label(f, 'Checks If Player Is Moving Too Fast')

    bui.divider(f)

    bui.toggle(f, 'Anti-spam', d?.antispam)
    bui.label(f, 'Checks The Players Recent Messages For Repeats, Automatically Formats To Ensure Spaces And Formatting Codes Don\'t Bypass It')
    bui.label(f, 'This Also Checks If The Message Matches Common Hack Client Messages')
    bui.toggle(f, 'Attempt To Bypass Anti-Anti-Spammer Hack?', d?.antispam2, 'May Have False Positives. Does Not Notify / Log')

    bui.divider(f)

    bui.toggle(f, 'Anti-illegal-enchant', d?.antiillegalenchant)
    bui.label(f, 'Checks If The Held Item Of A Player Has Illegal Enchants')

    bui.divider(f)

    bui.toggle(f, 'Anti-killaura', d?.antikillaura)
    bui.label(f, 'Checks If The Players CPS Is Too High')

    bui.divider(f)

    bui.toggle(f, 'Anti-gamemode-switcher', d?.antigamemode)
    bui.label(f, 'Prevents Non-Admins From Changing Gamemodes §c(Buggy)§r')

    bui.divider(f)

    bui.toggle(f, 'Npc detector', d?.npcdetect)
    bui.label(f, 'Sends Chat Message To Admins When A Npc Is Interacted With, Also Prevents Usage Of Npc\'s §c(Don\'t Enable If You Use Npc\'s)§r')

    bui.divider(f)

    bui.toggle(f, 'Anti-fly 2', d?.antifly2)
    bui.label(f, 'Checks If The Player Is Flying And Gliding At The Same Time')

    bui.divider(f)

    bui.toggle(f, 'Anti-fly 3', d?.antifly3)
    bui.label(f, 'Checks If The Player Is Gliding Weirdly (If Player Is Going Up Without Looking Up)')

    bui.divider(f)

    bui.toggle(f, 'Anti-invalid 1', d?.antiinvalid1)
    bui.label(f, 'Checks If The Player Is Sneaking And Sprinting At The Same Time')

    bui.divider(f)

    bui.toggle(f, 'Anti-invalid 2', d?.antiinvalid2)
    bui.label(f, 'Checks If The Player Is Sprinting Backwards')

    bui.divider(f)

    bui.toggle(f, 'Anti-invalid 3', d?.antiinvalid3)
    bui.label(f, 'Checks If The Player Is Climbing A Ladder Too Quickly')

    bui.divider(f)

    bui.toggle(f, 'Anti-speed 2', d?.antispeed2)
    bui.label(f, 'Checks If The Player Is Going At Insane Speeds (Also Slows Them Down)')

    bui.divider(f)

    bui.toggle(f, 'Anti-block-reach', d?.antiblockreach)
    bui.label(f, 'Checks If The Player Places A Block Farther Away Than Allowed (Also Cancels Block Placement If Too Far)')

    bui.divider(f)

    bui.toggle(f, 'Notify Admins In Chat', d?.notify)
    bui.label(f, 'If This Is On It Notifies Admins When An Anticheat Module Goes Off')

    bui.divider(f)

    bui.toggle(f, 'Strike Action', d?.strike)
    bui.label(f, 'If This Is On And If A Player Triggers Anticheat Measures, The Player Gets Killed')

    bui.slider(f, 'How Many Should Trigger', 3, 15, d?.strikeamount, 1)

    bui.divider(f)

    bui.toggle(f, 'Anti-crasher 1', d?.anticrasher1)
    bui.label(f, 'Stops Certain Characters From Showing In Chat (They Lag The Server)')

    bui.divider(f)

    bui.toggle(f, 'Anti-nuker 2', d?.antinuker2)
    bui.label(f, 'Checks If The Player Is Looking At A Different Block Than They Are Breaking')

    bui.divider(f)

    bui.toggle(f, 'Anti-NBT 1', d?.antinbt)
    bui.label(f, 'Checks If The Player Has An Item They Shouldn\'t Have At All And Clears It')

    bui.divider(f)

    bui.toggle(f, 'Anti-Dupe 1', d?.antidupe1)
    bui.label(f, 'Adds An ID To Each Non-stackable Item And Checks If Two ID\'s Are The Same, Also Removes Duped Items')

    bui.divider(f)

    bui.toggle(f, 'Anti-NBT 2', d?.antinbt2)
    bui.label(f, 'Bans Items That Are Named The Same As Common Hacked Kits And NBT Exploits')

    bui.divider(f)

    bui.toggle(f, 'Anti-Dupe 2', d?.antidupe2)
    bui.label(f, 'Does Not Work Yet')

    bui.divider(f)

    bui.toggle(f, 'Anti-Admin-Items', d?.antiadminitems, 'This Module Does Not Log')
    bui.label(f, 'Bans Items That Should Only Be Used By Admins, Like Command Blocks')

    bui.divider(f)

    bui.toggle(f, 'Anti-Reach', d?.antireach)
    bui.label(f, 'Checks How Far Away Two Players Are When One Hits Another')

    bui.divider(f)

    bui.toggle(f, 'Anti-Air-Place', d?.antiairplace)
    bui.label(f, 'Checks If A Player Places A Block Without Support')

    bui.divider(f)

    bui.toggle(f, 'Anti-Streamer-Mode', d?.antistreamermode)
    bui.label(f, 'Replaces Certain Characters With Mostly Identical Characters\nUsed To Bypass Streamer Mode, A Hack Used To Hide The Hackers Username So They Can Stream Without Worry')
    bui.label(f, '§cMay Make Chat Look Weird!§r')

    bui.divider(f)

    bui.toggle(f, 'Anti-Crasher 2', d?.anticrasher2)
    bui.label(f, 'Limits World Size To 1mil By 1mil, If A Player Goes Farther They Get Killed')

    bui.divider(f)

    bui.toggle(f, 'Anti-Invalid 4', d?.antiinvalid4)
    bui.label(f, 'Checks If Certain Values Like A Hotbar Slot Are Above Or Below Normal Limits. Does Not Log, Only Sets To Normal')

    bui.divider(f)

    bui.toggle(f, 'Anti-Spammer-Activity', d?.antispamactive)
    bui.label(f, 'Blocks Messages From Actively Moving Players. Being Hit Won\'t Trigger It')

    bui.divider(f)

    bui.toggle(f, 'Anti-Phase', d?.antiphase)
    bui.label(f, 'Checks If The Player Is Inside A Solid Block')

    bui.divider(f)

    bui.toggle(f, 'Anti-Scaffold', d?.antiscaffold)
    bui.label(f, 'Checks If A Player Is Placing Blocks Below Them While Looking Up')

    bui.divider(f)

    bui.toggle(f, 'Anti-Bowspam', d?.antibowspam)
    bui.label(f, 'Checks If The Delay Between Two Shots Isn\'t Within Normal Limits')

    bui.divider(f)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        let i = 0
        mcl.jsonWSet('darkoak:anticheat', {
            prebans: e[i++],
            antinuker: e[i++],
            antifastplace: e[i++],
            antifly1: e[i++],
            antispeed1: e[i++],
            antispam: e[i++],
            antispam2: e[i++],
            antiillegalenchant: e[i++],
            antikillaura: e[i++],
            antigamemode: e[i++],
            npcdetect: e[i++],
            antifly2: e[i++],
            antifly3: e[i++],
            antiinvalid1: e[i++],
            antiinvalid2: e[i++],
            antiinvalid3: e[i++],
            antispeed2: e[i++],
            antiblockreach: e[i++],
            notify: e[i++],
            strike: e[i++],
            strikeamount: e[i++],
            anticrasher1: e[i++],
            antinuker2: e[i++],
            antinbt: e[i++],
            antidupe1: e[i++],
            antinbt2: e[i++],
            antidupe2: e[i++],
            antiadminitems: e[i++],
            antireach: e[i++],
            antiairplace: e[i++],
            antistreamermode: e[i++],
            anticrasher2: e[i++],
            antiinvalid4: e[i++],
            antispamactive: e[i++],
            antiphase: e[i++],
            antiscaffold: e[i++],
            antibowspam: e[i++],
        })
    }).catch()
}


export function auctionMain(player) {
    let f = new ActionFormData()
    bui.title(f, 'Auction House')

    bui.button(f, 'Add Item')
    bui.button(f, 'Buy Item')

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
    }).catch()
}

export function auctionAddUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add Item')

    bui.textField(f, '\nAdd An Item Into The Auction House? It\'s Permanant! Also This Will Remove Any Enchantments.\nPrice:', 'Example: 100')

    bui.slider(f, 'Slot', 1, 9)

    bui.submitButton(f, `Add Item?`)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        if (isNaN(e[0])) {
            auctionAddUI(player)
            return
        }
        const item = mcl.getItemContainer(player).getItem(e[1])
        mcl.jsonWSet(`darkoak:auction:item${mcl.timeUuid()}`, mcl.itemToData(item))
    }).catch()
}

/**
 * @param {Player} player 
 */
export function auctionHouse(player) {
    let f = new ActionFormData()
    bui.title(f, 'Auction House')

    const items = mcl.listGetBoth('darkoak:auction:item')

    if (items === undefined || items.length === 0) {
        player.sendMessage('§cNo Items Found§r')
        return
    }

    for (let index = 0; index < items.length; index++) {
        const d = JSON.parse(items[index].value)
        bui.button(f, `${d.itemTypeId} x${d.itemAmount} for ${d.price}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const selected = JSON.parse(items.at(evd.selection).value)
        if (mcl.buy(player, selected.price, selected.itemTypeId, selected.itemAmount)) mcl.wSet(items[index].id)
    }).catch()
}

export function pressionUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Compress / Decompress')

    bui.button(f, 'Compress Item')
    bui.button(f, 'Decompress Item')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.communityMoneyUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                compressUI(player)
                break
            case 1:
                decompressUI(player)
                break
        }
    })
}

/**
 * @param {Player} player 
 */
export function compressUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Compress Item')

    bui.slider(f, 'Amount Of Stacks To Compress', 1, 10) // 0

    bui.toggle(f, 'Diamonds?') // 1
    bui.toggle(f, 'Netherite Ingots?') // 2
    bui.toggle(f, 'Iron Ingots?') // 3

    f.show(player).then((evd) => {
        if (evd.canceled) {
            pressionUI(player)
            return
        }
        const e = bui.formValues(evd)
        if (e[1]) {
            compress(player, e[0], 'diamond', 'darkoak:compressed_diamond', '§cNot Enough Diamonds!')
        }
        if (e[2]) {
            compress(player, e[0], 'netherite_ingot', 'darkoak:compressed_netherite', '§cNot Enough Netherite Ingots!')
        }
        if (e[3]) {
            compress(player, e[0], 'iron_ingot', 'darkoak:compressed_iron', '§cNot Enough Iron Ingots!')
        }
    })
}

export function decompressUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Decompress Item')

    bui.slider(f, 'Amount Of Items To Decompress', 1, 10) // 0

    bui.toggle(f, 'Diamonds?') // 1
    bui.toggle(f, 'Netherite Ingots?') // 2
    bui.toggle(f, 'Iron Ingots?') // 3

    f.show(player).then((evd) => {
        if (evd.canceled) {
            pressionUI(player)
            return
        }
        const e = bui.formValues(evd)
        if (e[1]) {
            decompress(player, e[0], 'darkoak:compressed_diamond', 'diamond', '§cNot Enough Compressed Diamonds!')
        }
        if (e[2]) {
            decompress(player, e[0], 'darkoak:compressed_netherite', 'netherite_ingot', '§cNot Enough Compressed Netherite Ingots!')
        }
        if (e[3]) {
            decompress(player, e[0], 'darkoak:compressed_iron', 'iron_ingot', '§cNot Enough Compressed Iron Ingots!')
        }
    })
}

/**
 * @param {Player} player 
 */
export function customEnchantsMain(player) {
    let f = new ModalFormData()
    bui.title(f, 'Custom Enchant')

    const events = customEnchantEvents
    const actions = customEnchantActions

    bui.dropdown(f, '\n(While Holding Item)\nEvent:', events)
    bui.dropdown(f, '\nAction:', actions)

    bui.slider(f, '\nExplode: Explosion Radius\nExtra Damage: Damage Amount\nDash: Dash Distance\nPower', 1, 20)

    bui.submitButton(f, 'Enchant Held Item?')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)

        const ev = events[e[0]]
        const ac = actions[e[1]]
        const am = e[2]

        const i = mcl.getHeldItem(player)
        let item = new ItemStack(i.type, i.amount)
        let lore = i.getLore()
        lore.push(`§r§5${ev}-${ac}-${am}`)
        item.setLore(lore)
        item.nameTag = i.nameTag || item.nameTag

        mcl.getItemContainer(player).setItem(player.selectedSlotIndex, item)
    }).catch()
}

export function protectedAreasMain(player) {
    let f = new ActionFormData()
    bui.title(f, 'World Protection')

    bui.button(f, 'World Protection')
    bui.button(f, 'Add New Area')
    bui.button(f, 'Remove An Area')

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
    }).catch()
}


export function worldProtection(player) {
    let f = new ModalFormData()
    bui.title(f, 'World Protection')

    const data = mcl.jsonWGet('darkoak:worldprotection')

    bui.toggle(f, 'Ban Boats?', data.boats)
    bui.toggle(f, 'Ban Ender Pearls?', data.pearls)
    bui.toggle(f, 'Ban Water Buckets?', data.water)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:worldprotection', {
            boats: e[0],
            pearls: e[1],
            water: e[2]
        })
    }).catch()
}

/**
 * @param {Player} player 
 */
export function protectedAreasAddUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add Protected Area')
    const loc = player.location

    bui.textField(f, '\n(x z)\nCoordinates 1:', 'Example: 0 0')
    bui.textField(f, '\n(x z)\nCoordinates 2:', 'Example: 10 20', `${loc.x.toFixed(0)} ${loc.z.toFixed(0)}`)

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const e = bui.formValues(evd)
        const coords1 = e[0].trim().split(' ')
        const coords2 = e[1].trim().split(' ')

        const pa = {
            p1: { x: coords1[0], z: coords1[1] },
            p2: { x: coords2[0], z: coords2[1] }
        }
        mcl.jsonWSet(`darkoak:protection:${mcl.timeUuid()}`, pa)
    }).catch()
}

export function protectedAreasRemoveUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Remove Protected Area')

    const both = mcl.listGetBoth('darkoak:protection:')

    if (both === undefined || both.length === 0) {
        player.sendMessage('§cNo Protected Areas Found§r')
        return
    }

    for (let index = 0; index < both.length; index++) {
        const p = JSON.parse(both[index].value)
        bui.button(f, `${p.p1.x} ${p.p1.z} to ${p.p2.x} ${p.p2.z}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(both[evd.selection].id)
    }).catch()
}

/**
 * @param {Player} player 
 */
export function personalLogUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Personal Log')

    bui.textField(f, '\nAdd Entry:', '')

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
            bui.label(f, log.message)
            bui.divider(f)
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.communityMain(player)
            return
        }
        const e = bui.formValues(evd)
        const uuid = mcl.timeUuid()
        mcl.jsonPSet(player, `darkoak:personallog:${uuid}`, {
            message: e[0],
            time: uuid.split('T')[1]
        })
        personalLogUI(player)
    }).catch()
}

export function messageLogUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Message Log')

    const logs = mcl.jsonWGet('darkoak:messagelogs').log
    for (let index = 0; index < logs.length; index++) {
        bui.label(f, logs[index])
    }

    bui.button(f, 'Dismiss')

    f.show(player)
}

export function landclaimMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Landclaim Manager')

    if (!mcl.jsonWGet(`darkoak:landclaim:${player.name}`)) {
        player.sendMessage('§cYou Don\'t Own A Landclaim!§r')
        return
    }

    bui.button(f, 'Add Player To Landclaim')
    bui.button(f, 'Remove Player From Landclaim')

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
    }).catch()
}

export function landclaimAddPlayerUI(player) {
    let f = new ModalFormData()

    bui.title(f, 'Add Player')

    const pl = bui.namePicker(f, undefined, '\nPlayer:')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        /**@type {{p1: {x: number, z: number}, p2: {x: number, z: number}, owner: string, players: string[]}} */
        let d = mcl.jsonWGet(`darkoak:landclaim:${player.name}`)

        let newPlayers = d.players
        newPlayers.push(pl[e[0]])
        mcl.jsonWSet(`darkoak:landclaim:${player.name}`, {
            p1: d.p1,
            p2: d.p2,
            owner: d.owner,
            players: newPlayers
        })
    }).catch()
}

export function landclaimRemovePlayerUI(player) {
    let f = new ModalFormData()

    /**@type {{p1: {x: number, z: number}, p2: {x: number, z: number}, owner: string, players: string[]}} */
    let d = mcl.jsonWGet(`darkoak:landclaim:${player.name}`)

    if (!d.players || d.players.length == 0) {
        player.sendMessage('§cYou Have No Allowed Players§r')
        return
    }

    bui.title(f, 'Remove Player')

    bui.dropdown(f, 'Player:', d.players)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        mcl.jsonWUpdate(`darkoak:landclaim:${player.name}`, 'players', d.players.slice(e[0], e[0]))
    }).catch()
}


export function addRankUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add Rank')

    const pl = bui.namePicker(f, undefined, '\nPlayer:')
    bui.textField(f, 'Rank To Add:', 'Example: §1Admin§r')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)

        mcl.getPlayer(pl[e[0]]).addTag(`rank:${e[1]}`)
    }).catch()
}

export function removeRankUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Remove Rank')

    const tl = mcl.playerTagsArray(undefined, 'rank:')

    const pl = bui.namePicker(f, undefined, '\nPlayer:')
    bui.dropdown(f, 'Rank To Remove:', tl.map(e => e.replace('rank:', '')))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)

        mcl.getPlayer(pl[e[0]]).removeTag(tl[e[1]])
    }).catch()
}

export function addGiftcode(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add Giftcode')

    bui.textField(f, 'Code:', 'Example: secretcode123')
    bui.textField(f, 'Command On Redeem:', 'Example: give @s diamond 1')
    bui.toggle(f, 'One Use Per Player?', false)

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:giftcode:${mcl.timeUuid()}`, {
            code: e[0],
            command: e[1],
            oneUse: e[2],
        })
    }).catch()
}

export function redeemGiftcodeUI(player, priorCode, failMessage) {
    let f = new ModalFormData()
    bui.title(f, 'Redeem Giftcode')

    bui.label(f, failMessage)
    bui.textField(f, 'Code:', 'Example: secretcode123', priorCode)

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const e = bui.formValues(evd)
        let codes = mcl.listGetBoth('darkoak:giftcode:')
        for (let index = 0; index < codes.length; index++) {
            const code = JSON.parse(codes[index].value)
            if (e[0] === code.code) {
                if (code.oneUse) {
                    if (mcl.pGet(player, `darkoak:giftcode:${code.code}`)) {
                        redeemGiftcodeUI(player, e[0], '§cYou Already Redeemed This Code!§r')
                        return
                    } else {
                        mcl.pSet(player, `darkoak:giftcode:${code.code}`, true)
                        if (code.command) player.runCommand(code.command)
                        return
                    }
                } else {
                    if (code.command) player.runCommand(code.command)
                    mcl.wRemove(codes[index].id)
                }
                return
            }
        }
        redeemGiftcodeUI(player, e[0], '§cNot A Code!§r')
    }).catch()
}

export function CUIEditPicker(player) {
    let f = new ActionFormData()
    bui.title(f, 'CUI Picker')

    const uis = mcl.listGetBoth('darkoak:ui:')
    for (let index = 0; index < uis.length; index++) {
        const ui = uis[index]
        const v = JSON.parse(ui.value)
        bui.button(f, `Type: ${ui.id.split(':')[2]}, Title: ${v.title}, Tag: ${v.tag}\nBody: ${v.body}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        if (uis[evd.selection].id.split(':')[2] == 'action') {
            CUIEditUI(player, true, uis[evd.selection].id)
        } else if (uis[evd.selection].id.split(':')[2] == 'message') {
            CUIEditUI(player, false, uis[evd.selection].id)
        } else {
            modalTextModifyUI(player, uis[evd.selection])
        }
    }).catch()
}

/**
 * @param {Player} player 
 * @param {boolean} action 
 * @param {string} id 
 */
export function CUIEditUI(player, action, id) {
    const ui = mcl.jsonWGet(id)
    if (action) {
        actionUIEditUI(player, id)
    } else {
        let rf = new ModalFormData()
        const d = mcl.jsonWGet(id)
        bui.title(rf, 'Message UI Editor')

        bui.textField(rf, 'UI Title:', 'Example: Welcome!', d?.title)
        bui.textField(rf, 'UI Body Text:', 'Example: Hello there!', d?.body)
        bui.textField(rf, 'Tag To Open:', 'Example: welcomemessage', d?.tag)
        bui.textField(rf, 'UI Button 1:', 'Example: Hi!', d?.button1)
        bui.textField(rf, 'UI Button 2:', 'Example: Hello!', d?.button2)
        bui.textField(rf, 'Button1 Command:', 'Example: tp @s 0 0 0', d?.command1)
        bui.textField(rf, 'Button2 Command:', 'Example: tp @s 6 2 7', d?.command2)

        rf.show(player).then((revd) => {
            if (revd.canceled) return

            const e = bui.formValues(revd)
            const ui = { title: e[0], body: e[1], tag: e[2], button1: e[3], command1: e[5], button2: e[4], command2: e[6] }
            mcl.jsonWSet(id, ui)
        }).catch()
    }
}

export function actionUIEditUI(player, id) {
    let f = new ModalFormData()
    const d = mcl.jsonWGet(id)
    bui.title(f, 'Action UI Editor')

    bui.label(f, hashtags)

    bui.textField(f, 'Title:', 'Example: Warps', d.title)
    bui.textField(f, 'Body:', 'Example: Click A Button To TP', d.body)
    bui.textField(f, 'Tag To Open:', 'Example: warpmenu', d.tag)

    for (let index = 1; index <= 15; index++) {
        bui.textField(f, `Button ${index}:`, '', d.buttons[index - 1].title)
        bui.textField(f, `Command ${index}:`, '', d.buttons[index - 1].command)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)

        const title = e[0]
        const body = e[1]
        const tag = e[2]

        let buttons = []
        for (let index = 3; index < e.length; index += 2) {
            buttons.push({ title: e[index], command: e[index + 1] })
        }

        const ui = { title, body, tag, buttons }

        mcl.jsonWSet(id, ui)
    }).catch()
}

export function chatGamesSettings(player) {
    let f = new ModalFormData()
    bui.title(f, 'Chat Games')

    const d = mcl.jsonWGet('darkoak:chatgames')

    bui.toggle(f, 'Unscrambler Enabled?', d?.unscrambleEnabled, 'Toggles Whether The Game Runs')
    bui.textField(f, 'List Of Words', 'Example: word1, word2, word3', d?.unscrambleWords, 'Seperate Words With , ')
    bui.slider(f, 'Interval', 1, 10, d?.unscrambleInterval, 1, 'Interval In Minutes Between Games')
    bui.textField(f, 'Reward Command:', 'Example: give @s diamond 1', d?.unscrambleCommand, 'Command To Run On Successful Guess, Runs From The Guesser')

    bui.divider(f)

    bui.toggle(f, 'Boat-Catcher Enabled?', d?.catcherEnabled, 'Toggles Whether The Game Runs')
    bui.slider(f, 'Boat-Catcher Interval', 1, 10, d?.catcherInterval, 1, 'Interval In Minutes Between Games')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.chatSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        if (!e[0]) mcl.wRemove('darkoak:chatgame1:word')
        mcl.jsonWSet('darkoak:chatgames', {
            unscrambleEnabled: e[0],
            unscrambleWords: e[1],
            unscrambleInterval: e[2],
            unscrambleCommand: e[3],
            catcherEnabled: e[4],
            catcherInterval: e[5],
        })
    }).catch()
}

export function scriptSettings(player) {
    let f = new ModalFormData()
    bui.title(f, 'Script Settings')
    bui.label(f, '§cIt\'s Not Recommended To Change These Settings§r')

    const d = mcl.jsonWGet('darkoak:scriptsettings')

    bui.toggle(f, 'Cancel Watchdog Terminating', d.cancelWatchdog, 'If Enabled, Attempts To Cancel A Scripting Crash')
    bui.toggle(f, 'Log Data To Console', d.datalog, 'Logs Data Changes To The Console')
    bui.toggle(f, 'Disable All Chat Systems', d.chatmaster, 'Toggles The Chat System, Useful For Compatibility')
    bui.toggle(f, 'Disable All Custom Enchant Functionality', d.enchantsmaster, 'Toggles The Custom Enchant System')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:scriptsettings', {
            cancelWatchdog: e[0],
            datalog: e[1],
            chatmaster: e[2],
            enchantsmaster: e[3],
        })
    }).catch()
}

export function modalUIMakerUI(player, uiData = { title: 'New UI', tag: 'tag', elements: [] }) {
    let f = new ActionFormData()
    bui.title(f, 'Modal UI Maker')

    bui.button(f, 'Add Element')
    bui.button(f, 'Edit Elements')
    bui.button(f, 'Save UI')
    bui.button(f, 'Preview UI')
    bui.button(f, 'Settings')

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
    }).catch()
}

export function autoResponseMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Auto-Response')

    bui.button(f, 'Add', icons.thinPlus)
    bui.button(f, 'Remove', icons.trash)
    bui.button(f, 'Modify')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.chatSettingsUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                autoResponseAddUI(player)
                break
            case 1:
                autoResponseRemoveUI(player)
                break
            case 2:
                autoResponseModifyUI(player)
                break
        }
    }).catch()
}

export function autoResponseAddUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Auto-Response Adding')

    bui.label(f, hashtags)

    bui.textField(f, 'Word / Phrase:', 'Example: plot')

    bui.textField(f, 'Response:', 'Example: Plots are $30000')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:autoresponse:${mcl.timeUuid()}`, {
            word: e[0],
            response: e[1],
        })
    }).catch()
}

export function autoResponseRemoveUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Auto-Response Removing')

    const res = mcl.listGetBoth('darkoak:autoresponse:')

    for (let index = 0; index < res.length; index++) {
        const p = JSON.parse(res[index].value)
        bui.label(f, `Word / Phrase: ${p.word}\nResponse: ${p.response}`)
        bui.button(f, 'Delete?', icons.trash)
        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wRemove(res[evd.selection].id)
    }).catch()
}

export function autoResponseModifyUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Auto-Response Modifying')

    const res = mcl.listGetBoth('darkoak:autoresponse:')

    if (res === undefined || res.length === 0) {
        player.sendMessage('§cNo Auto-Responses Found§r')
        return
    }

    for (let index = 0; index < res.length; index++) {
        const p = JSON.parse(res[index].value)
        bui.label(f, `Word / Phrase: ${p.word}\nResponse: ${p.response}`)
        bui.button(f, 'Modify?')
        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            autoResponseMainUI(player)
            return
        }
        const selected = JSON.parse(res[evd.selection].value)

        let rf = new ModalFormData()
        bui.title(rf, 'Auto-Response Modifying')

        bui.label(rf, hashtags)

        bui.textField(rf, 'Word / Phrase:', 'Example: plot', selected.word)

        bui.textField(rf, 'Response:', 'Example: Plots are $30000', selected.response)
        bui.submitButton(rf, 'Modify?')

        rf.show(player).then((revd) => {
            if (revd.canceled) return
            const re = bui.formValues(revd)
            mcl.jsonWUpdate(res.at(evd.selection).id, 'word', re[0])
            mcl.jsonWUpdate(res.at(evd.selection).id, 'response', re[1])
        }).catch()
    }).catch()
}

/**UI for custom item settings
 * @param {Player} player 
 */
export function itemSettingsUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Item Settings')

    const d = mcl.jsonWGet('darkoak:itemsettings')

    bui.divider(f)
    bui.slider(f, 'Hop Feather Cooldown', 0, 10, d.hopfeather)
    bui.toggle(f, 'Show Cooldown Message?', d.hopfeatherM)
    bui.divider(f)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)

        mcl.jsonWSet('darkoak:itemsettings', {
            hopfeather: e[0],
            hopfeatherM: e[1],
        })
    }).catch()
}

export function floatingTextMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Floating Text')

    bui.button(f, 'Add Floating Text')
    bui.button(f, 'Remove Floating Text')

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
    }).catch()
}

/**
 * @param {Player} player 
 */
export function floatingTextAddUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add Floating Text')

    bui.label(f, 'Spawns Floating Text At Your Location')

    bui.textField(f, 'Text:', 'Example: Hello World!')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        const entity = player.dimension.spawnEntity('darkoak:floating_text', player.location)
        entity.nameTag = e[0]
    }).catch()
}

/**
 * @param {Player} player 
 */
export function floatingTextRemoveUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Remove Floating Text')

    const texts = player.dimension.getEntities({ type: 'darkoak:floating_text' })
    bui.dropdown(f, 'Floating Text To Remove:', texts.map(e => e.nameTag))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        texts.at(evd.formValues[0]).remove()
    }).catch()
}

/**
 * @param {Player} player 
 */
export function mobGenAddUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add Mob Gen')

    bui.textField(f, 'Mob Type:', 'Example: minecraft:zombie')
    bui.slider(f, 'Spawn Interval', 0, 10, 1, 1, 'Minutes Inbetween Spawns')
    bui.slider(f, 'Max Number Of Mobs', 1, 10, 1, 1, 'Mobs Won\'t Spawn If There Is More Than This Amount Nearby')

    bui.label(f, 'Spawns At Your Present Location!')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            genMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:mobgen:${mcl.timeUuid()}`, {
            mob: e[0],
            loc: player.location,
            interval: (e[1] * 60) * 20,
            current: 0,
            max: e[2],
            dimension: player.dimension.id,
        })
    }).catch()
}

export function mobGenRemoveUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Remove Mob Gen')

    const gens = mcl.listGetBoth('darkoak:mobgen:')
    for (let index = 0; index < gens.length; index++) {
        const gen = JSON.parse(gens[index].value)
        bui.label(f, `Location: ${gen.location}, Dimension: ${gen.dimension}`)
        bui.label(f, `Mob: ${gen.mob}, Interval: ${gen.interval}, Max Amount: ${gen.max}`)
        bui.button(f, 'Delete?')
        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            genMainUI(player)
            return
        }
        mcl.wRemove(gens[evd.selection].id)
    })
}

export function mobGenModifyUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Modify Mob Gen')

    const gens = mcl.listGetBoth('darkoak:mobgen:')
    for (let index = 0; index < gens.length; index++) {
        const gen = JSON.parse(gens[index].value)
        bui.label(f, `Location: ${gen?.location}, Dimension: ${gen?.dimension}`)
        bui.label(f, `Mob: ${gen?.mob}, Interval: ${gen?.interval}, Max Amount: ${gen?.max}`)
        bui.button(f, 'Modify?')
        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            genMainUI(player)
            return
        }
        mobGenModifyNotPickerUI(player, gens[evd.selection])
    })
}

/**
 * 
 * @param {Player} player 
 * @param {{id: string, value: string}} data 
 */
export function mobGenModifyNotPickerUI(player, data) {
    let f = new ModalFormData()
    bui.title(f, 'Modify Mob Gen')

    const gen = JSON.parse(data.value)

    bui.textField(f, 'Mob Type:', 'Example: minecraft:zombie', gen?.mob)
    bui.slider(f, 'Spawn Interval', 0, 10, gen?.interval, 1, 'Minutes Inbetween Spawns')
    bui.slider(f, 'Max Number Of Mobs', 1, 10, 1, 1, 'Mobs Won\'t Spawn If There Is More Than This Amount Nearby', gen?.max)

    bui.label(f, 'Spawns At Your Present Location!')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            genMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet(data.id, {
            mob: e[0],
            loc: player.location,
            interval: (e[1] * 60) * 20,
            current: 0,
            max: e[2],
            dimension: player.dimension.id,
        })
    }).catch()
}

export function queueMessageUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Queue Message')

    const players = bui.offlineNamePicker(f, 'Players:')

    bui.textField(f, 'Message:', 'Example: Hello World!')

    bui.show(f, player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:queuemessage:${mcl.timeUuid()}`, {
            player: players[e[0]],
            message: e[1],
        })
    }).catch()
}

export function banOfflineUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Ban Player')

    const playerList = mcl.getPlayerList()
    bui.dropdown(f, 'Player:', playerList, 0)
    bui.textField(f, 'This Text Overrides The Dropdown!\nPlayer:', 'Example: Darkoakboat2121')
    bui.textField(f, 'Reason / Ban Message', 'Example: Hacking')
    bui.textField(f, 'Ban Time In Hours (Leave Empty For Forever):', 'Example: 24')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.playerPunishmentsMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        let selected = ''
        if (e[1]) {
            selected = e[1]
        } else selected = playerList[e[0]]
        const admins = mcl.getAdminList()
        if (admins.includes(selected)) {
            mcl.adminMessage(`${player.name} Tried To Ban ${selected}`)
            return
        }

        let time = e[2]
        if (isNaN(time) || time === '' || parseInt(time) <= 0) {
            time = -1
        }
        mcl.jsonWSet(`darkoak:bans:${mcl.timeUuid()}`, {
            player: selected,
            message: e[1],
            time: parseInt(time) * 3600
        })
        mcl.adminMessage(`${selected} Has Been Banned!`)
    }).catch()
}

export function itemBindingUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Bind Held Item Type')
    bui.label(f, 'Will Bind All Items Of The Type You Are Holding!')

    const d = mcl.jsonWGet(`darkoak:bind:${mcl.getHeldItem(player).typeId}`)

    bui.textField(f, 'Command:', 'Example: tp @s 0 2 0', d.command1)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:bind:${mcl.getHeldItem(player).typeId}`, {
            command1: e[0],
        })
    })
}

export function adminAndPlayerListUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Admin & Player List')
    bui.header(f, 'Admins:')

    const admins = mcl.getAdminList()
    const players = mcl.getPlayerList()
    const mods = mcl.getModList()
    const banned = mcl.getBanList()

    for (let index = 0; index < admins.length; index++) {
        const admin = admins[index]
        bui.label(f, admin)
    }

    bui.divider(f)
    bui.header(f, `All Players:`)
    bui.label(f, `${world.getAllPlayers().length.toString()}/${players.length.toString()} Online`)

    for (let index = 0; index < players.length; index++) {
        const player = players[index]
        let finalName = [player]
        if (mcl.isHost(player)) finalName.push('[§gHost§r]')
        if (admins && admins.includes(player)) finalName.push('[§mAdmin§r]')
        if (mods && mods.includes(player)) finalName.push('[§uMod§r]')
        if (banned && banned.includes(player)) finalName.push('[§cBanned§r]')
        bui.label(f, finalName.join(' '))
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.dashboardMainUI(player)
            return
        }
    })
}

/**
 * @param {Player} player 
 */
export function gamblingMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Gambling')

    const isAdmin = mcl.isDOBAdmin(player)

    bui.button(f, 'Gamble!')
    if (isAdmin) bui.button(f, 'Gambling Settings')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.communityMoneyUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                gambleUI(player)
                break
            case 1:
                if (isAdmin) {
                    gamblingSettingsUI(player)
                } else {
                    mcl.adminMessage(`Check ${player.name} For Weird Permissions`)
                }
                break
        }
    })
}

export function gambleUI(player, message = 'LETS GO GAMBLING!') {
    let f = new ActionFormData()

    const amountCurrent = mcl.getScore(player)

    bui.title(f, 'Gambling Time!')
    bui.label(f, message)
    bui.label(f, `Your Money: ${amountCurrent}`)
    bui.button(f, 'Gamble!')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            gamblingMainUI(player)
            return
        }
        const d = mcl.jsonWGet('darkoak:gambling')
        const gamb = mcl.randomNumber(100)

        if (amountCurrent < d?.cost || 0) {
            gambleUI(player, '§cNot Enough Money!§r')
            return
        }
        mcl.removeScore(player, parseInt(d?.cost))

        if (gamb <= d?.rewardChance) {
            if (d?.moneyReward) {
                mcl.addScore(player, parseInt(d?.reward1) || 100)
                mcl.addScore(player, parseInt(d?.reward2) || 100)
                gambleUI(player, 'You Can\'t Stop Winning!')
            } else {
                player.runCommand(replacer(player, d?.reward1))
                player.runCommand(replacer(player, d?.reward2))
                gambleUI(player, 'You Can\'t Stop Winning!')
            }
        } else {
            if (mcl.randomNumber(100) == 100) {
                gambleUI(player, 'Honestly, Just Stop Gambling')
            } else {
                gambleUI(player, 'Aw Dangit...')
            }
        }
    })
}

export function gamblingSettingsUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Gambling Settings')
    const d = mcl.jsonWGet('darkoak:gambling')

    bui.textField(f, 'Gambling Cost:', 'Example: 1000', d?.cost)
    bui.toggle(f, 'Money Reward?\nIf Disabled Runs Command', d?.moneyReward)
    bui.slider(f, 'Reward Chance', 1, 100, d?.rewardChance || 50, 1)

    bui.textField(f, 'Money Amount / Reward Command:', 'Example: 1000', d?.reward1)
    bui.textField(f, 'Money Amount / Reward Command:', 'Example: give @s diamond 1', d?.reward2)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            gamblingMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        if (isNaN(e[0])) {
            player.sendMessage('§cInvalid Cost!§r')
            return
        }
        mcl.jsonWSet('darkoak:gambling', {
            cost: e[0],
            moneyReward: e[1],
            rewardChance: e[2],
            reward1: e[3],
            reward2: e[4],
        })
    })
}

export function crashPlayerUI(player) {
    let f = new ModalFormData()
    bui.title(f, '§cCrash A Player§r')

    const u = bui.namePicker(f, undefined, 'Player:')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.playerPunishmentsMainUI(player)
            return
        }
        const p = mcl.getPlayer(u[bui.formValues(evd)[0]])
        if (mcl.isDOBAdmin(p)) {
            mcl.adminMessage(`${player.name} Attempted To Crash Admin: ${p.name}`)
            // return
        }
        let o = 0
        while (o++ < 100) {
            if (p) {
                p.addEffect('minecraft:instant_health', 10, {
                    amplifier: 255,
                    showParticles: true
                })
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
                p.sendMessage(`§a§k`)
            }
        }
    })
}

export function otherPlayerSettingsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Other Player Settings')

    bui.button(f, 'Bounty Settings')
    bui.button(f, 'Whitelist / Verfication')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.playerSettingsUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                bountySettingsUI(player)
                break
            case 1:
                whitelistUI(player)
                break
        }
    })
}

export function bountySettingsUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Bounty Settings')

    const d = mcl.jsonWGet('darkoak:bountysettings')

    bui.toggle(f, 'Enabled?', d?.enabled)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            otherPlayerSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:bountysettings', {
            enabled: e[0],
        })
    })
}

export function bountyMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Bountys')

    bui.button(f, 'Place A Bounty')

    bui.button(f, 'Look At Bountys')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.communityMoneyUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                bountyPlaceUI(player)
                break
            case 1:
                bountyListUI(player)
                break
        }
    })
}

/**
 * @param {Player} player 
 */
export function bountyPlaceUI(player, errorMessage = '') {
    let f = new ModalFormData()
    bui.title(f, 'Place A Bounty')

    bui.label(f, errorMessage)

    const u = bui.namePicker(f, undefined, 'Player:')

    bui.textField(f, 'Price:', 'Example: 10000', '', 'Has To Be A Number')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            bountyMainUI(player)
            return
        }
        const e = bui.formValues(evd)

        if (isNaN(e[1])) {
            bountyPlaceUI(player, `${e[1]} Isn\'t A Number`)
            return
        }

        mcl.jsonWSet(`darkoak:bounty:${mcl.timeUuid()}`, {
            placer: player.name,
            bounted: u[e[0]],
            amount: e[1],
        })
    })
}

export function bountyListUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Bounty List')

    const bounties = mcl.listGetValues('darkoak:bounty:')
    for (let index = 0; index < bounties.length; index++) {
        const b = JSON.parse(bounties[index])
        bui.label(f, `${b.placer} -> "${b.bounted}" For ${b.amount}`)
        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            bountyMainUI(player)
            return
        }
    })
}

/**
 * @param {Player} player 
 */
export function signsPlusMainUI(player) {
    let f = new ModalFormData()
    const sign = player.getBlockFromViewDirection()?.block
    if (!sign) {
        player.sendMessage('§cNo Sign Found§r')
    }
    const signData = mcl.getSign(sign)

    const lines = signData.text.split('\n')

    const wdr = mcl.getDataByLocation('darkoak:signsplus:', 'location', sign.location)
    let wd = {}
    if (wdr) wd = JSON.parse(wdr.value)

    bui.title(f, 'Signs+')

    bui.toggle(f, 'Spin?', wd?.spin?.enabled) // 0
    bui.toggle(f, 'Clockwise?', wd?.spin?.clockwise) // 1

    bui.divider(f)
    bui.label(f, 'Line 1 Animation. Switches Through Any Non-empty Frames On The Specified Delay')
    bui.textField(f, 'Line 1, Frame 1', 'Example: &-------', wd?.line1?.f1 || lines[0]) // 2
    bui.textField(f, 'Line 1, Frame 2', 'Example: --&-----', wd?.line1?.f2) // 3
    bui.textField(f, 'Line 1, Frame 3', 'Example: ----&---', wd?.line1?.f3) // 4
    bui.textField(f, 'Line 1, Frame 4', 'Example: ------&-', wd?.line1?.f4) // 5
    bui.divider(f)

    bui.divider(f)
    bui.label(f, 'Line 2 Animation. Switches Through Any Non-empty Frames On The Specified Delay')
    bui.textField(f, 'Line 2, Frame 1', 'Example: &-------', wd?.line2?.f1 || lines[1]) // 2
    bui.textField(f, 'Line 2, Frame 2', 'Example: --&-----', wd?.line2?.f2) // 3
    bui.textField(f, 'Line 2, Frame 3', 'Example: ----&---', wd?.line2?.f3) // 4
    bui.textField(f, 'Line 2, Frame 4', 'Example: ------&-', wd?.line2?.f4) // 5
    bui.divider(f)

    bui.divider(f)
    bui.label(f, 'Line 3 Animation. Switches Through Any Non-empty Frames On The Specified Delay')
    bui.textField(f, 'Line 3, Frame 1', 'Example: &-------', wd?.line3?.f1 || lines[2]) // 2
    bui.textField(f, 'Line 3, Frame 2', 'Example: --&-----', wd?.line3?.f2) // 3
    bui.textField(f, 'Line 3, Frame 3', 'Example: ----&---', wd?.line3?.f3) // 4
    bui.textField(f, 'Line 3, Frame 4', 'Example: ------&-', wd?.line3?.f4) // 5
    bui.divider(f)

    bui.divider(f)
    bui.label(f, 'Line 4 Animation. Switches Through Any Non-empty Frames On The Specified Delay')
    bui.textField(f, 'Line 4, Frame 1', 'Example: &-------', wd?.line4?.f1 || lines[3]) // 2
    bui.textField(f, 'Line 4, Frame 2', 'Example: --&-----', wd?.line4?.f2) // 3
    bui.textField(f, 'Line 4, Frame 3', 'Example: ----&---', wd?.line4?.f3) // 4
    bui.textField(f, 'Line 4, Frame 4', 'Example: ------&-', wd?.line4?.f4) // 5
    bui.divider(f)

    bui.divider(f)
    bui.label(f, 'Colors')
    bui.toggle(f, 'Rainbow Text?', wd?.color?.rainbow) // 18
    bui.divider(f)

    bui.divider(f)
    bui.label(f, 'Other Settings')
    bui.toggle(f, 'Waxed?', signData.waxed) // 19
    bui.divider(f)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            return
        }
        const e = bui.formValues(evd)

        let noWall = e[0]
        if (sign.typeId.includes('wall')) noWall = false

        mcl.rewriteSign(sign, e[19])

        mcl.jsonWSet(`darkoak:signsplus:${mcl.timeUuid()}`, {
            location: sign.location,
            dimension: sign.dimension.id,
            spin: {
                enabled: noWall,
                clockwise: e[1]
            },
            line1: {
                f1: e[2],
                f2: e[3],
                f3: e[4],
                f4: e[5],
            },
            line2: {
                f1: e[6],
                f2: e[7],
                f3: e[8],
                f4: e[9],
            },
            line3: {
                f1: e[10],
                f2: e[11],
                f3: e[12],
                f4: e[13],
            },
            line4: {
                f1: e[14],
                f2: e[15],
                f3: e[16],
                f4: e[17],
            },
            color: {
                rainbow: e[18],
            },
        })
    })
}

export function whitelistUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Whitelist / Verification')

    const d = mcl.jsonWGet('darkoak:whitelist')

    bui.label(f, 'Whitelist Settings:')
    bui.toggle(f, 'Enabled?', d?.enabled)
    bui.textField(f, 'Whitelist:', 'Example: Darko, Noki, CanineYeti', d?.whitelist)

    bui.divider(f)

    bui.label(f, 'Verification Settings:')
    bui.toggle(f, 'Enabled?', d?.venabled)
    bui.textField(f, 'Code:', 'Example: password', d?.vcode, 'Users Must Use This Code To Play The World. It Also Supports The Hashtag Replacer System')
    bui.textField(f, 'Hint:', 'Example: It Rhymes With "tassword"', d?.vhint)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            otherPlayerSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:whitelist', {
            enabled: e[0],
            whitelist: e[1],
            venabled: e[2],
            vcode: e[3],
            vhint: e[4],
        })
    })
}

/**
 * @param {Player} player 
 */
export function dimensionBansUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Dimension Bans')
    const d = mcl.jsonWGet('darkoak:dimensionbans')

    bui.toggle(f, 'Ban The Nether?', d?.nether)
    bui.toggle(f, 'Ban The End?', d?.end)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:dimensionbans', {
            nether: e[0],
            end: e[1],
        })
    })
}

export function modalTextUIMakerUI(player) {
    let f = new ActionFormData()

    bui.title(f, 'Modal UI Maker')

    bui.button(f, 'Add New UI')
    bui.button(f, 'Modify An UI')
    bui.button(f, 'Delete An UI')
    bui.button(f, 'Templates')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.UIMakerUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                modalTextAddingUI(player)
                break
            case 1:
                modalTextModifyPickerUI(player)
                break
            case 2:
                modalTextDeleterUI(player)
                break
            case 3:
                modalTextTemplatesUI(player)
                break
        }
    })
}

export function modalTextAddingUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add New Modal UI')

    bui.textField(f, 'UI Title', 'Example: Apply Knockback')
    bui.textField(f, 'Tag To Open', 'Example: knockbackui')

    bui.label(f, `Examples:\n${modalTextTypes}`)

    bui.textField(f, 'UI Text') // 2
    bui.textField(f, 'UI Text') // 3
    bui.textField(f, 'UI Text') // 4
    bui.textField(f, 'UI Text') // 5
    bui.textField(f, 'UI Text') // 6
    bui.textField(f, 'UI Text') // 7
    bui.textField(f, 'UI Text') // 8
    bui.textField(f, 'UI Text') // 9
    bui.textField(f, 'UI Text') // 10
    bui.textField(f, 'UI Text') // 11
    bui.textField(f, 'UI Text') // 12
    bui.textField(f, 'UI Text') // 13
    
    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalTextUIMakerUI(player)
            return
        }

        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:ui:modaltext:${mcl.timeUuid()}`, {
            title: e[0],
            tag: e[1],
            lines: [
                e[2],
                e[3],
                e[4],
                e[5],
                e[6],
                e[7],
                e[8],
                e[9],
                e[10],
                e[11],
                e[12],
                e[13],
            ]
        })
    })
}

export function modalTextModifyPickerUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Modify Picker')

    const uis = mcl.jsonListGetBoth('darkoak:ui:modaltext:')

    for (let index = 0; index < uis.length; index++) {
        const ui = uis[index].value
        bui.button(f, `${ui.title}\n${ui.tag}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalTextUIMakerUI(player)
            return
        }

        modalTextModifyUI(player, uis[evd.selection])
    })
}

/**
 * 
 * @param {Player} player 
 * @param {{id: string, value: {title: string, tag: string, lines: string[]}}} ui 
 */
export function modalTextModifyUI(player, ui) {
    let f = new ModalFormData()
    bui.title(f, 'Modify A Modal UI')

    bui.textField(f, 'UI Title', 'Example: Apply Knockback', ui.value.title)
    bui.textField(f, 'Tag To Open', 'Example: knockbackui', ui.value.tag)

    bui.label(f, `Examples:\n${modalTextTypes}`)

    bui.textField(f, 'UI Text', '', ui.value.lines[0]) // 2
    bui.textField(f, 'UI Text', '', ui.value.lines[1]) // 3
    bui.textField(f, 'UI Text', '', ui.value.lines[2]) // 4
    bui.textField(f, 'UI Text', '', ui.value.lines[3]) // 5
    bui.textField(f, 'UI Text', '', ui.value.lines[4]) // 6
    bui.textField(f, 'UI Text', '', ui.value.lines[5]) // 7
    bui.textField(f, 'UI Text', '', ui.value.lines[6]) // 8
    bui.textField(f, 'UI Text', '', ui.value.lines[7]) // 9
    bui.textField(f, 'UI Text', '', ui.value.lines[8]) // 10
    bui.textField(f, 'UI Text', '', ui.value.lines[9]) // 11
    bui.textField(f, 'UI Text', '', ui.value.lines[10]) // 12
    bui.textField(f, 'UI Text', '', ui.value.lines[11]) // 13
    
    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalTextModifyPickerUI(player)
            return
        }

        const e = bui.formValues(evd)
        mcl.jsonWSet(ui.id, {
            title: e[0],
            tag: e[1],
            lines: [
                e[2],
                e[3],
                e[4],
                e[5],
                e[6],
                e[7],
                e[8],
                e[9],
                e[10],
                e[11],
                e[12],
                e[13],
            ]
        })
    })
}

export function modalTextDeleterUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Modal UI Deleter')

    const uis = mcl.jsonListGetBoth('darkoak:ui:modaltext:')

    for (let index = 0; index < uis.length; index++) {
        const ui = uis[index].value
        bui.button(f, `${ui.title}\n${ui.tag}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalTextUIMakerUI(player)
            return
        }

        mcl.wRemove(uis[evd.selection].id)
    })
}

export function messageSender(player) {
    let f = new ModalFormData()
    bui.title(f, 'Send A Message')

    bui.textField(f, 'Message:')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        chatSystem(undefined, player, e[0])
    })
}

/**
 * 
 * @param {Player} player 
 */
export function itemGiverUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Item Giver')

    bui.button(f, 'End Gateway')
    bui.button(f, '')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.dashboardMainUI(player)
            return
        }
        let type = ''
        let name = ''
        switch (evd.selection) {
            case 0:
                type = 'end_gateway'
                name = 'End Gateway'
                break
            case 1:
                type = ''
                break
        }
        let newItem = new ItemStack('minecraft:' + type, 1)
        newItem.nameTag = '§r' + name
        player.dimension.spawnItem(newItem, player.location)
    })
}

export function emptyLandclaimDeleterUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Empty Landclaim Deleter')

    const INVALID_NAME = 'INVALIDINVALIDINVALIDINVALIDINVALIDINVALIDINVALIDINVALID'

    /**@type {{id: string, value: {p1: {x: number, y: number}, p2: {x: number, y: number}, owner: string, players: [string]}}} */
    let places = mcl.jsonListGetBoth('darkoak:landclaim:').filter(e => {
        return e.value.owner === INVALID_NAME
    })
    for (let index = 0; index < places.length; index++) {
        const place = places[index].value
        bui.button(f, `${place.p1.x} ${place.p1.y} | ${place.p2.x} ${place.p2.y}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return

        mcl.wRemove(places[evd.selection].id)
    })
}

export function modalTextTemplatesUI(player) {
    let f = new ActionFormData()

    bui.title(f, 'Modal Templates')

    bui.button(f, 'Server Transfer', icons.item('boat_darkoak'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalTextUIMakerUI(player)
            return
        }
        const id = `darkoak:ui:modaltext:${mcl.timeUuid()}`
        let data
        switch (evd.selection) {
            case 0:
                data = {
                    title: 'Server Transfer',
                    tag: 'servertransfer',
                    lines: [
                        'textfield|IP:',
                        'textfield|Port:',
                        'submit|§aTravel To The Server!',
                        'command|darkoak:transfer @s "$1$" $2$'
                    ]
                }
                break
        }
        mcl.jsonWSet(id, data)
    })
}

const animatedActionDef = {
    title: '',
    tag: '',
    frames: [{buttons: ['','','','','',]},{buttons: ['','','','','',]},{buttons: ['','','','','',]},
        {
            buttons: [
                '',
                '',
                '',
                '',
                '',
            ]
        },
        {
            buttons: [
                '',
                '',
                '',
                '',
                '',
            ]
        },
    ]
}

export function animatedActionUIMakerUI(player, ui = animatedActionDef, id = `darkoak:ui:animatedaction:${mcl.timeUuid()}`) {
    let f = new ModalFormData()
    bui.title(f, 'Animated Action UI Maker')

    bui.textField(f, 'Title:', '', ui.title, )

    for (let index = 0; index < 5; index++) {
        bui.header(f, `Frame ${index + 1}`)
        for (let index2 = 0; index2 < 5; index2++) {
            bui.textField(f, `Button ${index2 + 1}:`, 'Example: Tp to spawn|tp @s 0 0 0', ui.frames[index].buttons[index2])
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            interfaces.UIMakerUI(player)
            return
        }

        const e = bui.formValues(evd)

        mcl.jsonWSet(id, {
            title: e[0],
            tag: e[1],
            frames: [
                {
                    // WORK ON THIS LATER ------------------------------------
                }
            ]
        })
    })
}

export function darkoakboatBio(player) {
    let f = new ActionFormData()
    bui.title(f, 'Darkoakboat2121')

    bui.label(f, 'Hiya, im the boat himself. Im the dev of this very addon.')
    bui.label(f, 'Read it: http://secdown.rf.gd/book-of-bandits/')

    bui.show(f, player)
}

export function nokiBio(player) {
    let f = new ActionFormData()
    bui.title(f, 'Noki5160')

    bui.label(f, '@612racks or @six12racks on everything.')

    bui.show(f, player)
}

export function canineyetiBio(player) {
    let f = new ActionFormData()
    bui.title(f, 'CanineYeti24175')

    bui.label(f, 'Note From Darko: He\'s my best friend and has helped alot through my journey learning how to code this very addon. I want to give a special thanks to him.')
    bui.label(f, 'wip')

    bui.show(f, player)
}

export function tygerBio(player) {
    let f = new ActionFormData()
    bui.title(f, 'Tygerklawk')

    bui.label(f, 'Forgot most commands lol')

    bui.show(f, player)
}

export function wertwertBio(player) {
    let f = new ActionFormData()
    bui.title(f, 'Wertwert3612')

    bui.label(f, 'Long Live Hex!')
    bui.divider(f)
    bui.label(f, `
Stil testing  the add-on for Minecraft and holy, it's been a wild ride. I mean, I've seen some crazy stuff go down, and I'm not even talking about the exploits yet. Just watching it break in all sorts of ridiculous ways is entertainment enough. Like, I've come up with some new and innovative ways to make it crash, and it's honestly been a blast.

I'm hyped for the thrill of testing, the agony of watching it poop the bed, and the ecstasy of finally finding that one darn exploit that's been hiding in the shadows. It's like a game of cat and mouse, where I'm both the cat and the mouse, and I'm gonna crush it. Who needs a stable add-on when you can have the satisfaction of breaking it in creative, messed-up ways?

I've never been a fan of testing, but I've learned to appreciate the little victories. Like when I finally find that one exploit that's been driving me crazy for hours. Or when I manage to fix a bug that's been causing problems for players. Those moments make all the frustration worth it, and I'm not even gonna lie.

But let's be real, most of the time I'm just throwing my keyboard across the room, screaming at the top of my lungs, and wondering why the heck I even bother. My computer is covered in scratches, my mouse is held together with duct tape, and I'm pretty sure I've lost all feeling in my fingers from smashing them on the desk. It's a miracle I still have a functioning monitor, tbh.

- Wertwert3612
`)

    bui.show(f, player)
}
