import React from "react"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import Account from "./Account"
import useEagerConnect from "../hooks/useEagerConnect"
import ETHBalance from "./ETHBalance"
import TokenBalance from "./TokenBalance"
import { useWeb3React } from "@web3-react/core"
import { Button, Tab, TabList } from "@web3uikit/core"
import { Bell, MessageCircle, Plus } from "@web3uikit/icons"
import { useRouter } from "next/router"

const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f"

const Header = () => {
    const router = useRouter()
    const { account, library } = useWeb3React()

    const isConnected = typeof account === "string" && !!library

    const triedToEagerConnect = useEagerConnect()

    // Get the current route path
    const currentPath = router.pathname

    const keys = ["", "vote", "propose", "dips"]

    const activeTab = 0

    return (
        <header>
            <Head>
                <title>DeFi Kicks</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="header-content">
                <Link href="/">
                    <Image src="/android-chrome-512x512.png" alt="Logo" width={125} height={125} />
                </Link>
                <Link
                    href="https://github.com/md0x/defikicks"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className="logo-container">
                        <Image src="/kick-text.png" alt="Logo" layout="fill" objectFit="contain" />
                    </div>
                </Link>
                <Account triedToEagerConnect={triedToEagerConnect} />
                {/* {isConnected && (
                    <section>
                        <ETHBalance />

                        <TokenBalance tokenAddress={DAI_TOKEN_ADDRESS} symbol="DAI" />
                    </section>
                )} */}

                <div className="navigation-bar">
                    <TabList
                        defaultActiveKey={activeTab}
                        onChange={(selectedKey) => router.push("/" + keys[selectedKey])}
                    >
                        <Tab
                            tabName={
                                <div
                                    style={{
                                        display: "flex",
                                    }}
                                >
                                    <MessageCircle fill="black" fontSize={22} />{" "}
                                    <span style={{ paddingLeft: "4px" }}>Dashboard </span>
                                </div>
                            }
                            tabKey={0}
                        ></Tab>
                        <Tab
                            tabName={
                                <div
                                    style={{
                                        display: "flex",
                                    }}
                                >
                                    <Bell fill="black" fontSize={22} />
                                    <span style={{ paddingLeft: "4px" }}>Vote </span>
                                </div>
                            }
                            tabKey={1}
                        ></Tab>
                        <Tab
                            tabName={
                                <div
                                    style={{
                                        display: "flex",
                                    }}
                                >
                                    <Bell fill="black" fontSize={22} />
                                    <span style={{ paddingLeft: "4px" }}>Propose </span>
                                </div>
                            }
                            tabKey={2}
                        ></Tab>
                        <Tab
                            tabName={
                                <div
                                    style={{
                                        display: "flex",
                                    }}
                                >
                                    <Bell fill="black" fontSize={22} />
                                    <span style={{ paddingLeft: "4px" }}>DIPs </span>
                                </div>
                            }
                            tabKey={3}
                        ></Tab>
                    </TabList>
                </div>
            </div>

            <style jsx>{`
                .logo-container {
                    position: relative;
                    width: 150px;
                    height: 50px;
                }
                .navigation-bar {
                    margin-top: 2em;
                }
                header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .header-content {
                    margin-top: 2em;
                    flex-direction: column;
                    display: flex;
                    align-items: center;
                }

                h1 {
                    margin-left: 16px;
                }
            `}</style>
        </header>
    )
}

export default Header
