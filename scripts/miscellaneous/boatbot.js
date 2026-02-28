// import { world, system, BlockComponentTypes } from '@minecraft/server'
// import { mcl } from '../logic'

// work on this tomorrow!

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

// Train a Naive Bayes classifier
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

// Predict intent
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
    'hello', 'hi', 'hey',
    'weather today', 'is it raining', 'forecast',
    'bye', 'goodbye', 'see you'
]

const trainingLabels = [
    'greeting', 'greeting', 'greeting',
    'weather', 'weather', 'weather',
    'goodbye', 'goodbye', 'goodbye'
]

const vocab = buildVocabulary(trainingTexts)
const model = trainNaiveBayes(trainingTexts, trainingLabels, vocab)
console.log(vocab, model)
function chatbot(input) {
    const intent = predictNaiveBayes(input, model, vocab);

    switch (intent) {
        case 'greeting': return 'greet'
        case 'weather': return 'weather'
        case 'goodbye': return 'goodbye'
        default: return 'idk'
    }
}

console.log(chatbot('hows it going boatbot? hey'))
console.log(chatbot('is it raining'))
console.log(chatbot('bye friend'))
