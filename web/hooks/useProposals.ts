import { ethers } from "ethers"
import useGovernor from "./useGovernor"
import { useEffect, useState } from "react"
import abi from "../contracts/DefiKicksAdapterRegistry.json"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { getProposals, storeProposals } from "../utils/tiles"
import useRegistry from "./useRegistry"

export enum ProposalStatus {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed,
    ResolutionToRequest,
    ResolutionRequested,
}

export interface Proposal {
    name: string
    description: string
    link: string
    votesFor: number
    votesAgainst: number
    status: ProposalStatus
    id: string
}

export default function useProposals() {
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [votes, setVotes] = useState({})

    const contract = useGovernor()
    const registry = useRegistry()

    useEffect(() => {
        const init = async () => {
            if (!contract) return

            const oldProposals = await getProposals()

            const filter = contract.filters.ProposalCreated()
            const latestBlock = await contract.provider.getBlockNumber()
            const proposalsEvents = await contract.queryFilter(filter, latestBlock - 1000, "latest")

            console.log(proposalsEvents)

            const distinctProposalsEvents = proposalsEvents.filter(
                (event, index, self) =>
                    index === self.findIndex((e) => e.args.proposalId === event.args.proposalId)
            )

            const proposals = await Promise.all(
                distinctProposalsEvents.map(async (event) => {
                    const status = await contract.state(event.args.proposalId)

                    const iface = new ethers.utils.Interface(abi)
                    const decodedData = iface.decodeFunctionData(
                        "addAdapter",
                        event.args.calldatas[0]
                    )

                    const proposalData = await contract.proposals(event.args.proposalId)

                    return {
                        name: decodedData.name,
                        description: event.args.description,
                        ipfsHash: decodedData.ipfsHash,
                        link: `https://w3s.link/ipfs/${decodedData.ipfsHash}`,
                        votesFor: proposalData.forVotes.toString(),
                        votesAgainst: proposalData.againstVotes.toString(),
                        abstainVotes: proposalData.abstainVotes.toString(),
                        callDatas: event.args.calldatas,
                        values: event.args[3],
                        targets: event.args.targets,
                        descriptionHash: event.args.descriptionHash,
                        status,
                        id: event.args.proposalId.toString(),
                        jobId: proposalData.bridgeId,
                    }
                })
            )

            const filteredOldProposals = oldProposals.filter(
                (oldProposal) => !proposals.find((newProposal) => newProposal.id === oldProposal.id)
            )

            // update data of old proposals
            const updatedOldProposals = await Promise.all(
                filteredOldProposals.map(async (oldProposal) => {
                    const proposalData = await contract.proposals(oldProposal.id)
                    const status = await contract.state(oldProposal.id)
                    return {
                        ...oldProposal,
                        status: await contract.state(oldProposal.id),
                        votesFor: proposalData.forVotes.toString(),
                        votesAgainst: proposalData.againstVotes.toString(),
                        abstainVotes: proposalData.abstainVotes.toString(),
                    }
                })
            )

            // merge old and new proposals
            proposals.push(...updatedOldProposals)

            await storeProposals(proposals)
            setProposals(proposals)
            setLoading(false)
        }
        init()
    }, [contract])

    return { proposals, loading }
}
