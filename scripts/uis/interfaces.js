import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as arrays from "../data/arrays"
import { mcl } from "../logic"
import { auctionMain, createWarpUI, deleteWarpUI, messageLogUI, tpaSettings, tpaUI } from "./interfacesTwo"

// This file holds all the functions containing UI

// Main UI: Opened by using the main item with the tag darkoak:admin
export function mainUI(player) {
    let f = new ActionFormData()
    f.title('Main')
    f.body('Manage Various Settings')

    f.divider()

    f.button('World Settings\n§7Modify World Related Settings', 'textures/ui/World')
    f.label('Interaction Settings, Bind Custom Item, Welcome Message, World Border, Money ID')

    f.divider()

    f.button('Player Settings\n§7Modify Player Related Settings', 'textures/ui/FriendsIcon')
    f.label('Player Data, Punishments, Player Tracking')

    f.divider()

    f.button('Chat Settings\n§7Modify Chat Related Settings', 'textures/ui/chat_send')
    f.label('Manage Ranks, Chat Commands, Censor Settings, Other')

    f.divider()

    f.button('UI Settings\n§7Create New UI\'s Or Set The Sidebar / Actionbar', 'textures/ui/dialog_background_opaque')
    f.label('Make A Message UI, Make An Action UI, Delete A UI, Set The Actionbar, Set The Sidebar')

    f.divider()

    f.button('Dashboard\n§7See Important Info Such As Logs And Data', 'textures/items/diamond')
    f.label('Print World Data, Delete Data, Reports, Logs, Docs')

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
    })
}

// Main ui for world settings
export function worldSettingsUI(player) {
    let f = new ActionFormData()
    f.title('World Settings')
    f.body('Manage World Settings')

    f.button('Interaction Settings\n§7Modify Whether Interactions Can Take Place', 'textures/ui/interact')
    f.button('Bind Custom Item\n§7Bind Dummy Items', 'textures/ui/equipped_item_border')
    f.button('Welcome Message\n§7Set The Message That Players See When They Join')
    f.button('World Border\n§7Set The World Border Size', 'textures/blocks/barrier')
    f.button('Money ID\n§7Set The Scoreboard ID For Money', arrays.icons.minecoin)

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
            default:
                player.sendMessage('§cError§r')
                break
        }
    })
}

export function worldInteractionSettings(player) {
    let f = new ModalFormData()
    f.title('Interaction Settings')

    f.slider('\nPlayers Can Break Blocks?\n1 = Yes\n2 = Can\'t Break Item Frames\n3 = Can\'t Break Any Blocks\nValue', 1, 3, 1, mcl.wGet('darkoak:cws:breakblocks')) // 0
    f.divider()
    f.slider('Players Can Interact With Blocks?\n1 = Yes\n2 = Can\'t Interact With Item Frames\n3 = Can\'t Interact With Ender Chests\n4 = Can\'t Interact With Ender Chests Or Item Frames\n5 = Can\'t Interact With Any\nValue', 1, 5, 1, mcl.wGet('darkoak:cws:interactwithblocks')) // 1
    f.divider()
    f.slider('Players Can Interact With Entities?\n1 = Yes\n2 = ', 1, 3, 1)
    f.divider()

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.wSet('darkoak:cws:breakblocks', e[0])
        mcl.wSet('darkoak:cws:interactwithblocks', e[1])
    })
}

export function itemBindsUI(player) {
    let f = new ModalFormData()
    f.title('Bind Custom Item')

    f.slider('\nItem Number', 1, arrays.dummySize, 1)
    f.textField('Command:', 'Example: tp @s 0 1 0')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        mcl.wSet(`darkoak:bind:${evd.formValues[0]}`, evd.formValues[1])
    })
}

export function welcomeMessageUI(player) {
    let f = new ModalFormData()
    f.title('Welcome Message')

    f.textField(`${arrays.hashtags}\nMessage:`, 'Example: Welcome to Super-Skygen!', mcl.wGet('darkoak:welcome'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        mcl.wSet('darkoak:welcome', evd.formValues[0])
        player.sendMessage(mcl.wGet('darkoak:welcome'))
    })
}

export function worldBorderUI(player) {
    let f = new ModalFormData()
    f.title('World Border')
    f.textField('\n(Must Be A Number, 0 = Disabled)\nSize:', 'Example: 3000', mcl.wGet('darkoak:cws:border'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        if (isNaN(evd.formValues[0])) {
            worldBorderUI(player)
            return
        }
        mcl.wSet('darkoak:cws:border', evd.formValues[0])
    })
}

export function moneyUI(player) {
    let f = new ModalFormData()
    f.title('Money ID')

    f.textField('\nScore Name For Money:', 'Example: Money', mcl.wGet('darkoak:moneyscore'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            worldSettingsUI(player)
            return
        }
        mcl.wSet('darkoak:moneyscore', evd.formValues[0])
    })
}

