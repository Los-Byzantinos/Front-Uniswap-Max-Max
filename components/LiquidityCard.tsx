"use client";

import React from "react";
import Button from "./Button";
import { useAccount, usePrepareContractWrite, useContractRead, useNetwork, useContractWrite } from "wagmi";
import { marketABI } from "@/abi/market.abi.json";
import { liquidityPoolABI } from "@/abi/liquidityPool.abi.json";
import { ERC20ABI } from "@/abi/ERC20.abi.json";
import { useEffect, useState } from "react";
import { networkConfig } from "@/helper-config.js";

interface LiquidityCardProps {
	asset: string;
	address: string;
	apy: number;
	volume: number;
	useRate: number;
}
type addressT = `0x${string}`;

function LiquidityCard(props: LiquidityCardProps) {
	const { isConnected, address } = useAccount();
	const { chain } = useNetwork();

	const [balanceAmount, setBalanceAmount] = useState<string | unknown>("0");
	const [amount, setAmount] = useState<number | undefined>(0);

	const asset = props.asset as keyof (typeof networkConfig)[1]["pool"];
	// const dec = networkConfig[1]["pool"][asset]["decimals"] as string;
	const dec = parseInt(networkConfig[1]["pool"][asset]["dec"] as string);
	const addToken = networkConfig[1]["pool"][asset]["token"] as addressT;

	const poolAddress = networkConfig[1]["pool"][asset]["address"] as addressT;
	const { config: approveConf } = usePrepareContractWrite({
		address: addToken,
		abi: ERC20ABI,
		functionName: "approve",
		args: [address, amount],
	});
	const { config: depositConf } = usePrepareContractWrite({
		address: poolAddress,
		abi: liquidityPoolABI,
		functionName: "deposit",
		args: [amount, address],
	});

	const { config: withdrawConf } = usePrepareContractWrite({
		address: poolAddress,
		abi: liquidityPoolABI,
		functionName: "redeem",
		args: [amount, address, address],
	});

	const { write: approve, isSuccess: isSuccessApprove, isLoading: isLoadingApprove } = useContractWrite(approveConf);
	const { write: deposit, isSuccess: isSuccessDeposit, isLoading: isLoadingDeposit } = useContractWrite(depositConf);
	const {
		write: withdraw,
		isSuccess: isSuccessWithdraw,
		isLoading: isLoadingWithdraw,
	} = useContractWrite(withdrawConf);

	const {
		data: balanceAmountTemp,
		isSuccess: isSuccessBalanceAmount,
		isLoading: isLoadingBalanceAmount,
	} = useContractRead({
		address: poolAddress,
		abi: liquidityPoolABI,
		functionName: "balanceOf",
		args: [address],
	});

	useEffect(() => {
		setBalanceAmount(balanceAmountTemp);
	}, [balanceAmountTemp, isConnected, amount]);

	return (
		<div className="liquidity-card-container text-neutral-300">
			<div className="flex flex-col md:gap-8 gap-2">
				<div className="glass-container flex flex-col gap-1 rounded-3xl md:p-8 p-4">
					<h2 className="text-3xl" style={{ fontStretch: "expanded" }}>
						{props.asset}
					</h2>
					<p className="md:text-lg text-sm text-neutral-400">Liquidity Pool</p>
				</div>
				<div className="glass-container flex flex-col gap-6 rounded-3xl md:p-8 p-4">
					<div className="flex flex-row items-center justify-center gap-4">
						<input
							type="number"
							id={`${props.asset}-input`}
							className="w-full"
							min="0"
							inputMode="numeric"
							pattern="\d*"
							onChange={(event) => {
								const inputValue = event.target.value;
								const floatValue = parseFloat(inputValue);
								const roundedValue = Math.round(floatValue * 10 ** dec);

								if (!isNaN(roundedValue)) {
									setAmount(roundedValue);
								}
							}}
						/>
						<label htmlFor={`${props.asset}-input`} className="md:text-2xl text-lg text-neutral-400">
							{props.asset}
						</label>
					</div>
					<div className="grid grid-cols-2 grid-rows-1 gap-4">
						<Button
							type="button"
							size="lg"
							style="solid"
							onClick={() => {
								approve?.();
								deposit?.();
							}}
						>
							📥 Deposit
						</Button>
						<Button type="button" size="lg" style="ghost" onClick={() => withdraw?.()}>
							📤 Withdraw
						</Button>
					</div>
				</div>
				<article className="glass-container flex flex-col md:gap-2 gap-1 rounded-3xl md:p-8 p-4">
					<p className="md:text-4xl text-2xl text-neutral-300">
						{(balanceAmount ? balanceAmount : 0) as string} um{props.asset}
					</p>
					<h4 className="md:text-lg text-sm text-neutral-400">Your deposit</h4>
				</article>
			</div>
			<div className="md:flex md:flex-col md:gap-8 grid grid-cols-3 grid-rows-1 gap-2 h-fit">
				<article className="glass-container flex flex-col md:gap-2 gap-1 rounded-3xl md:p-8 p-4">
					<p className="md:text-4xl text-2xl text-neutral-300">{props.apy}%</p>
					<h3 className="md:text-lg text-sm text-neutral-400">APY</h3>
				</article>
				<article className="glass-container flex flex-col md:gap-2 gap-1 rounded-3xl md:p-8 p-4">
					<p className="md:text-4xl text-2xl text-neutral-300">{props.useRate}%</p>
					<h3 className="md:text-lg text-sm text-neutral-400">Utilization rate</h3>
				</article>
				<article className="glass-container flex flex-col md:gap-2 gap-1 rounded-3xl md:p-8 p-4">
					<p className="md:text-4xl text-2xl text-neutral-300">{props.volume.toLocaleString("en-US", {})}</p>
					<h3 className="md:text-lg text-sm text-neutral-400">Total deposit</h3>
				</article>
			</div>
		</div>
	);
}

export default LiquidityCard;
