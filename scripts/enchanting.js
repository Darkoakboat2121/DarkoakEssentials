import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "./logic"

world.afterEvents.entityHitEntity.subscribe((evd) => {
    if (evd.damagingEntity.typeId != 'minecraft:player') return

    const player = evd.damagingEntity
    const entity = evd.hitEntity


    const i = mcl.getHeldItem(player)
    if (i === undefined) return
    const item = i.getLore()
    if (item === undefined) return

    for (const enchant of item) {
        const parts = enchant.split('-')
        if (parts[0].trim().replace('§r§5', '') != 'On Hit') return
        const amount = parseInt(parts[2])

        switch (parts[1]) {
            case 'Explode':
                world.getDimension(entity.dimension.id).createExplosion(entity.location, amount, { breaksBlocks: false, causesFire: false })
                break
            case 'Extra Damage':
                entity.applyDamage(amount)
                break
            case 'Dash':
                const lk = player.getViewDirection()
                player.applyKnockback(lk.x, lk.z, amount / 2, 0)
                break
            case 'Extinguish':
                player.extinguishFire(false)
                break
            case 'Pull':
                const direction = {
                    x: player.location.x - entity.location.x,
                    z: player.location.z - entity.location.z
                }
                const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2)
                const normal = {
                    x: direction.x / magnitude,
                    z: direction.z / magnitude
                }
                entity.applyKnockback(normal.x, normal.z, amount, 0.5)
                break
        }
    }
})

world.afterEvents.entityDie.subscribe((evd) => {
    if (!evd.damageSource.damagingEntity) return

    // on death
    if (evd.deadEntity.typeId === 'minecraft:player') {

        const entity = evd.damageSource.damagingEntity
        const player = evd.deadEntity

        const i = mcl.getHeldItem(player)
        if (i === undefined) return
        const item = i.getLore()
        if (item === undefined) return

        for (const enchant of item) {
            const parts = enchant.split('-')
            if (parts[0].trim().replace('§r§5', '') != 'On Kill') return
            const amount = parseInt(parts[2])

            switch (parts[1]) {
                case 'Explode':
                    world.getDimension(entity.dimension.id).createExplosion(entity.location, amount, { breaksBlocks: false, causesFire: false })
                    break
                case 'Extra Damage':
                    entity.applyDamage(amount)
                    break
                case 'Dash':
                    const lk = entity.getViewDirection()
                    entity.applyKnockback(lk.x, lk.z, 0, amount / 2)
                    break
                case 'Extinguish':
                    entity.extinguishFire(false)
                    break
            }
        }

    // on kill
    } else {
        const player = evd.damageSource.damagingEntity
        const entity = evd.deadEntity

        const i = mcl.getHeldItem(player)
        if (i === undefined) return
        const item = i.getLore()
        if (item === undefined) return

        for (const enchant of item) {
            const parts = enchant.split('-')
            if (parts[0].trim().replace('§r§5', '') != 'On Kill') return
            const amount = parseInt(parts[2])

            switch (parts[1]) {
                case 'Explode':
                    world.getDimension(player.dimension.id).createExplosion(entity.location, amount, { breaksBlocks: false, causesFire: false })
                    break
                case 'Extra Damage':
                    player.applyDamage(amount)
                    break
                case 'Dash':
                    const lk = player.getViewDirection()
                    player.applyKnockback(lk.x, lk.z, amount / 2, 0)
                    break
                case 'Extinguish':
                    player.extinguishFire(false)
                    break
                
            }
        }
    }
})


export const customEnchantEvents = [
    "On Kill",
    "On Death",
    "On Hit",
]

export const customEnchantActions = [
    "Explode",
    "Extra Damage",
    "Dash",
    "Extinguish",
    "Pull",
    "Stop",
    "Rotate",
]