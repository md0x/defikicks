import { ethers } from "hardhat"

import type { LilypadEventsUpgradeable__factory } from "../typechain-types/factories/contracts/LilypadEventsUpgradeable__factory"
import {
    DefiKicksAdapterRegistry__factory,
    DefiKicksDataGovernanceToken__factory,
    GovernorContract__factory,
} from "../typechain-types"

async function main() {
    console.log("Deploying Defi Kicks contracts....")

    // Contracts are deployed using the first signer/account by default
    let owner
    if (!process.env.PRIVATE_KEY) {
        owner = (await ethers.getSigners())[0]
    } else {
        owner = new ethers.Wallet(process.env.PRIVATE_KEY || "undefined", ethers.provider)
    }

    // check network is hardhat
    let lilypadEventsAddress = "0xdC7612fa94F098F1d7BB40E0f4F4db8fF0bC8820" // Calibration address
    if (ethers.provider.network) {
        const LilypadEvents: LilypadEventsUpgradeable__factory = await ethers.getContractFactory(
            "LilypadEventsUpgradeable"
        )
        const lilypadEvents = await LilypadEvents.deploy()
        await lilypadEvents.deployed
        lilypadEventsAddress = lilypadEvents.address
        console.log("LilypadEvents deployed to ", lilypadEvents.address)
    }

    const Token: DefiKicksDataGovernanceToken__factory = await ethers.getContractFactory(
        "DefiKicksDataGovernanceToken"
    )
    const token = await Token.deploy()
    await token.deployed()
    console.log("Token deployed to ", token.address)

    const Governor: GovernorContract__factory = await ethers.getContractFactory("GovernorContract")
    const governor = await Governor.deploy(token.address, lilypadEventsAddress)
    await governor.deployed()
    console.log("Governor deployed to ", governor.address)

    const DefiKicksAdapterRegistry: DefiKicksAdapterRegistry__factory =
        await ethers.getContractFactory("DefiKicksAdapterRegistry")
    const adapterRegistry = await DefiKicksAdapterRegistry.deploy()
    await adapterRegistry.deployed()
    console.log("DefiKicksAdapterRegistry deployed to ", adapterRegistry.address)

    // transfer ownership to governor
    await (await token.transferOwnership(governor.address)).wait()
    await (await adapterRegistry.transferOwnership(governor.address)).wait()

    // set quorum percentage to 50%
    await (await governor.setQuorumPercentage(ethers.utils.parseEther("0.5"))).wait()
    await (await governor.setVotingPeriod(5 * 60)).wait() // 5 minutes
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

// possible issue & solver: https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/85#issuecomment-1028435049
// const FEE_DATA = {
//   maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
//   maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
// };
