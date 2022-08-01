import { developmentChains, networkConfig } from "../../hardhat-helper";
import { network, ethers, deployments } from "hardhat";
import { Sweepstake, VRFCoordinatorV2Mock } from "../../typechain-types";
import { BigNumber } from "ethers";
import { assert, expect } from "chai";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

!developmentChains.includes(network.name)
	? describe.skip
	: describe("SweepStake unit Tests", function () {
			let sweepstake: Sweepstake;
			let sweepstakeContract: Sweepstake;
			let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
			let entranceFee: BigNumber;
			let interval: number;
			let entrant: SignerWithAddress;
			let accounts: SignerWithAddress[];

			beforeEach(async () => {
				accounts = await ethers.getSigners();
				//   deployer = accounts[0]
				entrant = accounts[1];
				await deployments.fixture(["all"]);
				vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
				sweepstakeContract = await ethers.getContract("Sweepstake");
				sweepstake = sweepstakeContract.connect(entrant);
				entranceFee = await sweepstake.getEntranceFee();
				interval = (await sweepstake.getInterval()).toNumber();
			});

			describe("constructor", function () {
				it("intitiallizes the sweepstake correctly", async () => {
					console.log(network.config.chainId);
					const state = (await sweepstake.getState()).toString();
					console.log(state);
					console.log(networkConfig[network.name].keepersInterval);
					console.log(interval);
					assert.equal(state, "0");
					assert.equal(
						interval.toString(),
						networkConfig[network.name].keepersInterval
					);
				});
			});

			describe("enter sweepstake", function () {
				it("reverts when you don't pay enough", async () => {
					await expect(sweepstake.enterSweepstake()).to.be.revertedWith(
						"Sweepstake__not_enough_entrance_fee"
					);
				});
				it("records player when they enter", async () => {
					await sweepstake.enterSweepstake({ value: entranceFee });
					const contractPlayer = await sweepstake.getEntrant(0);
					assert.equal(entrant.address, contractPlayer);
				});
				it("emits event on enter", async () => {
					await expect(
						sweepstake.enterSweepstake({ value: entranceFee })
					).to.emit(sweepstake, "SweepStake__sweepStatkeEnter");
				});
				it("doesn't allow entrance when sweepstake is calculating", async () => {
					await sweepstake.enterSweepstake({ value: entranceFee });
					await network.provider.send("evm_increaseTime", [interval + 1]);
					await network.provider.request({ method: "evm_mine", params: [] });
					// we pretend to be a keeper for a second
					await sweepstake.performUpkeep([]);
					await expect(
						sweepstake.enterSweepstake({ value: entranceFee })
					).to.be.revertedWith("Sweepstake__state__notOpen");
				});
			});
			describe("checkUpkeep", function () {
				it("returns false if people haven't sent any ETH", async () => {
					await network.provider.send("evm_increaseTime", [interval + 1]);
					await network.provider.request({ method: "evm_mine", params: [] });
					const { upkeepNeeded } = await sweepstake.callStatic.checkUpkeep(
						"0x"
					);
					assert(!upkeepNeeded);
				});
				it("returns false if sweepstake isn't open", async () => {
					await sweepstake.enterSweepstake({ value: entranceFee });
					await network.provider.send("evm_increaseTime", [interval + 1]);
					await network.provider.request({ method: "evm_mine", params: [] });
					await sweepstake.performUpkeep([]);
					const state = await sweepstake.getState();
					const { upkeepNeeded } = await sweepstake.callStatic.checkUpkeep(
						"0x"
					);
					assert.equal(state.toString() == "1", upkeepNeeded == false);
				});
				it("returns false if enough time hasn't passed", async () => {
					await sweepstake.enterSweepstake({ value: entranceFee });
					await network.provider.send("evm_increaseTime", [interval - 2]);
					await network.provider.request({ method: "evm_mine", params: [] });
					const { upkeepNeeded } = await sweepstake.callStatic.checkUpkeep(
						"0x"
					);
					assert(!upkeepNeeded);
				});
				it("returns true if enough time has passed, has players, eth, and is open", async () => {
					await sweepstake.enterSweepstake({ value: entranceFee });
					await network.provider.send("evm_increaseTime", [interval + 1]);
					await network.provider.request({ method: "evm_mine", params: [] });
					const { upkeepNeeded } = await sweepstake.callStatic.checkUpkeep(
						"0x"
					);
					assert(upkeepNeeded);
				});
			});

			describe("performUpkeep", function () {
				it("can only run if checkupkeep is true", async () => {
					await sweepstake.enterSweepstake({ value: entranceFee });
					await network.provider.send("evm_increaseTime", [interval + 1]);
					await network.provider.request({ method: "evm_mine", params: [] });
					const tx = await sweepstake.performUpkeep("0x");
					assert(tx);
				});
				it("reverts if checkup is false", async () => {
					await expect(sweepstake.performUpkeep("0x")).to.be.revertedWith(
						"SweepStake__upKeepNotNeeded"
					);
				});
				it("updates the sweepstake state and emits a requestId", async () => {
					// Too many asserts in this test!
					await sweepstake.enterSweepstake({ value: entranceFee });
					await network.provider.send("evm_increaseTime", [interval + 1]);
					await network.provider.request({ method: "evm_mine", params: [] });
					const txResponse = await sweepstake.performUpkeep("0x");
					const txReceipt = await txResponse.wait(1);
					const state = await sweepstake.getState();
					const requestId = txReceipt!.events![1].args!.requestId;
					assert(requestId.toNumber() > 0);
					assert(state == 1);
				});
			});
			describe("fulfillRandomWords", function () {
				beforeEach(async () => {
					await sweepstake.enterSweepstake({ value: entranceFee });
					await network.provider.send("evm_increaseTime", [interval + 1]);
					await network.provider.request({ method: "evm_mine", params: [] });
				});
				it("picks a winner, resets, and sends money", async () => {
					const additionalEntrances = 3;
					const startingIndex = 2;
					for (
						let i = startingIndex;
						i < startingIndex + additionalEntrances;
						i++
					) {
						sweepstake = sweepstakeContract.connect(accounts[i]);
						await sweepstake.enterSweepstake({ value: entranceFee });
					}
                    
					const startingTimeStamp = await sweepstake.getLatestWinnerTimeStamp();

					// This will be more important for our staging tests...
					await new Promise<void>(async (resolve, reject) => {
						sweepstake.once("SweepStake__winnerPicked", async () => {
							console.log("WinnerPicked event fired!");

							try {
								// Now lets get the ending values...
								const recentWinner = await sweepstake.getLatestWinner();
								const state = await sweepstake.getState();
								const winnerBalance = await accounts[2].getBalance();
								const endingTimeStamp =
									await sweepstake.getLatestWinnerTimeStamp();
								await expect(sweepstake.getEntrant(0)).to.be.reverted;
								assert.equal(recentWinner.toString(), accounts[2].address);
								assert.equal(state, 0);
								assert.equal(
									winnerBalance.toString(),
									startingBalance
										.add(entranceFee.mul(additionalEntrances).add(entranceFee))
										.toString()
								);
								assert(endingTimeStamp > startingTimeStamp);
								resolve();
							} catch (e) {
								reject(e);
							}
						});

						const tx = await sweepstake.performUpkeep("0x");
						const txReceipt = await tx.wait(1);
						const startingBalance = await accounts[2].getBalance();
						await vrfCoordinatorV2Mock.fulfillRandomWords(
							txReceipt!.events![1].args!.requestId,
							sweepstake.address
						);
					});
				});
			});
	  });
