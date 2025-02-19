import { world, system } from "@minecraft/server"
import { MessageFormData, ModalFormData, ActionFormData } from "@minecraft/server-ui"
import { mcl } from "./logic"

// This file sets all dynamic propertys to their default state if they havent been setup yet and it manages data size / limits

// Defaults for ranks
export function chatRankDefaults() {
    if (mcl.wGet('darkoak:cr:defaultrank') === undefined) {
        mcl.wSet('darkoak:cr:defaultrank', 'New')
    }

    if (mcl.wGet('darkoak:cr:bridge') === undefined) {
        mcl.wSet('darkoak:cr:bridge', '->')
    }

    if (mcl.wGet('darkoak:cr:start') === undefined) {
        mcl.wSet('darkoak:cr:start', '[')
    }

    if (mcl.wGet('darkoak:cr:middle') === undefined) {
        mcl.wSet('darkoak:cr:middle', '][')
    }

    if (mcl.wGet('darkoak:cr:end') === undefined) {
        mcl.wSet('darkoak:cr:end', ']')
    }
}

export function welcomeMessageDefaults() {
    if (mcl.wGet('darkoak:welcome') === undefined) {
        mcl.wSet('darkoak:welcome', '')
    }
}

export function logcheck() {
    const logs = mcl.listGetValues('darkoak:log:');
    if (logs.length <= 20) return;

    // Parse the log entries and find the smallest value
    const parsedLogs = logs.map((log, index) => {
        const parts = log.split('|');
        const timestamp = parseInt(parts[1], 10);
        return { index, timestamp, log };
    });

    // Find the log entry with the smallest timestamp
    const smallestLog = parsedLogs.reduce((min, log) => log.timestamp < min.timestamp ? log : min, parsedLogs[0]);

    // Delete the log entry with the smallest timestamp
    mcl.wSet(mcl.listGet('darkoak:log:')[smallestLog.index], undefined);
}

system.runInterval(() => {
    const byte = world.getDynamicPropertyTotalByteCount()
    if (byte > 10000) {
        mcl.adminMessage(`Possibly Dangerous Property Count: ${byte.toString()}, Please Print The World Data`)
    }
}, 6000)