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
