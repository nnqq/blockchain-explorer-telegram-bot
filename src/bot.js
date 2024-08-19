// @flow
import type { typePrice } from '../flow-types/bot/typePrice';
import type { typeEthStatsPrice } from '../flow-types/eth/ethStatsPrice';
import type { typeBtcAddress } from '../flow-types/btc/btcAddress';
import type { typeBtcTxItem } from '../flow-types/btc/btcTxItem';
import type { typeBtcBlock } from '../flow-types/btc/btcBlock';
import type { typeEthAddressDataBalance } from '../flow-types/eth/ethAddress-dataBalance';
import type { typeEthAddressDataTxList } from '../flow-types/eth/ethAddress-dataTxList';
import type { typeEthTxItem } from '../flow-types/eth/ethTxItem';
import type { typeEthBlock } from '../flow-types/eth/ethBlock';
import type { typePriceWatchListFindAll } from '../flow-types/db/priceWatchList';
import type { typeWatchPriceObj } from '../flow-types/validate/watchPriceObj';
import type { typeSubscribeActualPriceFindOne } from '../flow-types/db/subscribeActualPrice';
import type { typeBtcNewTxItem } from '../flow-types/btc/btcNewTxItem';

const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const btc = require('blockchain.info');
const eth = require('etherscan-api').init(process.env.ETHERSCAN_TOKEN);
const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');
const logger = require('pino')();
const { stats } = require('./stats');
const v = require('./validate');
const { template, xs } = require('./template');
const { db, PriceWatchList } = require('./db');
const healthz = require('./healthz');

healthz();

let startMsg: string = xs`
  🤖 Welcome to the Bitcoin and Ethereum blockchain bot. Select an option:
  
  🗳 Blockchain explorer
  /blockchain - Blockchain explorer search.
  
  👁 Create Watch List
  /watch_address - Get notification for every new transaction of entered addresses.
  /watch_price - Get notification when price goes from entered range.
  
  ℹ️ About page
  /about - Author, Github, Donate info.
  `;

const wsOptions = {
  WebSocket: WS,
};
const wsBtc = new ReconnectingWebSocket('wss://ws.blockchain.info/inv', [], wsOptions);
const wsEth = new ReconnectingWebSocket(
  `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_TOKEN || ''}`, [], wsOptions,
);

const stage = new Stage();
stage.command('help', ctx => ctx.reply(startMsg));
stage.command('blockchain', ctx => ctx.scene.enter('blockchainMenu'));
stage.command('watch_address', ctx => ctx.scene.enter('watchAddrMenu'));
stage.command('watch_price', ctx => ctx.scene.enter('watchPriceMenu'));
stage.command('subscribe_price', ctx => ctx.scene.enter('subsPriceMenu'));
stage.command('about', ctx => ctx.scene.enter('aboutMenu'));

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: {
    webhookReply: false,
  },
});
bot.telegram.setWebhook(`${process.env.BOT_WEBHOOK_URL || ''}/bot${process.env.BOT_TOKEN || ''}`);
bot.startWebhook(`/bot${process.env.BOT_TOKEN || ''}`, null, process.env.PORT || 3000);
bot.use((ctx, next) => {
  stats.counter(ctx, bot);
  next();
});
bot.use(session());
bot.use(stage.middleware());
bot.start(ctx => ctx.reply(startMsg, Markup
  .keyboard([
    ['/help'],
  ])
  .resize()
  .extra()));

const price: typePrice = {
  btcUsd: 0,
  ethUsd: 0,
};