// main ui for player settings: player data lookup, punishments
export function playerSettingsUI(player) {
    let f = new ActionFormData()
    f.title('Player Settings')
    f.body('Manage Player Settings')

    f.button('Player Data\n§7View A Player\'s Data', 'textures/ui/glyph_inventory')
    f.button('Punishments\n§7Punish A Player', 'textures/ui/cancel')
    f.button('Player Tracking\n§7Modify Tracking Settings')

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
            default:
                player.sendMessage('§cError§r')
                break
        }
    })
}

// player picker for player data lookup
export function playerDataMainUI(player) {
    let f = new ModalFormData()
    f.title('Player Data')
    const u = mcl.playerNameArray()

    f.dropdown('\n\nPlayer:', u)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerSettingsUI(player)
            return
        }
        playerDataViewUI(player, u[evd.formValues[0]])
    })
}

// player data viewer
export function playerDataViewUI(playerToShow, playerToView) {
    let f = new ActionFormData()
    const player = world.getPlayers({ name: playerToView })[0]
    f.title(`${player.name}`)

    f.body(`Name: ${player.name}, Shows as: ${player.nameTag}
ID: ${player.id}, Is Host: ${mcl.isHost(player)}
Gamemode: ${player.getGameMode()}
Location: ${parseInt(player.location.x)} ${parseInt(player.location.y)} ${parseInt(player.location.z)}, Dimension: ${player.dimension.id}
Effects: ${mcl.playerEffectsArray(player)}
Tags: ${mcl.playerTagsArray(player).join(', §r§f')}
        `)

    f.button('Dismiss')

    f.show(playerToShow)
}

export function playerPunishmentsMainUI(player) {
    let f = new ActionFormData()
    f.title('Player Punishments')

    f.button('Ban A Player')
    f.button('Unban A Player')
    f.button('Mute A Player')
    f.button('Unmute A Player')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerSettingsUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                banPlayerUI(player)
                break
            case 1:
                unbanPlayerUI(player)
                break
            case 2:
                mutePlayerUI(player)
                break
            case 3:
                unmutePlayerUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    })
}

export function banPlayerUI(player) {
    let f = new ModalFormData()
    f.title('Ban Player')

    const names = mcl.playerNameArray()
    f.dropdown('\nPlayer:', names)
    f.textField('Reason / Ban Message', 'Example: Hacking')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        const e = evd.formValues
        mcl.wSet(`darkoak:bans:${mcl.timeUuid()}`, JSON.stringify({ player: names[e[0]], message: e[1] }))
        player.runCommand(`gamemode s "${names[e[0]]}"`)
        player.runCommand(`kill "${names[e[0]]}"`)
    })
}

