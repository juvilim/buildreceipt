import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.34",
      },
      production: {
        version: "0.8.34",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    botTestnet: {
      type: "http",
      chainType: "generic",
      chainId: 968,
      url: "https://rpc.bohr.life",
      accounts: [configVariable("BOT_DEPLOYER_PRIVATE_KEY")],
    },
    botMainnet: {
      type: "http",
      chainType: "generic",
      chainId: 677,
      url: "https://rpc.botchain.ai",
      accounts: [configVariable("BOT_DEPLOYER_PRIVATE_KEY")],
    },
  },
});
