
import axios from "axios";
import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import ContractAbiFile from "../artifacts/contracts/FooStorage.sol/FooStorage.json";
import { anAxiosOnTenderly } from "./utils/tenderly/fork";
import { forkAndDeployFooKvStorage } from "./utils/utils";
dotenv.config();

const contractAbi = ContractAbiFile.abi;


const MANUAL_FRK_FORK = {
    VERIFIED_CONTRACT_ADDRESS: "0x0ff132c3661dcbccdfed6f810c1d1c54e71715e0",
    NETWORK_ID: "877c52e7-9ad5-4cfd-8c66-1cde8d3805f2"
}

const CODE_FORKED = {
    VERIFIED_CONTRACT_ADDRESS: "0xdd8d20aaded200b27c2b2733d465c6392d0a8357",
    NETWORK_ID: "a73ae165-9d82-4adf-8306-e97856339a77"
}

const ON_CHAIN = {
    VERIFIED_CONTRACT_ADDRESS: '0x5af444341e9cff8046a3789ff42c3ddcb737ca2b',
    NETWORK_ID: '3'
}

const { VERIFIED_CONTRACT_ADDRESS, NETWORK_ID } = ON_CHAIN;
// const { VERIFIED_CONTRACT_ADDRESS, NETWORK_ID } = CODE_FORKED;
const { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_KEY } = process.env;

const overrideExpression = (solidityAssignment: string) => {
    const assignments = solidityAssignment.split("=");
    return {
        [assignments[0].trim()]: assignments[1].trim()
    }
}

type ContractsStatesOverride = {
    networkID: string,
    stateOverrides: {
        [address: string]: {
            value: {
                [LValue: string]: string,
            }
        }
    }
}

type LValue = string; type RValue = string; type Address = string;
type StateOverrides = {
    [address: Address]: {
        value: {
            [assignment: LValue]: RValue
        }
    }
}

const s: StateOverrides = {
    "ass": {
        value: {
            "aaa": "bbb"
        }
    }
}

let t: ContractsStatesOverride = {
    networkID: "1",
    stateOverrides: {
        'a': {
            value: {

            }
        }
    }
}



const assignment = (assignment: string): [LValue, RValue] => {
    const [lvalue, rvalue] = assignment.split("=").map(a => a.trim());
    return [lvalue as LValue, rvalue as RValue];
}

const assignments = (assignment: TemplateStringsArray): string => {
    console.log(assignment);
    return ""
}
assignments`kvStore[1] = 99`;

console.log(t)

describe("State Overrides", async function () {
    before(async () => {
        // await forkAndDeployFooKvStorage();
    })

    it("SSO of mapping are applied like so", async () => {
        const axiosOptions = {
            headers: {
                'X-Access-Key': TENDERLY_ACCESS_KEY || "",
            }
        }

        const ifc = new ethers.utils.Interface(contractAbi);
        const deployedContract = new ethers.Contract(VERIFIED_CONTRACT_ADDRESS, ifc);

        // 1: prepare state overrides. 
        const stateOverridesSpecification = {
            networkID: `${NETWORK_ID}`, // a STRING: network ID as "3" or forkID if the contract is deployed on a fork (ID in Tenderly Dashboard)
            /* stateOverrides is specification of assignments, mapping Map<ContractAddress, AssignmentsSpecification>
                - The key is the contract's address (so you can override state in as many contracts as you need to so it's all set for the transaction)
                - The value is an object specifying assignment to state variables in simulation's override process.
                It's a Map<LeftHandSide, RightHandSide>.
                  To assign a value in solidity: kvStore[1] = 99. To get an equivalent override add "kvStore[1]": "99" to value.
                  Left hand side is the key ("kvStore[1]") and right hand side of the assignment is the value ("99").
                
                stateOverrides -> {
                    contractAddress -> value: {
                        contractStateVariable: primitiveValueToAssign
                    }
                }
            */
            stateOverrides: {
                [VERIFIED_CONTRACT_ADDRESS]: {
                    value: {
                        // overrides of contract state override (fields come from contract's state vars)
                        "kvStore[1]": "99"
                    }
                }
            }
        }

        console.log(JSON.stringify(stateOverridesSpecification))

        // 2: Encode state overrides
        /* Encode the state variables which are sent within transaction simulation request */
        // const `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/contracts/encode-states`
        const ENCODE_STATE_API = `https://api.tenderly.co/api/v1/account/nenad/project/test-on-fork/contracts/encode-states`;
        const encodedSatateResponse = await axios.post(ENCODE_STATE_API, stateOverridesSpecification, axiosOptions);
        const encodedStateOverrides = encodedSatateResponse.data;

        console.log("ESO", JSON.stringify(encodedStateOverrides));
        // contract function to invoke:

        const unsignedTransactionToSimulate = await deployedContract.populateTransaction.keyValueStoreGet(1);
        console.log(unsignedTransactionToSimulate)

        // 3: Create a transaction with state_objects
        const transaction = {
            ...unsignedTransactionToSimulate, // 
            input: unsignedTransactionToSimulate.data, // input is necessary
            network_id: `${NETWORK_ID}`, //network ID: a string
            "from": "0x0000000000000000000000000000000000000000", // any address
            to: VERIFIED_CONTRACT_ADDRESS,
            // use encodedStateOverrides to populate the override values
            state_objects: {
                [VERIFIED_CONTRACT_ADDRESS]: {
                    storage: encodedStateOverrides.stateOverrides[VERIFIED_CONTRACT_ADDRESS].value
                }
            },
            save: true // saves to dashboard
        }
        console.log(JSON.stringify(transaction));

        const SIMULATE_API = `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`

        const simResponse = await axios.post(SIMULATE_API, transaction, axiosOptions);

        console.log(JSON.stringify(simResponse.data.transaction))
    });
    it.skip("OV_API", async () => {
        anAxiosOnTenderly().post(
            `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/fork/${NETWORK_ID}/simulate`,
            {
                "network_id": "3",
                "block_number": null,
                "transaction_index": null,
                "from": "0x0000000000000000000000000000000000000000",
                "input": "0x866d08f60000000000000000000000000000000000000000000000000000000000000001",
                "to": "0xdd8d20aaded200b27c2b2733d465c6392d0a8357",
                "gas": 8000000,
                "gas_price": "0",
                "value": "0",
                "access_list": [],
                "generate_access_list": true,
                "save": true,
                "source": "dashboard",
                "block_header": null,
                "state_objects": {
                    "0xdd8d20aaded200b27c2b2733d465c6392d0a8357": {
                        "storage": {
                            "0xada5013122d395ba3c54772283fb069b10426056ef8ca54750cb9bb552a59e7d": "0x0000000000000000000000000000000000000000000000000000000000000063"
                        }
                    }
                },
                "root": "ce17686c-5ec8-47f3-8bb3-ae9f46c3a5bf",
                "alias": "",
                "description": ""
            },
        )
    })
});
