// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Aggregator.sol";
import "./RoyaltyComputation.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface Manager {
    function updateAggregator(address) external;

    function updateRoyaltyComputation(address) external;

    // uint arr n*3 [(timestamp, royalty, boolean)]
    function getRoyaltyHistoryLegacyDapp()
        external
        view
        returns (uint256[] memory);

    function getLicensee() external view returns (address);

    function getLicensor() external view returns (address);

    function isActive() external view returns (bool);
}

// add expiration boolean or date
contract ManagerContract is Manager, Ownable {
    Aggregator aggregator;
    RoyaltyComputation royaltyComputation;
    uint256 public immutable creationDate;
    address public licensee;
    address public licensor;
    bool public active;
    uint256 public expirationDate;

    constructor(
        address _aggregator,
        address _royaltyComputation,
        address _licensee,
        address _licensor,
        uint256 _expirationDate
    ) {
        aggregator = Aggregator(_aggregator);
        royaltyComputation = RoyaltyComputation(_royaltyComputation);
        licensor = _licensor;
        licensee = _licensee;
        creationDate = block.timestamp;
        active = true;
        expirationDate = _expirationDate;
    }

    function updateAggregator(address _aggregator) public override onlyOwner {
        aggregator = Aggregator(_aggregator);
    }

    function updateRoyaltyComputation(address _royaltyComputation)
        public
        override
        onlyOwner
    {
        royaltyComputation = RoyaltyComputation(_royaltyComputation);
    }

    // test input for dapp, format [royalty, time, bool]
    function getRoyaltyHistoryLegacyDapp()
        external
        view
        override
        returns (uint256[] memory)
    {
        uint256[] memory hist = new uint256[](9);
        hist[0] = 1000 + expirationDate;
        hist[1] = block.timestamp + expirationDate;
        hist[2] = 0;
        hist[3] = 2500 + expirationDate;
        hist[4] = block.timestamp - 10000000 + expirationDate;
        hist[5] = 1;
        hist[6] = 500 + expirationDate;
        hist[7] = block.timestamp - 2000000 - expirationDate;
        hist[8] = 1;
        return hist;
    }

    function terminateSL() external {
        require(block.timestamp > expirationDate, "SL not expired yet!");
        active = false;
    }

    function getLicensee() external view override returns (address) {
        return licensee;
    }

    function setLicensee(address _licensee) external {
        licensee = _licensee;
    }

    function getLicensor() external view override returns (address) {
        return licensor;
    }

    function isActive() external view override returns (bool) {
        return active;
    }
}
