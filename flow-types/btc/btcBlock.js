// @flow

export type typeBtcBlock = {
  hash: string,
  ver: number,
  prev_block: string,
  next_block: [
    string,
    ],
  mrkl_root: string,
  time: number,
  bits: number,
  fee: number,
  nonce: number,
  n_tx: number,
  size: number,
  block_index: number,
  main_chain: boolean,
  height: number,
  received_time: number,
  relayed_by: string,
  tx: [
    {
      lock_time: number,
      ver: number,
      size: number,
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
      time: number,
      tx_index: number,
      vin_sz: number,
      hash: string,
      vout_sz: number,
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
    },
  ],
}
