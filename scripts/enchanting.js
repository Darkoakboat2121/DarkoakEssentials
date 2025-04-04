import { world, system, Player } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "./logic"

const nerf = 4

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
        if (parts[0].trim().replace('§r§5', '') != 'On Hit') continue
        const amount = parseInt(parts[2])

        switch (parts[1]) {
            case 'Explode':
                world.getDimension(entity.dimension.id).createExplosion(entity.location, amount / nerf, { breaksBlocks: false, causesFire: false })
                break
            case 'Extra Damage':
                entity.applyDamage(amount)
                break
            case 'Dash':
                const lk = player.getViewDirection()
                player.applyKnockback(lk.x, lk.z, amount / nerf, 0)
                break
            case 'Extinguish':
                player.extinguishFire(false)
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
            if (parts[0].trim().replace('§r§5', '') != 'On Kill') continue
            const amount = parseInt(parts[2])

            switch (parts[1]) {
                case 'Explode':
                    world.getDimension(entity.dimension.id).createExplosion(entity.location, amount / nerf, { breaksBlocks: false, causesFire: false })
                    break
                case 'Extra Damage':
                    entity.applyDamage(amount)
                    break
                case 'Dash':
                    const lk = entity.getViewDirection()
                    entity.applyKnockback(lk.x, lk.z, 0, amount / nerf)
                    break
                case 'Extinguish':
                    entity.extinguishFire(false)
                    break

            }
        }

        // on kill
    } else if (evd.damageSource.damagingEntity === 'minecraft:player') {
        const player = evd.damageSource.damagingEntity
        const entity = evd.deadEntity

        const i = mcl.getHeldItem(player)
        if (i === undefined) return
        const item = i.getLore()
        if (item === undefined) return

        for (const enchant of item) {
            const parts = enchant.split('-')
            if (parts[0].trim().replace('§r§5', '') != 'On Kill') continue
            const amount = parseInt(parts[2])

            switch (parts[1]) {
                case 'Explode':
                    world.getDimension(player.dimension.id).createExplosion(entity.location, amount / nerf, { breaksBlocks: false, causesFire: false })
                    break
                case 'Extra Damage':
                    player.applyDamage(amount)
                    break
                case 'Dash':
                    const lk = player.getViewDirection()
                    player.applyKnockback(lk.x, lk.z, amount / nerf, 0)
                    break
                case 'Extinguish':
                    player.extinguishFire(false)
                    break

            }
        }
    }
})

world.afterEvents.itemUse.subscribe((evd) => {
    const player = evd.source

    const i = mcl.getHeldItem(player)
    if (i === undefined) return

    const item = i.getLore()
    if (item === undefined) return

    for (const enchant of item) {
        const parts = enchant.split('-')
        if (parts[0].trim().replace('§r§5', '') != 'On Use') continue
        const amount = parseInt(parts[2])

        switch (parts[1]) {
            case 'Explode':
                world.getDimension(player.dimension.id).createExplosion(player.location, amount / nerf, { breaksBlocks: false, causesFire: false })
                break
            case 'Extra Damage':
                player.applyDamage(amount)
                break
            case 'Dash':
                const lk = player.getViewDirection()
                player.applyKnockback(lk.x, lk.z, amount / nerf, 0)
                break
            case 'Extinguish':
                player.extinguishFire(false)
                break

        }
    }
})

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.isOnGround) mcl.pSet(player, 'darkoak:enchant:jumping', false)
        if (!player.isJumping || mcl.pGet(player, 'darkoak:enchant:jumping') === true) return
        mcl.pSet(player, 'darkoak:enchant:jumping', true)

        const i = mcl.getHeldItem(player)
        if (i === undefined) return
        const item = i.getLore()
        if (item === undefined) return

        for (const enchant of item) {
            const parts = enchant.split('-')
            if (parts[0].trim().replace('§r§5', '') != 'On Jump') continue
            const amount = parseInt(parts[2])

            switch (parts[1]) {
                case 'Explode':
                    world.getDimension(player.dimension.id).createExplosion(player.location, amount / nerf, { breaksBlocks: false, causesFire: false })
                    break
                case 'Extra Damage':
                    player.applyDamage(amount)
                    break
                case 'Dash':
                    const lk = player.getViewDirection()
                    player.applyKnockback(lk.x, lk.z, amount / nerf, 0)
                    break
                case 'Extinguish':
                    player.extinguishFire(false)
                    break

            }
        }

    }
})

world.afterEvents.entityHurt.subscribe((evd) => {
    if (evd.hurtEntity.typeId != 'minecraft:player') return
    if (!evd.damageSource.damagingEntity) return

    const player = evd.hurtEntity
    const entity = evd.damageSource.damagingEntity

    const i = mcl.getHeldItem(player)
    if (i === undefined) return
    const item = i.getLore()
    if (item === undefined) return

    for (const enchant of item) {
        const parts = enchant.split('-')
        if (parts[0].trim().replace('§r§5', '') != 'On Damaged') continue
        const amount = parseInt(parts[2])

        switch (parts[1]) {
            case 'Explode':
                world.getDimension(entity.dimension.id).createExplosion(entity.location, amount / nerf, { breaksBlocks: false, causesFire: false })
                break
            case 'Extra Damage':
                entity.applyDamage(amount)
                break
            case 'Dash':
                const lk = player.getViewDirection()
                player.applyKnockback(lk.x, lk.z, amount / nerf, 0)
                break
            case 'Extinguish':
                player.extinguishFire(false)
                break

        }
    }
})


export const customEnchantEvents = [
    "On Kill",
    "On Death",
    "On Hit",
    "On Use",
    "On Jump",
    "On Damaged"
]

export const customEnchantActions = [
    "Explode",
    "Extra Damage",
    "Dash",
    "Extinguish",
]