import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as arrays from "../data/arrays"
import { mcl } from "../logic"
import { addGiftcode, addRankUI, adminAndPlayerListUI, auctionMain, autoResponseMainUI, banOfflineUI, bountyMainUI, canineyetiBio, chatGamesSettings, crashPlayerUI, createWarpUI, CUIEditPicker, darkoakboatBio, deleteWarpUI, floatingTextMainUI, gamblingMainUI, itemSettingsUI, messageLogUI, modalUIMakerUI, nokiBio, otherPlayerSettingsUI, personalLogUI, pressionUI, redeemGiftcodeUI, removeRankUI, scriptSettings, tpaSettings, tpaUI, tygerBio } from "./interfacesTwo"
import { bui } from "./baseplateUI"

// This file holds all the functions containing UI


// Main UI: Opened by using the main item with the tag darkoak:admin
export function mainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Main')
    bui.body(f, 'Manage Various Settings')

    bui.divider(f)

    bui.button(f, 'World Settings\n§7Modify World Related Settings', arrays.icons.globe)
    bui.label(f, 'Interaction Settings, Bind Custom Item, Welcome / Goodbye Messages, World Border, Money ID, Item Settings, Floating Text')

    bui.divider(f)

    bui.button(f, 'Player Settings\n§7Modify Player Related Settings', arrays.icons.steveAlex)
    bui.label(f, 'Player Data, Punishments, Player Tracking, Giftcodes, Add / Remove Ranks')

    bui.divider(f)

    bui.button(f, 'Chat Settings\n§7Modify Chat Related Settings', arrays.icons.chatWithArrow)
    bui.label(f, 'Manage Ranks, Chat Commands, Censor Settings, Chat Games, Auto-Reply Settings, Other')

    bui.divider(f)

    bui.button(f, 'UI Settings\n§7Create New UI\'s Or Set The Sidebar / Actionbar', arrays.icons.dialogBackground)
    bui.label(f, 'Make A(n) Message / Action / Modal UI, Delete A UI, Set The Actionbar / Sidebar')

    bui.divider(f)

    bui.button(f, 'Dashboard\n§7See Important Info Such As Logs And Data', arrays.icons.item('diamond'))
    bui.label(f, 'Print World Data, Delete Data, Reports, Logs, Docs, Admins And Players, Script Settings / Master Settings')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch (evd.selection) {
            case 0:
                worldSettingsUI(player)
                break
            case 1:
                playerSettingsUI(player)
                break
            case 2:
                chatSettingsUI(player)
                break
            case 3:
                UIMakerUI(player)
                break
            case 4:
                dashboardMainUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

/**Main ui for world settings
 * @param {Player} player 
 */
export function worldSettingsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'World Settings')
    bui.body(f, 'Manage World Settings')

    bui.button(f, 'Interaction Settings\n§7Modify Whether Interactions Can Take Place', arrays.icons.crossButton)
    bui.button(f, 'Bind Custom Item\n§7Bind Dummy Items', arrays.icons.goldenPicker)
    bui.button(f, 'Welcome / Goodbye Messages\n§7Set Join / Leave Messages')
    bui.button(f, 'World Border\n§7Set The World Border Size', arrays.icons.block('barrier'))
    bui.button(f, 'Money Settings\n§7Set The Money Settings', arrays.icons.minecoin)
    bui.button(f, 'Item Settings\n§7Settings For Custom Items')
    bui.button(f, 'Floating Text')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            mainUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                worldInteractionSettings(player)
                break
            case 1:
                itemBindsUI(player)
                break
            case 2:
                welcomeMessageUI(player)
                break
            case 3:
                worldBorderUI(player)
                break
            case 4:
                moneyUI(player)
                break
            case 5:
                itemSettingsUI(player)
                break
            case 6:
                floatingTextMainUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

export function worldInteractionSettings(player) {
    let f = new ModalFormData()
    bui.title(f, 'Interaction Settings')
    const d = mcl.jsonWGet('darkoak:cws')

    bui.toggle(f, 'Players Can Break Blocks?\nIf Enabled, Players Can\'t Break Blocks', d?.breakblocks)
    bui.toggle(f, 'Players Can Break Item Frames?\nIf Enabled, Players Can\'t Break Item Frames', d?.breakitemframes)
    
    bui.divider(f)

    bui.toggle(f, 'Players Can Interact With Blocks?\nIf Enabled, Players Can\'t Interact With Blocks', d?.interactwithblocks)
    bui.toggle(f, 'Players Can Interact With Item Frames?\nIf Enabled, Players Can\'t Interact With Item Frames', d?.interactwithitemframes)
    bui.toggle(f, 'Players Can Interact With Ender Chests?\nIf Enabled, Players Can\'t Interact With Ender Chests', d?.interactwithenderchests)
    bui.toggle(f, 'Players Can Interact With Signs?\nIf Enabled, Players Can\'t Interact With Signs', d?.interactwithsigns)
    bui.toggle(f, 'Players Can Interact With Logs?\nIf Enabled, Players Can\'t Interact With Logs', d?.interactwithlogs, 'Helpful For Making Logs Non-Stripable')
    bui.toggle(f, 'Players Can Interact With Grass Blocks?\nIf Enabled, Players Can\'t Interact With Grass Blocks', d?.interactwithgrass)

    bui.divider(f)

    bui.label(f, 'These Following Settings Don\'t Work Yet')
    bui.toggle(f, 'Players Can Interact With Entities?\nIf Enabled, Players Can\'t Interact With Entities', d?.interactwithentities)
    bui.toggle(f, 'Players Can Interact With Villagers?\nIf Enabled, Players Can\'t Interact With Villagers', d?.interactwithvillagers)

    bui.divider(f)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:cws', {
            breakblocks: e[0],
            breakitemframes: e[1],
            interactwithblocks: e[2],
            interactwithitemframes: e[3],
            interactwithenderchests: e[4],
            interactwithsigns: e[5],
            interactwithlogs: e[6],
            interactwithgrass: e[7],
            interactwithentities: e[8],
            interactwithvillagers: e[9],
        })
    }).catch()
}

export function itemBindsUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Bind Custom Item Picker')

    bui.slider(f, '\nItem Number', 1, arrays.dummySize)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        itemBindsTextUI(player, e[0])
    }).catch()
}

