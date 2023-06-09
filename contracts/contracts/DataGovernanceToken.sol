// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DefiKicksDataGovernanceToken is ERC20Snapshot, Ownable {
    constructor() ERC20("DefiKicksDataGovernanceToken", "KICK") {
        _mint(msg.sender, 1000000000000000000000000);
    }

    function snapshot() public onlyOwner returns (uint256) {
        return _snapshot();
    }

    function mint(address wallet, uint256 amount) public onlyOwner {
        _mint(wallet, amount);
    }
}
