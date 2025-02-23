import { world, system, Player, Entity } from "@minecraft/server"
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

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