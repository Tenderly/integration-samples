import axios from "axios";
import { expect } from "chai";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "hardhat";

describe("Direct usage of Tenderly fork API ", function () {
  it("Should return the new greeting once it's changed", async function () {
    // an axios instance to make requests to Tenderly, for re-use purposes
    const axiosOnTenderly = axios.create({
      baseURL: "https://api.tenderly.co/api/v1",
      headers: {
        "X-Access-Key": process.env.TENDERLY_ACCESS_KEY || "",
        "Content-Type": "application/json",
      },
    });

    const projectUrl = `account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}`;

    const forkingPoint = { network_id: "1", block_number: 14386016 };
    // create the specified fork
    const forkResponse = await axiosOnTenderly.post(`${projectUrl}/fork`, forkingPoint);
    const forkId = forkResponse.data.root_transaction.fork_id;

    // create the provider you can use throughout the rest of your test
    const provider = new JsonRpcProvider(`https://rpc.tenderly.co/fork/${forkId}`);
    console.info("Forked with fork id:", forkId)

    // - deploy smart contract
    const Greeter = await ethers.getContractFactory(
      "Greeter",
      provider.getSigner() // use the provider
    );
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();


    // - assert stuff
    expect(await greeter.greet()).to.be.equal("Hello, world!");
    await (await greeter.setGreeting("Hola, mundo!")).wait();
    expect(await greeter.greet()).to.be.equal("Hola, mundo!");


    // - sign transactions with a specific signer
    const testAddresses = Object.keys(forkResponse.data.simulation_fork.accounts);
    const anotherSigner = provider.getSigner(testAddresses[2]);

    await (
      await greeter
        .connect(anotherSigner)
        .setGreeting("Bonjour le monde!")
    ).wait();
    expect(await greeter.greet()).to.be.equal("Bonjour le monde!");

    // - remove the fork each time test succeeds
    await axiosOnTenderly.delete(`${projectUrl}/fork/${forkId}`);
  });

  it("Should act as time machine and reset the fork head", async function () {
    // an axios instance to make requests to Tenderly, for re-use purposes
    const axiosOnTenderly = axios.create({
      baseURL: "https://api.tenderly.co/api/v1",
      headers: {
        "X-Access-Key": process.env.TENDERLY_ACCESS_KEY || "",
        "Content-Type": "application/json",
      },
    });

    const projectUrl = `account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}`;

    const forkingPoint = { network_id: "1", block_number: 14386016 };
    // create the specified fork
    const forkResponse = await axiosOnTenderly.post(`${projectUrl}/fork`, forkingPoint);
    const forkId = forkResponse.data.root_transaction.fork_id;

    // create the provider you can use throughout the rest of your test
    const provider = new JsonRpcProvider(`https://rpc.tenderly.co/fork/${forkId}`);
    console.info("Forked with fork id:", forkId)

    // - deploy smart contract
    const Greeter = await ethers.getContractFactory(
      "Greeter",
      provider.getSigner() // use the provider
    );
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    const snap = await provider.send("evm_snapshot", []);

    // - assert stuff
    expect(await greeter.greet()).to.be.equal("Hello, world!");
    await (await greeter.setGreeting("Hola, mundo!")).wait();
    expect(await greeter.greet()).to.be.equal("Hola, mundo!");

    // do the snapshot
    provider.send("evm_revert", [snap]);

    expect(await greeter.greet()).to.be.equal("Hello, world!");
    // - sign transactions with a specific signer
    const testAddresses = Object.keys(forkResponse.data.simulation_fork.accounts);
    const anotherSigner = provider.getSigner(testAddresses[2]);

    await (
      await greeter
        .connect(anotherSigner)
        .setGreeting("Bonjour le monde!")
    ).wait();
    expect(await greeter.greet()).to.be.equal("Bonjour le monde!");

    // - remove the fork each time test succeeds
    await axiosOnTenderly.delete(`${projectUrl}/fork/${forkId}`);
  });

});