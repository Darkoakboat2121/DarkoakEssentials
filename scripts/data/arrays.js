
// This file holds data and some helper functions

import { mcl } from "../logic"
import { Block, Entity, EntityComponentTypes, Player, PlayerJoinAfterEvent, PlayerLeaveBeforeEvent, system, world } from "@minecraft/server"

/**List of usernames to ban automatically if prebans is set to true (proof) [notes], prebanable: [discrimination, hacking, backdooring]*/
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
    'MansourServer', //Basic, i swear he's behind every hack
    'MansourIsTired', //Alt
    'XMansourPVP', //Alt
    'MansourAura', //Alt
    'ItzIceLime', //Alt
    'Creeper195012', //Basic (aw man, then what hack client is as good as Toolbox? because horion server doesnt play along with lifeboat's anti-cheat)
    'gervin4450', //Basic (anyone trying to hack on lifeboat w me)
    'v1qwn9527', //Homophobia, racism, spamming cuss words
    'xGAMEZAx', //Involved in backdooring
    'watona 47', //Basic
    'GOGOMAYJJP', //Basic
    'DarthManis', //Basic
    'jousloong', //Basic
    'BIG Dawg7846', //Basic
    'NuggetMac2709', //Basic
    'The Luis K1ng 1', //Basic
    'HackerDR258', //Basic
    'BuckedZulu58245', //Basic
    'MagicGold757', //Basic (i got banned on galaxty for 10 years ones and theres still nine mere)
    'Ancientbooks1', //Doxxing (one month only, remove after 9/10/25)
    'Von Leia', //Basic (I can literally fly around mineville and cubecraft with that client)
    'LostVyperx', //Spamming inappropriate things
    'AsteroidCorn320', //Basic
    'CANDEROO8', //Basic (F**k got banned on The Hive)
    'notok49', //Basic (But it keeps on kicking me from the hive whan I use it)
    'DaRealNCross', //Basic (how do i autoclick on hive without getting the error message)
    'LSAT OP', //Basic (on lifeboat mainly but i did on hive and was fine for atleast an hour | then i got banned for pressing f aswell lol)
    'RektByLauch', //Basic
    'Lokannnn', //Basic (It's very useful and works perfectly, just like borion's experimental "Hide and seek" option that works perfectly in "Hive")
    'AntiRodris', //Basic (Guys, does anyone know why he takes me Hive when I get kill aura and jump, he kicks me, is there a way to set it up?) [SYSTEM]
    'Legisox', //Alt
    'DitchFish6084', //Hacking, (and spamming advertisements but technically thats not bannable)
    'W1sley', //Alt
    'BorealJam397537', //Op exploit? Invisible account? Really powerful hacks
    'GamerBoi1234113', //Homophobia, general hate towards LGBTQ stuff
    'TylertheBoss251', //Basic
    'cqrmmm', //Alt
    'sineP 00700', //Inapropriate image spamming in realms
    'CreeperFight491', //Alt
    'N0v13', //Client dev
    'MojangContact', //Client dev
    'FXE404', //Client dev
    'Batmanbb7', //Racism
    'Zwuiix', //Client dev
    'GitHub Copilot', //Alt
    'c1mv', //Alt
    'SillyNkgga', //Client dev and probably racism
    'Nya Enzo', //Client dev
    'Reqoan', //Client advertiser & helper
    'GoogleIA', //Alt
    'Yoqsnd', //Alt
    'rShizuka', //Alt
    'htttqss', //Alt
    'NeutroShortyyy', //Alt
    'stevenhighway', //Alt
    'Dsuky', //Client advertiser & helper
    'Sr M4rkoz', //Basic
    'DREAM8689', //Racism
    'SplashifiedYT', //Racism
    'EchoHackCmd', //Alt
    'qLqmqqz Bad', //Hack client dev
    'insane bypasses', //Alt
    'Chiika Fujiwara', //Alt
    'ANSHUL MASTER', //Basic
    'Kinghud12345', //Racism
    'SternStraw11678', //Racism (quote: "its casual racism")
    'FreezeEngine', //Client dev
    'EntityEngine', //Alt
    'alteik', //Client dev
    'RadWolf514', //Likes WW2 germans
    'nadi23459367', //Basic
    'Psychobuggy9244', //Racism
    'DDacarious', //Racism (check)
    'Strwbrryx0', //Basic
    'MattePlane3769', //Alt
    'Monolo420', //Racism
    'creed1231', //Racism
    'Trilobite8410', //Likes WW2 german leader (hail ######)
    'JunesGuysYT', //Basic
    'jfq', //Basic
    'X7G', //Basic
    'FellowSafe1443', //Realm nuking
    'TSL 5100', //Realm nuking
    'BryceBarnette', //Realm nuking
    'BraydenA21', //Realm nuking
    'ArcZotic3232', //Realm nuking
    'Wkey dummy', //Realm nuking
    'J9c79k', //Realm nuking
    'Songful2900', //Realm nuking
    'Anthony82835', //Realm nuking
    'Twitchsiz', //Realm nuking
    'Omar6Idk1631', //Realm nuking
    'MildPlayer76671', //Realm nuking
    'ILoveJ7297', //Realm nuking
    'Isabriones16', //Realm nuking
    'zBichoZsx', //Realm nuking
    'elias89910', //Realm nuking
    'NRK EGOS', //Realm nuking
    'Dqrk strict', //Realm nuking
    'uvori6181', //Realm nuking
    'R2 YTGOATMER', //Realm nuking
    'Jamie soBe21', //Realm nuking
    'DaxToTheMax5221', //Realm nuking
    'DexTremBala', //Basic
    'BilledBus3094', //Realm nuking
    'VXPHCC', //Realm nuking
    'HAZZA7917', //Realm nuking
    'Static host8414', //Hack dev
    'SnowyGamerXD', //Realm nuking
    'Flash1234132', //Realm nuking (most likely a nuker)
    'idkcodw', //Realm nuking
    'freckles022122', //Basic
    'AlarmingDale', //Racism
    'UlPotato1243', //
    'HACKERBRO34', //Basic
    'SalutaryBean', //Realm nuking (darko: i was on the realm when it happened, vertex isnt always an automatic bot, it could be better to treat it as if it was like a level 1 client)
    'RekeneiZsolt', //Op exploit (BlitzProxy)
    'EndingAce8561',
    // 'KKThaDestroyer1', //Basic (i have impart the powerful hacks in bedrock it cost 30 dollars), darko note: i cant believe someone would pay for a client
]

export const prebansSet = new Set(preBannedList)

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
    'minecraft:unknown',
    'minecraft:info_update',
    'minecraft:reserved6'
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
 * @param {Player} player 
 * @param {string} string 
 * @returns 
 */
// export function replacer(player, string) {
//     const loc = player.location
//     const velo = player.getVelocity()
//     const vd = player.getViewDirection()
//     const dot = velo.x * vd.x + velo.z * vd.z
//     const ap = world.getAllPlayers()

//     const time = new Date()
//     // let block = undefined
//     // if (player.getBlockFromViewDirection() != undefined && player.getBlockFromViewDirection().block) {
//     //     block = player.getBlockFromViewDirection().block
//     // } else {
//     //     block = 'Undefined'
//     // }

//     // try making it work on blocks to with ?. and || parts ------------------
//     let formattedString = string
//         .replaceAll('#name#', player.name)
//         .replaceAll('#namet#', player.name.replaceAll(' ', '').toString())
//         .replaceAll('#health#', Math.ceil(mcl.healthValue(player)).toString())
//         .replaceAll('#location#', `${loc.x.toFixed(0)} ${loc.y.toFixed(0)} ${loc.z.toFixed(0)}`)
//         .replaceAll('#locationx#', `${loc.x.toFixed(0)}`)
//         .replaceAll('#locationy#', `${loc.y.toFixed(0)}`)
//         .replaceAll('#locationz#', `${loc.z.toFixed(0)}`)
//         .replaceAll('#slot#', player.selectedSlotIndex.toString())
//         .replaceAll('#velocity#', `${(velo.x).toFixed(1)} ${(velo.y).toFixed(1)} ${(velo.z).toFixed(1)}`)
//         .replaceAll('#velocityx#', `${(velo.x).toFixed(1)}`)
//         .replaceAll('#velocityy#', `${(velo.y).toFixed(1)}`)
//         .replaceAll('#velocityz#', `${(velo.z).toFixed(1)}`)
//         .replaceAll('#dot#', `${dot.toFixed(1)}`)
//         .replaceAll('#cps#', `${(player.getDynamicProperty('darkoak:ac:cps') || '0').toString()}`)
//         .replaceAll('#effects#', mcl.playerEffectsArray(player))
//         .replaceAll('#tags#', mcl.playerTagsArray(player))
//         .replaceAll('#players#', ap.length.toString())
//         .replaceAll('#playerlist#', ap.map(e => e.name).join())
//         .replaceAll('#dimension#', player.dimension.id)
//         .replaceAll('#device#', player.clientSystemInfo.platformType.toString())
//         .replaceAll('#tps#', mcl.wGet('darkoak:tps').toString())
//         .replaceAll('#t-seconds#', (system.currentTick / 20).toFixed(0))
//         .replaceAll('#s-seconds#', mcl.wGet('darkoak:sseconds').toString())
//         .replaceAll('#s-minutes#', mcl.wGet('darkoak:sminutes').toString().split('.')[0])
//         .replaceAll('#graphics#', player.graphicsMode.toString())
//         .replaceAll('#input#', player.inputInfo.lastInputModeUsed.toString())
//         .replaceAll('#time1#', `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
//         .replaceAll('#time2#', `${time.getHours()}:${time.getMinutes()}`)
//         .replaceAll('#year#', time.getFullYear().toString())
//         .replaceAll('#money#', mcl.getScore(player).toString())
//         .replaceAll('#perm#', player.commandPermissionLevel.toString())

