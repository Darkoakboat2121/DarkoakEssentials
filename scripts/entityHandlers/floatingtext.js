import { world, Player } from "@minecraft/server"
import { mcl } from "../logic"

/**
 * @param {Player[]} players 
 */
export function scoreboardHandler(players) {
    const texts = mcl.getAllEntities('darkoak:floating_text')

    for (let index = 0; index < texts.length; index++) {
        try {
            const text = texts[index]
            const scoreToGet = JSON.parse(text.getDynamicProperty('darkoak:floatingscore'))
            let scoreArray = []
            for (let index = 0; index < players.length; index++) {
                const player = players[index]
                scoreArray.push(`${player.name}: ${world.scoreboard.getObjective(scoreToGet.score)?.getScore(player) || '0'}`)
            }
            scoreArray.sort((a, b) => {
                const scoreA = parseInt(a.split(': ')[1]) || 0
                const scoreB = parseInt(b.split(': ')[1]) || 0
                return scoreB - scoreA
            })

            text.nameTag = `${scoreToGet.text}\n${scoreArray.join('\n')}`
        } catch {

        }
    }
}