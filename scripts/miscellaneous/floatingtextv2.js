import { world, system, BlockComponentTypes } from "@minecraft/server"
import { DebugBox, debugDrawer, DebugText } from "@minecraft/debug-utilities"
import { mcl } from "../logic"

export function renderTexts() {
    system.runTimeout(() => {
        debugDrawer.removeAll()
        const texts = mcl.jsonListGetBoth('darkoak:floatingtextv2:')
        for (let index = 0; index < texts.length; index++) {
            try {
                const text = texts[index].value
                const loc = text.location.split(' ').map(e => parseInt(e))
                let t = new DebugText({
                    dimension: world.getDimension(text.dimension),
                    x: loc[0],
                    y: loc[1],
                    z: loc[2],
                }, text.text)
                t.text = text.text
                t.scale = text.scale / 10

                if (text.color) {
                    const col = {
                        red: text.color.red / 100,
                        blue: text.color.blue / 100,
                        green: text.color.green / 100,
                    }
                    t.color = col
                }

                debugDrawer.addShape(t, world.getDimension(text.dimension))
            } catch (e) {
                mcl.debugLog('floatingtextv2', String(e))
                system.runTimeout(() => {
                    renderTexts()
                }, mcl.secondsToTicks(15))
            }
        }
    })
}

system.runTimeout(() => {
    renderTexts()
})