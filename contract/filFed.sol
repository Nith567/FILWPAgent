 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function decimals() external view returns (uint8);
    function balanceOf(address account) external view returns (uint256);
}
//CA: 0x86541b4e87217871e96503D6E9A6ED46998b0E12
contract FilFed  {
    address public owner;
    uint256 public amount;
    string private cid;
    uint256 public totalPurchases;
    address public USDFCToken = 0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0; // USDFC token address

    mapping(address => bool) public hasAccess;

    event PurchaseEvent(address indexed buyer, uint256 paidAmount);

    constructor(string memory _cid, uint256 _amount) {
        owner = msg.sender;
        cid = _cid;
        amount = _amount; 
    }

    function purchaseAccess() external returns (string memory) {
        require(!hasAccess[msg.sender], "Already has access");
        IERC20 token = IERC20(USDFCToken);
        bool success = token.transferFrom(msg.sender, owner, amount*10**18);
        require(success, "Token transfer failed");
        hasAccess[msg.sender] = true;
        totalPurchases += 1;
        emit PurchaseEvent(msg.sender, amount);
        return cid;
    }

    function canAccess(address userAddress) public view returns (int256) {
        return hasAccess[userAddress] ? int256(1) : int256(0);
    }
}