export function unbanPlayerUI(player) {
    let f = new ActionFormData()
    f.title('Unban A Player')

    const ids = mcl.listGet('darkoak:bans:')
    const values = mcl.listGetValues('darkoak:bans:')

    if (ids === undefined || ids.length === 0) {
        player.sendMessage('§cNo Bans Found§r')
        return
    }
    for (const p of values) {
        const data = JSON.parse(p)
        f.button(`${data.player}\n${data.message}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        mcl.wSet(ids[evd.selection])
    })

}

export function mutePlayerUI(player) {
    let f = new ModalFormData()
    f.title('Mute A Player')

    const names = mcl.playerNameArray()
    f.dropdown('\nPlayer:', names)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        player.runCommand(`tag ${names[evd.formValues[0]]} add darkoak:muted`)
    })
}

export function unmutePlayerUI(player) {
    let f = new ModalFormData()
    f.title('Unmute A Player')

    const names = mcl.playerNameArray('darkoak:muted')
    if (names === undefined || names.length === 0) {
        player.sendMessage('§cNo Mutes Found§r')
        return
    }
    f.dropdown('\nPlayer:', names)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerPunishmentsMainUI(player)
            return
        }
        player.runCommand(`tag ${names[evd.formValues[0]]} remove darkoak:muted`)
    })
}

/**
 * @param {Player} player 
 */
export function playerTrackingUI(player) {
    let f = new ModalFormData()
    f.title('Player Tracking')
    const d = mcl.jsonWGet('darkoak:tracking')

    f.toggle('Flying', d.flying)
    f.toggle('Gliding', d.gliding)
    f.toggle('Climbing', d.climbing)
    f.toggle('Emoting', d.emoting)
    f.toggle('Falling', d.falling)
    f.toggle('In Water', d.inwater)
    f.toggle('Jumping', d.jumping)
    f.toggle('On Ground', d.onground)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            playerSettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet('darkoak:tracking', {
            flying: e[0],
            gliding: e[1],
            climbing: e[2],
            emoting: e[3],
            falling: e[4],
            inwater: e[5],
            jumping: e[6],
            onground: e[7]
        })

    })
}

/**main ui for chat settings
 * @param {Player} player 
*/
export function chatSettingsUI(player) {
    let f = new ActionFormData()
    f.title('Chat Settings')
    f.body('Manage Chat Settings')

    f.button('Manage Ranks\n§7Modify Rank Parts: Beginning, Middle, End, Bridge, Default Rank')
    f.button('Chat Commands\n§7Create, Delete, Or Modify Chat Commands')
    f.button('Censor Settings\n§7Stop Specified Words From Appearing In Chat', 'textures/ui/Feedback')
    f.button('Other\n§7Proximity Chat And Nametags')

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
                otherChatSettingsUI(player)
                break
            default:
                player.sendMessage('§cError§r')
                break
        }
    })
}

// rank settings ui, used to manage rank start, middle, end, bridge, and default rank
export function rankSettingsUI(player) {
    let f = new ModalFormData()
    f.title('Rank settings')
    const p = mcl.jsonWGet('darkoak:chatranks')

    f.textField('\nRank Start:', 'Example: [', p.start)
    f.divider()
    f.textField('Rank Middle:', 'Example: ][', p.middle)
    f.divider()
    f.textField('Rank End:', 'Example: ]', p.end)
    f.divider()
    f.textField('Rank Bridge:', 'Example: ->', p.bridge)
    f.divider()
    f.textField('Default Rank:', 'Example: Member', p.defaultRank)
    f.divider()
    f.label('Look In The Documentaion For How To Add Ranks')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatSettingsUI(player)
            return
        }
        const e = evd.formValues

        mcl.jsonWSet('darkoak:chatranks', {
            defaultRank: e[4],
            bridge: e[3],
            middle: e[1],
            start: e[0],
            end: e[2]
        })
    })
}

// main ui for chat commands
export function chatCommandsMainUI(player) {
    let f = new ActionFormData()
    f.title('Chat Commands')
    f.body('Manage Chat Commands')

    f.button('Add New', 'textures/ui/ThinPlus')
    f.button('Delete One', 'textures/ui/icon_trash')
    f.button('Edit One')
    f.button('View Chat Commands', 'textures/ui/icon_preview')

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
    })
}

// ui for adding a chat command, chat commands must include the message and command, tag is optional
export function chatCommandsAddUI(player) {
    let f = new ModalFormData()
    f.title('Add New Chat Command')

    f.textField('Message:', 'Example: !spawn')
    f.textField(`Add A Command Or Hashtag Key. Hashtag Keys Include:\n${arrays.hashtagKeys}\nCommand:`, 'Example: tp @s 0 0 0')
    f.textField('Required Tag:', 'Example: Admin')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatCommandsMainUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet(`darkoak:command:${mcl.timeUuid()}`, {
            message: e[0],
            command: e[1],
            tag: e[2]
        })
    })
}

/**ui for deleting a chat command
 * @param {Player} player 
 */
export function chatCommandsDeleteUI(player) {
    let f = new ActionFormData()
    f.title('Delete A Chat Command')
    f.body('Will Reopen Once You Click A Button')

    const values = mcl.listGetValues('darkoak:command:')
    const raw = mcl.listGet('darkoak:command:')

    if (values.length === 0) {
        player.sendMessage('§cNo Chat Commands Found§r')
        return
    }

    for (const command of values) {
        const c = JSON.parse(command)
        f.button(`${c.message} | ${c.tag}\n${c.command}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatCommandsMainUI(player)
            return
        }
        mcl.wSet(raw[evd.selection])
        chatCommandsDeleteUI(player)
    })
}

/**Picker for editing
 * @param {Player} player 
 */
export function chatCommandsEditPickerUI(player) {
    let f = new ActionFormData()
    f.title('Edit Picker')

    const raw = mcl.listGet('darkoak:command:')
    const values = mcl.listGetValues('darkoak:command:')

    if (values.length === 0) {
        player.sendMessage('§cNo Chat Commands Found§r')
        return
    }

    for (const c of values) {
        const p = JSON.parse(c)
        f.divider()
        f.label(`${p.message} | ${p.tag || 'No Tag'}\n${p.command}`)
        f.button(`Edit?`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatCommandsMainUI(player)
            return
        }
        chatCommandsEditUI(player, raw[evd.selection])
    })
}

/**Edit chat commands
 * @param {Player} player 
 * @param {String} chatCommand 
 */
export function chatCommandsEditUI(player, chatCommand) {
    let f = new ModalFormData()
    const parts = mcl.jsonWGet(chatCommand)

    f.textField('\nEdit Message:', '', parts.message)
    f.textField('Edit Command:', '', parts.command)
    f.textField('Edit Tag:', '', parts.tag)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.jsonWSet(chatCommand, {
            message: e[0],
            command: e[1],
            tag: e[2]
        })
    })

}

/**ui for viewing chat commands
 * @param {Player} player 
 */
export function chatCommandsViewUI(player) {
    let f = new ActionFormData()
    f.title('View Chat Commands')

    const values = mcl.listGetValues('darkoak:command:')
    if (values.length === 0) {
        player.sendMessage('§cNo Chat Commands Found§r')
        return
    }

    for (const c of values) {
        const p = JSON.parse(c)
        f.divider()
        f.label(`${p.message} | ${p.tag || 'No Tag'}\n${p.command}`)
    }

    f.button(`Dismiss`)

    f.show(player)
}