export function itemBindsTextUI(player, bindNum) {
    let f = new ModalFormData()
    bui.title(f, 'Bind Custom Item')

    bui.label(f, arrays.hashtags)

    const c = mcl.jsonWGet(`darkoak:bind:${bindNum}`)

    bui.textField(f, 'Command:', 'Example: tp @s 0 1 0', c?.command1)

    bui.label(f, 'More Commands:')
    bui.textField(f, '', '', c?.command2)
    bui.textField(f, '', '', c?.command3)
    bui.textField(f, '', '', c?.command4)
    bui.textField(f, '', '', c?.command5)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:bind:${bindNum}`, {
            command1: e[0],
            command2: e[1],
            command3: e[2],
            command4: e[3],
            command5: e[4],
        })
    }).catch()
}

/**
 * @param {Player} player 
 */
export function welcomeMessageUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Welcome Message')
    const d = mcl.jsonWGet('darkoak:welcome') || { welcome: '', welcomeS: false, bye: '', byeS: false }

    bui.label(f, arrays.hashtags)
    bui.textField(f, `\nMessage:`, 'Example: Welcome to Super-Skygen!', d.welcome)
    bui.toggle(f, 'Global Welcome?', d.welcomeS)
    bui.textField(f, 'Goodbye Message:', 'Example: Goodbye #name#!', d.bye)
    bui.toggle(f, 'Global Goodbye?', d.byeS)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:welcome', {
            welcome: e[0],
            welcomeS: e[1],
            bye: e[2],
            byeS: e[3]
        })
    }).catch()
}

export function worldBorderUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'World Border')
    bui.textField(f, '\n(Must Be A Number, 0 = Disabled)\nSize:', 'Example: 3000', mcl.wGet('darkoak:cws:border'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        if (isNaN(e[0])) {
            worldBorderUI(player)
            return
        }
        mcl.wSet('darkoak:cws:border', e[0])
    }).catch()
}

export function moneyUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Money ID')

    const ms = mcl.jsonWGet('darkoak:moneyscore')
    bui.textField(f, 'Tax Percentage:', 'Example: 5', ms['tax'] || '', '0 to 100')
    bui.textField(f, 'Compression Tax:', 'Example: 1', ms['compression'] || '', '0 To 64')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:moneyscore', {
            tax: e[0].trim(),
            compression: e[1].trim(),
        })
    }).catch()
}

// main ui for player settings: player data lookup, punishments
export function playerSettingsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Player Settings')
    bui.body(f, 'Manage Player Settings')

    bui.button(f, 'Player Data\n§7View A Player\'s Data', arrays.icons.whitePlayer)
    bui.button(f, 'Punishments\n§7Punish A Player', arrays.icons.cancel)
    bui.button(f, 'Player Tracking\n§7Modify Tracking Settings')
    bui.button(f, 'Giftcodes\n§7Add A Redeemable Giftcode')
    bui.button(f, 'Add Rank To A Player')
    bui.button(f, 'Remove Rank From A Player')
    bui.button(f, 'Other')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            mainUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                playerDataMainUI(player)
                break
            case 1:
                playerPunishmentsMainUI(player)
                break
            case 2:
                playerTrackingUI(player)
                break
            case 3:
                addGiftcode(player)
                break
            case 4:
                addRankUI(player)
                break
            case 5:
                removeRankUI(player)
                break
            case 6:
                otherPlayerSettingsUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

// player picker for player data lookup
export function playerDataMainUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Player Data')
    const u = mcl.getPlayerList()
    bui.dropdown(f, 'Player:', u)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        const p = mcl.getPlayer(u[e[0]])
        if (p) {
            playerDataViewUI(player, p)
        } else {
            playerDataOfflineUI(player, p)
        }
    }).catch()
}

/**
 * @param {Player} playerToShow 
 * @param {Player} playerToView 
 */
export function playerDataViewUI(playerToShow, playerToView) {
    let f = new ActionFormData()
    const player = playerToView
    bui.title(f, `${player.name}`)

    bui.label(f, `Name: ${player.name}, Nametag: [${player.nameTag}]`)
    bui.label(f, `ID: ${player.id}, Is Host: ${mcl.isHost(player)}`)
    bui.label(f, `Gamemode: ${player.getGameMode()}`)
    bui.label(f, `Location: ${parseInt(player.location.x)} ${parseInt(player.location.y)} ${parseInt(player.location.z)}, Dimension: ${player.dimension.id}`)
    bui.label(f, `Effects: ${mcl.playerEffectsArray(player)}`)
    bui.label(f, `Tags: ${mcl.playerTagsArray(player).join(', §r§f')}`)

    bui.button(f, 'Reload')
    bui.divider(f)
    bui.label(f, 'Items:')
    // doesnt view armor or offhand, not considered inventory slots??
    const items = mcl.getAllItems(player)
    for (let index = 0; index < items.size; index++) {
        const item = items[index]
        bui.label(f, `Type: ${item.typeId}, Amount: ${item.amount}`)
        bui.label(f, `Name: ${item.nameTag || ''}`)
        bui.divider(f)
    }

    bui.button(f, 'Reload')

    bui.divider(f)
    bui.label(f, 'Player Data:')
    const data = mcl.pListGetBoth(player)
    for (let index = 0; index < data.length; index++) {
        const d = data[index]
        bui.label(f, `${d.id} -> ${d.value}`)
        bui.divider(f)
    }

    bui.button(f, 'Reload')

    bui.divider(f)

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        playerDataViewUI(playerToShow, playerToView)
    }).catch((e) => {
        mcl.adminMessage(`Error Viewing Player, Message: ${String(e)}`)
    })
}

export function playerDataOfflineUI(playerToShow, playerToView) {
    let f = new ActionFormData()
    const player = mcl.jsonWGet(`darkoak:playerdata:${playerToView}`)
    if (!player) {
        playerToShow.sendMessage('§cError Viewing Player§r')
        return
    }
    bui.title(f, `${player.name}`)

    bui.label(f, `Name: ${player.name}, Nametag: [${player.nameTag}]`)
    bui.label(f, `ID: ${player.id}, Is Host: ${mcl.isHost(player)}`)
    bui.label(f, `Gamemode: ${player.getGameMode()}`)
    bui.label(f, `Location: ${parseInt(player.location.x)} ${parseInt(player.location.y)} ${parseInt(player.location.z)}, Dimension: ${player.dimension.id}`)
    bui.label(f, `Effects: ${mcl.playerEffectsArray(player)}`)
    bui.label(f, `Tags: ${mcl.playerTagsArray(player).join(', §r§f')}`)

    bui.button(f, 'Reload')
    bui.divider(f)
    bui.label(f, 'Items:')
    // doesnt view armor or offhand, not considered inventory slots??
    const items = player.items
    for (let index = 0; index < items.size; index++) {
        const item = items[index]
        bui.label(f, `Type: ${item.typeId}, Amount: ${item.amount}`)
        bui.label(f, `Name: ${item.nameTag || ''}`)
        bui.divider(f)
    }

    bui.button(f, 'Reload')

    bui.divider(f)
    bui.label(f, 'Player Data:')
    const data = player.dynamicProperties
    for (let index = 0; index < data.length; index++) {
        const d = data[index]
        bui.label(f, `${d.id} -> ${d.value}`)
        bui.divider(f)
    }

    bui.button(f, 'Reload')

    bui.divider(f)

    f.show(playerToShow).then((evd) => {
        if (evd.canceled) return
        playerDataOfflineUI(playerToShow, playerToView)
    }).catch((e) => {
        mcl.adminMessage(`Error Viewing Player, Message: ${String(e)}`)
    })
}

export function playerPunishmentsMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Player Punishments')

    bui.button(f, 'Ban A Player')
    bui.button(f, 'Unban A Player')
    bui.button(f, 'Ban Offline Player')
    bui.button(f, 'Mute A Player')
    bui.button(f, 'Unmute A Player')
    bui.button(f, 'Crash A Player')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch (evd.selection) {
            case 0:
                banPlayerUI(player)
                break
            case 1:
                unbanPlayerUI(player)
                break
            case 2:
                banOfflineUI(player)
                break
            case 3:
                mutePlayerUI(player)
                break
            case 4:
                unmutePlayerUI(player)
                break
            case 5:
                crashPlayerUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

export function banPlayerUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Ban Player')

    const names = bui.namePicker(f, undefined, '\nPlayer:')
    bui.textField(f, 'Reason / Ban Message', 'Example: Hacking')
    bui.textField(f, 'Ban Time In Hours (Leave Empty For Forever):', 'Example: 24')
    bui.toggle(f, 'Crash Instead Of Kick?', false, 'Only Use This If You Really Don\'t Want Them Coming Back')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        if (mcl.isDOBAdmin(mcl.getPlayer(names[e[0]]))) {
            mcl.adminMessage(`${player.name} Tried To Ban ${names[e[0]]}`)
            return
        }
        let time = e[2]
        if (isNaN(time) || time === '' || parseInt(time) <= 0) {
            time = -1
        }
        mcl.jsonWSet(`darkoak:bans:${mcl.timeUuid()}`, {
            player: names[e[0]],
            message: e[1],
            time: parseInt(time) * 3600,
            crash: e[3]
        })
        mcl.adminMessage(`${names[e[0]]} Has Been Banned!`)
    }).catch()
}

export function unbanPlayerUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Unban A Player')

    const bans = mcl.listGetBoth('darkoak:bans:')

    if (bans === undefined || bans.length == 0) {
        player.sendMessage('§cNo Bans Found§r')
        return
    }
    for (let index = 0; index < bans.length; index++) {
        const data = JSON.parse(bans[index].value)
        bui.label(f, `Player: ${data.player}, Time: ${(data.time / 3600).toFixed(2)}\nMessage: ${data.message}`)
        bui.button(f, `${data.player}\n${data.message}`)

        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        mcl.wRemove(bans[evd.selection].id)
    }).catch()

}

export function mutePlayerUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Mute A Player')

    const names = bui.namePicker(f, undefined, '\nPlayer:')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        player.runCommand(`tag ${names[e[0]]} add darkoak:muted`)
    }).catch()
}

export function unmutePlayerUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Unmute A Player')

    const names = bui.namePicker(f, 'darkoak:muted', '\nPlayer:')
    if (names === undefined || names.length == 0) {
        player.sendMessage('§cNo Mutes Found§r')
        return
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        player.runCommand(`tag ${names[e[0]]} remove darkoak:muted`)
    }).catch()
}

/**
 * @param {Player} player 
 */
export function playerTrackingUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Player Tracking')
    const d = mcl.jsonWGet('darkoak:tracking')

    bui.toggle(f, 'Flying', d.flying)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.flyingC)
    bui.divider(f)

    bui.toggle(f, 'Gliding', d.gliding)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.glidingC)
    bui.divider(f)

    bui.toggle(f, 'Climbing', d.climbing)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.climbingC)
    bui.divider(f)

    bui.toggle(f, 'Emoting', d.emoting)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.emotingC)
    bui.divider(f)

    bui.toggle(f, 'Falling', d.falling)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.fallingC)
    bui.divider(f)

    bui.toggle(f, 'In Water', d.inwater)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.inwaterC)
    bui.divider(f)

    bui.toggle(f, 'Jumping', d.jumping)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.jumpingC)
    bui.divider(f)

    bui.toggle(f, 'On Ground', d.onground)
    bui.textField(f, 'Command On Above Action:', 'Example: kill @s', d.ongroundC)
    bui.divider(f)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:tracking', {
            flying: e[0],
            flyingC: e[1],
            gliding: e[2],
            glidingC: e[3],
            climbing: e[4],
            climbingC: e[5],
            emoting: e[6],
            emotingC: e[7],
            falling: e[8],
            fallingC: e[9],
            inwater: e[10],
            inwaterC: e[11],
            jumping: e[12],
            jumpingC: e[13],
            onground: e[14],
            ongroundC: e[15],
        })
    }).catch()
}

/**main ui for chat settings
 * @param {Player} player 
*/
export function chatSettingsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Chat Settings')
    bui.body(f, 'Manage Chat Settings')

    bui.button(f, 'Manage Ranks\n§7Modify Rank Parts: Beginning, Middle, End, Bridge, Default Rank')
    bui.button(f, 'Chat Commands\n§7Create, Delete, Or Modify Chat Commands')
    bui.button(f, 'Censor Settings\n§7Stop Specified Words From Appearing In Chat', arrays.icons.playerSpeaking)
    bui.button(f, 'Chat Games\n§7Play Games In Chat')
    bui.button(f, 'Auto-Reply Settings\n§7Setup Automatic Responses To Questions')
    bui.button(f, 'Other\n§7Proximity Chat And Nametags')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            mainUI(player)
            return
        }

        switch (evd.selection) {
            case 0:
                rankSettingsUI(player)
                break
            case 1:
                chatCommandsMainUI(player)
                break
            case 2:
                censorSettingsMainUI(player)
                break
            case 3:
                chatGamesSettings(player)
                break
            case 4:
                autoResponseMainUI(player)
                break
            case 5:
                otherChatSettingsUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

// rank settings ui, used to manage rank start, middle, end, bridge, and default rank
export function rankSettingsUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Rank settings')
    const p = mcl.jsonWGet('darkoak:chatranks')

    bui.label(f, '\nRanks:')
    bui.textField(f, '\nRank Start:', 'Example: [', p.start)
    bui.divider(f)

    bui.textField(f, 'Rank Middle:', 'Example: ][', p.middle)
    bui.divider(f)

    bui.textField(f, 'Rank End:', 'Example: ]', p.end)
    bui.divider(f)

    bui.textField(f, 'Rank Bridge:', 'Example: ->', p.bridge)
    bui.divider(f)

    bui.textField(f, 'Default Rank:', 'Example: Member', p.defaultRank)
    bui.divider(f)

    bui.label(f, 'Look In The Documentaion For How To Add Ranks And Clans')
    bui.divider(f)
    bui.label(f, 'Clans:')

    bui.textField(f, 'Clan Start:', 'Example: (', p.cStart)
    bui.divider(f)

    bui.textField(f, 'Clan End:', 'Example: )', p.cEnd)
    bui.divider(f)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)

        mcl.jsonWSet('darkoak:chatranks', {
            defaultRank: e[4],
            bridge: e[3],
            middle: e[1],
            start: e[0],
            end: e[2],
            cStart: e[5],
            cEnd: e[6],
        })
    }).catch()
}

// main ui for chat commands
export function chatCommandsMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Chat Commands')
    bui.body(f, 'Manage Chat Commands')

    bui.button(f, 'Add New', arrays.icons.thinPlus)
    bui.button(f, 'Delete One', arrays.icons.trash)
    bui.button(f, 'Edit One')
    bui.button(f, 'View Chat Commands', arrays.icons.expand)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatSettingsUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                chatCommandsAddUI(player)
                break
            case 1:
                chatCommandsDeleteUI(player)
                break
            case 2:
                chatCommandsEditPickerUI(player)
                break
            case 3:
                chatCommandsViewUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

// ui for adding a chat command, chat commands must include the message and command, tag is optional
export function chatCommandsAddUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add New Chat Command')

    bui.label(f, arrays.hashtags)

    bui.textField(f, 'Message:', 'Example: !spawn', '', arrays.chatCommandSelectors)
    bui.textField(f, `Add A Command Or Hashtag Key. Hashtag Keys Include:\n${arrays.hashtagKeys}\nCommand:`, 'Example: tp @s 0 0 0')
    bui.textField(f, 'Required Tag:', 'Example: Admin')

    bui.label(f, 'Add More Commands:')
    bui.textField(f)
    bui.textField(f)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatCommandsMainUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: e[0].trim(),
            command: e[1].trim(),
            tag: e[2].trim(),
            command2: e[3].trim(),
            command3: e[4].trim(),
        })
    }).catch()
}

/**ui for deleting a chat command
 * @param {Player} player 
 */
export function chatCommandsDeleteUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Delete A Chat Command')
    bui.body(f, 'Will Reopen Once You Click A Button')

    const commands = mcl.listGetBoth('darkoak:command:')

    if (commands === undefined || commands.length == 0) {
        player.sendMessage('§cNo Chat Commands Found§r')
        return
    }

    for (let index = 0; index < commands.length; index++) {
        const c = JSON.parse(commands[index].value)
        bui.button(f, `${c.message || ''} | ${c.tag || ''}`)
        bui.label(f, `${c.command || ''}\n${c.command2 || ''}\n${c.command3 || ''}`)
        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatCommandsMainUI(player)
            return
        }
        mcl.wRemove(commands[evd.selection].id)
        chatCommandsDeleteUI(player)
    }).catch()
}

/**Picker for editing
 * @param {Player} player 
 */
export function chatCommandsEditPickerUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Edit Picker')

    const commands = mcl.listGetBoth('darkoak:command:')

    if (commands === undefined || commands.length === 0) {
        player.sendMessage('§cNo Chat Commands Found§r')
        return
    }

    for (let index = 0; index < commands.length; index++) {
        const p = JSON.parse(commands[index].value)
        bui.divider(f)
        bui.label(f, `${p.message} | ${p.tag || 'No Tag'}\nC1: ${p.command || ''}\nC2: ${p.command2 || ''}\nC3: ${p.command3 || ''}`)
        bui.button(f, `Edit?`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatCommandsMainUI(player)
            return
        }
        chatCommandsEditUI(player, commands[evd.selection].id)
    }).catch()
}

/**Edit chat commands
 * @param {Player} player 
 * @param {String} chatCommand 
 */
export function chatCommandsEditUI(player, chatCommand) {
    let f = new ModalFormData()
    const parts = mcl.jsonWGet(chatCommand)

    bui.textField(f, '\nEdit Message:', '', parts.message)
    bui.textField(f, 'Edit Command:', '', parts.command)
    bui.textField(f, 'Edit Tag:', '', parts.tag)
    bui.label(f, 'More Commands:')
    bui.textField(f, 'Command Two:', '', parts.command2)
    bui.textField(f, 'Command Three:', '', parts.command3)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        mcl.jsonWSet(chatCommand, {
            message: e[0],
            command: e[1],
            tag: e[2],
            command2: e[3],
            command3: e[4]
        })
    }).catch()

}

/**ui for viewing chat commands
 * @param {Player} player 
 */
export function chatCommandsViewUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'View Chat Commands')

    const values = mcl.listGetValues('darkoak:command:')
    if (values.length == 0) {
        player.sendMessage('§cNo Chat Commands Found§r')
        return
    }

    for (let index = 0; index < values.length; index++) {
        const p = JSON.parse(values[index])
        bui.divider(f)
        bui.label(f, `${p.message || ''} | ${p.tag || 'No Tag'}\n${p.command || ''}\n${p.command2 || ''}\n${p.command3 || ''}`)
    }

    bui.button(f, `Dismiss`)

    bui.show(f, player)
}

export function censorSettingsMainUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Censor Settings')

    bui.button(f, 'Add New Word', arrays.icons.thinPlus)
    bui.button(f, 'Remove A Word', arrays.icons.trash)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatSettingsUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                censorSettingsAddUI(player)
                break
            case 1:
                censorSettingsRemoveUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

export function censorSettingsAddUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Add New Censor')

    bui.textField(f, '(Be Careful!)\nWord To Ban:', 'Example: skibidi')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        let censors = mcl.jsonWGet('darkoak:censor') || []
        censors.push(e[0])
        mcl.jsonWSet('darkoak:censor', censors)
    }).catch()
}

export function censorSettingsRemoveUI(player) {
    let f = new ModalFormData()

    let words = mcl.jsonWGet('darkoak:censor') || []

    if (words === undefined || words.length == 0) {
        player.sendMessage('§cNo Censored Words Found§r')
        return
    }
    bui.dropdown(f, '\nWord:', words)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        words.splice(e[0], 1)
        mcl.jsonWSet('darkoak:censor', words)
    }).catch()
}

export function otherChatSettingsUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Other Chat Settings')

    const default1 = mcl.jsonWGet('darkoak:chat:other')

    bui.toggle(f, 'Proximity Chat (Fifteen Block Radius)', default1.proximity, 'Proximity Text Chat, Not Voice Chat')

    bui.divider(f)

    bui.toggle(f, 'Nametag Chat (Chat Messages Appear In Chat And Under Nametag)', default1.nametag, 'Downside Is That It Displays When You Whisper')

    bui.divider(f)

    bui.toggle(f, 'Chat Logs', default1.chatLogs, 'Logs The Last 100 Chat Messages')

    bui.divider(f)

    bui.toggle(f, 'Health Display', default1.healthDisplay, 'Displays The Players Health Under Their Nametag')

    bui.divider(f)

    bui.toggle(f, 'Professional Filter', default1.professional, 'Applys A Filter To Make Chat More Professional Looking')

    bui.divider(f)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:chat:other', {
            proximity: e[0],
            nametag: e[1],
            chatLogs: e[2],
            healthDisplay: e[3],
            professional: e[4],
        })
    }).catch()
}

/**
 * 
 * @param {Player} player 
 * @param {{x: number, y: number, z: number}} loc 
 */
export function chestLockUI(player, loc) {
    let f = new ModalFormData()

    bui.title(f, `Chest Lock`)
    const u = bui.namePicker(f, undefined, 'Player who can open the chest:', true)

    const p = mcl.listGetBoth('darkoak:chestlock:')
    for (let index = 0; index < p.length; index++) {
        const parts = JSON.parse(p[index].value)
        if (parts.x === loc.x.toString() && parts.y === loc.y.toString() && parts.z === loc.z.toString()) {
            bui.toggle(f, `Delete Chest Lock For This Chest?\n(Player: ${parts.player})`)
            continue
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const e = evd.formValues
        if (e[0] == 0) {
            for (let index = 1; index < e.length; index++) {
                if (e[index] == true) mcl.wRemove(p[index - 1].id)
            }
        } else {
            mcl.jsonWSet(`darkoak:chestlock:${mcl.timeUuid()}`, {
                player: u[e[0]],
                x: loc.x.toString(),
                y: loc.y.toString(),
                z: loc.z.toString()
            })
        }
    }).catch()
}

/**
 * @param {Player} player 
 */
export function dashboardMainUI(player) {
    let f = new ActionFormData()

    bui.button(f, 'Print World Data')
    bui.button(f, 'Delete Data')
    bui.button(f, 'Reports')
    bui.button(f, 'Logs')
    bui.button(f, 'Docs')
    bui.button(f, 'Admins And Players')
    bui.button(f, 'Script Settings / Master Settings\n§cExperimental§r')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            mainUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                player.sendMessage('§m----------------------§r')
                const data = mcl.listGetBoth()
                for (let index = 0; index < data.length; index++) {
                    const da = data[index]
                    player.sendMessage(`${da.id} <> ${da.value.toString()}`)
                }
                player.sendMessage(`Data Amount: ${world.getDynamicPropertyTotalByteCount().toString()}`)
                break
            case 1:
                dataDeleterUI(player)
                break
            case 2:
                if (mcl.listGet('darkoak:report:').length === 0) {
                    player.sendMessage('§cNo Reports Found§r')
                    return
                }
                reportsUI(player)
                break
            case 3:
                logsUI(player)
                break
            case 4:
                docsUI(player)
                break
            case 5:
                adminAndPlayerListUI(player)
                break
            case 6:
                scriptSettings(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

/**ui for deleting dynamic properties
 * @param {Player} player 
 */
export function dataDeleterUI(player, search = '') {
    let f = new ActionFormData()
    bui.title(f, 'Delete Data')

    const data = mcl.listGetBoth().filter(e => e.id.includes(search))

    bui.button(f, `Search?\nCurrent Search: ${search}`)
    bui.divider(f)

    for (let index = 0; index < data.length; index++) {
        const d = data[index]
        bui.label(f, d.id)
        bui.label(f, d.value.toString())
        bui.button(f, 'Delete?')
        bui.divider(f)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        if (evd.selection == 0) {
            dataDeleterSearchUI(player, search)
            return
        }
        mcl.wSet(data[evd.selection - 1].id)
        dataDeleterUI(player, search)
    }).catch()
}

export function dataDeleterSearchUI(player, search = '') {
    let f = new ModalFormData()
    bui.title(f, 'Data Deleter Searcher')

    bui.textField(f, 'ID Contains:', 'Example: mobgen', search)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            dataDeleterUI(player)
        } else {
            dataDeleterUI(player, evd.formValues[0])
        }
    }).catch()
}

/**
 * @param {Player} player 
 */
export function reportsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Reports')

    const reports = mcl.listGetBoth('darkoak:report:')

    if (reports === undefined || reports.length == 0) {
        player.sendMessage('§cNo Reports Found§r')
        return
    }

    for (let index = 0; index < reports.length; index++) {
        const parts = JSON.parse(reports[index].value)
        bui.button(f, `${parts.player} Reported By: ${parts.submitter}\n${parts.reason}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            dashboardMainUI(player)
            return
        }
        const data = JSON.parse(reports[evd.selection].value)
        let rf = new ActionFormData()
        bui.title(rf, data.player)

        bui.body(rf, `\nPlayer: ${data.player}\nSubmitted By: ${data.submitter}\n\nReason: ${data.reason}\n`)

        bui.button(rf, 'Take Action')
        bui.button(rf, 'Delete Report', arrays.icons.trash)
        bui.button(rf, 'Dismiss')

        rf.show(player).then((revd) => {
            if (revd.canceled) {
                reportsUI(player)
                return
            }
            if (revd.selection == 0) {
                playerPunishmentsMainUI(player)
            } else if (revd.selection == 1) {
                mcl.wRemove(reports[evd.selection].id)
            }
        }).catch()
    }).catch()
}

