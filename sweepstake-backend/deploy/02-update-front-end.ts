import { frontEndContractsFile, frontEndAbiFile } from "../hardhat-helper";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

const updateUI: DeployFunction = async function (
	hre: HardhatRuntimeEnvironment
) {
	const { network, ethers } = hre;
	const chainId = "31337";

	console.log("Writing to front end...");
	const sweepstake = await ethers.getContract("Sweepstake");
	const contractAddresses = JSON.parse(
		fs.readFileSync(frontEndContractsFile, "utf8")
	);
	contractAddresses[network.config.chainId!] = [sweepstake.address];

	// if (chainId in contractAddresses) {
	// 	if (
	// 		!contractAddresses[network.config.chainId!].includes(sweepstake.address)
	// 	) {
	// 		contractAddresses[network.config.chainId!].push(sweepstake.address);
	// 	}
	// } else {
	// 	contractAddresses[network.config.chainId!] = [sweepstake.address];
	// }
	fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

	const dir = path.resolve(
		__dirname,
		"../artifacts/contracts/Sweepstake.sol/Sweepstake.json" // hardhat build dir
	);
	const file = fs.readFileSync(dir, "utf8");
	const json = JSON.parse(file);
	const abi = json.abi;

	fs.writeFileSync(frontEndAbiFile, JSON.stringify(abi));

	console.log("Front end written!");
};
export default updateUI;
updateUI.tags = ["all", "frontend"];