export function censorSettingsMainUI(player) {
    let f = new ActionFormData()
    f.title('Censor Settings')

    f.button('Add New Word', arrays.icons.thinPlus)
    f.button('Remove A Word', arrays.icons.trash)

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
    })
}

export function censorSettingsAddUI(player) {
    let f = new ModalFormData()
    f.title('Add New Censor')

    f.textField('(Be Careful!)\nWord To Ban:', 'Example: skibidi')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(`darkoak:censor:${mcl.timeUuid()}`, evd.formValues[0])
    })
}

export function censorSettingsRemoveUI(player) {
    let f = new ModalFormData()

    const words = mcl.listGetValues('darkoak:censor:')
    const wordRaw = mcl.listGet('darkoak:censor:')

    if (words === undefined || words.length === 0) {
        player.sendMessage('§cNo Words Found§r')
        return
    }
    f.dropdown('\nWord:', words)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(wordRaw[evd.formValues[0]])
    })
}

export function otherChatSettingsUI(player) {
    let f = new ModalFormData()
    f.title('Other Chat Settings')

    const default1 = mcl.jsonWGet('darkoak:chat:other')

    f.toggle('Proximity Chat (Fifteen Block Radius)', default1.proximity || false)
    f.label('Proximity Text Chat, Not Voice Chat')

    f.divider()

    f.toggle('Nametag Chat (Chat Messages Appear In Chat And Under Nametag)', default1.nametag || false)
    f.label('Downside Is That It Displays When You Whisper')

    f.divider()

    f.toggle('Chat Logs', default1.chatLogs || false)
    f.label('Logs The Last 100 Chat Messages')

    f.divider()

    f.show(player).then((evd) => {
        if (evd.canceled) {
            chatSettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet('darkoak:chat:other', {
            proximity: e[0],
            nametag: e[1],
            chatLogs: e[2]
        })
    })
}

// wip ui for locking/unlocking a chest
export function chestLockUI(player, loc) {
    let f = new ModalFormData()

    const p = mcl.listGetValues('darkoak:chestlock:')
    var t = ''

    for (const y of p) {
        const parts = y.split('|')
        if (parts[1] === loc.x.toString() && parts[2] === loc.y.toString() && parts[3] === loc.z.toString()) {
            t = parts[0]
        }
    }

    const u = mcl.playerNameArray()
    f.title(`Chest Lock`)

    f.dropdown('Player who can open the chest:', u)
    f.toggle(`Delete Chest Lock For This Chest?\n(Player: ${t})`)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        if (evd.formValues[1] === true) {
            for (const chest of mcl.listGet('darkoak:chestlock:')) {
                const v = mcl.wGet(chest)
                const p = v.split('|')
                if (p[1] === loc.x.toString() && p[2] === loc.y.toString() && p[3] === loc.z.toString()) {
                    mcl.wSet(chest)
                }
            }
        } else {
            mcl.wSet(`darkoak:chestlock:${mcl.timeUuid()}`, `${u[evd.formValues[0]]}|${loc.x}|${loc.y}|${loc.z}`)
        }
    })
}

/**
 * @param {Player} player 
 */
export function dashboardMainUI(player) {
    let f = new ActionFormData()

    f.button('Print World Data')
    f.button('Delete Data')
    f.button('Reports')
    f.button('Logs')
    f.button('Docs')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            mainUI(player)
            return
        }
        switch (evd.selection) {
            case 0:
                player.sendMessage('§m----------------------§r')
                for (const c of mcl.listGet()) {
                    player.sendMessage(`${c} <> ${mcl.wGet(c)}`)
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
            default:
                player.sendMessage('§cError§r')
                break
        }
    })
}

/**ui for deleting dynamic properties
 * @param {Player} player 
*/
export function dataDeleterUI(player) {
    let f = new ActionFormData()
    f.title('Delete Data')

    for (const c of world.getDynamicPropertyIds()) {
        f.label(`${c}`)
        f.label(`${mcl.wGet(c)}`)
        f.button('Delete?')
        f.divider()
    }


    f.show(player).then((evd) => {
        if (evd.canceled) return

        const t = mcl.listGet('')
        mcl.wSet(t.at(evd.selection))
        dataDeleterUI(player)
    })
}

