import { Ed25519Provider } from "key-did-provider-ed25519"
import * as KeyResolver from "key-did-resolver"
import { DID } from "dids"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { CeramicClient } from "@ceramicnetwork/http-client"
import crypto from "crypto"

export async function getTileContent(family, tag) {
    const seed = crypto.createHash("sha256").update("DefiKicks").digest()

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

export async function getProposals() {
    const proposals = await getTileContent("defikicks", "proposals")
    return proposals.data
}
