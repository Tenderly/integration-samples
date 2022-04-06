import React from "react";
import "./Store.css"
import { useEffect, useState } from "react";
import {
  setupEnv,
  store,
  connectWallet,
  getValue,
  getConnectedWallet,
} from "./web3/store";

const Store = () => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [value, setValue] = useState(""); //default message
  const [amount, setAmount] = useState("");

  async function fetch() {
    const {address, status} = await getConnectedWallet();
    const value = await getValue();

    setWallet(address);
    setStatus(status);
    setValue(value);

    addWalletListener();
  }

  useEffect(() => {
    setupEnv()
    fetch()
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string | any[]) => {
        // @ts-ignore
        if (accounts.length > 0) {
          // @ts-ignore
          setWallet(accounts[0]);
          setStatus("Write a value you wish to store in the text-field above.");
        } else {
          setWallet("");
          setStatus("Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus("You must install Metamask.");
    }
  }

  const storeValue = () => {
    async function execute() {
      const {status} = await store(walletAddress, amount);
      setStatus(status);

      fetch()
    }

    execute()
  };

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  //the UI of our component
  return (
      <div id="container">
        <button id="walletButton" onClick={connectWalletPressed}>
          {walletAddress.length > 0 ? (
              "Connected: " +
              String(walletAddress).substring(0, 6) +
              "..." +
              String(walletAddress).substring(38)
          ) : (
              <span>Connect Wallet</span>
          )}
        </button>

        <h2 style={{ paddingTop: "50px" }}>Current Value:</h2>
        <p>{value}</p>

        <div>
          <input
              type="number"
              placeholder="Specify number to store."
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
          />

          <p id="status">{status}</p>

          <button id="publish" onClick={() => storeValue()}>
            Store
          </button>
        </div>
      </div>
  );
};

export default Store;
