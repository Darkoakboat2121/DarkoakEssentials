
// This file holds data

import { mcl } from "./logic"
import { Player } from "@minecraft/server"

/**List of usernames to ban automatically if prebans is set to true*/
export const preBannedList = [
    'Noki5160',
    'TheMr8bit',
    'K4leonidas',
    'HackerBase74',
    'Player847806825',
    'DEETH9605',
    'Perri2207',
    'ION1209765'
]

/**List of blocks that shouldnt be placed by non-admins*/
export const badBlocksList = [
    'minecraft:bedrock',
    'minecraft:command_block',
    'minecraft:repeating_command_block',
    'minecraft:chain_command_block',
    'minecraft:barrier',
    'minecraft:border_block',
    'minecraft:allow',
    'minecraft:deny',
    'minecraft:structure_block',
    'minecraft:structure_void',
    'minecraft:jigsaw',
    'minecraft:light_block_0',
    'minecraft:light_block_1',
    'minecraft:light_block_2',
    'minecraft:light_block_3',
    'minecraft:light_block_4',
    'minecraft:light_block_5',
    'minecraft:light_block_6',
    'minecraft:light_block_7',
    'minecraft:light_block_8',
    'minecraft:light_block_9',
    'minecraft:light_block_10',
    'minecraft:light_block_11',
    'minecraft:light_block_12',
    'minecraft:light_block_13',
    'minecraft:light_block_14',
    'minecraft:light_block_15',
    'minecraft:bubble_column'
]

/**List of common names of hacked items*/
export const hackedItemsList = [
    '§g§lBeehive Minecart Command',
    '§g§lBeehive NPC Command',
    '§g§lBucket Minecart Command',
    '§g§lBucket NPC Command',
    '§g§lMovingBlock Minecart Command',
    '§g§lMovingBlock NPC Command'
]

/**Definetly an array, don't question it. 
 * @param {Player} player
*/
export function actionbarReplacements(player) {
    const health = mcl.healthValue(player)
    var block = undefined
    if (player.getBlockFromViewDirection() != undefined && player.getBlockFromViewDirection().block.isValid()) {
        block = player.getBlockFromViewDirection().block
    } else {
        block = 'Undefined'
    }
    return {
        '#name#': `${player.name}`,
        '#health#': `${health}`,
        '#location#': `${parseInt(player.location.x)}, ${parseInt(player.location.y)}, ${parseInt(player.location.z)}`,
        '#slot#': `${player.selectedSlotIndex}`,
        '#block.type#': `${block.typeId}`,
        '#velocity#': `${(player.getVelocity().x).toFixed(1)}, ${(player.getVelocity().y).toFixed(1)}, ${(player.getVelocity().z).toFixed(1)}`
    }
}

