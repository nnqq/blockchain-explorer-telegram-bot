// @flow
import type { typeBtcInputFrom } from '../flow-types/btc/btcInputFrom';
import type { typeBtcOutputTo } from '../flow-types/btc/btcOutputTo';
import type { typeEthTxInAddr } from '../flow-types/eth/ethTxInAddr';
import type { typeBtcAddress } from '../flow-types/btc/btcAddress';
import type { typeBtcTxItem } from '../flow-types/btc/btcTxItem';
import type { typeBtcBlock } from '../flow-types/btc/btcBlock';
import type { typeEthAddressDataBalance } from '../flow-types/eth/ethAddress-dataBalance';
import type { typeEthAddressDataTxList } from '../flow-types/eth/ethAddress-dataTxList';
import type { typeEthTxItem } from '../flow-types/eth/ethTxItem';
import type { typeEthBlock } from '../flow-types/eth/ethBlock';
import type { typeEthTxWatchList } from '../flow-types/eth/ethTxWatchList';

const v = require('./validate');

function xs(strings: any, ...expressions: Array<string>): string {
  const indent: RegExp = new RegExp(`\n {${strings[0].match(/\n+( *)/)[1].length}}`, 'g');
  return expressions.reduce(
    (acc, expr, i) => `${acc}${expr}${strings[i + 1].replace(indent, '\n')}`,
    strings[0].replace(indent, '\n'),
  ).replace(/^\n|\n$/g, '');
}

function textTxsShowing(numOfTxs: number): string {
  return numOfTxs >= 5 ? '⤵️ Last 5 transactions:' : '⤵️ All transactions:';
}

function isSpent(spent: boolean): string {
  return spent ? '🔴 Spent' : '✅ Not spent';
}

function addrAsLink(addrToCheck: string, currentAddr?: string): string {
  return addrToCheck === currentAddr ? addrToCheck : `/${addrToCheck}`;
}

function btcInputFrom(input: typeBtcInputFrom, currentAddr?: string): string {
  if (!input.prev_out) {
    return xs`
      
      
      No inputs (newly generated coins)
      `;
  }
  const { addr, value, spent } = input.prev_out;
  const addrText = addr ? addrAsLink(addr, currentAddr) : 'Unable to decode input address';
  return xs`
    
    
    ⬅️ Input from ${addrText}
    💸 Amount ${v.satToBtc(value)} BTC
    ${isSpent(spent)}
    `;
}

function btcOutputTo(output: typeBtcOutputTo, currentAddr?: string): string {
  const { addr, value, spent } = output;
  const addrText = addr ? addrAsLink(addr, currentAddr) : 'Unable to decode output address';
  return xs`
    
    
    ➡️ Output to ${addrText}
    💸 Amount ${v.satToBtc(value)} BTC
    ${isSpent(spent)}
    `;
}

function ethTxInAddr(dataTx: typeEthTxInAddr, currentAddr: string): string {
  const myAddr: string = currentAddr.toLowerCase();
  let direction: string = '🔴 Output';
  if (myAddr !== dataTx.from && myAddr === dataTx.to) {
    direction = '✅ Input';
  } else if (myAddr === dataTx.from && myAddr === dataTx.to) {
    direction = '🔵 Self';
  }
  return xs`
    
    ${direction}
    🔗 ETH TX hash: /${dataTx.hash}
    🗳 Block: /${dataTx.blockNumber}
    🕒 Time: ${v.unixToUtc(+dataTx.timeStamp)}
    💰 TX fee: ${v.weiToEth(+dataTx.gasPrice * +dataTx.gasUsed)} ETH
    🔄 Confirmations: ${dataTx.confirmations}
    ⬅️ From ${addrAsLink(dataTx.from, myAddr)}
    ➡️ To ${addrAsLink(dataTx.to, myAddr)}
    💸 Amount ${v.weiToEth(+dataTx.value)} ETH
    
    `;
}

function usdBalance(coinName: string, coinAmount: number, price: number): string {
  const balance: number = coinAmount * price;
  if (balance < 0.01 && balance > 0) {
    return `(Less than 0.01 USD @ ${price} ${coinName.toUpperCase()}/USD)`;
  }
  return `(${+balance.toFixed(2)} USD @ ${price} ${coinName.toUpperCase()}/USD)`;
}

function visitSite(link: string): string {
  return `🌐 For more info, visit ${link}`;
}

