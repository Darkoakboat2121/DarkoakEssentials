import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { listGet, listGetValues, wGet, wSet } from "./logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet

// Defaults for ranks
export function chatRankDefaults() {
    for (const [index, cr] of listGetValues('darkoak:cr:').entries()) {
        if (cr === undefined) {
            const t = listGet('darkoak:cr:')
            wSet(t[index], '')
        }
    }

    if (wGet('darkoak:cr:defaultrank') === undefined) {
        wSet('darkoak:cr:defaultrank', 'New')
    }

    if (wGet('darkoak:cr:bridge') === undefined) {
        wSet('darkoak:cr:bridge', '->')
    }

    if (wGet('darkoak:cr:start') === undefined) {
        wSet('darkoak:cr:start', '[')
    }

    if (wGet('darkoak:cr:middle') === undefined) {
        wSet('darkoak:cr:middle', '][')
    }

    if (wGet('darkoak:cr:end') === undefined) {
        wSet('darkoak:cr:end', ']')
    }
}