export function logsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Logs')

    bui.button(f, 'Message Logs')

    bui.label(f, 'Sorted By Latest First')

    let logs = mcl.jsonWGet('darkoak:log')
    if (logs != undefined) {
        logs.logs.sort((a, b) => {
            const numA = mcl.getStringBetweenChars(a.message, '[', ']')
            const numB = mcl.getStringBetweenChars(b.message, '[', ']')
            return numB - numA
        })

        for (let index = 0; index < logs.logs.length; index++) {
            bui.button(f, `${logs.logs[index].message}`)
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return

        if (evd.selection == 0) {
            messageLogUI(player)
        }
    }).catch()
}

export function docsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Documentation')

    bui.header(f, 'Scriptevents')
    bui.label(f, 'darkoak:help -> Lists All Script Events')
    bui.label(f, 'darkoak:enchant [event?: number] [action?: number] [power?: number] -> Opens Custom Enchant Menu, Or If The Parameters Are Defined It Enchants Using Said Parameters (? Means Optional)')
    bui.label(f, 'darkoak:spawn [itemtype: string] [amount: number] [x: number] [y: number] [z: number] -> Spawns An Item')
    bui.label(f, 'darkoak:command [Minecraft Command] -> Runs A Command With Replacer Hashtags')
    bui.label(f, 'darkoak:knockback [x: number] [z: number] [vertical_strength: number] -> Applys Knockback To A Player')
    bui.label(f, 'darkoak:if [value: any] [value: any] [Minecraft Command] -> If The Two Values Match It Runs The Command')
    bui.label(f, 'darkoak:variable [name: string] [value: any] -> Sets A Custom Variable Which Can Be Used In Replacer Hashtags')
    bui.label(f, 'darkoak:projectile [type: string] [x: number] [y: number] [z: number] [force: number] -> Shoots A Projectile Of The Specified Type Towards XYZ With The Specified Force')
    bui.label(f, 'darkoak:openui [ui: string] [args?: any] -> Opens A UI')
    bui.label(f, 'darkoak:uihelp -> Lists All UI\'s')
    bui.label(f, 'darkoak:transfer [ip: string] [port: number] -> Transfers The Player To The Specified IP And Port')
    bui.label(f, 'darkoak:explode [x: number] [y: number] [z: number] [radius: number] [fire?: boolean] [breaksBlocks?: boolean] -> Summons An Explosion At / With The Specified Arguments')

    bui.divider(f)

    bui.header(f, 'Tags')
    bui.label(f, 'darkoak:admin -> Admin Tag For Almost Everything')
    bui.label(f, 'darkoak:mod -> Allows The Tagged Player To Open the Punishment UI')

    bui.label(f, 'darkoak:muted -> Mutes The Tagged Player')

    bui.label(f, 'rank:yourrankhere -> Rank Tag, Replace \'yourrankhere\' With Anything You Want')
    bui.label(f, 'namecolor:yourcolorhere -> Name Color Tag, Replace \'yourcolorhere\' With A Color Code')
    bui.label(f, 'chatcolor:yourcolorhere -> Chat Color Tag, Replace \'yourcolorhere\' With A Color Code')

    bui.label(f, 'darkoak:team1 -> Teams Tag, If Two Players Have This Tag They Cannot Damage Each Other')
    bui.label(f, 'darkoak:team2 -> Teams Tag, If Two Players Have This Tag They Cannot Damage Each Other')
    bui.label(f, 'darkoak:team3 -> Teams Tag, If Two Players Have This Tag They Cannot Damage Each Other')
    bui.label(f, 'darkoak:team4 -> Teams Tag, If Two Players Have This Tag They Cannot Damage Each Other')

    bui.label(f, 'darkoak:immune -> If A Player Has This Tag, They Cannot Be Damaged At All')
    bui.label(f, 'darkoak:pacifist -> Makes Tagged Player Unable To Be Damaged Or Inflict Damage To Anything')

    bui.label(f, 'darkoak:flying -> Tracking Tag')
    bui.label(f, 'darkoak:gliding -> Tracking Tag')
    bui.label(f, 'darkoak:climbing -> Tracking Tag')
    bui.label(f, 'darkoak:emoting -> Tracking Tag')
    bui.label(f, 'darkoak:falling -> Tracking Tag')
    bui.label(f, 'darkoak:inwater -> Tracking Tag')
    bui.label(f, 'darkoak:jumping -> Tracking Tag')
    bui.label(f, 'darkoak:onground -> Tracking Tag')

    bui.divider(f)

    bui.header(f, 'Emojis')
    let emojiString = []
    const emojis = arrays.emojis
    for (let index = 0; index < emojis.length; index++) {
        const em = emojis[index]
        emojiString.push(`${em.m} -> ${em.e}`)
    }
    bui.label(f, emojiString.join('\n'))

    bui.divider(f)

    bui.header(f, 'Replacer Hashtags')
    bui.label(f, arrays.hashtags)

    bui.divider(f)

    bui.header(f, 'Chat Command Keys')
    bui.label(f, arrays.hashtagKeys)

    bui.divider(f)

    bui.header(f, '§cDebug Events§r')
    bui.label(f, '§cNot Recommended To Use!§r')
    bui.label(f, arrays.debugEvents)

    bui.divider(f)

    bui.button(f, 'Dismiss')

    f.show(player)
}


