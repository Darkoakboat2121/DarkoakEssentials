// import { world, system, Block } from "@minecraft/server";
// import { mcl } from "../../logic";

// let corrupt = new Set(); // use Set to avoid duplicates

// // When player places obsidian, start corruption at that block
// world.afterEvents.playerPlaceBlock.subscribe((evd) => {
//     const block = evd.block;
//     if (block.typeId !== "minecraft:obsidian") return;

//     corrupt.add(block.location)
// })

// system.runInterval(() => {
//     /**@type {import("@minecraft/server").Vector3[]} */
//     const toSet = Array.from(corrupt)
//     mcl.arraySpreader(toSet, 10, (e, i) => {
//         const s = world.getDimension('minecraft:overworld').getBlock(e)
//         const newBlocks = [s?.below(), s?.north(), s?.south(), s?.west(), s?.east()].filter(e => (e != undefined && e.typeId != 'minecraft:obsidian' && e.typeId === 'minecraft:air'))
//         for (let index = 0; index < newBlocks.length; index++) {
//             corrupt.add(newBlocks[index].location)
//         }
//         if (s?.typeId != 'minecraft:obsidian') s?.setType('minecraft:obsidian')
//     })
// }, 200)
