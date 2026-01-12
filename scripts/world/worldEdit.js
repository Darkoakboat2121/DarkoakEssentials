import { world, system, Player, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, ExplosionBeforeEvent, PlayerInteractWithBlockBeforeEvent, StartupEvent, ItemUseAfterEvent, CommandPermissionLevel, CustomCommandParamType, StructureRotation, StructureMirrorAxis, CustomCommandStatus, EquipmentSlot, EnchantmentTypes, EntityComponentTypes, ItemComponentTypes } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { enchantments } from "../data/arrays"

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
                    system.runTimeout(() => {
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

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wesphere',
        description: 'Makes A Sphere',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.BlockType,
                name: 'block'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'radius'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'hollow'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'confirm'
            },
        ],
    }, (evd, block, radius, hollow, confirm) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }

                const center = selected?.p2
                const dimension = player.dimension

                const radiusSquared = radius * radius
                const innerRadiusSquared = (radius - 1) * (radius - 1)

                for (let x = -radius; x <= radius; x++) {
                    for (let y = -radius; y <= radius; y++) {
                        for (let z = -radius; z <= radius; z++) {
                            const distanceSquared = x * x + y * y + z * z
                            if (hollow || !confirm) {
                                if (distanceSquared <= radiusSquared && distanceSquared >= innerRadiusSquared) {
                                    const blockLocation = {
                                        x: Math.floor(center.x + x),
                                        y: Math.floor(center.y + y),
                                        z: Math.floor(center.z + z),
                                    }
                                    try {
                                        if (!confirm) {
                                            dimension.spawnParticle('minecraft:endrod', blockLocation)
                                        } else if (confirm) {
                                            dimension.setBlockType(blockLocation, block.id)
                                        }
                                    } catch (e) {
                                        console.log(`Failed to place block at ${blockLocation.x}, ${blockLocation.y}, ${blockLocation.z}: ${e}`)
                                    }
                                }
                            } else if (distanceSquared <= radiusSquared) {
                                const blockLocation = {
                                    x: Math.floor(center.x + x),
                                    y: Math.floor(center.y + y),
                                    z: Math.floor(center.z + z),
                                }
                                try {
                                    dimension.setBlockType(blockLocation, block.id)
                                } catch (e) {
                                    console.log(`Failed to place block at ${blockLocation.x}, ${blockLocation.y}, ${blockLocation.z}: ${e}`)
                                }
                            }
                        }
                    }
                }

                if (confirm && mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
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

    const c = mcl.jsonWGet('darkoak:scriptsettings')
    if (c?.worldeditmaster) return

    /**@type {{p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}, id: number}} */
    const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
    if (mcl.isDOBAdmin(player) && item && item.typeId === 'darkoak:world_edit' && evd.isFirstEvent) {
        if (!selected?.p1) {
            mcl.jsonPUpdate(player, 'darkoak:worldedit', 'p1', evd.block.location)
        } else if (!selected?.p2) {
            mcl.jsonPUpdate(player, 'darkoak:worldedit', 'p2', evd.block.location)
            WEselector(evd)
        }

        system.runTimeout(() => {
            mcl.particleOutline(evd.block.location, evd.block.location, undefined, 0.5)
        })

        if (selected?.p1 && selected?.p2 && !selected?.id) {
            let idadder = system.runInterval(() => {
                if (mcl.tickTimer(10)) mcl.particleOutline(selected.p1, selected.p2, undefined, 1)
            })
            mcl.jsonPUpdate(player, 'darkoak:worldedit', 'id', idadder)
            console.log(JSON.stringify(mcl.jsonPGet(player, 'darkoak:worldedit')))
        }
    }
}

/**Better vanilla commands, in world edit cause i didnt want to make another file
 * @param {StartupEvent} evd 
 */
