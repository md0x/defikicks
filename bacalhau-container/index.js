import axios from "axios"
import { BigNumber, ethers } from "ethers"
import addresses from "./addresses.json" assert { type: "json" }
import GovernorABI from "./contracts/GovernorContract.json" assert { type: "json" }
import TokenABI from "./contracts/DefiKicksDataGovernanceToken.json" assert { type: "json" }
import LilypadABI from "./contracts/LilypadEventsUpgradeable.json" assert { type: "json" }
import { timelockDecrypt, timelockEncrypt } from "tlock-js"
import { HttpChainClient, HttpCachingChain } from "drand-client"

import { getProposals, getVotes } from "./tiles.js"

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

export const timelockDecryption = async (ciphertext) => {
    const fastestNodeClient = await getFastestNode()
    const result = await timelockDecrypt(ciphertext, fastestNodeClient)
    return result
}

const testnetUnchainedUrl =
    "https://pl-eu.testnet.drand.sh/7672797f548f3f4748ac4bf3352fc6c6b6468c9ad40ad456a397545c6e2df5bf"

const getFastestNode = async () => {
    const chain = new HttpCachingChain(testnetUnchainedUrl)
    const client = new HttpChainClient(chain)

    return client
}

async function run() {
    const proposalName = process.env.PROPOSAL_NAME

    const proposalData = await getProposals()

    console.log("Proposal Data: ", JSON.stringify(proposalData, null, 2))

    const proposal = proposalData.find((p) => p.name === proposalName)

    const proposalId = process.env.PROPOSAL_ID || proposal?.id
    const nodeUrl = process.env.NODE_URL

    console.log(proposalId, nodeUrl)

    const jobId = proposal?.jobId

    const votes = await getVotes(proposal.id)

    const decryptedVotes = []

    for (const vote of votes) {
        let message
        try {
            message = await timelockDecryption(vote.cyphertext)
        } catch (e) {}
        decryptedVotes.push({
            ...vote,
            message,
        })
    }

    const signedVotes = []

    for (const vote of decryptedVotes) {
        const recoveredAddress = ethers.utils.verifyMessage(vote.message, vote.signature)
        if (recoveredAddress === vote.account) {
            signedVotes.push(vote)
        }
    }

    const provider = new ethers.providers.JsonRpcProvider(nodeUrl)

    const governorContract = new ethers.Contract(addresses.governor, GovernorABI, provider)

    const proposalStruct = await governorContract.proposals(proposalId)

    const tokenContract = new ethers.Contract(addresses.token, TokenABI, provider)

    let forVotes = BigNumber.from(0)
    let againstVotes = BigNumber.from(0)
    let abstainVotes = BigNumber.from(0)
    const voteMerkleRoot = "0x6173646173646173646173646461000000000000000000000000000000000000"
    const data = JSON.stringify({
        info: "arbitrary resolution data",
    })

    for (const vote of signedVotes) {
        const balance = await tokenContract.balanceOfAt(
            vote.account,
            proposalStruct.snapshotId.toString()
        )
        const voteObj = JSON.parse(vote.message)
        forVotes = forVotes.add(balance)
        if (voteObj.vote === "for") {
            forVotes.add(balance)
        }
        if (voteObj.vote === "against") {
            againstVotes.add(balance)
        }
    }

    abstainVotes = (await tokenContract.totalSupplyAt(proposalStruct.snapshotId.toString())).sub(
        forVotes.add(againstVotes)
    )

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
