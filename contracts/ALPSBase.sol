// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ALPSBase {
    /*struct Attribute {
        uint256 attributeId;
        uint256 lastUpdateTimestamp;
        uint256 timeValidity;
        address sourceVC;
        bool isValueExtrapolated;
    }

    struct AttributeValue {
        uint256 id;
        uint256[] value;
        uint256 collectionTimestamp;
    }*/
    struct AttributeValues{
        uint256 periodTime_start;
        //periodTime_end implicitely equal to periodTime_start+collectionTime_duration
        uint256 value_screenUsage;
        bool extrapolated_screenUsage;
        bool value_bluetoothUsed;
        bool extrapolated_bluetoothUsed;
    }

    struct Royalty{
        uint256 periodTime_start;
        //periodTime_end implicitely equal to periodTime_start+collectionTime_duration
        uint256 computedRoyalty;
        bool paid;
    }    

    struct OracleValue {
        uint256 collectionTimestamp;
        uint256[] currentValues;
    }
}

