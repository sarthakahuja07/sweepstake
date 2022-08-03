import { useEffect } from "react";
import { useAccount, chain, useNetwork, useContractRead } from "wagmi";
import { contractAddresses, abi } from "../constants/index";
import { useContractReads } from "wagmi";
import { ethers } from "ethers";

interface contractAddressesInterface {
	[key: string]: string[];
}

const Content = () => {
	const addresses: contractAddressesInterface = contractAddresses;
	let entranceFee: number;
	let countPlayers: number;
	let prevWinner: string;
	let sweepstakeAddress: string;

	const { address, isConnected } = useAccount();
	const { chain, chains } = useNetwork();

	sweepstakeAddress =
		chain && chain.id in addresses ? addresses[chain.id][0] : "";

	const { data, isError, error, isLoading } = useContractReads({
		contracts: [
			{
				addressOrName: sweepstakeAddress,
				contractInterface: abi,
				functionName: "getEntranceFee"
			},
			{
				addressOrName: sweepstakeAddress,
				contractInterface: abi,
				functionName: "getLatestWinner"
			}
			// {
			// 	addressOrName: sweepstakeAddress,
			// 	contractInterface: abi,
			// 	functionName: "getNumberOfEntrants"
			// }
		]
	});
	console.log("🧮 🧮 🧮 🧮 🧮 ", data);

	const supportedChains = chains.filter((chain) => {
		return addresses[chain.id] !== undefined;
	});

	return (
		<div className="container  mx-auto">
			<div className="p-4 mt-12 flex justify-between align-top">
				{isConnected && sweepstakeAddress ? (
					<>
						<div className="p-12 bg-neutral-900 bg-opacity-100 backdrop-blur-lg rounded drop-shadow-xl">
							<h3 className="text-lg">Entrance Fee:</h3>
							<h3 className="text-lg">
								The current number of players are:
							</h3>
							<h3 className="text-lg">
								The most previous winner was:
							</h3>
						</div>

						<button className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 px-4 rounded-xl ml-auto h-fit">
							Enter Sweepstake
						</button>
					</>
				) : (
					<div>
						<h4>
							Available chains:{" "}
							{supportedChains
								.map((chain) => chain.name)
								.join(", ")}
						</h4>
					</div>
				)}
			</div>
		</div>
	);
};

export default Content;
