// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Aggregator.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface RoyaltyComputation is ALPSBase {
    //computes all royalties up to a given time
    function computeRoyalties(uint256) external;

    //computes all royalties up to now
    function computeRoyalties() external;


    // returns (last computed royalty, time of computation)
    //function getComputedRoyalty() external returns (uint256, uint256);

    function getRoyaltyHistory() external  returns (Royalty[] memory);
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
contract RoyaltyComputationContract is RoyaltyComputation, Ownable {
    AggregatorContract aggrContract;
    
    Royalty[] public royaltyHistory;

    //use times from the aggregator
    //initial time for royalties collection
    //uint256 collectionTime_start;
    //final time for royalties collection (excluded, i.e. this timestamp will not contribute values)
    //uint256 collectionTime_end;
    //offset time for royalties collection, i.e. size in seconds of the time window for values update
    //uint256 collectionTime_duration;



    constructor(address _aggregator) {
        aggrContract = AggregatorContract(_aggregator);
    }

    function computeRoyalties() public override{ computeRoyalties(block.timestamp);}

    function computeRoyalties(uint256 _time) public override{
        //update all royalty values relative to the given time
        
        if(_time<aggrContract.get_collectionTime_start()){
            //asked time is before collection start time
            return;
        }else{
            aggrContract.updateAttributeValues(_time);
        }
        uint256 duration = aggrContract.get_collectionTime_duration();
        //if empty we might have to first create the first datapoint
        if(royaltyHistory.length == 0){
            if(_time >= aggrContract.get_collectionTime_start() + duration){
                uint256 royalty = 1000*(aggrContract.getAttributeValuesByIndex(0).value_screenUsage);
                if(aggrContract.getAttributeValuesByIndex(0).value_bluetoothUsed){
                    royalty = royalty + 333;
                }
                //2) add new datapoint for that time interval
                royaltyHistory.push(
                    Royalty({
                        periodTime_start : aggrContract.get_collectionTime_start(),
                        computedRoyalty : royalty,
                        paid : false
                    }));
            }else{
                //no new royalty values can be computed yet
                return;
            }
        }


        uint256 newStartTime = royaltyHistory[royaltyHistory.length-1].periodTime_start + duration;
        while (_time >= newStartTime + duration){
            //PRE: collectionTime_duration > 0 (i.e. >= 1)
            uint256 royalty = 1000*(aggrContract.getAttributeValues(newStartTime).value_screenUsage);
            if(aggrContract.getAttributeValues(newStartTime).value_bluetoothUsed){
                   royalty = royalty + 333;
            }
            //2) add new datapoint for that time interval
            royaltyHistory.push(
                Royalty({
                    periodTime_start : newStartTime,
                    computedRoyalty : royalty,
                    paid : false
                }));
        }
    }

        function getRoyaltyHistory() external override returns (Royalty[] memory) {
            if (royaltyHistory.length == 0) {
                royaltyHistory.push(
                    Royalty({
                        periodTime_start : 0,
                        computedRoyalty : 999,
                        paid : false
                    }));
            }
        return royaltyHistory;
    }

    function getRoyaltyHistoryTest() external returns (uint256[] memory, uint256[] memory) {
        if (royaltyHistory.length == 0) {
                royaltyHistory.push(
                    Royalty({
                        periodTime_start : 0,
                        computedRoyalty : 999,
                        paid : false
                    }));
            }
        uint256[] memory computedRoyalty =  new uint256[](royaltyHistory.length);
        uint256[] memory timeStart =  new uint256[](royaltyHistory.length);
    }
}

