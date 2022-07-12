import axios from "axios";
import { ethers } from "hardhat";
import { forkAndDeployGreeter } from "./utils/utils";
import { anAxiosOnTenderly, forkForTest } from "./utils/tenderly/fork";
import * as dotenv from "dotenv";
import { expect } from "chai";
dotenv.config();

describe("Simulation API", async () => {
  it("should impersonate any address", async () => {
    const SIMULATE_API = `https://api.tenderly.co/api/v1/account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}/simulate`;

    const DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const ARBITRARY_SENDER = "0x0000000000000000000000000000000000000000";
    const TX_DATA =
      "0x095ea7b3000000000000000000000000f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1000000000000000000000000000000000000000000000000000000000000012b";
    const transaction = {
      network_id: "1",
      from: ARBITRARY_SENDER,
      input: TX_DATA,
      to: DAI_ADDRESS,
      gas: 8000000,
      gas_price: "0",
      value: "0",
      access_list: [],
      generate_access_list: true,
      save: true,
      block_header: null,
    };

    const opts = {
      headers: {
        "X-Access-Key": process.env.TENDERLY_ACCESS_KEY || "",
      },
    };
    const resp = await axios.post(SIMULATE_API, transaction, opts);
  });

  it("Adds Balance", async () => {
    const { fork, greeter } = await forkAndDeployGreeter();
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

  it("Sets Balance", async () => {
    const { fork, greeter } = await forkAndDeployGreeter();
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

    console.log("New balances", newBalances);
    expect(newBalances[0]).to.eq("0x64");
    expect(newBalances[1]).to.eq("0x64");
  });

  it("evm-inc-time increases the time on chain", async () => {
    //Request URL: https://api.tenderly.co/api/v1/account/nenad/project/test-on-fork/simulate
    const { TENDERLY_USER, TENDERLY_PROJECT } = process.env;

    const tAxios = anAxiosOnTenderly();
    const projectBase = `account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}`;
    const resp = await tAxios.get(`${projectBase}/simulations`);

    const { fork, greeter } = await forkAndDeployGreeter();
    await fork.provider.send("evm_increaseTime", [
      ethers.utils.hexValue(24 * 60 * 60),
    ]);

    const reciept = await await (await greeter.setGreeting("HI")).wait();

    console.log(
      reciept.blockNumber,
      await fork.provider.getBlock(reciept.blockNumber)
    );
  });

  it("fork and add balance to account", async () => {
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

  it("one-off simulation", async () => {
    const { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_KEY } =
      process.env;
    const SIMULATE_URL = `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`;

    // set up your access-key, if you don't have one or you want to generate new one follow next link
    // https://dashboard.tenderly.co/account/authorization
    const opts = {
      headers: {
        "X-Access-Key": TENDERLY_ACCESS_KEY as string,
      },
    };

    const body = {
      network_id: "1",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x6b175474e89094c44da98b954eedeac495271d0f",
      input:
        "0x095ea7b3000000000000000000000000f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1000000000000000000000000000000000000000000000000000000000000012b",
      gas: 8000000,
      gas_price: "0",
      value: 0,
      // tenderly specific
      save_if_fails: true,
      save: false,
    };

    const resp = await axios.post(SIMULATE_URL, body, opts);
  });
});
