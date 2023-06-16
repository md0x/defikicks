// const code = `
async function generateRandomNumber(nodeUrl) {
    // Connect to the provider
    const provider = new ethers.providers.JsonRpcProvider(nodeUrl)

    // Get the latest block number
    const latestBlockNumber = await provider.getBlockNumber()

    // Generate a random number using the latest block number as part of the seed
    const fixedValue = "DefiKicks"
    const seed = latestBlockNumber.toString() + fixedValue
    const randomNumber = ethers.utils.solidityKeccak256(["string"], [seed])
    const randomRange = 100000000 - 50000000
    const generatedNumber = (parseInt(randomNumber, 16) % randomRange) + 50000000

    return generatedNumber
}

function run() {
    return generateRandomNumber(nodeUrl)
}

run()
// `
// Uploaded to IPFS => QmTtHUUeHVWqpwC83k1ZBAjm93GQzD5HHE9iwd9hFxaiFn

// const code = `async function i(e){let r=await new ethers.providers.JsonRpcProvider(e).getBlockNumber(),n="DefiKicks",t=r.toString()+n,o=ethers.utils.solidityKeccak256(["string"],[t]),s=1e8-5e7;return parseInt(o,16)%s+5e7}function u(){return i(nodeUrl)}u();
// `
function sha256Hash(string) {
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(string))
    return hash
}

const downloadIpfsFile = async (ipfsHash) => {
    const url = "https://w3s.link/ipfs/" + ipfsHash
    return await fetch(url).then((response) => response.text())
}

async function getIpfsHash(adapterName, nodeUrl, contractAddress) {
    const abi = [
        {
            inputs: [
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
            ],
            name: "adapters",
            outputs: [
                {
                    internalType: "string",
                    name: "name",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "ipfsHash",
                    type: "string",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ]

    const provider = new ethers.providers.JsonRpcProvider(nodeUrl)
    const contract = new ethers.Contract(contractAddress, abi, provider)

    let ipfsHash = ""
    try {
        const result = await contract.adapters(adapterName)
        ipfsHash = result.ipfsHash
        console.log(result)
    } catch (error) {
        console.error("Error:", error)
    }
    return ipfsHash
}

const go = async () => {
    let ethAddress = ethers.utils.computeAddress(publicKey)

    if (!adapterId) throw new Error("adapterId is required")

    // const ipfsAdapter = await getIpfsHash(adapterName, nodeUrl, contractAddress)
    const code = await downloadIpfsFile(adapterHash)

    const tvl = await eval(code)

    const currentTime = Math.floor(new Date().getTime() / 1000)

    const response = {
        runner: authSig.address,
        tvl,
        timestamp: currentTime,
    }

    const responseHash = ethers.utils.toUtf8String(
        ethers.utils.toUtf8Bytes(sha256Hash(JSON.stringify(response)))
    )

    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
        message: responseHash,
        publicKey,
        sigName,
    })

    Lit.Actions.setResponse({
        response: JSON.stringify({ ethAddress, response, responseHash }),
    })
}

go()
