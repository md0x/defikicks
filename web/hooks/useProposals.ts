import type { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { BigNumber, ethers } from "ethers"
import { useEffect, useState } from "react"
import abi from "../contracts/DefiKicksAdapterRegistry.json"
import { getProposals, getVotes, storeProposals } from "../utils/tiles"
import useGovernor from "./useGovernor"
import usePubSub from "./useLibp2pPubSub"

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
    const { account } = useWeb3React<Web3Provider>()
    const { libp2p } = usePubSub()
    const [proposals, setProposals] = useState([])
    const [rewards, setRewards] = useState({})
    const [loading, setLoading] = useState(true)
    const [messageCount, setMessageCount] = useState(0)

    const governor = useGovernor()

    useEffect(() => {
        const init = async () => {
            if (!governor) return

            const oldProposals = (await getProposals()) || []

            console.log("Refreshing proposals...")

            const filter = governor.filters.ProposalCreated()
            const latestBlock = await governor.provider.getBlockNumber()
            const proposalsEvents = await governor.queryFilter(filter, latestBlock - 1000, "latest")

            const distinctProposalsEvents = proposalsEvents.filter(
                (event, index, self) =>
                    index === self.findIndex((e) => e.args.proposalId === event.args.proposalId)
            )

            const proposals = await Promise.all(
                distinctProposalsEvents.map(async (event) => {
                    const status = await governor.state(event.args.proposalId)

                    const iface = new ethers.utils.Interface(abi)
                    const decodedData = iface.decodeFunctionData(
                        "addAdapter",
                        event.args.calldatas[0]
                    )

                    const proposalData = await governor.proposals(event.args.proposalId)

                    return {
                        name: decodedData.name,
                        description: event.args.description,
                        ipfsHash: decodedData.ipfsHash,
                        link: `https://w3s.link/ipfs/${decodedData.ipfsHash}`,
                        voteCount: (await getVotes(event.args.proposalId.toString())).length,
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
                    const proposalData = await governor.proposals(oldProposal.id)
                    const status = await governor.state(oldProposal.id)
                    return {
                        ...oldProposal,
                        status: status,
                        voteCount: (await getVotes(oldProposal.id)).length,
                        votesFor: proposalData.forVotes.toString(),
                        votesAgainst: proposalData.againstVotes.toString(),
                        abstainVotes: proposalData.abstainVotes.toString(),
                    }
                })
            )

            // merge old and new proposals
            proposals.push(...updatedOldProposals)

            // Find rewards
            const rewards = {}
            for (const proposal of proposals) {
                const proposalUpdatedFilter = governor.filters.ProposalUpdated(proposal.id)
                const proposalUpdatedEvents = await governor.queryFilter(
                    proposalUpdatedFilter,
                    latestBlock - 1000,
                    "latest"
                )
                if (proposalUpdatedEvents.length > 0) {
                    const data = proposalUpdatedEvents[0].args.data
                    const dataObj = JSON.parse(data)
                    //  if account is a key in dataObj, then there is a reward
                    if (dataObj[account]) {
                        rewards[proposal.id] = {
                            ...dataObj[account],
                            amount: BigNumber.from(dataObj[account].amount),
                            alreadyClaimed: false,
                        }
                        // check if already claimed
                        const claimedFilter = governor.filters.ClaimedReward(
                            account,
                            null,
                            proposal.id
                        )
                        const claimedEvents = await governor.queryFilter(
                            claimedFilter,
                            latestBlock - 1000,
                            "latest"
                        )
                        if (claimedEvents.length > 0) {
                            rewards[proposal.id].alreadyClaimed = true
                        }
                    }
                }
            }

            setRewards(rewards)

            await storeProposals(proposals)
            setProposals(proposals)
            setLoading(false)
        }
        init()
    }, [governor, account, messageCount])

    useEffect(() => {
        if (!libp2p) return

        function handleMessage(message) {
            console.log("New votes received!")
            setMessageCount((messageCount) => messageCount + 1)
        }

        libp2p.services.pubsub.addEventListener("message", handleMessage)

        return () => {
            libp2p.services.pubsub.removeEventListener("message", handleMessage)
        }
    }, [libp2p])

    return { proposals, rewards, loading, libp2p }
}