export function betterVanillaCommands(evd) {
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:dobclone',
        description: 'Better Clone Command (Less Laggy)',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Location,
                name: 'begin'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'end'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'destination'
            },
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Integer,
                name: 'time'
            },
        ]
    }, (evd, begin, end, destination, time) => {
        const dimen = mcl.customSlashDimen(evd)
        const blocks = mcl.getBlocksByVolume(dimen.id, begin, end)

        const offset = {
            x: destination.x - begin.x,
            y: destination.y - begin.y,
            z: destination.z - begin.z
        }

        let amount = 0
        let totalBlocks = blocks.length
        let delayPerBlock = time ? (time / totalBlocks) : 0

        for (let index = 0; index < blocks.length; index++) {
            const block = blocks[index]
            const src = block.location
            const dest = {
                x: src.x + offset.x,
                y: src.y + offset.y,
                z: src.z + offset.z,
            }
            if (mcl.blocksMatch(dimen.getBlock(dest), block)) continue

            let delay = index * delayPerBlock

            try {
                system.runTimeout(() => {
                    dimen.runCommand(`clone ${src.x} ${src.y} ${src.z} ${src.x} ${src.y} ${src.z} ${dest.x} ${dest.y} ${dest.z}`)
                }, delay)
                amount++
            } catch (e) {
                console.log(String(e))
            }
        }
        return {
            status: CustomCommandStatus.Success,
            message: `Cloned ${amount} Blocks`
        }
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:dobsummon',
        description: 'Better Summon Command (More Options)',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.EntityType,
                name: 'entityType'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'location'
            },
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Integer,
                name: 'amount'
            },
            {
                type: CustomCommandParamType.String,
                name: 'name'
            },
        ]
    }, (evd, type, loc, amount, name) => {
        const dimen = mcl.customSlashDimen(evd)
        let r = ''
        let i = 0
        let possibleError = ''
        while (i++ < (amount || 1)) {
            try {
                r = 'success'
                system.runTimeout(() => {
                    const ent = dimen.spawnEntity(type, loc)
                    if (name) ent.nameTag = name
                })
            } catch (e) {
                if (r === 'success') {
                    r = 'partial'
                } else {
                    r = 'fail'
                    possibleError = String(e)
                }
                break
            }
        }

        switch (r) {
            case 'success':
                return {
                    message: `Successfully Summoned ${amount} ${type} At ${loc.x} ${loc.y} ${loc.z}`,
                    status: CustomCommandStatus.Success
                }
            case 'partial':
                return {
                    message: `Some Of The Entities Were Summoned: ${possibleError}`,
                    status: CustomCommandStatus.Failure
                }
            case 'fail':
                return {
                    message: `None Of The Entities Were Summoned: ${possibleError}`,
                    status: CustomCommandStatus.Failure
                }
        }
    })

    // evd.customCommandRegistry.registerEnum('darkoak:slots', [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Mainhand, EquipmentSlot.Offhand, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36'])
    // evd.customCommandRegistry.registerEnum('darkoak:enchants', enchantments)
    // evd.customCommandRegistry.registerCommand({
    //     name: 'darkoak:dobenchant',
    //     description: 'Better Enchant Command (More Options)',
    //     permissionLevel: CommandPermissionLevel.GameDirectors,
    //     mandatoryParameters: [
    //         {
    //             type: CustomCommandParamType.PlayerSelector,
    //             name: 'players'
    //         },
    //         {
    //             type: CustomCommandParamType.Enum,
    //             name: 'darkoak:enchants'
    //         },
    //     ],
    //     optionalParameters: [
    //         {
    //             type: CustomCommandParamType.Integer,
    //             name: 'level'
    //         },
    //         {
    //             type: CustomCommandParamType.Enum,
    //             name: 'darkoak:slots'
    //         },
    //     ]
    // }, (evd, players, enchant, level, slot) => {
    //     for (let index = 0; index < players.length; index++) {
    //         /**@type {Player} */
    //         const player = players[index]
    //         let item
    //         let toGet = slot
    //         if (!slot) toGet = EquipmentSlot.Mainhand
    //         if (isNaN(slot)) {
    //             item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(slot)
    //         } else {
    //             item = mcl.getInventory(player)?.container.getItem(parseInt(slot))
    //         }
    //         if (item) {
    //             system.runTimeout(() => {
    //                 item.getComponent(ItemComponentTypes.Enchantable).addEnchantment({
    //                     type: EnchantmentTypes.get(enchant),
    //                     level: level
    //                 })
    //             })
    //         }
    //     }
    // })


}