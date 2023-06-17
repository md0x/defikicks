import { gossipsub } from "@chainsafe/libp2p-gossipsub"
import { noise } from "@chainsafe/libp2p-noise"
import { yamux } from "@chainsafe/libp2p-yamux"
import { bootstrap } from "@libp2p/bootstrap"
import type { Message, SignedMessage } from "@libp2p/interface-pubsub"
import { kadDHT } from "@libp2p/kad-dht"
import { webRTC, webRTCDirect } from "@libp2p/webrtc"
import { webSockets } from "@libp2p/websockets"
import * as filters from "@libp2p/websockets/filters"
import { webTransport } from "@libp2p/webtransport"
import { multiaddr } from "@multiformats/multiaddr"
import { createLibp2p } from "libp2p"
import { circuitRelayTransport } from "libp2p/circuit-relay"
import { identifyService } from "libp2p/identify"
import { sha256 } from "multiformats/hashes/sha2"
import { useEffect, useState } from "react"

export const CHAT_TOPIC = "defi-kick"

export const CIRCUIT_RELAY_CODE = 290

export const WEBRTC_BOOTSTRAP_NODE = process.env.NEXT_PUBLIC_LIBP2P_MULTIADDRESS

export async function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array> {
    var enc = new TextEncoder()

    const signedMessage = msg as SignedMessage
    const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
    return await sha256.encode(encodedSeqNum)
}

export async function startLibp2p() {
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

    const conn = await libp2p.dial(multiaddr(WEBRTC_BOOTSTRAP_NODE))

    return libp2p
}

export default function usePubSub() {
    const [libp2p, setLibp2p] = useState(null)

    const [lastDagRoots, setLastDagRoots] = useState({})

    useEffect(() => {
        const init = async () => {
            if (libp2p) return

            const libp2pNode = await startLibp2p()

            setLibp2p(libp2pNode)
        }

        init()
    })

    return { libp2p, lastDagRoots }
}
