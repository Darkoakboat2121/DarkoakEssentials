import * as external from "./external-logic"

// Example

// Your unique identifier
const uniqueName = "YOUR ID (Anything as long as its different from other ui's)"

// UI
const title = "PUT TITLE HERE"
const body = "PUT TITLE HERE"
const tag = "TAG TO OPEN"
const buttons = [
    {title: "BUTTON1 TITLE", command: "BUTTON1 COMMAND"},
    {title: "BUTTON2 TITLE", command: "BUTTON2 COMMAND"}
]

external.actionUI(uniqueName, title, body, tag, buttons)

// Example