// main ui for making new ui, works by feeding set data to a function that displays it
// cui = custom ui (any ui made by this)
export function UIMakerUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'UI Maker')

    bui.button(f, 'Make A Message UI\n§7Two Buttons (With Commands) With Title And Text')
    bui.button(f, 'Make An Action UI\n§7Ten Different Buttons (With Commands) With Title And Text')
    bui.button(f, 'Make A Modal UI')
    bui.button(f, 'Delete A UI\n§7Delete Action Or Message UI\'s')
    bui.button(f, 'Edit A UI\n§7Modify Existing Custom UI\'s')
    bui.button(f, 'Set The Actionbar\n§7Modify The Actionbar')
    bui.button(f, 'Set the Sidebar\n§7Modify The Sidebar')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            mainUI(player)
            return
        }

        switch (evd.selection) {
            case 0:
                messageUIMakerUI(player)
                break
            case 1:
                actionUIPickerUI(player)
                break
            case 2:
                modalUIMakerUI(player)
                break
            case 3:
                UIDeleterUI(player)
                break
            case 4:
                CUIEditPicker(player)
                break
            case 5:
                actionBarUI(player)
                break
            case 6:
                sidebarUI(player)
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
export function actionUIPickerUI(player) {
    let f = new ModalFormData()

    bui.slider(f, 'Amount Of Buttons', 1, 10, 1, 1)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        actionUIMakerUI(player, evd.formValues[0])
    }).catch()
}

