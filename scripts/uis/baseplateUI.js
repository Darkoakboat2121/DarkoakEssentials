import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData, ModalFormResponse, MessageFormResponse, ActionFormResponse } from "@minecraft/server-ui"
import { mcl } from "../logic"
import { cd } from "../data/defaults"

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
     * @param {string} [label=''] Text it shows above the textfield
     * @param {string} [placeholder=''] Translucent text that shows in the box as an example
     * @param {string} [defaultText=''] Text thats already put in the box by default
     * @param {string} [tooltip=''] Text that appears in the tooltip icon
     */
    static textField(f, label = '', placeholder = '', defaultText = '', tooltip = '') {
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        return f.textField(`${c?.textfieldcolor || ''}${label.toString()}` || '', `${placeholder.toString()}` || '', {
            tooltip: `${c?.textfieldtooltipcolor || ''}${tooltip.toString()}` || '',
            defaultValue: defaultText.toString() || ''
        })
    }

    /**Generic dropdown (in formvalues returns a number corresponding to the index picked)
     * @param {ModalFormData} f 
     */
    static dropdown(f, label = '', options = [''], defaultIndex = 0, tooltip = '') {
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        return f.dropdown(`${c?.dropdowncolor || ''}${label.toString()}` || '', options.map(e => e.toString()) || [''], {
            defaultValueIndex: parseInt(defaultIndex.toString()) || 0,
            tooltip: `${c?.dropdowntooltipcolor || ''}${tooltip.toString()}` || ''
        })
    }

    /**
     * @param {ModalFormData} f 
     * @param {Player} player 
     */
    static inventoryPicker(f, player, label = '', defaultIndex = 0, tooltip = '') {
        const inventory = mcl.getInventory(player).container
        let inven = []
        for (let index = 0; index < inventory.size; index++) {
            const i = inventory.getSlot(index).getItem()
            if (i) inven.push(`${i.nameTag || i.typeId} x${i.amount}`)
        }
        bui.dropdown(f, label, inven, defaultIndex, tooltip)
        return inventory
    }

    /**Generic slider
     * @param {ModalFormData} f 
     * @param {string} [label=''] Text that shows above the slider
     * @param {number} [minimum=0] The minimum amount the slider can be, must be an integer
     * @param {number} [maximum=10] The maximum amount the slider can be, must be an integer
     * @param {number} [defaultValue=minimum] The default value the slider will be at, most of the time it's a d?.namehere
     * @param {number} [valueStep=1] How many numbers it scrolls through, most of the time it's 1
     * @param {string} [tooltip=''] Tooltip icon text
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
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        let size = '§x§l§s§r'
        if (c?.normalsize) size = ''
        return f.title(`${size}${c?.titlecolor || ''}${text.toString()}` || '')
    }

    /**Generic button, there can be around 930 buttons before the UI breaks
     * @param {ActionFormData} f 
     * @param {string | undefined} [image=undefined] 
     */
    static button(f, text = '', image = undefined) {
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        return f.button(`${c?.buttoncolor || ''}${text.toString()}` || '', image)
    }

    /**Generic body
     * @param {MessageFormData | ActionFormData} f 
     */
    static body(f, text = '') {
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        return f.body(`${c?.bodycolor || ''}${text.toString()}` || '')
    }

    /**Generic label
     * @param {ModalFormData | ActionFormData} f 
     */
    static label(f, text = '') {
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        return f.label(`${c?.labelcolor || ''}${text.toString()}` || '')
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
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        return f.toggle(`${c?.togglecolor || ''}${label.toString()}` || '', {
            defaultValue: !!defaultValue || false,
            tooltip: `${c?.toggletooltipcolor || ''}${tooltip.toString()}` || ''
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
        const c = mcl.jsonWGet('darkoak:scriptsettings')
        return f.header(`${c?.headercolor || ''}${text.toString()}` || '')
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

    /**Don't use - P
     * @param {'modal' | 'action' | 'message'} type 
     */
    static new(type) {
        switch (type) {
            case 'modal':
                return new ModalFormData()
                break
            case 'action':
                return new ActionFormData()
                break
            case 'message':
                return new MessageFormData()
                break
        }
    }
}
