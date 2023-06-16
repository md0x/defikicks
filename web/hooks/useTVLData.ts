import useSWR from "swr"
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { useEffect } from "react"
import { faker } from "@faker-js/faker"
import { getProposals } from "../utils/tiles"
import { ProposalStatus } from "./useProposals"

// Load (or create) a determinitic document for a given controller
export async function loadDocumentByController(ceramic, controller, tag) {
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
const adapterList = ["Kick-Swap", "Kick-Lending"]

const useFakeData = process.env.NEXT_PUBLIC_USE_FAKE_DATA === "true"

// labels.map(() => faker.number.int({ min: 0, max: 1000 }))

export interface ProjectTVL {
    ipfsHash: string
    dataPoints: {
        tvl: number
        hash: string
        runner: string
        rawData: {
            tvl: number
            runner: string
            timestamp: number
        }
        signature: string
        timestamp: number
    }[]
}

export interface TVLData {
    [key: string]: ProjectTVL
}

export default function useTVLData(suspense = false) {
    const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_API_HOST)
    const result = useSWR<any>(
        adapterList,
        async (adapterList) => {
            const proposals = await getProposals()
            const executed = proposals.filter(
                (proposal) => proposal.status === ProposalStatus.Executed
            )
            const tvlData = {}

            for (const proposal of executed) {
                const data = (await loadDocumentByController(
                    ceramic,
                    process.env.NEXT_PUBLIC_CERAMIC_CONTROLER,
                    proposal.id
                )) as { [key: string]: any }
                tvlData[proposal.name] = { ...data, ipfsHash: proposal.ipfsHash }
            }

            return tvlData
        },
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
