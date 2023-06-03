import {ethers, BigNumber, Signer} from "ethers"
import {sendTransaction, createFork, deleteFork} from "./tenderly"

const {
    REACT_APP_ACCESS_KEY
} = process.env

const contractABI = require("./abi.json");
const contractAddress = "0xf35101b37928bb044ff5339bc6ff816b68bd5c43";

const metamaskSigner = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()

var forkId = ""
var provider: any = metamaskSigner
var storeContract = new ethers.Contract(contractAddress, contractABI, metamaskSigner)

export const setupEnv = async (playground: boolean) => {
    if (playground) {
        forkId = await createFork("3", 12167348, "project", REACT_APP_ACCESS_KEY as string)
        const tenderlyForkProvider = new ethers.providers.JsonRpcProvider(`https://rpc.tenderly.co/fork/${forkId}`);

        storeContract = new ethers.Contract(contractAddress, contractABI, tenderlyForkProvider)
        provider = tenderlyForkProvider

        return
    }
    if (!playground) {
        await deleteFork(forkId, "project", REACT_APP_ACCESS_KEY as string)

        forkId = ""
    }

    storeContract = new ethers.Contract(contractAddress, contractABI, metamaskSigner)
    provider = metamaskSigner
}

export async function getValue() {
  const value = await storeContract.retrieve();
  const bn = BigNumber.from(value)
  return bn.toString();
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        address: addressArray[0],
        status: "Store value.",
      };
      return obj;
    } catch (err) {
      console.log(err)
      return {
        address: "",
        status: "something went wrong",
      };
    }
  } else {
    return {
      address: "",
      status: "Metamask must be installed."
    };
  }
};

export const getConnectedWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "Store number",
        };
      } else {
        return {
          address: "",
          status: "Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      console.log(err)
      return {
        address: "",
        status: "something went wrong",
      };
    }
  } else {
    return {
      address: "",
      status: "Metamask must be installed"
    };
  }
};

export const store = async (ownerAddress: string, value: string) => {
  if (!window.ethereum || ownerAddress === null) {
    return {
      status:
        "Connect your Metamask wallet.",
    };
  }


  try {
    const txHash = await sendTransaction(provider, ownerAddress, storeContract, "store", +value)
    return {
      status: "success"
    };
  } catch (error) {
    console.log(error)
    return {
      status: "Something went wrong.",
    };
  }
}

export const fillEther = async (walletAddress: string): Promise<void> => {
    const transactionParameters = [
            [walletAddress],
            ethers.utils.hexValue(100)
    ];

    await provider.send('tenderly_addBalance', transactionParameters)
}
