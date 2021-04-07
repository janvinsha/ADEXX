import React from "react";
import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGasPump,
} from "@fortawesome/free-solid-svg-icons";

const GasGauge=(props)=> {
  
  return (
    <span
      onClick={() => {
        window.open("https://ethgasstation.info/");
      }}
      size="medium"
      shape="round"
    >
      <FontAwesomeIcon icon={faGasPump} color="red"/>{typeof props.gasPrice == "undefined" ? 0 : parseInt(props.gasPrice, 10) / 10 ** 9}g
     
    </span>
  );
}
export default GasGauge;