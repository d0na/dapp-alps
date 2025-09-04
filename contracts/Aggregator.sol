// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Verification.sol";
import "./ALPSBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//TODO: uint256 is a placeholder for any attribute data type - probably needs generalization?
//TODO: updateAttributeValue - add time component, i.e., request values that are fresher than a time interval
//TODO: extrapolate function - take last available value. Update. check freshness, if not use extrapolate.
//take average of the change in the last 10 values if available
interface Aggregator is ALPSBase {
    
    function updateAttributeValues(uint256 _time) external returns (bool chnagesMade);

    function getAttributeValues(uint256 _time)
        external
        view
        returns (AttributeValues memory);
    
function getAttributeValuesByIndex(uint256 _time)
        external
        view
        returns (AttributeValues memory);
    

    function valuesCollectionIsOver() external  view returns (bool);

}

/*
Example policy:
"each 5 min pay 1000 for each new millisecond the screen was in use and 333 if the bluetooth was used at all during each period"
the aggregator remembers the last read nad updates all previous values as needed
i.e. it checks the current timestamp and updates all previous updated hourly values for its two attributes:
one int of the cumulative milliseconds usage of screen time during that period
one bool of wheter bluetooth was used or not during that period.

We use an array fo time periods with computed values during that period
The last time period still open is coindiered undefined; the value is only computed after the period closure
*/
contract AggregatorContract is Aggregator, Ownable {
    //initial time for royalties collection
    uint256 collectionTime_start;
    //final time for royalties collection (excluded, i.e. this timestamp will not contribute values)
    uint256 collectionTime_end;
    //offset time for royalties collection, i.e. size in seconds of the time window for values update
    uint256 collectionTime_duration;

    //Verification contract addresses
    address public attributesManager_screenUsage;
    address public attributesManager_bluetoothUsed;

    //array of values recorded for each time window
    AttributeValues[] public values;

    constructor(
        address _sourceVCscreen,
        address _sourceVCbluetooth,
        uint256 _timeStart,
        uint256 _timeEnd,
        uint256 _timeDuration
    ) {
        // require(_timeEnd >= _timeStart,"Impossible time frame.");
        // require(collectionTime_duration > 0,"Impossible time duration.");
        attributesManager_screenUsage = _sourceVCscreen;
        attributesManager_bluetoothUsed = _sourceVCbluetooth;
        collectionTime_start =_timeStart;
        collectionTime_end = _timeEnd;
        collectionTime_duration = _timeDuration;
    }

    //start time can not be updated once the contract has started
    function update_collectionTime_end(uint256 _time) public onlyOwner
    {
        //onlyowner
        collectionTime_end = _time;
    }
    function update_collectionTime_duration(uint256 _time) public onlyOwner
    {
        //onlyowner
        collectionTime_duration = _time;
    }
    function get_collectionTime_start() public view returns (uint256) { return collectionTime_start; }
    function get_collectionTime_end() public view returns (uint256) { return collectionTime_end; }
    function get_collectionTime_duration() public view returns (uint256) { return collectionTime_duration; }

    function valuesCollectionIsOver()
        public
        view
        override
        returns (bool)
    {
        //works even if no elements, as last time will be 0, so never staisfies, so always false
        return (collectionTime_end <= values[values.length-1].periodTime_start + collectionTime_duration);
    }

    //TODO: add extrapolation check if needed and do
    //time until which attributes need to be updated
    function updateAttributeValues(uint256 _time)
        public
        override
        returns (bool changesMade)
    {
        if(_time<collectionTime_start || valuesCollectionIsOver()){
            //asked time is before collection start time
            //or collection is over
            return false;
        }
        bool result = false;
        //if empty we might have to first create the first datapoint
        if(values.length == 0){
            if(_time >= collectionTime_start + collectionTime_duration){
                uint256 temp_screenUsage = (Verification(attributesManager_screenUsage).getCumulativeHistory(collectionTime_start, collectionTime_start + collectionTime_duration-1))[0];
                bool temp_bluetoothUsed = (Verification(attributesManager_bluetoothUsed).getCumulativeHistory(collectionTime_start, collectionTime_start + collectionTime_duration-1))[0] > 0;
                //2) add new datapoint for that time interval
                values.push(
                    AttributeValues({
                        periodTime_start : collectionTime_start,
                        value_screenUsage : temp_screenUsage,
                        value_bluetoothUsed : temp_bluetoothUsed,
                        extrapolated_screenUsage : false,
                        extrapolated_bluetoothUsed : false
                    }));
                result = true;
            }else{
                //no new values can be collected as last interval is already up to date
                return false;
            }
        }


        uint256 newStartTime = values[values.length-1].periodTime_start + collectionTime_duration;
        while (_time >= newStartTime + collectionTime_duration){
            //1) retrieve all values form verifier contracts
            //PRE: collectionTime_duration > 0 (i.e. >= 1)
            uint256 temp_screenUsage = (Verification(attributesManager_screenUsage).getCumulativeHistory(collectionTime_start, collectionTime_start + collectionTime_duration-1))[0];
            bool temp_bluetoothUsed = (Verification(attributesManager_bluetoothUsed).getCumulativeHistory(collectionTime_start, collectionTime_start + collectionTime_duration-1))[0] > 0;
            //2) add new datapoint for that time interval
            values.push(
                AttributeValues({
                    periodTime_start : newStartTime,
                    value_screenUsage : temp_screenUsage,
                    value_bluetoothUsed : temp_bluetoothUsed,
                    extrapolated_screenUsage : false,
                    extrapolated_bluetoothUsed : false
                }));
                newStartTime = values[values.length-1].periodTime_start + collectionTime_duration;
                result = true;
            /*
struct AttributeValues{
        uint256 periodTime_start;
        //periodTime_end implicitely equal to periodTime_start+collectionTime_duration
        uint256 value_screenUsage;
        bool extrapolated_screenUsage;
        bool value_bluetoothUsed;
        bool extrapolated_bluetoothUsed;
    }
            */
        }
        return result;
    }

    function getAttributeValues(uint256 _time)
        public
        view
        override
        returns (AttributeValues memory)
    {
        AttributeValues memory result;
        if((_time < collectionTime_start) || (_time >= values[values.length-1].periodTime_start + collectionTime_duration))
            return result;
        else{
            //for sure within one time interval
            for (uint256 i = values.length-1; i >= 0; i--) {
                if(_time >= values[i].periodTime_start){
                    //for sure this is the first time interval that satisfies
                    return values[i];
                }
            }
        }
    }
    function getAttributeValuesByIndex(uint256 _idx)
        public
        view
        override
        returns (AttributeValues memory)
    {
        AttributeValues memory result;
        if(_idx >= values.length)
            return result;
        else{
            return values[_idx];
        }
    }

}

