import { useState, useEffect } from "react"
import { gossipsub } from "@chainsafe/libp2p-gossipsub"
import { tcp } from "@libp2p/tcp"
import { webSockets } from "@libp2p/websockets"
import { noise } from "@chainsafe/libp2p-noise"
import { mplex } from "@libp2p/mplex"
import { yamux } from "@chainsafe/libp2p-yamux"
import { kadDHT } from "@libp2p/kad-dht"
import { bootstrap } from "@libp2p/bootstrap"
import { webTransport } from "@libp2p/webtransport"
import { webRTC, webRTCDirect } from "@libp2p/webrtc"
import { circuitRelayTransport } from "libp2p/circuit-relay"
import * as filters from "@libp2p/websockets/filters"
import type { Message, SignedMessage } from "@libp2p/interface-pubsub"
import { sha256 } from "multiformats/hashes/sha2"
import { identifyService } from "libp2p/identify"
import { createLibp2p, Libp2p } from "libp2p"
import { multiaddr } from "@multiformats/multiaddr"
import { timelockDecryption } from "../utils/tlock"

export const CHAT_TOPIC = "defi-kick"

export const CIRCUIT_RELAY_CODE = 290

export const WEBRTC_BOOTSTRAP_NODE =
    "/ip4/127.0.0.1/udp/9090/webrtc-direct/certhash/uEiB6mG6sBsUGSz6LblXTkWZFbLMLRyYhaK-ohqzlM3NLew/p2p/12D3KooWNTxeE3tmQLYVa6xhvri1AheFVF1rHphxXB86B3w4WCA5"
// message IDs are used to dedupe inbound messages
// every agent in network should use the same message id function
// messages could be perceived as duplicate if this isnt added (as opposed to rust peer which has unique message ids)
export async function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array> {
    var enc = new TextEncoder()

    const signedMessage = msg as SignedMessage
    const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
    return await sha256.encode(encodedSeqNum)
}

export async function startLibp2p() {
    // localStorage.debug = 'libp2p*,-*:trace'
    // application-specific data lives in the datastore

    const libp2p = await createLibp2p({
        addresses: {
            listen: ["/webrtc"],
        },
        transports: [
            webTransport(),
            webSockets({
                filter: filters.all,
            }),
            webRTC({
                rtcConfiguration: {
                    iceServers: [
                        {
                            urls: [
                                "stun:stun.l.google.com:19302",
                                "stun:global.stun.twilio.com:3478",
                            ],
                        },
                    ],
                },
            }),
            webRTCDirect(),
            circuitRelayTransport({
                discoverRelays: 1,
            }),
        ],
        connectionManager: {
            maxConnections: 10,
            minConnections: 5,
        },
        connectionEncryption: [noise()],
        streamMuxers: [yamux()],
        connectionGater: {
            denyDialMultiaddr: async () => false,
        },
        peerDiscovery: [
            bootstrap({
                list: [WEBRTC_BOOTSTRAP_NODE],
            }),
        ],
        services: {
            pubsub: gossipsub({
                allowPublishToZeroPeers: true,
                msgIdFn: msgIdFnStrictNoSign,
                ignoreDuplicatePublishError: true,
            }),
            dht: kadDHT({
                protocolPrefix: "/universal-connectivity",
                maxInboundStreams: 5000,
                maxOutboundStreams: 5000,
                clientMode: true,
            }),
            identify: identifyService(),
        },
    })

    libp2p.services.pubsub.subscribe(CHAT_TOPIC)
    console.log("Aqui")
    libp2p.addEventListener("self:peer:update", ({ detail: { peer } }) => {
        const multiaddrs = peer.addresses.map(({ multiaddr }) => multiaddr)

        console.log(`changed multiaddrs: peer ${peer.id.toString()} multiaddrs: ${multiaddrs}`)
    })

    libp2p.services.pubsub.addEventListener("message", async (message) => {
        console.log(`${message.detail.topic}:`, new TextDecoder().decode(message.detail.data))
        const ciphertext = new TextDecoder().decode(message.detail.data)
        console.log("ciphertext", ciphertext)
        // wait 30 seconds before decrypting
        await new Promise((resolve) => setTimeout(resolve, 30000))
        const plaintext = await timelockDecryption(ciphertext)
        console.log("plaintext", plaintext)
    })

    console.log(`dialling: ${WEBRTC_BOOTSTRAP_NODE.toString()}`)

    const conn = await libp2p.dial(multiaddr(WEBRTC_BOOTSTRAP_NODE))
    console.info("connected to", conn.remotePeer, "on", conn.remoteAddr)

    return libp2p
}

export default function usePubSub() {
    const [libp2p, setLibp2p] = useState(null)

    useEffect(() => {
        const init = async () => {
            if (libp2p) return

            const libp2pNode = await startLibp2p()

            setLibp2p(libp2pNode)
        }

        init()
    }, [libp2p])

    return { libp2p }
}