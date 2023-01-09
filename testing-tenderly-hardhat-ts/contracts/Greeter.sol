//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Greeter {
  string private greeting;
  address private owner;
  uint256 public nr;

  constructor(string memory _greeting) {
    greeting = _greeting;
    owner = msg.sender;
    nr = 0;
  }

  function greet() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public {
    greeting = _greeting;
  }

  function resetGreeting() public {
    require(msg.sender == owner, "Resettable only by the owner");
    greeting = "Hello, world!";
  }

  function increment() public returns (uint256) {
    nr++;
    return nr;
  }
}
