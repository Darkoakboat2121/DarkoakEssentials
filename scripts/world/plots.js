import { world, Player } from "@minecraft/server"
import { mcl } from "../logic"

/**
 * @param {{x: number, y: number, z: number}} start 
 */
export function plotGenerator(start) {
    /**@type {{enabled: boolean, start: {x: number, y: number, z: number}, direction: number, size: number}} */
    const d = mcl.jsonWGet('darkoak:plotsettings')
    if (!d?.enabled) return

    let plotStart = { ...start }

    switch (d?.direction) {
        case 0:
            plotStart.z -= i * d?.size
            break
        case 1:
            plotStart.x += i * d?.size
            break
        case 2:
            plotStart.z += i * d?.size
            break
        case 3:
            plotStart.x -= i * d?.size
            break
    }

    const plotEnd = {
        x: plotStart.x + d?.size - 1,
        y: plotStart.y,
        z: plotStart.z + d?.size - 1,
    }

    try {
        dimension.runCommand(`fill ${plotStart.x} ${plotStart.y} ${plotStart.z} ${plotEnd.x} ${plotEnd.y} ${plotEnd.z} grass`)
    } catch (e) {
        console.log(`Failed to generate plot at ${plotStart.x}, ${plotStart.y}, ${plotStart.z}: ${e}`)
    }
}

/**
 * @param {Player} player 
 */
export function plotAdder(player) {
    const d = mcl.jsonWGet('darkoak:plotsettings')
    const plot = mcl.jsonWGet(`darkoak:plot:${player.name}`)
    if (plot) return false
    let id = mcl.jsonWGet('darkoak:plotnumber')?.id
    if (!id) {
        id = 1
        mcl.jsonWSet('darkoak:plotnumber', {
            id: 1
        })
    }
    mcl.jsonWSet(`darkoak:plot:${player.name}`, {
        id: id
    })
    const start = {
        x: 1
    }
    plotGenerator()
    mcl.jsonWSet('darkoak:plotnumber', {
        id: id + 1
    })
}