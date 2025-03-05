import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet and it manages data size / limits

// Defaults for ranks


export function logcheck() {
    const log = mcl.wGet('darkoak:log')
    let data = JSON.parse(log)

    if (data.logs.length > 10) {
        data.logs.shift()
    }

    mcl.wSet('darkoak:log', JSON.stringify(data))
}

system.runInterval(() => {
    const byte = world.getDynamicPropertyTotalByteCount()
    if (byte > 20000) {
        mcl.adminMessage(`Possibly Dangerous Property Count: ${byte.toString()}, Please Print The World Data`)
    }
}, 6000)



system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (!mcl.pGet(player, 'darkoak:ac:blocksbroken')) {
            mcl.pSet(player, 'darkoak:ac:blocksbroken', 0)
        }

        if (!mcl.pGet(player, 'darkoak:ac:blocksplaced')) {
            mcl.pSet(player, 'darkoak:ac:blocksplaced', 0)
        }

        if (!mcl.pGet(player, 'darkoak:antispam')) {
            mcl.pSet(player, 'darkoak:antispam', JSON.stringify({
                message: 'placeholder'
            }))
        }
    }

    if (mcl.wGet('darkoak:cr:defaultrank') === undefined) {
        mcl.wSet('darkoak:cr:defaultrank', 'New')
    }

    if (mcl.wGet('darkoak:cr:bridge') === undefined) {
        mcl.wSet('darkoak:cr:bridge', '->')
    }

    if (mcl.wGet('darkoak:cr:start') === undefined) {
        mcl.wSet('darkoak:cr:start', '[')
    }

    if (mcl.wGet('darkoak:cr:middle') === undefined) {
        mcl.wSet('darkoak:cr:middle', '][')
    }

    if (mcl.wGet('darkoak:cr:end') === undefined) {
        mcl.wSet('darkoak:cr:end', ']')
    }

    if (!mcl.wGet('darkoak:anticheat')) {
        mcl.jsonWSet('darkoak:anticheat', {
            prebans: false
        })
    }

    if (!mcl.wGet('darkoak:tracking')) {
        mcl.jsonWSet('darkoak:tracking', {
            flying: false
        })
    }

    if (!mcl.wGet('darkoak:welcome')) {
        mcl.wSet('darkoak:welcome', 'Welcome! Use The Main UI Item To Start.')
    }
})