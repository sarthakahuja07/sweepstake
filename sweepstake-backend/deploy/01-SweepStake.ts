import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat-helper";
import verify from "../utils/verify";

const deploySweepStake: DeployFunction = async (
	hre: HardhatRuntimeEnvironment
) => {
	const { deployments, getNamedAccounts, ethers } = hre;
	const { deploy, log } = deployments;
	const { deployer, entrant } = await getNamedAccounts();
	let vrfCoordinatorV2Address,
		subscriptionId,
		entrancFee,
		keyHash,
		callbackGasLimit,
		interval;
	const FUND_AMOUNT = "1000000000000000000000";

	log("🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑");

	if (developmentChains.includes(network.name)) {
		const VRFCoordinatorV2Mock = await ethers.getContract(
			"VRFCoordinatorV2Mock"
		);
		vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
		const transactionResponse = await VRFCoordinatorV2Mock.createSubscription();
		const transactionReceipt = await transactionResponse.wait();
		subscriptionId = transactionReceipt.events[0].args.subId;
		entrancFee = "1000000000000000000"; // 0.1 ETH
		callbackGasLimit = "500000"; // 500,000 gas
		interval = networkConfig[network.name]["keepersInterval"];
		keyHash =
			"0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
	} else {
		vrfCoordinatorV2Address = networkConfig[network.name].vrfCoordinatorAddress;
		subscriptionId = networkConfig[network.name]["subscriptionId"];
		entrancFee = networkConfig[network.name]["entranceFee"];
		callbackGasLimit = networkConfig[network.name]["callbackGasLimit"];
		interval = networkConfig[network.name]["keepersInterval"];
		keyHash = networkConfig[network.name]["keyHash"];
	}

	const args: any[] = [
		entrancFee,
		vrfCoordinatorV2Address,
		subscriptionId,
		keyHash,
		callbackGasLimit,
		interval
	];

	const sweepStake = await deploy("Sweepstake", {
		from: deployer,
		log: true,
		args: args,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 0
	});

	log("🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 DEPLOYED");

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log("Verifying...");
		await verify(sweepStake.address, args);
		log("🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 VERIFIED");
	}
};

export default deploySweepStake;
deploySweepStake.tags = ["SweepStake", "all"];
