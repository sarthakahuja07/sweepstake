import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { useAccount, useConnect, useEnsName } from 'wagmi'

const { chains, provider } = configureChains(
	[
		chain.mainnet,
		chain.polygon,
		chain.rinkeby,
		chain.localhost,
		chain.hardhat
	],
	[alchemyProvider({ apiKey: process.env.ALCHEMY_ID! }), publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: "Sweepstake",
	chains
});

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider
});

export { wagmiClient, chains };