//         .replaceAll('§?', colorCodes[mcl.randomNumber(colorCodes.length)])


//     try {
//         const view = player.getViewDirection()
//         formattedString = formattedString
//             .replaceAll('#viewx#', view.x.toFixed(1))
//             .replaceAll('#viewy#', view.y.toFixed(1))
//             .replaceAll('#viewz#', view.z.toFixed(1))
//     } catch {

//     }

//     // emojis
//     if (formattedString.includes(':')) {
//         for (let index = 0; index < emojis.length; index++) {
//             const e = emojis[index]
//             formattedString = formattedString.replaceAll(e.m, e.e)
//         }
//     }

//     // held item
//     if (formattedString.includes('#hand#')) {
//         const item = mcl.getHeldItem(player)
//         if (item) {
//             formattedString = formattedString
//                 .replaceAll('#hand#', item.typeId)
//         } else {
//             formattedString = formattedString
//                 .replaceAll('#hand#', 'hand')
//         }
//     }

//     // scores
//     if (formattedString.includes('#[') && formattedString.includes(']#')) {
//         let score = mcl.getStringBetweenChars(formattedString, '#[', ']#')
//         formattedString = formattedString
//             .replaceAll(score, mcl.getScoreOld(player, score).toString())
//             .replaceAll('#[', '')
//             .replaceAll(']#', '')
//     }

//     // random number
//     if (formattedString.includes('#=') && formattedString.includes('=#')) {
//         let random = mcl.getStringBetweenChars(formattedString, '#=', '=#')
//         const split = random.split('-')
//         const min = parseInt(split[0])
//         const max = parseInt(split[1])
//         if (min != undefined && max != undefined) {
//             if (min > max) {
//                 formattedString = formattedString
//                     .replaceAll(random, 'Error: Min Is Greater Than Max')
//                     .replaceAll('#=', '')
//                     .replaceAll('=#', '')
//             } else {
//                 formattedString = formattedString
//                     .replaceAll(random, mcl.randomNumberInRange(min, max).toString())
//                     .replaceAll('#=', '')
//                     .replaceAll('=#', '')
//             }
//         }
//     }


//     if (formattedString.includes('#{') && formattedString.includes('}#')) {
//         const variable = mcl.getStringBetweenChars(formattedString, '#{', '}#')
//         formattedString = formattedString
//             .replaceAll(variable, mcl.wGet(`darkoak:vars:${variable}`) || '')
//             .replaceAll('#{', '')
//             .replaceAll('}#', '')

//     }

//     // math, btw this code is racist, idk why, it just gets censored in mc
//     if (formattedString.includes('#(') && formattedString.includes(')#')) {
//         try {
//             let eq = mcl.getStringBetweenChars(formattedString, '#(', ')#')

//             formattedString = formattedString
//                 .replaceAll(eq, Function(`return ${eq}`)())
//                 .replaceAll('#(', '')
//                 .replaceAll(')#', '')
//         } catch {
//             mcl.adminMessage(`Replacer Hashtag Error At Math Replacer: ${player.name} -> ${string}`)
//         }
//     }

//     return formattedString
// }

/**
 * @param {Player | Entity | Block} d 
 * @param {string} text 
 */
export function replacer(d, text) {
    let f = text
    const loc = d.location
    const ap = world.getAllPlayers()
    const time = new Date()

    if ((d instanceof Entity)) {
        const velo = d.getVelocity()
        const vd = d.getViewDirection()
        const dot = velo.x * vd.x + velo.z * vd.z

        if ((d instanceof Player)) {
            f = f
                .replaceAll('#name#', d.name)
                .replaceAll('#namet#', d.name.replaceAll(' ', '').toString())
                .replaceAll('#device#', d.clientSystemInfo.platformType.toString())
                .replaceAll('#graphics#', d.graphicsMode.toString())
                .replaceAll('#input#', d.inputInfo.lastInputModeUsed.toString())
                .replaceAll('#perm#', d.commandPermissionLevel.toString())
                .replaceAll('#slot#', d.selectedSlotIndex.toString())
                .replaceAll('#cps#', `${(d.getDynamicProperty('darkoak:ac:cps') || '0').toString()}`)
        }

        f = f
            .replaceAll('#health#', Math.ceil(mcl.healthValue(d)).toString())
            .replaceAll('#velocity#', `${(velo.x).toFixed(1)} ${(velo.y).toFixed(1)} ${(velo.z).toFixed(1)}`)
            .replaceAll('#velocityx#', `${(velo.x).toFixed(1)}`)
            .replaceAll('#velocityy#', `${(velo.y).toFixed(1)}`)
            .replaceAll('#velocityz#', `${(velo.z).toFixed(1)}`)
            .replaceAll('#dot#', `${dot.toFixed(1)}`)
            .replaceAll('#effects#', mcl.playerEffectsArray(d))
            .replaceAll('#tags#', mcl.playerTagsArray(d))
            .replaceAll('#time1#', `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
            .replaceAll('#time2#', `${time.getHours()}:${time.getMinutes()}`)
            .replaceAll('#year#', time.getFullYear().toString())
            .replaceAll('#money#', mcl.getScore(d).toString())
            .replaceAll('#nametag#', d?.nameTag)

        if (f.includes('#hand#')) {
            const item = mcl.getHeldItem(d)
            if (item) {
                f = f
                    .replaceAll('#hand#', item.typeId)
            } else {
                f = f
                    .replaceAll('#hand#', 'hand')
            }
        }

        try {
            const view = d.getViewDirection()
            f = f
                .replaceAll('#viewx#', view.x.toFixed(1))
                .replaceAll('#viewy#', view.y.toFixed(1))
                .replaceAll('#viewz#', view.z.toFixed(1))
        } catch {

        }

    } else if (d instanceof Block) {
        f = f
            .replaceAll('#type#', d.typeId)
            .replaceAll('#above#', d.above()?.typeId)
            .replaceAll('#below#', d.below()?.typeId)
            .replaceAll('#north#', d.north()?.typeId)
            .replaceAll('#south#', d.south()?.typeId)
            .replaceAll('#east#', d.east()?.typeId)
            .replaceAll('#west#', d.west()?.typeId)
    }
    f = f
        .replaceAll('#location#', `${loc.x.toFixed(0)} ${loc.y.toFixed(0)} ${loc.z.toFixed(0)}`)
        .replaceAll('#locationx#', `${loc.x.toFixed(0)}`)
        .replaceAll('#locationy#', `${loc.y.toFixed(0)}`)
        .replaceAll('#locationz#', `${loc.z.toFixed(0)}`)
        .replaceAll('#tps#', mcl.jsonWGet('darkoak:tps')?.tps?.toString())
        .replaceAll('#t-seconds#', (system.currentTick / 20).toFixed(0))
        .replaceAll('#s-seconds#', mcl.jsonWGet('darkoak:sseconds')?.seconds?.toString())
        .replaceAll('#s-minutes#', mcl.jsonWGet('darkoak:sminutes')?.minutes?.toString().split('.')[0])
        .replaceAll('#players#', ap.length.toString())
        .replaceAll('#playerlist#', ap.map(e => e.name).join())
        .replaceAll('#dimension#', d?.dimension?.id)
        .replaceAll('§?', colorCodes[mcl.randomNumber(colorCodes.length)])

    if (f.includes(':')) {
        for (let index = 0; index < emojis.length; index++) {
            const e = emojis[index]
            f = f.replaceAll(e.m, e.e)
        }
    }

    while (f.includes('#{') && f.includes('}#')) {
        // try {
        //     let match = f.match(/#\{([^{}]+)\}#/)
        //     if (!match) break
        //     f = f.replace(match[0], mcl.jsonWGet(`darkoak:vars:${match[1]}`)?.value || '')
        // } catch {
        //     break
        // }

        try {
            const found = mcl.getAllContentsBetweenDelimiters(f, '#{', '}#')
            for (let index = 0; index < found.length; index++) {
                const inside = found[index]
                f = f.replace(`#{${inside}}#`, mcl.jsonWGet(`darkoak:vars:${inside}`)?.value ?? '')
            }
        } catch {
            break
        }
    }

    while (f.includes('#=') && f.includes('=#')) {
        // try {
        //     let match = f.match(/#\=([^()]+)\=#/)
        //     if (!match) break

        //     const ib = match[1]
        //     const split = ib.split('-')
        //     const min = parseInt(split[0])
        //     const max = parseInt(split[1])
        //     if (min && max) {
        //         if (min > max) {
        //             f = f.replace(match[0], 'Error: Min Is Greater Than Max')
        //         } else {
        //             f = f.replace(match[0], mcl.xorRandomNum(min, max).toString())
        //         }
        //     }
        // } catch {
        //     break
        // }

        try {
            const found = mcl.getAllContentsBetweenDelimiters(f, '#=', '=#')
            for (let index = 0; index < found.length; index++) {
                const inside = found[index]
                const split = inside.split('-')
                const min = parseInt(split[0])
                const max = parseInt(split[1])
                if (min && max) {
                    if (min > max) {
                        f = f.replace(`#=${inside}=#`, 'Error: Min Is Greater Than Max')
                    } else {
                        f = f.replace(`#=${inside}=#`, mcl.xorRandomNum(min, max).toString())
                    }
                }
            }
        } catch {
            break
        }
    }


    if ((d instanceof Entity)) {

        while (f.includes('#[') && f.includes(']#')) {
            // mcl.debugLog('replacer before', f)
            // try {
            //     let match = f.match(/#\[([^()]+)\]#/)
            //     if (!match) break

            //     mcl.debugLog('replacer mid 1', `${match[0]} | ${match[1]}`)
            //     f = f.replace(match[0], (mcl.getScoreOld(d, match[1]) || 0).toString())
            // } catch {
            //     break
            // }
            // mcl.debugLog('replacer after', f)
            try {
                const found = mcl.getAllContentsBetweenDelimiters(f, '#[', ']#')
                for (let index = 0; index < found.length; index++) {
                    const inside = found[index]
                    f = f.replace(`#[${inside}]#`, mcl.getScoreOld(d, inside).toString())
                }
            } catch {
                break
            }
        }

    }


    while (f.includes('#(') && f.includes(')#')) {
        // try {
        //     let match = f.match(/#\(([^()]+)\)#/)
        //     if (!match) break

        //     let eq = match[1]
        //     let result = Function(`return ${eq}`)()
        //     f = f.replace(match[0], result)
        // } catch {
        //     break
        // }
        try {
            const found = mcl.getAllContentsBetweenDelimiters(f, '#(', ')#')
            for (let index = 0; index < found.length; index++) {
                const inside = found[index]
                let result = Function(`return ${inside}`)
                f = f.replace(`#(${inside})#`, result)
            }
        } catch {
            break
        }
    }
    return f
}


