import React,{useState,useEffect} from 'react'
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {Link, useLocation} from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faEllipsisH,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { Row, Col, Button, Alert, Switch as SwitchD } from "antd";
import "antd/dist/antd.css";
import { changeTheme } from '../actions/themeActions';
import adexLogo from "../adexlogo.svg"
import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet";
import Ramp from "../components/Ramp";
import GasGauge from "../components/GasGauge";
import Faucet from "../components/Faucet";
import {NETWORK,NETWORKS } from "../constants";
import Loader from "./Loader"
const Header = ({
  address,
  userProvider,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
  localChainId ,
  selectedChainId,
  targetNetwork,
  gasPrice,
  faucetAvailable
}) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const pathname=location.pathname
  const [more,setMore]=useState(false)
  const [menu,setMenu]=useState(false)
  const [themeLoading,setThemeloading]=useState(false)
  const isDarkMode=useSelector((state)=>state.isDark)
  const handlerThemeSwitch=()=>{
setThemeloading(true)

    setTimeout(() => {
      setThemeloading(false)
      dispatch(changeTheme())
    }, 1300)
   
  }
  let container = React.createRef();
  document.onclick=(e)=>{
    const element = e.target;
    if(container.current && !container.current.contains(e.target)){
setMore(false)
    }
  };
  const handleMore=(e)=>{
    more?setMore(false):setMore(true)
  }
 
  let networkDisplay = ""
  if(localChainId && selectedChainId && localChainId != selectedChainId ){
    networkDisplay = (
      <div style={{zIndex:2, position:'absolute', right:0,top:60,padding:16}}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={(
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
            </div>
          )}
          type="error"
          closable={false}
        />
      </div>
    )
  }else{
    networkDisplay =targetNetwork.name
  }
  return (
    <StyledNav isDarkMode={isDarkMode} more={more}>
       { themeLoading&& <Loader/>}
          <div className="navbar">
            <div className="left">
            <span className="icon">
          <Link to="/"><img src={adexLogo}/></Link>
        </span>
        <Link  to="/" className={pathname==="/"?"active":""}>Swap</Link>
        <Link to="/staking" className={pathname==="/staking"?"active":""}>Staking</Link>
        <Link to="/contract" className={pathname==="/contract"?"active":""}>Contract</Link>
        <Link to="/savings" className={pathname==="/savings"?"active":""}>Savings</Link>
            </div>
     
  <div className="right">
 <span className="networkDisplay">{networkDisplay}</span>
  { !minimized &&
    <span className="display">
      {address ? <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} /> : "Connecting..."}
    </span>}
    <span className="log">
      {web3Modal&& (
   web3Modal.cachedProvider?
        <button
          onClick={logoutOfWeb3Modal}
        >
          Logout
        </button>
      : 
        <button
          onClick={loadWeb3Modal}
        >
          Connect
        </button>)
  }
  </span>

  <span className="darkMode">
   { isDarkMode?
<button onClick={handlerThemeSwitch} className="moon">
<FontAwesomeIcon icon={faMoon} color="whitesmoke"/>
</button>:
<button onClick={handlerThemeSwitch}  className="sun">
<FontAwesomeIcon icon={faSun} color="gray"/>
</button>}
  </span>
  <span className="ellipses">
    <button className="more" onClick={handleMore} ref={container}>
  <FontAwesomeIcon icon={faEllipsisH} color={isDarkMode?"whitesmoke":"gray"}/>
  </button>

  <div className="hover-down">
    { !minimized && 
  <span className="wallet"><Wallet address={address} provider={userProvider} ensProvider={mainnetProvider} price={price} /></span> 
}
    
     <span className="ramp"><Ramp price={price} address={address} networks={NETWORKS}/></span>
     <span className="gas"><GasGauge gasPrice={gasPrice} /></span>
      {faucetAvailable &&<span>
                 <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider}/></span>   
                }
       <span><Link to="/support">Support</Link></span> 
      </div>
  </span>
  </div>
      
        </div>
     <StyledMobNav more={more}  isDarkMode={isDarkMode}>
     <div className="left">
            <span className="icon">
          <Link to="/"><img src={adexLogo}/></Link>
        </span>
        <Link  to="/" className={pathname==="/"?"active":""}>Swap</Link>
        <Link to="/staking" className={pathname==="/staking"?"active":""}>Staking</Link>
        <Link to="/contract" className={pathname==="/contract"?"active":""}>Contract</Link>
        <Link to="/savings" className={pathname==="/savings"?"active":""}>Savings</Link>
            </div>
     
  <div className="right">

  </div>
  <div className="down">
    <span className="downLeft">
    <span className="log">
      {web3Modal&& (
   web3Modal.cachedProvider?
        <button
          onClick={logoutOfWeb3Modal}
        >
          Logout
        </button>
      : 
        <button
          onClick={loadWeb3Modal}
        >
          Connect
        </button>)
  }
  </span>
  { !minimized &&
    <span className="display">
      {address ? <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} /> : "Connecting..."}
    </span>}
    </span>
 <span className="downRight">
 <span className="networkDisplay">{networkDisplay}</span>
 <span className="darkMode">
   { isDarkMode?
<button onClick={handlerThemeSwitch} className="moon">
<FontAwesomeIcon icon={faMoon} color="whitesmoke"/>
</button>:
<button onClick={handlerThemeSwitch}  className="sun">
<FontAwesomeIcon icon={faSun} color="gray"/>
</button>}
  </span>
  <span className="ellipses">
    <button className="more" onClick={handleMore} ref={container}>
  <FontAwesomeIcon icon={faEllipsisH} color={isDarkMode?"whitesmoke":"gray"}/>
  </button>

  <div className="hover-down">
    { !minimized && 
  <span className="wallet"><Wallet address={address} provider={userProvider} ensProvider={mainnetProvider} price={price} /></span> 
}
    
     <span className="ramp"><Ramp price={price} address={address} networks={NETWORKS}/></span>
     <span className="gas"><GasGauge gasPrice={gasPrice} /></span>
      {faucetAvailable &&<span>
                 <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider}/></span>   
                }
       <span><Link to="/support">Support</Link></span> 
      </div>
  </span>

 </span>

  </div>
     </StyledMobNav>
    </StyledNav>
  );
}

