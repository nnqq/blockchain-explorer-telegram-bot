// @flow

export type typeBtcTxItem = {
  ver: number,
  inputs: [
    {
      sequence: number,
      witness: string,
      prev_out: {
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
      },
      script: string,
    },
  ],
  weight: number,
  block_height: number,
  relayed_by: string,
  out: [
    {
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
    },
  ],
  lock_time: number,
  size: number,
  double_spend: boolean,
  block_index: number,
  time: number,
  tx_index: number,
  vin_sz: number,
  hash: string,
  vout_sz: number,
}
