import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import { StandardMerkleTree } from "@openzeppelin/merkle-tree"
import {
    DefiKicksDataGovernanceToken__factory,
    GovernorContract,
    GovernorContract__factory,
    LilypadEventsUpgradeable__factory,
    LilypadEvents__factory,
} from "../typechain-types"

describe("Governance", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployGovernorAndVotingToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners()

        const LilypadEvents: LilypadEventsUpgradeable__factory = await ethers.getContractFactory(
            "LilypadEventsUpgradeable"
        )
        const lilypadEvents = await LilypadEvents.deploy()

        const Token: DefiKicksDataGovernanceToken__factory = await ethers.getContractFactory(
            "DefiKicksDataGovernanceToken"
        )
        const token = await Token.deploy()

        const Governor: GovernorContract__factory = await ethers.getContractFactory(
            "GovernorContract"
        )
        const governor = await Governor.deploy(token.address, lilypadEvents.address)

        return { governor, token, owner, otherAccount }
    }

    describe("Deployment", function () {
        it("Should deploy contracts", async function () {
            const { governor, token } = await loadFixture(deployGovernorAndVotingToken)

            expect(await token.symbol()).to.equal("KICK")
        })
    })

    describe("Tree", function () {
        describe("Validations", function () {
            it("Trees work", async function () {
                const values = [
                    ["0x1111111111111111111111111111111111111111", "5000000000000000000"],
                    ["0x2222222222222222222222222222222222222222", "2500000000000000000"],
                ]

                // (2)
                const tree = StandardMerkleTree.of(values, ["address", "uint256"])

                // (3)
                console.log("Merkle Root:", tree.root)
            })
        })
    })
})
