import { expect } from "chai";
import { ethers } from "hardhat";
import { Greeter } from "../typechain";
import { EthersOnTenderlyFork, forkForTest } from "./utils/tenderly/fork";

describe("Deploy before tests without isolation", function () {
  let greeter: Greeter;
  let fork: EthersOnTenderlyFork;

  before("deploy contract", async () => {
    fork = await forkForTest({ network_id: "1", block_number: 14386016 });
    // deploy the contract

    const Greeter = await ethers.getContractFactory(
      "Greeter",
      fork.provider.getSigner()
    );
    greeter = await Greeter.deploy("Hello, world!");

    await greeter.deployed();
  });

  after(async () => {
    // release the fork if it's no longer necessary
    await fork.removeFork();
  });

  it("Should return the new greeting once it's changed", async () => {
    const anotherSigner = fork.signers[2];
    await (
      await greeter.connect(anotherSigner).setGreeting("Bonjour le monde!")
    ).wait();
    expect(await greeter.greet()).to.equal("Bonjour le monde!");
  });

  it("Should see greeting set in previous test", async function () {
    // this one is passing: the mutations made in the first test are visible to this one
    expect(await greeter.greet()).to.equal("Bonjour le monde!");
  });
});
