import { world, system, BlockComponentTypes, Player, GameMode } from '@minecraft/server'
import { mcl } from '../logic'


function buildVocabulary(texts) {
    const vocab = new Set()
    texts.forEach(t => t.split(' ').forEach(w => vocab.add(w)))
    return Array.from(vocab)
}

function textToVector(text, vocab) {
    const vec = new Array(vocab.length).fill(0)
    const words = text.split(' ')
    words.forEach(w => {
        const idx = vocab.indexOf(w)
        if (idx !== -1) vec[idx] += 1
    })
    return vec
}


function trainNaiveBayes(texts, labels, vocab) {
    const labelCounts = {}
    const wordCounts = {}
    const totalDocs = texts.length

    labels.forEach(l => {
        labelCounts[l] = (labelCounts[l] || 0) + 1
        wordCounts[l] = new Array(vocab.length).fill(0)
    })

    texts.forEach((text, i) => {
        const vec = textToVector(text, vocab)
        const label = labels[i]
        for (let j = 0; j < vec.length; j++) {
            wordCounts[label][j] += vec[j]
        }
    })

    return { labelCounts, wordCounts, totalDocs }
}


function predictNaiveBayes(text, model, vocab) {
    const vec = textToVector(text, vocab)
    let bestLabel = null
    let bestScore = -Infinity

    for (const label in model.labelCounts) {
        let score = Math.log(model.labelCounts[label] / model.totalDocs)

        for (let i = 0; i < vec.length; i++) {
            const wordFreq = model.wordCounts[label][i] + 1
            score += vec[i] * Math.log(wordFreq)
        }

        if (score > bestScore) {
            bestScore = score
            bestLabel = label
        }
    }

    return bestLabel
}

const trainingTexts = [
    'hello', 'hi', 'hey', 'hiya',
    'weather', 'is it raining', 'forecast',
    'bye', 'goodbye', 'see you', 'cya', 'gtg',
    'gamemode', 'survival', 'creative', 'spectator', 'adventure',
    'command', '/reload', '/me', '/help',
    'rickroll', 'rick roll',
    'creator', 'created', 'maker',
    'you suck', 'youre bad', 'youre horrble',
    'favorite color', 'favorite entity', 'favorite food',
]

const trainingLabels = [
    'greeting', 'greeting', 'greeting', 'greeting',
    'weather', 'weather', 'weather',
    'goodbye', 'goodbye', 'goodbye', 'goodbye', 'goodbye',
    'gamemode', 'gamemode', 'gamemode', 'gamemode', 'gamemode',
    'mc_command', 'mc_command', 'mc_command', 'mc_command',
    'rickroll', 'rickroll',
    'creator', 'creator', 'creator',
    'insult', 'insult', 'insult',
    'favorite', 'favorite', 'favorite',
]

const vocab = buildVocabulary(trainingTexts)
const model = trainNaiveBayes(trainingTexts, trainingLabels, vocab)

/**
 * @param {Player} player 
 * @param {string} message 
 */
export function boatbot(player, message) {
    const intent = predictNaiveBayes(message, model, vocab)
    const name = player?.name
    if (!name) return 'Invalid name.'
    const ran = mcl.xorRandomNum(0, 10, mcl.randomNumber(10))

    switch (intent) {
        case 'greeting': {
            switch (ran) {
                case 0: return `Hello! I'm Boatbot. Nice to meet you!`
                case 1: return `Hello ${name}, I'm Boatbot!`
                case 2: return `Hewo! I'm Boatbot.`
                case 3: return `Hiya!`
                case 4: return `Hi ${name}.`
                default: return `Hello! I'm Boatbot!`
            }
        }
        case 'weather': {
            const weather = player.dimension.getWeather()
            switch (weather) {
                case 'Rain': return `It is raining! Rain is good for plants!`
                case 'Clear': return `The weather is clear! Sunny skys and lots of clouds!`
                case 'Thunder': return `It's thundering! Stay indoors to avoid lightning strikes. Storms are scary.`
                default: return `It is currently ${weather} ^-^`
            }
        }
        case 'goodbye': {
            switch (ran) {
                case 0: return `Goodbye ${name}.`
                case 1: return `Cya ${name}.`
                default: return `Goodbye.`
            }
        }
        case 'gamemode': {
            const gamemode = player.getGameMode()
            switch (gamemode) {
                case GameMode.Adventure: return `You're in Adventure mode! It limits what actions you can take, but allows map creators and server owners to make really cool things!`
                case GameMode.Creative: return `You're in Creative mode! It allows you to fly and have unlimited blocks! Creativity is your limit.`
                case GameMode.Spectator: return `You're in Spectator mode! It allows you to fly and phase through blocks like a ghost! Spooky.`
                case GameMode.Survival: return `You're in Survival mode! It's a battle for survival against the mobs of the night. Make sure your hunger is full!`
                default: return `You're in ${gamemode}`
            }
        }
        case 'mc_command': {
            switch (true) {
                case message.includes('/reload'): return `/reload is a command for addon developers to quickly reload their addon for testing ^-^\nIt requires operator permissions to run and host permissions to run "/reload all" which reloads resource packs too.`
                case message.includes('/me'): return `/me is a command that shows a message like this: * Boatbot Hello I'm Boatbot! ^-^`
                case message.includes('/help'): return `/help is a command that shows you a list of commands and how to use them! It's helpful for those that are learning commands, like me!`
                default: `Commands are very helpful parts of Minecraft that allows players to make experiences inside of the game!`
            }
        }
        case 'rickroll': {
            //if (name === 'Darkoakboat2121') return `Hello creator! I'll never give you up ^-^`
            return `My creator is very fond of Risk Astley's hit song "Never Gonna Give You Up". It was originally released on 27 July 1987 in Rick's album "Whenever You need Somebody".`
        }
        case 'creator': {
            return `Darkoakboat2121 is my creator. They spent a lot of time working on my intelligence. I'm sorry if I struggle sometimes ^~^`
        }
        case 'insult': {
            switch (ran) {
                case 0: return `That was rude! Please try to be more polite.`
                case 1: return `Very rude.`
                case 2: return `Sorry :(`
                default: return `That was rude!`
            }
        }
        case 'favorite': {
            switch (true) {
                case message.includes('color'): return `My favorite color is §tdark blue§r!`
                case message.includes('entity') || message.includes('mob'): return `My favorite entity is a boat!`
                case message.includes('food'): return `I can't eat food, but if I could, I would start with cake!`
                default: return `I have lots of favorite things, like talking to players!`
            }
        }
        default: return 'I\'m sorry, but I don\'t understand what you asked :('
    }
}
