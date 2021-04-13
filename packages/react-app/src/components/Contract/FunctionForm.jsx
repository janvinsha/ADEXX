import React, { useState } from "react";
import {useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faChartArea, faPaperPlane, faThermometerThreeQuarters, faUpload } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { BigNumber } from "@ethersproject/bignumber";
import { hexlify } from "@ethersproject/bytes";
import { Row, Col, Input, Divider, Tooltip, Button } from "antd";
import { Transactor } from "../../helpers";
import {tryToDisplay} from "./utils";
import Blockies from "react-blockies";
const { utils } = require("ethers");


export default function FunctionForm({ contractFunction, functionInfo, provider, gasPrice, triggerRefresh }) {
  const isDarkMode=useSelector((state)=>state.isDark)

  const [form, setForm] = useState({});
  const [txValue, setTxValue] = useState();
  const [returnValue, setReturnValue] = useState();

  const tx = Transactor(provider, gasPrice);
  
  let inputIndex = 0;
  const inputs = functionInfo.inputs.map(input => {

    const key = functionInfo.name + "_" + input.name + "_" + input.type + "_" + inputIndex++

    let buttons = ""
    if (input.type === "bytes32") {
      buttons = (
        <Tooltip placement="right" title={"to bytes32"}>
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if (utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.parseBytes32String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.formatBytes32String(form[key]);
                setForm(formUpdate);
              }
            }}
          >
            #️⃣
            </div>
        </Tooltip>
      )
    } else if (input.type === "bytes") {
      buttons = (
        <Tooltip placement="right" title={"to hex"}>
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if (utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.toUtf8String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.hexlify(utils.toUtf8Bytes(form[key]))
                setForm(formUpdate);
              }
            }}
          >
            #️⃣
            </div>
        </Tooltip>
      )
    } else if (input.type == "uint256") {
      buttons = (
        <Tooltip placement="right" title={"* 10 ** 18"}>
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const formUpdate = { ...form };
              formUpdate[key] = utils.parseEther(form[key])
              setForm(formUpdate);
            }}
          >
            <FontAwesomeIcon icon={faCalculator}/>
            </div>
        </Tooltip>
      )
    } else if (input.type == "address") {
      const possibleAddress = form[key]&&form[key].toLowerCase&&form[key].toLowerCase().trim()
      if(possibleAddress && possibleAddress.length==42){
        buttons = (
          <Tooltip placement="right" title={"blockie"}>
            <Blockies seed={possibleAddress} scale={3} />
          </Tooltip>
        )
      }
    }




    return (
      <div style={{ margin: 2 }} key={key}>
        <StyledInInput isDarkMode={isDarkMode}
          size="large"
          placeholder={input.name ? input.type + " " + input.name : input.type}
          autoComplete="off"
          value={form[key]}
          name={key}
          onChange={(event) => {
            const formUpdate = { ...form };
            formUpdate[event.target.name] = event.target.value;
            setForm(formUpdate);
          }}
        suffix={buttons}
        />
      </div>
    )
  });

  const txValueInput = (
    <div style={{ margin: 2 }} key={"txValueInput"}>
      <StyledInInput isDarkMode={isDarkMode}
        placeholder="transaction value"
        onChange={e => setTxValue(e.target.value)}
        value={txValue}
        addonAfter={
          <div>
            <Row>
              <Col span={16}>
                <Tooltip placement="right" title={" * 10^18 "}>
                  <div
                    type="dashed"
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      let floatValue = parseFloat(txValue)
                      if(floatValue) setTxValue("" + floatValue * 10 ** 18);
                    }}
                  >
                    ✳️
                  </div>
                </Tooltip>
              </Col>
              <Col span={16}>
                <Tooltip placement="right" title={"number to hex"}>
                  <div
                    type="dashed"
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      setTxValue(BigNumber.from(txValue).toHexString());
                    }}
                  >
                    #️⃣
                </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        }
      />
    </div>
  );

  if (functionInfo.payable) {
    inputs.push(txValueInput);
  }

  const buttonIcon = functionInfo.type === "call" ? 
  <StyledButton isDarkMode={isDarkMode}>Read📡</StyledButton>
   : <StyledButton isDarkMode={isDarkMode} >Send <FontAwesomeIcon 
   icon={faPaperPlane}/></StyledButton>;
  inputs.push(
    <StyledInputInput  key={"goButton"}>
      <div className="in">
      <StyledDisInput isDarkMode={isDarkMode}
        onChange={e => setReturnValue(e.target.value)}
        defaultValue=""
        bordered={false}
        disabled={true}
        value={returnValue}
        suffix={
          <div
            type="default"
            onClick={async () => {
              let innerIndex = 0
              const args = functionInfo.inputs.map((input) => {
                const key = functionInfo.name + "_" + input.name + "_" + input.type + "_" + innerIndex++
                let value = form[key]
                if(input.baseType=="array"){
                  value = JSON.parse(value)
                } else if(input.type === "bool"){
                  if(value==='true' || value==='1' || value ==="0x1"|| value ==="0x01"|| value ==="0x0001"){
                    value = 1;
                  }else{
                    value = 0;
                  }
                }
                return value
              });

              let result
              if(functionInfo.stateMutability === "view"||functionInfo.stateMutability === "pure"){
                const returned = await contractFunction(...args)
                result = tryToDisplay(returned);
              }else{
                const overrides = {};
                if (txValue) {
                  overrides.value = txValue; // ethers.utils.parseEther()
                }
                // Uncomment this if you want to skip the gas estimation for each transaction
                // overrides.gasLimit = hexlify(1200000);


                // console.log("Running with extras",extras)
                const returned = await tx(contractFunction(...args, overrides));
                result = tryToDisplay(returned);
              }


              console.log("SETTING RESULT:", result);
              setReturnValue(result);
              triggerRefresh(true);
            }}
          >
         {buttonIcon}
          </div>
           
        }
      />
        
      </div>
    </StyledInputInput>,
  );

  return (
    <StyledInputGroup isDarkMode={isDarkMode}>
   
      <span className="label">{functionInfo.name}</span>    
      
        {inputs}
     </StyledInputGroup>
  );
}

