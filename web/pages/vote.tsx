import { Button, Card, CardContent, Chip, CircularProgress, Grid, Typography } from "@mui/material"
import { useWeb3React } from "@web3-react/core"
import { useState } from "react"
import usePubSub, { CHAT_TOPIC } from "../hooks/useLibp2pPubSub"
import { DID } from "dids"
import { Ed25519Provider } from "key-did-provider-ed25519"
import * as KeyResolver from "key-did-resolver"

import useProposals, { ProposalStatus } from "../hooks/useProposals"
import { timelockEncryption } from "../utils/tlock"
import useGovernor from "../hooks/useGovernor"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { loadDocumentByController } from "../hooks/useTVLData"

import { TileDocument } from "@ceramicnetwork/stream-tile"
import { getTileContent, getVotes, saveTileContent, storeVotes } from "../utils/tiles"

function Home() {
    const [messageInput, setMessageInput] = useState("")

    const governor = useGovernor()

    const { proposals, loading } = useProposals()

    const handleMessageInputChange = (event) => {
        setMessageInput(event.target.value)
    }

    const { account, library } = useWeb3React()

    const isConnected = typeof account === "string" && !!library

    const { libp2p } = usePubSub()

    const sendMessage = async () => {
        // const input = messageInput
        // console.log(
        //     "peers in gossip:",
        //     libp2p.services.pubsub.getSubscribers(CHAT_TOPIC).toString()
        // )
        // const cyphertext = await timelockEncryption(input, 30)
        // const res = await libp2p.services.pubsub.publish(
        //     CHAT_TOPIC,
        //     new TextEncoder().encode(cyphertext)
        // )
        // console.log(
        //     "sent message to: ",
        //     res.recipients.map((peerId) => peerId.toString())
        // )
        // const myPeerId = libp2p.peerId.toString()

        // random 5 letter string
        const randomString = Math.random().toString(36).substring(2, 7)
        const res = await libp2p.services.pubsub.publish(
            CHAT_TOPIC,
            new TextEncoder().encode(JSON.stringify({ [randomString]: "test" }))
        )

        const data = await getTileContent("DefiKicksVotes", "")

        console.log("data", data)

        await saveTileContent("DefiKicksVotes", "", {
            ...(data as any),
            [randomString]: "test",
        })
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
                                    Votes for: {proposal.votesFor}
                                </Typography>
                                <Typography variant="body2">
                                    Votes against: {proposal.votesAgainst}
                                </Typography>
                                <Typography variant="body2">
                                    Status: {ProposalStatus[proposal.status]}
                                </Typography>
                                <Typography variant="body2">
                                    <a href={proposal.link} target="_blank" rel="noreferrer">
                                        View code
                                    </a>
                                </Typography>
                                {/* {proposal.status === ProposalStatus.ResolutionToRequest &&
                                    proposal.votesFor === 0 && (
                                        <Chip label="No votes yet" color="secondary" />
                                    )} */}

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
            {/* <Button variant="contained" color="secondary" onClick={() => voteFor(proposals[0])}>
                {" "}
                Send Message{" "}
            </Button> */}
        </div>
    )
}

export default Home