async function updatePriceSendNotif() {
  try {
    const [dataPrice, priceWatchersData]: [typeEthStatsPrice,
      typePriceWatchListFindAll] = await Promise.all([
        eth.stats.ethprice(),
        PriceWatchList.findAll(),
      ]);

    const btcPrice: number = +dataPrice.result.ethusd / +dataPrice.result.ethbtc;
    price.btcUsd = +btcPrice.toFixed(2);
    price.ethUsd = +dataPrice.result.ethusd;
    startMsg = xs`
      🤖 Welcome to the Bitcoin and Ethereum blockchain bot. Select an option:
      
      🗳 Blockchain explorer
      /blockchain - Blockchain explorer search.
      
      👁 Create Watch List
      /watch_address - Get notification for every new transaction of entered addresses.
      /watch_price - Get notification when price goes from entered range.
      
      💰 Price
      /subscribe_price - Get notification with actual price every 1, 8 or 24 hours.
      ${template.coinPrice(price.btcUsd, price.ethUsd)}
      
      ℹ️ About page
      /about - Author, Github, Donate info.
      `;

    priceWatchersData.forEach((row) => {
      const {
        chatId, coinName, priceLow, priceHigh,
      } = row.dataValues;

      const isBtcAlert: boolean = coinName === 'bitcoin'
        && v.isPriceOutOfRange(price.btcUsd, priceLow, priceHigh);

      const isEthAlert: boolean = coinName === 'ethereum'
        && v.isPriceOutOfRange(price.ethUsd, priceLow, priceHigh);

      if (isBtcAlert) {
        const notifMsg: string = xs`
          ${template.watchListNotifHeader('watch_price')}
          
          ${template.watchPriceNotifBody(coinName, price.btcUsd, priceLow, priceHigh)}
          `;

        bot.telegram.sendMessage(chatId, v.toTelegramSafeLength(notifMsg))
          .catch((e) => {
            if (e.message !== '403: Forbidden: bot was blocked by the user') logger.info(e);
          });
      } else if (isEthAlert) {
        const notifMsg: string = xs`
          ${template.watchListNotifHeader('watch_price')}
          
          ${template.watchPriceNotifBody(coinName, price.ethUsd, priceLow, priceHigh)}
          `;

        bot.telegram.sendMessage(chatId, v.toTelegramSafeLength(notifMsg))
          .catch((e) => {
            if (e.message !== '403: Forbidden: bot was blocked by the user') logger.info(e);
          });
      }
    });
  } catch (e) {
    logger.info(e);
  }
}

updatePriceSendNotif();
setInterval(async () => {
  await updatePriceSendNotif();
}, 6e5);

setInterval(async () => {
  await db.sendNotifsActualPrice(bot, 1, price.btcUsd, price.ethUsd);
}, 36e5);

setInterval(async () => {
  await db.sendNotifsActualPrice(bot, 8, price.btcUsd, price.ethUsd);
}, 288e5);

setInterval(async () => {
  await db.sendNotifsActualPrice(bot, 24, price.btcUsd, price.ethUsd);
}, 864e5);

const blockchainErrMsg: string = 'Error. Blockchain api is not available or you entered '
  + 'not valid Address (BTC/ETH), TX hash (BTC/ETH), Block hash (BTC), '
  + 'Block height (ETH). Please try again or /help';

const blockchainMenu = new Scene('blockchainMenu');
stage.register(blockchainMenu);

blockchainMenu.enter(ctx => ctx.reply('Enter a BTC/ETH Address, '
  + 'BTC/ETH Transaction hash, BTC Block hash or ETH Block height'));

blockchainMenu.on('text', async (ctx) => {
  let message: string = ctx.message.text.trim();

  if (message.startsWith('/')) {
    message = message.slice(1);
  }

  try {
    if (v.isBtcAddress(message)) {
      const dataAddr: typeBtcAddress = await btc.blockexplorer.getAddress(message, { limit: 5 });
      const replyMsg: string = template.btcAddress(dataAddr, message, price.btcUsd);

      await v.splitAndReply(ctx, replyMsg);
    } else if (v.isBtcTxOrBlock(message)) {
      try {
        const dataTx: typeBtcTxItem = await btc.blockexplorer.getTx(message);
        const replyMsg: string = template.btcTxItem(dataTx, price.btcUsd);

        await v.splitAndReply(ctx, replyMsg);
      } catch (noTx) {
        const dataBlock: typeBtcBlock = await btc.blockexplorer.getBlock(message);
        const replyMsg: string = template.btcBlock(dataBlock);

        await v.splitAndReply(ctx, replyMsg);
      }
    } else if (v.isEthAddress(message)) {
      const [dataBalance, dataTxList]: [typeEthAddressDataBalance,
        typeEthAddressDataTxList] = await Promise.all([
          eth.account.balance(message),
          eth.account.txlist(message, 0, 'latest', 1, 5, 'desc'),
        ]);
      const replyMsg: string = template.ethAddress(dataBalance, dataTxList, message, price.ethUsd);

      await v.splitAndReply(ctx, replyMsg);
    } else if (v.isEthTx(message)) {
      const dataTx: typeEthTxItem = await eth.proxy.eth_getTransactionByHash(message);
      const replyMsg: string = template.ethTxItem(dataTx, price.ethUsd);

      await v.splitAndReply(ctx, replyMsg);
    } else if (Number.isInteger(+message)) {
      const blockHex: string = `0x${(+message).toString(16)}`;
      const dataBlock: typeEthBlock = await eth.proxy.eth_getBlockByNumber(blockHex);
      const replyMsg: string = template.ethBlock(dataBlock);

      await v.splitAndReply(ctx, replyMsg);
    } else {
      await ctx.reply('It seems you enter not BTC/ETH Address, BTC/ETH TX hash, '
        + 'BTC Block hash, ETH Block height. Please try again or /help');
    }
  } catch (e) {
    await ctx.reply(blockchainErrMsg);
  }
});

