import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains(
	[chain.mainnet, chain.polygon, chain.rinkeby],
	[alchemyProvider({ alchemyId: process.env.ALCHEMY_ID! }), publicProvider()]
);
