import { world, system } from "@minecraft/server"

/**@type {Map<string, object>} */
let dbMap = new Map()
system.runInterval(() => {
    const properties = world.getDynamicPropertyIds()
    for (let index = 0; index < properties.length; index++) {
        const property = properties[index]
        dbMap.set(property, JSON.parse(world.getDynamicProperty(property)))
    }
}, 20)

export class DarkoakDB {

    /**
     * @param {string} id 
     */
    static wGet(id) {
        return dbMap.get(id)
    }

    /**
     * @param {string} id 
     * @param {any} data 
     */
    static wSet(id, data) {
        world.setDynamicProperty(id, JSON.stringify(data))
    }

    static pGet() {
        
    }
}