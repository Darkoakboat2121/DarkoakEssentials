import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData, ModalFormResponse, MessageFormResponse, ActionFormResponse } from "@minecraft/server-ui"
import { mcl } from "../logic"

/**Baseplate UI, a class for making updates easier */
export class bui {

    /**Adds a dropdown to a ModalForm and returns the player list
     * @param {ModalFormData} f ModalFormData
     * @param {string | undefined} tag Tag for filtering
     * @param {string} text Dropdown text
     * @param {boolean | undefined} hasEmpty Whether to add an empty selector at the beginning
     * @param {string | undefined} tooltip Tooltip text
     * @returns {string[]} 
     */
    static namePicker(f, tag, text = '', hasEmpty = false, tooltip = '') {
        let p = mcl.playerNameArray(tag)
        if (hasEmpty) p.unshift('')
        bui.dropdown(f, text, p, 0, tooltip)
        return p
    }

    /**Adds a dropdown to a ModalForm and returns the offline included player list
     * @param {ModalFormData} f 
     * @returns {string[]} Player list
     */
    static offlineNamePicker(f, text = '', defaultIndex = 0, tooltip = '') {
        const p = mcl.getPlayerList()
        bui.dropdown(f, text, p, defaultIndex, tooltip)
        return p
    }

    /**Adds a dropdown to a ModalForm with dimensions and returns the dimensions
     * @param {ModalFormData} f 
     * @param {Player} player 
     * @param {boolean | undefined} showDefault 
     * @returns {string[]}
     */
    static dimensionPicker(f, player, showDefault = false) {
        const dimensions = ['overworld', 'nether', 'the_end']
        let def = 0
        if (showDefault) switch (player.dimension.id) {
            case 'overworld':
                def = 0
                break
            case 'nether':
                def = 1
                break
            case 'the_end':
                def = 2
                break
        }
        bui.dropdown(f, 'Dimension:', dimensions, def)
        return dimensions
    }

    /**Generic textfield
     * @param {ModalFormData} f 
     */
    static textField(f, label = '', placeholder = '', defaultText = '', tooltip = '') {
        return f.textField(label.toString() || '', placeholder.toString() || '', {
            tooltip: tooltip.toString() || '',
            defaultValue: defaultText.toString() || ''
        })
    }

    /**Generic dropdown
     * @param {ModalFormData} f 
     */
    static dropdown(f, label = '', options = [''], defaultIndex = 0, tooltip = '') {
        return f.dropdown(label.toString() || '', options.map(e => e.toString()) || [''], {
            defaultValueIndex: parseInt(defaultIndex.toString()) || 0,
            tooltip: tooltip.toString() || ''
        })
    }

    /**Generic slider
     * @param {ModalFormData} f 
     */
    static slider(f, label = '', minimum = 0, maximum = 10, defaultValue = minimum, valueStep = 1, tooltip = '') {
        return f.slider(label.toString() || '', parseInt(minimum) || 0, parseInt(maximum) || 0, {
            valueStep: parseInt(valueStep) || 1,
            defaultValue: parseInt(defaultValue) || 0,
            tooltip: tooltip.toString() || ''
        })
    }

    /**Generic title
     * @param {ModalFormData | ActionFormData | MessageFormData} f
     */
    static title(f, text = '') {
        return f.title(text.toString() || '')
    }

    /**Generic button
     * @param {ActionFormData} f 
     * @param {string | undefined} [image=undefined] 
     */
    static button(f, text = '', image = undefined) {
        return f.button(text.toString() || '', image)
    }

    /**Generic body
     * @param {MessageFormData | ActionFormData} f 
     */
    static body(f, text = '') {
        return f.body(text.toString() || '')
    }

    /**Generic label
     * @param {ModalFormData | ActionFormData} f 
     */
    static label(f, text = '') {
        return f.label(text.toString() || '')
    }

    /**Generic divider
     * @param {ModalFormData | ActionFormData} f 
     */
    static divider(f) {
        return f.divider()
    }

    /**Generic toggle
     * @param {ModalFormData} f 
     */
    static toggle(f, label = '', defaultValue = false, tooltip = '') {
        return f.toggle(label.toString() || '', {
            defaultValue: defaultValue || false,
            tooltip: tooltip.toString() || ''
        })
    }

    /**Filters for real values
     * @param {ModalFormResponse} evd 
     */
    static formValues(evd) {
        return evd.formValues.filter(e => e != null)
    }

    /**
     * @param {ActionFormData | ModalFormData} f 
     */
    static header(f, text = '') {
        return f.header(text.toString() || '')
    }

    /**Generic submitbutton
     * @param {ModalFormData} f 
     */
    static submitButton(f, text = '') {
        return f.submitButton(text.toString() || '')
    }

    /**Generic show, made by M
     * @param {MessageFormData | ActionFormData | ModalFormData} f 
     * @param {Player} player 
     */
    static show(f, player) {
        return f.show(player)
    }
}
