import { world, system, Player, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, ExplosionBeforeEvent, PlayerInteractWithBlockBeforeEvent, StartupEvent, ItemUseAfterEvent, CommandPermissionLevel, CustomCommandParamType, StructureRotation, StructureMirrorAxis } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

/**
 * @param {StartupEvent} evd 
 */
export function WEcommands(evd) {

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:weclear',
        description: 'Clears Selection (Does Not Remove Blocks)',
        permissionLevel: CommandPermissionLevel.GameDirectors
    }, (evd) => {
        if (evd?.sourceEntity) {
            let particeClear = mcl.jsonPGet(evd?.sourceEntity, 'darkoak:worldedit')?.id
            if (mcl.pRemove(evd?.sourceEntity, 'darkoak:worldedit')) {
                if (particeClear) system.clearRun(particeClear)
            }
        }
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wecopy',
        description: 'Copies Selected Area',
        permissionLevel: CommandPermissionLevel.GameDirectors
    }, (evd) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        if (player) {
            const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
            if (!selected?.p2) {
                player.sendMessage('Please Select An Area First')
                return
            }
            system.runTimeout(() => {
                if (world.structureManager.get(`darkoak:worldeditcopy_${player.name}`)) world.structureManager.delete(`darkoak:worldeditcopy_${player.name}`)
                world.structureManager.createFromWorld(`darkoak:worldeditcopy_${player.name}`, player.dimension, selected.p1, selected.p2)
                if (mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            })
        }
    })

    evd.customCommandRegistry.registerEnum('darkoak:rotate', ['0', '90', '180', '270'])
    evd.customCommandRegistry.registerEnum('darkoak:mirror', ['None', 'X', 'Z', 'XZ'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wepaste',
        description: 'Pastes An Area',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        optionalParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:rotate'
            },
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:mirror'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'confirm'
            }
        ]
    }, (evd, rotate, mirror, confirm) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p1) {
                    player.sendMessage('Please Select An Area First')
                    return
                }
                const structure = world.structureManager.get(`darkoak:worldeditcopy_${player.name}`)
                if (!structure) {
                    player.sendMessage('Please Copy Something First')
                    return
                }
                let rot = ''
                switch (rotate) {
                    case '0':
                        rot = StructureRotation.None
                        break
                    case '90':
                        rot = StructureRotation.Rotate90
                        break
                    case '180':
                        rot = StructureRotation.Rotate180
                        break
                    case '270':
                        rot = StructureRotation.Rotate270
                        break
                    default:
                        rot = StructureRotation.None
                        break
                }
                if (confirm) {
                    world.structureManager.place(structure, player.dimension, selected.p1, {
                        rotation: rot,
                        mirror: mirror
                    })
                    if (mcl.pRemove(player, 'darkoak:worldedit')) {
                        if (selected.id) system.clearRun(selected.id)
                    }
                } else {
                    let tempOutline1 = system.runInterval(() => {
                        if (system.currentTick % 100 == 0) {
                            switch (rot) {
                                case StructureRotation.None:
                                case StructureRotation.Rotate180:
                                    mcl.particleOutline(selected.p1, {
                                        x: selected.p1.x + (structure.size.x - 1),
                                        y: selected.p1.y + (structure.size.y - 1),
                                        z: selected.p1.z + (structure.size.z - 1),
                                    }, undefined, 1)
                                    break
                                case StructureRotation.Rotate90:
                                case StructureRotation.Rotate270:
                                    mcl.particleOutline(selected.p1, {
                                        x: selected.p1.x + (structure.size.z - 1),
                                        y: selected.p1.y + (structure.size.y - 1),
                                        z: selected.p1.z + (structure.size.x - 1),
                                    }, undefined, 1)
                                    break
                            }
                            system.clearRun(tempOutline1)
                        }
                    })
                }
            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:filltypes', ['destroy', 'hollow', 'keep', 'outline', 'replace'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wefill',
        description: 'Fills The Selected Area',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.BlockType,
                name: 'block'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:filltypes'
            },
            {
                type: CustomCommandParamType.BlockType,
                name: 'block2'
            }
        ]
    }, (evd, block, type, block2) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }
                if (type === 'replace') {
                    player.runCommand(`fill ${selected?.p1.x} ${selected?.p1.y} ${selected?.p1.z} ${selected?.p2.x} ${selected?.p2.y} ${selected?.p2.z} ${block.id} replace ${block2.id}`)
                } else {
                    player.runCommand(`fill ${selected?.p1.x} ${selected?.p1.y} ${selected?.p1.z} ${selected?.p2.x} ${selected?.p2.y} ${selected?.p2.z} ${block.id} ${type || ''}`)
                }
                if (mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            }
        })
    })

    // -P
    evd.customCommandRegistry.registerEnum('darkoak:gradienttypes', ['stone', 'stonebricks', 'dirt', 'wood', 'darkwood', 'custom'])
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wegradient',
        description: 'Applys A Gradient Path',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:gradienttypes'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.BlockType,
                name: 'block1'
            },
            {
                type: CustomCommandParamType.BlockType,
                name: 'block2'
            },
            {
                type: CustomCommandParamType.BlockType,
                name: 'block3'
            },
        ]
    }, (evd, type, block1, block2, block3) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }
                let blocks = []
                switch (type) {
                    case 'stone':
                        blocks = ['stone', 'andesite', 'gravel']
                        break
                    case 'stonebricks':
                        blocks = ['stone_bricks', 'cracked_stone_bricks', 'mossy_stone_bricks']
                        break
                    case 'dirt':
                        blocks = ['dirt', 'dirt_with_roots', 'coarse_dirt']
                        break
                    case 'custom':
                        blocks = [block1?.id, block2?.id, block3?.id]
                        blocks = blocks.filter(e => e != undefined)
                        break
                    case 'wood':
                        blocks = ['stripped_birch_wood', 'stripped_oak_wood', 'stripped_jungle_wood']
                        break
                    case 'darkwood':
                        blocks = ['dark_oak_wood', 'spruce_wood']
                        break
                }

                const minX = Math.min(selected.p1.x, selected.p2.x)
                const maxX = Math.max(selected.p1.x, selected.p2.x)
                const minY = Math.min(selected.p1.y, selected.p2.y)
                const maxY = Math.max(selected.p1.y, selected.p2.y)
                const minZ = Math.min(selected.p1.z, selected.p2.z)
                const maxZ = Math.max(selected.p1.z, selected.p2.z)

                for (let x = minX; x <= maxX; x++) {
                    for (let y = minY; y <= maxY; y++) {
                        for (let z = minZ; z <= maxZ; z++) {
                            player.runCommand(`setblock ${x} ${y} ${z} ${blocks[mcl.randomNumber(blocks.length)]}`)
                        }
                    }
                }

                if (mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wegradientc',
        description: 'Applys A Gradient Path With Coords',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:gradienttypes'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'loc1'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'loc2'
            },
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.BlockType,
                name: 'block1'
            },
            {
                type: CustomCommandParamType.BlockType,
                name: 'block2'
            },
            {
                type: CustomCommandParamType.BlockType,
                name: 'block3'
            },
            {
                type: CustomCommandParamType.BlockType,
                name: 'block4'
            },
            {
                type: CustomCommandParamType.BlockType,
                name: 'block5'
            },
        ]
    }, (evd, type, loc1, loc2, block1, block2, block3, block4, block5) => {
        const dimen = evd?.sourceEntity?.dimension || evd?.sourceBlock?.dimension || evd?.initiator?.dimension
        system.runTimeout(() => {
            let blocks = []
            switch (type) {
                case 'stone':
                    blocks = ['stone', 'andesite', 'gravel']
                    break
                case 'stonebricks':
                    blocks = ['stone_bricks', 'cracked_stone_bricks', 'mossy_stone_bricks']
                    break
                case 'dirt':
                    blocks = ['dirt', 'dirt_with_roots', 'coarse_dirt']
                    break
                case 'custom':
                    blocks = [block1?.id, block2?.id, block3?.id, block4?.id, block5?.id]
                    blocks = blocks.filter(e => e != undefined)
                    break
                case 'wood':
                    blocks = ['stripped_birch_wood', 'stripped_oak_wood', 'stripped_jungle_wood']
                    break
                case 'darkwood':
                    blocks = ['dark_oak_wood', 'spruce_wood']
                    break
            }

            const minX = Math.min(loc1.x, loc2.x)
            const maxX = Math.max(loc1.x, loc2.x)
            const minY = Math.min(loc1.y, loc2.y)
            const maxY = Math.max(loc1.y, loc2.y)
            const minZ = Math.min(loc1.z, loc2.z)
            const maxZ = Math.max(loc1.z, loc2.z)

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        dimen.runCommand(`setblock ${x} ${y} ${z} ${blocks[mcl.randomNumber(blocks.length)]}`)
                    }
                }
            }
        })
    })
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
export function WEselector(evd) {
    const player = evd.player
    const item = evd.itemStack

    /**@type {{p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}, id: number}} */
    const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
    if (mcl.isDOBAdmin(player) && item && item.typeId === 'darkoak:world_edit' && evd.isFirstEvent) {
        if (!selected?.p1) {
            mcl.jsonPUpdate(player, 'darkoak:worldedit', 'p1', evd.block.location)
        } else if (!selected?.p2) {
            mcl.jsonPUpdate(player, 'darkoak:worldedit', 'p2', evd.block.location)
            WEselector(evd)
        }

        let tempOutline = system.runInterval(() => {
            if (system.currentTick % 10 == 0) {
                mcl.particleOutline(evd.block.location, evd.block.location, undefined, 0.5)
                system.clearRun(tempOutline)
            }
        })

        if (selected?.p1 && selected?.p2 && !selected?.id) {
            let idadder = system.runInterval(() => {
                mcl.particleOutline(selected.p1, selected.p2, undefined, 1)
            })
            mcl.jsonPUpdate(player, 'darkoak:worldedit', 'id', idadder)
        }
    }
}