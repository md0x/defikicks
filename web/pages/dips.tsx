import { useWeb3React } from "@web3-react/core"
import Image from "next/image"
import { MessageCircle, Bell, Plus } from "@web3uikit/icons"
import ETHBalance from "../components/ETHBalance"
import TokenBalance from "../components/TokenBalance"
import useEagerConnect from "../hooks/useEagerConnect"
import { Button, CryptoCards, Grid, Tab, TabList } from "@web3uikit/core"
import React from "react"
// import styled from "styled-components"
// import { styled } from "@web3uikit/styles"
// import backgroundImage from "../assets/large.jpg"

function Home() {
    const { account, library } = useWeb3React()

    const isConnected = typeof account === "string" && !!library

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
                </section>
            )}

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
