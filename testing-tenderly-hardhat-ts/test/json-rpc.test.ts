import axios from "axios";
import { expect } from "chai";
import { providers } from "ethers";
import { hexlify } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { anAxiosOnTenderly, forkForTest } from "./utils/tenderly/fork";
import { forkAndDeployGreeter } from "./utils/utils";

describe("Custom JSON-RPC calls", async () => {
  it("Adds Balance to an address on a fork of a network using tenderly_setBalance", async () => {
    const { fork } = await forkAndDeployGreeter();
    const provider = fork.provider;
    // TO DOCS:
    const WALLETS = [
      "0x3a55A1e7cf75dD8374de8463530dF721816F1411",
      "0xF7dDedc66B1d482e5C38E4730B3357d32411e5Dd",
    ];

    const result = await provider.send("tenderly_addBalance", [
      WALLETS,
      ethers.utils.hexValue(128),
    ]);
    console.log("Balance added:", result);

    const newBalances = await Promise.all(
      WALLETS.map(async (wallet) => ({
        wallet,
        balance: await provider.send("eth_getBalance", [wallet, "latest"]),
      }))
    );

    console.log("New balances", newBalances);

    // END DOCS
    expect(newBalances[0].balance).to.eq("0x80");
    expect(newBalances[1].balance).to.eq("0x80");
  });

  it("Sets Balance of an address on a fork of a network using tenderly_setBalance", async () => {
    const { fork } = await forkAndDeployGreeter();
    const provider = fork.provider;
    // TO DOCS:
    const WALLETS = [
      "0x3a55A1e7cf75dD8374de8463530dF721816F1411",
      "0xF7dDedc66B1d482e5C38E4730B3357d32411e5Dd",
    ];

    const result = await provider.send("tenderly_setBalance", [
      WALLETS,
      ethers.utils.hexValue(100),
    ]);
    console.log("Balance set:", result);

    const newBalances = await Promise.all(
      WALLETS.map(async (wallet) => ({
        wallet,
        balance: await provider.send("eth_getBalance", [wallet, "latest"]),
      }))
    );

    console.log("New balances we set", newBalances);
    expect(newBalances[0].balance).to.eq("0x64");
    expect(newBalances[1].balance).to.eq("0x64");
  });

  it("Increases the time in seconds on the fork of the chain using evm_increaseTime", async () => {
    const { fork, greeter } = await forkAndDeployGreeter();
    const originalTimestamp = (
      await fork.provider.getBlock(await fork.provider.getBlockNumber())
    ).timestamp;

    await fork.provider.send("evm_increaseTime", [
      ethers.utils.hexValue(24 * 60 * 60),
    ]);

    const reciept = await (await greeter.setGreeting("HI")).wait();
    const newTimeStamp = (await fork.provider.getBlock(reciept.blockNumber))
      .timestamp;
    console.log(`Timestamp change: ${originalTimestamp} -> ${newTimeStamp}`);
    expect(newTimeStamp).gte(originalTimestamp + 24 * 60 * 60);
  });

  it("Increases the number of blocks on the fork of the chain using evm_inc_block", async () => {
    const providerOnTenderlyFork = (
      await forkForTest({ network_id: "1", block_number: 14386016 })
    ).provider;
    // const { fork, greeter } = await forkAndDeployGreeter();
    // const providerOnTenderlyFork = fork.provider;

    const originalBlockNumber = await providerOnTenderlyFork.getBlockNumber();

    await providerOnTenderlyFork.send("evm_increaseBlocks", ["0x5"]);

    const newBlockNumberHex = await providerOnTenderlyFork.send(
      "eth_blockNumber",
      []
    );
    const newBlockNumber = Number.parseInt(newBlockNumberHex, 16);

    console.log(
      `BN: ${originalBlockNumber} + 0x5 + 1xWTF ->  ${newBlockNumber}`
    );

    expect(newBlockNumber).to.eq(originalBlockNumber + 5 + 1);
  });

  it("Sets balance of an arbitrary address on a fork of a network using tenderly_addBalance", async () => {
    const {
      TENDERLY_USER,
      TENDERLY_PROJECT,
      TENDERLY_ACCESS_KEY,
      TEST_WALLET_0,
    } = process.env;
    const TENDERLY_FORK_API = `http://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/fork`;

    const opts = {
      headers: {
        "X-Access-Key": TENDERLY_ACCESS_KEY || "",
      },
    };

    const body = {
      network_id: "1",
      block_number: 14386016,
    };

    const resp = await axios.post(TENDERLY_FORK_API, body, opts);

    const forkId = resp.data.simulation_fork.id;
    const forkRPC = `https://rpc.tenderly.co/fork/${forkId}`;

    const provider = new ethers.providers.JsonRpcProvider(forkRPC);

    const params = [
      [TEST_WALLET_0],
      ethers.utils.hexValue(100), // hex encoded wei amount
    ];

    const addBalance = await provider.send("tenderly_addBalance", params);

    expect(addBalance).is.not.empty;
  });

  it("Sets storage to desired value using at particular slot using tenderly_setStorageAt", async () => {
    const { fork, greeter } = await forkAndDeployGreeter();

    const storageNrAddress = ethers.utils.solidityKeccak256(["uint256"], ["2"]);
    // const k = ethers.utils.keccak256(
    //   "0x0000000000000000000000000000000000000000000000000000000000000002"
    // );

    console.log("ST", storageNrAddress);
    await fork.provider.send("tenderly_setStorageAt", [
      // the contract address
      greeter.address,
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000000000000000000000000000055",
    ]);

    expect(await ethers.provider.getStorageAt(greeter.address, 2)).eq(
      "0x0000000000000000000000000000000000000000000000000000000000000055"
    );
  });
});