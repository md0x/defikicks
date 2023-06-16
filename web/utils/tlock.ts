import { timelockDecrypt, timelockEncrypt } from "tlock-js"
import { HttpChainClient, HttpCachingChain } from "drand-client"

const testnetUnchainedUrl =
    "https://pl-eu.testnet.drand.sh/7672797f548f3f4748ac4bf3352fc6c6b6468c9ad40ad456a397545c6e2df5bf"

const getFastestNode = async () => {
    const chain = new HttpCachingChain(testnetUnchainedUrl)
    const client = new HttpChainClient(chain)

    return client
}

export const timelockEncryption = async (message: string, duration: number) => {
    if (duration < 30)
        throw new Error("Duration must be positive and greater or equal to 30 seconds")
    const fastestNodeClient = await getFastestNode()
    const latestRound = await fastestNodeClient.latest()
    const chain = new HttpCachingChain(testnetUnchainedUrl)

    const { period } = await chain.info()

    const roundNumber = latestRound.round + Math.floor(duration / period)

    const result = await timelockEncrypt(
        latestRound.round + 1,
        Buffer.from(message),
        fastestNodeClient
    )
    return result
}

export const timelockDecryption = async (ciphertext: string) => {
    const fastestNodeClient = await getFastestNode()
    const result = await timelockDecrypt(ciphertext, fastestNodeClient)
    return result
}
