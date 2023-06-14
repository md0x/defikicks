import { useWeb3React } from "@web3-react/core"
import Image from "next/image"
import { MessageCircle, Bell, Plus, Arrow, Send } from "@web3uikit/icons"
import ETHBalance from "../components/ETHBalance"
import TokenBalance from "../components/TokenBalance"
import useEagerConnect from "../hooks/useEagerConnect"
import { Button, CodeArea, CryptoCards, Grid, Input, Tab, TabList } from "@web3uikit/core"

import React, { useState } from "react"

function AdapterForm() {
    const [adapterName, setAdapterName] = useState("")
    const [code, setCode] =
        useState(`    // This is just an example. Paste here your TVL calculation code in JavaScript!
    // ethers is available in global scope 😉

      function run() {
        // Here you can calculate your TVL this function is will be called by any user with a Lit Action
        // The output will be stored in a Ceramic stream and will be available for everyone 🚀
        const provider = new ethers.providers.JsonRpcProvider(nodeUrl1);
        const latestBlockNumber = await provider.getBlockNumber();
        return latestBlockNumber * 1000_000_000;
      }
      run();`)

    const handleSubmit = (event) => {
        event.preventDefault()
        console.log("Adapter Name:", adapterName)
        console.log("Code:", code)
    }

    return (
        <div className="wrapper">
            <label className="input">
                <Input
                    placeholder="Adapter name"
                    onChange={(e) => setAdapterName(e.target.value)}
                />

                <div className="button">
                    <Button
                        onClick={handleSubmit}
                        text="Propose Adapter"
                        color="yellow"
                        isLoading={false}
                        style={{ width: "100%" }}
                        size="large"
                        icon={<Send />}
                    />
                </div>
            </label>

            <label className="code">
                <CodeArea
                    onBlur={function noRefCheck() {}}
                    onChange={(e) => setCode(e.target.value)}
                    text={code}
                    minHeight="100px"
                />
            </label>

            <style jsx>{`
                .input {
                    display: flex;
                }
                .code {
                    margin-top: 20px;
                }
                .button {
                    margin-left: 10px;
                }
                .wrapper {
                    margin: 1em;
                    display: flex;
                    flex-direction: column;
                    // height: 100%;
                    position: relative;
                }
                .codeInput {
                    margin-top: 10px;
                    width: 100%;
                    // height: 80%; // puedes cambiar esta altura al valor que prefieras
                }
            `}</style>
        </div>
    )
}

export default AdapterForm
