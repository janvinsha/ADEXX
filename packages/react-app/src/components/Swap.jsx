import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Space, Row, InputNumber, Card, notification,Select,  Descriptions, Typography, Button, Divider, Tooltip, Drawer, Modal } from "antd";
import "antd/dist/antd.css";
import { SettingOutlined, RetweetOutlined } from '@ant-design/icons';

import { ChainId, Token, WETH, Fetcher, Trade, TokenAmount, Percent } from '@bscswap/sdk'
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber, usePoller } from "eth-hooks";
import { TokenList, schema } from '@uniswap/token-lists'
import { abi as IBSCswapRouter02ABI } from '@bscswap/contracts/build/IBSCswapRouter02.json'
import { useDebounce } from "../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faCog,faExchangeAlt, faRetweet, faSpinner, } from "@fortawesome/free-solid-svg-icons";

const { Option } = Select;
const { Text } = Typography;


export const ROUTER_ADDRESS = '0xd954551853F55deb4Ae31407c423e67B1621424A'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)"
];

const makeCall = async (callName, contract, args, metadata={}) => {
  if(contract[callName]) {
    let result
    if(args) {
      result = await contract[callName](...args, metadata)
    } else {
      result = await contract[callName]()
    }
    return result
  } else {
    console.log('no call of that name!')
  }
}

let defaultToken = 'WBNB'
let defaultTokenOut = 'DAI'
let defaultSlippage = '0.5'
let defaultTimeLimit = 60 * 10

const tokenListToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item.symbol] = new Token(item.chainId, item.address, item.decimals, item.symbol, item.name)
     return obj
   }, {})