/**
 * @param {Player} player 
 * @param {number} amount 
 */
export function actionUIMakerUI(player, amount) {
    let f = new ModalFormData()

    bui.label(f, arrays.hashtags)

    bui.textField(f, 'Title:', 'Example: Warps')
    bui.textField(f, 'Body:', 'Example: Click A Button To TP')
    bui.textField(f, 'Tag To Open:', 'Example: warpmenu')

    for (let index = 1; index <= amount; index++) {
        bui.textField(f, `Button ${index}:`, '')
        bui.textField(f, `Command ${index}:`, '')
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)

        const title = e[0]
        const body = e[1]
        const tag = e[2]

        const buttons = []
        for (let index = 3; index < e.length; index += 2) {
            buttons.push({ title: e[index], command: e[index + 1] })
        }

        const ui = { title, body, tag, buttons }

        mcl.wSet(`darkoak:ui:action:${mcl.timeUuid()}`, JSON.stringify(ui))
    }).catch()
}

// ui for deleting cui
export function UIDeleterUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Delete A UI')

    const u = mcl.listGet('darkoak:ui:')
    for (let index = 0; index < u.length; index++) {
        const n = u[index].split(':')
        const v = mcl.jsonWGet(u[index])
        if (n[2] === 'message') {
            bui.button(f, `Type: ${n[2]}, Title: ${v.title}, Tag: ${v.tag}\nBody: ${v.body}`)
        } else if (n[2] === 'action') {
            bui.button(f, `Type: ${n[2]}, Title: ${v.title}, Tag: ${v.tag}\nBody: ${v.body}`)
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        mcl.wSet(u[evd.selection])
    }).catch()
}

