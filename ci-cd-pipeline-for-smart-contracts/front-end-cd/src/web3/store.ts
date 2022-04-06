import {ethers, BigNumber} from "ethers"
import {sendTransaction} from "./tenderly"

const {
    REACT_APP_ENV,
    REACT_APP_TENDERLY_FORK_ID,
} = process.env

const contractABI = require("./abi.json");
const contractAddress = "0xf35101b37928bb044ff5339bc6ff816b68bd5c43";

const tenderlyForkProvider = new ethers.providers.JsonRpcProvider(`https://rpc.tenderly.co/fork/${REACT_APP_TENDERLY_FORK_ID}`);
const metamaskSigner = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()

var provider: any = metamaskSigner
var storeContract = new ethers.Contract(contractAddress, contractABI, metamaskSigner)

export const setupEnv = () => {
    if (REACT_APP_ENV !== 'staging') {
        return
    }

    storeContract = new ethers.Contract(contractAddress, contractABI, tenderlyForkProvider)
    provider = tenderlyForkProvider
}

export const getValue = async () => {
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
    await sendTransaction(provider, ownerAddress, storeContract, "store", +value)
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
