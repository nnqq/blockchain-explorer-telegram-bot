class validate {
  static async splitAndReply(ctx, msg) {
    try {
      if (msg.length > 4096) {
        let msgQueue = msg.match(/(.|[\r\n]){1,4096}/g);
        if (msgQueue.length > 3) {
          msgQueue = msgQueue.slice(0, 2);
          msgQueue.push('Too long inputs/outputs list, we sent only 3 messages');
        }
        for (const msgItem of msgQueue) {
          await ctx.reply(msgItem);
        }
      } else {
        await ctx.reply(msg);
      }
    } catch (e) {
      await ctx.reply(e.message);
    }
  }

  static satToBtc(sat) {
    const btc = sat / 1e8;
    return +btc.toFixed(5);
  }

  static weiToEth(wei) {
    const eth = wei / 1e18;
    return +eth.toFixed(5);
  }

  static weiToGwei(wei) {
    const gwei = wei / 1e9;
    return +gwei.toFixed(5);
  }

  static unixToUtc(sec) {
    return new Date(sec * 1000).toUTCString();
  }

  static byteToKb(byte) {
    return byte / 1000;
  }

  static onlyPositiveNum(num) {
    return num > 0 ? num : 0;
  }

  static isBtcAddress(str) {
    const pattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return pattern.test(str);
  }

  static isBtcTxOrBlock(str) {
    const pattern = /^[a-fA-F0-9]{64}$/;
    return pattern.test(str);
  }

  static isEthAddress(str) {
    const pattern = /^(0x)?[a-fA-F0-9]{40}$/;
    return pattern.test(str);
  }

  static isEthTx(str) {
    const pattern = /^0x([a-fA-F0-9]{64})$/;
    return pattern.test(str);
  }

  static isPriceOutOfRange(currentPrice, priceLow, priceHigh) {
    return currentPrice < priceLow || currentPrice > priceHigh;
  }

  static validateWatchPriceMsg(msg) {
    const msgArr = msg.toLowerCase().split(' ');
    const priceLow = +msgArr[1];
    const priceHigh = +msgArr[2];

    const isBtcOrEth = msgArr[0] === 'btc' || msgArr[0] === 'eth';
    const validRange = priceLow < priceHigh
      && Number.isInteger(priceLow)
      && Number.isInteger(priceHigh);

    if (msgArr.length === 3 && isBtcOrEth && validRange) {
      let coinName;
      if (msgArr[0] === 'btc') coinName = 'bitcoin';
      if (msgArr[0] === 'eth') coinName = 'ethereum';
      return { coinName, priceLow, priceHigh };
    }
    return false;
  }

  static capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
  }
}

module.exports = validate;
