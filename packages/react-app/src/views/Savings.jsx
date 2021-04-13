import React, { useState} from 'react'
import { useDispatch, useSelector } from "react-redux";
import Blockies from 'react-blockies';
import styled from "styled-components";
import { motion} from "framer-motion";
import { pageAnimation } from "../animations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartArea, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { Card, Row, Col, List, Input, Button, Divider } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useContractLoader,useNonce, useContractReader, useEventListener, useBlockNumber, useBalance, useTokenBalance } from "../hooks"
import { Transactor } from "../helpers"
import { parseEther, formatEther,formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import Address from "../components/Address"
import TokenBalance from "../components/TokenBalance"
import { util } from 'ethers';
const { Meta } = Card;
const { utils } = require("ethers");

export default function Savings({
     address,
     userProvider,
      tx, readContracts, writeContracts}) {
            
  const isDarkMode=useSelector((state)=>state.isDark)

      
   //GetXend Finance Addresses 
    const XendContractAddress = readContracts?readContracts.Xend.address:""
    console.log("XendContractAddress",XendContractAddress)

    const FBUSDContractAddress = readContracts?readContracts.FBUSD.address:""
    console.log("FBUSDContractAddress",FBUSDContractAddress)

    const SendTestBUSDAddress = readContracts?readContracts.SendTestBUSD.address:""
    console.log("SendTestBUSDContractAddress",SendTestBUSDAddress)
   
    let derivitaveBalanceFloat = 0;
    let derivitaveTotalDepositFloat = 0;
    let derivativeTotalWithdrawnFloat = 0;
    let underlyingTotalDepositsFloat = 0;
    let underlyingTotalWithdrawnFloat = 0;
    let userBusdFloat = 0;
    //GetXend User Balances 
    let signer = userProvider.getSigner()
    const clientRecord = useContractReader(writeContracts,"Xend","getClientRecord()")
     if (typeof clientRecord === 'undefined'){
     const invalid = 'true';
     } else {    
      const derivitaveBalance =formatEther(clientRecord[1]);
      derivitaveBalanceFloat = parseFloat(derivitaveBalance).toPrecision(4)
      console.log("DB",derivitaveBalance);
      const derivitaveTotalDeposit =formatEther(clientRecord[2]);
      derivitaveTotalDepositFloat = parseFloat(derivitaveTotalDeposit).toPrecision(4)
      console.log("DTD",derivitaveTotalDeposit);
      const derivativeTotalWithdrawn =formatEther(clientRecord[3]);
      derivativeTotalWithdrawnFloat = parseFloat(derivativeTotalWithdrawn).toPrecision(4)
      console.log("DTWithdrwan",derivativeTotalWithdrawn);
      const underlyingTotalDeposits =formatEther(clientRecord[4]);
      underlyingTotalDepositsFloat = parseFloat(underlyingTotalDeposits).toPrecision(4)
      console.log("underlyingTotalDeposits",underlyingTotalDeposits);
      const underlyingTotalWithdrawn =formatEther(clientRecord[5]);
      underlyingTotalWithdrawnFloat = parseFloat(underlyingTotalWithdrawn).toPrecision(4)
      console.log("underlyingTotalWithdrawn",underlyingTotalWithdrawn);
     }

     //Get BUSD Balance in wallet 
     const clientBalanceBUSD = useContractReader(writeContracts,"FBUSD","balanceOf",[address])
     if (typeof clientBalanceBUSD === 'undefined'){
     const invalid = 'true';
     } else {    
      
      const clientBalanceBUSDWallet =formatEther(clientBalanceBUSD);
      userBusdFloat = parseFloat(clientBalanceBUSDWallet).toPrecision(4)
      console.log("clientBalanceBUSDWallet",clientBalanceBUSDWallet);
     }
   
    

    
  
    let display = []
  
    const [ form, setForm ] = useState({})
    const [ values, setValues ] = useState({})
  
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
                  <button onClick={()=>{
                         onClick(values[title])
                         let newValues = {...values}
                         newValues[title] = ""
                         setValues(newValues)
                      }}>
     {title=="Personal Savings Deposit"?"Deposit":"Withdraw"}
                    </button>
                </span>
            </StyledInputGroup>
      )
    }
  
  
    if(readContracts && readContracts.Xend){
  
      display.push(
        <StyledDisplay isDarkMode={isDarkMode}>
  
          {/* {rowForm("BNBToToken","💸",async (value)=>{
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
          })} */}
  <div className="left">
  {rowForm("Personal Savings Deposit","📥",async (value)=>{
            let valueInEther = parseEther(""+value)
            let valuePlusExtra = parseEther(""+value*1.03)
            console.log("valuePlusExtra",valuePlusExtra)
            let nonce = await userProvider.getTransactionCount(address)
         
            console.log("nonce",nonce)
         
            let approveTx
            approveTx = tx( writeContracts.FBUSD.approve(readContracts.Xend.address,valuePlusExtra,{gasLimit:200000 , nonce:nonce++}) )
         
            if(approveTx){
              console.log("waiting on approve to finish...")
              let approveTxResult = await approveTx;
              
              let depositTx = tx( writeContracts.Xend.deposit() )
              
              let depositTxResult = await depositTx;

             
            console.log("depositTxResult:",depositTxResult)
            }
         
          })}
  </div>
          

  <div className="right">

  {rowForm("Personal Savings Withdraw","💰",async (value)=>{
            let valueInEther = parseEther(""+value)
            let withdrawTxResult = await tx( writeContracts.Xend["withdraw"](valueInEther) )
            console.log("withdrawTxResult:",withdrawTxResult)
          })}
  </div>
        
  
        </StyledDisplay>
      )
    }
  
   
  
    return (
      <StyledSavings variants={pageAnimation} initial="hidden" animate="show" exit="exit" isDarkMode={isDarkMode}>
        <div className="main">
          <span className="xendTit">Xend Finance Savings</span>
          <div className="title">
          <div className="row"> 
          <span>     Share Balance ({derivitaveTotalDepositFloat?derivitaveTotalDepositFloat:"none"})</span>
     <span> Balance+Interest ({derivitaveBalanceFloat?derivitaveBalanceFloat:"none"})</span>
          </div>
    <div className="row">
      <span>    Savings Balance ({derivativeTotalWithdrawnFloat?derivativeTotalWithdrawnFloat:"none"})</span>
<span>    Wallet Balance ({userBusdFloat?userBusdFloat:"none"})</span>
      
    </div>
          </div>
      
         
        { display }
        </div>
      </StyledSavings>
    );
  
  }

  // import React from 'react';
