const { describe, it } = require('mocha');
const should = require('chai').should();
const v = require('../lib/validate');

describe('validate.js', () => {
  describe('satToBtc', () => {
    const data = [14823581, 1243823700];
    const result = [0.14824, 12.43824];

    it('should return number', () => {
      data.forEach((item) => {
        v.satToBtc(item).should.be.a('number');
      });
    });

    it('should convert Satoshi to Bitcoin', () => {
      data.forEach((item, i) => {
        v.satToBtc(item).should.equal(result[i]);
      });
    });
  });

  describe('weiToEth', () => {
    const data = [93782493473823582375, 2347623594200348276434];
    const result = [93.78249, 2347.62359];

    it('should return number', () => {
      data.forEach((item) => {
        v.weiToEth(item).should.be.a('number');
      });
    });

    it('should convert Wei to Ether', () => {
      data.forEach((item, i) => {
        v.weiToEth(item).should.equal(result[i]);
      });
    });
  });

  describe('weiToGwei', () => {
    const data = [83294756341238458234, 234723491238742342342];
    const result = [83294756341.23846, 234723491238.74234];

    it('should return number', () => {
      data.forEach((item) => {
        v.weiToGwei(item).should.be.a('number');
      });
    });

    it('should convert Wei to Gwei', () => {
      data.forEach((item, i) => {
        v.weiToGwei(item).should.equal(result[i]);
      });
    });
  });

  describe('unixToUtc', () => {
    const data = 1544611240;
    const result = 'Wed, 12 Dec 2018 10:40:40 GMT';

    it('should convert Unix timestamp to UTC', () => {
      v.unixToUtc(data).should.equal(result);
    });
  });

  describe('byteToKb', () => {
    const data = 5675673;
    const result = 5675.673;

    it('should return number', () => {
      v.byteToKb(data).should.be.a('number');
    });

    it('should convert byte to kB', () => {
      v.byteToKb(data).should.equal(result);
    });
  });

  describe('onlyPositiveNum', () => {
    const data = [5, -2];

    it('should return positive number and 0 if not', () => {
      data.forEach((item) => {
        v.onlyPositiveNum(item).should.be.gte(0);
      });
    });
  });

  describe('isBtcAddress', () => {
    const data = [
      '1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp',
      '1NxaBCFQwejSZbQfWcYNwgqML5wWoE3rK4',
      '1P9RQEr2XeE3PEb44ZE35sfZRRW1JHU8qx',
      '1LuckyR1fFHEsXYyx5QK4UFzv3PEAepPMK',
    ];

    it('should return true if sting is Btc address', () => {
      data.forEach((item) => {
        v.isBtcAddress(item).should.be.true;
      });
    });
  });

  describe('isBtcTxOrBlock', () => {
    const data = [
      '0000000000000000001a67c5c995ca18656417ff7c4028b02fc98c58a514070a',
      '0000000000000000000d7c5d4926db3f919f3fd00effb58ade7cb4259381360c',
      '95a090e7187e2702727a88b2b35d29d88eb4e70e4a29f133310730cf37b2ff34',
      'da3a1c87b8a539b71aa9e4e6bd9afa8d4909b100c170fa530093057d1d45a61d',
    ];

    it('should return true if sting Btc tx hash or Btc block hash', () => {
      data.forEach((item) => {
        v.isBtcTxOrBlock(item).should.be.true;
      });
    });
  });

  describe('isEthAddress', () => {
    const data = [
      '0x742d35cc6634c0532925a3b844bc454e4438f44e',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x53d284357ec70ce289d6d64134dfac8e511c8a3d',
      '0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98',
    ];

    it('should return true if sting Eth address', () => {
      data.forEach((item) => {
        v.isEthAddress(item).should.be.true;
      });
    });
  });

  describe('isEthTx', () => {
    const data = [
      '0x5258a1ce3ec1caed9e7085d404b22503ce80b2272d089f39750e7819bacb2171',
      '0xeba134609b419267ad8ef878b50bded2a1da9000ce3d263610f6334fae77daf9',
      '0x6441c618f3306b8b2305d9da42dce85fcf4e3985f6155725db953aedb64b73c7',
      '0xb7f01ce62e49389a65c3369abf385c3484ba54ebabdcef93f5a917ca7dd0aa15',
    ];

    it('should return true if sting Eth tx hash', () => {
      data.forEach((item) => {
        v.isEthTx(item).should.be.true;
      });
    });
  });

  describe('isPriceOutOfRange', () => {
    it('should return false if first number in range of next two', () => {
      const [currentPrice, priceLow, priceHigh] = [500, 450, 550];
      v.isPriceOutOfRange(currentPrice, priceLow, priceHigh).should.be.false;
    });

    it('should return true if first number outs range of next two', () => {
      const [currentPrice, priceLow, priceHigh] = [600, 450, 550];
      v.isPriceOutOfRange(currentPrice, priceLow, priceHigh).should.be.true;
    });
  });

  describe('validateWatchPriceMsg', () => {
    it('should return { coinName, priceLow, priceHigh } if string first word '
      + '"btc" and second and third words are numbers asc', () => {
      const dataBtc = 'btc 400 500';
      const resultBtc = {
        coinName: 'bitcoin',
        priceLow: 400,
        priceHigh: 500,
      };
      v.validateWatchPriceMsg(dataBtc).should.eql(resultBtc);
    });

    it('should return { coinName, priceLow, priceHigh } if string first word '
      + '"eth" and second and third words are numbers asc', () => {
      const dataBtc = 'eth 600 700';
      const resultBtc = {
        coinName: 'ethereum',
        priceLow: 600,
        priceHigh: 700,
      };
      v.validateWatchPriceMsg(dataBtc).should.eql(resultBtc);
    });

    it('should return false if string first word '
      + '"btc" or "eth" but second and third words are not numbers asc', () => {
      const dataBtc = 'btc 800 500';
      const dataEth = 'eth 800 500';
      v.validateWatchPriceMsg(dataBtc).should.be.false;
      v.validateWatchPriceMsg(dataEth).should.be.false;
    });
  });

  describe('capitalize', () => {
    it('should return capitalized string', () => {
      const data = 'test data';
      const result = 'Test data';
      v.capitalize(data).should.equal(result);
    });
  });
});
