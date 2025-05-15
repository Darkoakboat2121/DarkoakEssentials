import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

export class bui {

    /**Adds a dropdown to a ModalForm and returns the player list
     * @param {ModalFormData} f ModalFormData
     * @param {string | undefined} tag Tag for filtering
     * @param {string} text Dropdown text
     * @param {boolean | undefined} hasEmpty Whether to add an empty selector at the beginning
     * @param {string | undefined} tooltip Tooltip text
     * @returns {string[]} 
     */
    static namePicker(f, tag, text, hasEmpty, tooltip) {
        let p = mcl.playerNameArray(tag)
        if (hasEmpty) p.unshift('')
        f.dropdown(text, p, {
            tooltip: tooltip || ''
        })
        return p
    }
}
