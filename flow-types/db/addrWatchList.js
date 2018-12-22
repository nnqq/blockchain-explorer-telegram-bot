// @flow

export type typeAddrWatchListFindOne = {
  dataValues: {
    chatId: number,
    coinName: string,
    address: string,
  },
  destroy: Function,
}

export type typeAddrWatchListFindAll = [{
  dataValues: {
    chatId: number,
    coinName: string,
    address: string,
  }
}]

export type typeAddrWatchListFindAndCountAll = {
  rows: [{
    dataValues: {
      chatId: number,
      coinName: string,
      address: string,
    }
  }],
  count: number,
}