const  Swap=({ selectedProvider, tokenListURI })=> {
  const isDarkMode=useSelector((state)=>state.isDark)
  const [tokenIn, setTokenIn] = useState(defaultToken)
  const [tokenOut, setTokenOut] = useState(defaultTokenOut)
  const [exact, setExact] = useState()
  const [amountIn, setAmountIn] = useState()
  const [amountInMax, setAmountInMax] = useState()
  const [amountOut, setAmountOut] = useState()
  const [amountOutMin, setAmountOutMin] = useState()
  const [trades, setTrades] = useState()
  const [routerAllowance, setRouterAllowance] = useState()
  const [balanceIn, setBalanceIn] = useState()
  const [balanceOut, setBalanceOut] = useState()
  const [slippageTolerance, setSlippageTolerance] = useState(new Percent(Math.round(defaultSlippage*100).toString(), "10000"))
  const [timeLimit, setTimeLimit] = useState(defaultTimeLimit)
  const [swapping, setSwapping] = useState(false)
  const [approving, setApproving] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [swapModalVisible, setSwapModalVisible] = useState(false)

  const [tokenList, setTokenList] = useState([])

  const [tokens, setTokens] = useState()

  const [invertPrice, setInvertPrice] = useState(false)

  let blockNumber = useBlockNumber(selectedProvider, 3000)
 

  let signer = selectedProvider.getSigner()
  let routerContract = new ethers.Contract(ROUTER_ADDRESS, IBSCswapRouter02ABI, signer);
 

  let _tokenListUri = tokenListURI ? tokenListURI : 'https://tokens.bscswap.com/tokens.json'

  const debouncedAmountIn = useDebounce(amountIn, 500);
  const debouncedAmountOut = useDebounce(amountOut, 500);

  const activeChainId = (process.env.REACT_APP_NETWORK === 'testnet' ? ChainId.BSC_TESTNET : ChainId.BSC_TESTNET)
  let container = React.createRef();
  document.onclick=(e)=>{
    const element = e.target;
    if(container.current && !container.current.contains(e.target)){
      setSettingsVisible(false)
    }
  };
const handlerSettingsVisible=()=>{

  settingsVisible?setSettingsVisible(false):setSettingsVisible(true)
}

  useEffect(() => {
       const getTokenList = async () => {
      console.log(_tokenListUri)
      try {
     
      let tokenList = await fetch(_tokenListUri)     
      let tokenListJson = await tokenList.json()
      let filteredTokens = tokenListJson.tokens.filter(function (t) {
        return t.chainId === 97
      })
      
      let ethToken = WETH[activeChainId]
      ethToken.name = 'WrappedBNB'
      ethToken.symbol = 'WBNB'
      ethToken.logoURI = "https://tokens.bscswap.com/images/0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd.png"
      let _tokenList = [ ...filteredTokens]
      setTokenList(_tokenList)
      let _tokens = tokenListToObject(_tokenList)
      setTokens(_tokens)
    } catch (e) {
      console.log(e)
    }
    }
    getTokenList()
  },[tokenListURI])

  const getTrades = async () => {
    if(tokenIn && tokenOut && (amountIn || amountOut)) {

    let pairs = (arr) => arr.map( (v, i) => arr.slice(i + 1).map(w => [v,w]) ).flat();

    let baseTokens = tokenList.filter(function (t) {
      return ['BTCB', 'BUSD', 'USDT', 'ETH', 'EOS', tokenIn, tokenOut].includes(t.symbol)
    }).map((el) => {
      return new Token(el.chainId, el.address, el.decimals, el.symbol, el.name)
    })

    let listOfPairwiseTokens = pairs(baseTokens)

    const getPairs = async (list) => {

      let listOfPromises = list.map(item => Fetcher.fetchPairData(item[0], item[1], selectedProvider))
      return Promise.all(listOfPromises.map(p => p.catch(() => undefined)));
    }

    let listOfPairs = await getPairs(listOfPairwiseTokens)

    let bestTrade

    if(exact === 'in') {
      setAmountInMax()
      bestTrade = Trade.bestTradeExactIn(
      listOfPairs.filter(item => item),
      new TokenAmount(tokens[tokenIn], parseUnits(amountIn.toString(), tokens[tokenIn].decimals)),
      tokens[tokenOut], { maxNumResults: 3, maxHops: 1 })
      if(bestTrade[0]) {
        setAmountOut(bestTrade[0].outputAmount.toSignificant(6))
      } else { setAmountOut() }
    } else if (exact === 'out') {
      setAmountOutMin()
      bestTrade = Trade.bestTradeExactOut(
      listOfPairs.filter(item => item),
      tokens[tokenIn],
      new TokenAmount(tokens[tokenOut], parseUnits(amountOut.toString(), tokens[tokenOut].decimals)),
     { maxNumResults: 3, maxHops: 1 })
      if(bestTrade[0]) {
        setAmountIn(bestTrade[0].inputAmount.toSignificant(6))
      } else { setAmountIn() }
    }

    setTrades(bestTrade)

    console.log(bestTrade)

  }
  }

  useEffect(() => {
      getTrades()
  },[tokenIn, tokenOut, debouncedAmountIn, debouncedAmountOut, slippageTolerance, selectedProvider])

  useEffect(() => {
    if(trades && trades[0]) {
      if(exact === 'in') {
        setAmountOutMin(trades[0].minimumAmountOut(slippageTolerance))
      } else if (exact === 'out') {
        setAmountInMax(trades[0].maximumAmountIn(slippageTolerance))
      }
    }
  }, [slippageTolerance, amountIn, amountOut, trades])

  const getBalance = async (_token, _account, _contract) => {

    let newBalance
    if(_token === 'WBNB') {
      newBalance = await selectedProvider.getBalance(_account)
    } else {
      newBalance = await makeCall('balanceOf', _contract, [_account])
      newBalance = await makeCall('balanceOf', _contract, [_account])
      
    }
    return newBalance
  }

  const getAccountInfo = async () => {

    if(tokens) {

      let accountList = await selectedProvider.listAccounts();

      if(tokenIn) {
        let tempContractIn = new ethers.Contract(tokens[tokenIn].address, erc20Abi, selectedProvider);
        let newBalanceIn = await getBalance(tokenIn, accountList[0], tempContractIn)
        setBalanceIn(newBalanceIn)

        let allowance

        if(tokenIn === 'WBNB') {
          setRouterAllowance()
        } else {
          allowance = await makeCall('allowance',tempContractIn,[accountList[0],ROUTER_ADDRESS])
          setRouterAllowance(allowance)
        }
        }

      if(tokenOut) {
        let tempContractOut = new ethers.Contract(tokens[tokenOut].address, erc20Abi, selectedProvider);
        let newBalanceOut = await getBalance(tokenOut, accountList[0], tempContractOut)
        setBalanceOut(newBalanceOut)
      }
    }
  }

  usePoller(getAccountInfo, 6000)

  let route = trades ? (trades.length > 0 ? trades[0].route.path.map(function(item) {
    return item['symbol'];
  }) : []) : []

  const updateRouterAllowance = async (newAllowance) => {
    setApproving(true)
    try {
    let tempContract = new ethers.Contract(tokens[tokenIn].address, erc20Abi, signer);
    let result = await makeCall('approve', tempContract, [ROUTER_ADDRESS, newAllowance])
    console.log(result)
    setApproving(false)
    return true
  } catch(e) {
      notification.open({
        message: 'Approval unsuccessful',
        description:
        `Error: ${e.message}`,
      });
    }
  }

  const approveRouter = async () => {
    let approvalAmount = exact === 'in' ? ethers.utils.hexlify(parseUnits(amountIn.toString(), tokens[tokenIn].decimals)) : amountInMax.raw.toString()
    console.log(approvalAmount)
    let approval = updateRouterAllowance(approvalAmount)
    if(approval) {
      notification.open({
        message: 'Token transfer approved',
        description:
        `You can now swap up to ${amountIn} ${tokenIn}`,
      });
    }
  }

  const removeRouterAllowance = async () => {
    let approvalAmount = ethers.utils.hexlify(0)
    console.log(approvalAmount)
    let removal = updateRouterAllowance(approvalAmount)
    if(removal) {
      notification.open({
        message: 'Token approval removed',
        description:
        `The router is no longer approved for ${tokenIn}`,
      });
    }
  }

  const executeSwap = async () => {
    setSwapping(true)
    try {
      let args
      let metadata = {}

      let call
      let deadline = Math.floor(Date.now() / 1000) + timeLimit
      let path = trades[0].route.path.map(function(item) {
        return item['address'];
      })
      console.log(path)
      let accountList = await selectedProvider.listAccounts()
      let address = accountList[0]

      if (exact === 'in') {
        let _amountIn = ethers.utils.hexlify(parseUnits(amountIn.toString(), tokens[tokenIn].decimals))
        let _amountOutMin = ethers.utils.hexlify(ethers.BigNumber.from(amountOutMin.raw.toString()))
        if (tokenIn === 'WBNB') {
          call = 'swapExactBNBForTokens'
          args = [_amountOutMin, path, address, deadline]
          metadata['value'] = _amountIn
        } else {
          call = tokenOut === 'ETH' ? 'swapExactTokensForBNB' : 'swapExactTokensForTokens'
          args = [_amountIn, _amountOutMin, path, address, deadline]
        }
      } else if (exact === 'out') {
        let _amountOut = ethers.utils.hexlify(parseUnits(amountOut.toString(), tokens[tokenOut].decimals))
        let _amountInMax = ethers.utils.hexlify(ethers.BigNumber.from(amountInMax.raw.toString()))
        if (tokenIn === 'WBNB') {
          call = 'swapBNBForExactTokens'
          args = [_amountOut, path, address, deadline]
          metadata['value'] = _amountInMax
        } else {
          call = tokenOut === 'ETH' ? 'swapTokensForExactBNB' : 'swapTokensForExactTokens'
          args = [_amountOut, _amountInMax, path, address, deadline]
        }
      }
      console.log(call, args, metadata)
      let result = await makeCall(call, routerContract, args, metadata)
      console.log(result)
      notification.open({
        message: 'Swap complete 🦄',
        description:
        <><Text>{`Swapped ${tokenIn} for ${tokenOut}, transaction: `}</Text><Text copyable>{result.hash}</Text></>,
      });
      setSwapping(false)
  } catch (e) {
    console.log(e)
    setSwapping(false)
    notification.open({
      message: 'Swap unsuccessful',
      description:
      `Error: ${e.message}`,
    });
  }
  }

  const showSwapModal = () => {
    setSwapModalVisible(true);
  };

  const handleSwapModalOk = () => {
    setSwapModalVisible(false);
    executeSwap()
  };

  const handleSwapModalCancel = () => {
    setSwapModalVisible(false);
  };

  let insufficientBalance = balanceIn ? parseFloat(formatUnits(balanceIn,tokens[tokenIn].decimals)) < amountIn : null
  let inputIsToken = tokenIn !== 'WBNB'
  let insufficientAllowance = !inputIsToken ? false : routerAllowance ? parseFloat(formatUnits(routerAllowance,tokens[tokenIn].decimals)) < amountIn : null
  let formattedBalanceIn = balanceIn?parseFloat(formatUnits(balanceIn,tokens[tokenIn].decimals)).toPrecision(6):null
  let formattedBalanceOut = balanceOut?parseFloat(formatUnits(balanceOut,tokens[tokenOut].decimals)).toPrecision(6):null

  let metaIn = tokens && tokenList && tokenIn ? tokenList.filter(function (t) {
    return t.address === tokens[tokenIn].address
  })[0] : null
  let metaOut = tokens && tokenList && tokenOut ? tokenList.filter(function (t) {
    return t.address === tokens[tokenOut].address
    })[0] : null

  const cleanIpfsURI = (uri) => {
    try {
    return (uri).replace('ipfs://','https://ipfs.io/ipfs/')
  } catch(e) {
    console.log(e, uri)
    return uri
  }
  }

  let logoIn = metaIn?cleanIpfsURI(metaIn.logoURI):null
  let logoOut = metaOut?cleanIpfsURI(metaOut.logoURI):null

  let rawPrice = trades&&trades[0]?trades[0].executionPrice:null
  let price = rawPrice?rawPrice.toSignificant(7):null
  let priceDescription = rawPrice ? (invertPrice ? `${(rawPrice.invert()).toSignificant(7)} ${tokenIn} per ${tokenOut}` : `${price} ${tokenOut} per ${tokenIn}`) : null

  let priceWidget = (
    <Space>
    <Text type="secondary">{priceDescription}</Text>
    <Button type="text" onClick={() => {setInvertPrice(!invertPrice)}}><RetweetOutlined /></Button>
    </Space>
  )

  let swapModal = (
    <Modal title="Confirm swap" visible={swapModalVisible} onOk={handleSwapModalOk} onCancel={handleSwapModalCancel}>
      <Row><Space><img src={logoIn} alt={tokenIn} width='30'/>{amountIn}{tokenIn}</Space></Row>
      <Row justify='center' align='middle' style={{width:30}}><span>↓</span></Row>
      <Row><Space><img src={logoOut} alt={tokenOut} width='30'/>{amountOut}{tokenOut}</Space></Row>
      <Divider/>
      <Row>{priceWidget}</Row>
      <Row>{trades&&((amountOutMin && exact==='in') || (amountInMax && exact==='out'))?(exact==='in'?`Output is estimated. You will receive at least ${amountOutMin.toSignificant(6)} ${tokenOut} or the transaction will revert.`:`Input is estimated. You will sell at most ${amountInMax.toSignificant(6)} ${tokenIn} or the transaction will revert.`):null}</Row>
    </Modal>
  )
const handleReverse=()=>{

}
  return (
    <StyledSwap  isDarkMode={isDarkMode} settingsVisible={settingsVisible}>
      <div className="swap">
      <span className="settings"  ref={container}>
    <div className="title">
      <span>Swap</span> <button type="text" onClick={handlerSettingsVisible}>
         <FontAwesomeIcon icon={faCog} color={isDarkMode?"whitesmoke":"gray"}/></button></div>
      <div className="hover-down">
      <div className="col">
      <span >blockNumber: {blockNumber}</span>
      <span >routerAllowance: <Space>{routerAllowance?formatUnits(routerAllowance,tokens[tokenIn].decimals):null}{routerAllowance>0?<Button size="medium" onClick={removeRouterAllowance}>Remove Allowance</Button>:null}</Space></span>
      <span >route: {route.join("->")}</span>
      <span >exact:{exact}</span>
      <span >bestPrice: {trades ? (trades.length > 0 ? trades[0].executionPrice.toSignificant(6) : null) : null}</span>
      <span >nextMidPrice: {trades ? (trades.length > 0 ? trades[0].nextMidPrice.toSignificant(6) : null) : null}</span>
      <span >priceImpact: {trades ? (trades.length > 0 ? trades[0].priceImpact.toSignificant(6) : null) : null}</span>
      </div>
    <div className="col">
      <span >slippageTolerance: <input type="number"
        defaultValue={defaultSlippage}
        min={0}
        max={100}
        precision={2}
        onChange={(e) => {
         let slippagePercent = new Percent(Math.round(e.target.value*100).toString(), "10000")
         setSlippageTolerance(slippagePercent)
       }}
      />%</span>
      <span >amountInMax:{amountInMax?amountInMax.toExact():null}</span>
      <span >amountOutMin: {amountOutMin?amountOutMin.toExact():null}</span>
      <span >timeLimitInSeconds: <input type="number"
              min={0}
              max={3600}
              defaultValue={defaultTimeLimit}
              onChange={(e) => {
              setTimeLimit(e.target.value)
             }}
            /></span>
    </div>

    </div>
      </span>

    <StyledMainSwap isDarkMode={isDarkMode}>
    <div className="inputDiv">
      <div className="top">
       <span>From{exact==='out' && tokenIn && tokenOut?' (estimate)':''}</span>
    <span>Balance: {formattedBalanceIn}</span>
    </div>
   <div className="inputGroup">
   <input type="number" placeholder="0.00"
     value={amountIn} onChange={(e) => {
      setAmountIn(e.target.value)
        setAmountOut()
        setTrades()
        setExact('in')
      }}/>
       <button  type="link" onClick={() => {
      setAmountOut()
      setAmountIn(formatUnits(balanceIn,tokens[tokenIn].decimals))
      setAmountOutMin()
      setAmountInMax()
      setExact('in')
    }}>max</button>  
        <StyledSelect isDarkMode={isDarkMode}
  dropdownStyle={isDarkMode?{ background:"#2c3961",color:"whitesmoke"}:{ background:"#f3f3f3",color:"gray"}}
        value={tokenIn} defaultValue={defaultToken} onChange={(value) => {
        console.log(value)
        if(value===tokenOut) {
          console.log('switch!', tokenIn)
          setTokenOut(tokenIn)
          setAmountOut(amountIn)
          setBalanceOut(balanceIn)
        }
        setTokenIn(value)
        setTrades()
        setAmountIn()
        setExact('out')
        setBalanceIn()
      }} 
      
      showSearch
      >
      {tokenList.map(token => (
        <Option key={token.symbol} value={token.symbol} className="option">
          <img src={token.logoURI} width="12" alt={tokenOut}/> {token.symbol}
         </Option>
      ))}
      </StyledSelect>
   </div>

 </div>
  
 <span className="reverse">
   <button onclick={handleReverse}> 
   <FontAwesomeIcon rotation={90} icon={faExchangeAlt} color={isDarkMode?"whitesmoke":"gray"}/>
   </button>
   </span>

    <div className="inputDiv">
    <div className="top">
    <span>To{exact==='in' && tokenIn && tokenOut?' (estimate)':''}</span>
    <span>Balance:{formattedBalanceOut}</span>
    </div>
    
    <div className="inputGroup">

      <input type="number"  placeholder="0.00"
       value={amountOut} onChange={(e) => {
        setAmountOut(e.target.value)
        setAmountIn()
        setTrades()
        setExact('out')
      }}/>
       
       <StyledSelect isDarkMode={isDarkMode} 
         dropdownStyle={{ background:isDarkMode?"#2c3961":"#f3f3f3",color:isDarkMode?"whitesmoke":"gray",}}
        onChange={(value) => {
        console.log(value, tokenIn, tokenOut)
        if(value===tokenIn) {
          console.log('switch!', tokenOut)
          setTokenIn(tokenOut)
          setAmountIn(amountOut)
          setBalanceIn(balanceOut)
        }
        setTokenOut(value)
        setExact('in')
        setAmountOut()
        setTrades()
        setBalanceOut()
      }} 
      defaultValue={defaultTokenOut}
      placeholder="Select"
      showSearch
  >
     {tokenList.map(token => (
        <Option key={token.symbol} value={token.symbol} className="option">
          <img src={token.logoURI} width="12"  alt={tokenOut}/> {token.symbol}
         </Option>
      ))}
      </StyledSelect>
 
    </div>

    </div>
    <span className="priceDes">
      {priceDescription?
      <span>
      {priceDescription}
      <button type="text" onClick={() => {setInvertPrice(!invertPrice)}}>
        <FontAwesomeIcon icon={faRetweet} color={isDarkMode?"whitesmoke":"gray"}/></button>
      </span>
      :null}
    </span>
    <div className="buttonDiv">
      {inputIsToken?<button size="medium"  disabled={!insufficientAllowance} onClick={approveRouter}>
      {approving&& <FontAwesomeIcon  spin={true} icon={faCircleNotch} color={isDarkMode?"whitesmoke":"whitesmoke"}/>}
        {(!insufficientAllowance&&amountIn&&amountOut)?'Approved':'Approve'}
        </button>:null}
    {  <button color={isDarkMode?"whitesmoke":"gray"}
      disabled={insufficientAllowance || insufficientBalance || !amountIn || !amountOut} onClick={showSwapModal}
      >
        {swapping&& <FontAwesomeIcon  spin={true} icon={faCircleNotch} color={isDarkMode?"whitesmoke":"whitesmoke"}/>}
        {insufficientBalance?' Insufficient balance':' Swap!'}
      </button>}
      {swapModal}
    </div>
  
    </StyledMainSwap>
    </div>
    </StyledSwap>
  )

}


