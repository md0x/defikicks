import React, { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import Account from "./Account"
import useEagerConnect from "../hooks/useEagerConnect"
import ETHBalance from "./ETHBalance"
import TokenBalance from "./TokenBalance"
import { useWeb3React } from "@web3-react/core"
import { Button, Tabs, Tab } from "@mui/material"
import { Notifications, Forum, Add } from "@mui/icons-material"
import { useRouter } from "next/router"
import addresses from "../addresses.json"

const Header = () => {
    const router = useRouter()
    const { account, library, chainId } = useWeb3React()
    const [activeTab, setActiveTab] = React.useState(0)

    if (chainId && chainId != 314159) {
        try {
            alert("Please connect to the correct network Filecoin - Calibration testnet")
        } catch (e) {
            console.log(e)
        }
    }

    const isConnected = typeof account === "string" && !!library

    const triedToEagerConnect = useEagerConnect()

    // Get the current route path
    const currentPath = router.pathname

    const keys = ["", "vote", "propose"]

    useEffect(() => {
        const index = keys.indexOf(currentPath.substring(1))
        if (index > -1) {
            setActiveTab(index)
        }
    }, [currentPath])

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
                {isConnected && (
                    <section>
                        <ETHBalance />

                        <TokenBalance tokenAddress={addresses.token} symbol="KICK" />
                    </section>
                )}

                <div className="navigation-bar">
                    <Tabs
                        value={activeTab}
                        onChange={(event, newValue) => {
                            setActiveTab(newValue)
                            router.push("/" + keys[newValue])
                        }}
                    >
                        <Tab icon={<Forum fontSize="large" />} label="Dashboard" />
                        <Tab icon={<Notifications fontSize="large" />} label="Vote" />
                        <Tab icon={<Add fontSize="large" />} label="Propose" />
                    </Tabs>
                </div>
            </div>

            <style jsx>{`
                .logo-container {
                    position: relative;
                    width: 150px;
                    height: 50px;
                }
                .navigation-bar {
                    // margin-top: 2em;
                }
                header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .header-content {
                    // margin-top: 2em;
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
