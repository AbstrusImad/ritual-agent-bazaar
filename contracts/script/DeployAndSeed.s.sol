// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {BazaarRegistry} from "../src/BazaarRegistry.sol";

/// @notice Deploys BazaarRegistry v2 and seeds it with the six gallery agents
///         (with real on-chain capabilities) plus a couple of on-chain reviews
///         so the marketplace has real content on first load.
///
/// Usage:
///   forge script script/DeployAndSeed.s.sol:DeployAndSeed \
///     --rpc-url https://rpc.ritualfoundation.org \
///     --private-key $PK --broadcast
contract DeployAndSeed is Script {
    BazaarRegistry registry;

    function run() external {
        vm.startBroadcast();

        registry = new BazaarRegistry();

        // Small, affordable on-chain prices (in RITUAL) so the marketplace is
        // fully exercisable on testnet. Values are real listing state.
        uint256 id1 = _publish(
            "Wallet Guardian", "Security", BazaarRegistry.AgentType.Sovereign,
            BazaarRegistry.PricingModel.Subscription, 0.03 ether, 0.02 ether,
            "Watch selected wallets and block suspicious transfers before they settle.",
            "emerald-shield",
            _caps3("Threat detection", "Transaction firewall", "Key custody watch")
        );

        uint256 id2 = _publish(
            "Research Oracle", "Research", BazaarRegistry.AgentType.Persistent,
            BazaarRegistry.PricingModel.Subscription, 0.025 ether, 0.015 ether,
            "Gather on-chain and web signals then summarize them into long-term memory.",
            "ivory-crystal",
            _caps3("Deep research", "Long-term memory", "Signal ranking")
        );

        uint256 id3 = _publish(
            "Market Sentinel", "DeFi", BazaarRegistry.AgentType.Sovereign,
            BazaarRegistry.PricingModel.Subscription, 0.035 ether, 0.025 ether,
            "Monitor markets for anomalies and protect value in real time.",
            "gold-market-core",
            _caps3("Anomaly detection", "Risk-aware execution", "Live market adaptation")
        );

        _publish(
            "Community Operator", "Community", BazaarRegistry.AgentType.Persistent,
            BazaarRegistry.PricingModel.Subscription, 0.02 ether, 0.012 ether,
            "Keep the community connected and coordinate events and responses.",
            "emerald-network",
            _caps3("Network routing", "Sentiment sense", "Event coordination")
        );

        _publish(
            "Contract Watcher", "Security", BazaarRegistry.AgentType.Sovereign,
            BazaarRegistry.PricingModel.Subscription, 0.028 ether, 0.018 ether,
            "Watch contract behavior and flag risky patterns before harm.",
            "ruby-crystal",
            _caps3("Pattern scanning", "Risk flagging", "Anomaly reports")
        );

        _publish(
            "Yield Scout", "DeFi", BazaarRegistry.AgentType.Persistent,
            BazaarRegistry.PricingModel.Subscription, 0.026 ether, 0.016 ether,
            "Analyze yield opportunities and rank them by risk-adjusted confidence.",
            "gold-market-core",
            _caps3("Yield scanning", "Risk scoring", "Opportunity ranking")
        );

        // A few genuine on-chain reviews from the deployer so the Reviews tab is
        // populated on first load. Real users add more from the app.
        registry.rateAgent(id1, 5, "Caught a drainer before it moved a cent.");
        registry.rateAgent(id2, 5, "My daily briefing writes itself now.");
        registry.rateAgent(id3, 5, "Saved my position during a flash drop.");

        vm.stopBroadcast();

        console.log("BazaarRegistry deployed at:", address(registry));
        console.log("listingCount:", registry.listingCount());
    }

    function _publish(
        string memory name,
        string memory category,
        BazaarRegistry.AgentType agentType,
        BazaarRegistry.PricingModel pricingModel,
        uint256 monthlyPrice,
        uint256 cloneFee,
        string memory mission,
        string memory theme,
        string[] memory capabilities
    ) internal returns (uint256) {
        return registry.publishAgent(
            name, category, agentType, pricingModel, monthlyPrice, cloneFee, mission, theme, capabilities
        );
    }

    function _caps3(string memory a, string memory b, string memory c) internal pure returns (string[] memory caps) {
        caps = new string[](3);
        caps[0] = a;
        caps[1] = b;
        caps[2] = c;
    }
}
