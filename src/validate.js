// @flow
import type { typeWatchPriceObj } from '../flow-types/validate/watchPriceObj';

class validate {
  static async splitAndReply(ctx: Object, msg: string) {
    try {
      if (msg.length > 4096) {
        // $FlowFixMe
        let msgQueue: Array<string> = msg.match(/(.|[\r\n]){1,4096}/g);
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

  static satToBtc(sat: number): number {
    const btc: number = sat / 1e8;
    return +btc.toFixed(5);
  }

  static weiToEth(wei: number): number {
    const eth: number = wei / 1e18;
    return +eth.toFixed(5);
  }

  static weiToGwei(wei: number): number {
    const gwei: number = wei / 1e9;
    return +gwei.toFixed(5);
  }

  static unixToUtc(sec: number): string {
    return new Date(sec * 1000).toUTCString();
  }

  static byteToKb(byte: number): number {
    return byte / 1000;
  }

  static onlyPositiveNum(num: number): number {
    return num > 0 ? num : 0;
  }

  static isBtcAddress(str: string): boolean {
    const pattern: RegExp = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return pattern.test(str);
  }

  static isBtcTxOrBlock(str: string): boolean {
    const pattern: RegExp = /^[a-fA-F0-9]{64}$/;
    return pattern.test(str);
  }

  static isEthAddress(str: string): boolean {
    const pattern: RegExp = /^(0x)?[a-fA-F0-9]{40}$/;
    return pattern.test(str);
  }

  static isEthTx(str: string): boolean {
    const pattern: RegExp = /^0x([a-fA-F0-9]{64})$/;
    return pattern.test(str);
  }

  static isPriceOutOfRange(currentPrice: number, priceLow: number, priceHigh: number): boolean {
    return currentPrice < priceLow || currentPrice > priceHigh;
  }

  static validateWatchPriceMsg(msg: string): typeWatchPriceObj | false {
    const msgArr: Array<string> = msg.toLowerCase().split(' ');
    const priceLow: number = +msgArr[1];
    const priceHigh: number = +msgArr[2];

    const isBtcOrEth: boolean = msgArr[0] === 'btc' || msgArr[0] === 'eth';
    const validRange: boolean = priceLow < priceHigh
      && Number.isInteger(priceLow)
      && Number.isInteger(priceHigh);

    if (msgArr.length === 3 && isBtcOrEth && validRange) {
      let coinName: string = 'btc';
      if (msgArr[0] === 'btc') coinName = 'bitcoin';
      else if (msgArr[0] === 'eth') coinName = 'ethereum';
      return { coinName, priceLow, priceHigh };
    }
    return false;
  }

  static capitalize(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
  }
}

module.exports = validate;
