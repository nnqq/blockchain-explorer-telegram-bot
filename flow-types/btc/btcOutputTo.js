// @flow

export type typeBtcOutputTo = {
  spent: boolean,
  spending_outpoints: [
    {
      tx_index: number,
      n: number,
    },
    ],
  tx_index: number,
  type: number,
  addr: string,
  value: number,
  n: number,
  script: string,
}
