"use client";

import "./globals.css";

import Header from "../components/Header";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { Chain } from "@wagmi/chains";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";

// export const metadata = {
// 	title: "Create Next App",
// 	description: "Generated by create next app",
// };

const { chains, provider } = configureChains(
	[mainnet],
	[
		jsonRpcProvider({
			rpc: (chain: Chain) => ({
				http: `http://127.0.0.1:8545`,
			}),
		}),
	],
);

const { connectors } = getDefaultWallets({
	appName: "Uniswap Max",
	chains,
});
const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="flex justify-center">
				<WagmiConfig client={wagmiClient}>
					<RainbowKitProvider chains={chains}>
						<Header />
						{children}
					</RainbowKitProvider>
				</WagmiConfig>
			</body>
		</html>
	);
}
