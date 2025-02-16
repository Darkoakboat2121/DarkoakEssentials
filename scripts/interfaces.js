import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import * as arrays from "./arrays"
import { mcl } from "./logic"

// This file holds all the functions containing UI

// Main UI: Opened by using the main item with the tag darkoak:admin
export function mainUI(player) {
    let f = new ActionFormData()
    f.title('Main')
    f.body('Manage Various Settings')

    f.button('World Settings')
    f.button('Player Settings')
    f.button('Chat Settings')
    f.button('UI Settings')
    f.button('Dashboard')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch(evd.selection) {
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
        }
    })
}

// Main ui for world settings
export function worldSettingsUI(player) {
    let f = new ActionFormData()
    f.title('World Settings')
    f.body('Manage World Settings')

    f.button('Interaction Settings')
    f.button('Bind Custom Item')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                worldInteractionSettings(player)
                break
            case 1:
                itemBindsUI(player)
                break
        }
    })
}

export function worldInteractionSettings(player) {
    let f = new ModalFormData()
    f.title('Interaction Settings')
    
    f.slider('Players Can Break Blocks?\n1 = Yes\n2 = Can\'t Break Item Frames\n3 = Can\'t Break Any Blocks\nValue', 1, 3, 1, mcl.wGet('darkoak:cws:breakblocks')) // 0
    f.slider('Players Can Interact With Blocks?\n1 = Yes\n2 = Can\'t Interact With Item Frames\n3 = Can\'t Interact With Ender Chests\n4 = Can\'t Interact With Ender Chests Or Item Frames\n5 = Can\'t Interact With Any\nValue', 1, 5, 1, mcl.wGet('darkoak:cws:interactwithblocks')) // 1
    f.slider('Players Can Interact With Entities?\n1 = Yes\n2 = ', 1, 3, 1)
    

    f.show(player).then((evd) => {
        const e = evd.formValues
        mcl.wSet('darkoak:cws:breakblocks', e[0])
        mcl.wSet('darkoak:cws:interactwithblocks', e[1])
    })
}

export function itemBindsUI(player) {
    let f = new ModalFormData()
    f.title('Bind Custom Item')

    f.slider('Item Number', 1, arrays.dummySize, 1)
    f.textField('Command:', 'Example: tp @s 0 1 0')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(`darkoak:bind:${evd.formValues[0]}`, evd.formValues[1])
    })
}

// main ui for player settings: player data lookup, punishments
export function playerSettingsUI(player) {
    let f = new ActionFormData()
    f.title('Player Settings')
    f.body('Manage Player Settings')

    f.button('Player Data')
    f.button('Punishments')
    f.button('Player Tracking')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                playerDataMainUI(player)
                break
            case 1:
                playerPunishmentsMainUI(player)
                break
            case 2:
                playerTrackingUI(player)
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
        if (evd.canceled) return
        playerDataViewUI(player, u[evd.formValues[0]])
    })
}

