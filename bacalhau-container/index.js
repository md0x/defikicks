import axios from "axios"
import { BigNumber, ethers } from "ethers"
import addresses from "./addresses.json" assert { type: "json" }
import GovernorABI from "./contracts/GovernorContract.json" assert { type: "json" }
import TokenABI from "./contracts/DefiKicksDataGovernanceToken.json" assert { type: "json" }
import LilypadABI from "./contracts/LilypadEventsUpgradeable.json" assert { type: "json" }

import { getProposals } from "./tiles.js"

const getIpfsFile = async (ipfsHash) => {
    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://w3s.link/ipfs/" + ipfsHash,
        headers: {},
    }

    return axios
        .request(config)
        .then((response) => response.data)
        .catch((error) => {})
}

async function getIpfsHash(adapterId, nodeUrl, contractAddress) {
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
        const result = await contract.adapters("Defi Mamba")
        ipfsHash = result.ipfsHash
        console.log(result)
    } catch (error) {
        console.error("Error:", error)
    }
    return ipfsHash
}

async function run() {
    const proposalName = process.env.PROPOSAL_NAME

    const proposalData = await getProposals()

    // const test2 = await getIpfsHash(proposalData[1].name,process.env.NODE_URL,addresses.registry)

    console.log("Proposal Data: ", JSON.stringify(proposalData, null, 2))

    const proposal = proposalData.find((p) => p.name === proposalName)

    const proposalId = process.env.PROPOSAL_ID || proposal?.id
    const nodeUrl = process.env.NODE_URL

    console.log(proposalId, nodeUrl)

    const jobId = proposal?.jobId

    const test = await getIpfsFile("QmNjkECL37oveLZuFuNHNWfpYSaWeBUYFkrDPeoqQWoTLQ")

    // console.log(test)

    const provider = new ethers.providers.JsonRpcProvider(nodeUrl)

    const governorContract = new ethers.Contract(addresses.governor, GovernorABI, provider)

    // const latestBlock = await governorContract.provider.getBlockNumber()

    // const voteResolution = governorContract.filters.VoteResolutionRequested()
    // const proposals = await governorContract.queryFilter(
    //     voteResolution,
    //     latestBlock - 1000,
    //     "latest"
    // )

    // const ids = proposals.map((p) => p.args.proposalId.toString())
    // const uniqueIds = ids.filter((v, i, a) => a.indexOf(v) === i)

    // const jobIds = []
    // for (const id of uniqueIds) {
    //     const proposal = await governorContract.proposals(id)
    //     jobIds.push(proposal.bridgeId.toString())
    // }

    const tokenContract = new ethers.Contract(addresses.token, TokenABI, provider)

    const forVotes = (await tokenContract.totalSupply()).div(2).add(1)
    const againstVotes = BigNumber.from("1")
    const abstainVotes = BigNumber.from("1")
    const voteMerkleRoot = "0x6173646173646173646173646461000000000000000000000000000000000000"
    const data = JSON.stringify({
        info: "arbitrary resolution data",
    })

    const calldata = ethers.utils.defaultAbiCoder.encode(
        [
            {
                type: "tuple",
                components: [
                    { name: "forVotes", type: "uint256" },
                    { name: "againstVotes", type: "uint256" },
                    { name: "abstainVotes", type: "uint256" },
                    { name: "voteMerkleRoot", type: "bytes32" },
                    { name: "data", type: "string" },
                ],
            }, // disable type checking
        ],
        [
            {
                forVotes,
                againstVotes,
                abstainVotes,
                voteMerkleRoot,
                data,
            },
        ]
    )

    const lilypad = new ethers.Contract(
        "0xdC7612fa94F098F1d7BB40E0f4F4db8fF0bC8820",
        LilypadABI,
        provider
    )

    // signer from private key
    const signer = new ethers.Wallet("0x" + process.env.PRIVATE_KEY, provider).connect(provider)

    console.log("sending transaction")
    await (
        await lilypad
            .connect(signer)
            .returnLilypadResults(governorContract.address, jobId, 1, calldata)
    ).wait()

    console.log(calldata)
}

run()
