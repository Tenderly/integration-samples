import {ethers, providers, Signer} from "ethers"
import axios from "axios"

export const sendTransaction = async (provider: any, sender: string, contract: any, funcName: string, ...args: any[]) => {
    if (provider instanceof providers.JsonRpcProvider) {
        const unsignedTx = await contract.populateTransaction[funcName](...args)
        const transactionParameters = [{
                to: contract.address,
                from: sender,
                data: unsignedTx.data,
                gas: ethers.utils.hexValue(3000000),
                gasPrice: ethers.utils.hexValue(1),
                value: ethers.utils.hexValue(0)
        }];
        try {
            const txHash = await provider.send('eth_sendTransaction', transactionParameters)

            return {
                txHash: txHash
            }
        } catch(err) {
            console.log(err)
        }
    } else if (provider instanceof Signer) {
        try {
            const tx = await contract[funcName](...args)

            return {
                txHash: tx.hash
            }
        } catch (err) {
            console.log(err)
        }
    }
}

export const simulateTransaction = async (senderAddr: string, contract: any, funcName: string, ...args: any[]) => {
    const unsignedTx = await contract.populateTransaction[funcName](...args)

    const apiURL = `https://api.tenderly.co/api/v1/account/me/project/project/simulate`
    const body = {
        "network_id": "1",
        "from": senderAddr,
        "to": contract.address,
        "input": unsignedTx.data,
        "gas": 21204,
        "gas_price": "0",
        "value": 0,
    	"save_if_fails": true
    }

    const headers = {
        headers: {
            'content-type': 'application/JSON',
            'X-Access-Key': 'jtB9UbWn6mvaNz2m4Y8DmuKFVjFh17U3'
      }
    }
    const resp = await axios.post(apiURL, body, headers);

    return resp
}