export const dummySize = 35
export const version = '2.2.3, This Is Probably Wrong'

export const hashtags = [
    '\nKeys:',
    '\\n -> New Line',
    '#[scorename]# -> Player Score (Replace scorename With An Actual Score Name)',
    '#(math)# -> Math Equation (Replace math With A Math Equation, Allowed Values: numbers, *(multiplication), +(addition), /(division), -(subtraction), replacer hashtags)',
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
    '#playerlist# -> List Of Online Player Names',
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
    '#dot# -> Positive If Player Is Going Forward',
    '#perm# -> Permission Level',
    '#device# -> Device Type',
    '#money# -> Money Amount'
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

export const colorCodes = [
    '§1',
    '§2',
    '§3',
    '§4',
    '§5',
    '§6',
    '§7',
    '§8',
    '§9',
    '§0',
    '§q',
    '§e',
    '§r',
    '§t',
    '§u',
    '§i',
    '§o',
    '§p',
    '§a',
    '§s',
    '§d',
    '§f',
    '§g',
    '§h',
    '§j',
    '§k',
    '§l',
    '§c',
    '§v',
    '§b',
    '§n',
    '§m',
]

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
    { m: ':format:', e: '§' },
]

export const spanishToEnglish = [
    {
        spa: 'yo', eng: 'i'
    },
    {
        spa: 'hola', eng: 'hello'
    },
    {
        spa: 'libro', eng: 'book'
    },
    {
        spa: 'amigo', eng: 'friend'
    },
    {
        spa: 'diamante', eng: 'diamond'
    },
    {
        spa: 'espada', eng: 'sword'
    },
    {
        spa: 'pala', eng: 'shovel'
    },
    {
        spa: 'piqueta', eng: 'pickaxe'
    },
    {
        spa: 'armadura', eng: 'armor'
    },
    {
        spa: 'explorar', eng: 'explore'
    },
    {
        spa: 'explora', eng: 'explores'
    },
    {
        spa: 'gracias', eng: 'thank you'
    },
    {
        spa: 'bien', eng: 'good'
    },
    {
        spa: 'ella', eng: 'she'
    },
    {
        spa: 'es', eng: 'is'
    },
    {
        spa: 'gustar', eng: 'like'
    },
    {
        spa: 'gustos', eng: 'likes'
    },
    {
        spa: 'eso', eng: 'that'
    },
    {
        spa: 'buen', eng: 'good'
    },
    {
        spa: 'como', eng: 'as'
    },
    // {
    //     spa: '', eng: ''
    // },
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
export const crasherSymbol2 = ''

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
    //mcl.jsonWSet(`darkoak:playerdata:${player.name}`, mcl.playerToData(player))
}


export const modalTextTypes = [
    'label|text here',
    'header|text here',
    'toggle|text here|true|text here',
    'textfield|text here|text here|text here|text here',
    'dropdown|text here|option 1, option 2, option 3|0|text here',
    'slider|text here|1|10|1|1|text here',
    'command|text here, uses $number$ to get another ui elements value',
    'submit|text here',
    'divider',
    'Remember To Use "|" To Seperate Things, Not ":"'
].join('\n')

/**Script settings helper function, gets the default index for the color codes
 * @param {string} def 
 * @returns 
 */
export function SSColorIndex(def) {
    let index = colorCodes.findIndex(e => e === def)
    if (index < 0) index = 12
    return index
}

export const susNames = [
    '.gg/',
    'LumineProxy',
    '§"',
    '"',
    '§1§lVERTEX',
    '&',
    '\'',
    '=',
    '-',
    '_',
    '+',
    '<',
    '>',
    '..',
]
export const susNamesSet = new Set(susNames)

export const devs = [
    'Darkoakboat2121',
]

export const enchantments = [
    'protection',
    'fire_protection',
    'feather_falling',
    'blast_protection',
    'projectile_protection',
    'thorns',
    'respiration',
    'depth_strider',
    'aqua_affinity',
    'sharpness',
    'smite',
    'bane_of_arthropods',
    'knockback',
    'fire_aspect',
    'looting',
    'efficiency',
    'silk_touch',
    'unbreaking',
    'fortune',
    'power',
    'punch',
    'flame',
    'infinity',
    'luck_of_the_sea',
    'lure',
    'frost_walker',
    'mending',
    'binding',
    'vanishing',
    'impaling',
    'riptide',
    'loyalty',
    'channeling',
    'multishot',
    'piercing',
    'quick_charge',
    'soul_speed',
    'swift_sneak',
    'wind_burst',
    'density',
    'breach',
    'lunge'
]

export const itemToDamage = [
    { type: 'minecraft:wooden_sword', damage: 4 },
    { type: 'minecraft:stone_sword', damage: 5 },
    { type: 'minecraft:copper_sword', damage: 5 },
    { type: 'minecraft:iron_sword', damage: 6 },
    { type: 'minecraft:golden_sword', damage: 4 },
    { type: 'minecraft:diamond_sword', damage: 7 },
    { type: 'minecraft:netherite_sword', damage: 8 },
]

