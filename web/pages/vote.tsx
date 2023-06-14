import { useWeb3React } from "@web3-react/core"
import Image from "next/image"
import { MessageCircle, Bell, Plus } from "@web3uikit/icons"
import ETHBalance from "../components/ETHBalance"
import TokenBalance from "../components/TokenBalance"
import useEagerConnect from "../hooks/useEagerConnect"
import { CryptoCards, Tab, TabList } from "@web3uikit/core"
import React, { use, useEffect, useState } from "react"
import useIpfs from "../hooks/useIpfs"
import usePubSub, { CHAT_TOPIC } from "../hooks/useLibp2pPubSub"
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Chip,
    Box,
} from "@material-ui/core"

import { timelockEncryption, timelockDecryption } from "../utils/tlock"
import useProposals, { ProposalStatus } from "../hooks/useProposals"

function Home() {
    const [messageInput, setMessageInput] = useState("")

    const { proposals, loading } = useProposals()

    const handleMessageInputChange = (event) => {
        setMessageInput(event.target.value)
    }

    const { account, library } = useWeb3React()

    const isConnected = typeof account === "string" && !!library

    const { libp2p } = usePubSub()

    const sendMessage = async () => {
        const input = messageInput

        console.log(
            "peers in gossip:",
            libp2p.services.pubsub.getSubscribers(CHAT_TOPIC).toString()
        )

        const cyphertext = await timelockEncryption(input, 30)

        const res = await libp2p.services.pubsub.publish(
            CHAT_TOPIC,
            new TextEncoder().encode(cyphertext)
        )
        console.log(
            "sent message to: ",
            res.recipients.map((peerId) => peerId.toString())
        )

        const myPeerId = libp2p.peerId.toString()
    }

    const voteFor = (id: string) => {
        // Implementar lógica de votación a favor
        console.log(`Voted for proposal with ID: ${id}`)
    }

    const voteAgainst = (id: string) => {
        // Implementar lógica de votación en contra
        console.log(`Voted against proposal with ID: ${id}`)
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
                                    <a href={proposal.link}>More info</a>
                                </Typography>
                                {proposal.status === ProposalStatus.ResolutionToRequest &&
                                    proposal.votesFor === 0 && (
                                        <Chip label="No votes yet" color="secondary" />
                                    )}
                                {proposal.status === ProposalStatus.Active && (
                                    <div>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => voteFor(proposal.id)}
                                        >
                                            Vote For
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => voteAgainst(proposal.id)}
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
