import { ethers } from "ethers"
import useGovernor from "./useGovernor"
import { useEffect, useState } from "react"
import abi from "../contracts/DefiKicksAdapterRegistry.json"

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

    const contract = useGovernor()

    useEffect(() => {
        const init = async () => {
            if (!contract) return
            const filter = contract.filters.ProposalCreated()
            const proposalsEvents = await contract.queryFilter(filter, 647965, "latest")

            console.log(proposalsEvents)
            // filter only proposals events with different event.args.proposalId

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

                    return {
                        name: decodedData.name,
                        description: event.args.description,
                        link: `https://w3s.link/ipfs/${decodedData.ipfsHash}`,
                        votesFor: 0,
                        votesAgainst: 0,
                        status,
                        id: event.args.proposalId.toString(),
                    }
                })
            )
            setProposals(proposals)
            setLoading(false)
        }
        init()
    }, [contract])

    return { proposals, loading }
}
