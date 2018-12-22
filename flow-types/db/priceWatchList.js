// @flow

export type typePriceWatchListFindAll = [{
  dataValues: {
    chatId: number,
    coinName: string,
    priceLow: number,
    priceHigh: number,
  }
}]

export type typePriceWatchListfindAndCountAll = {
  rows: [{
    dataValues: {
      chatId: number,
      coinName: string,
      priceLow: number,
      priceHigh: number,
    }
  }],
  count: number,
}
