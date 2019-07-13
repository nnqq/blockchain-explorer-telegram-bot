// @flow
import type {
  typeAddrWatchListFindOne,
  typeAddrWatchListFindAll,
  typeAddrWatchListFindAndCountAll,
} from '../flow-types/db/addrWatchList';
import type {
  typeSubscribeActualPriceFindOne,
  typeSubscribeActualPriceFindAll,
} from '../flow-types/db/subscribeActualPrice';
import type { typePriceWatchListfindAndCountAll } from '../flow-types/db/priceWatchList';
import type { typeBtcTxItem } from '../flow-types/btc/btcTxItem';
import type { typeEthInfuraNewHeads } from '../flow-types/eth/ethInfuraNewHeads';
import type { typeEthBlock } from '../flow-types/eth/ethBlock';

const Sequelize = require('sequelize');
const logger = require('pino')();
const v = require('./validate');
const { template, xs } = require('./template');

const { Op } = Sequelize;

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,

  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const AddrWatchList = sequelize.define('AddrWatchList', {
  chatId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
  coinName: {
    type: Sequelize.STRING,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      addrType(value) {
        if (v.isBtcAddress(value)) {
          this.setDataValue('coinName', 'bitcoin');
        } else if (v.isEthAddress(value)) {
          this.setDataValue('coinName', 'ethereum');
        } else {
          throw new Error('Enter a Bitcoin or Ethereum address or /help');
        }
      },
    },
  },
}, {
  indexes: [{
    unique: true,
    fields: ['chatId', 'address'],
  }],
});

AddrWatchList.sync();

const PriceWatchList = sequelize.define('PriceWatchList', {
  chatId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
  coinName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  priceLow: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
  priceHigh: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
}, {
  indexes: [{
    unique: true,
    fields: ['chatId', 'coinName'],
  }],
});

PriceWatchList.sync();

const SubscribeActualPrice = sequelize.define('SubscribeActualPrice', {
  chatId: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
  hoursInterval: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
});

SubscribeActualPrice.sync();

function btcSub(wsBtc: Object, address: string) {
  const addrSub = JSON.stringify({
    op: 'addr_sub',
    addr: address,
  });
  wsBtc.send(addrSub);
}

function btcUnsub(wsBtc: Object, address: string) {
  const addrUnsub = JSON.stringify({
    op: 'addr_unsub',
    addr: address,
  });
  wsBtc.send(addrUnsub);
}

async function checkUserWatchersLimit(chat: number) {
  const userRows: number = await AddrWatchList.count({
    where: {
      chatId: chat,
    },
  });
  if (userRows >= 50) {
    throw new Error('Error. You can set maximum 50 '
      + 'addresses to Watch List. Please delete some of them /help');
  }
}

class db {
  static async btcUpdateSubs(wsBtc: Object) {
    const btcRows: typeAddrWatchListFindAll = await AddrWatchList.findAll({
      where: {
        coinName: 'bitcoin',
      },
    });

    btcRows.forEach((row) => {
      const { address } = row.dataValues;
      btcSub(wsBtc, address);
    });
  }

  static async getWatchListMsg(chat: number): Promise<string> {
    const watchList: typeAddrWatchListFindAndCountAll = await AddrWatchList.findAndCountAll({
      where: {
        chatId: chat,
      },
    });

    let addrsList: string = '';
    watchList.rows.forEach((row, i) => {
      const { coinName, address } = row.dataValues;
      addrsList += `\n${i + 1}) ${v.capitalize(coinName)} /${address}`;
    });

    return xs`
      You are watching ${watchList.count}/50 adresses:
      ${addrsList}
      
      ➕ Add: Send a Bitcoin or Ethereum address to add it to Watch List. You will get notification for every new transaction with this address.
      ➖ Delete: To delete an item, click on this address, or click on button below to delete all.
      
      /help - To the Main menu
      `;
  }

  static async btcSubAndCreate(wsBtc: Object, chat: number, addr: string) {
    await checkUserWatchersLimit(chat);
    btcSub(wsBtc, addr);
    await AddrWatchList.create({
      chatId: chat,
      address: addr,
    });
  }

  static async btcUnsubAndDelete(wsBtc: Object, chat: number, addr: string) {
    const [rowToDelete, otherUsersWatchSameAddr]: [typeAddrWatchListFindOne,
      number] = await Promise.all([
        AddrWatchList.findOne({
          where: {
            chatId: chat,
            coinName: 'bitcoin',
            address: addr,
          },
        }),
        AddrWatchList.count({
          where: {
            address: addr,
            coinName: 'bitcoin',
          },
        }),
      ]);
    if (!rowToDelete) {
      throw new Error('You are not Watching this address to delete them /help');
    }
    if (otherUsersWatchSameAddr === 1) btcUnsub(wsBtc, addr);
    await rowToDelete.destroy();
  }

  static async ethCreate(chat: number, addr: string) {
    await checkUserWatchersLimit(chat);
    await AddrWatchList.create({
      chatId: chat,
      address: addr.toLowerCase(),
    });
  }

  static async ethDelete(chat: number, addr: string) {
    const rowToDelete: typeAddrWatchListFindOne = await AddrWatchList.findOne({
      where: {
        chatId: chat,
        address: addr,
      },
    });
    if (!rowToDelete) {
      throw new Error('You are not Watching this address to delete them /help');
    }
    await rowToDelete.destroy();
  }

