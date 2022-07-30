import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { developmentChains } from "../hardhat-helper";
import { network } from "hardhat";
const VRFCoordinatorV2MockDeploy: DeployFunction = async (
	hre: HardhatRuntimeEnvironment
) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy, log } = deployments;
	const { deployer, entrant } = await getNamedAccounts();

	const BASE_FEE = "250000000000000000";
	const BASE_FEE_UNIT = 1e9;

	if (developmentChains.includes(network.name)) {
		log("🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 ");
		await deploy("VRFCoordinatorV2Mock", {
			from: deployer,
			log: true,
			args: [BASE_FEE, BASE_FEE_UNIT]
		});

		log("🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 🧑 DEPLOYED MOCK");
	}
};

export default VRFCoordinatorV2MockDeploy;
VRFCoordinatorV2MockDeploy.tags = ["VRFCoordinatorV2Mock", "mocks", "all"];
