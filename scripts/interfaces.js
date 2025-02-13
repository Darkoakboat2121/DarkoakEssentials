import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { wGet, wSet, uuid, listGet, listGetValues, playerNameArray, timeUuid, randomString, randomNumber, playerEffectsArray, playerTagsArray, isHost } from "./logic"

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
    f.button('Debug')

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
                player.sendMessage('§m----------------------§r')
                for (const c of world.getDynamicPropertyIds()) {
                    player.sendMessage(`${c} <> ${wGet(c)}`)
                }
                dataDeleterUI(player)
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

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                worldInteractionSettings(player)
                break
        }
    })
}

export function worldInteractionSettings(player) {
    let f = new ModalFormData()
    f.title('Interaction Settings')
    
    f.slider('Players Can Break Blocks?\n1 = Yes\n2 = Can\'t Break Item Frames\n3 = Can\'t Break Any Blocks\nValue', 1, 3, 1, wGet('darkoak:cws:breakblocks')) // 0
    f.slider('Players Can Interact With Blocks?\n1 = Yes\n2 = Can\'t Interact With Item Frames\n3 = Can\'t Interact With Ender Chests\n4 = Can\'t Interact With Ender Chests Or Item Frames\n5 = Can\'t Interact With Any\nValue', 1, 5, 1, wGet('darkoak:cws:interactwithblocks')) // 1
    f.slider('Players Can Interact With Entities?\n1 = Yes\n2 = ', 1, 3, 1)
    

    f.show(player).then((evd) => {
        const e = evd.formValues
        wSet('darkoak:cws:breakblocks', e[0])
        wSet('darkoak:cws:interactwithblocks', e[1])
    })
}

// main ui for player settings: player data lookup, punishments
export function playerSettingsUI(player) {
    let f = new ActionFormData()
    f.title('Player Settings')
    f.body('Manage Player Settings')

    f.button('Player Data')
    f.button('Punishments')

    f.show(player).then((evd) => {
        if (evd.canceled) return
        switch(evd.selection) {
            case 0:
                playerDataMainUI(player)
                break
            case 1:
                playerPunishmentsMainUI(player)
                break
        }
    })
}

// player picker for player data lookup
export function playerDataMainUI(player) {
    let f = new ModalFormData()
    f.title('Player Data')
    const u = playerNameArray()

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
ID: ${player.id}, Is Host: ${isHost(player)}
Gamemode: ${player.getGameMode()}
Location: ${parseInt(player.location.x)} ${parseInt(player.location.y)} ${parseInt(player.location.z)}, Dimension: ${player.dimension.id}
Effects: ${playerEffectsArray(player)}
Tags: ${playerTagsArray(player)}
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

    const names = playerNameArray()
    f.dropdown('\nPlayer:', names)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        wSet(`darkoak:bans:${timeUuid()}`, names[evd.formValues[0]])
        player.runCommandAsync(`kill ${names[evd.formValues[0]]}`)
    })
}

export function unbanPlayerUI(player) {
    let f = new ActionFormData()
    f.title('Unban A Player')

    const ids = listGet('darkoak:bans:')
    const values = listGetValues('darkoak:bans:')

    if (ids === undefined || ids.length === 0) {
        player.sendMessage('No Bans Found')
        return
    }
    for (const p of values) {
        f.button(`${p.toString()}`)
    }
    
    f.show(player).then((evd) => {
        if (evd.canceled) return
        wSet(ids[evd.selection], )
    })

}

export function mutePlayerUI(player) {
    let f = new ModalFormData()
    f.title('Mute A Player')

    const names = playerNameArray()
    f.dropdown('\nPlayer:', names)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        player.runCommandAsync(`tag ${names[evd.formValues[0]]} add darkoak:muted`)
    })
}

