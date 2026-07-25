import { world, system, Player } from "@minecraft/server"
import { mcl } from "../logic"


/**pentabyte (trademarked) letters */
export const letters = {
    ' ': [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
    ],
    ',': [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 1, 0,
        0, 1, 0, 0,
    ],
    '.': [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 1, 0,
    ],
    '?': [
        0, 0, 1, 1, 0, 0,
        0, 1, 0, 0, 1, 0,
        0, 0, 0, 1, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 1, 0, 0,
    ],
    '!': [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 0, 0,
        0, 1, 0,
    ],
    ':': [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
    ],
    ';': [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
        0, 1, 0,
        0, 1, 0,
    ],
    '|': [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
    ],
    '\'': [
        0, 0, 1, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ],
    '/': [
        0, 0, 0, 1, 0,
        0, 0, 1, 1, 0,
        0, 0, 1, 0, 0,
        0, 1, 1, 0, 0,
        0, 1, 0, 0, 0,
    ],
    '\\': [
        0, 1, 0, 0, 0,
        0, 1, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 1, 0,
        0, 0, 0, 1, 0,
    ],
    '-': [
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 1, 1, 1, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
    ],
    '_': [
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 1, 1, 1, 0,
    ],
    '(': [
        0, 0, 1, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
    ],
    ')': [
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 1, 0, 0,
    ],
    'a': [
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
    ],
    'b': [
        0, 1, 1, 0, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 0, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 0, 0,
    ],
    'c': [
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 1, 1, 1, 0,
    ],
    'd': [
        0, 1, 1, 0, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 0, 0,
    ],
    'e': [
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 1, 1, 0,
    ],
    'f': [
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 0, 0, 0,
    ],
    'g': [
        0, 1, 1, 1, 0, 0,
        0, 1, 0, 0, 0, 0,
        0, 1, 0, 1, 1, 0,
        0, 1, 0, 0, 1, 0,
        0, 1, 1, 1, 1, 0,
    ],
    'h': [
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
    ],
    'i': [
        0, 1, 1, 1, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 1, 1, 1, 0,
    ],
    'j': [
        0, 0, 1, 1, 1, 0,
        0, 0, 0, 1, 0, 0,
        0, 0, 0, 1, 0, 0,
        0, 1, 0, 1, 0, 0,
        0, 1, 1, 1, 0, 0,
    ],
    'k': [
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 0, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
    ],
    'l': [
        0, 1, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 1, 1, 1, 0,
    ],
    'm': [
        0, 1, 1, 0, 1, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
    ],
    'n': [
        0, 1, 0, 0, 1, 0,
        0, 1, 1, 0, 1, 0,
        0, 1, 0, 1, 1, 0,
        0, 1, 0, 0, 1, 0,
        0, 1, 0, 0, 1, 0,
    ],
    'o': [
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
    ],
    'p': [
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 0, 0, 0,
    ],
    'q': [
        0, 1, 1, 1, 1, 0,
        0, 1, 0, 0, 1, 0,
        0, 1, 0, 0, 1, 0,
        0, 1, 0, 1, 0, 0,
        0, 1, 1, 0, 1, 0,
    ],
    'r': [
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
        0, 1, 1, 0, 0,
        0, 1, 0, 1, 0,
    ],
    's': [
        0, 0, 1, 1, 1, 0,
        0, 1, 0, 0, 0, 0,
        0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 1, 0,
        0, 1, 1, 1, 0, 0,
    ],
    't': [
        0, 1, 1, 1, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
    ],
    'u': [
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
    ],
    'v': [
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 0, 1, 0, 0,
    ],
    'w': [
        0, 1, 0, 1, 0, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
        0, 0, 1, 0, 1, 0, 0,
    ],
    'x': [
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 0, 1, 0, 0,
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
    ],
    'y': [
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
    ],
    'z': [
        0, 1, 1, 1, 1, 0,
        0, 0, 0, 0, 1, 0,
        0, 0, 0, 1, 0, 0,
        0, 0, 1, 0, 0, 0,
        0, 1, 1, 1, 1, 0,
    ],
    '0': [
        0, 1, 1, 1, 1, 1, 0,
        0, 1, 0, 0, 1, 1, 0,
        0, 1, 0, 1, 0, 1, 0,
        0, 1, 1, 0, 0, 1, 0,
        0, 1, 1, 1, 1, 1, 0,
    ],
    '1': [
        0, 0, 1, 0, 0,
        0, 1, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        0, 1, 1, 1, 0,
    ],
    '2': [
        0, 0, 1, 1, 0, 0,
        0, 1, 0, 0, 1, 0,
        0, 0, 0, 1, 0, 0,
        0, 0, 1, 0, 0, 0,
        0, 1, 1, 1, 1, 0,
    ],
    '3': [
        0, 1, 1, 0, 0,
        0, 0, 0, 1, 0,
        0, 1, 1, 0, 0,
        0, 0, 0, 1, 0,
        0, 1, 1, 0, 0,
    ],
    '4': [
        0, 1, 0, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
        0, 0, 0, 1, 0,
        0, 0, 0, 1, 0,
    ],
    '5': [
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 1, 1, 0,
        0, 0, 0, 1, 0,
        0, 1, 1, 1, 0,
    ],
    '6': [
        0, 1, 1, 1, 0,
        0, 1, 0, 0, 0,
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
    ],
    '7': [
        0, 1, 1, 1, 1, 0,
        0, 0, 0, 0, 1, 0,
        0, 0, 0, 1, 0, 0,
        0, 0, 1, 0, 0, 0,
        0, 1, 0, 0, 0, 0,
    ],
    '8': [
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
    ],
    '9': [
        0, 1, 1, 1, 0,
        0, 1, 0, 1, 0,
        0, 1, 1, 1, 0,
        0, 0, 0, 1, 0,
        0, 0, 0, 1, 0,
    ],
}


