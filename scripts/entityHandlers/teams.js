import { world, Player, EntityComponentTypes, ItemUseAfterEvent, system, EntityHitEntityAfterEvent, EntityDamageCause, ItemComponentTypes, EnchantmentTypes, EffectTypes, ItemStack, Entity } from "@minecraft/server"
import { mcl } from "../logic"


export function entityTeams() {
    return
    const ents = mcl.getAllEntities(undefined, 'player')
    for (let index = 0; index < ents.length; index++) {
        const ent = ents[index]

        const teamed = checkIfTeamed(ent, ent.target)
        if (teamed.teamed) {
            ent.target = mcl.closestEntityToAnother(ent, {
                excludeTags: teamed.sameTags,
                maxDistance: 30
            })
        } else {
            ent.target = mcl.closestEntityToAnother(ent, {
                excludeTags: teamed.sameTags,
                maxDistance: 30
            })
        }
    }

    /**
     * @param {Entity} ent1 
     * @param {Entity} ent2 
     */
    function checkIfTeamed(ent1, ent2) {
        if (!ent1 || !ent2) return {
            teamed: false,
            sameTags: [],
            diffTags: ['darkoak:team1', 'darkoak:team2', 'darkoak:team3', 'darkoak:team4']
        }
        const tags1 = ent1.getTags().filter(e => e.startsWith('darkoak:team'))
        const tags2 = new Set(ent2.getTags().filter(e => e.startsWith('darkoak:team')))

        let same = []
        let diff = []
        for (let index = 0; index < tags1.length; index++) {
            const tag = tags1[index]
            if (tags2.has(tag)) {
                same.push(tag)
            } else diff.push(tag)
        }

        return {
            teamed: tags1.some(t => tags2.has(t)),
            sameTags: same,
            diffTags: diff
        }
    }
}