// ui for making a message cui
export function messageUIMakerUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Message UI Maker')

    bui.label(f, arrays.hashtags)

    f.textField('UI Title:', 'Example: Welcome!')
    f.textField('UI Body Text:', 'Example: Hello there!')
    f.textField('Tag To Open:', 'Example: welcomemessage')
    f.textField('UI Button 1:', 'Example: Hi!')
    f.textField('UI Button 2:', 'Example: Hello!')
    f.textField('Button1 Command:', 'Example: tp @s 0 0 0')
    f.textField('Button2 Command:', 'Example: tp @s 6 2 7')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        const e = bui.formValues(evd)
        const ui = { title: e[0], body: e[1], tag: e[2], button1: e[3], command1: e[5], button2: e[4], command2: e[6] }
        mcl.jsonWSet(`darkoak:ui:message:${mcl.timeUuid()}`, ui)
    }).catch()
}

export function actionBarUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Action Bar')

    f.textField(`${arrays.hashtags}\nAction Bar:`, 'Example: #name#: #location#', {
        defaultValue: mcl.wGet('darkoak:actionbar')
    })

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        mcl.wSet('darkoak:actionbar', evd.formValues[0])
    }).catch()
}

export function sidebarUI(player) {
    let f = new ModalFormData()

    const def = {
        lines: ['', '', '', '', '', '', '', '', '', '', '', '', '']
    }

    const d = mcl.jsonWGet('darkoak:sidebar') || def

    f.textField(`\n${arrays.hashtags}\n\nLine 1:`, '', {
        defaultValue: d.lines[0]
    })
    for (let index = 2; index < 13; index++) {
        f.textField(`Line ${index}:`, '', {
            defaultValue: d.lines[index - 1]
        })
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet('darkoak:sidebar', {
            lines: [
                e[0],
                e[1],
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
            ]
        })
    }).catch()
}

/**
 * @param {Player} player 
 */
export function communitySettingsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Community Settings')

    bui.button(f, 'Warp / TP Settings')
    bui.button(f, 'Shop Settings')
    bui.button(f, 'Report Settings')
    bui.button(f, 'Show / Hide Options')
    bui.button(f, 'General Settings')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }

        switch (evd.selection) {
            case 0:
                warpSettingsUI(player)
                break
            case 1:
                shopSettingsUI(player)
                break
            case 2:
                reportSettingsUI(player)
                break
            case 3:
                showHideOptionsSettingsUI(player)
                break
            case 4:
                communityGeneralUI(player)
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
export function communityGeneralUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'General Settings')

    const settings = mcl.jsonWGet('darkoak:community:general')

    bui.toggle(f, 'Give Player Community Item When They Join?', settings.giveOnJoin)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }
        const e = evd.formValues

        mcl.jsonWSet('darkoak:community:general', {
            giveOnJoin: e[0]
        })
    }).catch()
}

export function warpSettingsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Warp / TP Settings')

    bui.button(f, 'RTP Settings')
    bui.button(f, 'TPA Settings')
    bui.button(f, 'Create A Warp')
    bui.button(f, 'Delete A Warp')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }

        switch (evd.selection) {
            case 0:
                rtpUI(player)
                break
            case 1:
                tpaSettings(player)
                break
            case 2:
                createWarpUI(player)
                break
            case 3:
                deleteWarpUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    }).catch()
}

export function rtpUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'RTP Settings')

    bui.toggle(f, 'Enabled?', mcl.wGet('darkoak:cws:rtp:enabled') || false)
    bui.textField(f, 'Center Co-ord:', 'Example: 0', mcl.wGet('darkoak:cws:rtp:center'))
    bui.textField(f, 'Max Distance:', 'Example: 10000', mcl.wGet('darkoak:cws:rtp:distance'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            warpSettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.wSet('darkoak:cws:rtp:enabled', e[0])
        mcl.wSet('darkoak:cws:rtp:center', e[1])
        mcl.wSet('darkoak:cws:rtp:distance', e[2])
    }).catch()
}


