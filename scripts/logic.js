import { world, system, Player, ItemStack, Container, EntityComponentTypes, Block, BlockComponentTypes, BlockSignComponent, DyeColor, ItemComponentTypes, ItemDurabilityComponent, Dimension, Entity, SignSide, PlayerPermissionLevel } from "@minecraft/server"

/**Minecraft Logic class, designed to add logic to the Minecraft Bedrock scripting API*/
export class mcl {

    /**Generates a unique number starting with a random number and ending with the current exact time, format: R[random]T[time]*/
    static timeUuid() {
        const t = new Date()
        return `R${Math.floor(Math.random() * 100)}T${t.getTime()}`
    }

    /**Returns a random number between 0 and the inputted number
     * @param {number} high Defaults to 10
    */
    static randomNumber(high = 10) {
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
     * @param {boolean} numbers Whether to include numbers in the string, defaults to false
     * @param {number} length 
    */
    static randomString(length, numbers = false) {
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        if (numbers === true) {
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

    /**Gets a variety of number properties
     * @param {number} num 
     */
    static numberProperties(num) {
        let even = false
        if (num % 2 === 0) {
            even = true
        }
        return {
            isEven: even,
            isOdd: !even,
            isNumber: !isNaN(num),
            factorial: mcl.factorial(num),
        }
    }

    /**Calculates the factorial of a number
     * @param {number} num 
     * @returns {number}
     */
    static factorial(num) {
        if (num === 1) return 1
        return num * mcl.factorial(num - 1)
    }

    /**DO NOT USE THIS FUNCTION, IT IS HORRIBLE AND SLOW
     * @param {number[]} array 
     * @returns {number[]}
     */
    static horribleArraySorter(array) {
        let u = []
        for (let index = 0; index < array.length; index++) {
            const num = array[index]
            let g = system.runTimeout(() => {
                u.push(num)
                system.clearRun(g)
            }, num)
        }
        return u
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

    /**
     * @param {string} text 
     * @returns {string}
     */
    static uppercaseFirstLetter(text) {
        if (text.length == 0) return text
        return text.charAt(0).toUpperCase() + text.slice(1)
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

    /**Removes / Resets a player dynamic property
     * @param {Player} player 
     * @param {string} id 
     */
    static pRemove(player, id) {
        try {
            mcl.pSet(player, id, undefined)
            return true
        } catch {
            return false
        }
    }

    /**Gets a global data object
     * @param {string} id 
     * @returns {object | undefined}
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
        let cd = mcl.jsonWGet(id)
        if (!cd) cd = {}
        cd[updateKey] = data
        mcl.jsonWSet(id, cd)
    }

    /**Sets a player dynamic property
     * @param {Player} player
     * @param {string} id 
     * @param {boolean | number | string | Vector3} setTo
     */
    static pSet(player, id, setTo) {
        // mcl.wSet(`darkoak:${player.name}:${id}`, setTo)
        player.setDynamicProperty(id, setTo)
    }

    /**Gets a player dynamic property
     * @param {Player} player 
     * @param {string} id 
     */
    static pGet(player, id) {
        // return mcl.wGet(`darkoak:${player.name}:${id}`)
        return player.getDynamicProperty(id)
    }

    /**
     * @param {Player} player 
     * @param {string} id 
     * @param {object} data 
     * @returns {boolean} Whether it successfully saved or not
     */
    static jsonPSet(player, id, data) {
        try {
            mcl.pSet(player, id, JSON.stringify(data))
            return true
        } catch {
            return false
        }
    }

    /**
     * @param {Player} player 
     * @param {id} id 
     * @returns {object}
     */
    static jsonPGet(player, id) {
        const t = mcl.pGet(player, id)
        if (t === undefined) {
            return undefined
        } else {
            return JSON.parse(t)
        }
    }

    /**
     * 
     * @param {Player} player 
     * @param {string} id 
     * @param {string} updateKey 
     * @param {Object} data 
     */
    static jsonPUpdate(player, id, updateKey, data) {
        let cd = mcl.jsonPGet(player, id)
        if (!cd) cd = {}
        cd[updateKey] = data
        mcl.jsonPSet(player, id, cd)
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


    /**Gets scoreboard by objective
     * @param {string} objective 
     */
    static scoreboard(objective) {
        return world.scoreboard.getObjective(objective)
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
    static jsonListGetBoth(key = '') {
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
     * @param {string | undefined} key If defined, the properties id must start with 'key'
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
     * @param {string} tag If tag is defined, it returns all online players with the inputted tag
    */
    static playerNameArray(tag = undefined) {
        let players = []
        if (tag) {
            players = world.getPlayers({ tags: [tag] })
        } else {
            players = world.getAllPlayers()
        }

        let u = []
        for (let index = 0; index < players.length; index++) {
            u.push(players[index].name)
        }
        return u
    }

    /**Returns an array of a inputted players effects
     * @param {Player} player 
    */
    static playerEffectsArray(player) {
        const p = mcl.getPlayer(player)
        let u = []
        let e = p.getEffects()
        if (e.length == 0) return undefined
        for (let index = 0; index < e.length; index++) {
            u.push(e[index].displayName)
        }
        return u
    }

    /**Returns an array of a inputted players tags
     * @param {Player | undefined} player 
    */
    static playerTagsArray(player, filter = '') {
        if (player != undefined) {
            const tags = player.getTags()
            if (tags.length == 0) {
                return []
            } else {
                return tags.filter(e => e.startsWith(filter))
            }
        } else {
            let u = []
            let players = world.getAllPlayers()
            for (let index = 0; index < players.length; index++) {
                const tags = players[index].getTags().filter(e => e.startsWith(filter))
                if (tags.length == 0) continue
                for (let index = 0; index < tags.length; index++) {
                    if (u.includes(tags[index])) continue
                    u.push(tags[index])
                }
            }
            if (u.length === 0) {
                return []
            } else {
                return u
            }
        }
    }

    /**Checks if the inputted player is the host by checking its id
     * @param {Player | string} player Accepts a player or a players name, returns false if the player isn't the host
    */
    static isHost(player) {
        const p = (typeof player === 'string') ? mcl.getPlayer(player) : player
        if (!p) return false
        if (p.id == '-4294967295') {
            return true
        } else return false
    }

    /**Returns whether the inputted player has op permissions
     * @param {Player} player 
     * @returns {boolean}
     */
    static isOp(player) {
        if (player.playerPermissionLevel == PlayerPermissionLevel.Operator) {
            return true
        } else return false
    }

    /**Returns true if the player has the admin tag or if the player is the host
     * @param {Player | string} player 
     */
    static isDOBAdmin(player) {
        const p = (typeof player === 'string') ? mcl.getPlayer(player) : player
        if (!p) return false
        if (p.hasTag('darkoak:admin') || mcl.isHost(p)) {
            system.runTimeout(() => {
                p.addTag('darkoak:admin')
            })
            return true
        } else {
            return false
        }
    }

    /**Returns true if the player has the mod tag or if the player is the host
     * @param {Player | string} player 
     * @returns 
     */
    static isDOBMod(player) {
        const p = (typeof player === 'string') ? mcl.getPlayer(player) : player
        if (!p) return false
        if (p.hasTag('darkoak:mod') || mcl.isHost(p)) {
            system.runTimeout(() => {
                p.addTag('darkoak:mod')
            })
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
            if (player.getGameMode() == 'creative') {
                return true
            } else return false
        } else return false
    }

    /**Sends a private message to admins
     * @param {string} message 
     */
    static adminMessage(message) {
        const players = world.getPlayers({ tags: ['darkoak:admin'] })
        for (let index = 0; index < players.length; index++) {
            players[index].sendMessage(`§cAdmin Message:§r§f ${message}`)
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
    static getScoreOld(player, objective) {
        return world.scoreboard.getObjective(objective)?.getScore(player) || 0
    }

    /**Returns the held item
     * @param {Player} player 
     * @returns {ItemStack | undefined}
     */
    static getHeldItem(player) {
        return player.getComponent(EntityComponentTypes.Inventory).container.getItem(player.selectedSlotIndex)
    }

    /**Advanced container inventory
     * @param {Player} player 
     * @returns {Container}
     */
    static getItemContainer(player) {
        return player.getComponent(EntityComponentTypes.Inventory).container
    }

    /**Returns a players inventory in its entirety
     * @param {Player} player 
     */
    static getInventory(player) {
        return player.getComponent(EntityComponentTypes.Inventory)
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
     * @param {number} seconds Defaults to 1 second
     * @example mcl.secondsToTicks(5) // 100
     * @returns {number}
     */
    static secondsToTicks(seconds = 1) {
        return seconds * 20
    }

    /**Gets a signs data
     * @param {Block} block Block that should be a sign
     * @returns {{waxed: boolean, text: string, color: DyeColor} | undefined}
     */
    static getSign(block) {
        const signed = block.getComponent(BlockComponentTypes.Sign)
        if (!signed) return undefined
        return { waxed: signed.isWaxed, text: signed.getText(), color: signed.getTextDyeColor() }
    }

    /**Modifies a sign
     * @param {Block} block 
     * @param {boolean} wax 
     * @param {string} text 
     * @param {DyeColor} color 
     * @param {SignSide} side
     */
    static rewriteSign(block, wax = false, text = '', color = undefined, side = SignSide.Front) {
        const signed = block.getComponent(BlockComponentTypes.Sign)
        if (!signed) return
        signed.setWaxed(wax || signed.isWaxed)
        signed.setText(text || signed.getText(side), side)
        signed.setTextDyeColor(color, side)
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
    static getEntityByTypeId(typeId, dimension = { id: 'overworld' }) {
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
            if ((name === undefined || p.name == name) && (tag === undefined || p.hasTag(tag)) && (dimension === undefined || p.dimension.id == dimension)) {
                return p
            }
        }
        return undefined
    }

    /**Gets an entity by filters
     * @param {string} dimension 
     * @param {{name: string, tag: string}} param1 
     */
    static getEntityFiltered(dimension = 'overworld', { name, tag }) {
        const entities = world.getDimension(dimension).getEntities()
        for (let index = 0; index < entities.length; index++) {
            const e = entities[index]
            if ((name === undefined || e.nameTag == name) && (tag === undefined || e.hasTag(tag))) {
                return e
            }
        }
        return undefined
    }

    /**Returns a list of all players that have joined the world
     * @returns {string[]}
     */
    static getPlayerList() {
        return mcl.jsonWGet('darkoak:playerlist')
    }

    /**Returns a list of all admins
     * @returns {string[]}
     */
    static getAdminList() {
        return mcl.jsonWGet('darkoak:adminlist')
    }

    /**Returns a list of all moderators
     * @returns {string[]}
     */
    static getModList() {
        return mcl.jsonWGet('darkoak:modlist')
    }

    /**Returns a list of all banned players, or undefined if there are no bans
     * @returns {string[] | undefined} 
     */
    static getBanList() {
        const bans = mcl.listGetBoth('darkoak:bans:')
        if (!bans) return undefined

        let u = []
        for (let index = 0; index < bans.length; index++) {
            const ban = JSON.parse(bans[index].value)
            u.push(ban.player)
        }
        return u
    }

    /**Stops a players movements
     * @param {Player} player 
     */
    static stopPlayer(player) {
        const v = player.getVelocity()
        player.applyKnockback({ x: v.x * -1, z: v.z * -1 }, v.y * -1)
    }

    /**
     * @param {Player} player 
     */
    static getAllItems(player) {
        let u = []
        const items = mcl.getItemContainer(player)
        for (let index = 0; index < items.size; index++) {
            const item = items.getSlot(index).getItem()
            if (!item) continue
            u.push(item)
        }
        return u
    }

    /**
     * @param {Player} player 
     * @param {number} amount 
     */
    static addScore(player, amount) {
        mcl.pSet(player, 'darkoak:money', mcl.getScore(player) + parseInt(amount))
    }

    /**
     * @param {Player} player 
     * @param {number} amount 
     */
    static removeScore(player, amount) {
        mcl.pSet(player, 'darkoak:money', mcl.getScore(player) - parseInt(amount))
    }

    /**
     * @param {Player} player 
     * @param {number} amount 
     */
    static setScore(player, amount) {
        mcl.pSet(player, 'darkoak:money', parseInt(amount))
    }

    /**
     * @param {Player} player 
     * @returns {number}
     */
    static getScore(player) {
        return parseInt(mcl.pGet(player, 'darkoak:money')) || 0
    }

    /**
     * @param {Player} player Player that is buying
     * @param {number} price Price to buy the item
     * @param {string} result Item typeId to buy
     * @param {number} amount Amount of the item to give on buy
     * @returns {boolean} Whether the player successfully bought the item
     */
    static buy(player, price, result, amount) {
        if (isNaN(price)) return false
        if (mcl.getScore(player) < price) return false

        const mscore = mcl.jsonWGet('darkoak:moneyscore')
        mcl.removeScore(player, Math.floor(price * mscore.tax / 100))
        player.runCommand(`give @s ${result} ${amount}`)
        return true
    }

    /**
     * @param {Player} player Player selling the item
     * @param {number} price How much the item is selling for
     * @param {string} itemToSell The item thats being sold, typeId
     * @param {number} amount Amount required to sell
     * @param {string} returnItem Item to return to the player after selling, typeId
     * @param {number} returnAmount Amount of returnitems to return to the player
     * @returns {boolean} Whether the player successfully sold the item
     */
    static sell(player, price, itemToSell, amount, returnItem = '', returnAmount = 1) {
        if (isNaN(price) || isNaN(amount)) return false
        if (player.runCommand(`testfor @s [hasitem={item=${itemToSell},quantity=${amount}..}]`).successCount == 0) return false

        const mscore = mcl.jsonWGet('darkoak:moneyscore')
        player.runCommand(`clear @s ${itemToSell} ${amount}`)
        mcl.addScore(player, Math.floor(price * (1 - mscore.tax / 100)))

        if (returnItem) player.runCommand(`give @s ${returnItem} ${returnAmount}`)
        return true
    }

    /**Deconstructs a player to data
     * @param {Player} player 
     */
    static playerToData(player) {
        return {
            clientSystemInfo: player.clientSystemInfo,
            dimension: {
                heightRange: player.dimension.heightRange,
                id: player.dimension.id
            },
            xpEarnedAtCurrentLevel: player.xpEarnedAtCurrentLevel,
            graphicsMode: player.graphicsMode,
            id: player.id,
            inputInfo: {
                getMovementVector: player.inputInfo.getMovementVector(),
                lastInputModeUsed: player.inputInfo.lastInputModeUsed,
                touchOnlyAffectsHotbar: player.inputInfo.touchOnlyAffectsHotbar
            },
            isClimbing: player.isClimbing,
            typeId: player.typeId,
            totalXpNeededForNextLevel: player.totalXpNeededForNextLevel,
            getTags: player.getTags(),
            getAimAssist: player.getAimAssist(),
            name: player.name,
            nameTag: player.nameTag,
            isHost: mcl.isHost(player),
            getGameMode: player.getGameMode(),
            location: player.location,
            playerEffectsArray: mcl.playerEffectsArray(player),
            getAllItems: mcl.getAllItems(player),
            pListGetBoth: mcl.pListGetBoth(player)
        }
    }

    /**Gets a {id, value} pair from a starter id and a location, (also key)
     * @param {string} id Id to start with
     * @param {string} key JSON key that contains the location
     * @param {{x: number, y: number, z: number}} location Actual location to check, matches keylocation to this location
     */
    static getDataByLocation(id = '', key, location) {
        const dataArray = mcl.listGetBoth(id)
        for (let index = 0; index < dataArray.length; index++) {
            const d = JSON.parse(dataArray[index].value)
            if (d[key] == location) {
                return dataArray[index]
            } else continue
        }
        return undefined
    }

    /**Gets a block based on the specified location and dimension
     * @param {{x: number, y: number, z: number}} location Location of the block
     * @param {string} [dimension='overworld'] Dimension to get the block from, defaults to 'overworld'
     */
    static getBlock(location, dimension = 'overworld') {
        try {
            return world.getDimension(dimension).getBlock(location)
        } catch {
            return undefined
        }
    }

    /**
     * 
     * @param {Player} player 
     * @param {number} x 
     * @param {number} z 
     * @param {number} y 
     */
    static knockback(player, x, z, y) {
        player.applyKnockback({x: x, z: z}, y)
    }
}