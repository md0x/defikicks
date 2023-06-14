import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { StandardMerkleTree } from "@openzeppelin/merkle-tree"
import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { ethers } from "hardhat"
import {
    DefiKicksDataGovernanceToken__factory,
    GovernorContract__factory,
    LilypadEventsUpgradeable__factory,
} from "../typechain-types"
import { DefiKicksAdapterRegistry__factory } from "../typechain-types/factories/contracts/DefiKickAdapters.sol"

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

        const DefiKicksAdapterRegistry: DefiKicksAdapterRegistry__factory =
            await ethers.getContractFactory("DefiKicksAdapterRegistry")
        const adapterRegistry = await DefiKicksAdapterRegistry.deploy()

        // transfer ownership to governor
        await token.transferOwnership(governor.address)
        await adapterRegistry.transferOwnership(governor.address)

        await governor.setQuorumPercentage(ethers.utils.parseEther("0.5"))

        return { governor, token, owner, otherAccount, adapterRegistry, lilypadEvents }
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

    describe("Propose vote execute", function () {
        describe("Propose vote execute works", function () {
            it("Propose vote execute works", async function () {
                const { governor, token, adapterRegistry, lilypadEvents } = await loadFixture(
                    deployGovernorAndVotingToken
                )

                const adapterHash = "QmXvHqyCoKyWGX5uudDxBpyC6ny4DH2akNHjcyRoTGcuhL"

                const addNewAdapter = adapterRegistry.interface.encodeFunctionData("addAdapter", [
                    "Test",
                    adapterHash,
                ])

                await governor.propose(
                    [adapterRegistry.address],
                    [0],
                    [addNewAdapter],
                    "Add new test adapter"
                )

                const proposalFilter = governor.filters.ProposalCreated()
                const proposals = await governor.queryFilter(proposalFilter)

                // Get the latest proposal event
                const latestProposal = proposals[proposals.length - 1]
                const {
                    proposalId,
                    proposer,
                    targets,
                    values,
                    calldatas,
                    voteStart,
                    voteEnd,
                    description,
                } = latestProposal.args

                console.log("Proposal ID:", proposalId)
                console.log("Proposer:", proposer)
                console.log("Targets:", targets)
                console.log("Values:", latestProposal.args[3])
                console.log("Calldatas:", calldatas)
                console.log("Vote Start:", voteStart.toString())
                console.log("Vote End:", voteEnd.toString())
                console.log("Description:", description)
                console.log("Description Hash:", latestProposal.args.descriptionHash)

                // request execution
                const lilypadFee = await governor.getLilypadFee()
                await governor.requestVoteResolution(proposalId, { value: lilypadFee })

                const voteResolutionRequestedFilter = governor.filters.VoteResolutionRequested()
                const resolutionRequest = await governor.queryFilter(voteResolutionRequestedFilter)

                // Get the latest proposal event
                const latestResolutionRequest = resolutionRequest[resolutionRequest.length - 1]

                console.log("Resolution Requested:", latestResolutionRequest.args)

                console.log("Proposal ID:", latestResolutionRequest.args.proposalId)
                console.log("Bridge ID:", latestResolutionRequest.args.bridgeId)

                // lilypad resolution

                const NewLilypadJobSubmittedFilter = lilypadEvents.filters.NewLilypadJobSubmitted()
                const newLilypadJobSubmitted = await lilypadEvents.queryFilter(
                    NewLilypadJobSubmittedFilter
                )

                // Get the latest proposal event
                const latestNewLilypadJobSubmitted =
                    newLilypadJobSubmitted[newLilypadJobSubmitted.length - 1]

                const forVotes = (await token.totalSupply()).div(2)
                const againstVotes = BigNumber.from("1")
                const abstainVotes = BigNumber.from("1")
                const voteMerkleRoot =
                    "0x6173646173646173646173646461000000000000000000000000000000000000"
                const data = JSON.stringify({
                    info: "arbitrary resolution data",
                })

                const calldata: string = ethers.utils.defaultAbiCoder.encode(
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
                        } as any, // disable type checking
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

                await lilypadEvents.returnLilypadResults(
                    latestNewLilypadJobSubmitted.args.job.requestor,
                    latestNewLilypadJobSubmitted.args.job.id,
                    latestNewLilypadJobSubmitted.args.job.resultType,
                    calldata
                )

                const ProposalUpdatedFilter = governor.filters.ProposalUpdated()
                const proposalUpdated = await governor.queryFilter(ProposalUpdatedFilter)

                // Get the latest proposal event
                const latestProposalUpdated = proposalUpdated[proposalUpdated.length - 1]

                assert.equal(
                    latestProposalUpdated.args.proposalId.toString(),
                    latestResolutionRequest.args.proposalId.toString()
                )

                assert.equal(latestProposalUpdated.args.forVotes.toString(), forVotes.toString())

                assert.equal(
                    latestProposalUpdated.args.againstVotes.toString(),
                    againstVotes.toString()
                )

                assert.equal(
                    latestProposalUpdated.args.abstainVotes.toString(),
                    abstainVotes.toString()
                )

                assert.equal(latestProposalUpdated.args.voteMerkleRoot, voteMerkleRoot)

                assert.equal(latestProposalUpdated.args.data, data)

                // execute proposal
                await governor.execute(
                    [adapterRegistry.address],
                    [0],
                    [addNewAdapter],
                    latestProposal.args.descriptionHash
                )

                const adapterHashResult = await adapterRegistry.adapters("Test")

                assert.equal(adapterHash, adapterHashResult.ipfsHash)
            })
        })
    })
})
