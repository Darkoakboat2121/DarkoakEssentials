import { world, system } from "@minecraft/server";

// Note: DO NOT TOUCH THIS
// Generates a fake uuid in the correct format
export function uuid() {
    var u='', i=0
    while(i++<36) {
        var c='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'[i-1],r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);
        u+=(c=='-'||c=='4')?c:v.toString(16)
    }
    return u
}

// Generates a unique number starting with a random number and ending with the current exact time
export function timeUuid() {
    const t = new Date()
    const r = Math.floor(Math.random() * 100)

    return `R${r.toString()}T${t.getTime()}`
}

// Returns a random number between 0 and the inputted number
export function randomNumber(high) {
    return Math.floor(Math.random() * high)
}

// Returns a random string based on the inputted length and whether to include numbers
export function randomString(length, num) {
    var characters = ''
    if (num === false || num === undefined) {
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    } else {
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    }
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(randomNumber(charactersLength))
    }
    return result
}

// Sets a dynamic property globally
export function wSet(id, setTo) {
    world.setDynamicProperty(id, setTo)
}

// Gets a global dynamic property
export function wGet(id) {
    return world.getDynamicProperty(id)
}

// Returns an array of dynamic property ids that starts with the inputted key
export function listGet(key) {
    return world.getDynamicPropertyIds().filter(e => e.startsWith(key))
}

// Returns an array of dynamic property ids value that starts with the inputted key
export function listGetValues(key) {
    if (key === 'all') {
        var u = []
        for (const h of world.getDynamicPropertyIds()) {
            u.push(wGet(h))
        }
        return u
    } else {
        var u = []
        for (const h of world.getDynamicPropertyIds().filter(e => e.startsWith(key))) {
            u.push(wGet(h))
        }
        return u
    }
}

// Returns an array of all the online players names
export function playerNameArray() {
    var u = []
    for (const p of world.getAllPlayers()) {
        u.push(p.name)
    }
    return u
}

// Returns an array of a inputted players effects
export function playerEffectsArray(player) {
    var u = []
    for (const e of player.getEffects()) {
        u.push(e.typeId)
    }

    if (u.length === 0) {
        return 'No Effects Found'
    } else {
        return u
    }
}

// Returns an array of a inputted players tags
export function playerTagsArray(player) {
    var u = []
    for (const t of player.getTags()) {
        u.push(t)
    }

    return u
}

// Checks if the inputted player is the host by checking its id
export function isHost(player) {
    if (player.id == -4294967295) {
        return true
    } else {
        return false
    }
}

export function isOp(player) {
    return player.isOp()
}

export function isCreating(player) {
    if (isOp(player) === true) {
        if (player.getGameMode() === 'creative') {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}