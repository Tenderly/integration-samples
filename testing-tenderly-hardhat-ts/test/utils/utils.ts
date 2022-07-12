import { ethers } from "hardhat";
import { forkForTest } from "./tenderly/fork";

/** a reusable function to deploy the contract under test to the newly created fork */
export const forkAndDeployGreeter = async () => {
  const fork = await forkForTest({ network_id: "1", block_number: 14386016 });

  // deploy the contract
  const Greeter = await ethers.getContractFactory(
    "Greeter",
    fork.provider.getSigner()
  );
  const greeter = await Greeter.deploy("Hello, world!");

  await greeter.deployed();

  return { fork, greeter };
};

export const forkAndDeployFooKvStorage = async () => {
  const fork = await forkForTest({ network_id: "1" });

  // deploy the contract
  const FooStorage = await ethers.getContractFactory(
    "FooStorage",
    fork.provider.getSigner()
  );
  const fooStorage = await FooStorage.deploy();

  const deployConfirmation = await fooStorage.deployed();

  return { fork, greeter: fooStorage };
};
