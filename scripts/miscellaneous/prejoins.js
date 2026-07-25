
import { AsyncPlayerJoinBeforeEvent } from "@minecraft/server-admin"
import { mcl } from "../logic"
import * as arrays from "../data/arrays"
import * as worldSettings from "../world/worldSettings"
import { log } from "../world/anticheat"
import { system } from "@minecraft/server"

export let pfidMap = new Map()
export let pfidSet = new Set()

/**
 * @param {AsyncPlayerJoinBeforeEvent} evd 
 */
export function prejoinSystem(evd) {
    const name = evd?.name

    pfidMap.set(name, mcl.stringEncrypt(evd?.persistentId))

    const w = mcl.jsonWGet('darkoak:welcome')
    if (!w?.prejoinSend) worldSettings.welcomeMessage(evd)

    const admins = mcl.getAdminList(true)
    if (admins.has(name)) {
        if (evd.isValid()) evd.allowJoin()
        return 'Player was an admin and skipped checks'
    }

    const d = mcl.jsonWGet('darkoak:anticheat')
    if (d?.antizd) {
        if (!name || name?.length < 1 || name?.length > 16) {
            if (evd.isValid()) disconnect('Anti-ZD')
            return `Name length too short: ${name?.length}`
        }
        for (let index = 0; index < arrays.susNames.length; index++) {
            const n = arrays.susNames[index]
            if (name.includes(n)) {
                log({ name: name }, `anti-ZD: ${name}`)
                if (evd.isValid()) disconnect('Anti-ZD')
                return `Name included "${n}" which is an illegal character`
            }
        }
        if (!evd?.persistentId) { // pfidset wont work cause if rejoining, they use the same pfid, check the map instead for comparing name to value, and ofc add extra pfid checks
            if (evd.isValid()) disconnect('Anti-ZD')
            return `No PFID or invalid PFID, length: ${evd?.persistentId?.length}`
        }

        // checks if the player is still waiting after around 10 seconds
        system.runTimeout(() => {
            try {
                if (evd?.isValid()) {
                    disconnect('Anti-ZD')
                    return `Took too long to join`
                }
            } catch {

            }
        }, 200)

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
        if (evd.isValid()) disconnect('You\'ve Been Prebanned From This Server, Apply To Be Removed From The List Here: https://discord.gg/cE8cYYeFFx')
        return `User is prebanned`
    }

    const bans = mcl.listGetBoth('darkoak:bans:')
    if (bans) {
        for (let index = 0; index < bans.length; index++) {
            const ban = bans[index]
            const data = JSON.parse(ban.value)
            if (data?.player != name) continue
            if (data?.time === 0) {
                if (data?.ghost) {
                    if (evd.isValid()) disconnect('An unspecified error has occurred.')
                } else {
                    if (evd.isValid()) disconnect(`You Are Permanently Banned For "${data?.message ?? 'No Message Provided'}"`)
                }
                return `User is perma banned from this server`
            }
            if ((Date.now() - data?.timeOfBan) < data?.time) {
                const td = mcl.timeDifference(data?.timeOfBan + data?.time)
                if (data?.ghost) {
                    if (evd.isValid()) disconnect('An unspecified error has occurred.')
                } else {
                    if (evd.isValid()) disconnect(`You\'ve Been Banned For "${data?.message ?? 'No Message Provided'}"\nYou Will Be Unbanned In ${Math.abs(td.hours) - 1}:${Math.abs(td.minutes)}:${Math.abs(td.seconds)}`)
                }
                return `User has ban time remaining`
            } else {
                mcl.adminMessage(`${data.player}\'s Ban Has Expired`)
                mcl.wRemove(ban.id)
                return `Users ban has been removed`
            }
        }
    }

    const whitelist = mcl.jsonWGet('darkoak:whitelist')
    if (whitelist?.enabled) {
        const wlp = whitelist?.whitelist.split(',').map(e => e.trim())
        if (!wlp.includes(name)) {
            if (evd.isValid()) disconnect('This World Has A Whitelist Enabled.')
            return `User is not on whitelist`
        }
    }

    if (w?.prejoinSend) worldSettings.welcomeMessage(evd)

    if (evd.isValid()) evd.allowJoin()
    return `Passed all checks`

    function disconnect(message = undefined) {
        try {
            if (evd.isValid()) evd.disallowJoin(message)
        } catch (e) {
            mcl.debugLog('PREJOINS FAILED 1', String(e))
        }
        try {
            if (evd.isValid()) evd.disconnect(message)
        } catch (e) {
            mcl.debugLog('PREJOINS FAILED 2', String(e))
        }
    }
}