import { world, system, Player, ItemStack, Container, EntityComponentTypes, Block, BlockComponentTypes, BlockSignComponent, DyeColor, ItemComponentTypes, ItemDurabilityComponent, Dimension, Entity } from "@minecraft/server";

/**Minecraft Logic class, designed to add logic to the Minecraft Bedrock scripting API*/
export class mcl {

    /**Generates a unique number starting with a random number and ending with the current exact time, format: R[random]T[time]*/
    static timeUuid() {
        const t = new Date()
        return `R${Math.floor(Math.random() * 100)}T${t.getTime()}`
    }

    /**Returns a random number between 0 and the inputted number
     * @param {number} high
    */
    static randomNumber(high) {
        return Math.floor(Math.random() * high)
    }

    /**Returns a random number between the low and high
     * @param {number} low 
     * @param {number} high 
     * @returns {number}
     */
    static randomNumberInRange(low, high) {
        return mcl.randomNumber(high) + low
    }

    /**Returns a random string based on the inputted length and whether to include numbers
     * @param {boolean} num
     * @param {number} length 
    */
    static randomString(length, num) {
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        if (num === true) {
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        }
        let result = ''
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(mcl.randomNumber(charactersLength))
        }
        return result
    }

    /**Scrambles a string
     * @param {string} string 
     * @returns {string}
     */
    static stringScrambler(string) {
        let characters = string.split('')
        let j = 0

        for (let index = 0; index < characters.length; index++) {
            j = mcl.randomNumber((index + 1))
            const temp = characters[index]
            characters[index] = characters[j]
            characters[j] = temp
        }

        return characters.join('')
    }

    /**Deletes '§' from strings and the following letter, and converts common replacements
     * @param {string} string 
     */
    static deleteFormatting(string) {
        let newMessage = ''

        for (let index = 0; index < string.length; index++) {
            if (string.charAt(index - 1) == '§' && index > 0) {
                continue
            }
            newMessage += message.charAt(index)
        }

        newMessage = newMessage
            .replaceAll('0', 'o')
            .replaceAll('1', 'i')
            .replaceAll('4', 'a')
            .replaceAll('6', 'k')
            .replaceAll('8', 'b')
            .replaceAll('9', 'q')
            .replaceAll('§', '')
        return newMessage
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

    /**Gets strings from inbetween certain strings
    * @param {string} str 
    * @param {string} startChar 
    * @param {string} endChar 
    * @returns {string}
    */
    static getStringBetweenChars(str, startChar, endChar) {
        const escapedStartChar = startChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
        const escapedEndChar = endChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
        const regex = new RegExp(`${escapedStartChar}(.*?)${escapedEndChar}`)
        const match = str.match(regex)
        return match ? match[1] : undefined
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

    /**Sets and returns the value OR gets the value. If theres nothing to retrieve it sets the value
     * @param {string} id 
     * @param {any} value 
     */
    static wSog(id, value) {
        const def = mcl.wGet(id)
        if (!def) {
            mcl.wSet(id, value)
            return value
        } else return def
    }

    /**Removes / Resets a global dynamic property
     * @param {string} id ID to reset
     * @returns {boolean} Whether it successfully removed the property
     */
    static wRemove(id) {
        try {
            world.setDynamicProperty(id)
            return true
        } catch {
            return false
        }
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

    /**WIP
     * @param {string} id 
     * @param {string} updateKey 
     * @param {any} data 
     */
    static jsonWUpdate(id, updateKey, data) {

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
        const player = world.getPlayers({ name: name })
        if (player.length != 0) {
            return player[0]
        } else return undefined
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
            let u = []
            let ids = world.getDynamicPropertyIds()
            for (let index = 0; index < ids.length; index++) {
                u.push(mcl.wGet(ids[index]))
            }
            return u
        } else {
            let u = []
            let ids = world.getDynamicPropertyIds().filter(e => e.startsWith(key))
            for (let index = 0; index < ids.length; index++) {
                u.push(mcl.wGet(ids[index]))
            }
            return u
        }
    }

    /**Returns a list of key value pairs of dynamic propertys
     * @param {string | undefined} key 
     */
    static listGetBoth(key) {
        if (key === undefined) {
            let u = []
            let ids = world.getDynamicPropertyIds()
            for (let index = 0; index < ids.length; index++) {
                u.push({ id: ids[index], value: mcl.wGet(ids[index]) })
            }
            return u
        } else {
            let u = []
            let ids = world.getDynamicPropertyIds().filter(e => e.startsWith(key))
            for (let index = 0; index < ids.length; index++) {
                u.push({ id: ids[index], value: mcl.wGet(ids[index]) })
            }
            return u
        }
    }

    /**Returns a list of key value pairs of dynamic propertys in json format
     * @param {string} key 
     */
    static jsonListGetBoth(key) {
        let u = []
        let ids = world.getDynamicPropertyIds().filter(e => e.startsWith(key))
        for (let index = 0; index < ids.length; index++) {
            u.push({
                id: ids[index],
                value: mcl.jsonWGet(ids[index])
            })
        }
        return u
    }

    /**Returns a list of key value pairs of dynamic propertys
     * @param {Player} player 
     * @param {string | undefined} key 
     */
    static pListGetBoth(player, key) {
        if (key === undefined) {
            let u = []
            let ids = player.getDynamicPropertyIds()
            for (let index = 0; index < ids.length; index++) {
                u.push({ id: ids[index], value: mcl.pGet(player, ids[index]) })
            }
            return u
        } else {
            let u = []
            let ids = player.getDynamicPropertyIds().filter(e => e.startsWith(key))
            for (let index = 0; index < ids.length; index++) {
                u.push({ id: ids[index], value: mcl.pGet(player, ids[index]) })
            }
            return u
        }
    }

    /**Returns an array of all the online players names
     * @param {string | undefined} tag If tag is defined, it returns all online players with the inputted tag
    */
    static playerNameArray(tag) {
        if (tag === undefined) {
            let u = []
            let players = world.getAllPlayers()
            for (let index = 0; index < players.length; index++) {
                u.push(players[index].name)
            }
            return u
        } else {
            let u = []
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
        let u = []
        let e = player.getEffects()
        if (e.length == 0) return 'No Effects Found'
        for (let index = 0; index < e.length; index++) {
            u.push(e[index].displayName)
        }
        return u
    }

    /**Returns an array of a inputted players tags
     * @param {Player | undefined} player 
    */
    static playerTagsArray(player) {
        if (player != undefined) {
            let tags = player.getTags()
            if (tags.length == 0) {
                return 'No Tags Found'
            } else {
                return tags
            }
        } else {
            let u = []
            let players = world.getAllPlayers()
            for (let index = 0; index < players.length; index++) {
                let tags = players[index].getTags()
                if (tags.length == 0) continue
                u.push(tags)
            }
            if (u.length === 0) {
                return 'No Tags Found'
            } else {
                return [...new Set(u)]
            }
        }
    }

    /**Checks if the inputted player is the host by checking its id
     * @param {Player} player 
    */
    static isHost(player) {
        if (player.id == -4294967295) {
            return true
        } else return false
    }

    /**Returns whether the inputted player has op permissions
     * @param {Player} player 
     * @returns {boolean}
     */
    static isOp(player) {
        return player.isOp()
    }

    /**Returns true if the player has the admin tag or if the player is the host
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
        for (const player of world.getPlayers({ tags: ['darkoak:admin'] })) {
            player.sendMessage(`§cAdmin Message:§r§f ${message}`)
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
        if (!world.scoreboard.getObjective(objective)) return 0
        return world.scoreboard.getObjective(objective).getScore(player) || 0
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

    /**Converts an item to an object
     * @param {ItemStack} item 
     */
    static itemToData(item) {
        let propertys = []
        let ids = item.getDynamicPropertyIds()
        for (let index = 0; index < ids.length; index++) {
            propertys.push(item.getDynamicProperty(ids[index]))
        }
        return {
            amount: item.amount,
            canDestroy: item.getCanDestroy(),
            canPlaceOn: item.getCanPlaceOn(),
            components: item.getComponents(),
            dynamicPropertyIds: ids,
            dynamicPropertyTotalByteCount: item.getDynamicPropertyTotalByteCount(),
            dynamicPropertys: propertys,
            lore: item.getLore(),
            tags: item.getTags(),
            isStackable: item.isStackable,
            keepOnDeath: item.keepOnDeath,
            localizationKey: item.localizationKey,
            lockMode: item.lockMode,
            maxAmount: item.maxAmount,
            nameTag: item.nameTag,
            type: item.type,
            typeId: item.typeId,
        }
    }

    /**Converts an object into an item
     * @param {object} d
     * @returns {ItemStack}
     */
    static dataToItem(d) {
        let item = new ItemStack(d.type, d.amount)
        item.setCanDestroy(d.canDestroy)
        item.setCanPlaceOn(d.canPlaceOn)
        let ids = d.dynamicPropertyIds
        for (let index = 0; index < ids.length; index++) {
            item.setDynamicProperty(ids[index], d.dynamicPropertys[index])
        }
        item.setLore(d.lore)
        item.lockMode = d.lockMode
        item.nameTag = d.nameTag
        item.keepOnDeath = d.keepOnDeath

        return item
    }

    /**Gets the items enchantments
     * @param {ItemStack} item 
     */
    static getItemEnchants(item) {
        return item.getComponent(ItemComponentTypes.Enchantable)
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
        return { waxed: signed.isWaxed, text: signed.getText(), color: signed.getTextDyeColor() }
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
        return { durability: dura.damage, maxDurability: dura.maxDurability }
    }

    /**
     * @param {string} typeId 
     * @param {Dimension} dimension 
     * @returns {Entity[]}
     */
    static getEntityByTypeId(typeId, dimension) {
        return world.getDimension(dimension.id).getEntities({ type: typeId })
    }

    /**Returns the host of the world
     * @returns {Player | undefined}
     */
    static getHost() {
        const players = world.getAllPlayers()
        for (let index = 0; index < players.length; index++) {
            const p = players[index]
            if (mcl.isHost(p)) {
                return p
            }
        }
        return undefined
    }

    /**
     * @param {{name: string, tag: string, dimension: string}} param0 
     * @returns {Player | undefined}
     */
    static getPlayerFiltered({ name, tag, dimension }) {
        const players = world.getAllPlayers()
        for (let index = 0; index < players.length; index++) {
            const p = players[index]
            if ((name === undefined || p.name === name) && (tag === undefined || p.hasTag(tag)) && (dimension === undefined || p.dimension.id === dimension)) {
                return p
            }
        }
        return undefined
    }
}