export function reportsUI(player) {
    let f = new ActionFormData()
    f.title('Reports')

    const raw = mcl.listGet('darkoak:report:')
    const values = mcl.listGetValues('darkoak:report:')
    for (const report of values) {
        const parts = JSON.parse(report)
        f.button(`${parts.player} Reported By: ${parts.submitter}\n${parts.reason}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            dashboardMainUI(player)
            return
        }
        const data = JSON.parse(values[evd.selection])
        let rf = new ActionFormData()
        rf.title(data.player)

        rf.body(`\nPlayer: ${data.player}\nSubmitted By: ${data.submitter}\n\nReason: ${data.reason}\n`)

        rf.button('Take Action')
        rf.button('Dismiss')

        rf.show(player).then((revd) => {
            if (revd.canceled) {
                reportsUI(player)
            }
            if (revd.selection === 0) {
                playerPunishmentsMainUI(player)
            }
        })
    })
}

export function logsUI(player) {
    let f = new ActionFormData()
    f.title('Logs')

    f.button('Message Logs')

    const logs = mcl.jsonWGet('darkoak:log')
    if (logs != undefined) {
        for (const log of logs.logs) {
            f.button(`${log.message}`)
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            dashboardMainUI(player)
            return
        }

        if (evd.selection === 0) {
            messageLogUI(player)
        }
    })
}

export function docsUI(player) {
    let f = new ActionFormData()
    f.title('Documentation')

    f.header('Scriptevents')
    f.label('darkoak:enchant -> Opens Custom Enchant Menu')
    f.divider()
    f.header('Tags')
    f.label('darkoak:admin -> Admin Tag For Almost Everything')
    f.label('darkoak:mod -> Allows The Tagged Player To Open the Punishment UI')
    f.label('darkoak:muted -> Mutes The Tagged Player')
    f.label('rank:yourrankhere -> Rank Tag, Replace \'yourrankhere\' With Anything You Want')
    f.label('namecolor:yourcolorhere -> Name Color Tag, Replace \'yourcolorhere\' With A Color Code')
    f.label('chatcolor:yourcolorhere -> Chat Color Tag, Replace \'yourcolorhere\' With A Color Code')
    f.label('darkoak:flying -> Tracking Tag')
    f.label('darkoak:gliding -> Tracking Tag')
    f.label('darkoak:climbing -> Tracking Tag')
    f.label('darkoak:emoting -> Tracking Tag')
    f.label('darkoak:falling -> Tracking Tag')
    f.label('darkoak:inwater -> Tracking Tag')
    f.label('darkoak:jumping -> Tracking Tag')
    f.label('darkoak:onground -> Tracking Tag')
    f.divider()

    f.button('Dismiss')

    f.show(player)
}


// main ui for making new ui, works by feeding set data to a function that displays it
// cui = custom ui (any ui made by this)
export function UIMakerUI(player) {
    let f = new ActionFormData()
    f.title('UI Maker')

    f.button('Make A Message UI\n§7Two Buttons (With Commands) With Title And Text')
    f.button('Make An Action UI\n§7Ten Different Buttons (With Commands) With Title And Text')
    f.button('Delete A UI\n§7Delete Action Or Message UI\'s')
    f.button('Set The Actionbar\n§7Modify The Actionbar')
    f.button('Set the Sidebar\n§7Modify The Sidebar')

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
                UIDeleterUI(player)
                break
            case 3:
                actionBarUI(player)
                break
            case 4:
                sidebarUI(player)
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
export function actionUIPickerUI(player) {
    let f = new ModalFormData()

    f.slider('Amount Of Buttons', 1, 10, 1)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        actionUIMakerUI(player, evd.formValues[0])
    })
}

/**
 * @param {Player} player 
 * @param {number} amount 
 */
export function actionUIMakerUI(player, amount) {
    let f = new ModalFormData()

    f.textField('Title:', 'Example: Warps')
    f.textField('Body:', 'Example: Click A Button To TP')
    f.textField('Tag To Open:', 'Example: warpmenu')

    for (let index = 1; index <= amount; index++) {
        f.textField(`Button ${index}:`, '')
        f.textField(`Command ${index}:`, '')
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues

        const title = e[0]
        const body = e[1]
        const tag = e[2]

        const buttons = []
        for (let index = 3; index < e.length; index += 2) {
            buttons.push({ title: e[index], command: e[index + 1] })
        }

        const ui = { title, body, tag, buttons }

        mcl.wSet(`darkoak:ui:action:${mcl.timeUuid()}`, JSON.stringify(ui))
    })
}

// ui for deleting cui
export function UIDeleterUI(player) {
    let f = new ActionFormData()
    f.title('Delete A UI')

    const u = mcl.listGet('darkoak:ui:')
    for (const ui of u) {
        const n = ui.split(':')
        if (n[2] === 'message') {
            const v = JSON.parse(mcl.wGet(ui))
            f.button(`Type: ${n[2]}, Title: ${v.title}, Tag: ${v.tag}\nBody: ${v.body}`)
        } else if (n[2] === 'action') {
            const v = JSON.parse(mcl.wGet(ui))
            f.button(`Type: ${n[2]}, Title: ${v.title}, Tag: ${v.tag}\nBody: ${v.body}`)
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        mcl.wSet(u[evd.selection])
    })
}

// ui for making a message cui
export function messageUIMakerUI(player) {
    let f = new ModalFormData()
    f.title('Message UI Maker')

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
        const e = evd.formValues
        const ui = { title: e[0], body: e[1], tag: e[2], button1: e[3], command1: e[5], button2: e[4], command2: e[6] }
        mcl.wSet(`darkoak:ui:message:${mcl.timeUuid()}`, JSON.stringify(ui))
    })
}

export function actionBarUI(player) {
    let f = new ModalFormData()
    f.title('Action Bar')

    f.textField(`${arrays.hashtags}\nAction Bar:`, 'Example: #name#: #location#', mcl.wGet('darkoak:actionbar'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        mcl.wSet('darkoak:actionbar', evd.formValues[0])
    })
}

export function sidebarUI(player) {
    let f = new ModalFormData()

    const def = {
        lines: ['', '', '', '', '', '', '', '', '']
    }

    const d = mcl.jsonWGet('darkoak:sidebar') || def

    f.textField(`\n${arrays.hashtags}\nLine 1:`, '', d.lines[0])
    f.textField('Line 2:', '', d.lines[1])
    f.textField('Line 3:', '', d.lines[2])
    f.textField('Line 4:', '', d.lines[3])
    f.textField('Line 5:', '', d.lines[4])
    f.textField('Line 6:', '', d.lines[5])

    f.show(player).then((evd) => {
        if (evd.canceled) {
            UIMakerUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet('darkoak:sidebar', {
            lines: [e[0], e[1], e[2], e[3], e[4], e[5]]
        })
    })
}

/**
 * @param {Player} player 
 */
export function communitySettingsUI(player) {
    let f = new ActionFormData()
    f.title('Community Settings')

    f.button('Warp / TP Settings')
    f.button('Shop Settings')
    f.button('Report Settings')
    f.button('Show / Hide Options')
    f.button('General Settings')

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
    })
}

/**
 * @param {Player} player 
 */
export function communityGeneralUI(player) {
    let f = new ModalFormData()
    f.title('General Settings')

    const settings = mcl.jsonWGet('darkoak:community:general')

    f.toggle('Give Player Community Item When They Join?', settings.giveOnJoin)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }
        const e = evd.formValues

        mcl.jsonWSet('darkoak:community:general', {
            giveOnJoin: e[0]
        })
    })
}

export function warpSettingsUI(player) {
    let f = new ActionFormData()
    f.title('Warp / TP Settings')

    f.button('RTP Settings')
    f.button('TPA Settings')
    f.button('Create A Warp')
    f.button('Delete A Warp')

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
    })
}

export function rtpUI(player) {
    let f = new ModalFormData()
    f.title('RTP Settings')

    f.toggle('Enabled?', mcl.wGet('darkoak:cws:rtp:enabled'))
    f.textField('Center Co-ord:', 'Example: 0', mcl.wGet('darkoak:cws:rtp:center'))
    f.textField('Max Distance:', 'Example: 10000', mcl.wGet('darkoak:cws:rtp:distance'))

    f.show(player).then((evd) => {
        if (evd.canceled) {
            warpSettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.wSet('darkoak:cws:rtp:enabled', e[0])
        mcl.wSet('darkoak:cws:rtp:center', e[1])
        mcl.wSet('darkoak:cws:rtp:distance', e[2])
    })
}


export function shopSettingsUI(player) {
    let f = new ActionFormData()
    f.title('Shop Settings')

    f.button('Add Item')
    f.button('Remove Item')

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
    })
}

/**
 * @param {Player} player 
 */
export function shopRemoveUI(player) {
    let f = new ActionFormData()
    f.title('Remove Shop Item')

    const raw = mcl.listGet('darkoak:shopitem:')
    const value = mcl.listGetValues('darkoak:shopitem:')
    for (const item of value) {
        /** @type {{ sell: boolean, item: string, amount: number, price: number }} */
        const parts = JSON.parse(item)

        f.button(`Sell:${parts.sell} ${parts.item.replace('minecraft:', '')} x${parts.amount} - $${parts.price}`, `textures/items/${parts.item.replace('minecraft:', '')}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        /** @type {{ sell: boolean, item: string, amount: number, price: number }} */
        const data = JSON.parse(value.at(evd.selection))

        mcl.wSet(raw[evd.selection])
    })
}