export function shopSettingsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Shop Settings')

    bui.button(f, 'Add Item')
    bui.button(f, 'Remove Item')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                shopAddUI(player)
                break
            case 1:
                shopRemoveUI(player)
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
export function shopRemoveUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Remove Shop Item')

    const item = mcl.listGetBoth('darkoak:shopitem:')
    for (let index = 0; index < item.length; index++) {
        /** @type {{ sell: boolean, item: string, amount: number, price: number }} */
        const parts = JSON.parse(item[index].value)

        bui.button(f, `Sell:${parts.sell} ${parts.item.replace('minecraft:', '')} x${parts.amount} - $${parts.price}`, `textures/items/${parts.item.replace('minecraft:', '')}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return

        mcl.wSet(item[evd.selection].id)
    }).catch()
}

/**
 * @param {Player} player 
 */
export function shopAddUI(player, message = '') {
    let f = new ModalFormData()
    bui.title(f, 'Add Shop Item')

    bui.label(f, message)

    bui.toggle(f, 'Sell?')
    bui.textField(f, '\nItem ID:', 'Example: minecraft:diamond')
    bui.slider(f, 'Amount Of Items:', 1, 64)
    bui.textField(f, 'Price:', 'Example: 100')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = bui.formValues(evd)
        if (isNaN(e[3]) || e[1] == '') {
            shopAddUI(player, '§cPrice Or Item Is Invalid§r')
            return
        }
        mcl.jsonWSet(`darkoak:shopitem:${mcl.timeUuid()}`, { 
            sell: e[0],
            item: e[1],
            amount: e[2],
            price: e[3],
        })
    }).catch()
}

export function showHideOptionsSettingsUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Show / Hide Options')

    const en = mcl.jsonWGet('darkoak:communityshowhide')

    f.toggle('Show Pay / Shop?', {
        defaultValue: en?.payshop0 || false
    })
    f.toggle('Show Pay / Shop -> Pay?', {
        defaultValue: en?.payshop1 || false
    })
    f.toggle('Show Pay / Shop -> Shop?', {
        defaultValue: en?.payshop2 || false
    })
    f.toggle('Show Pay / Shop -> Auction House?', {
        defaultValue: en?.payshop3 || false
    })
    f.toggle('Show Warps?', {
        defaultValue: en?.warps || false
    })
    f.toggle('Show Report?', {
        defaultValue: en?.report || false
    })
    bui.toggle(f, 'Show My Profile?', en?.myprofile)
    bui.toggle(f, 'Show Personal Log?', en?.personallog)
    bui.toggle(f, 'Show Giftcodes?', en?.giftcodes)
    bui.toggle(f, 'Show Credits?\nPlease Don\'t Disable This', en?.credits)
    bui.toggle(f, 'Show Pay / Shop -> Compress / Decompress?', en?.payshop4)
    bui.toggle(f, 'Show Pay / Shop -> Gambling?', en?.payshop5)
    bui.toggle(f, 'Show Pay / Shop -> Bounty?', en?.payshop6)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:communityshowhide', {
            payshop0: e[0],
            payshop1: e[1],
            payshop2: e[2],
            payshop3: e[3],
            warps: e[4],
            report: e[5],
            myprofile: e[6],
            personallog: e[7],
            giftcodes: e[8],
            credits: e[9],
            payshop4: e[10],
            payshop5: e[11],
            payshop6: e[12],
        })
    }).catch()
}

export function reportSettingsUI(player) {
    let f = new ModalFormData()

    const settings = mcl.jsonWGet('darkoak:reportsettings')

    bui.title(f, 'Report Settings')
    bui.textField(f, 'Report Rules:', 'Example: No Reporting For Veganism', settings?.rules)
    bui.toggle(f, 'Enabled?', settings?.enabled)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonWSet('darkoak:reportsettings', {
            enabled: e[1],
            rules: e[0]
        })
    }).catch()
}


export function creditsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Credits')

    bui.header(f, 'Developers')

    bui.button(f, 'Darkoakboat2121', 'textures/items/boat_darkoak') // 0
    bui.label(f, 'Hi, I made this addon!')

    bui.button(f, 'Noki5160') // 1
    bui.label(f, 'Helped Code Some Things Such As The Plug-in System (Seriously, Thanks Noki)')

    bui.divider(f)

    bui.header(f, 'Inspiration / Ideas')

    bui.label(f, 'Noki5160')
    bui.label(f, 'Inspiration for anticheat')

    bui.divider(f)

    bui.header(f, 'Miscellaneous')
    bui.button(f, 'CanineYeti24175') // 2
    bui.label(f, 'Thank you canine for being cool lol')
    bui.label(f)
    bui.button(f, 'Tygerklawk', 'textures/blocks/raw_gold_block') // 3
    bui.label(f, 'Thank you for helping me test stuff')

    bui.divider(f)

    bui.header(f, 'Links')
    bui.label(f, 'Discord: cE8cYYeFFx')
    bui.label(f, 'Website: https://darkoakaddons.rf.gd/')

    bui.button(f, 'Dismiss', 'textures/items/boat_darkoak')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch (evd.selection) {
            case 0:
                darkoakboatBio(player)
                break
            case 1:
                nokiBio(player)
                break
            case 2:
                canineyetiBio(player)
                break
            case 3:
                tygerBio(player)
                break
        }
    }).catch()
}

/////////////////////////////////////////////////////////////Community Item//////////////////////////////////////////////////////////////

/**Main community ui
 * @param {Player} player 
 */
export function communityMain(player) {
    let f = new ActionFormData()
    bui.title(f, 'Community')
    bui.body(f, 'Use This Item While Crouching And Looking At A Player To View Their Profile')

    const en = mcl.jsonWGet('darkoak:communityshowhide')

    if (en?.payshop0) bui.button(f, 'Money', arrays.icons.minecoin)
    if (en?.warps) bui.button(f, 'Warps')
    if (en?.report) bui.button(f, 'Report')
    if (en?.myprofile) bui.button(f, 'My Profile', arrays.icons.whitePlayer)
    if (en?.personallog) bui.button(f, 'Personal Log')
    if (en?.giftcodes) bui.button(f, 'Giftcodes')
    if (en?.credits) bui.button(f, 'Credits', arrays.icons.item('boat_dark_oak'))
    if (mcl.isDOBAdmin(player)) {
        bui.button(f, 'Community Settings\n(Admins Only)', arrays.icons.fourPlayers)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return

        let selectionIndex = 0
        if (en?.payshop0 && evd.selection === selectionIndex++) {
            communityMoneyUI(player)
            return
        }
        if (en?.warps && evd.selection === selectionIndex++) {
            warpsUI(player)
            return
        }
        if (en?.report && evd.selection === selectionIndex++) {
            reportPlayerUI(player)
            return
        }
        if (en?.myprofile && evd.selection === selectionIndex++) {
            myProfile(player)
            return
        }
        if (en?.personallog && evd.selection === selectionIndex++) {
            personalLogUI(player)
            return
        }
        if (en?.giftcodes && evd.selection === selectionIndex++) {
            redeemGiftcodeUI(player)
            return
        }
        if (en?.credits && evd.selection === selectionIndex++) {
            creditsUI(player)
            return
        }
        if (player.hasTag('darkoak:admin') && evd.selection === selectionIndex) {
            communitySettingsUI(player)
        } else {
            player.sendMessage('§cError§r')
        }
    }).catch()
}


export function communityMoneyUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Money')

    const en = mcl.jsonWGet('darkoak:communityshowhide')

    if (en?.payshop1) bui.button(f, 'Pay')
    if (en?.payshop2) bui.button(f, 'Shop')
    if (en?.payshop3) bui.button(f, 'Auction House')
    if (en?.payshop4) bui.button(f, 'Compress & Decompress')
    if (en?.payshop5) bui.button(f, 'Gambling')
    if (en?.payshop6) bui.button(f, 'Bountys')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }

        let selectionIndex = 0
        if (en?.payshop1 && evd.selection === selectionIndex++) {
            payUI(player)
            return
        }
        if (en?.payshop2 && evd.selection === selectionIndex++) {
            shopUI(player)
            return
        }
        if (en?.payshop3 && evd.selection === selectionIndex++) {
            auctionMain(player)
            return
        }
        if (en?.payshop4 && evd.selection === selectionIndex++) {
            pressionUI(player)
            return
        } 
        
        if (en?.payshop5 && evd.selection === selectionIndex++) {
            gamblingMainUI(player)
            return
        } 
        
        if (en?.payshop6 && evd.selection === selectionIndex) {
            bountyMainUI(player)
            return
        } else {
            player.sendMessage('§cError§r')
        }
    }).catch()
}


export function warpsUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Warps')

    bui.button(f, 'RTP')
    bui.button(f, 'TPA')
    bui.label(f, 'Warps:')

    const warps = mcl.listGetValues('darkoak:warp:')
    for (let index = 0; index < warps.length; index++) {
        const data = JSON.parse(warps[index])
        bui.button(f, `${data.name}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }
        const e = evd.selection
        if (e === 0) {
            rtp(player)
            return
        } else if (e === 1) {
            tpaUI(player)
            return
        } else {
            const data = JSON.parse(warps[e - 2])
            let parts = ''
            if (data != undefined) {
                parts = data.coords.split(' ')
            }
            player.runCommand(`tp @s ${parts[0]} ${parts[1]} ${parts[2]}`)
        }

    }).catch()
}

