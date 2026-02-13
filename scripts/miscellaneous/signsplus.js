import { world, system, BlockComponentTypes } from "@minecraft/server"
import { mcl } from "../logic"
import { colorCodes } from "../data/arrays"

let signFrame = 0

export function signsPlus() {
    const signs = mcl.jsonListGetBoth('darkoak:signsplus:')

    for (let index = 0; index < signs.length; index++) {
        const d = signs[index]?.value
        if (!d) continue
        const block = mcl.getBlock(d?.location, d?.dimension)
        if (!block) continue
        const perm = block.permutation
        const sign = mcl.getSign(block)
        if (d?.spin?.enabled && mcl.tickTimer((d?.spin?.spinspeed || 20))) {
            if (d?.spin?.clockwise) {
                let num = (perm.getState('ground_sign_direction') + 1) % 16
                block.setPermutation(perm.withState('ground_sign_direction', num))
            } else if (!d?.spin?.clockwise) {
                let num = (perm.getState('ground_sign_direction') - 1) % 16
                if (num === -1) num = 15
                block.setPermutation(perm.withState('ground_sign_direction', num))
            }
        }

        if (d?.frame1?.f1 && mcl.tickTimer(20)) {
            const frames = ['frame1', 'frame2', 'frame3', 'frame4']
            let newLines = []

            // for (let index = 0; index < lines.length; index++) {
            //     const line = lines[index]
            //     /**@type {string[]} */
            //     const frames = [
            //         d[line]?.f1,
            //         d[line]?.f2,
            //         d[line]?.f3,
            //         d[line]?.f4,
            //     ].filter((e) => e)

            //     if (frames.length > 0) {
            //         const current = frames[framesI[line]]
            //         framesI[line] = (framesI + 1) % frames.length
            //         newLines.push(current)
            //     }
            // }
            const currentFrame = d[frames[signFrame]]
            newLines = [currentFrame?.f1, currentFrame?.f2, currentFrame?.f3, currentFrame?.f4].filter((e) => e)
            if (d?.color?.rainbow) {
                newLines = newLines.map((e) => {
                    const cc = colorCodes.filter(e => (e != '§k' && e != '§o' && e != '§l'))
                    const rc = `${cc[mcl.xorRandomNum(0, cc.length - 1)]}${e}`
                    return rc
                })
            }
            block.getComponent(BlockComponentTypes.Sign).setText(newLines.join('\n'))
        }
    }

    if (mcl.tickTimer(20)) {
        signFrame = (signFrame + 1) % 4
    }
}