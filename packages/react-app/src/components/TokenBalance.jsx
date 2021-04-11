import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";
import { useTokenBalance } from "eth-hooks";
import styled from "styled-components";

export default function TokenBalance(props) {
  const [dollarMode, setDollarMode] = useState(true);

  const tokenContract = props.contracts && props.contracts[props.name];
  const balance = useTokenBalance(tokenContract, props.address, 1777);

  let floatBalance = parseFloat("0.00");

  let usingBalance = balance;

  if (typeof props.balance !== "undefined") {
    usingBalance = props.balance;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toFixed(4);

  if (props.dollarMultiplier && dollarMode) {
    displayBalance = "$" + (floatBalance * props.dollarMultiplier).toFixed(2);
  }

  return (
    <StyledTokenBalance
      style={{
        verticalAlign: "middle",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      <img src={props.img} alt=""/>{displayBalance}
    </StyledTokenBalance>
  );
}

const StyledTokenBalance=styled.span`
display:flex;
img{
  width:1.6rem;
  height:1.6rem;
  @media screen and (max-width: 900px) {
    width:1.8rem;
  height:1.8rem;
    }
}
`