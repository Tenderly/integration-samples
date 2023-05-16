# Event pipeline

This is a sample project that demonstrates how to use Tenderly Web3 Actions to create a pipeline of events that can be used to event payload to the webhook.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (>= 12.0.0)
- [Tenderly CLI](https://github.com/Tenderly/tenderly-cli)
- [Tenderly Account](https://dashboard.tenderly.co/register)

## Setup

1. Prepare contract address, Event name and Webhook URL. For this example we are using DAI and Transfer event.

2. Init the Web3 Action using tenderly-cli
```bash
tenderly actions init --template webhook-event
```