// player data viewer
export function playerDataViewUI(playerToShow, playerToView) {
    let f = new ActionFormData()
    const player = world.getPlayers({name: playerToView})[0]
    f.title(`${player.name}`)

    f.body(`Name: ${player.name}, Shows as: ${player.nameTag}
ID: ${player.id}, Is Host: ${mcl.isHost(player)}
Gamemode: ${player.getGameMode()}
Location: ${parseInt(player.location.x)} ${parseInt(player.location.y)} ${parseInt(player.location.z)}, Dimension: ${player.dimension.id}
Effects: ${mcl.playerEffectsArray(player)}
Tags: ${mcl.playerTagsArray(player)}
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
        if (evd.canceled) return
        switch(evd.selection) {
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
        }
    })
}

export function banPlayerUI(player) {
    let f = new ModalFormData()
    f.title('Ban Player')

    const names = mcl.playerNameArray()
    f.dropdown('\nPlayer:', names)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(`darkoak:bans:${mcl.timeUuid()}`, names[evd.formValues[0]])
        player.runCommandAsync(`kill ${names[evd.formValues[0]]}`)
    })
}

export function unbanPlayerUI(player) {
    let f = new ActionFormData()
    f.title('Unban A Player')

    const ids = mcl.listGet('darkoak:bans:')
    const values = mcl.listGetValues('darkoak:bans:')

    if (ids === undefined || ids.length === 0) {
        player.sendMesage('No Bans Found')
        return
    }
    for (const p of values) {
        f.button(`${p.toString()}`)
    }
    
    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(ids[evd.selection], )
    })

}

export function mutePlayerUI(player) {
    let f = new ModalFormData()
    f.title('Mute A Player')

    const names = mcl.playerNameArray()
    f.dropdown('\nPlayer:', names)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        player.runCommandAsync(`tag ${names[evd.formValues[0]]} add darkoak:muted`)
    })
}

export function unmutePlayerUI(player) {
    let f = new ModalFormData()
    f.title('Unmute A Player')

    const names = mcl.playerNameArray('darkoak:muted')
    if (names === undefined || names.length === 0) {
        player.sendMessage('No Mutes Found')
        return
    }
    f.dropdown('\nPlayer:', names)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        player.runCommandAsync(`tag ${names[evd.formValues[0]]} remove darkoak:muted`)
    })
}

/**
 * @param {Player} player 
 */
export function playerTrackingUI(player) {
    let f = new ModalFormData()
    f.title('Player Tracking')
    
    f.toggle('Flying', mcl.wGet('darkoak:track:flying'))
    f.toggle('Gliding', mcl.wGet('darkoak:track:gliding'))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const e = evd.formValues
        mcl.wSet('darkoak:track:flying', e[0])
        mcl.wSet('darkoak:track:gliding', e[1])
    })
}

/**main ui for chat settings
 * @param {Player} player 
*/
export function chatSettingsUI(player) {
    let f = new ActionFormData()
    f.title('Chat Settings')
    f.body('Manage Chat Settings')

    f.button('Manage Ranks')
    f.button('Chat Commands')
    f.button('Censor Settings')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch(evd.selection) {
            case 0:
                rankSettingsUI(player)
                break
            case 1:
                chatCommandsMainUI(player)
                break
            case 2:
                censorSettingsMainUI(player)
                break
        }
    })
}

// rank settings ui, used to manage rank start, middle, end, bridge, and default rank
export function rankSettingsUI(player) {
    let form = new ModalFormData()
    form.title('Rank settings')

    form.textField('Rank Start:', 'Example: [', mcl.wGet('darkoak:cr:start'))
    form.textField('Rank Middle:', 'Example: ][', mcl.wGet('darkoak:cr:middle'))
    form.textField('Rank End:', 'Example: ]', mcl.wGet('darkoak:cr:end'))
    form.textField('Rank Bridge:', 'Example: ->', mcl.wGet('darkoak:cr:bridge'))
    form.textField('Default Rank:', 'Example: Member', mcl.wGet('darkoak:cr:defaultrank'))

    form.show(player).then((evd) => {
        if (evd.canceled) return
        
        mcl.wSet('darkoak:cr:start', evd.formValues[0])
        mcl.wSet('darkoak:cr:middle', evd.formValues[1])
        mcl.wSet('darkoak:cr:end', evd.formValues[2])
        mcl.wSet('darkoak:cr:bridge', evd.formValues[3])
        mcl.wSet('darkoak:cr:defaultrank', evd.formValues[4])
    })
}

// main ui for chat commands
export function chatCommandsMainUI(player) {
    let f = new ActionFormData()
    f.title('Chat Commands')
    f.body('Manage Chat Commands')

    f.button('Add New')
    f.button('Delete One')
    f.button('View Chat Commands')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                chatCommandsAddUI(player)
                break
            case 1:
                chatCommandsDeleteUI(player)
                break
            case 2:
                chatCommandsViewUI(player)
                break
        }
    })
}

// ui for adding a chat command, chat commands must include the message and command, tag is optional
export function chatCommandsAddUI(player) {
    let f = new ModalFormData()
    f.title('Add New Chat Command')

    f.textField('Message:', 'Example: !spawn')
    f.textField('Add A Command Or Hashtag Key. Hashtag Keys Include:\n#commands - Lists All Commands\n#noob - (Joke) Says Stuff in Chat\n#datadeleter - Opens UI For Deleting Data\n#cc - Clear Chat\n#random - Says A Random Number In Chat (1 To 100)\nCommand:', 'Example: tp @s 0 0 0')
    f.textField('Required Tag:', 'Example: Admin')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(`darkoak:command:${mcl.timeUuid()}`, `${evd.formValues[0]}|${evd.formValues[1]}|${evd.formValues[2]}`)
    })
}

// ui for deleting a chat command
export function chatCommandsDeleteUI(player) {
    let f = new ModalFormData()
    f.title('Delete A Chat Command')
    
    f.dropdown('Commands:', mcl.listGetValues('darkoak:command:'))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(mcl.listGet('darkoak:command:')[evd.formValues[0]], )
    })
}

// ui for viewing chat commands
export function chatCommandsViewUI(player) {
    let f = new ActionFormData()
    f.title('View Chat Commands')

    for (const c of mcl.listGet('darkoak:command:')) {
        const parts = mcl.wGet(c).split('|')
        f.button(`${parts[0]} | ${parts[2]}\n${parts[1]}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
    })
}

