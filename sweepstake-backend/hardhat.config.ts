import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "solidity-coverage";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-gas-reporter";
require("dotenv").config();

const config: HardhatUserConfig = {
	solidity: "0.8.9",
	networks: {
		rinkeby: {
			accounts: [process.env.ACCOUNT_1!, process.env.ACCOUNT_2!],
			chainId: 4,
			url: process.env.RINKEBY_RPC_URL
		},
		localhost: {
			url: "http://127.0.0.1:8545/",
			chainId: 31337
		},
		mumbai: {
			url: process.env.MUMBAI_RPC_URL,
			chainId: 80001,
			accounts: [process.env.ACCOUNT_1!, process.env.ACCOUNT_2!]
		},
		goerli: {
			url: process.env.GOERLI_RPC_URL,
			chainId: 80002,
			accounts: [process.env.ACCOUNT_1!, process.env.ACCOUNT_2!]
		}
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY
	},
	gasReporter: {
		enabled: true,
		currency: "INR",
		token: "MATIC",
		coinmarketcap: process.env.COINMARKETCAP_API_KEY
	},
	namedAccounts: {
		deployer: {
			default: 0
		},
		entrant: {
			default: 1
		}
	},
	mocha: {
		timeout: 200000 // 200 seconds max for running tests
	}
};

export default config;
