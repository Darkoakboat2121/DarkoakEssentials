import { world, system, Player, ItemStack, Container, EntityComponentTypes, Block, BlockComponentTypes, BlockSignComponent, DyeColor, ItemComponentTypes, ItemDurabilityComponent, Dimension, Entity } from "@minecraft/server";

/**Minecraft Logic class, designed to add logic to the Minecraft Bedrock scripting api*/
export class mcl {

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
     * @param {number} length 
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
            result += characters.charAt(mcl.randomNumber(charactersLength))
        }
        return result
    }

    static numberProperties(num) {
        let even = false
        if (num % 2 === 0) {
            even = true
        }
        return {
            isEven: even,
            isOdd: !even,
            isNumber: !isNaN(num),
        }
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

    /**Gets a global data object
     * @param {string} id 
     * @returns {object}
     */
    static jsonWGet(id) {
        const t = world.getDynamicProperty(id)
        if (t == undefined) {
            return undefined
        } else {
            return JSON.parse(t)
        }
    }

    /**Sets a global data object
     * @param {string} id 
     * @param {object} data 
     */
    static jsonWSet(id, data) {
        world.setDynamicProperty(id, JSON.stringify(data))
    }

    /**Sets a player dynamic property
     * @param {Player} player
     * @param {string} id 
     * @param {boolean | number | string | Vector3 | undefined} setTo
     */
    static pSet(player, id, setTo) {
        player.setDynamicProperty(id, setTo)
    }

    /**Gets a player dynamic property
     * @param {Player} player 
     * @param {string} id 
     */
    static pGet(player, id) {
        return player.getDynamicProperty(id)
    }

    /**
     * @param {Player} player 
     * @param {string} id 
     * @param {object} data 
     */
    static jsonPSet(player, id, data) {
        player.setDynamicProperty(id, JSON.stringify(data))
    }

    /**
     * @param {Player} player 
     * @param {id} id 
     * @returns {object}
     */
    static jsonPGet(player, id) {
        const t = player.getDynamicProperty(id)
        if (t == undefined) {
            return undefined
        } else {
            return JSON.parse(t)
        }
    }

    /**
     * @param {string} name
     */
    static getPlayer(name) {
        return world.getPlayers({name: name})[0]
    }

    /**
     * 
     * @param {Player} player 
     * @param {number} amount 
     */
    static buy(player, amount) {
        if (isNaN(amount) || world.scoreboard.getObjective(mcl.wGet('darkoak:moneyscore')).getScore(player) == undefined) {
            return false
        }
        if (world.scoreboard.getObjective(mcl.wGet('darkoak:moneyscore')).getScore(player) >= amount) {
            player.runCommand(`scoreboard players remove "${player.name}" ${mcl.wGet('darkoak:moneyscore')} ${amount}`)
            return true
        } else {
            return false
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
     * @returns {string[]}
    */
    static listGetValues(key) {
        if (key === undefined) {
            var u = []
            for (const h of world.getDynamicPropertyIds()) {
                u.push(mcl.wGet(h))
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

    /**Returns a list of key value pairs of dynamic propertys
     * @param {string | undefined} key 
     */
    static listGetBoth(key) {
        if (key === undefined) {
            var u = []
            for (const h of world.getDynamicPropertyIds()) {
                u.push({id: h, value: mcl.wGet(h)})
            }
            return u
        } else {
            var u = []
            for (const h of world.getDynamicPropertyIds().filter(e => e.startsWith(key))) {
                u.push({id: h, value: mcl.wGet(h)})
            }
            return u
        }
    }

    /**Returns an array of all the online players names
     * @param {string | undefined} tag If tag is defined, it returns all online players with the inputted tag
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

        if (u.length === 0) {
            return 'No Tags Found'
        } else {
            return u
        }
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

    /**
     * @param {Player} player 
     */
    static isDOBAdmin(player) {
        if (player.hasTag('darkoak:admin') || mcl.isHost(player)) {
            return true
        } else {
            return false
        }
    }

    /**Returns whether the player is in an ideal state for creating the world (has op and is in creative mode)
     * @param {Player} player 
     */
    static isCreating(player) {
        if (mcl.isOp(player) === true) {
            if (player.getGameMode() === 'creative') {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    /**Sends a private message to admins
     * @param {string} message 
     */
    static adminMessage(message) {
        for (const player of world.getPlayers({tags: ['darkoak:admin']})) {
            player.sendMessage(message)
        }
    }

    /**Returns the players health
     * @param {Player} player 
     * @returns {number}
     */
    static healthValue(player) {
        return player.getComponent("minecraft:health").currentValue
    }

    /**Returns the players score for the inputted objective
     * @param {Player} player 
     * @param {string} objective 
     * @returns {number}
     */
    static getScore(player, objective) {
        return world.scoreboard.getObjective(objective).getScore(player)
    }

    /**Returns the held item
     * @param {Player} player 
     * @returns {ItemStack | undefined}
     */
    static getHeldItem(player) {
        /**@type {Container} */
        const container = player.getComponent(EntityComponentTypes.Inventory).container
        return container.getItem(player.selectedSlotIndex)
    }

    /**Advanced container inventory
     * @param {Player} player 
     * @returns {Container}
     */
    static getItemContainer(player) {
        return player.getComponent(EntityComponentTypes.Inventory).container
    }

    /**WIP
     * @param {Player} player 
     * @param {number} location 
     */
    static getCertainItem(player, location) {
        /**@type {Container} */
        const container = player.getComponent("minecraft:inventory").container
        return container.getSlot(location)
    }

    /**Converts inputted seconds to tick value
     * @param {number} seconds 
     * @returns {number}
     */
    static secondsToTicks(seconds) {
        return seconds * 20
    }

    /**
     * 
     * @param {Block} block 
     * @returns {{waxed: boolean, text: string, color: DyeColor}}
     */
    static getSign(block) {
        /**@type {BlockSignComponent} */
        const signed = block.getComponent(BlockComponentTypes.Sign)
        return {waxed: signed.isWaxed, text: signed.getText(), color: signed.getTextDyeColor()}
    }

    /**Modifies a sign
     * @param {Block} block 
     * @param {boolean} wax 
     * @param {string} text 
     * @param {DyeColor} color 
     */
    static rewriteSign(block, wax, text, color) {
        /**@type {BlockSignComponent} */
        const signed = block.getComponent(BlockComponentTypes.Sign)
        signed.setWaxed(wax)
        signed.setText(text)
        signed.setTextDyeColor(color)
    }

    /**Gets an items durability info
     * @param {ItemStack} item 
     * @returns {{durability: number, maxDurability: number}}
     */
    static getItemDurability(item) {
        /**@type {ItemDurabilityComponent} */
        const dura = item.getComponent(ItemComponentTypes.Durability)
        return {durability: dura.damage, maxDurability: dura.maxDurability}
    }

    /**
     * @param {string} typeId 
     * @param {Dimension} dimension 
     * @returns {Entity[]}
     */
    static getEntityByTypeId(typeId, dimension) {
        return world.getDimension(dimension.id).getEntities({type: typeId})
    }

}
