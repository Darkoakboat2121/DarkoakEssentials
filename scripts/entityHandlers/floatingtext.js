import { world, Player } from "@minecraft/server"
import { mcl } from "../logic"

/**
 * @param {Player[]} players 
 */
export function scoreboardHandler(players) {
    const texts = mcl.getAllEntities('darkoak:floating_text')
    if (!mcl.tickTimer(40)) return

    for (let index = 0; index < texts.length; index++) {
        try {
            const text = texts[index]
            const dp = text.getDynamicProperty('darkoak:floatingscore')
            if (!dp) continue
            const scoreToGet = JSON.parse(dp)
            let scoreArray = []
            for (let index = 0; index < players.length; index++) {
                const player = players[index]
                try {
                    scoreArray.push(`§a${player?.name}§j:§r ${world.scoreboard.getObjective(scoreToGet.score)?.getScore(player) || '0'}`)
                } catch {
                    scoreArray.push(`§a${player?.name}§j:§r 0`)
                }
            }
            scoreArray.sort((a, b) => {
                const scoreA = parseInt(a.split(':§r ')[1]) || 0
                const scoreB = parseInt(b.split(':§r ')[1]) || 0
                return scoreB - scoreA
            })
            text.nameTag = `${scoreToGet.text}\n${scoreArray.map((e, i) => `#${i + 1}. ${e}`).join('\n')}`
        } catch (e) {
            console.error(String(e))
        }
    }
}