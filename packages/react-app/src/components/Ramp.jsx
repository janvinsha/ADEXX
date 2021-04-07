import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Divider } from "antd";
import { DollarCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import styled from "styled-components";

export default function Ramp(props) {
  const isDarkMode=useSelector((state)=>state.isDark)
  const [modalUp, setModalUp] = useState("down");
  const type = "default";
  let allFaucets = []
  for(let n in props.networks){
    if(props.networks[n].chainId!=31337&&props.networks[n].chainId!=1){
      allFaucets.push(
        <p key={props.networks[n].id}>
          <Button
            style={{color:props.networks[n].color}}
            type={type}
            size="medium"
            shape="round"
            onClick={() => {
              window.open(props.networks[n].faucet);
            }}
          >
            {props.networks[n].name}
          </Button>
        </p>
      )
    }
  }

  return (
    <StyledRamp  isDarkMode={isDarkMode}>
      <span
        size="medium"
        shape="round"
        onClick={() => {
          setModalUp("up");
        }}
      >
        <FontAwesomeIcon icon={faDollarSign}  color="#52c41a" />{typeof props.price == "undefined" ? 0 : props.price.toFixed(2)}
      </span>
      <Modal
   
     
        title="Buy ETH"
        visible={modalUp === "up"}
        onCancel={() => {
          setModalUp("down");
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setModalUp("down");
            }}
          >
            cancel
          </Button>,
        ]}
      >
        <p>
          <Button
            type={type}
            size="medium"
            shape="round"
            onClick={() => {
              window.open("https://pay.sendwyre.com/purchase?destCurrency=ETH&sourceAmount=25&dest=" + props.address);
            }}
          >
            <span style={{ paddingRight: 15 }} role="img">
              <span role="img" aria-label="flag-us">🇺🇸</span>
            </span>
            Wyre
          </Button>
        </p>
        <p>
          {" "}
          <Button
            type={type}
            size="medium"
            shape="round"
            onClick={() => {
              new RampInstantSDK({
                hostAppName: "ADEX",
                hostLogoUrl: "https://www.etg.solutions/wp-content/uploads/2016/07/ETG-White-500px.png",
                swapAmount: "100000000000000000", // 0.1 ETH in wei  ?
                swapAsset: "ETH",
                userAddress: props.address,
              })
                .on("*", event => console.log(event))
                .show();
            }}
          >
            <span style={{ paddingRight: 15 }} role="img">
            <span role="img" aria-label="flag-gb">🇬🇧</span>
            </span>
            Ramp
          </Button>
        </p>

        <p>
          <Button
            type={type}
            size="medium"
            shape="round"
            onClick={() => {
              window.open("https://www.coinbase.com/buy-ethereum");
            }}
          >
            <span style={{ paddingRight: 15 }} role="img" aria-label="bank">
              🏦
            </span>
            Coinbase
          </Button>
        </p>

        <Divider />

        <h2>Testnet ETH</h2>

        {allFaucets}

      </Modal>
    </StyledRamp>
  );
}

const StyledRamp=styled.div`
div{
  background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
}


`