import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import { config as dotenvConfig } from "dotenv"
import { resolve } from "path"

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env"
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) })

const walletPrivateKey: string | undefined = process.env.WALLET_PRIVATE_KEY

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},

        ...(walletPrivateKey
            ? {
                  filecoinCalibrationNet: {
                      url: "https://api.calibration.node.glif.io/rpc/v0",
                      chainId: 314159,
                      accounts: [walletPrivateKey],
                  },
                  filecoinMainnet: {
                      url: "https://api.node.glif.io", //'https://rpc.ankr.com/filecoin_testnet', //https://filecoin-hyperspace.chainstacklabs.com/rpc/v1
                      chainId: 314,
                      accounts: [walletPrivateKey],
                  },
              }
            : {}),
    },
}

export default config
