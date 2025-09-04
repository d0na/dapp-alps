// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// unique to 1 Attribute
//TODO: all attribute values are unit256
//TODO: add events

import "./ALPSBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface Verification is ALPSBase {
    /*
    This oracle gateway interface manages oracles that only manage attributes of type int
    */
    function getAttributeValue()
        external
        view
        returns (OracleValue memory, bool);

    function getHistory(uint256, uint256)
        external
        view
        returns (OracleValue[] memory);

function getCumulativeHistory(uint256 , uint256)
        external
        view
        returns (uint256[] memory);

    function subscribe() external pure;

    function forceUpdate() external;

    function stopSubscribe() external pure;

    function getTimer() external view;

    //function update(
    //    uint256,
    //    uint256,
    //    uint256
    //) external;

    //function update(OracleValue) external;
}

/*
Single int value oracle gateway
e.g. duration of sensor usage
*/
contract VerificationContract is Verification, Ownable {
    //uint256 public immutable attributeId;
    string public attributeName;

    // Attribute current value and last time always are the first element in the history

    OracleValue[] public attributeHistory;

    constructor(string memory _attributeName) {
        attributeName = _attributeName;
    }
/*
        struct OracleValue {
        uint256 collectionTimestamp;
        uint256[] currentValues;
    }
*/
    function update(
        uint256 _duration
    ) public{
        if(attributeHistory.length>0){
            //if there exists a previous element
            require(attributeHistory[attributeHistory.length-1].collectionTimestamp>block.timestamp,"Incompatible (older) timestamp.");
        }
        uint256[] memory valuesArr = new uint256[](1);
        valuesArr[0] = _duration;

        attributeHistory.push(
            OracleValue({
                currentValues: valuesArr,
                collectionTimestamp: block.timestamp
            })
        );
    }
    function update(
        uint256 _duration,
        uint256 _timestamp
    ) public{
        if(attributeHistory.length>0){
            //if there exists a previous element
            require(attributeHistory[attributeHistory.length-1].collectionTimestamp>_timestamp,"Incompatible (older) timestamp.");
        }
        uint256[] memory valuesArr = new uint256[](1);
        valuesArr[0] = _duration;

        attributeHistory.push(
            OracleValue({
                currentValues: valuesArr,
                collectionTimestamp: _timestamp
            })
        );
    }

    // Returns the latest attribute value.
    // If no value is present returns (empty, false)
    function getAttributeValue()
        external
        view
        override
        returns (OracleValue memory, bool)
    {
        if (attributeHistory.length>0) {
            return (attributeHistory[attributeHistory.length-1], true);
        }else{
            OracleValue memory emptyOracleValue;
            return (emptyOracleValue, false);
        }
    }

    // Gets all history between those two timestamps included
    function getHistory(uint256 startTime, uint256 endTime)
        public
        view
        override
        returns (OracleValue[] memory)
    {
        OracleValue[] memory result;
        if(startTime>endTime){
            return result;
        }
        uint256 size = attributeHistory.length;
        if(size<=0){
            return result;
        }
        //PRE: values are sorted by timestamp (first item is the oldest and so on)
        /*
        //reasonable version if Solidity was collaborating
        for (uint256 i = size-1; i >=0; i--) {
            if(endTime < attributeHistory[i].collectionTimestamp){
                continue;
            }else{
                if(startTime>attributeHistory[i].collectionTimestamp){
                    break;
                }else{
                    //the result has inverted order, i.e. most recent elements first
                    result.push(attributeHistory[i]);
                }
            }
        }*/
        //longer version to accomodate solidity
        //1) find indexes of first and last element
        //attributeHistory.length means invalid value (is the first index outsude of the array idxs)
        uint256 startIdx = 0;
        uint256 endIdx = size;
        for (uint256 i = size-1; i >= 0; i--) {
            if(endTime < attributeHistory[i].collectionTimestamp){
                continue;
            }else{
                if(endIdx==size){
                    endIdx = i;
                }
                if(startTime>attributeHistory[i].collectionTimestamp){
                    startIdx = i+1;
                    break;
                }else{
                    continue;
                }
            }
        }
        uint256 newSize = endIdx-startIdx+1;
        if((endIdx==size)||(newSize==0)){
            //no element was found in the interval
            return result;
        }
        result = new OracleValue[](newSize);
        for (uint256 i = 0; i < newSize; i++) {
            result[i] = attributeHistory[endIdx-i];
        }

        return result;
    }

    // Gets the sum of all historic values between those two timestamps included
    function getCumulativeHistory(uint256 startTime, uint256 endTime)
        public
        view
        override
        returns (uint256[] memory)
    {
        uint256[] memory result;
        if(startTime>endTime){
            return result;
        }
        uint256 size = attributeHistory.length;
        if(size<=0){
            return result;
        }
        //PRE: values are sorted by timestamp (first item is the oldest and so on)
        uint256 sum = 0;
        for (uint256 i = size-1; i >=0; i--) {
            if(endTime < attributeHistory[i].collectionTimestamp){
                continue;
            }else{
                if(startTime>attributeHistory[i].collectionTimestamp){
                    break;
                }else{
                    //the result has inverted order, i.e. most recent elements first
                    sum = sum + attributeHistory[i].currentValues[0];
                }
            }
        }
        if(sum > 0){
            result = new uint256[](1);
            result[0] = sum;
        }
        return result;
    }

    function subscribe() external pure override {
        // emit event that is want to subscribe to this service with the Id of the ext server
    }

    function forceUpdate() external override {}

    function stopSubscribe() external pure override {}

    function getTimer() external view override {}
}

