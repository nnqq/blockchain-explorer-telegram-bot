const { describe, it } = require('mocha');
const should = require('chai').should();
const {
  template,
  xs,
  textTxsShowing,
  isSpent,
  addrAsLink,
  btcInputFrom,
  btcOutputTo,
  ethTxInAddr,
  usdBalance,
  visitSite,
} = require('../lib/template');
const fixtureBtcInputFrom = require('./fixtures/btc/btcInputFrom');
const fixtureBtcOutputTo = require('./fixtures/btc/btcOutputTo');
const fixtureEthTxInAddr = require('./fixtures/eth/ethTxInAddr');
const fixtureBtcAddress = require('./fixtures/btc/btcAddress');
const fixtureBtcTxItem = require('./fixtures/btc/btcTxItem');
const fixtureBtcBlock = require('./fixtures/btc/btcBlock');
const fixtureEthAddressDataBalance = require('./fixtures/eth/ethAddress-dataBalance');
const fixtureEthAddressDataTxList = require('./fixtures/eth/ethAddress-dataTxList');
const fixtureEthTxItem = require('./fixtures/eth/ethTxItem');
const fixtureEthBlock = require('./fixtures/eth/ethBlock');
const fixtureEthTxWatchList = require('./fixtures/eth/ethTxWatchList');

