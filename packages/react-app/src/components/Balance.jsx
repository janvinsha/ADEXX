import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";


const Balance=(props)=> {
  const [dollarMode, setDollarMode] = useState(true);
  const [balance, setBalance] = useState();

  const getBalance = async () => {
    if (props.address && props.provider) {
      try {
        const newBalance = await props.provider.getBalance(props.address);
        setBalance(newBalance);
      } catch (e) {
        console.log(e);
      }
    }
  };

  usePoller(
    () => {
      getBalance();
    },
    props.pollTime ? props.pollTime : 1999,
  );

  let floatBalance = parseFloat("0.00");

  let usingBalance = balance;

  if (typeof props.balance !== "undefined") {
    usingBalance = props.balance;
  }
  if (typeof props.value !== "undefined") {
    usingBalance = props.value;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toFixed(4);

  const price = props.price || props.dollarMultiplier

  if (price && dollarMode) {
    displayBalance = "$" + (floatBalance * price).toFixed(2);
  }

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: props.size ? props.size : 24,
        padding: 8,
        cursor: "pointer",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {displayBalance}
    </span>
  );
}
export default Balance;