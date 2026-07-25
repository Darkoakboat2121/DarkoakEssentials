import { world, system, BlockComponentTypes, Player, EntityComponentTypes, ItemUseAfterEvent, StartupEvent, Block, BlockVolume } from "@minecraft/server"
import { mcl } from "../logic"


/**
 * @param {Block} block 
 * @param {boolean} destroy 
 */
export function hardlightGen(block, destroy) {
    let alreadySeen = new Set()
    let sides = []
    sides = setSides(block)

    alreadySeen.add(JSON.stringify(block.location))


    function recursive(sides) {
        for (let index = 0; index < sides.length; index++) {
            const s = sides[index]
            if (s.typeId != 'darkoak:hardlight_generator') continue

            if (alreadySeen.has(JSON.stringify(s.location))) {
                continue
            }

            alreadySeen.add(JSON.stringify(s.location))
            sides = setSides(s)
            recursive(sides)
        }
    }
    recursive(sides)

    const dimen = block.dimension
    const points = farthestPair(Array.from(alreadySeen).map(e => e = JSON.parse(e)))


    // mcl.forLocationInside(points.pair[0], points.pair[1], (x, y, z) => {
    //     try {
    //         let replace = 'minecraft:air'
    //         let place = 'darkoak:hardlight'
    //         if (destroy) {
    //             replace = 'darkoak:hardlight'
    //             place = 'minecraft:air'
    //         }
    //         if (dimen.getBlock({
    //             x, y, z
    //         }).typeId === replace) dimen.setBlockType({
    //             x, y, z
    //         }, place)

    //     } catch {

    //     }
    // })

    try {
        const area = new BlockVolume(points.pair[0], points.pair[1])
        // dimen.runCommand(`fill ${points.pair[0].x} ${points.pair[0].y} ${points.pair[0].z} ${points.pair[1].x} ${points.pair[1].y} ${points.pair[1].z} ${mcl.decide(destroy, 'minecraft:air', 'darkoak:hardlight')} replace ${mcl.decide(destroy, 'darkoak:hardlight', 'minecraft:air')}`)
        dimen.fillBlocks(area, mcl.decide(destroy, 'minecraft:air', 'darkoak:hardlight'), {
            blockFilter: {
                includeTypes: [mcl.decide(destroy, 'darkoak:hardlight', 'minecraft:air')]
            }
        })
    } catch {

    }




    /**
     * @param {Block} b 
     * @returns {Block[]}
     */
    function setSides(b) {
        return [b.above(), b.below(), b.north(), b.south(), b.west(), b.east()]
    }


    function farthestPair(points) {
        let maxDist = -Infinity
        let pair = undefined

        const dist = (a, b) =>
            Math.sqrt(
                (a.x - b.x) ** 2 +
                (a.y - b.y) ** 2 +
                (a.z - b.z) ** 2
            )

        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const d = dist(points[i], points[j])
                if (d > maxDist) {
                    maxDist = d
                    pair = [points[i], points[j]]
                }
            }
        }

        return { pair: pair, distance: maxDist }
    }

}

/**
 * 
 * @param {StartupEvent} evd 
 */
export function hardlightGeneratorRegistry(evd) {
    evd.blockComponentRegistry.registerCustomComponent('darkoak:hardlight_generator', {
        onRedstoneUpdate: (evd, p) => {
            if (evd.firstUpdate) return
            if (evd.powerLevel > 0) {
                hardlightGen(evd.block, false)
            } else {
                hardlightGen(evd.block, true)
            }
        }
    })
}

