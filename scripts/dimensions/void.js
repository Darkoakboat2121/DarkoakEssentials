import { world, system, StartupEvent } from "@minecraft/server"

/**
 * 
 * @param {StartupEvent} evd 
 */
export function voidCreation(evd) {
    evd.dimensionRegistry.registerCustomDimension('darkoak:void')
}