const StyledSelect=styled(Select)`
 margin:0;
 width:6.5rem;

 .ant-select-selection.ant-select-selection--single
> div > div > div > div + div {
   margin-top: -5px;
   padding: 4px 5px 5px 14px !important;
   background-color:blue !important;
}
 @media screen and (max-width: 900px) {
      width:8rem;
      margin:0;
      overflow:hidden;
      &:focus{
        width:8rem;
      }
      img{
     margin-left:0.1rem;
      }
    }
`
const StyledSwap=styled.div`
width:100%;
margin:none;
overflow:hidden;
.swap{
background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
width:30rem;
min-height:25rem;
border-radius:20px;
margin-top:2.5rem;
margin-left:auto;
margin-right:auto;
display:flex;
flex-flow:column wrap;
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
@media screen and (max-width: 900px) {
width:90%;
min-height:34rem;
margin-left:auto;
margin-right:auto;
overflow:hidden;
}
.settings{
        padding:1rem;
        position: relative;

  button{
    background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
    padding:0.2rem 0.5rem;
    @media screen and (max-width: 900px) {
      font-size:1.4rem
    }
  }
.title{
  display:flex;
  flex-flow:row wrap;
  justify-content:space-between;
  align-items: center;
  padding:0rem 0.5rem;
  @media screen and (max-width: 900px) {
    padding:0rem 0.7rem;
    }
  span{
    font-size:1.2rem;
    @media screen and (max-width: 900px) {
      font-size:1.6rem
    }
  }
}
.hover-down{
  @media screen and (max-width: 900px) {
    right: 3%;
    top: 87%;
    }

          display: ${({settingsVisible})=>settingsVisible?"flex":"none"};
          flex-flow: row wrap;
          position: absolute;
          top: 88%;
          right: 2%;
          background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
          border-radius:0.5rem;
          z-index: 1;
          margin: 0rem;
        padding:0.4rem;
          .col{
            display: flex;
          flex-flow: column wrap;
          input{
            border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
            background:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
            color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
            border-radius:5px;
            outline:none;
            padding:0.15rem 0.4rem;
            &:focus{
              outline:none;
            }
          }
          a ,span{
            @media screen and (max-width: 900px) {
              font-size:1.2rem;
              width: 15rem;
    }
            display: inline;
            color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
            padding: 0.4rem 0rem 0.4rem 0.6rem;
            font-size:0.86rem;
            width: 12rem;
            &:hover {
              color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
            }
          }
          }
  
}
      }}
`

