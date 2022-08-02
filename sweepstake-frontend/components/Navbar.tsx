import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
	return (
		<>
			<div className="container mx-auto py-8">
				<div className="flex min-w-full justify-between">
					<div className=" px-2">
						<h1 className="uppercase text-4xl font-extrabold">
							Sweepstake
						</h1>
					</div>
					<div className="px-2 ">
						<ConnectButton label="Connect" />
					</div>
				</div>
			</div>
		</>
	);
};

export default Navbar;