/**
 * @param {Player} player 
 */
export function shopAddUI(player) {
    let f = new ModalFormData()
    f.title('Add Shop Item')

    f.toggle('Sell?')
    f.textField('\nItem ID:', 'Example: minecraft:diamond')
    f.slider('Amount Of Items:', 1, 64, 1)
    f.textField('Price:', 'Example: 100')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        const data = { sell: e[0], item: e[1], amount: e[2], price: e[3] }
        mcl.wSet(`darkoak:shopitem:${mcl.timeUuid()}`, JSON.stringify(data))
    })
}

export function showHideOptionsSettingsUI(player) {
    let f = new ModalFormData()
    f.title('Show / Hide Options')

    const en = mcl.jsonWGet('darkoak:communityshowhide')

    f.toggle('Show Pay / Shop?', en.payshop0)
    f.toggle('Show Pay / Shop -> Pay?', en.payshop1)
    f.toggle('Show Pay / Shop -> Shop?', en.payshop2)
    f.toggle('Show Pay / Shop -> Auction House?', en.payshop3)
    f.toggle('Show Warps?', en.warps)
    f.toggle('Show Report?', en.report)
    f.toggle('Show My Profile?', en.myprofile)
    f.toggle('Show Personal Log?', en.personallog)
    f.toggle('Show Credits?\nPlease Don\'t Disable This', en.credits)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet('darkoak:communityshowhide', {
            payshop0: e[0],
            payshop1: e[1],
            payshop2: e[2],
            payshop3: e[3],
            warps: e[4],
            report: e[5],
            myprofile: e[6],
            personallog: e[7],
            credits: e[8],
        })
    })
}

