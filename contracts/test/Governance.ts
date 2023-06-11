import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import {
    DefiKicksDataGovernanceToken__factory,
    GovernorContract,
    GovernorContract__factory,
} from "../typechain-types"

describe("Governance", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployGovernorAndVotingToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners()

        const Token: DefiKicksDataGovernanceToken__factory = await ethers.getContractFactory(
            "DefiKicksDataGovernanceToken"
        )
        const token = await Token.deploy()

        const Governor: GovernorContract__factory = await ethers.getContractFactory(
            "GovernorContract"
        )
        const governor = await Governor.deploy(token.address)

        return { governor, token, owner, otherAccount }
    }

    describe("Deployment", function () {
        it("Should deploy contracts", async function () {
            const { governor, token } = await loadFixture(deployGovernorAndVotingToken)

            expect(await token.symbol()).to.equal("KICK")
        })
    })

    describe("Withdrawals", function () {
        // describe("Validations", function () {
        //     it("Should revert with the right error if called too soon", async function () {
        //         const { lock } = await loadFixture(deployOneYearLockFixture)
        //         await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet")
        //     })
        //     it("Should revert with the right error if called from another account", async function () {
        //         const { lock, unlockTime, otherAccount } = await loadFixture(
        //             deployOneYearLockFixture
        //         )
        //         // We can increase the time in Hardhat Network
        //         await time.increaseTo(unlockTime)
        //         // We use lock.connect() to send a transaction from another account
        //         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
        //             "You aren't the owner"
        //         )
        //     })
        //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        //         const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture)
        //         // Transactions are sent using the first signer by default
        //         await time.increaseTo(unlockTime)
        //         await expect(lock.withdraw()).not.to.be.reverted
        //     })
        // })
    })
})