describe('template.js', () => {
  describe('xs', () => {
    it('should cut starting spaces from template string', () => {
      const data = xs`
        Test data test data
        test data test data
        `;
      const result = 'Test data test data\ntest data test data';
      data.should.equal(result);
    });
  });

  describe('textTxsShowing', () => {
    it('should return "Last 5 transactions" if txs > 5', () => {
      const data = 6;
      const result = '⤵️ Last 5 transactions:';
      textTxsShowing(data).should.equal(result);
    });

    it('should return "Last 5 transactions" if txs = 5', () => {
      const data = 5;
      const result = '⤵️ Last 5 transactions:';
      textTxsShowing(data).should.equal(result);
    });

    it('should return "All transactions:" if txs < 5', () => {
      const data = 4;
      const result = '⤵️ All transactions:';
      textTxsShowing(data).should.equal(result);
    });
  });

  describe('isSpent', () => {
    it('should return "Spent"', () => {
      const data = true;
      const result = '🔴 Spent';
      isSpent(data).should.equal(result);
    });

    it('should return "Not spent"', () => {
      const data = false;
      const result = '✅ Not spent';
      isSpent(data).should.equal(result);
    });
  });

  describe('addrAsLink', () => {
    it('should return simple address', () => {
      const addrOne = '1HtsU97fWrcWKimrm28YekUwdURCx5EH5r';
      const addrTwo = '1HtsU97fWrcWKimrm28YekUwdURCx5EH5r';
      const result = '1HtsU97fWrcWKimrm28YekUwdURCx5EH5r';
      addrAsLink(addrOne, addrTwo).should.equal(result);
    });

    it('should return /link address', () => {
      const addrOne = '1K2XQXrivNc1jvzJHG11iFwmdaGUJgSPHD';
      const addrTwo = '1HtsU97fWrcWKimrm28YekUwdURCx5EH5r';
      const result = '/1K2XQXrivNc1jvzJHG11iFwmdaGUJgSPHD';
      addrAsLink(addrOne, addrTwo).should.equal(result);
    });
  });

  describe('btcInputFrom', () => {
    it('should return valid input item with "normal" addr', () => {
      const data = fixtureBtcInputFrom;
      const currentAddr = '1FwYmGEjXhMtxpWDpUXwLx7ndLNfFQncKq';
      const result = `

⬅️ Input from 1FwYmGEjXhMtxpWDpUXwLx7ndLNfFQncKq
💸 Amount 1 BTC
🔴 Spent`;
      btcInputFrom(data, currentAddr).should.equal(result);
    });

    it('should return valid input item with "link" addr', () => {
      const data = fixtureBtcInputFrom;
      const currentAddr = '13AMPUTTwryLGX3nrMvumaerSqNXkL3gEV';
      const result = `

⬅️ Input from /1FwYmGEjXhMtxpWDpUXwLx7ndLNfFQncKq
💸 Amount 1 BTC
🔴 Spent`;
      btcInputFrom(data, currentAddr).should.equal(result);
    });
  });

  describe('btcOutputTo', () => {
    it('should return valid output item with "normal" addr', () => {
      const data = fixtureBtcOutputTo;
      const currentAddr = '14pDqB95GWLWCjFxM4t96H2kXH7QMKSsgG';
      const result = `

➡️ Output to 14pDqB95GWLWCjFxM4t96H2kXH7QMKSsgG
💸 Amount 0.98 BTC
🔴 Spent`;
      btcOutputTo(data, currentAddr).should.equal(result);
    });

    it('should return valid output item with "link" addr', () => {
      const data = fixtureBtcOutputTo;
      const currentAddr = '13AMPUTTwryLGX3nrMvumaerSqNXkL3gEV';
      const result = `

➡️ Output to /14pDqB95GWLWCjFxM4t96H2kXH7QMKSsgG
💸 Amount 0.98 BTC
🔴 Spent`;
      btcOutputTo(data, currentAddr).should.equal(result);
    });
  });

  describe('ethTxInAddr', () => {
    it('should return tx item with Output header', () => {
      const data = fixtureEthTxInAddr.inAndOut;
      const currentAddr = '0x5abfec25f74cd88437631a7731906932776356f9';
      const result = `
🔴 Output
🔗 ETH TX hash: /0x98beb27135aa0a25650557005ad962919d6a278c4b3dde7f4f6a3a1e65aa746c
🗳 Block: /65204
🕒 Time: Mon, 10 Aug 2015 18:54:49 GMT
💰 TX fee: 0.00611 ETH
🔄 Confirmations: 6814664
⬅️ From /0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4
➡️ To /0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💸 Amount 0 ETH
`;
      ethTxInAddr(data, currentAddr).should.equal(result);
    });

    it('should return tx item with Input header', () => {
      const data = fixtureEthTxInAddr.inAndOut;
      const currentAddr = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae';
      const result = `
✅ Input
🔗 ETH TX hash: /0x98beb27135aa0a25650557005ad962919d6a278c4b3dde7f4f6a3a1e65aa746c
🗳 Block: /65204
🕒 Time: Mon, 10 Aug 2015 18:54:49 GMT
💰 TX fee: 0.00611 ETH
🔄 Confirmations: 6814664
⬅️ From /0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4
➡️ To 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💸 Amount 0 ETH
`;
      ethTxInAddr(data, currentAddr).should.equal(result);
    });

    it('should return tx item with Self header', () => {
      const data = fixtureEthTxInAddr.self;
      const currentAddr = '0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4';
      const result = `
🔵 Self
🔗 ETH TX hash: /0x98beb27135aa0a25650557005ad962919d6a278c4b3dde7f4f6a3a1e65aa746c
🗳 Block: /65204
🕒 Time: Mon, 10 Aug 2015 18:54:49 GMT
💰 TX fee: 0.00611 ETH
🔄 Confirmations: 6814664
⬅️ From 0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4
➡️ To 0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4
💸 Amount 0 ETH
`;
      ethTxInAddr(data, currentAddr).should.equal(result);
    });
  });

  describe('usdBalance', () => {
    it('should return "Less than than 0.01 USD..."', () => {
      const coinName = 'btc';
      const coinAmount = 0.000001;
      const price = 1000;
      const result = '(Less than 0.01 USD @ 1000 BTC/USD)';
      usdBalance(coinName, coinAmount, price).should.equal(result);
    });

    it('should return usd balance and price', () => {
      const coinName = 'btc';
      const coinAmount = 2;
      const price = 1000;
      const result = '(2000 USD @ 1000 BTC/USD)';
      usdBalance(coinName, coinAmount, price).should.equal(result);
    });
  });

  describe('visitSite', () => {
    it('should return string "For more info visit..."', () => {
      const data = 'test.com';
      const result = '🌐 For more info, visit test.com';
      visitSite(data).should.equal(result);
    });
  });

  describe('template.btcAddress', () => {
    it('should return valid Btc addr info', () => {
      const dataAddr = fixtureBtcAddress;
      const message = '18cBEMRxXHqzWWCxZNtU91F5sbUNKhL5PX';
      const priceBtcUsd = '1000';
      const result = `✉️ BTC address: 1AJbsFZ64EpEfS5UAjAfcUG8pH8Jn3rn1F
💰 Final balance: 0 BTC (0 USD @ 1000 BTC/USD)
➡️ Total received: 116.16872 BTC
⬅️ Total sent: 116.16872 BTC

⛓ Total TXs: 86

⤵️ Last 5 transactions:


🔗 TX: /b357ef869a27affd4442e57367396dc404b5757da117d8903ef196fd021b57bc
🕒 Time: Fri, 08 Jun 2012 15:58:54 GMT

⬅️ Input from /1ETBbsHPvbydW7hGWXXKXZ3pxVh3VFoMaX
💸 Amount 2.01154 BTC
🔴 Spent

⬅️ Input from /1AJbsFZ64EpEfS5UAjAfcUG8pH8Jn3rn1F
💸 Amount 46.783 BTC
🔴 Spent

➡️ Output to /1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp
💸 Amount 8 BTC
🔴 Spent

➡️ Output to /1ETBbsHPvbydW7hGWXXKXZ3pxVh3VFoMaX
💸 Amount 40.79454 BTC
🔴 Spent


🔗 TX: /95872d224d3f8e9da7a6d62f8c478897c6f0da82178c6e88e9cedf6c1d2a0ce1
🕒 Time: Fri, 08 Jun 2012 10:34:23 GMT

⬅️ Input from /158Lzf8pRsJ2sDVKCw3n7swXVMmBu71pX7
💸 Amount 59.15 BTC
🔴 Spent

➡️ Output to /18Ms7igboNUpe3JrHUPzqNvU8qSvwScDVQ
💸 Amount 12.367 BTC
🔴 Spent

➡️ Output to /1AJbsFZ64EpEfS5UAjAfcUG8pH8Jn3rn1F
💸 Amount 46.783 BTC
🔴 Spent


🔗 TX: /7445b79c8293dcacb1af66163cdb70fcfe7aca4858ad7653e6fae8f4f139db4b
🕒 Time: Sun, 20 May 2012 07:44:37 GMT

⬅️ Input from /1AJbsFZ64EpEfS5UAjAfcUG8pH8Jn3rn1F
💸 Amount 1 BTC
🔴 Spent

➡️ Output to /19VNCaKDi76Ax5HfMq6rnZsZEEVuaxJF7B
💸 Amount 0.25333 BTC
🔴 Spent

➡️ Output to /1ETBbsHPvbydW7hGWXXKXZ3pxVh3VFoMaX
💸 Amount 0.74167 BTC
🔴 Spent


🔗 TX: /92b155a730680b0fb8df2fd14e27d9db3f29ca64648f6a1c80ec0b5770f3a88f
🕒 Time: Fri, 18 May 2012 19:08:59 GMT

⬅️ Input from /1ETBbsHPvbydW7hGWXXKXZ3pxVh3VFoMaX
💸 Amount 2.94195 BTC
🔴 Spent

➡️ Output to /1AJbsFZ64EpEfS5UAjAfcUG8pH8Jn3rn1F
💸 Amount 1 BTC
🔴 Spent

➡️ Output to /1ETBbsHPvbydW7hGWXXKXZ3pxVh3VFoMaX
💸 Amount 1.94195 BTC
🔴 Spent


🔗 TX: /7a9884839ce6925f9b490b00d52f4a5cd869d431c837ff59acd03b6c444ab05b
🕒 Time: Sun, 06 May 2012 08:59:47 GMT

⬅️ Input from /1AJbsFZ64EpEfS5UAjAfcUG8pH8Jn3rn1F
💸 Amount 0.01 BTC
🔴 Spent

⬅️ Input from /145YPBBWRj4aquewvx59SAWNrSZFT5rvxr
💸 Amount 161.79062 BTC
🔴 Spent

➡️ Output to /1M4VBwfLZ9BfeztkFNsvQgp2FuEY6PDnsC
💸 Amount 0.06641 BTC
✅ Not spent

➡️ Output to /145YPBBWRj4aquewvx59SAWNrSZFT5rvxr
💸 Amount 161.72921 BTC
🔴 Spent

🌐 For more info, visit https://www.blockchain.com/btc/address/1AJbsFZ64EpEfS5UAjAfcUG8pH8Jn3rn1F`;
      template.btcAddress(dataAddr, message, priceBtcUsd).should.equal(result);
    });
  });

  describe('template.btcTxItem', () => {
    it('should return valid Btc tx info', () => {
      const dataTx = fixtureBtcTxItem;
      const priceBtcUsd = 1000;
      const result = `🔗 BTC TX hash: b6f6991d03df0e2e04dafffcd6bc418aac66049e2cd74b80f14ac86db1e3f0da
🕒 Time: Thu, 24 Nov 2011 11:45:54 GMT
⚖️ Size: 258 bytes
🗳 Block: 154598
⚙️ Weight: 1032

➡️ Total inputs: 1 BTC (1000 USD @ 1000 BTC/USD)
⬅️ Total outputs: 1 BTC (1000 USD @ 1000 BTC/USD)
💰 Fees: 0 BTC (0 USD @ 1000 BTC/USD)

⬅️ Input from /1FwYmGEjXhMtxpWDpUXwLx7ndLNfFQncKq
💸 Amount 1 BTC
🔴 Spent

➡️ Output to /14pDqB95GWLWCjFxM4t96H2kXH7QMKSsgG
💸 Amount 0.98 BTC
🔴 Spent

➡️ Output to /13AMPUTTwryLGX3nrMvumaerSqNXkL3gEV
💸 Amount 0.02 BTC
🔴 Spent

🌐 For more info, visit https://www.blockchain.com/btc/tx/b6f6991d03df0e2e04dafffcd6bc418aac66049e2cd74b80f14ac86db1e3f0da`;
      template.btcTxItem(dataTx, priceBtcUsd).should.equal(result);
    });
  });

  describe('template.btcBlock', () => {
    it('should return valid Btc block info', () => {
      const data = fixtureBtcBlock;
      const result = `Hashs
🗳 BTC block: 0000000000000bae09a7a393a8acded75aa67e46cb81f7acaa5ad94f9eacd103
🗳 Prev block: /00000000000007d0f98d9edca880a6c124e25095712df8952e0439ac7409738a
🗳 Merkle root: 935aa0ed2e29a4b81e0c995c39e06995ecce7ddbebb26ed32d550a72e8200bf5

⛓ Total TXs: 22
💰 Transaction fees: 0.002 BTC
↕️ Height: 154595 (Main chain)
🕒 Timestamp: Thu, 24 Nov 2011 10:40:30 GMT
⚙️ Bits: 437129626
⚖️ Size: 9.195 kB
🔧 Ver: 1
🔮 Nonce: 2964215930

⤵️ Last 5 transactions:


🔗 TX hash: /5b09bbb8d3cb2f8d4edbcf30664419fb7c9deaeeb1f62cb432e7741c80dbe5ba
🕒 Time: Thu, 24 Nov 2011 10:40:30 GMT
⚖️ Size: 168 bytes
⚙️ Weight: 672

No inputs (newly generated coins)

➡️ Output to /1KUCp7YP5FP8ViRxhfszSUJCTAajK6viGy
💸 Amount 50.002 BTC
🔴 Spent


🔗 TX hash: /7fec6bd918ee43fddebc9a7d976f3c6d31a61efb4f27482810a6b63f0e4a02d5
🕒 Time: Thu, 24 Nov 2011 10:40:30 GMT
⚖️ Size: 259 bytes
⚙️ Weight: 1036

⬅️ Input from /1EeYUCnnCDqdjNGWK9uNWQ66FQkbr6MUBa
💸 Amount 82.62538 BTC
🔴 Spent

➡️ Output to /1F2o1EEREuUpjK12ifRtah6SyQK29eff7y
💸 Amount 0.05 BTC
🔴 Spent

➡️ Output to /15EFHxnebLB8vUAu8YmeGXaHrwgHwT5jJK
💸 Amount 82.57538 BTC
🔴 Spent


🔗 TX hash: /a9300383c7b0f5fc03d495844420f25035c34c4c1abb0bdb43fed1d491bbb5e2
🕒 Time: Thu, 24 Nov 2011 10:40:30 GMT
⚖️ Size: 258 bytes
⚙️ Weight: 1032

⬅️ Input from /14GPE4J81192XDWxsdjVp11fibninVn9pR
💸 Amount 75.91252 BTC
🔴 Spent

➡️ Output to /1KgeAsUgzduPyfwZVX9qMFUm6aKBJc81Tz
💸 Amount 75.86252 BTC
🔴 Spent

➡️ Output to /18kWdvq94DCX8LR9TTv2urvdFDwi8xmY1Z
💸 Amount 0.05 BTC
🔴 Spent


🔗 TX hash: /956365e81276bea27acc4278c90481a2c178b402ed988e976e205fb0e28c1ebc
🕒 Time: Thu, 24 Nov 2011 10:40:30 GMT
⚖️ Size: 257 bytes
⚙️ Weight: 1028

⬅️ Input from /1J46J1JgpQQaNvz6gmoca9C6hs66WCAiNd
💸 Amount 75.02411 BTC
🔴 Spent

➡️ Output to /1FXdhaDu7MEWmRLJojQMJFNcd2g9ghEq1m
💸 Amount 74.74411 BTC
🔴 Spent

➡️ Output to /1KcyrWg6m3mK9bHfRHJj2pE9Bytdv2dxYM
💸 Amount 0.28 BTC
🔴 Spent


🔗 TX hash: /505b42ec5e8499843ae3ad6f56f66ce52025d37205df19fb5777179d407b2978
🕒 Time: Thu, 24 Nov 2011 10:40:30 GMT
⚖️ Size: 257 bytes
⚙️ Weight: 1028

⬅️ Input from /1Fo9mzh1nLJ63AyXkw6mUVtosn3HKzvRyD
💸 Amount 81.74436 BTC
🔴 Spent

➡️ Output to /18oH3d8MwqmVKqES9cnyozN6WVGoNKMpFX
💸 Amount 81.69436 BTC
🔴 Spent

➡️ Output to /19DHwfKoZ4d5onx2aCM9k1ycZJb8C47t4J
💸 Amount 0.05 BTC
🔴 Spent

🌐 For more info, visit https://www.blockchain.com/btc/block/0000000000000bae09a7a393a8acded75aa67e46cb81f7acaa5ad94f9eacd103`;
      template.btcBlock(data).should.equal(result);
    });
  });

  describe('template.ethAddress', () => {
    it('should return valid Eth address info', () => {
      const dataBalance = fixtureEthAddressDataBalance;
      const dataTxList = fixtureEthAddressDataTxList;
      const message = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae';
      const priceEthUsd = 1000;
      const result = `✉️ ETH address: 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💰 Balance: 655442.83217 ETH (655442832.17 USD @ 1000 ETH/USD)

⤵️ Last 5 transactions:

✅ Input
🔗 ETH TX hash: /0xe97b5e41ad24fde257fe6c125edecbdc76633b6cdb9b999511194ec67be98a89
🗳 Block: /6805744
🕒 Time: Sat, 01 Dec 2018 09:46:43 GMT
💰 TX fee: 0.00056 ETH
🔄 Confirmations: 79124
⬅️ From /0x5ed8cee6b63b1c6afce3ad7c92f4fd7e1b8fad9f
➡️ To 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💸 Amount 0 ETH

✅ Input
🔗 ETH TX hash: /0x9061d6fcd8a25768fdd89a7666de575340d1ea9581520f0d5394c7ee30e68d50
🗳 Block: /6757569
🕒 Time: Fri, 23 Nov 2018 11:39:03 GMT
💰 TX fee: 0.00102 ETH
🔄 Confirmations: 127299
⬅️ From /0x5ed8cee6b63b1c6afce3ad7c92f4fd7e1b8fad9f
➡️ To 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💸 Amount 0 ETH

✅ Input
🔗 ETH TX hash: /0xacddaac881e4ec40e9f1849e4a436574e20937ffde8b270055a01a8b0518615a
🗳 Block: /6757555
🕒 Time: Fri, 23 Nov 2018 11:35:36 GMT
💰 TX fee: 0.00049 ETH
🔄 Confirmations: 127313
⬅️ From /0x4a10a580a10a0fbe3fc1624c1d348838184d7664
➡️ To 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💸 Amount 0 ETH

✅ Input
🔗 ETH TX hash: /0x18e66de42aba618c0885ea92fee8e676764bbdf0c8bc7df5270d0c5ff1f582aa
🗳 Block: /6721447
🕒 Time: Sat, 17 Nov 2018 13:15:32 GMT
💰 TX fee: 0.00006 ETH
🔄 Confirmations: 163421
⬅️ From /0x01d4950b1ed0cdac801973ea8968785148a9e006
➡️ To 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💸 Amount 0 ETH

✅ Input
🔗 ETH TX hash: /0x0959c2aafe4babeeb0abeec6012d8610f7dd452177cbe8ad6abf55431ed1d145
🗳 Block: /6700003
🕒 Time: Wed, 14 Nov 2018 00:50:43 GMT
💰 TX fee: 0.0001 ETH
🔄 Confirmations: 184865
⬅️ From /0x01d4950b1ed0cdac801973ea8968785148a9e006
➡️ To 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
💸 Amount 0 ETH

🌐 For more info, visit https://etherscan.io/address/0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae`;
      template.ethAddress(dataBalance, dataTxList, message, priceEthUsd).should.equal(result);
    });
  });

  describe('template.ethTxItem', () => {
    it('should return valid Eth tx info', () => {
      const dataTx = fixtureEthTxItem;
      const priceEthUsd = 1000;
      const result = `🔗 ETH TX hash: 0x1e2910a262b1008d0616a0beb24c1a491d78771baa54a33e66065e03b1f46bc1
🗳 Block hash: 0xf64a12502afc36db3d29931a2148e5d6ddaa883a2a3c968ca2fb293fa9258c68
↕️ Block height: /460857
💵 Gas price: 50 Gwei
🔮 Nonce: 167
⬅️ From: /0xc80fb22930b303b55df9b89901889126400add38
➡️ To: /0x03fca6077d38dd99d0ce14ba32078bd2cda72d74
💸 Amount: 0 ETH (0 USD @ 1000 ETH/USD)

🌐 For more info, visit https://etherscan.io/tx/0x1e2910a262b1008d0616a0beb24c1a491d78771baa54a33e66065e03b1f46bc1`;
      template.ethTxItem(dataTx, priceEthUsd).should.equal(result);
    });
  });

  describe('template.ethBlock', () => {
    it('should return valid Eth block info', () => {
      const dataBlock = fixtureEthBlock;
      const result = `↕️ ETH block height: 6885031
🕒 Timestamp: Fri, 14 Dec 2018 12:21:07 GMT
⛓ Transactions: 41 TXs
🗳 Hash: 0xe7f349b97efbdaf8cd0880b41d0b2f3fffd062448275dd133728722db08291e8
🗳 Parent hash: 0xa2f373961ee985bde65888e3080c9f4cfc461f037c33f2540a691d0881852ac1
🗳 Sha3 uncles: 0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347
✉️ Mined by: /0xea674fdde714fd979de3edf0f56aa9716b898ec8
⛏ Difficulty: 2221184421224081
🛠 Total difficulty: 8.275119005953433e+21
⚖️ Size: 9582 bytes
🔥 Gas used: 3516594
🛢 Gas limit: 8003951
🔮 Nonce: 0xe3aac4600178bc1a

⤵️ Last 5 transactions:

🔗 TX hash: /0x709fff62697fa2e5cce030f2dd3dca0f8ff5987a8cbea39ad657edb9b341e595
⬅️ From /0xf0a736b4503b15ad62b03883b1e108f42a6d48e8
➡️ To /0x933169c31ad936a4bac7ab47081a1c19b60432df
💸 Amount 0 ETH

🔗 TX hash: /0x32274e50b45202dfde475e66d01e3683dfc0ba1c2a9a2521fbf94dc7df513dc0
⬅️ From /0xc5a3d99e05c39a18d6342b5f27c08c64a486df00
➡️ To /0xf194c4f6cd4e0518f224c04650f396165b5a69e3
💸 Amount 0 ETH

🔗 TX hash: /0x81ab88bba8e925e25c06c74a3cfc9e40f3c78bc86f530e240197899ef01bdee1
⬅️ From /0xc33ffac8030c7c50d8994015c88d502a3240dec7
➡️ To /0x752ff65b884b9c260d212c804e0b7aceea012473
💸 Amount 0 ETH

🔗 TX hash: /0x5cc4ebacf7ca00fcd8d535e5beb518b99bd9d7f51047f27f40d81e1c334dac9d
⬅️ From /0xc33ffac8030c7c50d8994015c88d502a3240dec7
➡️ To /0x752ff65b884b9c260d212c804e0b7aceea012473
💸 Amount 0 ETH

🔗 TX hash: /0x6a7db172181df6c8af53a6f3d243c09c5d9da9814e07a4e21a6dd9a0c4d76d8f
⬅️ From /0xc33ffac8030c7c50d8994015c88d502a3240dec7
➡️ To /0x752ff65b884b9c260d212c804e0b7aceea012473
💸 Amount 0 ETH

🌐 For more info, visit https://etherscan.io/block/6885031`;
      template.ethBlock(dataBlock).should.equal(result);
    });
  });

  describe('template.ethTxWatchList', () => {
    it('should return valid Eth tx simple info (from block)', () => {
      const dataTx = fixtureEthTxWatchList;
      const priceEthUsd = 1000;
      const result = `🔗 ETH TX hash: /0xeb9bf5d220e9128ca74b25251e2b1543879c4321a31519fd3f6a888bfdfd0cad
🗳 Block: /6885229
⬅️ From /0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98
➡️ To /0x4dffa44b8d3a63039f03099ef71587431ad36522
💸 Amount 2.7 ETH (2700 USD @ 1000 ETH/USD)

🌐 For more info, visit https://etherscan.io/tx/0xeb9bf5d220e9128ca74b25251e2b1543879c4321a31519fd3f6a888bfdfd0cad`;
      template.ethTxWatchList(dataTx, priceEthUsd).should.equal(result);
    });
  });

  describe('template.watchListNotifHeader', () => {
    it('should return valid Watch List new tx notification header', () => {
      const command = 'watch_address';
      const isTxNotif = true;
      const result = `👁 Notification from Watch List. To manage it, click /watch_address
Tip: Click /blockchain to explore by tapping on addrs/hashs/blocks`;
      template.watchListNotifHeader(command, isTxNotif).should.equal(result);
    });

    it('should return valid Watch List regular notification header', () => {
      const command = 'watch_price';
      const result = '👁 Notification from Watch List. To manage it, click /watch_price';
      template.watchListNotifHeader(command).should.equal(result);
    });
  });

  describe('template.watchPriceNotifBody', () => {
    it('should return valid Watch Price notification item', () => {
      const coinName = 'bitcoin';
      const currentPrice = 1000;
      const priceLow = 500;
      const priceHigh = 600;
      const result = `Bitcoin price now 1000 USD.
It outs of the range 500-600 USD you entered.`;
      template.watchPriceNotifBody(coinName, currentPrice, priceLow, priceHigh)
        .should.equal(result);
    });
  });

  describe('template.coinPrice', () => {
    it('should return valid Btc and Eth prices template', () => {
      const priceBtcUsd = 1000;
      const priceEthUsd = 500;
      const result = `Bitcoin: 1000 USD
Ethereum: 500 USD`;
      template.coinPrice(priceBtcUsd, priceEthUsd).should.equal(result);
    });
  });
});
