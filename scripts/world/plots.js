import { world, Player, StartupEvent, CommandPermissionLevel, CustomCommandParamType, system, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, ExplosionBeforeEvent, Block, PlayerInteractWithBlockBeforeEvent } from "@minecraft/server"
import { mcl } from "../logic"
import { plotPlayersUI } from "../uis/interfacesTwo"

/**
 * @param {{x: number, y: number, z: number}} start 
 */
export function plotGenerator(start, i, player) {
    /**@type {{enabled: boolean, start: {x: number, y: number, z: number}, direction: number, size: number}} */
    const d = mcl.jsonWGet('darkoak:plotsettings')
    if (!d?.enabled) return

    const plotSize = d?.size ?? 16
    const spacing = 1

    let plotStart = {
        x: parseInt(start.x),
        y: parseInt(start.y),
        z: parseInt(start.z),
    }

    switch (d?.direction) {
        case 0:
            plotStart.x += i * (plotSize + spacing)
            break
        case 1:
            plotStart.x -= i * (plotSize + spacing)
            break
        case 2:
            plotStart.z += i * (plotSize + spacing)
            break
        case 3:
            plotStart.z -= i * (plotSize + spacing)
            break
    }

    const plotEnd = {
        x: plotStart?.x + (d?.size ?? 16) - 1,
        y: plotStart?.y,
        z: plotStart?.z + (d?.size ?? 16) - 1,
    }

    mcl.jsonWSet(`darkoak:plot:${player.name}`, {
        id: i,
        plotStart: plotStart,
        plotEnd: plotEnd,
    })

    //try {
    const dimens = ['overworld', 'nether', 'the_end']
    const dimen = world.getDimension(dimens[d?.dimension || 0])
    system.runTimeout(() => {
        if (world.tickingAreaManager.hasTickingArea('darkoak:plotmaker')) {
            world.tickingAreaManager.removeTickingArea('darkoak:plotmaker')
        }
        world.tickingAreaManager.createTickingArea('darkoak:plotmaker', {
            dimension: dimen,
            from: {
                x: plotStart.x - 1,
                y: plotStart.y - 16,
                z: plotStart.z - 1,
            },
            to: {
                x: plotEnd.x + 1,
                y: plotEnd.y + 16,
                z: plotEnd.z + 1,
            }
        }).then((evd) => {
            dimen.runCommand(`fill ${plotStart.x - 1} ${plotStart.y} ${plotStart.z - 1} ${plotEnd.x + 1} ${plotEnd.y} ${plotEnd.z + 1} border_block`)
            dimen.runCommand(`fill ${plotStart.x} ${plotStart.y} ${plotStart.z} ${plotEnd.x} ${plotEnd.y - 15} ${plotEnd.z} grass`)
            dimen.runCommand(`fill ${plotStart.x} ${plotStart.y - 15} ${plotStart.z} ${plotEnd.x} ${plotEnd.y - 15} ${plotEnd.z} allow`)
            dimen.runCommand(`fill ${plotStart.x} ${plotStart.y + 1} ${plotStart.z} ${plotEnd.x} 319 ${plotEnd.z} air`)

            const wallHeight = 20
            dimen.runCommand(`fill ${plotStart.x - 1} ${plotStart.y + wallHeight} ${plotStart.z - 1} ${plotStart.x - 1} ${plotStart.y + 1} ${plotEnd.z + 1} barrier`)
            dimen.runCommand(`fill ${plotEnd.x + 1} ${plotStart.y + wallHeight} ${plotStart.z - 1} ${plotEnd.x + 1} ${plotStart.y + 1} ${plotEnd.z + 1} barrier`)
            dimen.runCommand(`fill ${plotStart.x} ${plotStart.y + wallHeight} ${plotStart.z - 1} ${plotEnd.x} ${plotStart.y + 1} ${plotStart.z - 1} barrier`)
            dimen.runCommand(`fill ${plotStart.x} ${plotStart.y + wallHeight} ${plotEnd.z + 1} ${plotEnd.x} ${plotStart.y + 1} ${plotEnd.z + 1} barrier`)

            world.tickingAreaManager.removeTickingArea(evd)
        })
    })
    // } catch (e) {
    //     console.error(`Failed to generate plot at ${plotStart.x}, ${plotStart.y}, ${plotStart.z}: ${e}`)
    // }
}

/**
 * @param {Player} player 
 */
export function plotAdder(player) {
    const d = mcl.jsonWGet('darkoak:plotsettings')
    if (!d?.enabled) return 0
    const plot = mcl.jsonWGet(`darkoak:plot:${player.name}`)
    if (plot) return 1
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
    const parsed = d?.start?.split(' ')
    const start = {
        x: parsed[0],
        y: parsed[1],
        z: parsed[2],
    }

    plotGenerator(start, id, player)
    mcl.jsonWSet('darkoak:plotnumber', {
        id: id + 1
    })
    return 2
}

/**
 * @param {StartupEvent} evd 
 */
