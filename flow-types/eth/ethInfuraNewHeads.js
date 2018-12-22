// @flow

export type typeEthInfuraNewHeads = {
  "jsonrpc": string,
  "method": string,
  "params": {
    "result": {
      "difficulty": string,
      "extraData": string,
      "gasLimit": string,
      "gasUsed": string,
      "logsBloom": string,
      "miner": string,
      "nonce": string,
      "number": string,
      "parentHash": string,
      "receiptRoot": string,
      "sha3Uncles": string,
      "stateRoot": string,
      "timestamp": string,
      "transactionsRoot": string
    },
    "subscription": string
  }
}