export const particles = [
    'arrow_spell_emitter',
    'balloon_gas_particle',
    'basic_bubble_particle',
    'basic_bubble_particle_manual',
    'basic_crit_particle',
    'basic_flame_particle',
    'basic_portal_particle',
    'basic_smoke_particle',
    'biome_tinted_leaves_particle',
    'bleach',
    'block_destruct',
    'block_slide',
    'blue_flame_particle',
    'breaking_item_icon',
    'breaking_item_terrain',
    'bubble_column_bubble',
    'bubble_column_down_particle',
    'bubble_column_up_particle',
    'campfire_smoke_particle',
    'campfire_tall_smoke_particle',
    'candle_flame_particle',
    'cauldron_bubble_particle',
    'cauldron_explosion_emitter',
    'cauldron_spell_emitter',
    'cherry_leaves_particle',
    'colored_flame_particle',
    'conduit_absorb_particle',
    'conduit_attack_emitter',
    'conduit_particle',
    'critical_hit_emitter',
    'crop_growth_area_emitter',
    'crop_growth_emitter',
    'death_explosion_emitter',
    'dolphin_move_particle',
    'dragon_breath_fire',
    'dragon_breath_lingering',
    'dragon_breath_trail',
    'dragon_death_explosion_emitter',
    'dragon_destroy_block',
    'dragon_dying_explosion',
    'dust_plume',
    'electric_spark_particle',
    'enchanting_table_particle',
    'end_chest',
    'endrod',
    'evoker_spell',
    'explosion_particle',
    'eye_of_ender_bubble_particle',
    'falling_border_dust_particle',
    'falling_dust',
    'falling_dust_concrete_powder_particle',
    'falling_dust_dragon_egg_particle',
    'falling_dust_gravel_particle',
    'falling_dust_red_sand_particle',
    'falling_dust_sand_particle',
    'falling_dust_scaffolding_particle',
    'falling_dust_top_snow_particle',
    'firefly_particle',
    'fish_hook_particle',
    'fish_pos_particle',
    'glow_particle',
    'green_flame_particle',
    'guardian_attack_particle',
    'guardian_water_move_particle',
    'heart_particle',
    'honey_drip_particle',
    'huge_explosion_emitter',
    'ice_evaporation_emitter',
    'infested_ambient',
    'infested_emitter',
    'ink_emitter',
    'knockback_roar_particle',
    'lava_drip_particle',
    'lava_particle',
    'llama_spit_smoke',
    'magical_critical_hit_emitter',
    'mob_block_spawn_emitter',
    'mob_portal',
    'mobflame_emitter',
    'mobflame_single',
    'mobspell_ambient',
    'mobspell_emitter',
    'mycelium_dust_particle',
    'nectar_drip_particle',
    'note_particle',
    'obsidian_glow_dust_particle',
    'obsidian_tear_particle',
    'ominous_spawning_particle',
    'oozing_ambient',
    'oozing_emitter',
    'pale_oak_leaves_particle',
    'phantom_trail_particle',
    'portal_directional',
    'portal_reverse_particle',
    'raid_omen_ambient',
    'raid_omen_emitter',
    'rain_splash_particle',
    'redstone_ore_dust_particle',
    'redstone_repeater_dust_particle',
    'redstone_torch_dust_particle',
    'redstone_wire_dust_particle',
    'rising_border_dust_particle',
    'sculk_charge_particle',
    'sculk_charge_pop_particle',
    'sculk_sensor_redstone_particle',
    'sculk_soul_particle',
    'shriek_particle',
    'shulker_bullet',
    'silverfish_grief_emitter',
    'small_flame_particle',
    'snowflake_particle',
    'sonic_explosion',
    'soul_particle',
    'spore_blossom_ambient_particle',
    'spore_blossom_shower_particle',
    'stalactite_lava_drip_particle',
    'stalactite_water_drip_particle',
    'totem_particle',
    'underwater_torch_particle',
    'villager_angry',
    'villager_happy',
    'water_drip_particle',
    'water_evaporation_actor_emitter',
    'water_evaporation_bucket_emitter',
    'water_splash_particle',
    'water_wake_particle',
    'wax_particle',
    'white_smoke_particle',
    'witchspell_emitter',
    'wither_boss_invulnerable'
]

