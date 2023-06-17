import { Ed25519Provider } from "key-did-provider-ed25519"
import * as KeyResolver from "key-did-resolver"
import { DID } from "dids"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { CeramicClient } from "@ceramicnetwork/http-client"

export async function getTileContent(family: string, tag: string) {
    const seed = require("crypto").createHash("sha256").update("DefiKicks").digest()

    const provider = new Ed25519Provider(seed)
    const did = new DID({ provider, resolver: KeyResolver.getResolver() })

    // Authenticate with the provider
    await did.authenticate()
    const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com")

    ceramic.did = did

    const document = await TileDocument.deterministic(ceramic, {
        // A single controller must be provided to reference a deterministic document
        controllers: [ceramic.did.id.toString()],
        // A family or tag must be provided in addition to the controller
        family: family,
        tags: [tag],
    })
    return document.content
}

export async function saveTileContent(
    family: string,
    tag: string,
    newContent: { [key: string]: any }
) {
    const seed = require("crypto").createHash("sha256").update("DefiKicks").digest()

    const provider = new Ed25519Provider(seed)
    const did = new DID({ provider, resolver: KeyResolver.getResolver() })

    // Authenticate with the provider
    await did.authenticate()
    const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com")

    ceramic.did = did

    const document = await TileDocument.deterministic(ceramic, {
        // A single controller must be provided to reference a deterministic document
        controllers: [ceramic.did.id.toString()],
        // A family or tag must be provided in addition to the controller
        family: family,
        tags: [tag],
    })

    return document.update(newContent)
}

export async function getProposals() {
    const proposals: any = await getTileContent("defi_kicks", "proposals")
    return proposals.data
}

export async function storeProposals(proposals: any[]) {
    return await saveTileContent("defi_kicks", "proposals", { data: proposals })
}

export async function getVotes(name) {
    const votes: any = await getTileContent("defi_kicks-votes", name)
    return votes.data || []
}

export async function storeVotes(name, votes: any[]) {
    return await saveTileContent("defi_kicks-votes", name, { data: votes })
}
