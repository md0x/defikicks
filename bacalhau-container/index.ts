import axios from "axios"

const getIpfsFile = async (ipfsHash: string) => {
    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://w3s.link/ipfs/" + ipfsHash,
        headers: {},
    }

    axios
        .request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data))
        })
        .catch((error) => {
            console.log(error)
        })
}

async function run() {
    const proposalId = process.env.PROPOSAL_ID
    const rootVotes = process.env.ROOT_VOTES
    const nodeUrl = process.env.NODE_URL
    const test = await getIpfsFile("QmNjkECL37oveLZuFuNHNWfpYSaWeBUYFkrDPeoqQWoTLQ")
    console.log(`Proposal ID: ${proposalId} - Root Votes: ${rootVotes} - Node URL: ${nodeUrl}`)
}

run()
