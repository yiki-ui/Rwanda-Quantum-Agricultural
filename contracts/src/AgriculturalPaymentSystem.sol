// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriculturalPaymentSystem
 * @notice Payment system for agricultural services with tiered pricing
 * @dev Manages subscription tiers, credits, and farmer payments
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract AgriculturalPaymentSystem is
    AccessControl,
    ReentrancyGuard,
    Pausable,
    Initializable,
    UUPSUpgradeable
{
    // ============ Role Definitions ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");

    // ============ Subscription Tiers ============
    enum SubscriptionTier {
        STARTER,    // $15/month
        PRO,        // $39/month
        TEAMS,      // $49/month
        ENTERPRISE  // Custom pricing
    }

    // ============ Constants ============
    uint256 public constant STARTER_PRICE = 15e18;      // $15 in wei
    uint256 public constant PRO_PRICE = 39e18;          // $39 in wei
    uint256 public constant TEAMS_PRICE = 49e18;        // $49 in wei
    uint256 public constant STARTER_CREDITS = 100;      // 100 credits/month
    uint256 public constant PRO_CREDITS = 500;          // 500 credits/month
    uint256 public constant TEAMS_CREDITS = 500;        // 500 credits/month
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;

    // ============ State Variables ============

    // Subscription Management
    struct Subscription {
        SubscriptionTier tier;
        uint256 startDate;
        uint256 endDate;
        uint256 creditsRemaining;
        bool active;
    }

    mapping(address => Subscription) public subscriptions;
    mapping(address => uint256) public creditBalance;
    mapping(address => uint256) public totalSpent;

    // Pricing Configuration
    mapping(SubscriptionTier => uint256) public tierPrices;
    mapping(SubscriptionTier => uint256) public tierCredits;

    // Payment Tracking
    uint256 public totalRevenue;
    uint256 public totalSubscriptions;

    // Enterprise Custom Pricing
    mapping(address => uint256) public enterprisePricing;
    mapping(address => uint256) public enterpriseCredits;

    // ============ Events ============

    event SubscriptionCreated(
        address indexed farmer,
        SubscriptionTier tier,
        uint256 price,
        uint256 credits,
        uint256 startDate,
        uint256 endDate
    );

    event SubscriptionRenewed(
        address indexed farmer,
        SubscriptionTier tier,
        uint256 price,
        uint256 credits,
        uint256 newEndDate
    );

    event SubscriptionCancelled(address indexed farmer, uint256 timestamp);

    event CreditsConsumed(
        address indexed farmer,
        uint256 amount,
        uint256 remaining,
        string purpose
    );

    event CreditsAdded(address indexed farmer, uint256 amount, uint256 total);

    event PaymentProcessed(
        address indexed farmer,
        uint256 amount,
        SubscriptionTier tier,
        uint256 timestamp
    );

    event EnterpriseContractCreated(
        address indexed enterprise,
        uint256 customPrice,
        uint256 customCredits
    );

    event TierPriceUpdated(SubscriptionTier tier, uint256 newPrice);

    event TierCreditsUpdated(SubscriptionTier tier, uint256 newCredits);

    // ============ Initialization ============

    function initialize(address admin) public initializer {
        require(admin != address(0), "Invalid admin address");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);

        // Set default tier prices
        tierPrices[SubscriptionTier.STARTER] = STARTER_PRICE;
        tierPrices[SubscriptionTier.PRO] = PRO_PRICE;
        tierPrices[SubscriptionTier.TEAMS] = TEAMS_PRICE;

        // Set default tier credits
        tierCredits[SubscriptionTier.STARTER] = STARTER_CREDITS;
        tierCredits[SubscriptionTier.PRO] = PRO_CREDITS;
        tierCredits[SubscriptionTier.TEAMS] = TEAMS_CREDITS;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // ============ Subscription Management ============

    /**
     * @notice Subscribe to a tier
     * @param tier Subscription tier to subscribe to
     */
    function subscribe(SubscriptionTier tier) external payable nonReentrant whenNotPaused {
        require(tier != SubscriptionTier.ENTERPRISE, "Use subscribeEnterprise for enterprise");
        require(msg.value == tierPrices[tier], "Incorrect payment amount");

        uint256 credits = tierCredits[tier];
        uint256 endDate = block.timestamp + SUBSCRIPTION_DURATION;

        // Cancel existing subscription if any
        if (subscriptions[msg.sender].active) {
            subscriptions[msg.sender].active = false;
        }

        // Create new subscription
        subscriptions[msg.sender] = Subscription({
            tier: tier,
            startDate: block.timestamp,
            endDate: endDate,
            creditsRemaining: credits,
            active: true
        });

        creditBalance[msg.sender] = credits;
        totalSpent[msg.sender] += msg.value;
        totalRevenue += msg.value;
        totalSubscriptions++;

        _grantRole(FARMER_ROLE, msg.sender);

        emit SubscriptionCreated(msg.sender, tier, msg.value, credits, block.timestamp, endDate);
        emit PaymentProcessed(msg.sender, msg.value, tier, block.timestamp);
    }

    /**
     * @notice Subscribe to enterprise tier with custom pricing
     * @param customPrice Custom price for enterprise
     * @param customCredits Custom credits for enterprise
     */
    function subscribeEnterprise(uint256 customPrice, uint256 customCredits)
        external
        payable
        nonReentrant
        onlyRole(ADMIN_ROLE)
    {
        require(customPrice > 0, "Invalid price");
        require(customCredits > 0, "Invalid credits");
        require(msg.value == customPrice, "Incorrect payment amount");

        // Store enterprise pricing and credits
        enterprisePricing[msg.sender] = customPrice;
        enterpriseCredits[msg.sender] = customCredits;

        uint256 endDate = block.timestamp + SUBSCRIPTION_DURATION;

        subscriptions[msg.sender] = Subscription({
            tier: SubscriptionTier.ENTERPRISE,
            startDate: block.timestamp,
            endDate: endDate,
            creditsRemaining: customCredits,
            active: true
        });

        creditBalance[msg.sender] = customCredits;
        totalSpent[msg.sender] += msg.value;
        totalRevenue += msg.value;
        totalSubscriptions++;

        _grantRole(FARMER_ROLE, msg.sender);

        emit EnterpriseContractCreated(msg.sender, customPrice, customCredits);
        emit SubscriptionCreated(msg.sender, SubscriptionTier.ENTERPRISE, customPrice, customCredits, block.timestamp, endDate);
    }

    /**
     * @notice Renew subscription
     */
    function renewSubscription() external payable nonReentrant whenNotPaused {
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.active, "No active subscription");

        SubscriptionTier tier = sub.tier;
        uint256 price;
        uint256 credits;

        if (tier == SubscriptionTier.ENTERPRISE) {
            price = enterprisePricing[msg.sender];
            credits = enterpriseCredits[msg.sender];
            require(price > 0 && credits > 0, "Enterprise terms not set");
        } else {
            price = tierPrices[tier];
            credits = tierCredits[tier];
        }

        require(msg.value == price, "Incorrect payment amount");

        uint256 newEndDate = sub.endDate + SUBSCRIPTION_DURATION;

        sub.endDate = newEndDate;
        sub.creditsRemaining = credits;

        creditBalance[msg.sender] = credits;
        totalSpent[msg.sender] += msg.value;
        totalRevenue += msg.value;

        emit SubscriptionRenewed(msg.sender, tier, price, credits, newEndDate);
        emit PaymentProcessed(msg.sender, msg.value, tier, block.timestamp);
    }

    /**
     * @notice Cancel subscription
     */
    function cancelSubscription() external onlyRole(FARMER_ROLE) {
        require(subscriptions[msg.sender].active, "No active subscription");

        subscriptions[msg.sender].active = false;
        _revokeRole(FARMER_ROLE, msg.sender);

        emit SubscriptionCancelled(msg.sender, block.timestamp);
    }

    /**
     * @notice Consume credits
     * @param amount Number of credits to consume
     * @param purpose Purpose of consumption
     */
    function consumeCredits(uint256 amount, string calldata purpose)
        external
        onlyRole(FARMER_ROLE)
        whenNotPaused
    {
        require(amount > 0, "Invalid amount");
        require(creditBalance[msg.sender] >= amount, "Insufficient credits");

        creditBalance[msg.sender] -= amount;
        subscriptions[msg.sender].creditsRemaining -= amount;

        emit CreditsConsumed(msg.sender, amount, creditBalance[msg.sender], purpose);
    }

    /**
     * @notice Add bonus credits to farmer
     * @param farmer Farmer address
     * @param amount Credits to add
     */
    function addBonusCredits(address farmer, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(farmer != address(0), "Invalid farmer address");
        require(amount > 0, "Invalid amount");

        creditBalance[farmer] += amount;
        subscriptions[farmer].creditsRemaining += amount;

        emit CreditsAdded(farmer, amount, creditBalance[farmer]);
    }

    // ============ Getters ============

    /**
     * @notice Get subscription details
     * @param farmer Farmer address
     * @return Subscription struct
     */
    function getSubscription(address farmer) external view returns (Subscription memory) {
        return subscriptions[farmer];
    }

    /**
     * @notice Get credit balance
     * @param farmer Farmer address
     * @return Credit balance
     */
    function getCreditBalance(address farmer) external view returns (uint256) {
        return creditBalance[farmer];
    }

    /**
     * @notice Check if subscription is active
     * @param farmer Farmer address
     * @return True if subscription is active
     */
    function isSubscriptionActive(address farmer) external view returns (bool) {
        Subscription memory sub = subscriptions[farmer];
        return sub.active && block.timestamp <= sub.endDate;
    }

    /**
     * @notice Get subscription expiry date
     * @param farmer Farmer address
     * @return Expiry timestamp
     */
    function getSubscriptionExpiry(address farmer) external view returns (uint256) {
        return subscriptions[farmer].endDate;
    }

    /**
     * @notice Get tier price
     * @param tier Subscription tier
     * @return Price in wei
     */
    function getTierPrice(SubscriptionTier tier) external view returns (uint256) {
        return tierPrices[tier];
    }

    /**
     * @notice Get tier credits
     * @param tier Subscription tier
     * @return Credits per month
     */
    function getTierCredits(SubscriptionTier tier) external view returns (uint256) {
        return tierCredits[tier];
    }

    // ============ Admin Functions ============

    /**
     * @notice Update tier price
     * @param tier Subscription tier
     * @param newPrice New price in wei
     */
    function updateTierPrice(SubscriptionTier tier, uint256 newPrice)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(newPrice > 0, "Invalid price");
        tierPrices[tier] = newPrice;
        emit TierPriceUpdated(tier, newPrice);
    }

    /**
     * @notice Update tier credits
     * @param tier Subscription tier
     * @param newCredits New credits per month
     */
    function updateTierCredits(SubscriptionTier tier, uint256 newCredits)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(newCredits > 0, "Invalid credits");
        tierCredits[tier] = newCredits;
        emit TierCreditsUpdated(tier, newCredits);
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Withdraw accumulated revenue
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    // ============ Fallback ============

    receive() external payable {}
}
