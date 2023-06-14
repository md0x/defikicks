const bs58 = require("bs58")

// This is a helper function that converts a multihash to a hex string.
// To be used when adding a permitted action
// https://lit-protocol.calderaexplorer.xyz/address/0x4Aed2F242E806c58758677059340e29E6B5b7619/write-contract#address-tabs
function getBytesFromMultihash(multihash) {
    const decoded = bs58.decode(multihash)
    return `0x${Buffer.from(decoded).toString("hex")}`
}
