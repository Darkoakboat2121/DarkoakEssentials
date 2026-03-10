import { world, system, Player, PlayerBreakBlockBeforeEvent, PlayerPlaceBlockBeforeEvent, ExplosionBeforeEvent, PlayerInteractWithBlockBeforeEvent, StartupEvent, ItemUseAfterEvent, CommandPermissionLevel, CustomCommandParamType, StructureRotation, StructureMirrorAxis, CustomCommandStatus, EquipmentSlot, EnchantmentTypes, EntityComponentTypes, ItemComponentTypes, Block } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { enchantments, particles, sounds } from "../data/arrays"
import { DebugBox, debugDrawer } from "@minecraft/debug-utilities"

/**@type {Map<string, string[]>} */
let undoMap = new Map()

/**
 * @param {StartupEvent} evd 
 */
export function WEcommands(evd) {

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:weclear',
        description: 'Clears Selection (Does Not Remove Blocks)',
        permissionLevel: CommandPermissionLevel.GameDirectors,
    }, (evd) => {
        if (evd?.sourceEntity) {
            let particeClear = mcl.jsonPGet(evd?.sourceEntity, 'darkoak:worldedit')?.id
            if (mcl.pRemove(evd?.sourceEntity, 'darkoak:worldedit')) {
                if (particeClear) system.clearRun(particeClear)
                evd?.sourceEntity?.sendMessage('§aCleared Selection§r')
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
                player.sendMessage(`§aCopied Selection [${JSON.stringify(selected?.p1)} to ${JSON.stringify(selected?.p2)}]§r`)
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
                    player.sendMessage(`§aPlaced A Copy [${JSON.stringify(selected?.p1)}]§r`)
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
                player.sendMessage(`§aFilled Selection [${JSON.stringify(selected?.p1)} to ${JSON.stringify(selected?.p2)}]§r`)
                if (mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            }
        })
    })

    // evd.customCommandRegistry.registerCommand({
    //     name: 'darkoak:wefillt',
    //     description: 'Fills The Selected Area With Support For Large Sizes',
    //     permissionLevel: CommandPermissionLevel.GameDirectors,
    //     mandatoryParameters: [
    //         {
    //             type: CustomCommandParamType.BlockType,
    //             name: 'block'
    //         },
    //     ]
    // })

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
    }, (evd, type, block1, block2, block3, block4, block5) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }
                /**@type {string[]} */
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

                const minX = Math.min(selected.p1.x, selected.p2.x)
                const maxX = Math.max(selected.p1.x, selected.p2.x)
                const minY = Math.min(selected.p1.y, selected.p2.y)
                const maxY = Math.max(selected.p1.y, selected.p2.y)
                const minZ = Math.min(selected.p1.z, selected.p2.z)
                const maxZ = Math.max(selected.p1.z, selected.p2.z)

                let toSet = new Set()

                for (let x = minX; x <= maxX; x++) {
                    for (let y = minY; y <= maxY; y++) {
                        for (let z = minZ; z <= maxZ; z++) {
                            toSet.add(JSON.stringify({
                                x: x,
                                y: y,
                                z: z,
                            }))
                            //player.runCommand(`setblock ${x} ${y} ${z} ${blocks[mcl.randomNumber(blocks.length)]}`)
                        }
                    }
                }

                undoMap.delete(player.name)
                const toSetArray = Array.from(toSet)
                mcl.arraySpreader(toSetArray, (Math.min(15, toSetArray.length / 100)), (e, i) => {
                    const loc = JSON.parse(e)
                    const chosen = blocks[mcl.xorRandomNum(0, blocks.length - 1, mcl.randomNumber(1000))]
                    const current = player.dimension.getBlock(loc)
                    if (current) {
                        const undo = undoMap.get(player.name) || []
                        undo.push(JSON.stringify({
                            type: current.typeId,
                            location: current.location,
                        }))
                        undoMap.set(player.name, undo)
                        current?.setType(chosen)
                    }
                })

                player.sendMessage(`§aFilled Selection [${JSON.stringify(selected?.p1)} to ${JSON.stringify(selected?.p2)}]§r`)
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
                        // toSet.add(JSON.stringify({
                        //     x: x,
                        //     y: y,
                        //     z: z,
                        // }))
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

                let toSet = new Set()

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
                                            //dimension.spawnParticle('minecraft:endrod', blockLocation)
                                            const t = new DebugBox({
                                                dimension: player.dimension,
                                                x: blockLocation.x,
                                                y: blockLocation.y,
                                                z: blockLocation.z,
                                            })
                                            t.bound = { x: 1, y: 1, z: 1 }
                                            t.timeLeft = 10
                                            debugDrawer.addShape(t, player.dimension)
                                        } else if (confirm) {
                                            //dimension.setBlockType(blockLocation, block.id)
                                            toSet.add(JSON.stringify(blockLocation))
                                        }
                                    } catch (e) {
                                        console.error(`Failed to place block at ${blockLocation.x}, ${blockLocation.y}, ${blockLocation.z}: ${e}`)
                                    }
                                }
                            } else if (distanceSquared <= radiusSquared) {
                                const blockLocation = {
                                    x: Math.floor(center.x + x),
                                    y: Math.floor(center.y + y),
                                    z: Math.floor(center.z + z),
                                }
                                try {
                                    //dimension.setBlockType(blockLocation, block.id)
                                    toSet.add(JSON.stringify(blockLocation))
                                } catch (e) {
                                    console.log(`Failed to place block at ${blockLocation.x}, ${blockLocation.y}, ${blockLocation.z}: ${e}`)
                                }
                            }
                        }
                    }
                }

                undoMap.delete(player.name)
                const toSetArray = Array.from(toSet)
                mcl.arraySpreader(toSetArray, toSetArray.length / 200, (e, i) => {
                    const b = player.dimension.getBlock(JSON.parse(e))
                    if (b) {
                        const undo = undoMap.get(player.name) || []
                        undo.push(JSON.stringify({
                            type: b.typeId,
                            location: b.location,
                        }))
                        undoMap.set(player.name, undo)
                        b?.setType(block)
                    }
                })

                if (confirm) player.sendMessage(`§aBuilt Sphere [${JSON.stringify(selected?.p2)}]§r`)
                if (confirm && mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wecylinder',
        description: 'Makes A Cylinder',
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
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Boolean,
                name: 'hollow'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'wall_thickness'
            },
        ]
    }, (evd, block, thickness, hollow, wall) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }

                const p1 = selected.p1;
                const p2 = selected.p2;
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dz = p2.z - p1.z;
                const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
                if (length === 0) {
                    return
                }

                const ux = dx / length
                const uy = dy / length
                const uz = dz / length

                const outer = thickness
                const inner = hollow ? Math.max(0, thickness - (wall ?? 1)) : 0

                const minX = Math.floor(Math.min(p1.x, p2.x) - outer)
                const maxX = Math.ceil(Math.max(p1.x, p2.x) + outer)
                const minY = Math.floor(Math.min(p1.y, p2.y) - outer)
                const maxY = Math.ceil(Math.max(p1.y, p2.y) + outer)
                const minZ = Math.floor(Math.min(p1.z, p2.z) - outer)
                const maxZ = Math.ceil(Math.max(p1.z, p2.z) + outer)

                let toSet = new Set()

                for (let x = minX; x <= maxX; x++) {
                    for (let y = minY; y <= maxY; y++) {
                        for (let z = minZ; z <= maxZ; z++) {
                            const qx = x - p1.x
                            const qy = y - p1.y
                            const qz = z - p1.z

                            let t = qx * ux + qy * uy + qz * uz

                            if (t < 0) t = 0
                            if (t > length) t = length

                            const cx = p1.x + ux * t
                            const cy = p1.y + uy * t
                            const cz = p1.z + uz * t

                            const dx2 = x - cx
                            const dy2 = y - cy
                            const dz2 = z - cz
                            const distSq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2

                            const outerSq = outer * outer
                            const innerSq = inner * inner

                            const shouldFill = hollow ? (distSq <= outerSq && distSq >= innerSq) : (distSq <= outerSq)
                            if (!shouldFill) continue

                            toSet.add(JSON.stringify({ x, y, z }))
                        }
                    }
                }

                undoMap.delete(player.name)
                const toSetArray = Array.from(toSet)
                mcl.arraySpreader(toSetArray, Math.min(15, toSetArray.length / 100), (e, i) => {
                    const blockAtLoc = player.dimension.getBlock(JSON.parse(e))

                    const undo = undoMap.get(player.name) || []
                    undo.push(JSON.stringify({
                        type: blockAtLoc.typeId,
                        location: blockAtLoc.location
                    }))
                    undoMap.set(player.name, undo)
                    blockAtLoc?.setType(block)

                })

                player.sendMessage(`§aBuilt Cylinder [${JSON.stringify(selected?.p1)} to ${JSON.stringify(selected?.p2)}]§r`)
                if (mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wecircle',
        description: 'Makes A Circle',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.BlockType,
                name: 'block'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'radius'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:directions'
            }
        ]
    }, (evd, block, radius, direction) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }

                const center = selected.p2
                const radiusSquared = radius * radius
                const dir = vector(direction)

                /**@type {Set<string>} */
                let toSet = new Set()

                switch (dir) {
                    case 'x': {
                        for (let y = -radius; y <= radius; y++) {
                            for (let z = -radius; z <= radius; z++) {
                                const distSq = y * y + z * z
                                if (distSq <= radiusSquared && distSq >= (radius - 1) * (radius - 1)) {
                                    toSet.add(JSON.stringify({
                                        x: Math.floor(center.x),
                                        y: Math.floor(center.y + y),
                                        z: Math.floor(center.z + z),
                                    }))
                                }
                            }
                        }
                        break
                    }
                    case 'y': {
                        for (let x = -radius; x <= radius; x++) {
                            for (let z = -radius; z <= radius; z++) {
                                const distSq = x * x + z * z
                                if (distSq <= radiusSquared && distSq >= (radius - 1) * (radius - 1)) {
                                    toSet.add(JSON.stringify({
                                        x: Math.floor(center.x + x),
                                        y: Math.floor(center.y),
                                        z: Math.floor(center.z + z),
                                    }))
                                }
                            }
                        }
                        break
                    }
                    case 'z': {
                        for (let x = -radius; x <= radius; x++) {
                            for (let y = -radius; y <= radius; y++) {
                                const distSq = x * x + y * y
                                if (distSq <= radiusSquared && distSq >= (radius - 1) * (radius - 1)) {
                                    toSet.add(JSON.stringify({
                                        x: Math.floor(center.x + x),
                                        y: Math.floor(center.y + y),
                                        z: Math.floor(center.z),
                                    }))
                                }
                            }
                        }
                    }
                }

                const toSetArray = Array.from(toSet)
                mcl.arraySpreader(toSetArray, Math.min(5, toSetArray.length / 100), (e, i) => {
                    player.dimension.getBlock(JSON.parse(e))?.setType(block)
                })

                player.sendMessage(`§aBuilt Circle [${JSON.stringify(selected?.p2)}]§r`)
                if (mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            }

            /**Argh i hate gru */
            function vector(dir = 'Y+') {
                switch (dir) {
                    case 'X+': return 'x'
                    case 'X-': return 'x'
                    case 'Y+': return 'y'
                    case 'Y-': return 'y'
                    case 'Z+': return 'z'
                    case 'Z-': return 'z'
                    default: return 'y'
                }
            }

        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:wepyramid',
        description: 'Makes A Pyramid',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.BlockType,
                name: 'block'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'width'
            }
        ]
    }, (evd, block, width) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }

                const maxY = Math.max(selected.p1, selected.p2)
                const minY = Math.min(selected.p1, selected.p2)

                const centerX = selected.p2.x
                const centerZ = selected.p2.z

                let toSet = new Set()

                for (let y = minY; y <= maxY; y++) {
                    const levelFromBottom = y - minY
                    const currentWidth = Math.max(0, width - levelFromBottom)

                    if (currentWidth <= 0) continue

                    const halfWidth = Math.floor(currentWidth / 2)
                    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
                        for (let z = centerZ - halfWidth; z <= centerZ + halfWidth; z++) {
                            toSet.add(JSON.stringify({
                                x: x,
                                y: y,
                                z: z,
                            }))
                        }
                    }
                }

                const toSetArray = Array.from(toSet)
                mcl.arraySpreader(toSetArray, Math.min(10, toSetArray.length / 100), (e, i) => {
                    player.dimension.getBlock(JSON.parse(e))?.setType(block)
                })

                player.sendMessage(`§aBuilt Pyramid [${JSON.stringify(selected?.p2)}]§r`)
                if (mcl.pRemove(player, 'darkoak:worldedit')) {
                    if (selected.id) system.clearRun(selected.id)
                }
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:weactivecopy',
        description: 'Actively Copies The Selection',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Location,
                name: 'copy_to'
            },
            {
                type: CustomCommandParamType.Boolean,
                name: 'confirm'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.Integer,
                name: 'rotation x'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'rotation y'
            },
            {
                type: CustomCommandParamType.Integer,
                name: 'rotation z'
            },
        ]
    }, (evd, pasteTo, confirm, rotXf, rotYf, rotZf) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                if (!selected?.p2) {
                    player.sendMessage('Please Select An Area First')
                    return
                }

                const rotX = rotXf ?? 0
                const rotY = rotYf ?? 0
                const rotZ = rotZf ?? 0

                const diff = {
                    x: pasteTo.x - selected.p1.x,
                    y: pasteTo.y - selected.p1.y,
                    z: pasteTo.z - selected.p1.z,
                }

                let toSet = new Set()

                const copy = mcl.getBlocksByVolume(player.dimension.id, selected.p1, selected.p2)
                for (let index = 0; index < copy.length; index++) {
                    const block = copy[index]
                    const rotated = rotate(block)
                    const destLoc = {
                        x: rotated.x + diff.x,
                        y: rotated.y + diff.y,
                        z: rotated.z + diff.z,
                    }
                    if (block.typeId === 'minecraft:air') continue
                    if (!confirm) {
                        const t = new DebugBox({
                            dimension: block.dimension,
                            x: destLoc.x - 0.5,
                            y: destLoc.y,
                            z: destLoc.z - 0.5,
                        })
                        t.bound = { x: 1, y: 1, z: 1 }
                        t.timeLeft = 20
                        const bc = block.getMapColor()
                        t.color = {
                            red: bc.red,
                            blue: bc.blue,
                            green: bc.green,
                        }
                        debugDrawer.addShape(t, block.dimension)
                    } else {
                        toSet.add(JSON.stringify({
                            destLoc: destLoc,
                            copyLoc: {
                                x: block.x,
                                y: block.y,
                                z: block.z
                            },
                            type: block.typeId
                        }))
                        //player.dimension.getBlock(destLoc)?.setType(block.typeId)
                    }
                }

                if (confirm) {

                    undoMap.delete(player.name)
                    const toSetArray = Array.from(toSet)
                    mcl.arraySpreader(toSetArray, Math.min(5, toSetArray.length / 100), (e, i) => {
                        const d = JSON.parse(e)
                        const destBlock = player.dimension.getBlock(d.destLoc)
                        const undo = undoMap.get(player.name) || []
                        undo.push(JSON.stringify({
                            type: destBlock.type,
                            location: destBlock.location
                        }))
                        undoMap.set(player.name, undo)
                        mcl.pCommand(player, `clone ${d.copyLoc.x} ${d.copyLoc.y} ${d.copyLoc.z} ${d.copyLoc.x} ${d.copyLoc.y} ${d.copyLoc.z} ${d.destLoc.x} ${d.destLoc.y} ${d.destLoc.z}`)
                    })

                    player.sendMessage(`§aCopied [${JSON.stringify(selected?.p2)}]§r`)
                    if (mcl.pRemove(player, 'darkoak:worldedit')) {
                        if (selected.id) system.clearRun(selected.id)
                    }
                }

                function rotate(loc) {

                    let x = loc.x - selected.p1.x
                    let y = loc.y - selected.p1.y
                    let z = loc.z - selected.p1.z
                    const rx = rotX * Math.PI / 180
                    const ry = rotY * Math.PI / 180
                    const rz = rotZ * Math.PI / 180

                    let y1 = y * Math.cos(rx) - z * Math.sin(rx)
                    let z1 = y * Math.sin(rx) + z * Math.cos(rx)
                    y = y1
                    z = z1

                    let x1 = x * Math.cos(ry) + z * Math.sin(ry)
                    let z2 = -x * Math.sin(ry) + z * Math.cos(ry)
                    x = x1
                    z = z2

                    let x2 = x * Math.cos(rz) - y * Math.sin(rz)
                    let y2 = x * Math.sin(rz) + y * Math.cos(rz)
                    x = x2
                    y = y2

                    return {
                        x: Math.round(x + selected.p1.x),
                        y: Math.round(y + selected.p1.y),
                        z: Math.round(z + selected.p1.z)
                    }
                }
            }
        })
    })

    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:weundo',
        description: 'Undoes The Last World Edit Command',
        permissionLevel: CommandPermissionLevel.GameDirectors,
    }, (evd) => {
        /**@type {Player} */
        const player = evd?.sourceEntity
        system.runTimeout(() => {
            if (player) {
                //const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
                // if (!selected?.p2) {
                //     player.sendMessage('Please Select An Area First')
                //     return
                // }

                const undo = undoMap.get(player.name)
                for (let index = 0; index < undo.length; index++) {
                    const block = JSON.parse(undo[index])
                    player.dimension.getBlock(block.location)?.setType(block.type)
                }

                // if (mcl.pRemove(player, 'darkoak:worldedit')) {
                //     if (selected?.id) system.clearRun(selected.id)
                // }
            }
        })
    })

    // evd.customCommandRegistry.registerCommand({
    //     name: 'darkoak:qrcode',
    //     description: 'Makes A QR Code',
    //     permissionLevel: CommandPermissionLevel.GameDirectors,
    //     mandatoryParameters: [
    //         {
    //             type: CustomCommandParamType.String,
    //             name: 'website'
    //         }
    //     ]
    // }, (evd, website) => {
    //     /**@type {Player} */
    //     const player = evd?.sourceEntity
    //     system.runTimeout(() => {
    //         if (player) {
    //             const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
    //             if (!selected?.p2) {
    //                 player.sendMessage('Please Select An Area First')
    //                 return
    //             }

    //             const matrix = getQR()
    //             const start = selected.p1

    //             for (let y = 0; y < matrix.length; y++) {
    //                 for (let x = 0; x < matrix[y].length; x++) {
    //                     if (matrix[y][x]) {
    //                         player.dimension.getBlock({
    //                             x: start.x + x,
    //                             y: start.y,
    //                             z: start.z + y
    //                         })?.setType('minecraft:black_concrete')
    //                     }
    //                 }
    //             }

    //             if (mcl.pRemove(player, 'darkoak:worldedit')) {
    //                 if (selected.id) system.clearRun(selected.id)
    //             }

    //             function getQR() {
    //                 const size = 21
    //                 const matrix = Array.from({
    //                     length: size
    //                 }, () => Array(size).fill(0))
    //                 for (let i = 0; i < Math.min(website.length, size); i++) {
    //                     const digit = parseInt(website[i], 10)
    //                     for (let j = 0; j < size; j++) {
    //                         matrix[i][j] = (j < digit) ? 1 : 0
    //                     }
    //                 }
    //                 finder(0, 0)
    //                 finder(size - 7, 0)
    //                 finder(0, size - 7)
    //                 return matrix


    //                 function finder(x, y) {
    //                     for (let dy = 0; dy < 7; dy++) {
    //                         for (let dx = 0; dx < 7; dx++) {
    //                             matrix[y + dy][x + dx] = (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5)) ? 1 : 0
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     })
    // })

    // evd.customCommandRegistry.registerCommand({
    //     name: 'darkoak:wepicture',
    //     description: 'Maps A Picture To A 2D Plane',
    //     permissionLevel: CommandPermissionLevel.GameDirectors,
    //     mandatoryParameters: [
    //         {
    //             type: CustomCommandParamType.Location,
    //             name: 'location of picture taker'
    //         },
    //         {
    //             type: CustomCommandParamType.Location,
    //             name: 'where to look'
    //         }
    //     ]
    // }, (evd, loc, dir) => {
    //     /**@type {Player} */
    //     const player = evd?.sourceEntity
    //     system.runTimeout(() => {
    //         if (player) {
    //             const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
    //             if (!selected?.p2) {
    //                 player.sendMessage('Please Select An Area First')
    //                 return
    //             }

    //             const camera = player.dimension.spawnEntity('minecraft:camera', loc)
    //             camera.lookAt(dir)
    //             const loc = camera.location

    //             const mm = mcl.locationMinMax(selected.p1, selected.p2)

    //             const width = mm.maxX - mm.minX + 1
    //             const height = mm.maxY - mm.minY + 1

    //             for (let y = 0; y < height; y++) {
    //                 for (let x = 0; x < width; x++) {
    //                     const px = Math.floor((x / width) * )
    //                 }
    //             }

    //             if (mcl.pRemove(player, 'darkoak:worldedit')) {
    //                 if (selected.id) system.clearRun(selected.id)
    //             }

    //             function ray() {
    //                 let distance = 0
    //                 while (distance < 100) {
    //                     const pos = {
    //                         x: loc.x + dir.x * distance,
    //                         y: loc.y + dir.y * distance,
    //                         z: loc.z + dir.z * distance,
    //                     }

    //                     const block = player.dimension.getBlock(pos)
    //                     if (block && !block.isAir) return block
    //                     distance += 0.25
    //                 }
    //                 return undefined
    //             }

    //             function picture() {
    //                 const aspect = width / height
    //                 const fovRad = (fov * Math.PI) / 180 //PI mentioned

    //                 const up = { x: 0, y: 1, z: 0 }

    //             }
    //         }
    //     })
    // })

    // evd.customCommandRegistry.registerEnum('darkoak:animationoptions', ['save', 'load', 'move', 'play', 'stop'])
    // evd.customCommandRegistry.registerCommand({
    //     name: 'darkoak:weanimate',
    //     description: 'Animates A Build Using Frames. Save -> Saves Current Frame, Load -> Loads A Specified Frame, Move -> Changes The Currently Edited Frame, Play -> Starts The Animation, Stop -> Stops The Animation',
    //     permissionLevel: CommandPermissionLevel.GameDirectors,
    //     mandatoryParameters: [
    //         {
    //             type: CustomCommandParamType.String,
    //             name: 'animation_name'
    //         },
    //         {
    //             type: CustomCommandParamType.Enum,
    //             name: 'darkoak:animationoptions'
    //         },
    //     ],
    //     optionalParameters: [
    //         {
    //             type: CustomCommandParamType.Integer,
    //             name: 'frame'
    //         }
    //     ]
    // }, (evd, animname, option, frame) => {
    //     /**@type {Player} */
    //     const player = evd?.sourceEntity
    //     if (player) {
    //         const selected = mcl.jsonPGet(player, 'darkoak:worldedit')
    //         if (!selected?.p2) {
    //             player.sendMessage('Please Select An Area First')
    //             return
    //         }

    //         const dimension = mcl.customSlashDimen(evd)
    //         const id = `darkoak:animatedbuild:${animname}`
    //         const d = mcl.jsonWGet(id)
    //         system.runTimeout(() => {
    //             switch (option) {
    //                 case 'save':
    //                     const currentFrames = d?.frames
    //                     if (!currentFrames) {
    //                         mcl.jsonWSet(id, {

    //                         })
    //                     } else {

    //                     }
    //                     mcl.jsonWUpdate(id, 'frames',)
    //                     break
    //             }
    //         })
    //     }
    // })
}