export const sounds = [
    'ambient.basalt_deltas.additions',
    'ambient.basalt_deltas.loop',
    'ambient.basalt_deltas.mood',
    'ambient.candle',
    'ambient.cave',
    'ambient.crimson_forest.additions',
    'ambient.crimson_forest.loop',
    'ambient.crimson_forest.mood',
    'ambient.nether_wastes.additions',
    'ambient.nether_wastes.loop',
    'ambient.nether_wastes.mood',
    'ambient.soulsand_valley.additions',
    'ambient.soulsand_valley.loop',
    'ambient.soulsand_valley.mood',
    'ambient.underwater.enter',
    'ambient.underwater.exit',
    'ambient.warped_forest.additions',
    'ambient.warped_forest.loop',
    'ambient.warped_forest.mood',
    'ambient.weather.lightning.impact',
    'ambient.weather.rain',
    'ambient.weather.thunder',
    'armor.equip_chain',
    'armor.equip_diamond',
    'armor.equip_generic',
    'armor.equip_gold',
    'armor.equip_iron',
    'armor.equip_leather',
    'armor.equip_netherite',
    'beacon.activate',
    'beacon.ambient',
    'beacon.deactivate',
    'beacon.power',
    'block.bamboo_sapling.break',
    'block.bamboo_sapling.place',
    'block.bamboo.break',
    'block.bamboo.fall',
    'block.bamboo.hit',
    'block.bamboo.place',
    'block.bamboo.step',
    'block.barrel.close',
    'block.barrel.open',
    'block.beehive.drip',
    'block.beehive.enter',
    'block.beehive.exit',
    'block.beehive.shear',
    'block.beehive.work',
    'block.bell.hit',
    'block.blastfurnace.fire_crackle',
    'block.bowhit',
    'block.campfire.crackle',
    'block.cartography_table.use',
    'block.chorusflower.death',
    'block.chorusflower.grow',
    'block.click',
    'block.composter.empty',
    'block.composter.fill',
    'block.composter.fill_success',
    'block.composter.ready',
    'block.enchanting_table.use',
    'block.end_portal_frame.fill',
    'block.end_portal.spawn',
    'block.false_permissions',
    'block.furnace.lit',
    'block.grindstone.use',
    'block.itemframe.add_item',
    'block.itemframe.break',
    'block.itemframe.place',
    'block.itemframe.remove_item',
    'block.itemframe.rotate_item',
    'block.lantern.break',
    'block.lantern.fall',
    'block.lantern.hit',
    'block.lantern.place',
    'block.lantern.step',
    'block.loom.use',
    'block.mangrove_roots.break',
    'block.mangrove_roots.fall',
    'block.mangrove_roots.hit',
    'block.mangrove_roots.place',
    'block.mangrove_roots.step',
    'block.mud_bricks.break',
    'block.mud_bricks.fall',
    'block.mud_bricks.hit',
    'block.mud_bricks.place',
    'block.mud_bricks.step',
    'block.mud.break',
    'block.mud.fall',
    'block.mud.hit',
    'block.mud.place',
    'block.mud.step',
    'block.muddy_mangrove_roots.break',
    'block.muddy_mangrove_roots.fall',
    'block.muddy_mangrove_roots.hit',
    'block.muddy_mangrove_roots.place',
    'block.muddy_mangrove_roots.step',
    'block.packed_mud.break',
    'block.packed_mud.fall',
    'block.packed_mud.hit',
    'block.packed_mud.place',
    'block.packed_mud.step',
    'block.scaffolding.break',
    'block.scaffolding.climb',
    'block.scaffolding.fall',
    'block.scaffolding.hit',
    'block.scaffolding.place',
    'block.scaffolding.step',
    'block.sign.waxed_interact_fail',
    'block.smoker.smoke',
    'block.sniffer_egg.crack',
    'block.sniffer_egg.hatch',
    'block.stonecutter.use',
    'block.sweet_berry_bush.break',
    'block.sweet_berry_bush.hurt',
    'block.sweet_berry_bush.pick',
    'block.sweet_berry_bush.place',
    'block.turtle_egg.break',
    'block.turtle_egg.crack',
    'block.turtle_egg.drop',
    'bloom.sculk_catalyst',
    'bottle.dragonbreath',
    'break.amethyst_block',
    'break.amethyst_cluster',
    'break.azalea',
    'break.bamboo_wood',
    'break.bamboo_wood_hanging_sign',
    'break.big_dripleaf',
    'break.calcite',
    'break.cherry_leaves',
    'break.cherry_wood',
    'break.cherry_wood_hanging_sign',
    'break.chiseled_bookshelf',
    'break.decorated_pot',
    'break.dirt_with_roots',
    'break.dripstone_block',
    'break.frog_spawn',
    'break.froglight',
    'break.hanging_roots',
    'break.hanging_sign',
    'break.large_amethyst_bud',
    'break.medium_amethyst_bud',
    'break.nether_wood',
    'break.nether_wood_hanging_sign',
    'break.pink_petals',
    'break.pointed_dripstone',
    'break.sculk',
    'break.sculk_catalyst',
    'break.sculk_sensor',
    'break.sculk_shrieker',
    'break.sculk_vein',
    'break.small_amethyst_bud',
    'break.spore_blossom',
    'break.suspicious_gravel',
    'break.suspicious_sand',
    'break.tuff',
    'brush_completed.suspicious_gravel',
    'brush_completed.suspicious_sand',
    'brush.generic',
    'brush.suspicious_gravel',
    'brush.suspicious_sand',
    'bubble.down',
    'bubble.downinside',
    'bubble.pop',
    'bubble.up',
    'bubble.upinside',
    'bucket.empty_fish',
    'bucket.empty_lava',
    'bucket.empty_powder_snow',
    'bucket.empty_water',
    'bucket.fill_fish',
    'bucket.fill_lava',
    'bucket.fill_powder_snow',
    'bucket.fill_water',
    'cake.add_candle',
    'camera.take_picture',
    'cauldron_drip.lava.pointed_dripstone',
    'cauldron_drip.water.pointed_dripstone',
    'cauldron.adddye',
    'cauldron.cleanarmor',
    'cauldron.cleanbanner',
    'cauldron.dyearmor',
    'cauldron.explode',
    'cauldron.fillpotion',
    'cauldron.fillwater',
    'cauldron.takepotion',
    'cauldron.takewater',
    'charge.sculk',
    'chime.amethyst_block',
    'click_off.bamboo_wood_button',
    'click_off.bamboo_wood_pressure_plate',
    'click_off.cherry_wood_button',
    'click_off.cherry_wood_pressure_plate',
    'click_off.metal_pressure_plate',
    'click_off.nether_wood_button',
    'click_off.nether_wood_pressure_plate',
    'click_off.stone_pressure_plate',
    'click_off.wooden_pressure_plate',
    'click_on.bamboo_wood_button',
    'click_on.bamboo_wood_pressure_plate',
    'click_on.cherry_wood_button',
    'click_on.cherry_wood_pressure_plate',
    'click_on.metal_pressure_plate',
    'click_on.nether_wood_button',
    'click_on.nether_wood_pressure_plate',
    'click_on.stone_pressure_plate',
    'click_on.wooden_pressure_plate',
    'close.bamboo_wood_door',
    'close.bamboo_wood_fence_gate',
    'close.bamboo_wood_trapdoor',
    'close.cherry_wood_door',
    'close.cherry_wood_fence_gate',
    'close.cherry_wood_trapdoor',
    'close.fence_gate',
    'close.iron_door',
    'close.iron_trapdoor',
    'close.nether_wood_door',
    'close.nether_wood_fence_gate',
    'close.nether_wood_trapdoor',
    'close.wooden_door',
    'close.wooden_trapdoor',
    'component.jump_to_block',
    'conduit.activate',
    'conduit.ambient',
    'conduit.attack',
    'conduit.deactivate',
    'conduit.short',
    'copper.wax.off',
    'copper.wax.on',
    'crossbow.loading.end',
    'crossbow.loading.middle',
    'crossbow.loading.start',
    'crossbow.quick_charge.end',
    'crossbow.quick_charge.middle',
    'crossbow.quick_charge.start',
    'crossbow.shoot',
    'damage.fallbig',
    'damage.fallsmall',
    'damage.thorns',
    'dig.ancient_debris',
    'dig.azalea_leaves',
    'dig.basalt',
    'dig.bone_block',
    'dig.candle',
    'dig.cave_vines',
    'dig.chain',
    'dig.cloth',
    'dig.copper',
    'dig.coral',
    'dig.deepslate',
    'dig.deepslate_bricks',
    'dig.fungus',
    'dig.grass',
    'dig.gravel',
    'dig.honey_block',
    'dig.lodestone',
    'dig.moss',
    'dig.nether_brick',
    'dig.nether_gold_ore',
    'dig.nether_sprouts',
    'dig.nether_wart',
    'dig.netherite',
    'dig.netherrack',
    'dig.nylium',
    'dig.powder_snow',
    'dig.roots',
    'dig.sand',
    'dig.shroomlight',
    'dig.snow',
    'dig.soul_sand',
    'dig.soul_soil',
    'dig.stem',
    'dig.stone',
    'dig.vines',
    'dig.wood',
    'drip.lava.pointed_dripstone',
    'drip.water.pointed_dripstone',
    'elytra.loop',
    'entity.zombie.converted_to_drowned',
    'extinguish.candle',
    'fall.amethyst_block',
    'fall.amethyst_cluster',
    'fall.ancient_debris',
    'fall.azalea',
    'fall.azalea_leaves',
    'fall.bamboo_wood',
    'fall.basalt',
    'fall.big_dripleaf',
    'fall.bone_block',
    'fall.calcite',
    'fall.cave_vines',
    'fall.chain',
    'fall.cherry_leaves',
    'fall.cherry_wood',
    'fall.cloth',
    'fall.copper',
    'fall.coral',
    'fall.deepslate',
    'fall.deepslate_bricks',
    'fall.dirt_with_roots',
    'fall.dripstone_block',
    'fall.egg',
    'fall.grass',
    'fall.gravel',
    'fall.hanging_roots',
    'fall.honey_block',
    'fall.ladder',
    'fall.moss',
    'fall.nether_brick',
    'fall.nether_gold_ore',
    'fall.nether_sprouts',
    'fall.nether_wart',
    'fall.nether_wood',
    'fall.netherite',
    'fall.netherrack',
    'fall.nylium',
    'fall.pink_petals',
    'fall.pointed_dripstone',
    'fall.powder_snow',
    'fall.roots',
    'fall.sand',
    'fall.sculk_sensor',
    'fall.sculk_shrieker',
    'fall.shroomlight',
    'fall.slime',
    'fall.snow',
    'fall.soul_sand',
    'fall.soul_soil',
    'fall.spore_blossom',
    'fall.stem',
    'fall.stone',
    'fall.tuff',
    'fall.vines',
    'fall.wood',
    'fire.fire',
    'fire.ignite',
    'firework.blast',
    'firework.large_blast',
    'firework.launch',
    'firework.shoot',
    'firework.twinkle',
    'game.player.attack.nodamage',
    'game.player.attack.strong',
    'game.player.die',
    'game.player.hurt',
    'hatch.frog_spawn',
    'hit.amethyst_block',
    'hit.amethyst_cluster',
    'hit.ancient_debris',
    'hit.anvil',
    'hit.azalea',
    'hit.azalea_leaves',
    'hit.bamboo_wood',
    'hit.basalt',
    'hit.big_dripleaf',
    'hit.bone_block',
    'hit.calcite',
    'hit.candle',
    'hit.cave_vines',
    'hit.chain',
    'hit.cherry_leaves',
    'hit.cherry_wood',
    'hit.chiseled_bookshelf',
    'hit.cloth',
    'hit.copper',
    'hit.coral',
    'hit.deepslate',
    'hit.deepslate_bricks',
    'hit.dirt_with_roots',
    'hit.dripstone_block',
    'hit.grass',
    'hit.gravel',
    'hit.hanging_roots',
    'hit.honey_block',
    'hit.ladder',
    'hit.moss',
    'hit.nether_brick',
    'hit.nether_gold_ore',
    'hit.nether_sprouts',
    'hit.nether_wart',
    'hit.nether_wood',
    'hit.netherite',
    'hit.netherrack',
    'hit.nylium',
    'hit.pink_petals',
    'hit.pointed_dripstone',
    'hit.powder_snow',
    'hit.roots',
    'hit.sand',
    'hit.sculk',
    'hit.sculk_catalyst',
    'hit.sculk_sensor',
    'hit.sculk_shrieker',
    'hit.shroomlight',
    'hit.slime',
    'hit.snow',
    'hit.soul_sand',
    'hit.soul_soil',
    'hit.spore_blossom',
    'hit.stem',
    'hit.stone',
    'hit.suspicious_gravel',
    'hit.suspicious_sand',
    'hit.tuff',
    'hit.vines',
    'hit.wood',
    'horn.call.0',
    'horn.call.1',
    'horn.call.2',
    'horn.call.3',
    'horn.call.4',
    'horn.call.5',
    'horn.call.6',
    'horn.call.7',
    'insert_enchanted.chiseled_bookshelf',
    'insert.chiseled_bookshelf',
    'item.bone_meal.use',
    'item.book.page_turn',
    'item.book.put',
    'item.shield.block',
    'item.spyglass.stop_using',
    'item.spyglass.use',
    'item.trident.hit',
    'item.trident.hit_ground',
    'item.trident.return',
    'item.trident.riptide_1',
    'item.trident.riptide_2',
    'item.trident.riptide_3',
    'item.trident.throw',
    'item.trident.thunder',
    'jump.ancient_debris',
    'jump.azalea',
    'jump.basalt',
    'jump.big_dripleaf',
    'jump.bone_block',
    'jump.cave_vines',
    'jump.chain',
    'jump.cloth',
    'jump.coral',
    'jump.deepslate',
    'jump.deepslate_bricks',
    'jump.dirt_with_roots',
    'jump.dripstone_block',
    'jump.grass',
    'jump.gravel',
    'jump.hanging_roots',
    'jump.honey_block',
    'jump.moss',
    'jump.nether_brick',
    'jump.nether_gold_ore',
    'jump.nether_sprouts',
    'jump.nether_wart',
    'jump.netherite',
    'jump.netherrack',
    'jump.nylium',
    'jump.pointed_dripstone',
    'jump.roots',
    'jump.sand',
    'jump.sculk_sensor',
    'jump.shroomlight',
    'jump.slime',
    'jump.snow',
    'jump.soul_sand',
    'jump.soul_soil',
    'jump.spore_blossom',
    'jump.stem',
    'jump.stone',
    'jump.vines',
    'jump.wood',
    'land.ancient_debris',
    'land.azalea',
    'land.basalt',
    'land.big_dripleaf',
    'land.bone_block',
    'land.cave_vines',
    'land.chain',
    'land.cloth',
    'land.coral',
    'land.deepslate',
    'land.deepslate_bricks',
    'land.dirt_with_roots',
    'land.dripstone_block',
    'land.grass',
    'land.gravel',
    'land.hanging_roots',
    'land.honey_block',
    'land.moss',
    'land.nether_brick',
    'land.nether_gold_ore',
    'land.nether_sprouts',
    'land.nether_wart',
    'land.netherite',
    'land.netherrack',
    'land.nylium',
    'land.pointed_dripstone',
    'land.roots',
    'land.sand',
    'land.sculk_sensor',
    'land.shroomlight',
    'land.slime',
    'land.snow',
    'land.soul_sand',
    'land.soul_soil',
    'land.spore_blossom',
    'land.stem',
    'land.stone',
    'land.vines',
    'land.wood',
    'leashknot.break',
    'leashknot.place',
    'liquid.lava',
    'liquid.lavapop',
    'liquid.water',
    'lodestone_compass.link_compass_to_lodestone',
    'minecart.base',
    'minecart.inside',
    'mob.agent.spawn',
    'mob.allay.death',
    'mob.allay.hurt',
    'mob.allay.idle',
    'mob.allay.idle_holding',
    'mob.allay.item_given',
    'mob.allay.item_taken',
    'mob.allay.item_thrown',
    'mob.armor_stand.break',
    'mob.armor_stand.hit',
    'mob.armor_stand.land',
    'mob.armor_stand.place',
    'mob.axolotl.attack',
    'mob.axolotl.death',
    'mob.axolotl.hurt',
    'mob.axolotl.idle',
    'mob.axolotl.idle_water',
    'mob.axolotl.splash',
    'mob.axolotl.swim',
    'mob.bat.death',
    'mob.bat.hurt',
    'mob.bat.idle',
    'mob.bat.takeoff',
    'mob.bee.aggressive',
    'mob.bee.death',
    'mob.bee.hurt',
    'mob.bee.loop',
    'mob.bee.pollinate',
    'mob.bee.sting',
    'mob.blaze.breathe',
    'mob.blaze.death',
    'mob.blaze.hit',
    'mob.blaze.shoot',
    'mob.camel.ambient',
    'mob.camel.dash',
    'mob.camel.dash_ready',
    'mob.camel.death',
    'mob.camel.eat',
    'mob.camel.hurt',
    'mob.camel.sit',
    'mob.camel.stand',
    'mob.camel.step',
    'mob.camel.step_sand',
    'mob.cat.beg',
    'mob.cat.eat',
    'mob.cat.hiss',
    'mob.cat.hit',
    'mob.cat.meow',
    'mob.cat.purr',
    'mob.cat.purreow',
    'mob.cat.straymeow',
    'mob.chicken.hurt',
    'mob.chicken.plop',
    'mob.chicken.say',
    'mob.chicken.step',
    'mob.cow.hurt',
    'mob.cow.milk',
    'mob.cow.say',
    'mob.cow.step',
    'mob.creeper.death',
    'mob.creeper.say',
    'mob.dolphin.attack',
    'mob.dolphin.blowhole',
    'mob.dolphin.death',
    'mob.dolphin.eat',
    'mob.dolphin.hurt',
    'mob.dolphin.idle',
    'mob.dolphin.idle_water',
    'mob.dolphin.jump',
    'mob.dolphin.play',
    'mob.dolphin.splash',
    'mob.dolphin.swim',
    'mob.drowned.death',
    'mob.drowned.death_water',
    'mob.drowned.hurt',
    'mob.drowned.hurt_water',
    'mob.drowned.say',
    'mob.drowned.say_water',
    'mob.drowned.shoot',
    'mob.drowned.step',
    'mob.drowned.swim',
    'mob.elderguardian.curse',
    'mob.elderguardian.death',
    'mob.elderguardian.hit',
    'mob.elderguardian.idle',
    'mob.enderdragon.death',
    'mob.enderdragon.flap',
    'mob.enderdragon.growl',
    'mob.enderdragon.hit',
    'mob.endermen.death',
    'mob.endermen.hit',
    'mob.endermen.idle',
    'mob.endermen.portal',
    'mob.endermen.scream',
    'mob.endermen.stare',
    'mob.endermite.hit',
    'mob.endermite.kill',
    'mob.endermite.say',
    'mob.endermite.step',
    'mob.evocation_fangs.attack',
    'mob.evocation_illager.ambient',
    'mob.evocation_illager.cast_spell',
    'mob.evocation_illager.celebrate',
    'mob.evocation_illager.death',
    'mob.evocation_illager.hurt',
    'mob.evocation_illager.prepare_attack',
    'mob.evocation_illager.prepare_summon',
    'mob.evocation_illager.prepare_wololo',
    'mob.fish.flop',
    'mob.fish.hurt',
    'mob.fish.step',
    'mob.fox.aggro',
    'mob.fox.ambient',
    'mob.fox.bite',
    'mob.fox.death',
    'mob.fox.eat',
    'mob.fox.hurt',
    'mob.fox.screech',
    'mob.fox.sleep',
    'mob.fox.sniff',
    'mob.fox.spit',
    'mob.frog.ambient',
    'mob.frog.death',
    'mob.frog.eat',
    'mob.frog.hurt',
    'mob.frog.jump_to_block',
    'mob.frog.lay_spawn',
    'mob.frog.step',
    'mob.frog.tongue',
    'mob.ghast.affectionate_scream',
    'mob.ghast.charge',
    'mob.ghast.death',
    'mob.ghast.fireball',
    'mob.ghast.moan',
    'mob.ghast.scream',
    'mob.glow_squid.ambient',
    'mob.glow_squid.death',
    'mob.glow_squid.hurt',
    'mob.glow_squid.ink_squirt',
    'mob.goat.ambient',
    'mob.goat.ambient.screamer',
    'mob.goat.death',
    'mob.goat.death.screamer',
    'mob.goat.eat',
    'mob.goat.horn_break',
    'mob.goat.hurt',
    'mob.goat.hurt.screamer',
    'mob.goat.milk.screamer',
    'mob.goat.prepare_ram',
    'mob.goat.prepare_ram.screamer',
    'mob.goat.ram_impact',
    'mob.goat.ram_impact.screamer',
    'mob.goat.step',
    'mob.guardian.ambient',
    'mob.guardian.attack_loop',
    'mob.guardian.death',
    'mob.guardian.flop',
    'mob.guardian.hit',
    'mob.guardian.land_death',
    'mob.guardian.land_hit',
    'mob.guardian.land_idle',
    'mob.hoglin.ambient',
    'mob.hoglin.angry',
    'mob.hoglin.attack',
    'mob.hoglin.converted_to_zombified',
    'mob.hoglin.death',
    'mob.hoglin.howl',
    'mob.hoglin.hurt',
    'mob.hoglin.retreat',
    'mob.hoglin.step',
    'mob.horse.angry',
    'mob.horse.armor',
    'mob.horse.breathe',
    'mob.horse.death',
    'mob.horse.donkey.angry',
    'mob.horse.donkey.death',
    'mob.horse.donkey.hit',
    'mob.horse.donkey.idle',
    'mob.horse.eat',
    'mob.horse.gallop',
    'mob.horse.hit',
    'mob.horse.idle',
    'mob.horse.jump',
    'mob.horse.land',
    'mob.horse.leather',
    'mob.horse.skeleton.death',
    'mob.horse.skeleton.hit',
    'mob.horse.skeleton.idle',
    'mob.horse.soft',
    'mob.horse.wood',
    'mob.horse.zombie.death',
    'mob.horse.zombie.hit',
    'mob.horse.zombie.idle',
    'mob.husk.ambient',
    'mob.husk.convert_to_zombie',
    'mob.husk.death',
    'mob.husk.hurt',
    'mob.husk.step',
    'mob.irongolem.crack',
    'mob.irongolem.death',
    'mob.irongolem.hit',
    'mob.irongolem.repair',
    'mob.irongolem.throw',
    'mob.irongolem.walk',
    'mob.llama.angry',
    'mob.llama.death',
    'mob.llama.eat',
    'mob.llama.hurt',
    'mob.llama.idle',
    'mob.llama.spit',
    'mob.llama.step',
    'mob.llama.swag',
    'mob.magmacube.big',
    'mob.magmacube.jump',
    'mob.magmacube.small',
    'mob.mooshroom.convert',
    'mob.mooshroom.eat',
    'mob.mooshroom.suspicious_milk',
    'mob.ocelot.death',
    'mob.ocelot.idle',
    'mob.panda_baby.idle',
    'mob.panda.bite',
    'mob.panda.cant_breed',
    'mob.panda.death',
    'mob.panda.eat',
    'mob.panda.hurt',
    'mob.panda.idle',
    'mob.panda.idle.aggressive',
    'mob.panda.idle.worried',
    'mob.panda.presneeze',
    'mob.panda.sneeze',
    'mob.panda.step',
    'mob.parrot.death',
    'mob.parrot.eat',
    'mob.parrot.fly',
    'mob.parrot.hurt',
    'mob.parrot.idle',
    'mob.parrot.step',
    'mob.phantom.bite',
    'mob.phantom.death',
    'mob.phantom.flap',
    'mob.phantom.hurt',
    'mob.phantom.idle',
    'mob.phantom.swoop',
    'mob.pig.boost',
    'mob.pig.death',
    'mob.pig.say',
    'mob.pig.step',
    'mob.piglin_brute.ambient',
    'mob.piglin_brute.angry',
    'mob.piglin_brute.converted_to_zombified',
    'mob.piglin_brute.death',
    'mob.piglin_brute.hurt',
    'mob.piglin_brute.step',
    'mob.piglin.admiring_item',
    'mob.piglin.ambient',
    'mob.piglin.angry',
    'mob.piglin.celebrate',
    'mob.piglin.converted_to_zombified',
    'mob.piglin.death',
    'mob.piglin.hurt',
    'mob.piglin.jealous',
    'mob.piglin.retreat',
    'mob.piglin.step',
    'mob.pillager.celebrate',
    'mob.pillager.death',
    'mob.pillager.hurt',
    'mob.pillager.idle',
    'mob.player.hurt_drown',
    'mob.player.hurt_freeze',
    'mob.player.hurt_on_fire',
    'mob.polarbear_baby.idle',
    'mob.polarbear.death',
    'mob.polarbear.hurt',
    'mob.polarbear.idle',
    'mob.polarbear.step',
    'mob.polarbear.warning',
    'mob.rabbit.death',
    'mob.rabbit.hop',
    'mob.rabbit.hurt',
    'mob.rabbit.idle',
    'mob.ravager.ambient',
    'mob.ravager.bite',
    'mob.ravager.celebrate',
    'mob.ravager.death',
    'mob.ravager.hurt',
    'mob.ravager.roar',
    'mob.ravager.step',
    'mob.ravager.stun',
    'mob.sheep.say',
    'mob.sheep.shear',
    'mob.sheep.step',
    'mob.shulker.ambient',
    'mob.shulker.bullet.hit',
    'mob.shulker.close',
    'mob.shulker.close.hurt',
    'mob.shulker.death',
    'mob.shulker.hurt',
    'mob.shulker.open',
    'mob.shulker.shoot',
    'mob.shulker.teleport',
    'mob.silverfish.hit',
    'mob.silverfish.kill',
    'mob.silverfish.say',
    'mob.silverfish.step',
    'mob.skeleton.convert_to_stray',
    'mob.skeleton.death',
    'mob.skeleton.hurt',
    'mob.skeleton.say',
    'mob.skeleton.step',
    'mob.slime.attack',
    'mob.slime.big',
    'mob.slime.death',
    'mob.slime.hurt',
    'mob.slime.jump',
    'mob.slime.small',
    'mob.slime.squish',
    'mob.sniffer.death',
    'mob.sniffer.digging',
    'mob.sniffer.drop_seed',
    'mob.sniffer.eat',
    'mob.sniffer.happy',
    'mob.sniffer.hurt',
    'mob.sniffer.idle',
    'mob.sniffer.long_sniff',
    'mob.sniffer.plop',
    'mob.sniffer.searching',
    'mob.sniffer.sniffsniff',
    'mob.sniffer.stand_up',
    'mob.sniffer.step',
    'mob.snowgolem.death',
    'mob.snowgolem.hurt',
    'mob.snowgolem.shoot',
    'mob.spider.death',
    'mob.spider.say',
    'mob.spider.step',
    'mob.squid.ambient',
    'mob.squid.death',
    'mob.squid.hurt',
    'mob.squid.ink_squirt',
    'mob.stray.ambient',
    'mob.stray.death',
    'mob.stray.hurt',
    'mob.stray.step',
    'mob.strider.death',
    'mob.strider.eat',
    'mob.strider.hurt',
    'mob.strider.idle',
    'mob.strider.panic',
    'mob.strider.step',
    'mob.strider.step_lava',
    'mob.strider.tempt',
    'mob.tadpole.convert_to_frog',
    'mob.tadpole.death',
    'mob.tadpole.hurt',
    'mob.turtle_baby.born',
    'mob.turtle_baby.death',
    'mob.turtle_baby.hurt',
    'mob.turtle_baby.step',
    'mob.turtle.ambient',
    'mob.turtle.death',
    'mob.turtle.hurt',
    'mob.turtle.step',
    'mob.turtle.swim',
    'mob.vex.ambient',
    'mob.vex.charge',
    'mob.vex.death',
    'mob.vex.hurt',
    'mob.villager.death',
    'mob.villager.haggle',
    'mob.villager.hit',
    'mob.villager.idle',
    'mob.villager.no',
    'mob.villager.yes',
    'mob.vindicator.celebrate',
    'mob.vindicator.death',
    'mob.vindicator.hurt',
    'mob.vindicator.idle',
    'mob.wanderingtrader.death',
    'mob.wanderingtrader.disappeared',
    'mob.wanderingtrader.drink_milk',
    'mob.wanderingtrader.drink_potion',
    'mob.wanderingtrader.haggle',
    'mob.wanderingtrader.hurt',
    'mob.wanderingtrader.idle',
    'mob.wanderingtrader.no',
    'mob.wanderingtrader.reappeared',
    'mob.wanderingtrader.yes',
    'mob.warden.agitated',
    'mob.warden.angry',
    'mob.warden.attack',
    'mob.warden.clicking',
    'mob.warden.death',
    'mob.warden.dig',
    'mob.warden.emerge',
    'mob.warden.heartbeat',
    'mob.warden.hurt',
    'mob.warden.idle',
    'mob.warden.listening',
    'mob.warden.listening_angry',
    'mob.warden.nearby_close',
    'mob.warden.nearby_closer',
    'mob.warden.nearby_closest',
    'mob.warden.roar',
    'mob.warden.sniff',
    'mob.warden.sonic_boom',
    'mob.warden.sonic_charge',
    'mob.warden.step',
    'mob.witch.ambient',
    'mob.witch.celebrate',
    'mob.witch.death',
    'mob.witch.drink',
    'mob.witch.hurt',
    'mob.witch.throw',
    'mob.wither.ambient',
    'mob.wither.break_block',
    'mob.wither.death',
    'mob.wither.hurt',
    'mob.wither.shoot',
    'mob.wither.spawn',
    'mob.wolf.bark',
    'mob.wolf.death',
    'mob.wolf.growl',
    'mob.wolf.hurt',
    'mob.wolf.panting',
    'mob.wolf.shake',
    'mob.wolf.step',
    'mob.wolf.whine',
    'mob.zoglin.angry',
    'mob.zoglin.attack',
    'mob.zoglin.death',
    'mob.zoglin.hurt',
    'mob.zoglin.idle',
    'mob.zoglin.step',
    'mob.zombie_villager.death',
    'mob.zombie_villager.hurt',
    'mob.zombie_villager.say',
    'mob.zombie.death',
    'mob.zombie.hurt',
    'mob.zombie.remedy',
    'mob.zombie.say',
    'mob.zombie.step',
    'mob.zombie.unfect',
    'mob.zombie.wood',
    'mob.zombie.woodbreak',
    'mob.zombiepig.zpig',
    'mob.zombiepig.zpigangry',
    'mob.zombiepig.zpigdeath',
    'mob.zombiepig.zpighurt',
    'music.game',
    'music.game_and_wild_equal_chance',
    'music.game_and_wild_favor_game',
    'music.game.basalt_deltas',
    'music.game.creative',
    'music.game.credits',
    'music.game.crimson_forest',
    'music.game.deep_dark',
    'music.game.dripstone_caves',
    'music.game.end',
    'music.game.endboss',
    'music.game.frozen_peaks',
    'music.game.grove',
    'music.game.jagged_peaks',
    'music.game.lush_caves',
    'music.game.meadow',
    'music.game.nether',
    'music.game.nether_wastes',
    'music.game.snowy_slopes',
    'music.game.soul_sand_valley',
    'music.game.soulsand_valley',
    'music.game.stony_peaks',
    'music.game.swamp_music',
    'music.game.warped_forest',
    'music.game.water',
    'music.menu',
    'music.overworld.bamboo_jungle',
    'music.overworld.cherry_grove',
    'music.overworld.desert',
    'music.overworld.flower_forest',
    'music.overworld.jungle',
    'music.overworld.jungle_edge',
    'music.overworld.mesa',
    'note.banjo',
    'note.bass',
    'note.bassattack',
    'note.bd',
    'note.bell',
    'note.bit',
    'note.chime',
    'note.cow_bell',
    'note.creeper',
    'note.didgeridoo',
    'note.enderdragon',
    'note.flute',
    'note.guitar',
    'note.harp',
    'note.hat',
    'note.iron_xylophone',
    'note.piglin',
    'note.pling',
    'note.skeleton',
    'note.snare',
    'note.witherskeleton',
    'note.xylophone',
    'note.zombie',
    'open.bamboo_wood_door',
    'open.bamboo_wood_fence_gate',
    'open.bamboo_wood_trapdoor',
    'open.cherry_wood_door',
    'open.cherry_wood_fence_gate',
    'open.cherry_wood_trapdoor',
    'open.fence_gate',
    'open.iron_door',
    'open.iron_trapdoor',
    'open.nether_wood_door',
    'open.nether_wood_fence_gate',
    'open.nether_wood_trapdoor',
    'open.wooden_door',
    'open.wooden_trapdoor',
    'particle.soul_escape',
    'pick_berries.cave_vines',
    'pickup_enchanted.chiseled_bookshelf',
    'pickup.chiseled_bookshelf',
    'place.amethyst_block',
    'place.amethyst_cluster',
    'place.azalea',
    'place.azalea_leaves',
    'place.bamboo_wood',
    'place.big_dripleaf',
    'place.calcite',
    'place.cherry_leaves',
    'place.cherry_wood',
    'place.chiseled_bookshelf',
    'place.copper',
    'place.deepslate',
    'place.deepslate_bricks',
    'place.dirt_with_roots',
    'place.dripstone_block',
    'place.hanging_roots',
    'place.large_amethyst_bud',
    'place.medium_amethyst_bud',
    'place.moss',
    'place.nether_wood',
    'place.pink_petals',
    'place.pointed_dripstone',
    'place.powder_snow',
    'place.sculk',
    'place.sculk_catalyst',
    'place.sculk_sensor',
    'place.sculk_shrieker',
    'place.small_amethyst_bud',
    'place.spore_blossom',
    'place.suspicious_gravel',
    'place.suspicious_sand',
    'place.tuff',
    'portal.portal',
    'portal.travel',
    'portal.trigger',
    'power.off.sculk_sensor',
    'power.on.sculk_sensor',
    'pumpkin.carve',
    'raid.horn',
    'random.anvil_break',
    'random.anvil_land',
    'random.anvil_use',
    'random.bow',
    'random.bowhit',
    'random.break',
    'random.burp',
    'random.chestclosed',
    'random.chestopen',
    'random.click',
    'random.door_close',
    'random.door_open',
    'random.drink',
    'random.drink_honey',
    'random.eat',
    'random.enderchestclosed',
    'random.enderchestopen',
    'random.explode',
    'random.fizz',
    'random.fuse',
    'random.glass',
    'random.hurt',
    'random.levelup',
    'random.lever_click',
    'random.orb',
    'random.pop',
    'random.pop2',
    'random.potion.brewed',
    'random.screenshot',
    'random.shulkerboxclosed',
    'random.shulkerboxopen',
    'random.splash',
    'random.stone_click',
    'random.swim',
    'random.toast',
    'random.toast_recipe_unlocking_in',
    'random.toast_recipe_unlocking_out',
    'random.totem',
    'random.wood_click',
    'record.11',
    'record.13',
    'record.5',
    'record.blocks',
    'record.cat',
    'record.chirp',
    'record.far',
    'record.mall',
    'record.mellohi',
    'record.otherside',
    'record.pigstep',
    'record.relic',
    'record.stal',
    'record.strad',
    'record.wait',
    'record.ward',
    'resonate.amethyst_block',
    'respawn_anchor.ambient',
    'respawn_anchor.charge',
    'respawn_anchor.deplete',
    'respawn_anchor.set_spawn',
    'scrape',
    'shatter.decorated_pot',
    'shriek.sculk_shrieker',
    'sign.dye.use',
    'sign.ink_sac.use',
    'smithing_table.use',
    'spread.sculk',
    'step.amethyst_block',
    'step.amethyst_cluster',
    'step.ancient_debris',
    'step.azalea',
    'step.azalea_leaves',
    'step.bamboo_wood',
    'step.bamboo_wood_hanging_sign',
    'step.basalt',
    'step.big_dripleaf',
    'step.bone_block',
    'step.calcite',
    'step.candle',
    'step.cave_vines',
    'step.chain',
    'step.cherry_leaves',
    'step.cherry_wood',
    'step.cherry_wood_hanging_sign',
    'step.chiseled_bookshelf',
    'step.cloth',
    'step.copper',
    'step.coral',
    'step.decorated_pot',
    'step.deepslate',
    'step.deepslate_bricks',
    'step.dirt_with_roots',
    'step.dripstone_block',
    'step.frog_spawn',
    'step.froglight',
    'step.grass',
    'step.gravel',
    'step.hanging_roots',
    'step.hanging_sign',
    'step.honey_block',
    'step.ladder',
    'step.moss',
    'step.nether_brick',
    'step.nether_gold_ore',
    'step.nether_sprouts',
    'step.nether_wart',
    'step.nether_wood',
    'step.nether_wood_hanging_sign',
    'step.netherite',
    'step.netherrack',
    'step.nylium',
    'step.pink_petals',
    'step.pointed_dripstone',
    'step.powder_snow',
    'step.roots',
    'step.sand',
    'step.sculk',
    'step.sculk_catalyst',
    'step.sculk_sensor',
    'step.sculk_shrieker',
    'step.sculk_vein',
    'step.shroomlight',
    'step.slime',
    'step.snow',
    'step.soul_sand',
    'step.soul_soil',
    'step.spore_blossom',
    'step.stem',
    'step.stone',
    'step.suspicious_gravel',
    'step.suspicious_sand',
    'step.tuff',
    'step.vines',
    'step.wood',
    'tile.piston.in',
    'tile.piston.out',
    'tilt_down.big_dripleaf',
    'tilt_up.big_dripleaf',
    'ui.cartography_table.take_result',
    'ui.loom.select_pattern',
    'ui.loom.take_result',
    'ui.stonecutter.take_result',
    'use.ancient_debris',
    'use.basalt',
    'use.bone_block',
    'use.candle',
    'use.cave_vines',
    'use.chain',
    'use.cloth',
    'use.copper',
    'use.coral',
    'use.deepslate',
    'use.deepslate_bricks',
    'use.dirt_with_roots',
    'use.dripstone_block',
    'use.grass',
    'use.gravel',
    'use.hanging_roots',
    'use.honey_block',
    'use.ladder',
    'use.moss',
    'use.nether_brick',
    'use.nether_gold_ore',
    'use.nether_sprouts',
    'use.nether_wart',
    'use.netherite',
    'use.netherrack',
    'use.nylium',
    'use.pointed_dripstone',
    'use.roots',
    'use.sand',
    'use.sculk_sensor',
    'use.shroomlight',
    'use.slime',
    'use.snow',
    'use.soul_sand',
    'use.soul_soil',
    'use.spore_blossom',
    'use.stem',
    'use.stone',
    'use.vines',
    'use.wood',
    'vr.stutterturn',
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
