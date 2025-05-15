import { world, system, Player } from '@minecraft/server'
import { MessageFormData, ModalFormData, ActionFormData } from '@minecraft/server-ui'
import * as arrays from '../data/arrays'
import { mcl } from '../logic'
import { modalUIMakerUI } from './interfacesTwo'

export function modalUIAddElement(player, uiData) {
    let f = new ActionFormData()
    f.title('Add Element')

    f.button('Text Field')
    f.button('Toggle')
    f.button('Dropdown')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalUIMakerUI(player, uiData)
            return
        }

        switch (evd.selection) {
            case 0:
                addTextField(player, uiData)
                break
            case 1:
                addToggle(player, uiData)
                break
            case 2:
                addDropdown(player, uiData)
                break
        }
    })
}

export function addTextField(player, uiData) {
    let f = new ModalFormData()
    f.title('Add Text Field')

    f.textField('Label:', 'Example: Enter your name')
    f.textField('Placeholder:', 'Example: Steve')
    f.textField('Default Value:', '')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalUIAddElement(player, uiData)
            return
        }

        const e = evd.formValues
        uiData.elements.push({
            type: 'textField',
            label: e[0],
            placeholder: e[1],
            defaultValue: e[2]
        })

        modalUIMakerUI(player, uiData)
    })
}

export function addToggle(player, uiData) {
    let f = new ModalFormData()
    f.title('Add Toggle')

    f.textField('Label:', 'Example: Enable feature?')
    f.toggle('Default Value:', { defaultValue: false })

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalUIAddElement(player, uiData)
            return
        }

        const e = evd.formValues
        uiData.elements.push({
            type: 'toggle',
            label: e[0],
            defaultValue: e[1]
        })

        modalUIMakerUI(player, uiData)
    })
}

export function addDropdown(player, uiData) {
    let f = new ModalFormData()
    f.title('Add Dropdown')

    f.textField('Label:', 'Example: Choose an option')
    f.textField('Options (comma-separated):', 'Example: Option 1, Option 2, Option 3')
    f.textField('Default Value (index):', 'Example: 0')

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalUIAddElement(player, uiData)
            return
        }

        const e = evd.formValues
        uiData.elements.push({
            type: 'dropdown',
            label: e[0],
            options: e[1].split(',').map((opt) => opt.trim()),
            defaultValue: parseInt(e[2]) || 0
        })

        modalUIMakerUI(player, uiData)
    })
}


export function modalUIEditElements(player, uiData) {
    let f = new ActionFormData()
    f.title('Edit Elements')

    for (let i = 0; i < uiData.elements.length; i++) {
        const el = uiData.elements[i]
        f.button(`${el.type}: ${el.label}`)
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalUIMakerUI(player, uiData)
            return
        }
        editElement(player, uiData, evd.selection)
    })
}

export function editElement(player, uiData, index) {
    const element = uiData.elements[index]
    let f = new ModalFormData()
    f.title(`Edit ${element.type}`)

    f.textField('Label:', '', { defaultValue: element.label })

    if (element.type === 'textField') {
        f.textField('Placeholder:', '', {
            defaultValue: element.placeholder
        })
        f.textField('Default Value:', '', {
            defaultValue: element.defaultValue
        })
    } else if (element.type === 'toggle') {
        f.toggle('Default Value:', { 
            defaultValue: element.defaultValue
        })
    } else if (element.type === 'dropdown') {
        f.textField('Options (comma-separated):', '', {
            defaultValue: element.options.join(', ')
        })
        f.textField('Default Value (index):', '', {
            defaultValue: element.defaultValue.toString()
        })
    }

    f.show(player).then((evd) => {
        if (evd.canceled) return

        const e = evd.formValues
        element.label = e[0]

        if (element.type === 'textField') {
            element.placeholder = e[1]
            element.defaultValue = e[2]
        } else if (element.type === 'toggle') {
            element.defaultValue = e[1]
        } else if (element.type === 'dropdown') {
            element.options = e[1].split(',').map((opt) => opt.trim())
            element.defaultValue = parseInt(e[2]) || 0
        }

        modalUIMakerUI(player, uiData)
    })
}


export function saveModalUI(uiData) {
    mcl.jsonWSet(`darkoak:ui:modal:${mcl.timeUuid()}`, uiData)
}

export function previewModalUI(player, uiData) {
    let f = new ModalFormData()
    f.title(uiData.title)

    for (const el of uiData.elements) {
        if (el.type === 'textField') {
            f.textField(el.label, el.placeholder, { defaultValue: el.defaultValue })
        } else if (el.type === 'toggle') {
            f.toggle(el.label, { defaultValue: el.defaultValue })
        } else if (el.type === 'dropdown') {
            f.dropdown(el.label, el.options, { defaultValue: el.defaultValue })
        }
    }

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalUIMakerUI(player, uiData)
        }
    })
}

export function modalSettingsUI(player, uiData) {
    let f = new ModalFormData()
    f.title('Modal UI Settings')

    f.textField('Tag To Open:', 'Example: addstuffui', {
        defaultValue: uiData.tagToOpen
    })

    f.textField('Title:', 'Example: Add Stuff', {
        defaultValue: uiData.title
    })

    f.show(player).then((evd) => {
        if (evd.canceled) {
            modalUIMakerUI(player, uiData)
            return
        }

        const e = evd.formValues
        uiData.tagToOpen = e[0]
        uiData.title = e[1]

        modalUIMakerUI(player, uiData)
    })
}