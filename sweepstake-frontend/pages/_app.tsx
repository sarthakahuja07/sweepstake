import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import Layout from "../components/Layout";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";
import { chains, wagmiClient } from "../wagmiConfig";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider
				coolMode
				chains={chains}
				theme={midnightTheme({
					overlayBlur: "large"
				})}
			>
				<ThemeProvider attribute="class" defaultTheme="dark">
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</ThemeProvider>
			</RainbowKitProvider>
		</WagmiConfig>
	);
}

export default MyApp;