export function reportSettingsUI(player) {
    let f = new ModalFormData()

    const settings = mcl.jsonWGet('darkoak:reportsettings')

    f.title('Report Settings')
    f.textField('Report Rules:', 'Example: No Reporting For Veganism', settings.rules)

    f.toggle('Enabled?', settings.enabled)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communitySettingsUI(player)
            return
        }
        const e = evd.formValues
        mcl.jsonWSet('darkoak:reportsettings', {
            enabled: e[1],
            rules: e[0]
        })
    })
}


export function creditsUI(player) {
    let f = new ActionFormData()
    f.title('Credits')

    f.header('Developers')
    f.label('Darkoakboat2121')
    f.label('Hi, I made this addon!')

    f.divider()

    f.header('Inspiration / Ideas')
    f.label('Noki5160')
    f.label('Inspiration for anticheat')

    f.divider()

    f.header('Miscellaneous')
    f.label('CanineYeti24175')
    f.label('Thank you canine for being cool lol')

    f.divider()

    f.header('Links')
    f.label('Discord: cE8cYYeFFx')

    f.button('Dismiss', 'textures/items/boat_darkoak')
    f.show(player)
}

/////////////////////////////////////////////////////////////Community Item//////////////////////////////////////////////////////////////
/**Main community ui
 * @param {Player} player 
 */
export function communityMain(player) {
    let f = new ActionFormData()
    f.title('Community')
    f.body('Use This Item While Crouching And Looking At A Player To View Their Profile')

    const en = mcl.jsonWGet('darkoak:communityshowhide')

    if (en.payshop0) f.button('Pay / Shop', arrays.icons.minecoin)
    if (en.warps) f.button('Warps')
    if (en.report) f.button('Report')
    if (en.myprofile) f.button('My Profile')
    if (en.personallog) f.button('Personal Log')
    if (en.credits) f.button('Credits')
    if (player.hasTag('darkoak:admin')) {
        f.button('Community Settings\n(Admins Only)', 'textures/ui/icon_multiplayer')
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return

        let selectionIndex = 0
        if (en.payshop0 && evd.selection === selectionIndex++) {
            communityMoneyUI(player)
            return
        }
        if (en.warps && evd.selection === selectionIndex++) {
            warpsUI(player)
            return
        }
        if (en.report && evd.selection === selectionIndex++) {
            reportPlayerUI(player)
            return
        }
        if (en.myprofile && evd.selection === selectionIndex++) {
            myProfile(player)
            return
        }
        if (en.personallog && evd.selection === selectionIndex++) {
            personalLogUI(player)
            return
        }
        if (en.credits && evd.selection === selectionIndex++) {
            creditsUI(player)
            return
        }
        if (player.hasTag('darkoak:admin') && evd.selection === selectionIndex) {
            communitySettingsUI(player)
        } else {
            player.sendMessage('§cError§r')
        }
    })
}


export function communityMoneyUI(player) {
    let f = new ActionFormData()
    f.title('Money')

    const en = mcl.jsonWGet('darkoak:communityshowhide')

    if (en.payshop1) f.button('Pay')
    if (en.payshop2) f.button('Shop')
    if (en.payshop3) f.button('Auction House')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }

        let selectionIndex = 0
        if (en.payshop1 && evd.selection === selectionIndex++) {
            payUI(player)
            return
        }
        if (en.payshop2 && evd.selection === selectionIndex++) {
            shopUI(player)
            return
        }
        if (en.payshop3 && evd.selection === selectionIndex) {
            auctionMain(player)
        } else {
            player.sendMessage('§cError§r')
        }
    })
}


export function warpsUI(player) {
    let f = new ActionFormData()
    f.title('Warps')

    const en = mcl.jsonWGet('darkoak:communityshowhide')

    f.button('RTP')
    f.button('TPA')

    const warps = mcl.listGetValues('darkoak:warp:')
    for (const warp of warps) {
        const data = JSON.parse(warp)
        f.button(`${data.name}`)
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
            const data = JSON.parse(warps[evd.selection - 2])
            let parts = ''
            if (data != undefined) {
                parts = data.coords.split(' ')
            }
            player.runCommand(`tp @s ${parts[0]} ${parts[1]} ${parts[2]}`)
        }

    })
}

/**Pay another player
 * @param {Player} player 
 */
