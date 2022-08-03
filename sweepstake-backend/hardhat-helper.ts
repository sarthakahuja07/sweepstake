type networkConfigType = {
	blockConfirmations?: number;
	vrfCoordinatorAddress?: string;
	subscriptionId?: string;
	keyHash?: string;
	keepersInterval?: string;
	entranceFee?: string;
	callbackGasLimit?: string;
};
type networkConfigTypeObject = {
	[key: string]: networkConfigType;
};

const networkConfig: networkConfigTypeObject = {
	localhost: {
		keepersInterval: "3"
	},
	hardhat: {
		keepersInterval: "3"
	},
	rinkeby: {
		vrfCoordinatorAddress: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
		blockConfirmations: 6,
		subscriptionId: "9227",
		keyHash:
			"0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
		keepersInterval: "3",
		entranceFee: "50000000000000000", // 0.1 ETH
		callbackGasLimit: "500000" // 500,000 gas
	},
	mumbai: {
		vrfCoordinatorAddress: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
		blockConfirmations: 6,
		subscriptionId: "9227",
		keyHash:
			"0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
		keepersInterval: "3",
		entranceFee: "50000000000000000",
		callbackGasLimit: "500000" // 500,000 gas
	}
};
const developmentChains = ["hardhat", "localhost"];
const frontEndContractsFile = "../sweepstake-frontend/constants/contractAddresses.json"
const frontEndAbiFile = "../sweepstake-frontend/constants/abi.json"

export { networkConfig, developmentChains,frontEndContractsFile,frontEndAbiFile };
