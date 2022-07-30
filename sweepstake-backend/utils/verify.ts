import { run } from "hardhat";
const verify = async (contractAddress: string, args: any[]) => {
	try {
		console.log("Verifying contract...");
		await run("verify:verify", {
			address: contractAddress,
			constructorArguments: args
		});
	} catch (err: any) {
		console.log(err);
	}
};

export default verify;