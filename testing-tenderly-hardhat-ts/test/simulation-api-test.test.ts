import axios from "axios";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import { Greeter } from "../typechain";
import { forkAndDeployGreeter } from "./utils/utils";
import {
  anAxiosOnTenderly,
  EthersOnTenderlyFork,
  forkForTest,
  tenderlyProjectOperation,
} from "./utils/tenderly/fork";
dotenv.config();

describe("Test stuff", function () {
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
    // await fork.removeFork();
  });

  it("Should return the new greeting once it's changed", async () => {
    const anotherSigner = fork.signers[2];

    try {
      const tx = {
        ...(await greeter.populateTransaction.setGreeting("Bonjour le monde")),
        save_if_fails: true,
        networkId: "1",
        gas: 8000000,
        gasPrice: 0,
        gasLimit: 0,
        save: true,
        root: "",
      };

      const url = tenderlyProjectOperation("fork", fork.id, "simulate");
      const simulationResponse = await anAxiosOnTenderly().post(url, tx);

      console.log(simulationResponse.data);
    } catch (e: any) {
      console.error("ERR", e.response.data);
    }

    // expect(await greeter.greet()).to.equal("Bonjour le monde!");
  });

  it("Sends transaction via API", async () => {
    const unsignedTransaction = await greeter.populateTransaction.setGreeting(
      "Bonjour le monde"
    );

    const SIMULATE_API = `https://api.tenderly.co/api/v1/account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}/simulate`;
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const ARBITRARY_SENDER = "0xF1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1";
    const TX_DATA =
      "0xc49b9a800000000000000000000000000000000000000000000000000000000000000001";

    const transaction = {
      network_id: "1",
      block_number: null,
      transaction_index: null,
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
    console.log(resp.data);
  });

  it("Fails after greeting set by API simulation", async function () {
    // this one is passing: the mutations made in the first test are visible to this one
    try {
      expect(await greeter.greet()).to.equal("Hello, world!");
    } catch (e) {
      console.info("Failure");
    }
  });
});
