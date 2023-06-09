import useSWR from "swr"
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { useEffect } from "react"

// Load (or create) a determinitic document for a given controller
async function loadDocumentByController(ceramic, controller, tag) {
    const data = await TileDocument.deterministic(ceramic, {
        // A single controller must be provided to reference a deterministic document
        controllers: [controller],
        // A family or tag must be provided in addition to the controller
        family: "DefiKicksAdapter",
        tags: [tag],
    })
    return data.content
}

async function validateData(data: any) {
    // TODO data validation
    return data
}

async function formatData(adapters, data: any) {
    // TODO data formatting
    return adapters.reduce((acc, adapter, index) => {
        acc[adapter] = data[index]
        return acc
    }, {})
}

// TODO this should be pulled from
const adapterList = ["test"]

export default function useTVLData(suspense = false) {
    const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_API_HOST)
    const result = useSWR(
        adapterList,
        (adapterList) =>
            Promise.all(
                adapterList.map((tag) =>
                    loadDocumentByController(
                        ceramic,
                        process.env.NEXT_PUBLIC_CERAMIC_CONTROLER,
                        tag
                    )
                )
            )
                .then(validateData)
                .then((data) => formatData(adapterList, data)),
        {
            suspense,
        }
    )

    useKeepSWRDataLiveAsBlocksArrive(result.mutate)

    // use effect if adapterList change, update ceramic document
    // TODO this should be pulled from somewhere
    // useEffect(() => {
    //     result.mutate()
    // }, [adapterList])

    return result
}
