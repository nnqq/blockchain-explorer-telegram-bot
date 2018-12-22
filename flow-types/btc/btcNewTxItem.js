// @flow

export type typeBtcNewTxItem = {
  op: string,
  x: {
    lock_time: number,
    ver: number,
    size: number,
    inputs: [
      {
        sequence: number,
        prev_out: {
          spent: boolean,
          tx_index: number,
          type: number,
          addr: string,
          value: number,
          n: number,
          script: string,
        },
        script: string,
      }
    ],
    time: number,
    tx_index: number,
    vin_sz: number,
    hash: string,
    vout_sz: number,
    relayed_by: string,
    out: [
      {
        spent: boolean,
        tx_index: number,
        type: number,
        addr: string,
        value: number,
        n: number,
        script: string,
      }
    ]
  }
}