const StyledNav=styled.div`
 transition:all 0.6s ease-in-out;

 border-bottom:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
.navbar{
  display:flex;
  flex-flow: row wrap;
    align-items: center;
    width:100%;
    @media screen and (max-width: 900px) {display:none}
    .left{
      display:flex;
      flex-flow: row wrap;
      align-items: center;
      a{
        font-size:1.1rem;
        font-weight:500;
        padding:0rem 1rem
      }
      .active{
        color:${({isDarkMode})=>isDarkMode?"#d4d3d3":"black"};
       
      }
      .icon{
        img{
          width:5.5rem;
        }
      }
    }
    .right{
      margin-left:auto;
      padding:1.1rem 0.8rem;
      display:flex;
      flex-flow:row wrap;
      align-items: center;
      .networkDisplay{
 color:${({isDarkMode})=>isDarkMode?"gold":"#9ea83c"};
 font-size:1rem;
 padding:0.2rem 0.5rem;
 background:${({isDarkMode})=>isDarkMode?"#33426e":"#f3f3f3"};
 border-radius:5px;
      }.display{
        padding:0rem 0.6rem;
        color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
      }
      .log{
        button{
          padding:0.2rem 0.5rem ;
          background:${({isDarkMode})=>isDarkMode?"#33426e":"rgba(0,180,197,1)"};
          color:${({isDarkMode})=>isDarkMode?"whitesmoke":"whitesmoke"};
          margin: 0rem 0.6rem 0rem 0rem;
        }
      }
      .darkMode{
  .sun{
    background:#f3f3f3;
    padding:0.2rem 0.5rem
  }
  .moon{
    background:#2c3961;
    padding:0.2rem 0.5rem
  }
      }
      .ellipses{
        padding-left:0.6rem;
        position: relative;
  button{
    background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
    padding:0.2rem 0.5rem;
  }

.hover-down{
  padding: 0.5rem;
          display: ${({more})=>more?"flex":"none"};
          flex-flow: column wrap;
          position: absolute;
          top: 200%;
          right: 0;
          background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
          border-radius:1rem;
          z-index: 1;
          margin: 0rem;
        
          cursor: pointer;
          a ,span{
            display: inline;
            color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
            padding: 0.4rem 0rem 0.4rem 0.6rem;
            font-size: 0.9rem;
            width: 10rem;
            &:hover {
              color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
            }
          }
  
}
      }
    }
 
}

    
`

const StyledMobNav=styled.div`
display:none;
@media screen and (max-width: 900px) {
  .down{
    width:100%;
    position:fixed;
    bottom:0;
    left:0;
    padding: 1rem 1rem;
    display:flex;
    flex-flow: row wrap;
    justify-content:space-between;
    align-items:center;
    background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
    z-index:10;
    .downRight{
      display:flex;
    flex-flow: row wrap;
    align-items:center;
 
    }.downLeft{
      display:flex;
    flex-flow: row wrap;
    align-items:center;
    }
    .networkDisplay{
      color:${({isDarkMode})=>isDarkMode?"gold":"#9ea83c"};
 background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
 border-radius:5px;
 margin-right:0.8rem;
    font-size:1.4rem;
    padding:0.3rem 0.7rem;
      }
    .display{
        padding:0rem 0.6rem;
        color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
        padding-left:0.8rem;
    font-size:1.4rem;
      }
    .ellipses{
        padding-left:0.8rem;
        position: relative;
  button{
    background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
  
    padding:0.3rem 0.7rem;
    font-size:1.4rem
  }

.hover-down{
  padding: 0.5rem;
          display: ${({more})=>more?"flex":"none"};;
          flex-flow: column wrap;
          position: absolute;
          bottom: 150%;
          right: 0;
          background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
          border-radius:1rem;
          z-index: 1;
          margin: 0rem;
          cursor: pointer;
          a ,span{
            display: inline;
            color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
            padding: 0.4rem 0rem 0.4rem 0.6rem;
            font-size: 0.9rem;
            width: 10rem;
            &:hover {
              color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
            }
          }
  
}};
    .log{
        button{
          padding:0.3rem 0.9rem ;
          background:${({isDarkMode})=>isDarkMode?"#33426e":"rgba(0,180,197,1)"};
          color:${({isDarkMode})=>isDarkMode?"whitesmoke":"whitesmoke"};
          font-size:1.4rem
        }
      }
      .darkMode{
  .sun{
    background:#f3f3f3;
    padding:0.3rem 0.7rem;
    font-size:1.4rem
  }
  .moon{
    background:#2c3961;
    padding:0.3rem 0.7rem;
    font-size:1.4rem
  }
      }
  }
  display:flex;
  flex-flow: row wrap;
    align-items: center;
    width:100%;
    .left{
      display:flex;
      flex-flow: row wrap;
      align-items: center;
      padding:1.2rem 0.8rem;
      
      a{
        font-size:1.4rem;
        font-weight:500;
        padding:0rem 1rem
      }
     
        .active{
        color:${({isDarkMode})=>isDarkMode?"#d4d3d3":"black"};
      }
      .icon{
        img{
          width:6rem;
        }
      }
    }
    .right{
  
 }}
 
`;
export default Header;