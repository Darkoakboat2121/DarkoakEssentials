
// This file holds data

import { mcl } from "../logic"
import { Player, world } from "@minecraft/server"

/**List of usernames to ban automatically if prebans is set to true*/
export const preBannedList = [
    'Noki5160', /*IP leaking*/
    'TheMr8bit', /*Basic*/
    'K4leonidas', //Racism
    'HackerBase74', //Basic
    'Player847806825', //Alt
    'DEETH9605', //Basic
    'Perri2207', //Revenge hacking, Racism
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
    'ComicSquare1434', //Basic
    'DaniCR214874', //Basic
    'herobrine229343', //Basic
    'Zac10284', //Chat crasher tech
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

export const worldProtectionWater = [
    'minecraft:water_bucket',
    'minecraft:axolotl_bucket',
    'minecraft:cod_bucket',
    'minecraft:pufferfish_bucket',
    'minecraft:salmon_bucket',
    'minecraft:tadpole_bucket',
    'minecraft:tropical_fish_bucket',
]


/**
 * 
 * @param {Player} player 
 * @param {string} string 
 * @returns 
 */
export function replacer(player, string) {
    const health = mcl.healthValue(player)
    // let block = undefined
    // if (player.getBlockFromViewDirection() != undefined && player.getBlockFromViewDirection().block) {
    //     block = player.getBlockFromViewDirection().block
    // } else {
    //     block = 'Undefined'
    // }
    let formattedString = string
    .replaceAll('#name#', player.name)
    .replaceAll('#health#', health)
    .replaceAll('#location#',  `${player.location.x.toFixed(0)} ${player.location.y.toFixed(0)} ${player.location.z.toFixed(0)}`)
    .replaceAll('#slot#', player.selectedSlotIndex.toString())
    // .replaceAll('#block.type#', block.typeId)
    .replaceAll('#velocity#', `${(player.getVelocity().x).toFixed(1)}, ${(player.getVelocity().y).toFixed(1)}, ${(player.getVelocity().z).toFixed(1)}`)
    .replaceAll('#cps#', `${player.getDynamicProperty('darkoak:ac:cps').toString()}`)
    .replaceAll('#effects#', mcl.playerEffectsArray(player))
    .replaceAll('#tags#', mcl.playerTagsArray(player))
    .replaceAll('#players#', world.getAllPlayers().length.toString())
    .replaceAll('#dimension#', player.dimension.id)
    .replaceAll('#random#', (mcl.randomNumber(9) + 1).toString())
    .replaceAll('#device#', player.clientSystemInfo.platformType.toString())

    if (formattedString.includes('#[') && formattedString.includes(']#')) {
        let score = mcl.getStringBetweenChars(formattedString, '#[', ']#')
        formattedString = formattedString
        .replaceAll(score, mcl.getScore(player, score).toString())
        .replaceAll('#[', '')
        .replaceAll(']#', '')
    }

    if (formattedString.includes('#hand#')) {
        if (mcl.getHeldItem(player)) {
            formattedString = formattedString
            .replaceAll('#hand#', mcl.getHeldItem(player).typeId)
        } else {
            formattedString = formattedString
            .replaceAll('#hand#', 'Hand')
        }
    }

    return formattedString
}


export const dummySize = 22

export const hashtags = '\nKeys:\n\\n - New Line\n#[scorename]# - Player Score (Replace scorename With An Actual Score Name)\n#name# - Player Name\n#health# - Player Health\n#location# - Player Co-ordinates\n#slot# - Slot Index\n#velocity# - Players Current Velocity\n#cps# - Players CPS\n#effects# - Players Effects\n#tags# - Players Tags\n#players# - Amount Of Online Players\n#dimension# - Dimension The Player Is In\n#random# - Random Number Between 1 And 10'

export const hashtagKeys = '#commands - Lists All Commands\n#noob - (Joke) Says Stuff in Chat\n#datadeleter - Opens UI For Deleting Data\n#cc - Clears Chat\n#random - Says A Random Number In Chat (1 To 100)\n#emojis - Lists All Emojis\n#cclocal - Clears The Senders Chat\n#landclaim add - Claims Four Chunks Near The Player\n#landclaim remove - Removes Current Land Claim\n#landclaim players - Opens UI For Adding Players To a Landclaim'

/**Array of strings for textures*/
export class icons {
    static thinPlus = 'textures/ui/ThinPlus'
    static trash = 'textures/ui/icon_trash'
    static minecoin = 'textures/ui/icon_minecoin_9x9'
}

export const emojis = [
    {m: ':dark_oak_boat:', e: ''},
    {m: ':elytra:', e: ''},
    {m: ':golden_horse_armor:', e: ''},
    {m: ':amethyst_shard:', e: ''},
    {m: ':spawn_egg_1:', e: ''},
    {m: ':empty_chestplate_1:', e: ''},
    {m: ':sherd_1:', e: ''},
    {m: ':flint:', e: ''},
    {m: ':empty_chestplate_2:', e: ''},
    {m: ':lever:', e: ''},
    {m: ':banner_pattern_1:', e: ''},
    {m: ':empty_boots_1:', e: ''},
]


// dynamic propertys can hold 32767 characters


/**
items:
    main
    anticheat
    chestlock
    community
    data_editor
    hop_feather
    generators
    world_protection
    20+ bindable items

features:

    miscellanious:
        no resource pack
        uses vanilla textures
        works on 1.21.60+

    generators:
        has customizible generators
        can gen any block including modded ones

    world settings:

        interaction settings:
            can change if players can interact with certain things
            can disable annoying item frame rotation

        customizible welcome message
        customizible world border

    player settings:
        player data menu that can see tags and effects among other things
        player punishments like banning / unbanning and muting / unmuting
        player tracking which tracks player actions to tags, for example if a player is emoting they get the tag darkoak:emoting

    chat settings:
        customizible ranks, beginning, end, middle, and bridge parts
        make your own chat commands (edit, add, delete and view)
        censoring, you can customize which words cant be sent in chat (begon brainrot!)

    chestlocking, lock chest where only certain players can open it

    admin dashboard:
        print the world data
        delete data (for bug fixing locally)
        look at reports
        anticheat logs
        documentation

    ui making:
        make a message ui
        make a action form ui
        customize the actionbar
        delete ui's

    community item settings:
        manage warps
        manage rtp and tpa
        manage shop
        
    community item menu:
        an item / menu to bring the community together
        pay people
        buy from shop
        warp to a warp
        report a player
        customizible profile

    data editor:
        change values of entity and block propertys

    anticheat options:
        prebans from a list dark wrote
        antinuker
        antifastplace
        antifly1
        antispeed1
        antispam
        reliable

    custom enchanting:
        use this command while holding an item to enchant: /scriptevent darkoak:enchant

    world protection:
        general world protection like banning potentially dangerous things
        area protection where players cant break, place or explode blocks in the area

    external support:
        wip feature where users can code their own ui and put it in the addon

    
 */