/**
 * @param {PlayerInteractWithBlockBeforeEvent} evd 
 */
export function WEselector(evd) {
    const player = evd.player
    const item = evd.itemStack

    const c = mcl.jsonWGet('darkoak:scriptsettings')
    if (c?.worldeditmaster) return

    /**@type {{p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}, p3: {x: number, y: number, z: number}, id: number}} */
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
                if (mcl.tickTimer(10)) {
                    mcl.particleOutline(selected.p1, selected.p2, undefined, 1)
                    mcl.particleOutline(selected.p1, selected.p1, 'minecraft:basic_flame_particle', 1)
                    mcl.particleOutline(selected.p2, selected.p2, 'minecraft:blue_flame_particle', 1)
                }
            })
            system.runTimeout(() => {
                try {
                    system.clearRun(idadder)
                } catch {

                }
            }, (20 * 60))
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

    evd.customCommandRegistry.registerEnum('darkoak:particles', particles)
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:dobparticle',
        description: 'Better Particle Command (Has An Enum Instead)',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:particles'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'location',
            },
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'players'
            }
        ]
    }, (evd, particle, loc, players) => {
        let p = `minecraft:${particle}`
        system.runTimeout(() => {
            if (players) {
                for (let index = 0; index < players.length; index++) {
                    /**@type {Player} */
                    const player = players[index]
                    player.spawnParticle(p, loc)
                }
            } else {
                mcl.customSlashDimen(evd)?.spawnParticle(p, loc)
            }
        })
    })

    evd.customCommandRegistry.registerEnum('darkoak:sounds', sounds)
    evd.customCommandRegistry.registerCommand({
        name: 'darkoak:dobplaysound',
        description: 'Better Playsound Command (Has An Enum Instead)',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            {
                type: CustomCommandParamType.Enum,
                name: 'darkoak:sounds'
            }
        ],
        optionalParameters: [
            {
                type: CustomCommandParamType.PlayerSelector,
                name: 'players'
            },
            {
                type: CustomCommandParamType.Location,
                name: 'location'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'volume'
            },
            {
                type: CustomCommandParamType.Float,
                name: 'pitch'
            }
        ]
    }, (evd, sound, players, loc, vol, pitch) => {
        const location = (loc ?? evd?.initiator?.location ?? evd?.sourceBlock?.location ?? evd?.sourceEntity?.location)
        system.runTimeout(() => {
            if (players) {
                for (let index = 0; index < players.length; index++) {
                    /**@type {Player} */
                    const player = players[index]
                    player.playSound(sound, {
                        location: location,
                        volume: vol,
                        pitch: pitch,
                    })
                }
            } else {
                mcl.customSlashDimen(evd).playSound(sound, location, {
                    volume: vol,
                    pitch: pitch,
                })
            }
        })

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