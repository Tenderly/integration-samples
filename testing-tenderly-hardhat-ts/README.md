# Usage of Tenderly in tests

This project shows various usages of Tenderly in common testing workflows and shows how to leverage it.

Before running your tests do
  
 cat .env.example > .env

Then add necessary configuration

    TENDERLY_PROJECT=...
    TENDERLY_USER=...
    TENDERLY_ACCESS_KEY=...
    TEST_WALLET_0=...

Now you can run the tests. Go either:

    npx hardhat test
    npm run tests

    npx hardhat test --parallel
    npm run tests --parallel
