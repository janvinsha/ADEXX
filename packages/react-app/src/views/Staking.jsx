import React from 'react';
import Contract from "../components/Contract/Contract";
import ADEX from "../ADEX";
import { pageAnimation } from "../animations";
import { motion} from "framer-motion";

const Staking = ({ 
    address,
    userProvider,
    mainnetProvider,
    localProvider,
    yourLocalBalance,
    price,
    tx,
    writeContracts,
    readContracts,
    purpose,
    setPurposeEvents,
  
}) => {
    return (<motion.div className="staking" variants={pageAnimation} initial="hidden" animate="show" exit="exit" >
<ADEX
        address={address}
        userProvider={userProvider}
        mainnetProvider={mainnetProvider}
        localProvider={localProvider}
        yourLocalBalance={yourLocalBalance}
        price={price}
        tx={tx}
        writeContracts={writeContracts}
        readContracts={readContracts}
        purpose={purpose}
        setPurposeEvents={setPurposeEvents}
      />            
 
    </motion.div> );
}
 
export default Staking;