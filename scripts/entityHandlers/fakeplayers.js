import { world, system, StartupEvent, CommandPermissionLevel, CustomCommandParamType, GameMode, ItemStack } from "@minecraft/server"
import { mcl } from "../logic"
import { SimulatedPlayer, spawnSimulatedPlayer } from "@minecraft/server-gametest"


const combatDistance = 5
/**
 * @param {SimulatedPlayer} player Simulated player
 */
export function combatManager(player) {
    if (!(player instanceof SimulatedPlayer)) return
    const set = mcl.jsonPGet(player, 'darkoak:sim')
    if (!set) return

    const loc = player.location
    const inven = mcl.getInventory(player)

    let target
    if (set.target === 'closest') {
        target = mcl.closestPlayer(loc, player.dimension.id, player.name)
    } else {
        target = mcl.getPlayer(set.target)
    }

    if (target) {

        const tloc = target.location

        const distance = Math.sqrt(
            Math.pow(tloc.x - loc.x, 2) +
            Math.pow(tloc.y - loc.y, 2) +
            Math.pow(tloc.z - loc.z, 2)
        )

        if (set.type === 'combat') {
            if (distance > (combatDistance / 2) && mcl.tickTimer(20)) {
                player.navigateToLocation(tloc)
                // if ((tloc.y - 2) > loc.y) {
                //     player.jump()
                //     player.useItemOnBlock(new ItemStack('minecraft:oak_planks', 1), {
                //         x: loc.x,
                //         y: loc.y - 1,
                //         z: loc.z
                //     }, 1)
                // }
            }
            if (distance <= combatDistance) {
                player.attackEntity(target)
                player.lookAtEntity(target)
            }
        }

        if (set.type === 'follow' && mcl.tickTimer(40) && distance > 3) player.navigateToEntity(target)
    }

    if (set.minearea) {

    }

    if (set.type === 'jump' && mcl.tickTimer(set.interval)) player.jump()

    if (set.respawn === 'true') player.respawn()
}


/**
 * @param {StartupEvent} evd 
 */
export function fakePlayerCommand(evd) {
    evd.customCommandRegistry.registerEnum('darkoak:fakeplayer', ['chat(string)', 'spawn(none)', 'skin(player_name)', 'disconnect(none)', 'location_move(coords)', 'location_navigate(coords)', 'interact_block(coords)', 'attack(none)', 'look_location(coords)', 'respawn(bool|none)', 'combat(player_name|\'closest\')', 'follow(player_name|\'closest\')', 'jump(none|number)', 'command(string)'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:fakeplayer',
        description: 'Manages Fake Players',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'fake_player_name'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:fakeplayer'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.String,
                name: 'todo'
            }
        ]
    }, (evd, name, action, todo) => {
        const source = evd.initiator || evd.sourceBlock || evd.sourceEntity
        const loc = source.location

        if (action === 'spawn(none)') {
            system.runTimeout(() => {
                try {
                    spawnSimulatedPlayer({
                        dimension: source.dimension,
                        x: loc.x,
                        y: loc.y,
                        z: loc.z
                    }, name, GameMode.Survival)
                } catch {

                }
            })
            return
        }

        /**@type {SimulatedPlayer} */
        const sim = mcl.getPlayer(name)
        if (!sim) {
            mcl.adminMessage(`There Isn\'t A Fake Player With The Name ${name}`)
            return
        }

        const set = mcl.jsonPGet(sim, 'darkoak:sim')
        const split = todo?.split(' ') || ['0', '0', '0']
        const coords = {
            x: parseFloat(split[0]),
            y: parseFloat(split[1]),
            z: parseFloat(split[2]),
        }
        system.runTimeout(() => {
            switch (action) {
                case 'chat(string)':
                    sim.chat(todo)
                    break
                case 'skin(player_name)':
                    const pl = mcl.getPlayer(todo)
                    if (!pl) return
                    sim.setSkin(getPlayerSkin(pl))
                    break
                case 'disconnect(none)':
                    sim.disconnect()
                    break
                case 'location_move(coords)':
                    sim.moveToLocation(coords)
                    break
                case 'location_navigate(coords)':
                    sim.navigateToLocation(coords)
                    break
                case 'interact_block(coords)':
                    sim.interactWithBlock(coords)
                    break
                case 'attack(none)':
                    sim.attack()
                    break
                case 'look_location(coords)':
                    sim.lookAtLocation(coords)
                    break
                case 'respawn(bool|none)':
                    if (!todo) {
                        sim.respawn()
                    } else {
                        mcl.jsonPUpdate(sim, 'darkoak:sim', 'respawn', todo)
                    }
                    break
                case 'combat(player_name|\'closest\')':
                    mcl.jsonPUpdate(sim, 'darkoak:sim', 'type', 'combat')
                    mcl.jsonPUpdate(sim, 'darkoak:sim', 'target', todo)
                    break
                case 'follow(player_name|\'closest\')':
                    mcl.jsonPUpdate(sim, 'darkoak:sim', 'type', 'follow')
                    mcl.jsonPUpdate(sim, 'darkoak:sim', 'target', todo)
                    break
                case 'jump(none|number)':
                    if (!todo) {
                        sim.jump()
                    } else {
                        mcl.jsonPUpdate(sim, 'darkoak:sim', 'type', 'jump')
                        mcl.jsonPUpdate(sim, 'darkoak:sim', 'interval', parseInt(todo))
                    }
                    break
                case 'command(string)':
                    sim.runCommand(todo)
                    break
            }
        })
    })
}