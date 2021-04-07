import React, { useState } from 'react'
import Blockies from 'react-blockies';
import { Card, Row, Col, List, Input, Button, Divider } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useContractLoader,useNonce, useContractReader, useEventListener, useBlockNumber, useBalance, useTokenBalance } from "./hooks"
import { Transactor } from "./helpers"
import { parseEther, formatEther,formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import  Address from "./components/Address"
import  TokenBalance from "./components/TokenBalance"

import { util } from 'ethers';
import Curve from './Curve.js'
const { Meta } = Card;
const { utils } = require("ethers");


const contractName = "ADEX";
const tokenName = "AfricaToken";

const ADEX=({purpose, setPurposeEvents, address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts})=> {
    
    console.log('ReadContracts',readContracts);
    const contractAddress = readContracts?readContracts.ADEX.address:""
    const tokenAddress = readContracts?readContracts.AfricaToken.address:""
    const contractBalanceHex = useBalance(userProvider,contractAddress)
    
 

    let contractBalanceFloat = 0;
    if (typeof contractBalanceHex === 'undefined'){
    const invalidContractBalance = 'true';
    } else {    
      const contractBalanceEther =formatEther(contractBalanceHex);
      contractBalanceFloat = parseFloat(contractBalanceEther).toPrecision(4)
      console.log("BNB Balance",contractBalanceFloat)
    }
   
    let tokenBalanceFloat = 0;

    const tokenBalance = useTokenBalance(readContracts, tokenName, contractAddress, userProvider)
   
    const tokenBalanceEther =formatEther(tokenBalance);
  
    tokenBalanceFloat = parseFloat(tokenBalanceEther).toPrecision(4)
    console.log("Africa Token Balance",tokenBalanceFloat)
    
    let ethBalanceFloat = 0;
    const ethBalanceHex = useTokenBalance(readContracts, contractName, contractAddress, userProvider)
    if (typeof ethBalanceHex === 'undefined'){
     const invalid = 'true';
     } else {    
       const ethBalanceEther =formatEther(ethBalanceHex);
       ethBalanceFloat = parseFloat(ethBalanceEther).toPrecision(4)
     }

    
    const liquidity = useContractReader(readContracts,contractName,"liquidity",[address])
  
    let display = []
  
    const [ form, setForm ] = useState({})
    const [ values, setValues ] = useState({})
  
    const rowForm = (title,icon,onClick)=>{
      return (
        <Row>
          <Col span={8} style={{textAlign:"right",opacity:0.333,paddingRight:6,fontSize:24}}>{title}</Col>
          <Col span={16}>
            <div style={{cursor:"pointer",margin:2}}>
              <Input
                onChange={(e)=>{
                  let newValues = {...values}
                  newValues[title] = e.target.value
                  setValues(newValues)
                }}
                value={values[title]}
                addonAfter={
                  <div type="default" onClick={()=>{
                    onClick(values[title])
                    let newValues = {...values}
                    newValues[title] = ""
                    setValues(newValues)
                  }}>{icon}</div>
                }
              />
            </div>
          </Col>
        </Row>
      )
    }
  
  
    if(readContracts && readContracts.ADEX){
  
      display.push(
        <div>
  
          {rowForm("BNBToToken","💸",async (value)=>{
            let valueInEther = parseEther(""+value)
            let swapEthToTokenResult = await tx( writeContracts[contractName]["BNBToToken"]({value: valueInEther}) )
            console.log("swapEthToTokenResult:",swapEthToTokenResult)
          })}
  
          {rowForm("tokenToBNB","🔏",async (value)=>{
            let valueInEther = utils.parseEther(""+value)
            console.log("valueInEther",valueInEther)
            let allowance =  await readContracts.AfricaToken.allowance(address,readContracts.ADEX.address)
            console.log("allowance",allowance)
            let nonce = await userProvider.getTransactionCount(address)
            console.log("nonce",nonce)
            let approveTx
            if(allowance.lt(valueInEther)){
              approveTx = tx( writeContracts[tokenName].approve(readContracts[contractName].address,valueInEther,{gasLimit:200000 , nonce:nonce++}) )
              console.log("approve tx is in, not waiting on it though...",approveTx)
            }
            let swapTx = tx( writeContracts[contractName]["tokenToBNB"](valueInEther,{gasLimit:200000, nonce:nonce++}) )
            //let swapTx = tx( writeContracts[contractName]["tokenToBNB"](valueInEther,{gasLimit:200000}) )
            if(approveTx){
              console.log("waiting on approve to finish...")
              let approveTxResult = await approveTx;
              console.log("approveTxResult:",approveTxResult)
            }
            let swapTxResult = await swapTx;
            console.log("swapTxResult:",swapTxResult)
          })}
  
          <Divider> Liquidity ({liquidity?formatEther(liquidity):"none"}):</Divider>
  
          {rowForm("deposit","📥",async (value)=>{
            let valueInEther = parseEther(""+value)
            let valuePlusExtra = parseEther(""+value*1.03)
            console.log("valuePlusExtra",valuePlusExtra)
            let allowance =  await readContracts.AfricaToken.allowance(address,readContracts.ADEX.address)
            console.log("allowance",allowance)
            let nonce = await userProvider.getTransactionCount(address)
            //let nonce = useNonce(mainnetProvider,contractAddress)
            console.log("nonce",nonce)
            let approveTx
            if(allowance.lt(valuePlusExtra)){
              approveTx = tx( writeContracts.AfricaToken.approve(readContracts.ADEX.address,valuePlusExtra,{gasLimit:200000 , nonce:nonce++}) )
              //approveTx = tx( writeContracts.AfricaToken.approve(readContracts.ADEX.address,valuePlusExtra,{gasLimit:200000 }) )
              console.log("approve tx is in, not waiting on it though...",approveTx)
            }
            let depositTx = tx( writeContracts.ADEX["deposit"]({value: valueInEther, gasLimit:200000, nonce:nonce++}) )
            //let depositTx = tx( writeContracts.ADEX["deposit"]({value: valueInEther, gasLimit:200000}) )
            if(approveTx){
              console.log("waiting on approve to finish...")
              let approveTxResult = await approveTx;
              console.log("approveTxResult:",approveTxResult)
            }
            let depositTxResult = await depositTx;
            console.log("depositTxResult:",depositTxResult)
          })}
  
          {rowForm("withdraw","💰",async (value)=>{
            let valueInEther = parseEther(""+value)
            let withdrawTxResult = await tx( writeContracts.ADEX["withdraw"](valueInEther) )
            console.log("withdrawTxResult:",withdrawTxResult)
          })}
  
        </div>
      )
    }
  
    let addingEth = 0
  
    return (
      <div>
        <div style={{position:"fixed",right:100,top:50,padding:10}}>
        <Curve
          addingEth={values && values["BNBToToken"]?values["BNBToToken"]:0}
          addingToken={values && values["tokenToBNB"]?values["tokenToBNB"]:0}
          ethReserve={ethBalanceFloat}
          tokenReserve={tokenBalanceFloat}
          bnbFinal={contractBalanceFloat}
          width={500} height={500}
        />
        </div>
        <Card
          title={(
            <div>
              <Address value={contractAddress} />
             
              <div style={{float:'right',fontSize:24}}>
              
               {parseFloat((contractBalanceFloat)).toFixed(4)} ⚖️
              
                <TokenBalance name={tokenName} img={"🌍"} address={contractAddress} contracts={readContracts} />
  
              </div>
            </div>
          )}
          size="large"
          style={{ width: 550, marginTop: 25 }}
          loading={false}>
          { display }
        </Card>
  
      </div>
    );
  
  }
  export default ADEX;