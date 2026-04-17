// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/BuildProofRegistry.sol";

interface Vm {
    function envAddress(string calldata key) external view returns (address);
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract DeployBuildProofRegistry {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (BuildProofRegistry registry) {
        address initialOwner = vm.envAddress("BUILDPROOF_OWNER");
        vm.startBroadcast();
        registry = new BuildProofRegistry(initialOwner);
        vm.stopBroadcast();
    }
}