export function unmutePlayerUI(player) {
    let f = new ModalFormData()
    f.title('Unmute A Player')

    const names = playerNameArray('darkoak:muted')
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

// main ui for chat settings
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

    form.textField('Rank Start:', 'Example: [', wGet('darkoak:cr:start'))
    form.textField('Rank Middle:', 'Example: ][', wGet('darkoak:cr:middle'))
    form.textField('Rank End:', 'Example: ]', wGet('darkoak:cr:end'))
    form.textField('Rank Bridge:', 'Example: ->', wGet('darkoak:cr:bridge'))
    form.textField('Default Rank:', 'Example: Member', wGet('darkoak:cr:defaultrank'))

    form.show(player).then((evd) => {
        if (evd.canceled) return
        
        wSet('darkoak:cr:start', evd.formValues[0])
        wSet('darkoak:cr:middle', evd.formValues[1])
        wSet('darkoak:cr:end', evd.formValues[2])
        wSet('darkoak:cr:bridge', evd.formValues[3])
        wSet('darkoak:cr:defaultrank', evd.formValues[4])
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
        wSet(`darkoak:command:${timeUuid()}`, `${evd.formValues[0]}|${evd.formValues[1]}|${evd.formValues[2]}`)
    })
}

// ui for deleting a chat command
export function chatCommandsDeleteUI(player) {
    let f = new ModalFormData()
    f.title('Delete A Chat Command')
    
    f.dropdown('Commands:', listGetValues('darkoak:command:'))

    f.show(player).then((evd) => {
        if (evd.canceled) return
        wSet(listGet('darkoak:command:')[evd.formValues[0]], )
    })
}

// ui for viewing chat commands
export function chatCommandsViewUI(player) {
    let f = new ActionFormData()
    f.title('View Chat Commands')

    for (const c of listGet('darkoak:command:')) {
        const parts = wGet(c).split('|')
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
        wSet(`darkoak:censor:${timeUuid()}`, evd.formValues[0])
    })
}

export function censorSettingsRemoveUI(player) {
    let f = new ModalFormData()

    const words = listGetValues('darkoak:censor:')
    const wordRaw = listGet('darkoak:censor:')

    if (words === undefined || words.length === 0) {
        player.sendMessage('No Words Found')
        return
    }
    f.dropdown('\nWord:', words)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        wSet(wordRaw[evd.formValues[0]])
    })
}

// wip ui for locking/unlocking a chest
export function chestLockUI(player, loc) {
    let f = new ModalFormData()

    const p = listGetValues('darkoak:chestlock:')
    var t = ''

    for (const y of p) {
        const parts = y.split('|')
        if (parts[1] === loc.x.toString() && parts[2] === loc.y.toString() && parts[3] === loc.z.toString()) {
            t = parts[0]
        }
    }
    f.title(`Chest Lock`)

    f.dropdown('Player who can open the chest:', playerNameArray())
    f.toggle(`Delete Chest Lock For This Chest?\n(Player: ${t})`)

    f.show(player).then((evd) => {
        if (evd.canceled) return
        const u = playerNameArray()
        if (evd.formValues[1] === true) {
            
        } else {
            wSet(`darkoak:chestlock:${timeUuid()}`, `${u[evd.formValues[0]]}|${loc.x}|${loc.y}|${loc.z}`)
        }
    })
}

// ui for deleting dynamic properties
export function dataDeleterUI(player) {
    let f = new ActionFormData()
    f.title('Delete Data')

    for (const c of world.getDynamicPropertyIds()) {
        f.button(`Delete: ${wGet(c)}\n${c}`)
    }
    

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const t = listGet('')
        wSet(t.at(evd.selection), )
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
        }
    })
}

// ui for deleting cui
export function UIDeleterUI(player) {
    let f = new ActionFormData()
    f.title('Delete A UI')

    const u = listGet('darkoak:ui:')
    for (const ui of u) {
        const v = wGet(ui).split('|')
        const n = ui.split(':')
        f.button(`Type: ${n[2]}, Title: ${v[0]}\nTag: ${v[4]}, Body: ${v[1]}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return
        wSet(u[evd.selection], )
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
        wSet(`darkoak:ui:message:${timeUuid()}`, `${evd.formValues[0]}|${evd.formValues[1]}|${evd.formValues[2]}|${evd.formValues[3]}|${evd.formValues[4]}|${evd.formValues[5]}|${evd.formValues[6]}`)
    })
}

