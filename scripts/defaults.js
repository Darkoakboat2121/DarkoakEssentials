import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "./logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet

// Defaults for ranks
export function chatRankDefaults() {
    if (mcl.wGet('darkoak:cr:defaultrank') === undefined) {
        mcl.wSet('darkoak:cr:defaultrank', 'New')
    }

    if (mcl.wGet('darkoak:cr:bridge') === undefined) {
        mcl.wSet('darkoak:cr:bridge', '->')
    }

    if (mcl.wGet('darkoak:cr:start') === undefined) {
        mcl.wSet('darkoak:cr:start', '[')
    }

    if (mcl.wGet('darkoak:cr:middle') === undefined) {
        mcl. wSet('darkoak:cr:middle', '][')
    }

    if (mcl.wGet('darkoak:cr:end') === undefined) {
        mcl.wSet('darkoak:cr:end', ']')
    }
}