class template {
  static btcAddress(dataAddr: typeBtcAddress, message: string, priceBtcUsd: number): string {
    let txList: string = '';

    dataAddr.txs.forEach((txItem) => {
      let txTemplate: string = xs`
          
          
          
          🔗 TX: /${txItem.hash}
          🕒 Time: ${v.unixToUtc(txItem.time)}
          `;

      txItem.inputs.forEach((input) => {
        txTemplate += btcInputFrom(input, message);
      });

      txItem.out.forEach((output) => {
        txTemplate += btcOutputTo(output, message);
      });

      txList += txTemplate;
    });

    const btcBalance: number = v.satToBtc(dataAddr.final_balance);

    return xs`
      ✉️ BTC address: ${dataAddr.address}
      💰 Final balance: ${btcBalance} BTC ${usdBalance('btc', btcBalance, priceBtcUsd)}
      ➡️ Total received: ${v.satToBtc(dataAddr.total_received)} BTC
      ⬅️ Total sent: ${v.satToBtc(dataAddr.total_sent)} BTC
      
      ⛓ Total TXs: ${dataAddr.n_tx}
      
      ${textTxsShowing(dataAddr.n_tx)}${txList}
      
      ${visitSite(`https://www.blockchain.com/btc/address/${dataAddr.address}`)}
      `;
  }

  static btcTxItem(dataTx: typeBtcTxItem, priceBtcUsd: number): string {
    let inOutList: string = '';
    let totalInputs: number = 0;
    let totalOuts: number = 0;

    dataTx.inputs.forEach((input) => {
      inOutList += btcInputFrom(input);
      if (input.prev_out) {
        totalInputs += input.prev_out.value;
      }
    });

    dataTx.out.forEach((output) => {
      inOutList += btcOutputTo(output);
      totalOuts += output.value;
    });

    const fees: number = v.satToBtc(v.onlyPositiveNum(totalInputs - totalOuts));
    const inputsBtc: number = v.satToBtc(totalInputs);
    const outsBtc: number = v.satToBtc(totalOuts);

    return xs`
      🔗 BTC TX hash: ${dataTx.hash}
      🕒 Time: ${v.unixToUtc(dataTx.time)}
      ⚖️ Size: ${dataTx.size} bytes
      🗳 Block: ${dataTx.block_height || 'Not available'}
      ⚙️ Weight: ${dataTx.weight || 'Not available'}
      
      ➡️ Total inputs: ${inputsBtc} BTC ${usdBalance('btc', inputsBtc, priceBtcUsd)}
      ⬅️ Total outputs: ${outsBtc} BTC ${usdBalance('btc', outsBtc, priceBtcUsd)}
      💰 Fees: ${fees} BTC ${usdBalance('btc', fees, priceBtcUsd)}${inOutList}
      
      ${visitSite(`https://www.blockchain.com/btc/tx/${dataTx.hash}`)}
      `;
  }

  static btcBlock(dataBlock: typeBtcBlock): string {
    let txList: string = '';

    const firstFiveTxs = dataBlock.tx.slice(0, 5);
    firstFiveTxs.forEach((txItem) => {
      let txTemplate: string = xs`
        
        
        
        🔗 TX hash: /${txItem.hash}
        🕒 Time: ${v.unixToUtc(txItem.time)}
        ⚖️ Size: ${txItem.size} bytes
        ⚙️ Weight: ${txItem.weight}
        `;

      txItem.inputs.forEach((input) => {
        txTemplate += btcInputFrom(input);
      });

      txItem.out.forEach((output) => {
        txTemplate += btcOutputTo(output);
      });

      txList += txTemplate;
    });

    return xs`
      Hashs
      🗳 BTC block: ${dataBlock.hash}
      🗳 Prev block: /${dataBlock.prev_block}
      🗳 Merkle root: ${dataBlock.mrkl_root}
      
      ⛓ Total TXs: ${dataBlock.n_tx}
      💰 Transaction fees: ${v.satToBtc(dataBlock.fee)} BTC
      ↕️ Height: ${dataBlock.height} (${dataBlock.main_chain ? 'Main chain' : 'Alt chain'})
      🕒 Timestamp: ${v.unixToUtc(dataBlock.time)}
      ⚙️ Bits: ${dataBlock.bits}
      ⚖️ Size: ${v.byteToKb(dataBlock.size)} kB
      🔧 Ver: ${dataBlock.ver.toString(16)}
      🔮 Nonce: ${dataBlock.nonce}
      
      ⤵️ Last 5 transactions:${txList}
      
      ${visitSite(`https://www.blockchain.com/btc/block/${dataBlock.hash}`)}
      `;
  }

  static ethAddress(dataBalance: typeEthAddressDataBalance, dataTxList: typeEthAddressDataTxList,
    message: string, priceEthUsd: number): string {
    let txList: string = '';

    dataTxList.result.forEach((txItem) => {
      txList += ethTxInAddr(txItem, message);
    });

    const ethBalance: number = v.weiToEth(+dataBalance.result);

    return xs`
      ✉️ ETH address: ${message}
      💰 Balance: ${ethBalance} ETH ${usdBalance('eth', ethBalance, priceEthUsd)}
      
      ${textTxsShowing(dataTxList.result.length)}
      ${txList}
      ${visitSite(`https://etherscan.io/address/${message}`)}
      `;
  }

  static ethTxItem(dataTx: typeEthTxItem, priceEthUsd: number): string {
    const gasPrice = parseInt(dataTx.result.gasPrice, 16);
    const amountEth = v.weiToEth(parseInt(dataTx.result.value, 16));

    return xs`
      🔗 ETH TX hash: ${dataTx.result.hash}
      🗳 Block hash: ${dataTx.result.blockHash}
      ↕️ Block height: /${parseInt(dataTx.result.blockNumber, 16)}
      💵 Gas price: ${v.weiToGwei(gasPrice)} Gwei
      🔮 Nonce: ${parseInt(dataTx.result.nonce, 16)}
      ⬅️ From: /${dataTx.result.from}
      ➡️ To: /${dataTx.result.to}
      💸 Amount: ${amountEth} ETH ${usdBalance('eth', amountEth, priceEthUsd)}
      
      ${visitSite(`https://etherscan.io/tx/${dataTx.result.hash}`)}
      `;
  }

  static ethBlock(dataBlock: typeEthBlock) {
    let txList = '';
    const totalTxs = dataBlock.result.transactions.length;

    const firstFiveTxs = dataBlock.result.transactions.slice(0, 5);
    firstFiveTxs.forEach((txItem) => {
      txList += xs`
        
        
        🔗 TX hash: /${txItem.hash}
        ⬅️ From /${txItem.from}
        ➡️ To /${txItem.to}
        💸 Amount ${v.weiToEth(+txItem.value)} ETH
        `;
    });

    const blockNum = parseInt(dataBlock.result.number, 16);
    return xs`
      ↕️ ETH block height: ${blockNum}
      🕒 Timestamp: ${v.unixToUtc(parseInt(dataBlock.result.timestamp, 16))}
      ⛓ Transactions: ${totalTxs} TXs
      🗳 Hash: ${dataBlock.result.hash}
      🗳 Parent hash: ${dataBlock.result.parentHash}
      🗳 Sha3 uncles: ${dataBlock.result.sha3Uncles}
      ✉️ Mined by: /${dataBlock.result.miner}
      ⛏ Difficulty: ${parseInt(dataBlock.result.difficulty, 16)}
      🛠 Total difficulty: ${parseInt(dataBlock.result.totalDifficulty, 16)}
      ⚖️ Size: ${parseInt(dataBlock.result.size, 16)} bytes
      🔥 Gas used: ${parseInt(dataBlock.result.gasUsed, 16)}
      🛢 Gas limit: ${parseInt(dataBlock.result.gasLimit, 16)}
      🔮 Nonce: ${dataBlock.result.nonce}
      
      ${textTxsShowing(totalTxs)}${txList}
      
      ${visitSite(`https://etherscan.io/block/${blockNum}`)}
      `;
  }

  static ethTxWatchList(dataTx: typeEthTxWatchList, priceEthUsd: number): string {
    const amount = v.weiToEth(parseInt(dataTx.value, 16));
    return xs`
      🔗 ETH TX hash: /${dataTx.hash}
      🗳 Block: /${parseInt(dataTx.blockNumber, 16)}
      ⬅️ From /${dataTx.from}
      ➡️ To /${dataTx.to}
      💸 Amount ${amount} ETH ${usdBalance('eth', amount, priceEthUsd)}
      
      ${visitSite(`https://etherscan.io/tx/${dataTx.hash}`)}
      `;
  }

  static watchListNotifHeader(command: string, isTxNotif?: true): string {
    if (isTxNotif) {
      return xs`
        👁 Notification from Watch List. To manage it, click /${command}
        Tip: Click /blockchain to explore by tapping on addrs/hashs/blocks
        `;
    }
    return `👁 Notification from Watch List. To manage it, click /${command}`;
  }

  static watchPriceNotifBody(coinName: string, currentPrice: number, priceLow: number,
    priceHigh: number): string {
    return xs`
      ${v.capitalize(coinName)} price now ${currentPrice} USD.
      It outs of the range ${priceLow}-${priceHigh} USD you entered.
      `;
  }

  static coinPrice(priceBtcUsd: number, priceEthUsd: number): string {
    return xs`
      Bitcoin: ${priceBtcUsd} USD
      Ethereum: ${priceEthUsd} USD
      `;
  }
}

module.exports = {
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
};
