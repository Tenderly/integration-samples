import { fail } from "assert";
import { expect } from "chai";
import { Greeter } from "../typechain";
import { forkAndDeployGreeter } from "./utils/utils";
import { EthersOnTenderlyFork } from "./utils/tenderly/fork";


describe("Deploy before tests forget execution", function () {
    let greeter: Greeter;
    let fork: EthersOnTenderlyFork;
    let checkpoint: null | string = null;

    before(("Deploy contract once"), async () => {
        const forkAndContract = await forkAndDeployGreeter()
        greeter = forkAndContract.greeter;
        fork = forkAndContract.fork;
    });

    beforeEach(async () => {
        checkpoint = await fork.provider.send("evm_snapshot", []);

    })

    afterEach(async () => {
        await fork.provider.send("evm_revert", [checkpoint]);

    })

    it("Should change the greeting message", async () => {
        await (
            await greeter
                .connect(fork.signers[2])
                .setGreeting("Bonjour le monde!")
        ).wait();

        expect(await greeter.greet()).to.equal("Bonjour le monde!");
    })

    it("Should see message specified by the last executed test", async () => {
        expect(await greeter.greet()).to.equal("Hello, world!");
    });

    it("Should fail if non-owner resets greeting", async () => {
        try {
            await greeter
                .connect(fork.signers[2])
                .resetGreeting()
            fail("Should have been a failed transaction")
            // fixme: this should be a different message (specified in SOL)
        } catch (e) {
            console.error("OK, went wrong");
        }
    })
});
