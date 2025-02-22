pragma solidity ^0.6.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./GovernanceToken.sol";

import "hardhat/console.sol";

contract ADEX {

  using SafeMath for uint256;
  IERC20 token;

  uint256 public totalLiquidity;
  mapping (address => uint256) public liquidity;
  GovernanceToken public governanceToken;

  event NewTokenToBNB(
         uint256 tokenReserve,
         uint256 bnbBought        
     );
 
 constructor(address token_addr,address _governance) public {
    token = IERC20(token_addr);
    governanceToken = GovernanceToken(_governance);
  }

  function init(uint256 tokens) public payable returns (uint256) {
  require(totalLiquidity==0,"ADEX:init - already has liquidity");
  totalLiquidity = address(this).balance;
  console.log(totalLiquidity,"Total Liquidity");
      
  liquidity[msg.sender] = totalLiquidity;
  require(token.transferFrom(msg.sender, address(this), tokens));
  return totalLiquidity;
 }
 
 function balanceOf(address account) external view returns (uint256){
   uint256 token_reserve = token.balanceOf(address(this));
   return token_reserve;
 }

 function balanceOfBNB(address account) external view returns (uint256){
   uint256 token_reserve = address(this).balance;
   return token_reserve;
 }


 function price(uint256 input_amount, uint256 input_reserve, uint256 output_reserve) public view returns (uint256) {
  uint256 input_amount_with_fee = input_amount.mul(997);
  uint256 numerator = input_amount_with_fee.mul(output_reserve);
  uint256 denominator = input_reserve.mul(1000).add(input_amount_with_fee);
  return numerator / denominator;
}

function BNBToToken() public payable returns (uint256) {
  uint256 token_reserve = token.balanceOf(address(this));
  uint256 tokens_bought = price(msg.value, address(this).balance.sub(msg.value), token_reserve);
  require(token.transfer(msg.sender, tokens_bought));
  return tokens_bought;
}
function tokenToBNB(uint256 tokens) public returns (uint256) {
  uint256 token_reserve = token.balanceOf(address(this));
  uint256 eth_bought = price(tokens, token_reserve, address(this).balance);
  msg.sender.transfer(eth_bought);
  require(token.transferFrom(msg.sender, address(this), tokens));
  emit NewTokenToBNB(token_reserve,eth_bought);
  return eth_bought;
}

function deposit() public payable returns (uint256) {
  uint256 eth_reserve = address(this).balance.sub(msg.value);
  uint256 token_reserve = token.balanceOf(address(this));
  uint256 token_amount = (msg.value.mul(token_reserve) / eth_reserve).add(1);
  uint256 liquidity_minted = msg.value.mul(totalLiquidity) / eth_reserve;
  liquidity[msg.sender] = liquidity[msg.sender].add(liquidity_minted);
  totalLiquidity = totalLiquidity.add(liquidity_minted);
  require(token.transferFrom(msg.sender, address(this), token_amount));
  return liquidity_minted;
}
function withdraw(uint256 amount) public returns (uint256, uint256) {
  uint256 token_reserve = token.balanceOf(address(this));
  uint256 eth_amount = amount.mul(address(this).balance) / totalLiquidity;
  uint256 token_amount = amount.mul(token_reserve) / totalLiquidity;
  liquidity[msg.sender] = liquidity[msg.sender].sub(eth_amount);
  totalLiquidity = totalLiquidity.sub(eth_amount);
  msg.sender.transfer(eth_amount);
  require(token.transfer(msg.sender, token_amount));
  return (eth_amount, token_amount);
}

}
