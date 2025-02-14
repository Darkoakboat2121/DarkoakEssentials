import { world, system, Player } from "@minecraft/server";

/**Minecraft Logic class, designed to add logic to the Minecraft Bedrock scripting api*/
export class mcl {
    /**Generates a fake uuid in the correct format*/
    static uuid() {
        var u = '', i = 0
        while (i++ < 36) {
            var c = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'[i - 1], r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            u += (c == '-' || c == '4') ? c : v.toString(16)
        }
        return u
    }

    /**Generates a unique number starting with a random number and ending with the current exact time, format: R[random]T[time]*/
    static timeUuid() {
        const t = new Date()
        const r = Math.floor(Math.random() * 100)

        return `R${r.toString()}T${t.getTime()}`
    }

    /**Returns a random number between 0 and the inputted number
     * @param {number} high
    */
    static randomNumber(high) {
        return Math.floor(Math.random() * high)
    }

    /**Returns a random string based on the inputted length and whether to include numbers
     * @param {boolean} num
    */
    static randomString(length, num) {
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
     * @param {any | undefined} setTo 
    */
    static wSet(id, setTo) {
        world.setDynamicProperty(id, setTo)
    }

    /**Gets a global dynamic property
     * @param {string} id 
    */
    static wGet(id) {
        return world.getDynamicProperty(id)
    }

    /**Sets a player dynamic property
     * @param {Player} player
     * @param {string} id 
     * @param {any | undefined} setTo
     */
    static pSet(player, id, setTo) {
        player.setDynamicProperty(id, setTo)
    }

    /**Gets a player dynamic property
     * @param {*} player 
     * @param {*} id 
     */
    static pGet(player, id) {
        player.getDynamicProperty(id)
    }

    /**Sends the specified player a private message
     * @param {Player | string} player If this is a string, it looks for a player with this string as their name
     * @param {string} message 
     * @param {string | undefined} tag If tag does not equal undefined, only sends the player the message if they have that tag
     */
    static pSM(player, message, tag) {
        if (player != Player) {
            const p = world.getPlayers({name: player})[0]
            if (p.hasTag(tag) || tag === undefined) {
                p.sendMessage(message)
            }
        } else {
            if (player.hasTag(tag) || tag === undefined) {
                player.sendMessage(message)
            }
        }
    }

    /**Returns an array of dynamic property ids that starts with the inputted key
     * @param {string | undefined} key If the inputted key is undefined, it returns every property id
    */
    static listGet(key) {
        if (key === undefined) {
            return world.getDynamicPropertyIds()
        } else {
            return world.getDynamicPropertyIds().filter(e => e.startsWith(key))
        }
    }

    /**Returns an array of dynamic property ids value that starts with the inputted key
     * @param {string | undefined} key If the inputted key is undefined, it returns every property value
    */
    static listGetValues(key) {
        if (key === undefined) {
            var u = []
            for (const h of world.getDynamicPropertyIds()) {
                u.push(wGet(h))
            }
            return u
        } else {
            var u = []
            for (const h of world.getDynamicPropertyIds().filter(e => e.startsWith(key))) {
                u.push(mcl.wGet(h))
            }
            return u
        }
    }

    /**Returns an array of all the online players names
     * @param {string | undefined} tag If tag is not undefined, it returns all online players with the inputted tag
    */
    static playerNameArray(tag) {
        if (tag === undefined) {
            var u = []
            for (const p of world.getAllPlayers()) {
                u.push(p.name)
            }
            return u
        } else {
            var u = []
            for (const p of world.getPlayers({ tags: [tag] })) {
                u.push(p.name)
            }
            return u
        }
    }

    /**Returns an array of a inputted players effects
     * @param {Player} player 
    */
    static playerEffectsArray(player) {
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
    static playerTagsArray(player) {
        var u = []
        for (const t of player.getTags()) {
            u.push(t)
        }

        return u
    }

    /**Checks if the inputted player is the host by checking its id
     * @param {Player} player 
    */
    static isHost(player) {
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
    static isOp(player) {
        return player.isOp()
    }

    /**Returns whether the player is in an ideal state for creating the world (has op and is in creative mode)
     * @param {Player} player 
     */
    static isCreating(player) {
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
}

