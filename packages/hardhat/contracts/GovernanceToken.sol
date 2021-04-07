pragma solidity ^0.6.6;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
contract GovernanceToken is ERC20{
    constructor () ERC20('Red Diamond','RDT') public{}

    function mint(address to,uint amount) external{
        _mint(to,amount);
    }
}