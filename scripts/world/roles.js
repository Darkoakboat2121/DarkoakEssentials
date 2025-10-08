import { world, system, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, StartupEvent, CommandPermissionLevel, CustomCommandParamType, Player } from "@minecraft/server"
import { mcl } from "../logic"

/**
 * @param {PlayerBreakBlockBeforeEvent} evd 
 */
export function roleBreak(evd) {
    if (!mcl.roleCheck(evd.player)?.break) evd.cancel = true
}

/**
 * @param {PlayerPlaceBlockBeforeEvent} evd 
 */
export function roleBuild(evd) {
    if (!mcl.roleCheck(evd.player)?.build) evd.cancel = true
}

/**tp, kill, setblock
 * @param {StartupEvent} evd 
 */
export function roleCommand(evd) {
    // evd.customCommandRegistry.registerEnum('darkoak:rolecommands', ['tp', ''])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:c',
        description: 'Allows Roles To Use Commands Without OP',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                name: 'command',
                type: CustomCommandParamType.String
            }
        ]
    }, (evd, command) => {
        const parts = command.split(' ')
        /**@type {Player | undefined} */
        const player = evd?.sourceEntity
        if (!player) return
        const perms = mcl.roleCheck(player)
        system.runTimeout(() => {
            if (parts[0] === 'tp' && perms?.tpcommand) {
                player.runCommand(command)
                return
            }
            if (parts[0] === 'kill' && perms?.killcommand) {
                player.runCommand(command)
                return
            }
        })
    })
}