const StyledMainSwap=styled.div`
display:flex;
flex-flow:column wrap;
width:100%;
padding:0rem 1rem;
.inputDiv{
  display:flex;
flex-flow:column wrap;
border:1px solid ${({isDarkMode})=>isDarkMode?"#222a3f":"#e8e9ec"};
border-radius:5px;
padding:1rem;
@media screen and (max-width: 900px) {
  padding:1.3rem; 
  overflow:hidden;
    }
.top{
  display:flex;
  flex-flow:row wrap;
  justify-content:space-between;
  padding:0.2rem 0rem;
  @media screen and (max-width: 900px) {
    padding:0.5rem 0rem;
    }
}

.inputGroup{
  display:flex;
flex-flow:row wrap;
align-items: center;
justify-content:space-between;
width:100%;
img{
      width:1rem;
    }
@media screen and (max-width: 900px) {
    padding:0.2rem 0.6rem;
    overflow:hidden;
    img{
      width:0.75rem;
    }
    }
button{
  background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
  color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
  padding:0.1rem 0.4rem;
  @media screen and (max-width: 900px) {
    padding:0.2rem 0.6rem;
    }
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input{
  background-color:${({isDarkMode})=>isDarkMode?"#020c1f":"white"};
color:${({isDarkMode})=>isDarkMode?"whitesmoke":"black"};
outline:none;
width:15rem;
@media screen and (max-width: 900px) {
  width:14rem;
    }
-moz-appearance:textfield;
&::placeholder{
  color:${({isDarkMode})=>isDarkMode?"#e0e0e0":"#7e7a7a"};

}
}
select{
  @media screen and (max-width: 900px) {
  width:16rem;
    }
}
}

}
.buttonDiv{
  display:flex;
  flex-flow:column wrap;
  justify-content:center;
  align-items:center;
  padding:0.7rem;
  button{
    background:${({isDarkMode})=>isDarkMode?"#33426e":"rgba(0,180,197,1)"};
   color:${({isDarkMode})=>isDarkMode?"whitesmoke":"whitesmoke"};
   padding:0.4rem 0.8rem;
   margin:0.2rem;
   @media screen and (max-width: 900px) {
    margin:0.4rem;
    padding:0.6rem 1rem;
    font-size:1.4rem;
    }
   &:disabled{
    background:#adaaaa;
   }
  }
}
.priceDes{
  margin-left:auto;
  margin-right:auto;
  margin-top:0.7rem;
  color:${({isDarkMode})=>isDarkMode?"whitesmoke":"gray"};
  @media screen and (max-width: 900px) {
    margin-top:0.9rem;
    }
  button{
    background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
    padding:0.1rem 0.3rem;
    font-size:0.8rem;
    @media screen and (max-width: 900px) {
      padding:0.2rem 0.35rem;
      font-size:1rem;
    }
  }
}
.reverse{
  margin-left:auto;
  margin-right:auto;
  padding:0.4rem;
  @media screen and (max-width: 900px) {
    padding:0.6rem;
    }
  button{
    background:${({isDarkMode})=>isDarkMode?"#2c3961":"#f3f3f3"};
    padding:0.2rem 0.5rem;
    @media screen and (max-width: 900px) {
      padding:0.3rem 0.6rem;
      font-size:1.2rem;
    }
  }
}
`
export default Swap;