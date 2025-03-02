import * as MCL from "../logic"

/**Save function. Put your variable names in each slot
 * @param {string} id Your unique identifier
 *  @param {string} title UI title
 *  @param {string} body UI body text
 *  @param {string} tag Tag to open the UI
 *  @param {Array} buttons Buttons with commands
 */
function save(id, title, body, tag, buttons) {
    MCL.mcl.jsonWSet(`darkoak:ui:action:external:${name}`, {title, body, tag, buttons})
}
// DO NOT TOUCH ANYTHING ABOVE THIS //



// Example

// Your unique identifier
const id = "YOUR USERNAME"

// UI
const title = "PUT TITLE HERE"
const body = "PUT TITLE HERE"
const tag = "TAG TO OPEN"
const buttons = [
    {title: "BUTTON1 TITLE", command: "BUTTON1 COMMAND"},
    {title: "BUTTON2 TITLE", command: "BUTTON2 COMMAND"}
]

save(id, title, body, tag, buttons)

// Example

