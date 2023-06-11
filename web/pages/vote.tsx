import { useWeb3React } from "@web3-react/core"
import Image from "next/image"
import { MessageCircle, Bell, Plus } from "@web3uikit/icons"
import ETHBalance from "../components/ETHBalance"
import TokenBalance from "../components/TokenBalance"
import useEagerConnect from "../hooks/useEagerConnect"
import { Button, CryptoCards, Grid, Tab, TabList } from "@web3uikit/core"
import React, { use, useEffect, useState } from "react"
import useIpfs from "../hooks/useIpfs"
import usePubSub, { CHAT_TOPIC } from "../hooks/useLibp2pPubSub"
import { json } from "@helia/json"

import { timelockEncryption, timelockDecryption } from "../utils/tlock"

function Home() {
    const [messageInput, setMessageInput] = useState("")

    const handleMessageInputChange = (event) => {
        setMessageInput(event.target.value)
    }

    const { account, library } = useWeb3React()

    const isConnected = typeof account === "string" && !!library

    const { libp2p } = usePubSub()

    const { id, helia, isOnline } = useIpfs()

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

    // libp2p.addEventListener("peer:discovery", (evt) => {
    //     console.log("Discovered %s", evt.detail.id.toString()) // Log discovered peer
    // })

    // libp2p.addEventListener("peer:connect", (evt) => {
    //     console.log("Connected to %s", evt.detail.remotePeer.toString()) // Log connected peer
    // })

    useEffect(() => {
        async function fetchData() {
            // const j = json(helia)
            // const cid = await j.add({ hello: "world" })
            // const obj = await j.get(cid)
            // console.log(obj) // { hello: "world" }
            // Rest of the code logic here\
            // helia.libp2p.services.pubsub.subscribe("fruit")
            // helia.libp2p.services.pubsub.publish("fruit", new TextEncoder().encode("banana"))
        }

        fetchData() // Call the async function
    }, [helia])

    if (!helia || !id) {
        return <h4>Connecting to IPFS...</h4>
    }

    // libp2p.services.pubsub.subscribe(CHAT_TOPIC)

    return (
        <div>
            {isConnected && (
                <section>
                    {/* <Grid
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            spacing={12}
                            style={{
                                height: "400px",
                            }}
                            type="container"
                        >
                            <React.Fragment key=".0">
                                <Grid lg={3} md={4} sm={6} type="item" xs={12}>
                                    <div>Box 1</div>
                                </Grid>
                                <Grid lg={3} md={4} sm={6} type="item" xs={12}>
                                    <div>Box 2</div>
                                </Grid>
                                <Grid lg={3} md={4} sm={6} type="item" xs={12}>
                                    <div>Box 3</div>
                                </Grid>
                                <Grid lg={3} md={4} sm={6} type="item" xs={12}>
                                    <div>Box 4</div>
                                </Grid>
                            </React.Fragment>
                        </Grid>
                        <>
                            <CryptoCards
                                chain="ethereum"
                                bgColor="blue"
                                chainType="Network"
                                onClick={console.log}
                            />
                            <Button theme="primary" type="button" text="Launch Dapp" />
                        </> */}
                    {/* button to sendMessage */}
                </section>
            )}

            <input
                type="text"
                value={messageInput}
                onChange={handleMessageInputChange}
                placeholder="Enter your message"
            />
            <button onClick={sendMessage}>Send Message</button>

            <style jsx>{`
                .home-container {
                    background-image: url("/large.jpg");
                    background-size: cover;
                    background-position: center;
                    min-height: 100vh; /* Ensure the background covers the entire viewport */
                    display: flex;
                    flex-direction: column;
                    justify-content: top;
                    align-items: center;
                }
                nav {
                    display: flex;
                    justify-content: space-between;
                }

                main {
                    text-align: center;
                }
            `}</style>
        </div>
    )
}

export default Home
