// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DefiKicksAdapterRegistry is Ownable {
    // Adapter struct
    struct Adapter {
        string name;
        string ipfsHash;
    }

    // Mapping of adapters
    mapping(string => Adapter) public adapters;
    string[] public adapterNames;

    // Events
    event AdapterAdded(string name, string ipfsHash);
    event AdapterRemoved(string name);

    // Add adapter
    function addAdapter(string memory name, string memory ipfsHash) public onlyOwner {
        Adapter storage adapter = adapters[name];
        require(bytes(adapter.name).length == 0, "Adapter already exists");

        adapters[name] = Adapter(name, ipfsHash);
        adapterNames.push(name);

        emit AdapterAdded(name, ipfsHash);
    }

    // Remove adapter
    function removeAdapter(string memory name) public onlyOwner {
        Adapter storage adapter = adapters[name];
        require(bytes(adapter.name).length != 0, "Adapter does not exist");

        delete adapters[name];

        for (uint256 i = 0; i < adapterNames.length; i++) {
            if (keccak256(bytes(adapterNames[i])) == keccak256(bytes(name))) {
                adapterNames[i] = adapterNames[adapterNames.length - 1];
                adapterNames.pop();
                break;
            }
        }

        emit AdapterRemoved(name);
    }
}
