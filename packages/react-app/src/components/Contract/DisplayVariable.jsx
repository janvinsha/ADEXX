/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useCallback } from "react";
import {useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartArea, faThermometerThreeQuarters } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { Row, Col, Divider } from "antd";
import {tryToDisplay} from "./utils";

const DisplayVariable = ({ contractFunction, functionInfo, refreshRequired, triggerRefresh}) => {
  const isDarkMode=useSelector((state)=>state.isDark)

  const [variable, setVariable] = useState("");

  const refresh = useCallback(async () => {
    try {
      const funcResponse = await contractFunction();
      setVariable(funcResponse);
      triggerRefresh(false);
    } catch (e) {
      console.log(e);
    }
  }, [setVariable, contractFunction, triggerRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshRequired, contractFunction]);

  return (
    <StyledDisplayVariable isDarkMode={isDarkMode}>
    
        {functionInfo.name}
       :
          {tryToDisplay(variable)}
    </StyledDisplayVariable>
  );
};

const StyledDisplayVariable=styled.div`
display:flex;
align-items: center;
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
font-size:1.2rem;
button{
  background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
    padding:0.2rem 0.5rem;
}
`
export default DisplayVariable;