export function censorSettingsMainUI(player) {
    let f = new ActionFormData()
    f.title('Censor Settings')

    f.button('Add New Word')
    f.button('Remove A Word')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                censorSettingsAddUI(player)
                break
            case 1:
                censorSettingsRemoveUI(player)
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
        player.sendMessage('No Words Found')
        return
    }
    f.dropdown('\nWord:', words)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(wordRaw[evd.formValues[0]])
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
    f.title(`Chest Lock`)

    f.dropdown('Player who can open the chest:', mcl.playerNameArray())
    f.toggle(`Delete Chest Lock For This Chest?\n(Player: ${t})`)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const u = mcl.playerNameArray()
        if (evd.formValues[1] === true) {
            
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

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                player.sendMessage('§m----------------------§r')
                for (const c of mcl.listGet()) {
                    player.sendMessage(`${c} <> ${mcl.wGet(c)}`)
                }
                player.sendMessage(world.getDynamicPropertyTotalByteCount().toString())
                break
            case 1:
                dataDeleterUI(player)
                break
            case 2:
                reportsUI(player)
                break
            case 3:
                logsUI(player)
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
        f.button(`Delete: ${mcl.wGet(c)}\n${c}`)
    }
    

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const t = mcl.listGet('')
        mcl.wSet(t.at(evd.selection))
        dataDeleterUI(player)
    })
}

export function reportsUI(player) {

}

export function logsUI(player) {
    let f = new ActionFormData()

    const logs = mcl.listGetValues('darkoak:log:').sort((a, b) => {
        const [aKey, aValue] = a.split(': ').map(Number)
        const [bKey, bValue] = b.split(': ').map(Number)
        return aKey - bKey || aValue - bValue
    })
    for (const log of logs) {
        const parts = log.split('|')
        f.button(`${parts[0]}\n${parts[1]}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
    })
}

// main ui for making new ui, works by feeding set data to a function that displays it
// cui = custom ui (any ui made by this)
export function UIMakerUI(player) {
    let f = new ActionFormData()
    f.title('UI Maker')

    f.button('Make A Message UI')
    f.button('Make An Action UI')
    f.button('Make A Modal UI')
    f.button('Delete A UI')
    f.button('Set The Actionbar')

    f.show(player).then((evd) => {
        if (evd.canceled) return

        switch(evd.selection) {
            case 0:
                messageUIMakerUI(player)
                break
            case 1:

            case 2:

            case 3:
                UIDeleterUI(player)
                break
            case 4:
                actionBarUI(player)
                break
        }
    })
}

// ui for deleting cui
export function UIDeleterUI(player) {
    let f = new ActionFormData()
    f.title('Delete A UI')

    const u = mcl.listGet('darkoak:ui:')
    for (const ui of u) {
        const v = mcl.wGet(ui).split('|')
        const n = ui.split(':')
        f.button(`Type: ${n[2]}, Title: ${v[0]}\nTag: ${v[4]}, Body: ${v[1]}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(u[evd.selection])
    })
}

// ui for making a message cui
export function messageUIMakerUI(player) {
    let f = new ModalFormData()
    f.title('Message UI Maker')

    f.textField('UI Title:', 'Example: Welcome!')
    f.textField('UI Body Text:', 'Example: Hello there!')
    f.textField('UI Button 1:', 'Example: Hi!')
    f.textField('UI Button 2:', 'Example: Hello!')
    f.textField('Tag To Open:', 'Example: welcomemessage')
    f.textField('Button1 Command:', 'Example: tp @s 0 0 0')
    f.textField('Button2 Command:', 'Example: tp @s 6 2 7')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet(`darkoak:ui:message:${mcl.timeUuid()}`, `${evd.formValues[0]}|${evd.formValues[1]}|${evd.formValues[2]}|${evd.formValues[3]}|${evd.formValues[4]}|${evd.formValues[5]}|${evd.formValues[6]}`)
    })
}

export function actionBarUI(player) {
    let f = new ModalFormData()
    f.title('Action Bar')

    f.textField('\nKeys:\n\\n - New Line\n%%scorename%% - Player Score (Replace scorename With An Actual Score Name)\n#name# - Player Name\n#health# - Player Health\n#location# - Player Co-ordinates\n#slot# - Slot Index\n#velocity# - Players Current Velocity\nAction Bar:', 'Example: #name#\n#location#', mcl.wGet('darkoak:actionbar'))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        mcl.wSet('darkoak:actionbar', evd.formValues[0])
    })
}