//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract FooStorage {
    mapping(uint256 => uint256) kvStore;
    uint256 private nr;

    function keyValueStorePut(uint256 k, uint256 v) public {
        kvStore[k] = v;
    }

    function keyValueStoreGet(uint256 k) public view returns (uint256) {
        return kvStore[k];
    }

    function nrInc() public {
        nr++;
    }

    function nrRead() public view returns (uint256) {
        return nr;
    }
}
