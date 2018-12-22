// @flow

export type typeBtcAddress = {
  hash160: string,
  address: string,
  n_tx: number,
  total_received: number,
  total_sent: number,
  final_balance: number,
  txs: [
    {
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
          addr_tag_link: string,
          addr_tag: string,
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
      result: number,
      size: number,
      block_index: number,
      time: number,
      tx_index: number,
      vin_sz: number,
      hash: string,
      vout_sz: number,
    },
  ],
}
