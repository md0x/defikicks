import { Button, Card, CardContent, CircularProgress, Grid, Typography } from "@mui/material"
import { useWeb3React } from "@web3-react/core"
import usePubSub, { CHAT_TOPIC } from "../hooks/useLibp2pPubSub"

import useGovernor from "../hooks/useGovernor"
import useProposals, { ProposalStatus } from "../hooks/useProposals"
import { timelockEncryption } from "../utils/tlock"

import { ethers } from "ethers"
import { getVotes, storeVotes } from "../utils/tiles"

function Home() {
    const governor = useGovernor()

    const { proposals, rewards, loading, libp2p } = useProposals()

    const { account, library } = useWeb3React()

    const isConnected = typeof account === "string" && !!library

    const notifyNewVote = async () => {
        await libp2p.services.pubsub.publish(CHAT_TOPIC, new TextEncoder().encode("New Vote"))
    }

    const vote = async (proposal: any, voteString: string) => {
        const votes = await getVotes(proposal.id)
        const newVotes = [...(votes && votes.length ? votes : [])]

        if (newVotes.find((v) => v.account === account)) {
            alert("You already voted")
            return
        }

        const votePhase = 5 * 60

        const message = {
            proposalId: proposal.id,
            proposalName: proposal.name,
            proposalDescription: proposal.description,
            proposalAdapter: proposal.ipfsHash,
            vote: voteString,
        }

        const messageString = JSON.stringify(message)

        const signature = await library?.getSigner().signMessage(messageString)

        const cyphertext = await timelockEncryption(messageString, 30)

        const vote = {
            proposalId: proposal.id,
            cyphertext,
            account,
            signature,
        }

        newVotes.push(vote)

        console.log("Your vote", JSON.stringify(vote, null, 2))

        await storeVotes(proposal.id, newVotes)
        await notifyNewVote()
    }

    const voteFor = async (proposal: any) => {
        await vote(proposal, "for")
    }

    const voteAgainst = async (proposal: any) => {
        await vote(proposal, "against")
    }

    const requestResolution = async (id: string) => {
        const fee = await governor.getLilypadFee()
        return governor.requestVoteResolution(id, { value: fee })
    }

    const executeResolution = async (proposal: any) => {
        await governor.execute(
            proposal.targets,
            proposal.values,
            proposal.callDatas,
            proposal.descriptionHash
        )
    }

    const claimReward = async (proposalId: string, reward: any) => {
        await governor.claimReward(proposalId, reward.amount, reward.proof)
    }

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                <CircularProgress />
            </div>
        )
    }

    return (
        <div style={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
                {proposals.map((proposal) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={proposal.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{proposal.name}</Typography>
                                <Typography variant="body2">{proposal.description}</Typography>
                                <Typography variant="body2">
                                    Votes count: {proposal.voteCount}
                                </Typography>
                                <Typography variant="body2">
                                    Votes for: {ethers.utils.formatEther(proposal.votesFor)}{" "}
                                    (KICK+APE)
                                </Typography>
                                <Typography variant="body2">
                                    Votes against: {ethers.utils.formatEther(proposal.votesAgainst)}{" "}
                                    (KICK+APE)
                                </Typography>
                                <Typography variant="body2">
                                    Status: {ProposalStatus[proposal.status]}
                                </Typography>
                                {rewards[proposal.id] && (
                                    <div style={{ display: "flex" }}>
                                        <Typography variant="body2">
                                            Rewards:{" "}
                                            {ethers.utils.formatEther(rewards[proposal.id].amount)}{" "}
                                            KICK
                                        </Typography>
                                        {rewards[proposal.id].claimed ? (
                                            <Typography variant="body2">Claimed</Typography>
                                        ) : (
                                            <Button
                                                style={{ height: "20px", marginLeft: "10px" }}
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() =>
                                                    claimReward(proposal.id, rewards[proposal.id])
                                                }
                                            >
                                                Claim
                                            </Button>
                                        )}
                                    </div>
                                )}
                                <Typography variant="body2">
                                    <a href={proposal.link} target="_blank" rel="noreferrer">
                                        View code
                                    </a>
                                </Typography>

                                {proposal.status === ProposalStatus.ResolutionToRequest && (
                                    <div>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => requestResolution(proposal.id)}
                                        >
                                            Request resolution
                                        </Button>
                                    </div>
                                )}

                                {proposal.status === ProposalStatus.Succeeded && (
                                    <div>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => executeResolution(proposal)}
                                        >
                                            Execute
                                        </Button>
                                    </div>
                                )}
                                {proposal.status === ProposalStatus.Active && (
                                    <div>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => voteFor(proposal)}
                                        >
                                            Vote For
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => voteAgainst(proposal)}
                                        >
                                            Vote Against
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

export default Home