const StyledDisInput=styled(Input)`
  width:100%;
  color:${({isDarkMode})=>isDarkMode?"#e0e0e0":"#7e7a7a"};
  border-radius:3px 0px 0px 3px;
  outline:none;
input{
  &:disabled{
    background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
  color:${({isDarkMode})=>isDarkMode?"#e0e0e0":"#7e7a7a"};
  &::placeholder{
  color:${({isDarkMode})=>isDarkMode?"#e0e0e0":"#7e7a7a"};
font-size:0.9rem
}}
  }


`
const StyledInInput=styled(Input)`
  border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
  width:100%;
  background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
  border-radius:3px 0px 0px 3px;
  outline:none;
  color:${({isDarkMode})=>isDarkMode?"#e0e0e0":"#7e7a7a"};
 input{
  background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
  color:${({isDarkMode})=>isDarkMode?"#e0e0e0":"#7e7a7a"};
  &::placeholder{

}
font-size:1rem;
}

`
const StyledInputInput=styled.div`
display:flex;
flex-flow:column wrap;
`
const StyledButton=styled.button`
  background:${({isDarkMode})=>isDarkMode?"#2c3961":"rgba(0,180,197,1)"};
    padding:0.2rem 0.5rem;
    width:5rem;
    color:${({isDarkMode})=>isDarkMode?"whitesmoke":"whitesmoke"};
    &:hover{
      color:${({isDarkMode})=>isDarkMode?"whitesmoke":"whitesmoke"};
    }
`
const StyledInputGroup=styled.div`
display:flex;
flex-flow:column wrap;
flex:25%;
padding:0.4rem 0.1rem;

@media screen and (max-width: 900px) {
  flex:100%;
  padding:0rem 1rem;
  }
.label{
font-size:1.1rem;
margin-left:auto;
margin-right:auto;
}
`