  static async unsubAndDeleteAll(wsBtc: Object, chat: number) {
    const rowsToDelete: typeAddrWatchListFindAll = await AddrWatchList.findAll({
      where: {
        chatId: chat,
      },
    });

    for (const row of rowsToDelete) {
      const { address, coinName } = row.dataValues;
      const otherUsersWatchSameAddr: number = await AddrWatchList.count({
        where: {
          address,
          coinName: 'bitcoin',
        },
      });
      if (coinName === 'bitcoin' && otherUsersWatchSameAddr === 1) {
        btcUnsub(wsBtc, address);
      }
    }

    await AddrWatchList.destroy({
      where: {
        chatId: chat,
      },
    });
  }

  static async getPriceWatchMsg(chat: number): Promise<string> {
    const userRows: typePriceWatchListfindAndCountAll = await PriceWatchList.findAndCountAll({
      where: {
        chatId: chat,
      },
    });

    let watchList: string = '';
    userRows.rows.forEach((row, i) => {
      const { coinName, priceLow, priceHigh } = row.dataValues;
      watchList += `\n${i + 1}) ${v.capitalize(coinName)} ${priceLow}-${priceHigh} USD`;
    });

    return xs`
      Your price Watch List (${userRows.count}/2):
      ${watchList}
      
      ➕ Add: Enter a coin (btc/eth) and range price (usd) to get notification when price goes out this range
      e.g. btc 4000 10000
      ➖ Delete: To delete an item, click on button below.
      
      /help - To the Main menu
      `;
  }

  static async createPriceWatcher(chat: number, coin: string, priceLo: number, priceHi: number) {
    try {
      await PriceWatchList.create({
        chatId: chat,
        coinName: coin,
        priceLow: priceLo,
        priceHigh: priceHi,
      });
    } catch (e) {
      throw new Error('You can\'t create two price Watchers to one coin. '
        + 'If you want to change price range values, you should '
        + 'delete Watcher and add it again /help');
    }
  }

  static async deletePriceWatcher(chat: number, coin: string) {
    await PriceWatchList.destroy({
      where: {
        chatId: chat,
        coinName: coin,
      },
    });
  }

  static getUserPriceSubs(chat: number): Promise<typeSubscribeActualPriceFindOne> {
    return SubscribeActualPrice.findOne({
      where: {
        chatId: chat,
      },
    });
  }

  static async subsActualPrice(chat: number, interval: number) {
    await SubscribeActualPrice.create({
      chatId: chat,
      hoursInterval: interval,
    });
  }

  static async unsubActualPrice(chat: number) {
    await SubscribeActualPrice.destroy({
      where: {
        chatId: chat,
      },
    });
  }

  static async sendNotifsActualPrice(bot: Object, interval: number, priceBtcUsd: number,
    priceEthUsd: number) {
    try {
      const priceSubsRows: typeSubscribeActualPriceFindAll = await SubscribeActualPrice.findAll({
        where: {
          hoursInterval: interval,
        },
      });

      const notifMsg: string = xs`
      ${template.watchListNotifHeader('subscribe_price')}
      
      ${template.coinPrice(priceBtcUsd, priceEthUsd)}
      `;

      priceSubsRows.forEach((row) => {
        bot.telegram.sendMessage(row.dataValues.chatId, v.toTelegramSafeLength(notifMsg))
          .catch((e) => {
            if (e.message !== '403: Forbidden: bot was blocked by the user') logger.info(e);
          });
      });
    } catch (e) {
      logger.info(e);
    }
  }

  static async btcSendNotifsNewTx(bot: Object, dataTx: typeBtcTxItem, priceBtcUsd: number) {
    const addrsFromTx: Array<string> = [];
    dataTx.inputs.forEach((input) => {
      if (input.prev_out) addrsFromTx.push(input.prev_out.addr);
    });
    dataTx.out.forEach((output) => {
      addrsFromTx.push(output.addr);
    });

    const btcRows: typeAddrWatchListFindAll = await AddrWatchList.findAll({
      where: {
        coinName: 'bitcoin',
        address: {
          [Op.or]: addrsFromTx,
        },
      },
    });

    const notifMsg: string = xs`
      ${template.watchListNotifHeader('watch_address', true)}
      
      ${template.btcTxItem(dataTx, priceBtcUsd)}
      `;

    btcRows.forEach((row) => {
      bot.telegram.sendMessage(row.dataValues.chatId, v.toTelegramSafeLength(notifMsg))
        .catch((e) => {
          if (e.message !== '403: Forbidden: bot was blocked by the user') logger.info(e);
        });
    });
  }

  static async ethSendNotifsNewTx(bot: Object, eth: Object, newBlock: typeEthInfuraNewHeads,
    priceEthUsd: number) {
    setTimeout(async () => {
      const [dataBlock, ethRows]: [typeEthBlock, typeAddrWatchListFindAll] = await Promise.all([
        eth.proxy.eth_getBlockByNumber(newBlock.params.result.number),
        AddrWatchList.findAll({
          where: {
            coinName: 'ethereum',
          },
        }),
      ]);

      if (!dataBlock.result) return;

      dataBlock.result.transactions.forEach((tx) => {
        ethRows.forEach((row) => {
          const { address, chatId } = row.dataValues;
          if (address === tx.from || address === tx.to) {
            const notifMsg = xs`
            ${template.watchListNotifHeader('watch_address', true)}
            
            ${template.ethTxWatchList(tx, priceEthUsd)}
            `;
            bot.telegram.sendMessage(chatId, v.toTelegramSafeLength(notifMsg))
              .catch((e) => {
                if (e.message !== '403: Forbidden: bot was blocked by the user') logger.info(e);
              });
          }
        });
      });
    }, 30000);
  }
}

module.exports = { db, PriceWatchList };
