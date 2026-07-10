// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BazaarRegistry
/// @notice On-chain registry for the Ritual Agent Bazaar: publish agent
///         listings, clone them into a personal collection, rent them for a
///         period, deploy them, and leave on-chain reviews. All marketplace
///         state and activity is recorded on-chain via events for indexing.
/// @dev    v2 stores reviews with text and per-agent capabilities on-chain,
///         tracks per-listing clone/rental/deployment counters, refunds any
///         overpayment, and follows checks-effects-interactions with a
///         reentrancy guard. Live agent execution is handled separately by the
///         Ritual Sovereign / Persistent agent factories.
contract BazaarRegistry {
    uint256 public constant CONTRACT_VERSION = 3;

    enum AgentType {
        Sovereign,
        Persistent
    }

    enum PricingModel {
        Free,
        Rent,
        Subscription,
        OneTimeClone
    }

    struct Listing {
        uint256 id;
        address creator;
        string name;
        string category;
        AgentType agentType;
        PricingModel pricingModel;
        uint256 monthlyPrice; // wei of RITUAL per month
        uint256 cloneFee; // wei of RITUAL one-time clone fee
        string mission;
        string theme;
        string[] capabilities;
        bool active;
        uint64 createdAt;
    }

    struct Clone {
        uint256 id;
        uint256 listingId;
        address owner;
        string name;
        string mission;
        string riskLevel;
        uint256 monthlyBudget;
        uint64 createdAt;
    }

    struct Rental {
        uint256 id;
        uint256 listingId;
        address renter;
        uint64 startTime;
        uint64 endTime;
        string usageMode;
    }

    struct Deployment {
        uint256 id;
        uint256 listingId;
        address deployer;
        string network;
        uint64 deployedAt;
    }

    struct Review {
        address rater;
        uint8 stars;
        string comment;
        uint64 createdAt;
    }

    // ----- Storage -----
    uint256 public listingCount;
    uint256 public cloneCount;
    uint256 public rentalCount;
    uint256 public deploymentCount;

    mapping(uint256 => Listing) private listings;
    mapping(uint256 => Clone) private clones;
    mapping(uint256 => Rental) private rentals;
    mapping(uint256 => Deployment) private deployments;

    mapping(address => uint256[]) private ownerClones;
    mapping(address => uint256[]) private renterRentals;
    mapping(address => uint256[]) private creatorListings;
    mapping(address => uint256[]) private deployerDeployments;

    // Per-listing activity counters (cheap O(1) reads for the UI).
    mapping(uint256 => uint256) public listingClones;
    mapping(uint256 => uint256) public listingRentals;
    mapping(uint256 => uint256) public listingDeployments;

    // Ratings + reviews: listingId => aggregate / reviews.
    mapping(uint256 => uint256) public ratingSum;
    mapping(uint256 => uint256) public ratingCount;
    mapping(uint256 => Review[]) private listingReviews;
    mapping(uint256 => mapping(address => uint256)) public reviewIndexOf; // 1-based; 0 = none

    // ----- Reentrancy guard -----
    uint256 private _lock = 1;

    modifier nonReentrant() {
        if (_lock != 1) revert Reentrant();
        _lock = 2;
        _;
        _lock = 1;
    }

    // ----- Events (indexed for the Activity feed) -----
    event AgentPublished(
        uint256 indexed listingId,
        address indexed creator,
        string name,
        string category,
        uint8 agentType,
        uint8 pricingModel,
        uint256 monthlyPrice
    );
    event ListingUpdated(uint256 indexed listingId, uint256 monthlyPrice, uint256 cloneFee, bool active);
    event AgentCloned(uint256 indexed cloneId, uint256 indexed listingId, address indexed owner, string name);
    event AgentRented(
        uint256 indexed rentalId,
        uint256 indexed listingId,
        address indexed renter,
        uint64 endTime,
        string usageMode
    );
    event AgentRated(uint256 indexed listingId, address indexed rater, uint8 stars, string comment);
    event CloneRecovered(uint256 indexed cloneId, address indexed owner);
    event AgentDeployed(uint256 indexed deploymentId, uint256 indexed listingId, address indexed deployer, string network);

    // ----- Errors -----
    error EmptyName();
    error UnknownListing();
    error UnknownClone();
    error NotCreator();
    error NotCloneOwner();
    error InvalidRating();
    error InvalidPeriod();
    error InsufficientPayment();
    error TransferFailed();
    error ListingInactive();
    error Reentrant();
    error SelfRentNotAllowed();

    // ----- Publish -----
    function publishAgent(
        string calldata name,
        string calldata category,
        AgentType agentType,
        PricingModel pricingModel,
        uint256 monthlyPrice,
        uint256 cloneFee,
        string calldata mission,
        string calldata theme,
        string[] calldata capabilities
    ) external returns (uint256 listingId) {
        if (bytes(name).length == 0) revert EmptyName();

        listingId = ++listingCount;
        Listing storage listing = listings[listingId];
        listing.id = listingId;
        listing.creator = msg.sender;
        listing.name = name;
        listing.category = category;
        listing.agentType = agentType;
        listing.pricingModel = pricingModel;
        listing.monthlyPrice = monthlyPrice;
        listing.cloneFee = cloneFee;
        listing.mission = mission;
        listing.theme = theme;
        listing.capabilities = capabilities;
        listing.active = true;
        listing.createdAt = uint64(block.timestamp);

        creatorListings[msg.sender].push(listingId);

        emit AgentPublished(listingId, msg.sender, name, category, uint8(agentType), uint8(pricingModel), monthlyPrice);
    }

    function updateListing(uint256 listingId, uint256 monthlyPrice, uint256 cloneFee, bool active) external {
        Listing storage listing = listings[listingId];
        if (listing.creator == address(0)) revert UnknownListing();
        if (listing.creator != msg.sender) revert NotCreator();

        listing.monthlyPrice = monthlyPrice;
        listing.cloneFee = cloneFee;
        listing.active = active;
        emit ListingUpdated(listingId, monthlyPrice, cloneFee, active);
    }

    // ----- Clone -----
    /// @notice Clone a published listing into the caller's collection.
    /// @dev    If the listing charges a clone fee, exactly that fee is forwarded
    ///         to the creator and any overpayment is refunded to the caller.
    function cloneAgent(
        uint256 listingId,
        string calldata name,
        string calldata mission,
        string calldata riskLevel,
        uint256 monthlyBudget
    ) external payable nonReentrant returns (uint256 cloneId) {
        Listing storage listing = listings[listingId];
        if (listing.creator == address(0)) revert UnknownListing();
        if (!listing.active) revert ListingInactive();
        if (bytes(name).length == 0) revert EmptyName();

        uint256 fee = listing.cloneFee;
        if (fee > 0 && msg.value < fee) revert InsufficientPayment();

        // Effects
        cloneId = ++cloneCount;
        clones[cloneId] = Clone({
            id: cloneId,
            listingId: listingId,
            owner: msg.sender,
            name: name,
            mission: mission,
            riskLevel: riskLevel,
            monthlyBudget: monthlyBudget,
            createdAt: uint64(block.timestamp)
        });
        ownerClones[msg.sender].push(cloneId);
        listingClones[listingId] += 1;

        emit AgentCloned(cloneId, listingId, msg.sender, name);

        // Interactions
        address creator = listing.creator;
        if (fee > 0) _pay(creator, fee);
        if (msg.value > fee) _pay(msg.sender, msg.value - fee);
    }

    // ----- Rent -----
    function rentAgent(uint256 listingId, uint64 periodDays, string calldata usageMode)
        external
        payable
        nonReentrant
        returns (uint256 rentalId)
    {
        Listing storage listing = listings[listingId];
        if (listing.creator == address(0)) revert UnknownListing();
        if (!listing.active) revert ListingInactive();
        // The creator already owns the agent; renting it to themselves would only
        // inflate the rental counter. Deploying/cloning your own listing stays allowed.
        if (msg.sender == listing.creator) revert SelfRentNotAllowed();
        if (periodDays == 0) revert InvalidPeriod();

        // Pro-rated cost from the monthly price (30-day month).
        uint256 cost = (listing.monthlyPrice * periodDays) / 30;
        if (cost > 0 && msg.value < cost) revert InsufficientPayment();

        // Effects
        rentalId = ++rentalCount;
        uint64 endTime = uint64(block.timestamp) + uint64(periodDays) * 1 days;
        rentals[rentalId] = Rental({
            id: rentalId,
            listingId: listingId,
            renter: msg.sender,
            startTime: uint64(block.timestamp),
            endTime: endTime,
            usageMode: usageMode
        });
        renterRentals[msg.sender].push(rentalId);
        listingRentals[listingId] += 1;

        emit AgentRented(rentalId, listingId, msg.sender, endTime, usageMode);

        // Interactions
        address creator = listing.creator;
        if (cost > 0) _pay(creator, cost);
        if (msg.value > cost) _pay(msg.sender, msg.value - cost);
    }

    // ----- Rate / Review -----
    /// @notice Leave (or update) an on-chain review with a star rating and text.
    /// @dev    One review per address per listing; re-rating updates in place and
    ///         keeps the running average consistent.
    function rateAgent(uint256 listingId, uint8 stars, string calldata comment) external {
        if (listings[listingId].creator == address(0)) revert UnknownListing();
        if (stars < 1 || stars > 5) revert InvalidRating();

        uint256 idx = reviewIndexOf[listingId][msg.sender];
        if (idx == 0) {
            listingReviews[listingId].push(
                Review({rater: msg.sender, stars: stars, comment: comment, createdAt: uint64(block.timestamp)})
            );
            reviewIndexOf[listingId][msg.sender] = listingReviews[listingId].length; // 1-based
            ratingCount[listingId] += 1;
            ratingSum[listingId] += stars;
        } else {
            Review storage r = listingReviews[listingId][idx - 1];
            ratingSum[listingId] = ratingSum[listingId] - r.stars + stars;
            r.stars = stars;
            r.comment = comment;
            r.createdAt = uint64(block.timestamp);
        }

        emit AgentRated(listingId, msg.sender, stars, comment);
    }

    /// @notice Recover a clone (mock lifecycle signal used by the Vault UI).
    function recoverClone(uint256 cloneId) external {
        Clone storage c = clones[cloneId];
        if (c.owner == address(0)) revert UnknownClone();
        if (c.owner != msg.sender) revert NotCloneOwner();
        emit CloneRecovered(cloneId, msg.sender);
    }

    /// @notice Register an on-chain deployment record for a listing.
    /// @dev    This records the deployment intent on-chain (cheap). Live TEE
    ///         agent execution is launched separately via Ritual's agent
    ///         factories and is not performed here.
    function deployAgent(uint256 listingId, string calldata network)
        external
        returns (uint256 deploymentId)
    {
        if (listings[listingId].creator == address(0)) revert UnknownListing();

        deploymentId = ++deploymentCount;
        deployments[deploymentId] = Deployment({
            id: deploymentId,
            listingId: listingId,
            deployer: msg.sender,
            network: network,
            deployedAt: uint64(block.timestamp)
        });
        deployerDeployments[msg.sender].push(deploymentId);
        listingDeployments[listingId] += 1;

        emit AgentDeployed(deploymentId, listingId, msg.sender, network);
    }

    // ----- Views -----
    function getListing(uint256 listingId) external view returns (Listing memory) {
        if (listings[listingId].creator == address(0)) revert UnknownListing();
        return listings[listingId];
    }

    function getClone(uint256 cloneId) external view returns (Clone memory) {
        if (clones[cloneId].owner == address(0)) revert UnknownClone();
        return clones[cloneId];
    }

    function getRental(uint256 rentalId) external view returns (Rental memory) {
        return rentals[rentalId];
    }

    function getDeployment(uint256 deploymentId) external view returns (Deployment memory) {
        return deployments[deploymentId];
    }

    function getDeploymentsByDeployer(address deployer) external view returns (uint256[] memory) {
        return deployerDeployments[deployer];
    }

    function getReviews(uint256 listingId) external view returns (Review[] memory) {
        return listingReviews[listingId];
    }

    function getAverageRating(uint256 listingId) external view returns (uint256 avgTimes100) {
        uint256 count = ratingCount[listingId];
        if (count == 0) return 0;
        return (ratingSum[listingId] * 100) / count;
    }

    function getClonesByOwner(address owner) external view returns (uint256[] memory) {
        return ownerClones[owner];
    }

    function getRentalsByRenter(address renter) external view returns (uint256[] memory) {
        return renterRentals[renter];
    }

    function getListingsByCreator(address creator) external view returns (uint256[] memory) {
        return creatorListings[creator];
    }

    /// @notice Paginated listing ids for gallery discovery (1-indexed ids).
    function getListingPage(uint256 offset, uint256 limit) external view returns (uint256[] memory ids) {
        uint256 total = listingCount;
        if (offset >= total || limit == 0) return new uint256[](0);
        uint256 end = offset + limit;
        if (end > total) end = total;
        ids = new uint256[](end - offset);
        for (uint256 i = 0; i < ids.length; i++) {
            ids[i] = offset + i + 1; // ids start at 1
        }
    }

    function _pay(address to, uint256 amount) internal {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
