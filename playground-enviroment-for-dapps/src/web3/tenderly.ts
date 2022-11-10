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

export const createFork = async (networkId: string, blockNumber: number, projectSlug: string, accessKey: string): Promise<string> => {
    const TENDERLY_FORK_API = `http://api.tenderly.co/api/v1/account/me/project/${projectSlug}/fork`;
    const opts = {
        headers: {
            'X-Access-Key': accessKey,
        }
    }
    const body = {
      "network_id": networkId,
      "block_number": blockNumber,
    }

    const resp = await axios.post(TENDERLY_FORK_API, body, opts);
    return resp.data.simulation_fork.id
}

export const deleteFork = async(forkId: string, projectSlug: string, accessKey: string): Promise<void> => {
    const TENDERLY_FORK_API = `http://api.tenderly.co/api/v1/account/me/project/${projectSlug}/fork/${forkId}`;
    const opts = {
        headers: {
            'X-Access-Key': accessKey,
        }
    }

    await axios.delete(TENDERLY_FORK_API, opts);
    return
}