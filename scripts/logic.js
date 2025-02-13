import { world, system } from "@minecraft/server";

// Note: DO NOT TOUCH THIS
/**Generates a fake uuid in the correct format*/
export function uuid() {
    var u='', i=0
    while(i++<36) {
        var c='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'[i-1],r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);
        u+=(c=='-'||c=='4')?c:v.toString(16)
    }
    return u
}

/**Generates a unique number starting with a random number and ending with the current exact time*/
export function timeUuid() {
    const t = new Date()
    const r = Math.floor(Math.random() * 100)

    return `R${r.toString()}T${t.getTime()}`
}

/**Returns a random number between 0 and the inputted number
 * @param {number} high
*/
export function randomNumber(high) {
    return Math.floor(Math.random() * high)
}

/**Returns a random string based on the inputted length and whether to include numbers
 * @param {boolean} num
*/
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

/**Sets a global dynamic property
 * @param {string} id 
 * @param {any} setTo 
*/
export function wSet(id, setTo) {
    world.setDynamicProperty(id, setTo)
}

/**Gets a global dynamic property
 * @param {string} id 
*/
export function wGet(id) {
    return world.getDynamicProperty(id)
}

/**Returns an array of dynamic property ids that starts with the inputted key*/
export function listGet(key) {
    return world.getDynamicPropertyIds().filter(e => e.startsWith(key))
}

/**Returns an array of dynamic property ids value that starts with the inputted key
 * @param {string | 'all'} key If the inputted key is 'all', it returns every property value
*/
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

/**Returns an array of all the online players names
 * @param {string | undefined} tag If tag is not undefined, it returns all online players with the inputted tag
*/
export function playerNameArray(tag) {
    if (tag === undefined) {
        var u = []
        for (const p of world.getAllPlayers()) {
            u.push(p.name)
        }
        return u
    } else {
        var u = []
        for (const p of world.getPlayers({tags: [tag]})) {
            u.push(p.name)
        }
        return u
    }
}

/**Returns an array of a inputted players effects
 * @param {Player} player 
*/
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

/**Returns an array of a inputted players tags
 * @param {Player} player 
*/
export function playerTagsArray(player) {
    var u = []
    for (const t of player.getTags()) {
        u.push(t)
    }

    return u
}

/**Checks if the inputted player is the host by checking its id
 * @param {Player} player 
*/
export function isHost(player) {
    if (player.id == -4294967295) {
        return true
    } else {
        return false
    }
}

/**Returns whether the inputted player has op permissions
 * @param {Player} player 
 * @returns {boolean}
 */
export function isOp(player) {
    return player.isOp()
}

/**Returns whether the player is in an ideal state for creating the world (has op and is in creative mode)
 * @param {Player} player 
 */
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