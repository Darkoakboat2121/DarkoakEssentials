
// This file holds data and some helper functions

import { mcl } from "../logic"
import { EntityComponentTypes, Player, PlayerJoinAfterEvent, PlayerLeaveBeforeEvent, system, world } from "@minecraft/server"

/**List of usernames to ban automatically if prebans is set to true*/
export const preBannedList = [
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
    'pluckmc', //Nuking
    'xsemgamingYTx', //Basic, op abuse
    'Diamondkid 7231', //Above average
    'Mario X082', //Basic
    'Th3PlayzAlt', //Racism
    'DarkLord126936', //Basic / Auto-clicker
    'ANGELOSO YT', //Involved in backdooring
    'GunxturnoYT', //Racism
    'GamerGod9289', //Basic (if you are looking for a place to try them use galaxite)
    'Ner0TheZer08703', //Basic (How the hell can I use horion for over 5 minutes in hive and not get banned but my friend gets permanent ban for using a client not even for backing)
    'Chonkysausage62', //Basic (Lifeboats the best Its mad difficult to get banned)
    'Z100k9281', //Basic (ive been playing lifeboat and the hive with horion)
    'nuptunia', //Private client dev
    'Moonlight2010PK', //Basic (Hive works Lifeboat Mineville I don't know about Cubecraft too risky since I always get a 30 day ban)
    'awskr', //Basic (someone on lifeboat was using a chinese client and ive been dying to try and find it cause it just sounds so funny)
    'Greenchip5490', //Basic (I used to on lifeboat)
    'SHR1PMN0S3', //Basic (how did i get banned for fly on cubecraft? and i was using a good pc so how would i get banned? is it because my internet hasnt updated the client?)
    'LJBATKID', //Basic (i got banned on cubecraft for exploiting)
    'iQuazum', //Basic (Finna run the cubecraft again . Everytime I check in the 50-100  people leave and move lobby running from me)
    'Fleeno1997', //Basic
    'TwentyTwoCps', //Basic (cubecraft autodetects so u cant use it on there | and im perm banned on zeqa and galaxite)
    'Tyme2012', //Basic (I got baned from galaxite for flying in creativ mode (lol))
    'DOM4R14N', //Basic (the official ones, like hive, cubecraft, galaxite, lifeboat, i dont care tbh i only go in there to troll people plus i bought multiple microsoft accounts online from china so i have so many names)
    'brampedgex', //Basic (10y ban instead of perma as if galaxite will exist at all in 10 years)
    'RoastedCreeper9', //Basic (i got banned from galaxite for 10 years lmao)
    'UpwindLeaf57868', //Basic (Infiniteaura only works on galaxite and realms)
    'plopbob420', //Exploits
    'WardenStar12', //Basic
    'SpotTooth432794', //Basic
    'GlowSquid135220', //Basic
    'Adas7047', //Basic
    'SquidGlow9460', //Alt
    'x_II_II_x_hd', //Basic
    'M Afzal8449', //Basic
    'Walrus142131', //Basic
    'Poem4320', //Basic
    'FishyDev2918', //Basic
    'Xcreeper129795', //Basic
    'tokaimaru', //Basic
    'MansourServer', //Basic
    'MansourIsTired', //Alt
    'XMansourPVP', //Alt
    'MansourAura', //Alt
    'ItzIceLime', //Alt
    'Creeper195012', //Basic (aw man, then what hack client is as good as Toolbox? because horion server doesnt play along with lifeboat's anti-cheat)
    'gervin4450', //Basic (anyone trying to hack on lifeboat w me)
    'v1qwn9527', //Homophobia, racism, spamming cuss words
    'xGAMEZAx', //Involved in backdooring
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
    '§1§l32K Horion Kit',
    '§2§lOP Legit Horion Kit'
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

export const hackedItemsVanilla = [
    'minecraft:client_request_placeholder_block',
    'minecraft:moving_block',
    'minecraft:unknown'
]

/**Holds special rank images in F1 glyph */
export const spranks = {
    admin: '',
    member: '',
    mod: '',
    helper: '',
    owner: '',
    tester: '',
    idiot: '',
    builder: '',
    operate: '',
    troll: '',
    hacker: '',
    donater: '',
    vip: ''
}

/**
 * 
 * @param {Player} player 
 * @param {string} string 
 * @returns 
 */
export function replacer(player, string) {
    const loc = player.location
    const velo = player.getVelocity()

    const time = new Date()
    // let block = undefined
    // if (player.getBlockFromViewDirection() != undefined && player.getBlockFromViewDirection().block) {
    //     block = player.getBlockFromViewDirection().block
    // } else {
    //     block = 'Undefined'
    // }
    let formattedString = string
        .replaceAll('#name#', player.name)
        .replaceAll('#health#', mcl.healthValue(player).toString())
        .replaceAll('#location#', `${loc.x.toFixed(0)} ${loc.y.toFixed(0)} ${loc.z.toFixed(0)}`)
        .replaceAll('#locationx#', `${loc.x.toFixed(0)}`)
        .replaceAll('#locationy#', `${loc.y.toFixed(0)}`)
        .replaceAll('#locationz#', `${loc.z.toFixed(0)}`)
        .replaceAll('#slot#', player.selectedSlotIndex.toString())
        .replaceAll('#velocity#', `${(velo.x).toFixed(1)} ${(velo.y).toFixed(1)} ${(velo.z).toFixed(1)}`)
        .replaceAll('#velocityx#', `${(velo.x).toFixed(1)}`)
        .replaceAll('#velocityy#', `${(velo.y).toFixed(1)}`)
        .replaceAll('#velocityz#', `${(velo.z).toFixed(1)}`)
        .replaceAll('#cps#', `${(player.getDynamicProperty('darkoak:ac:cps') || '0').toString()}`)
        .replaceAll('#effects#', mcl.playerEffectsArray(player))
        .replaceAll('#tags#', mcl.playerTagsArray(player))
        .replaceAll('#players#', world.getAllPlayers().length.toString())
        .replaceAll('#dimension#', player.dimension.id)
        .replaceAll('#device#', player.clientSystemInfo.platformType.toString())
        .replaceAll('#tps#', mcl.wGet('darkoak:tps').toString())
        .replaceAll('#t-seconds#', (system.currentTick / 20).toFixed(0))
        .replaceAll('#s-seconds#', mcl.wGet('darkoak:sseconds').toString())
        .replaceAll('#s-minutes#', mcl.wGet('darkoak:sminutes').toString().split('.')[0])
        .replaceAll('#graphics#', player.graphicsMode.toString())
        .replaceAll('#input#', player.inputInfo.lastInputModeUsed.toString())
        .replaceAll('#time1#', `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
        .replaceAll('#time2#', `${time.getHours()}:${time.getMinutes()}`)
        .replaceAll('#year#', time.getFullYear().toString())
        .replaceAll('#money#', mcl.getScore(player).toString())

    try {
        const view = player.getViewDirection()
        formattedString = formattedString
            .replaceAll('#viewx#', view.x.toFixed(0))
            .replaceAll('#viewy#', view.y.toFixed(0))
            .replaceAll('#viewz#', view.z.toFixed(0))
    } catch {

    }

    // emojis
    if (formattedString.includes(':')) {
        for (let index = 0; index < emojis.length; index++) {
            const e = emojis[index]
            formattedString = formattedString.replaceAll(e.m, e.e)
        }
    }

    // held item
    if (formattedString.includes('#hand#')) {
        const item = mcl.getHeldItem(player)
        if (item) {
            formattedString = formattedString
                .replaceAll('#hand#', item.typeId)
        } else {
            formattedString = formattedString
                .replaceAll('#hand#', 'hand')
        }
    }

    // scores
    if (formattedString.includes('#[') && formattedString.includes(']#')) {
        let score = mcl.getStringBetweenChars(formattedString, '#[', ']#')
        formattedString = formattedString
            .replaceAll(score, mcl.getScore(player, score).toString())
            .replaceAll('#[', '')
            .replaceAll(']#', '')
    }

    // random number
    if (formattedString.includes('#=') && formattedString.includes('=#')) {
        let random = mcl.getStringBetweenChars(formattedString, '#=', '=#')
        const split = random.split('-')
        const min = parseInt(split[0])
        const max = parseInt(split[1])
        if (min != undefined && max != undefined) {
            if (min > max) {
                formattedString = formattedString
                    .replaceAll(random, 'Error: Min Is Greater Than Max')
                    .replaceAll('#=', '')
                    .replaceAll('=#', '')
            } else {
                formattedString = formattedString
                    .replaceAll(random, mcl.randomNumberInRange(min, max).toString())
                    .replaceAll('#=', '')
                    .replaceAll('=#', '')
            }
        }
    }

    if (formattedString.includes('#{') && formattedString.includes('}#')) {
        const variable = mcl.getStringBetweenChars(formattedString, '#{', '}#')
        formattedString = formattedString
            .replaceAll(variable, mcl.wGet(`darkoak:vars:${variable}`) || '')
            .replaceAll('#{', '')
            .replaceAll('}#', '')

    }

    // math, btw this code is racist, idk why, it just gets censored in mc
    if (formattedString.includes('#(') && formattedString.includes(')#')) {
        try {
            let eq = mcl.getStringBetweenChars(formattedString, '#(', ')#')

            formattedString = formattedString
                .replaceAll(eq, Function(`return ${eq}`)())
                .replaceAll('#(', '')
                .replaceAll(')#', '')
        } catch {
            mcl.adminMessage(`Replacer Hashtag Error At Math Replacer: ${player.name} -> ${string}`)
        }
    }

    return formattedString
}


export const dummySize = 35
export const version = '2.2.3, This Is Probably Wrong'

export const hashtags = [
    '\nKeys:',
    '\\n -> New Line',
    '#[scorename]# -> Player Score (Replace scorename With An Actual Score Name)',
    '#(math)# -> Math Equation (Replace math With A Math Equation, Allowed Values: numbers, *(multiplication), +(addition), /(division), -(subtraction), replacer hashtags (This Does Not Support Math Nesting))',
    '#name# -> Player Name',
    '#health# -> Player Health',
    '#location# -> Player Co-ordinates',
    '#locationx# -> Player Co-ordinate X',
    '#locationy# -> Player Co-ordinate Y',
    '#locationz# -> Player Co-ordinate Z',
    '#slot# -> Slot Index',
    '#velocity# -> Players Current Velocity',
    '#velocityx# -> Players Current X Velocity',
    '#velocityy# -> Players Current Y Velocity',
    '#velocityz# -> Players Current Z Velocity',
    '#cps# -> Players CPS',
    '#effects# -> Players Effects',
    '#tags# -> Players Tags',
    '#players# -> Amount Of Online Players',
    '#dimension# -> Dimension The Player Is In',
    '#=min-max=# -> Random Number Between "min" And "max", Format: #=1-10=#',
    '#tps# -> Ticks Per Second',
    '#t-seconds# -> Total Seconds',
    '#s-seconds# -> Session Seconds',
    '#viewx# -> View Direction X',
    '#viewy# -> View Direction Y',
    '#viewz# -> View Direction Z',
    '#s-minutes# -> Session Minutes',
    '#graphics# -> The Players Graphics Mode',
    '#input# -> The Players Input Mode',
    '#{variable}# -> Custom Variable, Replace variable With The Variable Name',
    '#time1# -> Current Time In HH:MM:SS Format',
    '#time2# -> Current Time In HH:MM Format',
    '#year# -> Current Year',
].join('\n')

export const hashtagKeys = [
    '#commands -> Lists All Commands',
    '#noob -> (Joke) Says Stuff in Chat',
    '#datadeleter -> Opens UI For Deleting Data',
    '#cc -> Clears Chat\n#random -> Says A Random Number In Chat (1 To 100)',
    '#emojis -> Lists All Emojis',
    '#cclocal -> Clears The Senders Chat',
    '#landclaim add -> Claims Four Chunks Near The Player',
    '#landclaim remove -> Removes Current Land Claim',
    '#landclaim players -> Opens UI For Adding Players To a Landclaim',
    '#version -> Says The Version Number In Chat',
    '#message -> Opens A UI For Queuing A Message',
].join('\n')

export const chatCommandSelectors = [
    '[player] -> Player Name Selector'
].join('\n')

export const debugEvents = [
    'DEBUG LIST: | || || |_',
    'aclog -> Log yourself in anticheat',
    'help -> Help list (this lol)',
    'playerlist -> All players list',
    'bytesize -> Byte size'
].join('\n')

/**Array of strings for textures*/
export class icons {
    static thinPlus = 'textures/ui/ThinPlus'
    static trash = 'textures/ui/icon_trash'
    static expand = 'textures/ui/icon_preview'
    static minecoin = 'textures/ui/icon_minecoin_9x9'
    static dialogBackground = 'textures/ui/dialog_background_opaque'
    static globe = 'textures/ui/World'
    static steveAlex = 'textures/ui/FriendsIcon'
    static chatWithArrow = 'textures/ui/chat_send'

    static crossButton = 'textures/ui/interact'
    static goldenPicker = 'textures/ui/equipped_item_border'
    static whitePlayer = 'textures/ui/glyph_inventory'
    static cancel = 'textures/ui/cancel'
    static playerSpeaking = 'textures/ui/Feedback'
    static fourPlayers = 'textures/ui/icon_multiplayer'

    /**@param {string} type  */
    static item(type) {
        return `textures/items/${type}`
    }
    /**@param {string} type  */
    static block(type) {
        return `textures/blocks/${type}`
    }
    /**@param {string} type  */
    static entity(type) {
        return `textures/entities/${type}`
    }

    static do = {
        band1: 'textures/items/band1',
        sidebar2: 'textures/ui/sidebar2'
    }
}

export const emojis = [
    { m: ':dark_oak_boat:', e: '' },
    { m: ':elytra:', e: '' },
    { m: ':golden_horse_armor:', e: '' },
    { m: ':amethyst_shard:', e: '' },
    { m: ':spawn_egg_1:', e: '' },
    { m: ':empty_chestplate_1:', e: '' },
    { m: ':sherd_1:', e: '' },
    { m: ':flint:', e: '' },
    { m: ':empty_chestplate_2:', e: '' },
    { m: ':lever:', e: '' },
    { m: ':banner_pattern_1:', e: '' },
    { m: ':empty_boots_1:', e: '' },
    { m: ':tableflip:', e: '(╯‵□′)╯︵┻━┻' },
    { m: ':untableflip:', e: '(ヘ･_･)ヘ┳━┳' },
    { m: ':doubletableflip:', e: '┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻' },
    { m: ':idk:', e: '¯\\_(ツ)_/¯' },
    { m: ':cat:', e: 'ᓚᘏᗢ' },
    { m: ':yo:', e: '(＾Ｕ＾)ノ~ＹＯ' },
    { m: ':defeat:', e: '○|￣|_' },
    { m: ':amongus:', e: 'ඞ' },
    { m: ':cat2:', e: '/ᐠ｡ꞈ｡ᐟ\\' },
    { m: ':nerd:', e: '(⌐■_■)' },
    { m: ':nerd2:', e: '(⌐◕‿◕)' },
]

// this is a list of common abbreviations and their expanded forms for professionalism in chat
// this also changes racist and toxic words to more professional ones
// WARNING, CONTAINS RACIST WORDS, THEY ARE REPLACED WITH *RACISM HERE* IN THE EXPANDED FORM
export const professionalism = [
    { m: 'rn', e: 'right now' },
    { m: 'idk', e: 'I don\'t know' },
    { m: 'ik', e: 'I know' },
    { m: 'ig', e: 'I guess' },
    { m: 'ya', e: 'yes' },
    { m: 'cant', e: 'can\'t' },
    { m: 'im', e: 'I\'m' },
    { m: 'i', e: 'I' },
    { m: 'dont', e: 'don\'t' },
    { m: 'yw', e: 'your welcome' },
    { m: 'nvm', e: 'nevermind' },
    { m: 'tbh', e: 'to be honest' },
    { m: 'ty', e: 'thank you' },
    { m: 'ok', e: 'okay' },
    { m: 'gotta', e: 'got to' },
    { m: 'yea', e: 'yes' },
    { m: 'brakeing', e: 'breaking' },
    { m: 'brb', e: 'be right back' },
    { m: 'cya', e: 'see you' },
    { m: 'gonna', e: 'going to' },
    { m: 'wanna', e: 'want to' },
    { m: 'u', e: 'you' },
    { m: 'ur', e: 'your' },
    { m: 'urself', e: 'yourself' },
    { m: 'np', e: 'no problem' },
    { m: 'bc', e: 'because' },
    { m: 'asap', e: 'as soon as possible' },
    { m: 'jk', e: 'just kidding' },
    { m: 'smh', e: 'shaking my head' },
    { m: 'rly', e: 'really' },
    { m: 'pls', e: 'please' },
    { m: 'plz', e: 'please' },
    { m: 'thx', e: 'thanks' },
    { m: 'sry', e: 'sorry' },
    { m: 'irl', e: 'in real life' },
    { m: 'btw', e: 'by the way' },
    { m: 'havent', e: 'haven\'t' },
    { m: 'wut', e: 'what' },
    { m: 'gl', e: 'good luck' },
    { m: 'glhf', e: 'good luck have fun' },
    { m: 'idc', e: 'I don\'t care' },
    { m: 'gg', e: 'good game' },
    { m: 'afk', e: 'away from keyboard' },
    { m: 'lmao', e: 'laughing my butt off' },
    { m: 'wtf', e: 'what the heck' },
    { m: 'kys', e: 'please get help' },
    { m: 'dumb', e: 'uninformed' },
    { m: 'hell', e: 'heck' },
    { m: 'retard', e: 'less intelligent person' },
    { m: 'damn', e: 'darn' },
    { m: 'omg', e: 'oh my gosh' },
    { m: 'nigger', e: '*racism here*' },
    { m: 'nigga', e: '*racism here*' },
    { m: 'wdym', e: 'what do you mean' },
    { m: 'wb', e: 'welcome back' }
]

export const trackingKeysObject = [
    'flying',
    'gliding',
    'climbing',
    'emoting',
    'falling',
    'inwater',
    'jumping',
    'onground',
]

export const trackingKeysPlayer = [
    'isFlying',
    'isGliding',
    'isClimbing',
    'isEmoting',
    'isFalling',
    'isInWater',
    'isJumping',
    'isOnGround',
]

export const crasherSymbol = ''
export const crasherSymbol2 = 'ï£¿'

/**
 * @param {Player} player Player that the item amount runs on
 * @param {number} amount Amount of compressions
 * @param {string} compressed Item to compress (64 -> 1)
 * @param {string} result Item in return for compressing
 * @param {string} errorMessage Message to display if the player doesnt have enough items
 */
export function compress(player, amount, compressed, result, errorMessage) {
    if (player.runCommand(`testfor @s [hasitem={item=${compressed},quantity=${amount * 64}..}]`).successCount > 0) {
        player.runCommand(`clear @s ${compressed} 0 ${amount * 64}`)
        player.runCommand(`give @s ${result} ${amount}`)
    } else {
        player.sendMessage(errorMessage)
    }
}

export function decompress(player, amount, decompressed, result, errorMessage) {
    const mscore = mcl.jsonWGet('darkoak:moneyscore')
    if (!mscore) throw new Error('Yeah honestly you\'re screwed')
    const ipd = 64 - (mscore.compression || 0)
    if (player.runCommand(`testfor @s [hasitem={item=${decompressed},quantity=${amount}..}]`).successCount > 0) {
        player.runCommand(`clear @s ${decompressed} 0 ${amount}`)
        player.runCommand(`give @s ${result} ${(ipd * amount)}`)
    } else {
        player.sendMessage(errorMessage)
    }
}

export const scriptEvents = [
    'darkoak:help -> Help List',
    'darkoak:enchant -> Opens Enchanting UI / Enchants Held Item',
    'darkoak:bind',
    'darkoak:spawn -> Spawns Items',
    'darkoak:command',
    'darkoak:knockback',
    'darkoak:if',
    'darkoak:variable',
    'darkoak:projectile',
    'darkoak:openui',
    'darkoak:uihelp',
    'darkoak:debug',
    'darkoak:transfer'
]

export const boatTypes = [
    'Oak Boat',
    'Spruce Boat',
    'Birch Boat',
    'Jungle Boat',
    'Acacia Boat',
    'Dark Oak Boat',
    'Mangrove Boat',
    'Cherry Boat',
    'Pale Oak Boat',
    'Bamboo Raft',
    'Minecart???',
    'Saddle???',
]

export const specialRanks = {
    'rank:sp0': spranks.admin,
    'rank:sp1': spranks.member,
    'rank:sp2': spranks.mod,
    'rank:sp3': spranks.helper,
    'rank:sp4': spranks.owner,
    'rank:sp5': spranks.tester,
    'rank:sp6': spranks.builder,
    'rank:sp7': spranks.donater,
    'rank:sp8': spranks.hacker,
    'rank:sp9': spranks.idiot,
    'rank:sp10': spranks.operate,
    'rank:sp11': spranks.troll,
    'rank:sp12': spranks.vip,
}

/**
 * @param {Player} player
 */
export function storePlayerData(player) {
    mcl.jsonWSet(`darkoak:playerdata:${player.name}`, mcl.playerToData(player))
}


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