// import { useDispatch, useSelector } from "react-redux";
// import styled from "styled-components";
// import { motion} from "framer-motion";
// import { pageAnimation } from "../animations";


// const Savings = () => {
//     return ( <StyledSavings variants={pageAnimation} initial="hidden" animate="show" exit="exit" >
// meeeeeeeeeeeee

//     </StyledSavings> );
// }

// export default Savings;

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
flex-flow:column wrap;
input{
  border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
  width:80%;
  background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
  border-radius:3px;
  padding:0.6rem;
  outline:none;
  @media screen and (max-width: 900px) {
    width:100%;
}
}
button{
border-radius:3px;
padding:0.6rem;
margin-top:0.5rem;
background:${({isDarkMode})=>isDarkMode?"#2c3961":"rgba(0,180,197,1)"};
width:80%;
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"whitesmoke"};
@media screen and (max-width: 900px) {
  width:100%;
  font-size:1.4rem
}
}
}
`


const StyledDisplay=styled.div`

display:flex;
flex-flow: row wrap;
margin:1rem 2rem;
padding-bottom:1rem;
border-radius:5px;
border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
padding:1rem;
@media screen and (max-width: 900px) {
justify-content:center;
flex-flow: column wrap;
}
.left{
flex:50%
}
.right{
  flex:50%
}
`

const StyledSavings=styled.div`
padding:1rem ;
.main{
display:flex;
flex-flow:column wrap;
background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
border-radius:10px;
padding-bottom:4rem;
@media screen and (max-width: 900px) {
  padding-bottom:4rem;
  }
  .xendTit{
    margin-left:auto;
    margin-right:auto;
    font-size:1.4rem;
    padding:1rem 1rem;
    @media screen and (max-width: 900px) {
      font-size:1.6rem
    }
  }
  .title{
    padding:0rem 1.5rem;
    @media screen and (max-width: 900px) {
      padding:0rem 1rem;
    }
  .row{
    display:flex;
    justify-content:space-between;
    span{
    font-size:1.2rem;
    @media screen and (max-width: 900px) {
      font-size:1.5rem
    }
    }
  }
  }
}

`