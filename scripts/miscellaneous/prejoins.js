
import { AsyncPlayerJoinBeforeEvent } from "@minecraft/server-admin"
import { mcl } from "../logic"
import * as arrays from "../data/arrays"
import * as worldSettings from "../world/worldSettings"

/**
 * @param {AsyncPlayerJoinBeforeEvent} evd 
 */
export function prejoinSystem(evd) {
    const name = evd?.name

    const w = mcl.jsonWGet('darkoak:welcome')
    if (!w?.prejoinSend) worldSettings.welcomeMessage(evd)

    const admins = mcl.getAdminList(true)
    if (admins.has(name)) {
        if (evd.isValid()) evd.allowJoin()
        return 'admins'
    }

    const d = mcl.jsonWGet('darkoak:anticheat')
    if (d?.antizd) {
        if (!name || name?.length < 1 || name === 'Steve') {
            if (evd.isValid()) evd.disconnect('Anti-ZD')
            return 'name length'
        }
        for (let index = 0; index < arrays.susNames.length; index++) {
            const n = arrays.susNames[index]
            if (name.includes(n)) {
                anticheat.log({ name: name }, `anti-ZD: ${name}`)
                if (evd.isValid()) evd.disconnect('Anti-ZD')
                return 'susnames'
            }
        }
    }

    if (d?.prebans && arrays.prebansSet.has(name)) {
        // const prebans = arrays.preBannedList
        // for (let index = 0; index < prebans.length; index++) {
        //     const preban = prebans[index]
        //     if (name === preban) {
        //         evd.disconnect('You\'ve Been Prebanned From This Server, Apply To Be Removed From The List Here: https://discord.gg/cE8cYYeFFx')
        //         return
        //     }
        // }
        if (evd.isValid()) evd.disconnect('You\'ve Been Prebanned From This Server, Apply To Be Removed From The List Here: https://discord.gg/cE8cYYeFFx')
        return 'prebans'
    }

    const bans = mcl.listGetBoth('darkoak:bans:')
    if (bans) {
        for (let index = 0; index < bans.length; index++) {
            const ban = bans[index]
            const data = JSON.parse(ban.value)
            if (data?.player != name) continue
            if (data?.time === 0) {
                if (evd.isValid()) evd.disconnect('You Are Permanently Banned')
                return 'perma banned'
            }
            if ((Date.now() - data?.timeOfBan) < data?.time) {
                const td = mcl.timeDifference(data?.timeOfBan + data?.time)
                if (evd.isValid()) evd.disconnect(`You\'ve Been Banned For "${data?.message}"\nYou Will Be Unbanned In ${Math.abs(td.hours) - 1}:${Math.abs(td.minutes)}:${Math.abs(td.seconds)}`)
                return 'time banned'
            } else {
                mcl.adminMessage(`${data.player}\'s Ban Has Expired`)
                mcl.wRemove(ban.id)
                return 'ban removed'
            }
        }
    }

    const whitelist = mcl.jsonWGet('darkoak:whitelist')
    if (whitelist?.enabled) {
        const wlp = whitelist?.whitelist.split(',').map(e => e.trim())
        if (!wlp.includes(name)) {
            if (evd.isValid()) evd.disconnect()
            return 'whitelist'
        }
    }

    if (w?.prejoinSend) worldSettings.welcomeMessage(evd)

    if (evd.isValid()) evd.allowJoin()
    return 'everything'
}