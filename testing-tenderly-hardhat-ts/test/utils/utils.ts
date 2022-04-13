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

    const deployConfirmation = await greeter.deployed();

    return { fork, greeter }
}