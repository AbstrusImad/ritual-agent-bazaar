// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {BazaarRegistry} from "../src/BazaarRegistry.sol";

contract BazaarRegistryTest is Test {
    BazaarRegistry registry;
    address creator = address(0xC0FFEE);
    address user = address(0xBEEF);
    address renter = address(0xCAFE);

    function setUp() public {
        registry = new BazaarRegistry();
        vm.deal(user, 100 ether);
        vm.deal(renter, 100 ether);
    }

    function _caps() internal pure returns (string[] memory caps) {
        caps = new string[](2);
        caps[0] = "Threat detection";
        caps[1] = "Transaction firewall";
    }

    function _publish() internal returns (uint256) {
        vm.prank(creator);
        return registry.publishAgent(
            "Liquidity Ranger",
            "DeFi",
            BazaarRegistry.AgentType.Persistent,
            BazaarRegistry.PricingModel.Subscription,
            1 ether,
            2 ether,
            "Track liquidity shifts.",
            "gold-market-core",
            _caps()
        );
    }

    function test_publishStoresCapabilities() public {
        uint256 id = _publish();
        assertEq(id, 1);
        BazaarRegistry.Listing memory l = registry.getListing(id);
        assertEq(l.creator, creator);
        assertEq(l.name, "Liquidity Ranger");
        assertTrue(l.active);
        assertEq(l.capabilities.length, 2);
        assertEq(l.capabilities[0], "Threat detection");
        assertEq(registry.listingCount(), 1);
    }

    function test_publishEmptyNameReverts() public {
        vm.prank(creator);
        vm.expectRevert(BazaarRegistry.EmptyName.selector);
        registry.publishAgent(
            "", "DeFi", BazaarRegistry.AgentType.Sovereign, BazaarRegistry.PricingModel.Free, 0, 0, "m", "t", _caps()
        );
    }

    function test_updateListingOnlyCreator() public {
        uint256 id = _publish();
        vm.prank(user);
        vm.expectRevert(BazaarRegistry.NotCreator.selector);
        registry.updateListing(id, 3 ether, 4 ether, false);

        vm.prank(creator);
        registry.updateListing(id, 3 ether, 4 ether, false);
        BazaarRegistry.Listing memory l = registry.getListing(id);
        assertEq(l.monthlyPrice, 3 ether);
        assertFalse(l.active);
    }

    function test_cloneWithFeePaysCreator() public {
        uint256 id = _publish();
        uint256 before = creator.balance;

        vm.prank(user);
        uint256 cloneId = registry.cloneAgent{value: 2 ether}(id, "My Clone", "mission", "Balanced", 1 ether);

        assertEq(cloneId, 1);
        assertEq(creator.balance, before + 2 ether);
        assertEq(registry.listingClones(id), 1);
        uint256[] memory mine = registry.getClonesByOwner(user);
        assertEq(mine.length, 1);
        assertEq(mine[0], 1);
    }

    function test_cloneOverpaymentRefunded() public {
        uint256 id = _publish(); // cloneFee = 2 ether
        uint256 creatorBefore = creator.balance;
        uint256 userBefore = user.balance;

        vm.prank(user);
        registry.cloneAgent{value: 5 ether}(id, "My Clone", "mission", "Balanced", 1 ether);

        // Creator receives exactly the fee; user only spends the fee (rest refunded).
        assertEq(creator.balance, creatorBefore + 2 ether);
        assertEq(user.balance, userBefore - 2 ether);
        assertEq(address(registry).balance, 0);
    }

    function test_cloneInsufficientFeeReverts() public {
        uint256 id = _publish();
        vm.prank(user);
        vm.expectRevert(BazaarRegistry.InsufficientPayment.selector);
        registry.cloneAgent{value: 1 ether}(id, "My Clone", "mission", "Balanced", 1 ether);
    }

    function test_cloneInactiveReverts() public {
        uint256 id = _publish();
        vm.prank(creator);
        registry.updateListing(id, 1 ether, 2 ether, false); // deactivate

        vm.prank(user);
        vm.expectRevert(BazaarRegistry.ListingInactive.selector);
        registry.cloneAgent{value: 2 ether}(id, "My Clone", "mission", "Balanced", 1 ether);
    }

    function test_cloneUnknownListingReverts() public {
        vm.prank(user);
        vm.expectRevert(BazaarRegistry.UnknownListing.selector);
        registry.cloneAgent(999, "x", "m", "Balanced", 0);
    }

    function test_freeCloneRefundsAttachedValue() public {
        vm.prank(creator);
        uint256 id = registry.publishAgent(
            "Free", "DeFi", BazaarRegistry.AgentType.Sovereign, BazaarRegistry.PricingModel.Free, 0, 0, "m", "t", _caps()
        );
        uint256 userBefore = user.balance;
        vm.prank(user);
        // Attach value to a free listing: it must be refunded, not locked.
        uint256 cloneId = registry.cloneAgent{value: 1 ether}(id, "c", "m", "Balanced", 0);
        assertEq(cloneId, 1);
        assertEq(user.balance, userBefore); // fully refunded
        assertEq(address(registry).balance, 0);
    }

    function test_rentProRatedAndRefund() public {
        uint256 id = _publish(); // 1 ether/mo
        uint256 before = creator.balance;
        uint256 renterBefore = renter.balance;

        vm.prank(renter);
        uint256 rentalId = registry.rentAgent{value: 3 ether}(id, 30, "Simulation Only"); // overpay
        assertEq(rentalId, 1);
        assertEq(creator.balance, before + 1 ether); // exactly one month
        assertEq(renter.balance, renterBefore - 1 ether); // overpay refunded
        assertEq(registry.listingRentals(id), 1);

        BazaarRegistry.Rental memory r = registry.getRental(rentalId);
        assertEq(r.renter, renter);
        assertEq(r.endTime, uint64(block.timestamp) + 30 days);
    }

    function test_rentZeroPeriodReverts() public {
        uint256 id = _publish();
        vm.prank(renter);
        vm.expectRevert(BazaarRegistry.InvalidPeriod.selector);
        registry.rentAgent(id, 0, "Simulation Only");
    }

    function test_selfRentReverts() public {
        uint256 id = _publish(); // created by `creator`
        vm.deal(creator, 10 ether);
        vm.prank(creator);
        vm.expectRevert(BazaarRegistry.SelfRentNotAllowed.selector);
        registry.rentAgent{value: 1 ether}(id, 30, "Simulation Only");
    }

    function test_selfCloneStillAllowed() public {
        uint256 id = _publish();
        vm.deal(creator, 10 ether);
        vm.prank(creator);
        uint256 cloneId = registry.cloneAgent{value: 2 ether}(id, "Own Clone", "m", "Balanced", 0);
        assertEq(cloneId, 1);
    }

    function test_reviewsStoreTextAndAverage() public {
        uint256 id = _publish();
        vm.prank(user);
        registry.rateAgent(id, 5, "Excellent guardian.");
        vm.prank(renter);
        registry.rateAgent(id, 4, "Solid and reliable.");

        assertEq(registry.ratingCount(id), 2);
        assertEq(registry.getAverageRating(id), 450); // 4.5 * 100

        BazaarRegistry.Review[] memory reviews = registry.getReviews(id);
        assertEq(reviews.length, 2);
        assertEq(reviews[0].rater, user);
        assertEq(reviews[0].stars, 5);
        assertEq(reviews[0].comment, "Excellent guardian.");
        assertEq(reviews[1].comment, "Solid and reliable.");
    }

    function test_reviewUpdateSameUser() public {
        uint256 id = _publish();
        vm.prank(user);
        registry.rateAgent(id, 3, "Decent.");
        vm.prank(user);
        registry.rateAgent(id, 5, "Grew on me.");

        assertEq(registry.ratingCount(id), 1);
        assertEq(registry.getAverageRating(id), 500);
        BazaarRegistry.Review[] memory reviews = registry.getReviews(id);
        assertEq(reviews.length, 1);
        assertEq(reviews[0].stars, 5);
        assertEq(reviews[0].comment, "Grew on me.");
    }

    function test_rateInvalidReverts() public {
        uint256 id = _publish();
        vm.prank(user);
        vm.expectRevert(BazaarRegistry.InvalidRating.selector);
        registry.rateAgent(id, 6, "too many stars");
    }

    function test_recoverCloneOnlyOwner() public {
        uint256 id = _publish();
        vm.prank(user);
        uint256 cloneId = registry.cloneAgent{value: 2 ether}(id, "c", "m", "Balanced", 0);

        vm.prank(renter);
        vm.expectRevert(BazaarRegistry.NotCloneOwner.selector);
        registry.recoverClone(cloneId);

        vm.prank(user);
        registry.recoverClone(cloneId);
    }

    function test_listingPage() public {
        _publish();
        _publish();
        _publish();
        uint256[] memory page = registry.getListingPage(0, 2);
        assertEq(page.length, 2);
        assertEq(page[0], 1);
        assertEq(page[1], 2);

        uint256[] memory page2 = registry.getListingPage(2, 10);
        assertEq(page2.length, 1);
        assertEq(page2[0], 3);
    }

    function test_deployAgentCountsPerListing() public {
        uint256 id = _publish();
        vm.prank(user);
        uint256 depId = registry.deployAgent(id, "Ritual Chain 1979");
        assertEq(depId, 1);
        assertEq(registry.deploymentCount(), 1);
        assertEq(registry.listingDeployments(id), 1);
        BazaarRegistry.Deployment memory d = registry.getDeployment(depId);
        assertEq(d.deployer, user);
        assertEq(d.listingId, id);
        uint256[] memory mine = registry.getDeploymentsByDeployer(user);
        assertEq(mine.length, 1);
    }

    function test_deployUnknownListingReverts() public {
        vm.prank(user);
        vm.expectRevert(BazaarRegistry.UnknownListing.selector);
        registry.deployAgent(999, "Ritual Testnet");
    }

    function test_rentalsByRenter() public {
        uint256 id = _publish();
        vm.prank(renter);
        registry.rentAgent{value: 1 ether}(id, 30, "Simulation Only");
        uint256[] memory mine = registry.getRentalsByRenter(renter);
        assertEq(mine.length, 1);
        assertEq(mine[0], 1);
    }
}
