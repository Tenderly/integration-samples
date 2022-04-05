import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@tenderly/hardhat-tenderly";
import 'dotenv/config';

const {
    TENDERLY_FORK_ID
} = process.env

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

export default {
  solidity: "0.8.4",
  networks: {
    "tenderly-fork": {
      url: `https://rpc.tenderly.co/fork/${TENDERLY_FORK_ID}`
    },
  },
};
