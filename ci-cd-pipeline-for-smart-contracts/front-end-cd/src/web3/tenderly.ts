import {ethers, providers, Signer} from "ethers"

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