import axios from "axios"
import { BigNumber, ethers } from "ethers"
import addresses from "./addresses.json"
import GovernorABI from "./contracts/GovernorContract.json"
import TokenABI from "./contracts/DefiKicksDataGovernanceToken.json"
import { DefiKicksDataGovernanceToken, GovernorContract } from "./typechain-types"

const getIpfsFile = async (ipfsHash: string) => {
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

async function run() {
    const proposalId = process.env.PROPOSAL_ID
    const nodeUrl = process.env.NODE_URL

    console.log(proposalId, nodeUrl)

    // const test = await getIpfsFile("QmNjkECL37oveLZuFuNHNWfpYSaWeBUYFkrDPeoqQWoTLQ")
    // console.log(test)

    // const args = process.argv.slice(2)
    // console.log(process.argv)
    // console.log(process.env)
    // const proposalId = args[0]
    // const nodeUrl = args[1]
    // const proposalId = 123
    // const nodeUrl = "https://api.calibration.node.glif.io/rpc/v0"

    // const provider = new ethers.providers.JsonRpcProvider(nodeUrl)

    // const governorContract = new ethers.Contract(
    //     addresses.governor,
    //     GovernorABI,
    //     provider
    // ) as GovernorContract

    // const tokenContract = new ethers.Contract(
    //     addresses.token,
    //     TokenABI,
    //     provider
    // ) as DefiKicksDataGovernanceToken

    // const forVotes = (await tokenContract.totalSupply()).div(2).add(1)
    // const againstVotes = BigNumber.from("1")
    // const abstainVotes = BigNumber.from("1")
    // const voteMerkleRoot = "0x6173646173646173646173646461000000000000000000000000000000000000"
    // const data = JSON.stringify({
    //     info: "arbitrary resolution data",
    // })

    // const calldata: string = ethers.utils.defaultAbiCoder.encode(
    //     [
    //         {
    //             type: "tuple",
    //             components: [
    //                 { name: "forVotes", type: "uint256" },
    //                 { name: "againstVotes", type: "uint256" },
    //                 { name: "abstainVotes", type: "uint256" },
    //                 { name: "voteMerkleRoot", type: "bytes32" },
    //                 { name: "data", type: "string" },
    //             ],
    //         } as any, // disable type checking
    //     ],
    //     [
    //         {
    //             forVotes,
    //             againstVotes,
    //             abstainVotes,
    //             voteMerkleRoot,
    //             data,
    //         },
    //     ]
    // )

    // console.log(calldata)
}

run()
