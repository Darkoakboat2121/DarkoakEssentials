
// This file holds data

import { mcl } from "../logic"
import { Player } from "@minecraft/server"

/**List of usernames to ban automatically if prebans is set to true*/
export const preBannedList = [
    'Noki5160', /*IP leaking*/
    'TheMr8bit', /*Basic*/
    'K4leonidas', //Racism
    'HackerBase74', //Basic
    'Player847806825', //Alt
    'DEETH9605', //Basic
    'Perri2207', //Revenge hacking
    'ION1209765', //Basic
    'QuackStatue9260', //Basic
    'Itsme643937', //Client dev
    'o44w', //Basic*
    'JayRSky', //Basic
    'Intoprelised', //Client dev
    'WellDanYT', //Client advertiser
    'OcelotSquad', //Alt
    'Qcrwhale', //Alt
    'ShulkerDupe', //Alt
    'AnchorPvP', //Alt
    'Proton Client', //Alt
    'Ocelot Client', //Alt
    'CoordExploit', //Alt
    'anti serval', //Alt
    'undisputzd', //Client dev
    'RanByGen', //Client dev
    'LoreSkygen', //Alt
    'cknighty21', //Basic
    'Grumm3678'
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
    'minecraft:bubble_column',
]

/**List of common names of hacked items*/
export const hackedItemsList = [
    '§g§lBeehive Minecart Command',
    '§g§lBeehive NPC Command',
    '§g§lBucket Minecart Command',
    '§g§lBucket NPC Command',
    '§g§lMovingBlock Minecart Command',
    '§g§lMovingBlock NPC Command',
]

export const worldProtectionBadItems = [
    'minecraft:flint_and_steel',
    'minecraft:water_bucket',
    'minecraft:axolotl_bucket',
    'minecraft:cod_bucket',
    'minecraft:lava_bucket',
    'minecraft:powder_snow_bucket',
    'minecraft:pufferfish_bucket',
    'minecraft:salmon_bucket',
    'minecraft:tadpole_bucket',
    'minecraft:tropical_fish_bucket',
    'minecraft:fire_charge',
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
        '#velocity#': `${(player.getVelocity().x).toFixed(1)}, ${(player.getVelocity().y).toFixed(1)}, ${(player.getVelocity().z).toFixed(1)}`,
    }
}

/**WIP
 * @param {Player} player 
 * @param {string} message 
 * @returns {string}
 */
export function hashtagProcessing(player, message) {
    const replacements = arrays.actionbarReplacements(player)
    var text = message

    for (const hashtag in replacements) {
        if (text.includes(hashtag)) {
            text = text.replaceAll(hashtag, replacements[hashtag])
        }
    }
    return text
}

export const dummySize = 22

export const hashtags = '\nKeys:\n\\n - New Line\n%%scorename%% - Player Score (Replace scorename With An Actual Score Name)\n#name# - Player Name\n#health# - Player Health\n#location# - Player Co-ordinates\n#slot# - Slot Index\n#velocity# - Players Current Velocity'

/**Array of strings for textures*/
export class icons {
    static thinPlus = 'textures/ui/ThinPlus'
    static trash = 'textures/ui/icon_trash'
    static minecoin = 'textures/ui/icon_minecoin_9x9'
}



// chat rank format: 0 = message, 1 = command, 2 = tag
// dynamic propertys can hold 32767 characters