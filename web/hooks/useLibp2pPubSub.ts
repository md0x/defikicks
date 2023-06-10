import { useState, useEffect } from "react"
import { createLibp2p } from "libp2p"
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

export const CHAT_TOPIC = "universal-connectivity"

export const CIRCUIT_RELAY_CODE = 290

export const WEBRTC_BOOTSTRAP_NODE =
    "/ip4/191.101.234.43/udp/9090/webrtc-direct/certhash/uEiCPYcG8dHdz1LdB5MvJYcqt1rYbk0YXs5LMvMgbZHCCpQ/p2p/12D3KooWR2hJAh8zucnFeWj65NCbjoQLWGoE1scMKbCEv5r6NbMb"
export const WEBTRANSPORT_BOOTSTRAP_NODE =
    "/ip4/3.125.128.80/udp/9095/quic-v1/webtransport/certhash/uEiAGIlVdiajNz0k1RHjrxlNXN5bb7W4dLPvMJYUrGJ9ZUQ/certhash/uEiDYZsZoO8vuTKlPhxvVR5SFwOkbXfjlsmTLUHNlnG24bg/p2p/12D3KooWEymoJRHaxizLrrKgJ9MhEYpG85fQ7HReRMJuEMLqmNMg"

// message IDs are used to dedupe inbound messages
// every agent in network should use the same message id function
// messages could be perceived as duplicate if this isnt added (as opposed to rust peer which has unique message ids)
export async function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array> {
    var enc = new TextEncoder()

    const signedMessage = msg as SignedMessage
    const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
    return await sha256.encode(encodedSeqNum)
}

const createNode = async () => {
    const bootstrapMultiaddrs = [
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
    ]

    const node = await createLibp2p({
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
            // dht: kadDHT({
            //     protocolPrefix: "/universal-connectivity",
            //     maxInboundStreams: 5000,
            //     maxOutboundStreams: 5000,
            //     clientMode: true,
            // }),
            // identify: identifyService(),
        },
    })

    return node
}

export default function usePubSub() {
    const [libp2p, setLibp2p] = useState(null)

    useEffect(() => {
        const init = async () => {
            if (libp2p) return

            const libp2pNode = await createNode()

            setLibp2p(libp2pNode)
        }

        init()
    }, [libp2p])

    return { libp2p }
}
