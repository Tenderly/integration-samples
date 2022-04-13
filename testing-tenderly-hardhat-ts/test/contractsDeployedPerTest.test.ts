import { expect } from "chai";
import { forkAndDeployGreeter } from "./utils/utils";


describe("Fresh contract per test", function () {
  it("Should return the new greeting once it's changed", async function () {
    // fork and deploy greeter to the fork
    const { fork, greeter } = await forkAndDeployGreeter();
    expect(await greeter.greet()).to.be.equal("Hello, world!");

    await (await greeter.setGreeting("Bonjour le mond!")).wait();
    expect(await greeter.greet()).to.be.equal("Bonjour le mond!");

    // remove the fork each time test succeeds
    fork.removeFork();
  });

  it("Should also return the new greeting once it's changed", async function () {
    const { fork, greeter } = await forkAndDeployGreeter();
    const secondGreeter = fork.signers[1];

    await (
      await greeter
        .connect(secondGreeter)
        .setGreeting("Hola, mundo!")
    ).wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
    await fork.removeFork();
  });

});