const watchAddrMenu = new Scene('watchAddrMenu');
stage.register(watchAddrMenu);

watchAddrMenu.enter(async (ctx) => {
  const chatId: number = ctx.chat.id;

  try {
    const watchList: string = await db.getWatchListMsg(chatId);
    await ctx.reply(watchList, Extra.markup(m => m.inlineKeyboard([
      m.callbackButton('🚫 Delete all Addresses', 'delete all addresses'),
    ])));
  } catch (e) {
    await ctx.reply(e.message);
  }
});

watchAddrMenu.action('delete all addresses', async (ctx) => {
  const chatId: number = ctx.chat.id;

  try {
    await db.unsubAndDeleteAll(wsBtc, chatId);

    await ctx.reply('✅ Watch List now empty');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

watchAddrMenu.hears(/\/./, async (ctx) => {
  const chatId: number = ctx.chat.id;
  const message: string = ctx.message.text.trim().slice(1);

  const isBtcAddr: boolean = v.isBtcAddress(message);
  const isEthAddr: boolean = v.isEthAddress(message);

  if (!isBtcAddr && !isEthAddr) {
    await ctx.reply('You entered not BTC or ETH address '
      + 'to delete from Watch List. Try again or /help');
    return;
  }

  try {
    if (isBtcAddr) {
      await db.btcUnsubAndDelete(wsBtc, chatId, message);
    } else if (isEthAddr) {
      await db.ethDelete(chatId, message);
    }

    await ctx.reply(`✅ Address ${message} deleted from Watch List`);
  } catch (e) {
    await ctx.reply(e.message);
  }
});

watchAddrMenu.on('text', async (ctx) => {
  const chatId: number = ctx.chat.id;
  const message: string = ctx.message.text.trim();

  const isBtcAddr: boolean = v.isBtcAddress(message);
  const isEthAddr: boolean = v.isEthAddress(message);

  if (!isBtcAddr && !isEthAddr) {
    await ctx.reply('To add an Address Watch List item enter a Bitcoin '
      + 'or Ethereum address or /help');
    return;
  }

  try {
    if (isBtcAddr) {
      await db.btcSubAndCreate(wsBtc, chatId, message);
    } else if (isEthAddr) {
      await db.ethCreate(chatId, message);
    }

    await ctx.reply(`✅ Address ${message} added to Watch List`);
  } catch (e) {
    await ctx.reply(e.message);
  }
});

const watchPriceMenu = new Scene('watchPriceMenu');
stage.register(watchPriceMenu);

watchPriceMenu.enter(async (ctx) => {
  const chat: number = ctx.chat.id;

  const watchPriceList: string = await db.getPriceWatchMsg(chat);
  await ctx.reply(watchPriceList, Extra.markup(m => m.inlineKeyboard([
    m.callbackButton('🚫 Delete BTC', 'delete bitcoin'),
    m.callbackButton('🚫 Delete ETH', 'delete ethereum'),
  ])));
});

watchPriceMenu.action('delete bitcoin', async (ctx) => {
  const chat: number = ctx.chat.id;

  try {
    await db.deletePriceWatcher(chat, 'bitcoin');
    await ctx.reply('✅ Bitcoin price watcher deleted');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

watchPriceMenu.action('delete ethereum', async (ctx) => {
  const chat: number = ctx.chat.id;

  try {
    await db.deletePriceWatcher(chat, 'ethereum');
    await ctx.reply('✅ Ethereum price watcher deleted');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

watchPriceMenu.on('text', async (ctx) => {
  const chat: number = ctx.chat.id;
  const message: string = ctx.message.text.trim();
  const validMsg: typeWatchPriceObj | false = v.validateWatchPriceMsg(message);

  if (validMsg) {
    try {
      await db.createPriceWatcher(chat, validMsg.coinName, validMsg.priceLow, validMsg.priceHigh);
      await ctx.reply(`✅ You will get notification if ${v.capitalize(validMsg.coinName)} price`
        + ` leaves range ${validMsg.priceLow}-${validMsg.priceHigh} USD`);
    } catch (e) {
      await ctx.reply(e.message);
    }
  } else {
    await ctx.reply('Error. You entered incorrect '
      + 'message format (valid e.g. eth 500 850) /help');
  }
});

const aboutMenu = new Scene('aboutMenu');
stage.register(aboutMenu);

aboutMenu.enter((ctx) => {
  ctx.reply(xs`
    ⚖️ Bot is Open Source project: https://github.com/nnqq/blockchain-explorer-telegram-bot
    `);
});

aboutMenu.command('BTC', ctx => ctx.reply('1NMcEUqi5aaHJgjeA4YvQuSpCQFHpMwFvh'));
aboutMenu.command('ETH', ctx => ctx.reply('0x98C3d9261CC817D47f262F02852483E8e3BAc5dc'));

const subsPriceMenu = new Scene('subsPriceMenu');
stage.register(subsPriceMenu);

subsPriceMenu.enter(async (ctx) => {
  const chat: number = ctx.chat.id;
  try {
    const getUserPriceSubs: typeSubscribeActualPriceFindOne = await db.getUserPriceSubs(chat);
    if (getUserPriceSubs) {
      ctx.reply('Now you subscribed to get actual price every '
        + `${getUserPriceSubs.dataValues.hoursInterval} hours. If you want to change interval, `
        + 'unsubscribe and sub again',
      Extra.markup(m => m.inlineKeyboard([
        m.callbackButton('🚫 Unsubscribe', 'unsubscribe'),
      ])));
    } else {
      ctx.reply('Get actual price notification every ... ?',
        Extra.markup(m => m.inlineKeyboard([
          m.callbackButton('1 hour', '1 hour'),
          m.callbackButton('8 hours', '8 hours'),
          m.callbackButton('24 hours', '24 hours'),
        ])));
    }
  } catch (e) {
    await ctx.reply(e.message);
  }
});

subsPriceMenu.action('1 hour', async (ctx) => {
  const chat: number = ctx.chat.id;
  try {
    await db.subsActualPrice(chat, 1);
    await ctx.reply('✅ You will get notification with actual price every 1 hour');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

subsPriceMenu.action('8 hours', async (ctx) => {
  const chat: number = ctx.chat.id;
  try {
    await db.subsActualPrice(chat, 8);
    await ctx.reply('✅ You will get notification with actual price every 8 hours');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

subsPriceMenu.action('24 hours', async (ctx) => {
  const chat: number = ctx.chat.id;
  try {
    await db.subsActualPrice(chat, 24);
    await ctx.reply('✅ You will get notification with actual price every 24 hours');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

subsPriceMenu.action('unsubscribe', async (ctx) => {
  const chat: number = ctx.chat.id;
  try {
    await db.unsubActualPrice(chat);
    await ctx.reply('✅ You unsubscribed from price notification');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

wsBtc.addEventListener('open', async () => {
  try {
    await db.btcUpdateSubs(wsBtc);
  } catch (e) {
    logger.info(e);
  }
});

wsBtc.addEventListener('message', async (msg) => {
  try {
    const dataTx: typeBtcNewTxItem = JSON.parse(msg.data);
    // $FlowFixMe
    await db.btcSendNotifsNewTx(bot, dataTx.x, price.btcUsd);
  } catch (e) {
    logger.info(e);
  }
});

wsEth.addEventListener('open', () => {
  try {
    const subNewBlocks = JSON.stringify({
      jsonrpc: 2.0,
      id: 1,
      method: 'eth_subscribe',
      params: ['newHeads'],
    });
    wsEth.send(subNewBlocks);
  } catch (e) {
    logger.info(e);
  }
});

wsEth.addEventListener('message', async (msg) => {
  try {
    const newBlock = JSON.parse(msg.data);
    if (typeof newBlock.params !== 'object') return;
    await db.ethSendNotifsNewTx(bot, eth, newBlock, price.ethUsd);
  } catch (e) {
    logger.info(e);
  }
});

bot.hears(/./, ctx => ctx.reply(startMsg));
bot.catch((e) => {
  logger.info(e);
});
