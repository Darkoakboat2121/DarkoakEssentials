// qr_generator.js
// Minecraft Bedrock Script API - Version 1 QR (L) Alphanumeric QR generator
// Usage:
//   import { generateQR } from "./qr_generator.js";
//   generateQR("HELLO WORLD", { x: 0, y: 64, z: 0 });

import { world } from "@minecraft/server";

// -------------------- Config --------------------

const ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const SIZE = 21;              // Version 1
const DATA_BYTES = 19;        // V1-L
const EC_BYTES = 7;           // V1-L
const TOTAL_DATA_BITS = DATA_BYTES * 8;

// Generator polynomial for QR V1-L (degree 7) in GF(256)
const RS_GEN = [87, 229, 146, 149, 238, 102, 21];

// -------------------- Public API --------------------

export function generateQR(text, origin, dimensionId = "overworld") {
    const cleaned = text.toUpperCase();
    if (!isAlphanumeric(cleaned)) {
        throw new Error("Text contains non-alphanumeric characters not supported by QR alphanumeric mode.");
    }

    const bits = buildDataBits(cleaned);
    const dataBytes = bitsToBytes(bits);
    const ecBytes = reedSolomonEncode(dataBytes, EC_BYTES);

    const codewords = dataBytes.concat(ecBytes);

    const matrix = createEmptyMatrix(SIZE);
    addFinderPatterns(matrix);
    addTimingPatterns(matrix);
    addDarkModule(matrix);
    // Reserve format info areas (set to null but blocked from data placement)
    reserveFormatInfoAreas(matrix);

    placeDataBits(matrix, codewords);
    applyMask0(matrix);
    addFormatInfo(matrix, 0); // EC level L, mask pattern 0

    renderMatrix(matrix, origin, dimensionId);
}

// -------------------- Encoding --------------------

function isAlphanumeric(text) {
    for (const ch of text) {
        if (ALPHANUM.indexOf(ch) === -1) return false;
    }
    return true;
}

function encodeAlphanumeric(text) {
    let bits = "";

    for (let i = 0; i < text.length; i += 2) {
        const c1 = ALPHANUM.indexOf(text[i]);
        const c2 = (i + 1 < text.length) ? ALPHANUM.indexOf(text[i + 1]) : -1;

        if (c2 !== -1) {
            const v = c1 * 45 + c2;
            bits += v.toString(2).padStart(11, "0");
        } else {
            bits += c1.toString(2).padStart(6, "0");
        }
    }

    return bits;
}

function buildDataBits(text) {
    // Mode: 0010 (alphanumeric)
    let bits = "0010";

    // Character count: 9 bits for version 1–9 in alphanumeric mode
    bits += text.length.toString(2).padStart(9, "0");

    // Data
    bits += encodeAlphanumeric(text);

    // Terminator (up to 4 bits)
    bits += "0000";

    // Pad to byte boundary
    while (bits.length % 8 !== 0) bits += "0";

    // Pad bytes to reach total data bits
    const padBytes = ["11101100", "00010001"];
    let i = 0;
    while (bits.length < TOTAL_DATA_BITS) {
        bits += padBytes[i % 2];
        i++;
    }

    return bits;
}

function bitsToBytes(bits) {
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return bytes;
}

// -------------------- Reed–Solomon --------------------

function reedSolomonEncode(data, ecCount) {
    // Polynomial division of data(x) * x^ecCount by generator(x)
    const ec = new Array(ecCount).fill(0);

    for (let i = 0; i < data.length; i++) {
        const factor = data[i] ^ ec[0];
        ec.shift();
        ec.push(0);

        if (factor !== 0) {
            for (let j = 0; j < RS_GEN.length; j++) {
                ec[j] ^= gfMul(RS_GEN[j], factor);
            }
        }
    }

    return ec;
}

// GF(256) with primitive polynomial 0x11D
const GF_EXP = new Array(512);
const GF_LOG = new Array(256);

(function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11D;
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
})();

function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

// -------------------- Matrix construction --------------------

function createEmptyMatrix(size) {
    return Array.from({ length: size }, () => Array(size).fill(null));
}

function addFinderPatterns(m) {
    addFinder(m, 0, 0);
    addFinder(m, 0, SIZE - 7);
    addFinder(m, SIZE - 7, 0);
}

