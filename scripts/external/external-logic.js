import { world, system } from "@minecraft/server"
import { MessageFormData, ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { mcl } from "../logic"

/**Save function. Put your variable names in each slot
 *  @param {string} id Your unique identifier
 *  @param {string} title UI title
 *  @param {string} body UI body text
 *  @param {string} tag Tag to open the UI
 *  @param {Array<{title: string, command: MinecraftCommand}>} buttons Buttons with commands
 */
export function actionUI(id, title, body, tag, buttons) {
    mcl.jsonWSet(`darkoak:ui:action:external:${id}`, {title, body, tag, buttons})
}

/**
 * @param {string} id 
 * @param {string} title 
 * @param {string} body 
 * @param {string} button1 
 * @param {string} button2 
 * @param {MinecraftCommand} command1 
 * @param {MinecraftCommand} command2 
 */
export function messageUI(id, title, body, button1, button2, command1, command2) {
    mcl.jsonWSet(`darkoak:ui:message:external:${id}`, {title, body, button1, button2, command1, command2})
}