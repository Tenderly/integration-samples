# Usage of Tenderly in tests

This project shows various usages of Tenderly in common testing workflows and shows how to leverage it.

To **set up dependencies** just

    cd testing-tenderly-hardhat-ts
    npm install

Before running your tests, you need to set up some **environment variables**

    cat .env.example > .env

Then add necessary configuration

    # the project slug and tenderly user (copy from the Dashboard)
    # https://dashboard.tenderly.co/{TENDERLY_USER}/{TENDERLY_PROJECT}/transactions
    TENDERLY_PROJECT=DEFINE ME
    TENDERLY_USER=DEFINE ME

    # API access key.
    # Go to https://dashboard.tenderly.co/account/authorization to create one or re-use existing
    TENDERLY_ACCESS_KEY=OBTAIN ME

Now you can run the tests. Go either:

    npx hardhat test
    npm run tests

    npx hardhat test --parallel
    npm run tests --parallel
    npx hardhat test --grep "State Overrides" #to run just this suite
