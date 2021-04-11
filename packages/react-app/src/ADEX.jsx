import React, { useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { VictoryBar, VictoryChart  } from 'victory';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartArea, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Blockies from 'react-blockies';
import { Card, Row, Col, List, Input, Button, Divider } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useContractLoader,useNonce, useContractReader, useEventListener, useBlockNumber, useBalance, useTokenBalance } from "./hooks"
import { Transactor } from "./helpers"
import { parseEther, formatEther,formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import  Address from "./components/Address"
import  TokenBalance from "./components/TokenBalance"
import adexIcon from "./adex.ico"

import { util } from 'ethers';
import Curve from './Curve.js'
const { Meta } = Card;
const { utils } = require("ethers");


const contractName = "ADEX";
const tokenName = "AfricaToken";

const ADEX=({purpose, setPurposeEvents, address, mainnetProvider, userProvider,
   localProvider, yourLocalBalance, price, tx, readContracts, writeContracts})=> {
    
  const isDarkMode=useSelector((state)=>state.isDark)

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
    const [chartVisible, setChartVisible] = useState(false)
  
    const rowForm = (title,icon,onClick)=>{
      return (
        <StyledInputGroup isDarkMode={isDarkMode}>
          <span className="label">{title}</span>    
            <span className="inputgrp"> 
              <input
                onChange={(e)=>{
                  let newValues = {...values}
                  newValues[title] = e.target.value
                  setValues(newValues)
                }}
                value={values[title]}
              />
                      <button type="default" onClick={()=>{
                    onClick(values[title])
                    let newValues = {...values}
                    newValues[title] = ""
                    setValues(newValues)
                  }}><FontAwesomeIcon 
                  icon={title="BNBToToken"?faPaperPlane:title="TokenToBNB"?faPaperPlane:title="Deposit"?faPaperPlane:title="Withdraw"?faPaperPlane:faPaperPlane}/>
                   </button>
            </span>
        </StyledInputGroup>
      )
    }
  
  
    if(readContracts && readContracts.ADEX){
  
      display.push(
        <StyledDisplay isDarkMode={isDarkMode}>
  <div className="left">
    <span className="titleDi">
      Transact token
  </span>
          {rowForm("BNBToToken","💸",async (value)=>{
            let valueInEther = parseEther(""+value)
            let swapEthToTokenResult = await tx( writeContracts[contractName]["BNBToToken"]({value: valueInEther}) )
            console.log("swapEthToTokenResult:",swapEthToTokenResult)
          })}
  
          {rowForm("TokenToBNB","🔏",async (value)=>{
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
          </div>
  
  <div className="right">
    
  <span className="titleDi"> Liquidity ({liquidity?formatEther(liquidity):"none"})</span>
          {rowForm("Deposit","📥",async (value)=>{
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
  
          {rowForm("Withdraw","💰",async (value)=>{
            let valueInEther = parseEther(""+value)
            let withdrawTxResult = await tx( writeContracts.ADEX["withdraw"](valueInEther) )
            console.log("withdrawTxResult:",withdrawTxResult)
          })}
  </div>
        </StyledDisplay>
      )
    }
  
    let addingEth = 0
    let chart = React.createRef();
    document.onclick=(e)=>{
      const element = e.target;
      if(chart.current && !chart.current.contains(e.target)){
        setChartVisible(false)
      }
    };
  const handlerChartVisible=()=>{
  
    chartVisible?setChartVisible(false):setChartVisible(true)
  }
 
    return (
      <StyledAdex isDarkMode={isDarkMode} chartVisible={chartVisible}>    
      <div className="main">
        <div ref={chart} className="chart">
       <span className="icon">
         <span className="balance">
           Token Balance:<TokenBalance name={tokenName} img={adexIcon} address={address} contracts={readContracts} />
         </span>
       <button type="text" onClick={handlerChartVisible}>
          <FontAwesomeIcon icon={faChartArea} color={isDarkMode?"whitesmoke":"gray"}/>
         </button>
         </span> 
         <div className="dropdown">
         <Curve
          addingEth={values && values["BNBToToken"]?values["BNBToToken"]:null}
          addingToken={values && values["tokenToBNB"]?values["tokenToBNB"]:null}
          ethReserve={contractBalanceFloat}
          tokenReserve={tokenBalanceFloat}
          width={500} height={500}
        />
         </div>    
        </div>
        <StyledAdexCard isDarkMode={isDarkMode}>
           <div className="title">
              <Address value={contractAddress} />
             
              <span className="subTitle">
              
              ⚖️{parseFloat((contractBalanceFloat)).toFixed(4)}
              
                <TokenBalance name={tokenName} img={adexIcon} address={contractAddress} contracts={readContracts} />
  
              </span>
            </div>
          { display }
        </StyledAdexCard>
        </div>
      </StyledAdex>
    );
  
  }
const StyledInputGroup=styled.div`
display:flex;
flex-flow:column wrap;
@media screen and (max-width: 900px) {
  margin-left:auto;
  margin-right:auto;
  width:90%;
}
.label{
font-size:1rem;
padding:0.4rem 0rem;
@media screen and (max-width: 900px) {
  font-size:1.4rem;
}
}
.inputgrp{
display:flex;
padding-bottom:1rem;
input{
  border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
  width:70%;
  background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
  border-radius:3px 0px 0px 3px;
  padding:0.6rem;
  outline:none;
  @media screen and (max-width: 900px) {
    width:90%;
}
}
button{
border-radius:0px 3px 3px 0px;
padding:0.6rem;
background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
width:4rem;
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
@media screen and (max-width: 900px) {
   
}
}
}
`

const StyledDisplay=styled.div`

display:flex;
flex-flow: row wrap;
padding-bottom:1rem;
@media screen and (max-width: 900px) {
justify-content:center;
flex-flow: column wrap;
}
.titleDi{
  padding:0.8rem;
  margin-left:auto;
  margin-right:auto;
  font-size:1.2rem;
  @media screen and (max-width: 900px) {
  font-size:1.5rem;
}
}
.left{
flex:50%;
display:flex;
flex-flow: column wrap;
@media screen and (max-width: 900px) {
  flex:100%;
justify-content:center;
}
}
.right{
  flex:50%;
  display:flex;
flex-flow: column wrap;
@media screen and (max-width: 900px) {
  flex:100%;
justify-content:center;
}
}
`
const StyledAdexCard=styled.div`
border-radius:5px;
border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
width:90%;
padding:1rem;
margin-left:auto;
margin-right:auto;
.title{
  display:flex;
  align-items: center;
  justify-content:space-between;
  font-size:1.2rem;
  @media screen and (max-width: 900px) {
      font-size:1.4rem
    }
  .subTitle{
    display:flex;
  align-items: center;
  }
}
`



  const StyledAdex=styled.div`
  padding:1rem ;
  .main{
  
    .chart{
    padding:1rem;
        position: relative;
  button{
    background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
    padding:0.2rem 0.5rem;
    @media screen and (max-width: 900px) {
      font-size:1.4rem
    }
  }
  
.icon{
  display:flex;
  flex-flow:row wrap;
  justify-content:space-between;
  align-items: center;
  padding:0rem 0.5rem;
  .balance{
    display:flex;
    @media screen and (max-width: 900px) {
    
    }
  }
  @media screen and (max-width: 900px) {
    padding:0rem 0.7rem;
    }
  span{
    font-size:1.2rem;
    @media screen and (max-width: 900px) {
      font-size:1.5rem
    }
  }
}
.dropdown{
  @media screen and (max-width: 900px) {
    right: 3%;
    top: 87%;
    }
          display: ${({chartVisible})=>chartVisible?"flex":"none"};
          flex-flow: row wrap;
          position: absolute;
          top: 88%;
          right: 2%;
          background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
          border-radius:0.5rem;
          z-index: 1;
          margin: 0rem;
        padding:0.4rem;
}
      
  }

  background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
  color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
  border-radius:10px;
  padding-bottom:4rem;
  @media screen and (max-width: 900px) {
    padding-bottom:4rem;
    }
  }
  
  `
  export default ADEX;