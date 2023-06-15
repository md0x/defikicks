import { Button, TextField, CircularProgress } from "@mui/material"
import { ArrowCircleLeft } from "@mui/icons-material"

import { useState } from "react"
import { Web3Storage } from "web3.storage"
import useGovernor from "../hooks/useGovernor"
import useRegistry from "../hooks/useRegistry"

import "@uiw/react-textarea-code-editor/dist.css"
import dynamic from "next/dynamic"

const CodeEditor = dynamic(
    () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
    { ssr: false }
)

function AdapterForm() {
    const [adapterName, setAdapterName] = useState("")
    const [loading, setLoading] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState("")

    const governor = useGovernor()
    const registry = useRegistry()

    const [code, setCode] =
        useState(`    // This is just an example. Paste here your TVL calculation code in JavaScript!
    // ethers is available in global scope 😉

      function run() {
        // Here you can calculate your TVL this function will be called by any user with a Lit Action
        // The output will be stored in a Ceramic stream and will be available for everyone 🚀
        const provider = new ethers.providers.JsonRpcProvider(nodeUrl1);
        const latestBlockNumber = await provider.getBlockNumber();
        return latestBlockNumber * 1000_000_000;
      }
      run();`)

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!adapterName) {
            alert("Please enter an adapter name")
            return
        }

        setLoading(true)
        setLoadingStatus("Uploading your code to IPFS...")

        const token =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyNjlBMjNhOGJFQjlhMjE5NWM2QkJjODhkM2FGRUIxMjc4RjI5MDMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODY3NzEyNDcxNDQsIm5hbWUiOiJEZWZpS2lja3MifQ.b3w60SXYGtDWjLT1-VKoZyijiHV8A0m9ccdp6ddKEas"
        const storage = new Web3Storage({ token })

        const blob = new Blob([code], { type: "text/plain" })
        const file = new File([blob], "code.js")
        const files = [file]

        const cid = await storage.put(files)

        const addNewAdapter = registry.interface.encodeFunctionData("addAdapter", [
            adapterName,
            cid + "/code.js",
        ])

        setLoadingStatus("Proposing new adapter...")
        await governor.propose(
            [registry.address],
            [0],
            [addNewAdapter],
            `Add new adapter ${adapterName}`
        )

        alert(`Your CODE is here: https://w3s.link/ipfs/${cid + "/code.js"}`)

        setLoadingStatus("")
        setAdapterName("")
        setCode("")
        setLoading(false)
    }

    const loadingStatusComponent = (
        <div style={{ display: "flex" }}>
            <CircularProgress size={16} style={{ marginTop: "4px" }} />
            <div style={{ marginLeft: "4px" }}>{loadingStatus}</div>
        </div>
    )
    return (
        <div className="wrapper">
            <div className="actions">
                <TextField
                    label="Adapter name"
                    variant="outlined"
                    onChange={(e) => setAdapterName(e.target.value)}
                    fullWidth
                    size="small"
                    style={{ height: "10px" }}
                />

                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    fullWidth
                    size="medium"
                    disabled={loading}
                    style={{ marginTop: "2px" }}
                >
                    {loading ? loadingStatusComponent : "Propose Adapter"}
                </Button>
            </div>

            <div>
                <CodeEditor
                    value={code}
                    language="js"
                    placeholder="Please enter JS code."
                    onChange={(evn) => setCode(evn.target.value)}
                    padding={15}
                    style={{
                        fontSize: 12,
                        backgroundColor: "rgba(255,255,255,255,.3)",
                        marginTop: "1em",
                        borderRadius: 5,
                        border: "1px solid rgba(0,0,0,.3)",
                        fontFamily:
                            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                    }}
                />
            </div>

            <style jsx>{`
                .wrapper {
                    margin: 1em;
                    display: flex;
                    flex-direction: column;
                }
                .actions {
                    display: flex;
                    gap: 1em;
                }
            `}</style>
        </div>
    )
}

export default AdapterForm
