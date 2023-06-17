import axios from "axios"
import { BigNumber, ethers } from "ethers"
import addresses from "./addresses.json" assert { type: "json" }
import GovernorABI from "./contracts/GovernorContract.json" assert { type: "json" }
import TokenABI from "./contracts/DefiKicksDataGovernanceToken.json" assert { type: "json" }
import LilypadABI from "./contracts/LilypadEventsUpgradeable.json" assert { type: "json" }
import { timelockDecrypt, timelockEncrypt } from "tlock-js"
import { HttpChainClient, HttpCachingChain } from "drand-client"
import { StandardMerkleTree } from "@openzeppelin/merkle-tree"

import { getProposals, getVotes } from "./tiles.js"

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

    for (const vote of signedVotes) {
        const balance = await tokenContract.balanceOfAt(
            vote.account,
            proposalStruct.snapshotId.toString()
        )
        const voteObj = JSON.parse(vote.message)

        if (voteObj.vote === "for") {
            forVotes = forVotes.add(balance)
        }
        if (voteObj.vote === "against") {
            againstVotes = againstVotes.add(balance)
        }
    }

    const totalSupplyAtVote = await tokenContract.totalSupplyAt(
        proposalStruct.snapshotId.toString()
    )
    abstainVotes = totalSupplyAtVote.sub(forVotes.add(againstVotes))

    // Reward calculation
    const quorumPercentage = await governorContract.quorumPercentage()
    const majority = forVotes.gt(againstVotes) ? "for" : "against"
    const majorityValue = majority === "for" ? forVotes : againstVotes
    const arrivedToConsensus =
        !forVotes.eq(againstVotes) &&
        majorityValue.gte(totalSupplyAtVote.mul(quorumPercentage).div(ethers.utils.parseEther("1")))

    const toReward = []
    const emissionPerVote = await governorContract.emissionPerVote()
    if (arrivedToConsensus) {
        for (const vote of signedVotes) {
            const balance = await tokenContract.balanceOfAt(
                vote.account,
                proposalStruct.snapshotId.toString()
            )

            const ape = new ethers.Contract(
                "0xf88b1468a0a9d5CF4f252f0a46F09B6Ee32e7f1B",
                TokenABI,
                provider
            )
            const apeBalance = ape.balanceOf(vote.account)
            const voteObj = JSON.parse(vote.message)
            if (voteObj.vote == majority) {
                toReward.push([
                    vote.account,
                    balance
                        .add(apeBalance)
                        .mul(emissionPerVote)
                        .div(ethers.utils.parseEther("1"))
                        .toString(),
                ])
            }
        }
    } else {
        toReward.push([ethers.constants.AddressZero, "0"])
    }

    const tree = StandardMerkleTree.of(toReward, ["address", "uint256"])

    console.log("Merkle Root:", tree.root)

    const proofData = {}
    for (const [i, v] of tree.entries()) {
        // (3)
        const proof = tree.getProof(i)

        proofData[v[0]] = {
            amount: v[1],
            proof,
        }
    }
    const data = JSON.stringify(proofData)

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
                voteMerkleRoot: tree.root,
                data,
            },
        ]
    )

    console.log("calldata", calldata)

    // The rest of the code should be deleted once "api.calibration.node.glif.io" is approved as a domain
    // to be used in Bacalhau jobs

    const lilypad = new ethers.Contract(
        "0xdC7612fa94F098F1d7BB40E0f4F4db8fF0bC8820",
        LilypadABI,
        provider
    )

    // signer from private key
    const signer = new ethers.Wallet("0x" + process.env.PRIVATE_KEY, provider).connect(provider)

    await (
        await lilypad
            .connect(signer)
            .returnLilypadResults(governorContract.address, jobId, 1, calldata)
    ).wait()
}

run()
