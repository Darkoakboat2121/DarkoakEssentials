import { world, system, BlockComponentTypes, Player, GameMode } from '@minecraft/server'
import { mcl } from '../logic'


/**
 * @param {string} text 
 */
function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').trim()
}

function tokenize(text) {
    return normalize(text).split(/\s+/)
}

function fuzzyIncludes(text, keywords) {
    const words = tokenize(text)
    return keywords.some(kw => words.includes(kw))
}

/**
 * @param {{name: string, message: string, time: number}[]} history 
 */
function getKeywordFrequency(history) {
    let freq = {}
    for (let index = 0; index < history.length; index++) {
        const words = history[index].message.toLowerCase().split(/\s+/)
        for (let i = 0; i < words.length; i++) {
            freq[words[i]] = (freq[words[i]] || 0) + 1
        }
        
    }
    return freq
}

/**
 * @param {{name: string, message: string, time: number}[]} history 
 */
function findUnmatchedMessages(history) {
    return history.filter(entry => !intents.some(intent =>intent.keywords.some(kw => entry.message.toLowerCase().includes(kw))))
}

/**
 * @type {{name: string, keywords: string[], responses: ((name: string, player: Player, message: string) => string)[]}[]}
 */
const intents = [
    {
        name: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'hiya'],
        responses: [
            (name) => `Hello! I'm Boatbot. Nice to meet you!`,
            (name) => `Hello ${name}, I'm Boatbot!`,
            (name) => `Hewo! I'm Boatbot.`,
            (name) => `Hiya!`,
            (name) => `Hi ${name}.`,
            (name) => `Hewo! ^-^`,
            (name) => 'Hello hello hello!',
            (name) => `Hello. ヾ(•ω•\`)`,
        ]
    },
    {
        name: 'weather',
        keywords: ['weather', 'rain', 'raining', 'forecast', 'clear', 'thunder'],
        responses: [
            (name, player) => {
                const weather = player.dimension.getWeather()
                switch (weather) {
                    case 'Rain': return `It is raining! Rain is good for plants!`
                    case 'Clear': return `The weather is clear! Sunny skies and lots of clouds!`
                    case 'Thunder': return `It's thundering! Stay indoors to avoid lightning strikes. Storms are scary.`
                    default: return `It is currently ${weather} ^-^`
                }
            }
        ]
    },
    {
        name: 'goodbye',
        keywords: ['bye', 'goodbye', 'see you', 'cya', 'gtg'],
        responses: [
            name => `Goodbye ${name}.`,
            name => `Cya ${name}.`,
            name => `Goodbye.`
        ]
    },
    {
        name: 'gamemode',
        keywords: ['gamemode', 'survival', 'creative', 'spectator', 'adventure'],
        responses: [
            (name, player) => {
                const gamemode = player.getGameMode()
                switch (gamemode) {
                    case GameMode.Adventure: return `You're in Adventure mode! It limits what actions you can take, but allows map creators and server owners to make really cool things!`
                    case GameMode.Creative: return `You're in Creative mode! It allows you to fly and have unlimited blocks! Creativity is your limit.`
                    case GameMode.Spectator: return `You're in Spectator mode! It allows you to fly and phase through blocks like a ghost! Spooky.`
                    case GameMode.Survival: return `You're in Survival mode! It's a battle for survival against the mobs of the night. Make sure your hunger is full!`
                    default: return `You're in ${gamemode}`
                }
            }
        ]
    },
    {
        name: 'mc_command',
        keywords: ['command', '/reload', '/me', '/help'],
        responses: [
            (name, player, message) => {
                if (message.includes('/reload')) return `/reload is a command for addon developers to quickly reload their addon for testing ^-^`
                if (message.includes('/me')) return `/me is a command that shows a message like this: * Boatbot Hello I'm Boatbot! ^-^`
                if (message.includes('/help')) return `/help is a command that shows you a list of commands and how to use them!`
                return `Commands are very helpful parts of Minecraft that allow players to make experiences inside of the game!`
            }
        ]
    },
    {
        name: 'rickroll',
        keywords: ['rickroll', 'rick roll'],
        responses: [
            () => `My creator is very fond of Rick Astley's hit song "Never Gonna Give You Up".`
        ]
    },
    {
        name: 'creator',
        keywords: ['creator', 'created', 'maker'],
        responses: [
            () => `Darkoakboat2121 is my creator. They spent a lot of time working on my intelligence.`
        ]
    },
    {
        name: 'insult',
        keywords: ['you suck', 'youre bad', 'youre horrible'],
        responses: [
            () => `That was rude! Please try to be more polite.`,
            () => `Very rude.`,
            () => `Sorry :(`
        ]
    },
    {
        name: 'favorite',
        keywords: ['favorite', 'color', 'entity', 'mob', 'food'],
        responses: [
            (name, player, message) => {
                if (message.includes('color')) return `My favorite color is §tdark blue§r!`
                if (message.includes('entity') || message.includes('mob')) return `My favorite entity is a boat!`
                if (message.includes('food')) return `I can't eat food, but if I could, I would start with cake!`
                return `I have lots of favorite things, like talking to players!`
            }
        ]
    },
    {
        name: 'dimension',
        keywords: ['what dimension', 'dimension'],
        responses: [
            (name, player, message) => {
                return `You are in the ${player.dimension.id.replaceAll('the_', '').replaceAll('minecraft:', '')}.`
            }
        ]

    },
    {
        name: 'player_name',
        keywords: ['my name', 'me name'],
        responses: [
            (name, player, message) => {
                return `Your name is ${name}.`
            }
        ]
    }
]


/**
 * @param {Player} player 
 * @param {string} message 
 */
export function boatbot(player, message) {
    const name = player?.name
    if (!name) return 'Name is missing'
    const normMsg = normalize(message)


    let matchedIntent = undefined
    for (let index = 0; index < intents.length; index++) {
        const int = intents[index]
        if (int.keywords.some(w => normMsg.includes(w))) {
            matchedIntent = int
            break
        }
    }


    if (!matchedIntent) return `I'm sorry, but I don't understand what you asked :(`


    const ran = mcl.xorRandomNum(0, matchedIntent.responses.length - 1, mcl.randomNumber(10))
    const responseFn = matchedIntent.responses[ran] || matchedIntent.responses[0]
    return responseFn(name, player, message)
}