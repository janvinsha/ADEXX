import React, { useMemo, useState } from "react";
import {useSelector } from "react-redux";
import styled from "styled-components";
import { Card ,Row,Col} from "antd";
import { useContractLoader, useContractExistsAtAddress } from "../../hooks";
import Account from "../Account";
import DisplayVariable from "./DisplayVariable";
import FunctionForm from "./FunctionForm";
import  TokenBalance from "../../components/TokenBalance"
import adexIcon from "../../adex.ico"
import { pageAnimation } from "../../animations";
import { motion} from "framer-motion";

const noContractDisplay = (
  <div style={{marginLeft:"auto",marginRight:"auto",padding:"1rem 2rem"}}>
     Fetching...Contracts..From Blockchain ⏳ {" "}
  </div>
);

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

const Contract=({ customContract, account, gasPrice, signer, provider, name, showVar,showFunction, price, blockExplorer, readContracts, }) =>{

  const contractAddress = readContracts?readContracts.ADEX.address:""
  const tokenAddress = readContracts?readContracts.AfricaToken.address:""
  const isDarkMode=useSelector((state)=>state.isDark)
  const contracts = useContractLoader(provider);
  let contract
  if(!customContract){
    contract = contracts ? contracts[name] : "";
  }else{
    contract = customContract
  }

  const address = contract ? contract.address : "";
  const contractIsDeployed = useContractExistsAtAddress(provider, address);

  const displayedContractFunctions = useMemo(
    () =>
      contract
        ? Object.values(contract.interface.functions).filter(
            fn => fn.type === "function" && !(showFunction && showFunction.indexOf(fn.name) < 0),
          )
        : [],
    [contract, showFunction],
  );
  const displayedContractVariable = useMemo(
    () =>
      contract
        ? Object.values(contract.interface.functions).filter(
            fn => fn.type === "function" && !(showVar && showVar.indexOf(fn.name) < 0),
          )
        : [],
    [contract, showVar],
  );

  const [refreshRequired, triggerRefresh] = useState(false)
  const contractDisplay = displayedContractFunctions.map(fn => {
   
    // If there are inputs, display a form to allow users to provide these
    if (!isQueryable(fn)) {
    return (
      <FunctionForm
        key={"FF" + fn.name}
        contractFunction={(fn.stateMutability === "view" || fn.stateMutability === "pure")?contract[fn.name]:contract.connect(signer)[fn.name]}
        functionInfo={fn}
        provider={provider}
        gasPrice={gasPrice}
        triggerRefresh={triggerRefresh}
      />
    );
  }});
  const variables= displayedContractVariable.map(fn => {
    if (isQueryable(fn)) {
      // If there are no inputs, just display return value
      return <DisplayVariable key={fn.name} contractFunction={contract[fn.name]} functionInfo={fn} refreshRequired={refreshRequired} triggerRefresh={triggerRefresh}/>;
    }})

    const contractName = "ADEX";
const tokenName = "AfricaToken";
  return (
    <StyledContract isDarkMode={isDarkMode}  variants={pageAnimation} initial="hidden" animate="show" exit="exit">
        <div
    className="contract"
        // loading={contractDisplay && contractDisplay.length <= 0}
 >
        <div className="title">
      
      <span className="subtitle"> {name} Contract</span>
            <span   className="subtitle2">
              <Account
                address={address}
                localProvider={provider}
                injectedProvider={provider}
                mainnetProvider={provider}
                price={price}
                blockExplorer={blockExplorer}
              />
            </span>
        </div>
        
        {contractIsDeployed ?
        <StyledDisplay isDarkMode={isDarkMode}>
       <div className="variables">
         {variables}</div> 
         <span className="conTitle">Functions</span>
    <div className="contractDis">
    {contractDisplay}</div> 
     </StyledDisplay>
: noContractDisplay}
        </div>
  

    </StyledContract>
  );
}


const StyledDisplay=styled.div`
  display:flex;
  flex-flow:column wrap;
  padding:0rem 2rem;
  
.variables{
  display:flex;
  flex-flow:row wrap;
  justify-content:space-between;
  padding:0rem 1rem;
  @media screen and (max-width: 900px) {
    font-size:1.2rem
  }
}
.contractDis{
  display:flex;
  flex-flow:row wrap;
  border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
  border-radius:5px;
  padding:1rem
}
.conTitle{
  font-size:1.4rem;
  margin-left:auto;
  margin-right:auto;
  padding:0.3rem 0rem;
}
`

const StyledContract=styled(motion.div)`
padding:1rem;

@media screen and (max-width: 900px) {
  padding-bottom:6rem
  }
.contract{
  background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
  color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
  border-radius:10px;
  padding-bottom:5rem;
.title{
  display:flex;
  align-items: center;
  justify-content:space-between;
  padding:0.6rem 1.4rem;
  .subtitle{
    font-size:1.3rem;
    @media screen and (max-width: 900px) {
      font-size:1.4rem;
    }
  }
  .subtitle2{
    display:flex;
  align-items: center;
  }
}
}

`
export default Contract;