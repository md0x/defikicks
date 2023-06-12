import { json } from "@helia/json"
import { createHelia } from "helia"
import { useEffect, useState } from "react"

export default function useIpfs() {
    const [id, setId] = useState(null)
    const [helia, setHelia] = useState(null)
    const [isOnline, setIsOnline] = useState(false)

    useEffect(() => {
        const init = async () => {
            if (helia) return

            const heliaNode = await createHelia()

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