/**Pay another player
 * @param {Player} player 
 */
export function payUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Pay')

    const names = bui.namePicker(f, undefined, '\nPlayer:')
    bui.textField(f, 'Amount:', 'Example: 100')
    bui.label(f, `Current Amount: ${mcl.getScore(player).toString()}`)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMoneyUI(player)
            return
        }
        const e = bui.formValues(evd)
        if (isNaN(e[1])) {
            payUI(player)
            return
        }
        if (mcl.getScore(player) < parseInt(e[1])) {
            player.sendMessage('§cNot Enough Money§r')
            return
        }
        mcl.addScore(mcl.getPlayer(names[e[0]]), parseInt(e[1]))
        mcl.removeScore(player, parseInt(e[1]))
    }).catch()
}

/**Profile editor
 * @param {Player} player 
 */
export function myProfile(player) {
    let f = new ModalFormData()
    bui.title(f, 'My Profile')

    const parts = mcl.jsonPGet(player, 'darkoak:profile')
    if (parts === undefined) {
        mcl.jsonPSet(player, 'darkoak:profile', { 
            description: '',
            pronouns: '',
            age: ''
        })
    }
    console.log(JSON.stringify(parts))

    bui.textField(f, '\nDescription:', 'Example: Hi, I\'m Darkoakboat2121.', parts?.description)
    bui.textField(f, 'Pronouns:', 'Example: He / Him', parts?.pronouns, 'Good For Other Things Too!')
    bui.textField(f, 'Age:', 'Example: 17', parts?.age, 'Good For Other Things Too!')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.jsonPSet(player, 'darkoak:profile', {
            description: e[0],
            pronouns: e[1],
            age: e[2],
        })
    }).catch()
}

/**Profile
 * @param {Player} playerToShow
 * @param {Player} playerToView
 */
export function viewProfile(playerToShow, playerToView) {
    let f = new ActionFormData()

    const parts = mcl.jsonPGet(playerToView, 'darkoak:profile')
    if (parts === undefined) {
        playerToShow.sendMessage(`§c${playerToView.name}'s Profile Hasn't Been Set-up Yet§r`)
        return
    }

    bui.title(f, `${playerToView.name}'s Profile`)

    bui.header(f, playerToView.name)
    bui.label(f, parts?.pronouns)
    bui.label(f, `Age: ${parts?.age}`)

    bui.divider(f)

    bui.header(f, 'Description')
    bui.label(f, parts?.description)

    bui.button(f, 'Dismiss')

    bui.show(f, playerToShow)
}

/**
 * @param {Player} player 
 */
export function reportPlayerUI(player) {
    let f = new ModalFormData()
    bui.title(f, 'Report A Player')

    const settings = mcl.jsonWGet('darkoak:reportsettings')
    if (!settings.enabled) {
        player.sendMessage('§cReporting Is Disabled§r')
        return
    }

    bui.label(f, `Rules:\n${settings.rules}`)

    const names = bui.namePicker(f, undefined, '\nPlayer:')
    f.textField('Reason:', 'Example: He Was Hacking')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }
        const e = bui.formValues(evd)
        mcl.wSet(`darkoak:report:${mcl.timeUuid()}`, JSON.stringify({ player: names[e[0]], reason: e[1], submitter: player.name }))
    }).catch()
}

/**RTP
 * @param {Player} player 
 */
export function rtp(player) {
    if (mcl.wGet('darkoak:cws:rtp:enabled') === true) {
        const center = mcl.wGet('darkoak:cws:rtp:center')
        const distance = mcl.wGet('darkoak:cws:rtp:distance')
        player.runCommand(`spreadplayers ${center} ${center} 1 ${distance} "${player.name}"`)
    } else player.sendMessage('§cRTP Is Disabled§r')
}


/**
 * @param {Player} player 
 */
export function shopUI(player) {
    let f = new ActionFormData()
    bui.title(f, 'Shop')

    const value = mcl.listGetValues('darkoak:shopitem:')
    for (let index = 0; index < value.length; index++) {
        /** @type {{ sell: boolean, item: string, amount: number, price: number }} */
        const parts = JSON.parse(value[index])
        if (parts.sell === true) {
            bui.button(f, `Sell: ${parts.item.replace('minecraft:', '')} x${parts.amount} - $${parts.price}`, `textures/items/${parts.item.replace('minecraft:', '')}`)
        } else {
            bui.button(f, `Buy: ${parts.item.replace('minecraft:', '')} x${parts.amount} - $${parts.price}`, `textures/items/${parts.item.replace('minecraft:', '')}`)
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMoneyUI(player)
            return
        }
        /** @type {{ sell: boolean, item: string, amount: number, price: number }} */
        const parts = JSON.parse(value.at(evd.selection))
        if (parts.sell === true) {
            if (!mcl.sell(player, parts.price, parts.item, parts.amount)) player.sendMessage('§cNot Enough To Sell§r')
        } else {
            if (!mcl.buy(player, parts.price, parts.item, parts.amount)) player.sendMessage('§cNot Enough Money§r')
        }
    }).catch()
}
// 2085 lines in one file