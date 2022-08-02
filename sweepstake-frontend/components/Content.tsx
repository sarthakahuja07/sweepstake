import { useAccount } from "wagmi";
import { contractAddresses } from "../constants/index";

interface contractAddressesInterface {
	[key: string]: string[];
}

const Content = () => {
	const addresses: contractAddressesInterface = contractAddresses;
	// const entranceFee: number;
	// const countPlayers: number;
	// const prevWinner: string;
	const { address, isConnected } = useAccount();

	return (
		<div className="container  mx-auto">
			<div className="p-4 mt-12 flex justify-between align-top">
				{isConnected && address ? (
					<>
						<div className="p-12 bg-neutral-900 bg-opacity-100 backdrop-blur-lg rounded drop-shadow-xl">
							<h3 className="text-lg">Entrance Fee:</h3>
							<h3 className="text-lg">
								EThe current number of players are:
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
					<div>Connect to a supported chain</div>
				)}
			</div>
		</div>
	);
};

export default Content;
