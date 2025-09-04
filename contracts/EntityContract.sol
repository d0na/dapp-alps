// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ManagerContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// entity id = contract addr
contract EntityContract is Ownable {
    // General info
    string public name;
    string public contactInformation;
    
    // License info -> Manager Contracts
    address[] licenseeSLs;
    address[] licensorSLs;
    mapping(address => bool) licenseeSLRecorded;
    mapping(address => bool) licensorSLRecorded;

    constructor(string memory _name, address _sl1, address _sl2) {
        name = _name;
        // require(manager.getLicensee() == _sl, "Different licensee owner!");

        licenseeSLs.push(_sl1);
        licenseeSLRecorded[_sl1] = true;
        licenseeSLs.push(_sl2);
        licenseeSLRecorded[_sl2] = true;
    }

    // manager.getLicensee should be equivalent to the current address of this Entity contract. not _sl
    function addNewLicenseeSL(address _sl) external onlyOwner {
        require(licenseeSLRecorded[_sl] == false, "SL address already stored.");
        // ManagerContract manager = ManagerContract(_sl);
        // require(manager.getLicensee() == _sl, "Different licensee owner!");

        licenseeSLs.push(_sl);
        licenseeSLRecorded[_sl] = true;
    }

    function addNewLicensorSL(address _sl) external onlyOwner {
        require(licensorSLRecorded[_sl] == false, "SL address already stored.");
        // ManagerContract manager = ManagerContract(_sl);
       // require(manager.getLicensor() == _sl, "Different licensor owner!");

        licensorSLs.push(_sl);
        licensorSLRecorded[_sl] = true;
    }

    // arrays in memory need a fixed size; needs to be double-checked
    function getActiveLicenseeSLs() external view returns (address[] memory) {
        ManagerContract manager;
        address[] memory result = new address[](licenseeSLs.length);
        uint256 k=0;
        for (uint256 i = 0; i < licenseeSLs.length; i++) {
            manager = ManagerContract(licenseeSLs[i]);
            if (manager.isActive()) {
                result[k] = licenseeSLs[i];
                k++;
            }
        }
        return result;
    }

    function getActiveLicensorSLs() external view returns (address[] memory) {
        ManagerContract manager;
        address[] memory result = new address[](licensorSLs.length);
        uint256 k=0;
        for (uint256 i = 0; i < licensorSLs.length; i++) {
            manager = ManagerContract(licensorSLs[i]);
            if (manager.isActive()) {
                result[k] = licensorSLs[i];
                k++;
            }
        }
        return result;
    }

    function getTerminatedLicenseeSLs() external view returns (address[] memory) {
        ManagerContract manager;
        address[] memory result = new address[](licenseeSLs.length);
        uint256 k=0;
        for (uint256 i = 0; i < licenseeSLs.length; i++) {
            manager = ManagerContract(licenseeSLs[i]);
            if (!manager.isActive()) {
                result[k] = licenseeSLs[i];
                k++;
            }
        }
        return result;
    }

    function getTerminatedLicensorSLs() external view returns (address[] memory) {
        ManagerContract manager;
        address[] memory result = new address[](licensorSLs.length);
        uint256 k=0;
        for (uint256 i = 0; i < licensorSLs.length; i++) {
            manager = ManagerContract(licensorSLs[i]);
            if (!manager.isActive()) {
                result[k] = licenseeSLs[i];
                k++;
            }
        }
        return result;
    }

    function setName(string memory _name) external {
        name = _name;
    }

    // function getAllLicenseeSL() external view returns (address[] memory) {
    //     return licenseeSLs;
    // }
}
