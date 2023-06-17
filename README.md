# DefiKicks DAO

<img src="./decentralized-repo/frontend/defikicks-logo-big.png"
     alt="Markdown Monster icon"
     style="float: left; margin-right: 10px;width:200px" />

**ENS: defikicks.eth**

Short description: 
On-chain governed and fully decentralized TVL and DeFi data aggregator

Description:
DefiKicks is where blockchain brilliance meets financial finesse. We're kickin' it up a notch, flipping the DeFi script with a fully decentralized, next-level approach to data aggregation. In our crypto cosmos, it's not just about presenting the latest and greatest in DeFi – it's about doing it in a way that's transparent, trustworthy, and totally rad.

We've got smart contracts running the show, and our users are the real MVPs, calling the shots on how we calculate Total Value Locked (TVL) and all things DeFi. So, kick back, relax, and take control with DefiKicks. We're not just about riding the DeFi wave, we're about giving you the tools to make it your own. Welcome to the DeFi revolution, DefiKicks style. 🚀

## WHY?

DefiKicks aims to solve several key challenges that users often face in the DeFi (Decentralized Finance) space TVL aggregator like Defi Llama, DeBank, etc...:

Data Transparency: DefiKicks offers a comprehensive and transparent view of the DeFi ecosystem. It aggregates and presents data from a multitude of DeFi protocols, providing users with up-to-date, reliable, and easy-to-understand information.

Cross-Chain Complexity: With the rise of various blockchains supporting DeFi, it can be challenging to keep track of protocols across different chains. DefiKicks solves this by providing cross-chain data, making it easier for users to compare and contrast DeFi protocols on various blockchains.

Decentralized Governance: Unlike many existing platforms, DefiKicks takes decentralization a step further. Through a set of smart contracts and decentralized backend tools, it allows the community to govern the project in a truly decentralized manner.

Ease of Use: Navigating the DeFi landscape can be daunting, especially for newcomers. DefiKicks simplifies this by offering an intuitive, user-friendly platform that helps users quickly understand and engage with the DeFi space.

Accessibility: DefiKicks is committed to making DeFi data accessible to everyone, free of charge. This promotes inclusivity and broadens participation in the DeFi sector.

In essence, DefiKicks is designed to be a comprehensive, user-friendly, and truly decentralized platform that promotes transparency and ease of use in the DeFi sector, making it easier for both new and experienced users to navigate the complex landscape of decentralized finance.

Github repo:
https://github.com/md0x/defikicks

##  Smart contracts
### 1. GovernorContract

Controls the Governance Token emission and the Adapter Registry. Allows users to propose governance actions, for instance adding new adapters to the Adapter Registry. Expects votes to be voted off-chain (similar to Snapshot) and brought on-chain with Lilypad + Bacalhau. Every vote rewards voters that voted correctly (with the majority) with inflationary rewards, these are calculated off-chain, again in the same Bacalhau job requested through Lilypad. Very importantly, the off-chain votes are unbiassed thanks to Drand Timelock encrypton (more in this in Drand section)
### 2. DefiKicksDataGovernanceToken

Utility token used to vote off-chain. Inflationary rewards are emitted to voters that voted correctly

### 3 DefiKicksAdapterRegistry

Stores the references in IPFS to the adapters javascript code. Defi Kicks allow any one to propose a piece of code to calculate TVL of any project. Once approved, this contract holds some information to be used by the Lit+Ceramic workflow to calculate a generate the Data off-chain.

##  LIT PROTOCOL

Defi Kicks uses Lit Protocol PKP's to:
1. Control in a decentralised way Ceramic streams where the Defi Data is stored
2. Sign the calculated data to guarantee that it has been calculated following the rules and Adapters voted in DefiKicks
3. Lit actions that run the code of the adapters in a decentralised and secure way

Lit procotol is essential to guarantee distributed data governance in Defi Kicks

##  CERAMIC

Defi Kicks uses ceramic streams controlled by LIT PKP's to store the core data of the protocol. That is the Defi Data (Only TVL's currently).

##  IPFL

TODO

##  Bacalhau

Bacalhau TODO

##  Filecoin FEVM

Blockchain that supports all the contracts interactions an allow our Data DAO to govern the data. Allow us interactions with Lilypad and Bacalhau

##  IPFS Inter planetry File System
Allows us to store data in a decentralised way. Essential for us:
- JS adapter - Distributed Code
- Encrypted votes

##  WEB3 Storage

Web3 storage is used to upload and download data to IPFS:
- Code for the adapters
- Timelock encrypted votes
- ...

##  Drand - Timelock encryption

Drand is an amazing technology that allows us to do off-chain unbiased voting by timelock encrypting the votes during the voting phase. This is extremly important as we reward users that vote with the majority (Schelling point) and by hidding the votes (timelock encryption) we force them to vote with their own criteria and thus decide the better resolution of every vote. Timelock encryption allows us to improve the user experience of voting a lot if we compare it with a commit & reveal scheme. 

// Pkp permissions
https://lit-protocol.calderaexplorer.xyz/address/0x4Aed2F242E806c58758677059340e29E6B5b7619


