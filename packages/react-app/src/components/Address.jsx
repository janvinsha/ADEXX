import React from "react";
import Blockies from "react-blockies";
import { Typography, Skeleton } from "antd";
import { useLookupAddress } from "../hooks";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

const { Text } = Typography;

const blockExplorerLink = (address, blockExplorer) => `${blockExplorer || "https://etherscan.io/"}${"address/"}${address}`;

const Address=(props)=> {
  const isDarkMode=useSelector((state)=>state.isDark)
  const address = props.value || props.address;

  const ens = useLookupAddress(props.ensProvider, address);

  if (!address) {
    return (
      <span>
        <Skeleton avatar paragraph={{ rows: 1 }} />
      </span>
    );
  }

  let displayAddress = address.substr(0, 6);

  if (ens && ens.indexOf("0x")<0) {
    displayAddress = ens;
  } else if (props.size === "short") {
    displayAddress += "..." + address.substr(-4);
  } else if (props.size === "long") {
    displayAddress = address;
  }

  const etherscanLink = blockExplorerLink(address, props.blockExplorer);
  if (props.minimized) {
    return (
      <span style={{ verticalAlign: "middle" }}>
        <a /*style={{ color: "#222222" }}*/ target={"_blank"} href={etherscanLink} rel="noopener noreferrer">
          <Blockies seed={address.toLowerCase()} size={8} scale={2} />
        </a>
      </span>
    );
  }

  let text;
  if (props.onChange) {
    text = (
      <StyledText editable={{ onChange: props.onChange }} copyable={{ text: address }} isDarkMode={isDarkMode}
   
      >
        <a /*style={{ color: "#222222" }}*/ target={"_blank"} href={etherscanLink} rel="noopener noreferrer">
          {displayAddress}
        </a>
      </StyledText>
    );
  } else {
    text = (
      <StyledText copyable={{ text: address }} isDarkMode={isDarkMode}  >
        <a /*style={{ color: "#222222" }}*/ target={"_blank"} href={etherscanLink} rel="noopener noreferrer">
          {displayAddress}
        </a>
      </StyledText>
    );
  }

 
  return (
    <StyledAddress isDarkMode={isDarkMode}>
   <button>   
    <span>
    <Blockies seed={address.toLowerCase()} size={5} /> {text}
    </span>
     
     </button>
    </StyledAddress>
  );
}

const StyledAddress=styled.span`
button{
  border-radius: 5px;
  padding-left:0.2rem;
  background:${({isDarkMode})=>isDarkMode?"#33426e":"rgba(0,180,197,1)"};
  padding:0.2rem 0.5rem;
  @media screen and (max-width: 900px) {
    padding:0.3rem 0.5rem;
  }
}
span{
  display:flex;
  flex-flow: row wrap;
  align-items:center;
  justify-content:space-between
}
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
margin:none;
padding:none;
`
const StyledText=styled(Text)`
a{
  color:${({isDarkMode})=>isDarkMode?"whitesmoke":"whitesmoke"};
  &:hover{
    color:#e0dcdc;
  }
  @media screen and (max-width: 900px) {
    font-size:1.4rem
  }
}
`
export default Address;