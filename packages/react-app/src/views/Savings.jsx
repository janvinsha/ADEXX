import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { motion} from "framer-motion";
import { pageAnimation } from "../animations";


const Savings = () => {
    return ( <StyledSavings variants={pageAnimation} initial="hidden" animate="show" exit="exit" >
meeeeeeeeeeeee

    </StyledSavings> );
}
 
const StyledSavings=styled(motion.div)`
`
export default Savings;