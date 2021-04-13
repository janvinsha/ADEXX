import React from "react";
//Styling and Animationimport styled from "styled-components";
import styled from "styled-components";
import { motion} from "framer-motion";
import { loader } from "../animations";
import adexIcon from "../adex.ico"

const Loader = () => {
  return(
  <StyledContainer>
   <StyledLoader variants={loader} animate="animateOne">
     <img src={adexIcon} alt=""/>
   </StyledLoader>
   </StyledContainer>
  )
};
const StyledContainer=styled(motion.div)`

display:flex;
position:fixed;
left:0;
top:0;
height:100vh;
width:100%;
align-items:center;
justify-content:center;
z-index: 20;
background: rgba(0, 0, 0, 0.2);

`
const StyledLoader = styled(motion.div)`
img{
  width:6.5rem;

  @media screen and (max-width: 900px) {
    width:6rem;

  }
}
 
`;

export default Loader;
