import { gossipsub } from "@chainsafe/libp2p-gossipsub"
import { noise } from "@chainsafe/libp2p-noise"
import { yamux } from "@chainsafe/libp2p-yamux"
import { json } from "@helia/json"
import { bootstrap } from "@libp2p/bootstrap"
import { mplex } from "@libp2p/mplex"
import { webSockets } from "@libp2p/websockets"
import { createHelia } from "helia"
import { createLibp2p } from "libp2p"
import { useEffect, useState } from "react"


import { webRTC, webRTCDirect } from "@libp2p/webrtc"
import * as filters from "@libp2p/websockets/filters"
import { webTransport } from "@libp2p/webtransport"
import { circuitRelayTransport } from "libp2p/circuit-relay"

export default function useIpfs() {
    const [id, setId] = useState(null)
    const [helia, setHelia] = useState(null)
    const [isOnline, setIsOnline] = useState(false)

    useEffect(() => {
        const init = async () => {
            if (helia) return

            // const heliaNode = await createHelia()

            // const node = await createLibp2p({
            //     addresses: {
            //         listen: ["/ip4/0.0.0.0/tcp/0"],
            //     },
            //     transports: [tcp()],
            //     streamMuxers: [yamux(), mplex()],
            //     connectionEncryption: [noise()],
            //     // we add the Pubsub module we want

            //     services: {
            //         pubsub: gossipsub({ allowPublishToZeroPeers: true }),
            //     },

            // })

            // const libp2p = await createLibp2p({
            //     services: {
            //         pubsub: gossipsub(),
            //     },
            // })

            // const heliaNode = await createHelia({
            //     libp2p,
            // })
            const bootstrapMultiaddrs = [
                "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
                "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
            ]

            const libp2p = await createLibp2p({
                transports: [
                    webTransport(),
                    // webSockets({
                    //     filter: filters.all,
                    // }),
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
                connectionEncryption: [noise()],
                streamMuxers: [yamux(), mplex()],
                peerDiscovery: [
                    bootstrap({
                        list: bootstrapMultiaddrs, // provide array of multiaddrs
                    }),
                ],
                services: {
                    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
                },
            })

            const heliaNode = await createHelia({
                libp2p,
            })

            // const heliaNode = await createHelia()
            const j = json(heliaNode)

            const cid = await j.add({ hello: "world" })

            console.log(cid) // QmQ5Z6...

            const obj = await j.get(cid)

            console.log(obj) // { hello: "world" }

            const nodeId = heliaNode.libp2p.peerId.toString()
            const nodeIsOnline = heliaNode.libp2p.isStarted()

            setHelia(heliaNode)
            setId(nodeId)
            setIsOnline(nodeIsOnline)
        }

        init()
    }, [helia])

    return { id, helia, isOnline }
}