function addFinder(m, row, col) {
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
            const inBorder = (r === 0 || r === 6 || c === 0 || c === 6);
            const inCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            m[row + r][col + c] = inBorder || inCenter;
        }
    }
    // Separators (white) around finder
    for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
            const rr = row + r;
            const cc = col + c;
            if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) continue;
            if (rr >= row && rr < row + 7 && cc >= col && cc < col + 7) continue;
            if (m[rr][cc] === null) m[rr][cc] = false;
        }
    }
}

function addTimingPatterns(m) {
    for (let i = 8; i < SIZE - 8; i++) {
        const val = i % 2 === 0;
        if (m[6][i] === null) m[6][i] = val;
        if (m[i][6] === null) m[i][6] = val;
    }
}

function addDarkModule(m) {
    // Fixed dark module for version 1 at (8, 13)
    m[SIZE - 8][8] = true;
}

function reserveFormatInfoAreas(m) {
    // Top-left
    for (let i = 0; i <= 8; i++) {
        if (i !== 6) {
            m[8][i] = m[8][i] ?? false;
            m[i][8] = m[i][8] ?? false;
        }
    }
    // Top-right
    for (let i = 0; i < 7; i++) {
        m[8][SIZE - 1 - i] = m[8][SIZE - 1 - i] ?? false;
    }
    // Bottom-left
    for (let i = 0; i < 7; i++) {
        m[SIZE - 1 - i][8] = m[SIZE - 1 - i][8] ?? false;
    }
}

// -------------------- Data placement --------------------

function placeDataBits(matrix, codewords) {
    const bits = [];
    for (const b of codewords) {
        bits.push(...b.toString(2).padStart(8, "0"));
    }

    let bitIndex = 0;
    let col = SIZE - 1;
    let row = SIZE - 1;
    let dir = -1; // moving up

    while (col > 0) {
        if (col === 6) col--; // skip timing column

        for (let i = 0; i < 2; i++) {
            const c = col - i;
            const r = row;

            if (matrix[r][c] === null) {
                const bit = bitIndex < bits.length ? bits[bitIndex++] === "1" : false;
                matrix[r][c] = bit;
            }
        }

        row += dir;

        if (row < 0 || row >= SIZE) {
            row -= dir;
            dir *= -1;
            col -= 2;
        }
    }
}

// -------------------- Masking & format info --------------------

// Mask pattern 0: (row + col) % 2 == 0
function applyMask0(m) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (isFunctionModule(r, c)) continue;
            if ((r + c) % 2 === 0) {
                m[r][c] = !m[r][c];
            }
        }
    }
}

function isFunctionModule(r, c) {
    // Finder + separators
    if (r <= 8 && c <= 8) return true;
    if (r <= 8 && c >= SIZE - 8) return true;
    if (r >= SIZE - 8 && c <= 8) return true;

    // Timing
    if (r === 6 || c === 6) return true;

    // Dark module
    if (r === SIZE - 8 && c === 8) return true;

    // Format info areas
    if (r === 8 && c <= 8) return true;
    if (r <= 8 && c === 8) return true;
    if (r === 8 && c >= SIZE - 8) return true;
    if (r >= SIZE - 8 && c === 8) return true;

    return false;
}

// Format info for EC level L (01) and mask 0 (000)
// Raw format bits: 01 000 => 010000
// Full 15-bit format string after BCH + mask: 0b111011111000100 (0x3B4)
const FORMAT_BITS_L_MASK0 = "111011111000100";

function addFormatInfo(m, maskPattern) {
    const bits = FORMAT_BITS_L_MASK0;

    // Top-left (around finder)
    for (let i = 0; i <= 5; i++) {
        m[8][i] = bits[i] === "1";
    }
    m[8][7] = bits[6] === "1";
    m[8][8] = bits[7] === "1";
    m[7][8] = bits[8] === "1";
    for (let i = 9; i <= 14; i++) {
        m[14 - i][8] = bits[i] === "1";
    }

    // Top-right
    for (let i = 0; i < 8; i++) {
        m[8][SIZE - 1 - i] = bits[i] === "1";
    }

    // Bottom-left
    for (let i = 0; i < 7; i++) {
        m[SIZE - 1 - i][8] = bits[8 + i] === "1";
    }
}

// -------------------- Rendering --------------------

function renderMatrix(matrix, origin, dimensionId) {
    const dim = world.getDimension(dimensionId);

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const blockId = matrix[r][c] ? "minecraft:black_concrete" : "minecraft:white_concrete";
            const loc = {x: origin.x + c, y: origin.y, z: origin.z + r};
            dim.getBlock(loc)?.setType(blockId);
        }
    }
}