export function payUI(player) {
    let f = new ModalFormData()

    const names = mcl.playerNameArray()

    f.title('Pay')

    f.dropdown('\nPlayer:', names)
    f.textField('Amount:', 'Example: 100')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMoneyUI(player)
            return
        }
        const e = evd.formValues
        const score = world.scoreboard.getObjective(mcl.wGet('darkoak:moneyscore')).getScore(player)
        if (isNaN(e[1])) {
            payUI(player)
            return
        }
        if (score < e[1]) {
            player.sendMessage('§cNot Enough Money§r')
            return
        }

        player.runCommand(`scoreboard players add "${names[e[0]]}" ${mcl.wGet('darkoak:moneyscore')} ${e[1]}`)
        player.runCommand(`scoreboard players remove @s ${mcl.wGet('darkoak:moneyscore')} ${e[1]}`)
    })
}

/**Profile editor
 * @param {Player} player 
 */
export function myProfile(player) {
    let f = new ModalFormData()
    f.title('My Profile')

    if (mcl.wGet(`darkoak:profile:${player.name}`) === undefined) {
        const defaultP = { description: '', pronouns: '', age: '' }
        mcl.wSet(`darkoak:profile:${player.name}`, JSON.stringify(defaultP))
    }
    const parts = JSON.parse(mcl.wGet(`darkoak:profile:${player.name}`))
    // 0: Text / Description, 1: Pronouns, 2: Age

    f.textField('\nDescription:', 'Example: Hi, I\'m Darkoakboat2121.', parts.description)
    f.textField('Pronouns:', 'Example: He / Him', parts.pronouns)
    f.textField('Age:', 'Example: 17', parts.age)

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }
        const e = evd.formValues
        const profile = { description: e[0], pronouns: e[1], age: e[2] }
        mcl.wSet(`darkoak:profile:${player.name}`, JSON.stringify(profile))
    })
}

/**Profile
 * @param {Player} playerToShow
 * @param {Player} playerToView
 */
export function viewProfile(playerToShow, playerToView) {
    let f = new ActionFormData()
    const p = mcl.wGet(`darkoak:profile:${playerToView.name}`)
    if (p === undefined) {
        playerToShow.sendMessage(`§c${playerToView.name}'s Profile Hasn't Been Set-up Yet§r`)
        return
    }
    const parts = JSON.parse(p)
    f.title(`${playerToView.name}'s Profile`)

    f.header(playerToView.name)
    f.label(parts.pronouns)
    f.label(`Age: ${parts.age}`)

    f.divider()

    f.header('Description')
    f.label(parts.description)

    f.button('Dismiss')

    f.show(playerToShow)
}

/**
 * @param {Player} player 
 */
export function reportPlayerUI(player) {
    let f = new ModalFormData()
    f.title('Report A Player')

    const settings = mcl.jsonWGet('darkoak:reportsettings')
    if (!settings.enabled) {
        player.sendMessage('§cReporting Is Disabled§r')
        return
    }

    f.label(`Rules:\n${settings.rules}`)

    const names = mcl.playerNameArray()
    f.dropdown('\nPlayer:', names)
    f.textField('Reason:', 'Example: He Was Hacking')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMain(player)
            return
        }
        const e = evd.formValues
        mcl.wSet(`darkoak:report:${mcl.timeUuid()}`, JSON.stringify({ player: names[e[0]], reason: e[1], submitter: player.name }))
    })
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
    f.title('Shop')

    const raw = mcl.listGet('darkoak:shopitem:')
    const value = mcl.listGetValues('darkoak:shopitem:')
    for (const item of value) {
        /** @type {{ sell: boolean, item: string, amount: number, price: number }} */
        const parts = JSON.parse(item)
        if (parts.sell === true) {
            f.button(`Sell: ${parts.item.replace('minecraft:', '')} x${parts.amount} - $${parts.price}`, `textures/items/${parts.item.replace('minecraft:', '')}`)
        } else {
            f.button(`Buy: ${parts.item.replace('minecraft:', '')} x${parts.amount} - $${parts.price}`, `textures/items/${parts.item.replace('minecraft:', '')}`)
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            communityMoneyUI(player)
            return
        }
        const score = world.scoreboard.getObjective(mcl.wGet('darkoak:moneyscore')).getScore(player)
        /** @type {{ sell: boolean, item: string, amount: number, price: number }} */
        const parts = JSON.parse(value.at(evd.selection))

        if (parts.sell === true) {
            player.runCommand(`testfor @s [hasitem={item=${parts.item} , quantity=${parts.amount}..}]`).then((evd) => {
                if (evd.successCount > 0) {
                    player.runCommand(`clear @s ${parts.item} 0 ${parts.amount}`)
                    player.runCommand(`scoreboard players add @s ${mcl.wGet('darkoak:moneyscore')} ${parts.price}`)
                } else {
                    player.sendMessage('§cNot Enough Items§r')
                    return
                }
            })
        } else {
            if (score < parts.price) {
                player.sendMessage('§cNot Enough Money§r')
                return
            }

            player.runCommand(`scoreboard players remove @s ${mcl.wGet('darkoak:moneyscore')} ${parts.price}`)
            player.runCommand(`give @s ${parts.item} ${parts.amount}`)
        }
    })
}
