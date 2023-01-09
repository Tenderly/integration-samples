//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract FooStorage {
    mapping(uint256 => uint256) public kvStore;
    uint256 public nr;
    mapping(address => uint256) public addrMap;

    function keyValueStorePut(uint256 k, uint256 v) public {
        kvStore[k] = v;
    }

    function addrMapPut(address a, uint256 v) public {
        addrMap[a] = v;
    }

    function nrInc() public {
        nr++;
    }

    function nrRead() public view returns (uint256) {
        return nr;
    }
}
