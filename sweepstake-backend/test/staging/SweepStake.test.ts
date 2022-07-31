import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { network, ethers, getNamedAccounts } from "hardhat";
import { developmentChains } from "../../hardhat-helper";
import { Sweepstake } from "../../typechain-types";

developmentChains.includes(network.name)
	? describe.skip
	: describe("Raffle Staging Tests", function () {
			let raffle: Sweepstake;
			let raffleEntranceFee: BigNumber;
			let deployer: string;
			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer;
				raffle = await ethers.getContract("Sweepstake", deployer);
				raffleEntranceFee = await raffle.getEntranceFee();
			});

			describe("fulfillRandomWords", function () {
				it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
					// enter the raffle
					console.log("Setting up test...");
					const startingTimeStamp = await raffle.getLatestWinnerTimeStamp();
					const accounts = await ethers.getSigners();

					console.log("Setting up Listener...");
					await new Promise<void>(async (resolve, reject) => {
						// setup listener before we enter the raffle
						// Just in case the blockchain moves REALLY fast
						raffle.once("SweepStake__winnerPicked", async () => {
							console.log("WinnerPicked event fired!");
							try {
								// add our asserts here
								const recentWinner = await raffle.getLatestWinner();
								const raffleState = await raffle.getState();
								const winnerEndingBalance = await accounts[0].getBalance();
								const endingTimeStamp = await raffle.getLatestWinnerTimeStamp();

								await expect(raffle.getEntrant(0)).to.be.reverted;
								assert.equal(recentWinner.toString(), accounts[0].address);
								assert.equal(raffleState, 0);
								assert.equal(
									winnerEndingBalance.toString(),
									winnerStartingBalance.add(raffleEntranceFee).toString()
								);
								assert(endingTimeStamp > startingTimeStamp);
								resolve();
							} catch (error) {
								console.log(error);
								reject(error);
							}
						});
						// Then entering the raffle
						console.log("Entering Raffle...");
						const tx = await raffle.enterSweepstake({
							value: raffleEntranceFee
						});
						await tx.wait(1);
						console.log("Ok, time to wait...");
						const winnerStartingBalance = await accounts[0].getBalance();

						// and this code WONT complete until our listener has finished listening!
					});
				});
			});
	  });
