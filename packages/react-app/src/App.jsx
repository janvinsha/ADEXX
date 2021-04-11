import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Row, Col, Button, Alert, Switch as SwitchD } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import Header from "./components/Header";
import GlobalStyles from "./components/GlobalStyles";
import Home from "./views/Home";
import Staking from "./views/Staking"
import { Transactor } from "./helpers";
import { formatEther, parseEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";
import ADEX from "./ADEX";
import Contract from "./components/Contract/Contract";
////

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS['testnet']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true

// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

//const mainnetInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
const mainnet = new JsonRpcProvider("https://mainnet.infura.io/v3/c9a2fe300dd9496f9ee19bc4cb2c4689")
const mainnetInfura = new JsonRpcProvider("https://eth-rinkeby.alchemyapi.io/v2/" + INFURA_ID)

const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);


// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;


const App=(props)=> {
  const isDarkMode=useSelector((state)=>state.isDark)
  const mainnetProvider = (mainnet && mainnet._network) ? mainnet : mainnetInfura
  if(DEBUG) console.log("🌎 mainnetProvider",mainnetProvider)

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork,mainnetProvider);
  console.log("Price Got",price)
  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork,"fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  if(DEBUG) console.log("👩‍💼 selected address:",address)

  // You can warn the user if you would like them to be on a specific network
  let localChainId = localProvider && localProvider._network && localProvider._network.chainId
  if(DEBUG) console.log("🏠 localChainId",localChainId)

  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId
  if(DEBUG) console.log("🕵🏻‍♂️ selectedChainId:",selectedChainId)

  
  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice)

 const yourLocalBalance = useBalance(localProvider, address);
  if(DEBUG) console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if(DEBUG) console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)
  if(DEBUG) console.log("📝 readContracts",readContracts)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  if(DEBUG) console.log("🔐 writeContracts",writeContracts)

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts,"YourContract", "purpose")
  console.log("🤗 purpose:",purpose)

  //📟 Listen for broadcast events
  const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);
  console.log("📟 SetPurpose events:",setPurposeEvents)

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */


  // let networkDisplay = ""
  // if(localChainId && selectedChainId && localChainId != selectedChainId ){
  //   networkDisplay = (
  //     <div style={{zIndex:2, position:'absolute', right:0,top:60,padding:16}}>
  //       <Alert
  //         message={"⚠️ Wrong Network"}
  //         description={(
  //           <div>
  //             You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
  //           </div>
  //         )}
  //         type="error"
  //         closable={false}
  //       />
  //     </div>
  //   )
  // }else{
  //   networkDisplay = (
  //     <h4>
  //       {targetNetwork.name}
  //     </h4>
  //   )
  // }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);


  let faucetHint = ""
  const faucetAvailable = localProvider && localProvider.connection && localProvider.connection.url && localProvider.connection.url.indexOf(window.location.hostname)>=0 && !process.env.REACT_APP_PROVIDER && price > 1;

  const [ faucetClicked, setFaucetClicked ] = useState( false );
  if(!faucetClicked&&localProvider&&localProvider._network&&localProvider._network.chainId==31337&&yourLocalBalance&&formatEther(yourLocalBalance)<=0){
    faucetHint = (
      <div style={{padding:16}}>
        <Button type={"primary"} onClick={()=>{
          faucetTx({
            to: address,
            value: parseEther("0.01"),
          });
          setFaucetClicked(true)
        }}>
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    )
  }
  const isDark=useSelector((state)=>state.isDark)
 
  return (
    <div className="App">
<GlobalStyles
isDark={isDark}
/>
     <Header    
      address={address}
           localProvider={localProvider}
           userProvider={userProvider}
           mainnetProvider={mainnetProvider}
           price={price}
           web3Modal={web3Modal}
           loadWeb3Modal={loadWeb3Modal}
           logoutOfWeb3Modal={logoutOfWeb3Modal}
           blockExplorer={blockExplorer}
           localChainId ={localChainId }
           selectedChainId={selectedChainId}
           targetNetwork={targetNetwork}
           gasPrice={gasPrice}
           faucetAvailable={faucetAvailable}
           />
    
        <Switch>
          <Route exact path="/">
             <Home
            selectedProvider={userProvider}
         
            />
  
          </Route>
          <Route path="/staking">
            <Staking
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
            name="AfricaToken"
            signer={userProvider.getSigner()}
            provider={localProvider}
            blockExplorer={blockExplorer}         
            />
          {/* <ADEX
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
           
          <Contract
              name="AfricaToken"
              signer={userProvider.getSigner()}
              provider={localProvider}
              mainnetProvider={mainnetProvider}
              address={address}
              blockExplorer={blockExplorer}
            />  */}
          </Route>
          <Route  exact path="/contract">
          <Contract
            name="AfricaToken"
            signer={userProvider.getSigner()}
            provider={localProvider}
            mainnetProvider={mainnetProvider}
            address={address}
            blockExplorer={blockExplorer}      
            readContracts={readContracts}
          />
          </Route>
        </Switch>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        
       <TokenBalance name={"AfricaToken"} img={"🌍"} address={address} contracts={readContracts} />
       {faucetHint}
      </div> */}

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}

    </div>
  );
}



const web3Modal= new Web3Modal({
  network: "testnet", 
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      rpc: {
        97: "https://data-seed-prebsc-1-s3.binance.org:8545",
        3: "https://ropsten.mycustomnode.com",
        100: "https://dai.poa.network",       
      }, 
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

 window.ethereum && window.ethereum.on('chainChanged', chainId => {
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

export default App;