export function plotCommands(evd) {
    evd.customCommandRegistry.registerEnum('darkoak:plotoptions', ['redeem', 'players', 'travel', 'freevisits'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:plot',
        description: 'Plot System',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:plotoptions'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'plot_num_or_name'
            }
        ]
    }, (evd, option, travel) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        if (!player || player.typeId != 'minecraft:player') return
        const d = mcl.jsonWGet('darkoak:plotsettings')
        const plot = mcl.jsonWGet(`darkoak:plot:${player.name}`)
        switch (option) {
            case 'redeem':
                const r = plotAdder(player)
                switch (r) {
                    case 0:
                        player.sendMessage(`§cPlots Aren\'t Enabled`)
                        break
                    case 1:
                        player.sendMessage(`§cYou Already Have A Plot!`)
                        break
                    case 2:
                        player.sendMessage(`§aYou\'ve Redeemed A Plot!`)
                        break
                }
                break
            case 'players':
                if (d?.enabled) {
                    if (!plot) {
                        player.sendMessage('§cRedeem A Plot First!')
                        return
                    }
                    system.runTimeout(() => {
                        plotPlayersUI(player)
                    })
                }
                break
            case 'travel':
                if (!travel) {
                    if (!plot) {
                        player.sendMessage('§cRedeem A Plot First!')
                        return
                    }
                    system.runTimeout(() => {
                        player.teleport({
                            x: plot.plotStart.x + Math.floor((plot.plotEnd.x - plot.plotStart.x) / 2),
                            y: plot.plotStart.y + 1,
                            z: plot.plotStart.z + Math.floor((plot.plotEnd.z - plot.plotStart.z) / 2),
                        })
                    })
                } else {
                    const visit = mcl.jsonWGet(`darkoak:plot:${travel}`)
                    /**@type {{name: string, allowModify: boolean}[]} */
                    const players = visit?.players
                    if (visit?.settings?.freeVisit) {
                        tpToPlot()
                        return
                    }
                    if (players && players.length > 0) {
                        for (let index = 0; index < players.length; index++) {
                            const p = players[index]
                            if (typeof p === 'string') {
                                if (p === player.name) {
                                    tpToPlot()
                                    return
                                }
                            } else if (typeof p === 'object') {
                                if (p.name === player.name) {
                                    tpToPlot()
                                    return
                                }
                            }
                        }
                    }
                    // if (visit?.players?.includes(player?.name) || visit?.settings?.freeVisit) {
                        function tpToPlot() {
                            system.runTimeout(() => {
                                player.teleport({
                                    x: visit.plotStart.x + Math.floor((visit.plotEnd.x - visit.plotStart.x) / 2),
                                    y: visit.plotStart.y + 1,
                                    z: visit.plotStart.z + Math.floor((visit.plotEnd.z - visit.plotStart.z) / 2),
                                })
                            })
                        }
                    //}
                }

                break
            case 'freevisits': {
                let canVisit = []

                const plots = mcl.jsonListGetBoth(`darkoak:plot:`)
                for (let index = 0; index < plots.length; index++) {
                    const pl = plots[index].value
                    if (pl?.settings?.freeVisit) canVisit.push(plots[index]?.id?.split(':')[2])
                }
                if (canVisit.length === 0) {
                    player.sendMessage(`§cThere Are No Plots With Free-Visit Enabled§r`)
                } else {
                    player.sendMessage(`§aYou Can Visit:\n${canVisit.join(' | ')}§r`)
                }

                break
            }
        }
    })
}

/**
 * @param {PlayerBreakBlockBeforeEvent | PlayerPlaceBlockBeforeEvent | ExplosionBeforeEvent | PlayerInteractWithBlockBeforeEvent} evd 
 * @returns 
 */
export function plotBreakPlaceProtection(evd) {
    if (evd.cancel) return
    if (evd.player && mcl.isCreating(evd.player)) return

    const d = mcl.jsonWGet('darkoak:plotsettings')
    const dimens = ['overworld', 'nether', 'the_end']
    if (((evd?.dimension?.id ?? evd?.block?.dimension?.id) != `minecraft:${dimens[d?.dimension]}`) || !d?.enabled) return

    let plots = mcl.jsonListGetBoth('darkoak:plot:')
    for (let index = 0; index < plots.length; index++) {

        /**@type {{i: number, plotStart: {x: number, y: number, z: number}, plotEnd: {x: number, y: number, z: number}, players: string[]}} */
        const plot = plots[index].value
        if (!plot) continue

        const minX = Math.min(plot.plotStart.x, plot.plotEnd.x)
        const maxX = Math.max(plot.plotStart.x, plot.plotEnd.x)
        const minY = plot.plotStart.y - 15
        const maxY = 320
        const minZ = Math.min(plot.plotStart.z, plot.plotEnd.z)
        const maxZ = Math.max(plot.plotStart.z, plot.plotEnd.z)

        if (evd instanceof ExplosionBeforeEvent) {
            const blocks = evd.getImpactedBlocks()
            for (let index = 0; index < blocks.length; index++) {
                const block = blocks[index]

                if (
                    block.x >= minX && block.x <= maxX &&
                    block.y >= minY && block.y <= maxY &&
                    block.z >= minZ && block.z <= maxZ
                ) {
                    evd.cancel = true
                    return
                }
            }
            return
        }

        const block = evd?.block
        if (
            block.x >= minX && block.x <= maxX &&
            block.y >= minY && block.y <= maxY &&
            block.z >= minZ && block.z <= maxZ
        ) {
            if (plots[index]?.id?.split(':')[2] === evd?.player?.name) return

            /**@type {{name: string, allowModify: boolean}[]} */
            const players = plot?.players
            if (players && players.length > 0) {
                for (let index = 0; index < players.length; index++) {
                    const p = players[index]
                    if (typeof p === 'string') {
                        if (p === evd?.player?.name) return
                    } else if (typeof p === 'object') {
                        if (p.name === evd?.player?.name && p.allowModify) return
                    }
                }
            }
            evd.cancel = true
            return
        }
    }
}