/**
 * @param {Player} player 
 * @param {{x: number, y: number, z: number}} loc 
 * @param {string[]} text
 */
export function generateMapText(player, loc, text) {
    const centerX = Math.round(loc.x / 128) * 128
    const centerZ = Math.round(loc.z / 128) * 128
    const topCorner = {
        x: centerX - 64,
        y: loc.y,
        z: centerZ - 63,
    }
    const bottomCorner = {
        x: centerX + 64,
        y: loc.y,
        z: centerZ + 64,
    }

    player.sendMessage('§aCleaning Map Area')
    let toClean = new Set()
    let cleanAmount = 0
    for (let x = topCorner.x; x <= bottomCorner.x; x++) {
        for (let z = topCorner.z; z <= bottomCorner.z; z++) {
            const pos = { x, y: topCorner.y, z }
            cleanAmount++
            try {
                const b = player.dimension.getBlock(pos)
                if (b.typeId === 'minecraft:air') continue
            } catch {
                
            }
            toClean.add(JSON.stringify(pos))
            // player.dimension.setBlockType(pos, 'minecraft:air')
        }
    }

    let cleaned = 0
    let failsafe = 0
    const toCleanArray = Array.from(toClean)

    clean()

    function clean() {
        mcl.arraySpreader3(toCleanArray, 5, (e, i) => {
            const pos = JSON.parse(e)
            mcl.loader(pos, player.dimension, () => {
                player.dimension.setBlockType(pos, 'minecraft:air')
                cleaned++
            }, 10)
            if (i === toCleanArray.length - 1) {
                if (cleaned < cleanAmount && failsafe < 4) {
                    clean()
                    failsafe++
                    cleaned = 0
                    return
                }
                player.sendMessage('§aGenerating Map')
                actGen()
            }
        })
    }

    function actGen() {
        const letterHeight = 5
        const letterSpacing = 0
        const lineSpacing = 2

        let toPlace = new Set()
        let placeAmount = 0

        for (let lineIdx = 0; lineIdx < text.length; lineIdx++) {
            const line = text[lineIdx]
            let xOffset = 0
            for (let charIdx = 0; charIdx < line.length; charIdx++) {
                const l = line[charIdx]
                const letter = letters[l]
                if (!letter) continue // skip unknown chars

                const letterWidth = letter.length / 5

                const startX = topCorner.x + xOffset
                const startZ = topCorner.z + lineIdx * (letterHeight + lineSpacing)

                for (let row = 0; row < letterHeight; row++) {
                    for (let col = 0; col < letterWidth; col++) {
                        const i = row * letterWidth + col
                        const blockPos = {
                            x: startX + col,
                            y: topCorner.y,
                            z: startZ + row,
                        }
                        if (letter[i] === 1) {
                            placeAmount++
                            toPlace.add(JSON.stringify(blockPos))
                        }
                    }
                }
                xOffset += letterWidth + letterSpacing
            }
        }

        
        let placed = 0
        let failsafe2 = 0
        const toPlaceArray = Array.from(toPlace)

        attempt()

        function attempt() {
            mcl.arraySpreader3(toPlaceArray, 10, (e, i) => {
                const pos = JSON.parse(e)
                mcl.loader(pos, player.dimension, () => {
                    player.dimension.setBlockType(pos, 'minecraft:black_concrete')
                    placed++
                }, 10)
                if (i === toPlaceArray.length - 1) {
                    if (placed < placeAmount && failsafe2 < 4) {
                        attempt()
                        failsafe2++
                        placed = 0
                        return
                    }
                    player.sendMessage('§aGenerated!')
                }
            })
        }
    }

}
