pragma solidity >=0.6.6;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AfricaToken is ERC20 {
  constructor() ERC20("AfricaToken","🌍") public {
       console.log(msg.sender,"Owner Address");
      _mint(msg.sender,1000*10**18);
  }
}