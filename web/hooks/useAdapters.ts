import useSWR from "swr"
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { useEffect, useState } from "react"
import { faker } from "@faker-js/faker"
import useRegistry from "./useRegistry"

// TODO this should be pulled from
const adapterList = ["Kick-Swap", "Kick-Lending"]

export default function useAdapters(suspense = false) {
    const registry = useRegistry()
    const [adapters, setAdapters] = useState({})

    useEffect(() => {
        const init = async () => {
            for (const adapter of adapterList) {
                const adapterData = await registry.adapters(adapter)
                setAdapters((prev) => ({
                    ...prev,
                    [adapter]: {
                        ipfs: adapterData.ipfsHash,
                    },
                }))
            }
        }

        init()
    }, [registry])

    return { adapters }
}
