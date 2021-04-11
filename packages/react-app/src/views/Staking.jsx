import React from 'react';
import Contract from "../components/Contract/Contract";
import ADEX from "../ADEX";

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
    return (<div className="staking">
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
 
    </div> );
}
 
export default Staking;