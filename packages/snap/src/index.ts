/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable no-else-return */
import { OnTransactionHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';


export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  // 1. get "to" address ether balance
  const recepientEtherBalance = await window.ethereum.request({
    method: "eth_getBalance",
    params: [
      transaction.to,
      "latest"
    ]
  });
  const balance = (Number(recepientEtherBalance) / 1e18).toFixed(5);
  // 2. determine wether the "to" address is an EOA or SCA account
  const recepientState = await window.ethereum.request({
    method: "eth_getCode",
    params: [
      transaction.to
    ]
  });
  const state = recepientState === "0x" ?
    "E.O.A - non smart-contract account" :
    "S.C.A - smart-contract account";
  // 3. fetch total txs sent from "from" address to "to" address
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_getAssetTransfers",
      params: {
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: transaction.to,
        fromAddress: transaction.from,
        category: [
          "external",
          "erc20",
          "erc721",
          "erc1155"
        ],
        withMetadata: false,
        excludeZeroValue: true
      }
    })
  };
  const alchemyApi = "https://eth-sepolia.g.alchemy.com/v2/gBBu3CbLKVl_uci2DmTQ8CMq7Uwdmht1";
  const { result: { transfers } } = await fetch(alchemyApi, options)
    .then(res => res.json());
  
  return {
    content: panel([
      heading("Relevant data to recepient address"),
      text(`Recepient ether balance => ${balance} ether`),
      text(`Recepient state => ${state}`),
      text(`Total interaction with recepient => ${transfers.length}`)
    ])
  };
};