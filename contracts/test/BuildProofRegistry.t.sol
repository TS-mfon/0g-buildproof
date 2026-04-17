// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Test.sol";
import "../src/BuildProofRegistry.sol";

contract BuildProofRegistryTest is Test {
    BuildProofRegistry private registry;
    address private admin = address(0xA11CE);
    address private builder = address(0xB01D);
    address private reviewer = address(0xCAFE);

    function setUp() public {
        registry = new BuildProofRegistry(admin);
    }

    function testRegisterProject() public {
        uint256 projectId = _register();
        BuildProofRegistry.Project memory project = registry.getProject(projectId);
        assertEq(project.owner, builder);
        assertEq(project.scores.overall, 90);
        assertEq(registry.getProjectCount(), 1);
    }

    function testOnlyProjectOwnerCanUpdateReport() public {
        uint256 projectId = _register();
        BuildProofRegistry.ScoreSet memory scores = _scores(91);

        vm.prank(reviewer);
        vm.expectRevert(BuildProofRegistry.NotProjectOwner.selector);
        registry.updateReport(projectId, "0xnewroot", keccak256("new-report"), scores);

        vm.prank(builder);
        registry.updateReport(projectId, "0xnewroot", keccak256("new-report"), scores);
        assertEq(registry.getProject(projectId).scores.overall, 91);
    }

    function testOwnerCanSetStatus() public {
        uint256 projectId = _register();

        vm.prank(builder);
        vm.expectRevert(BuildProofRegistry.NotOwner.selector);
        registry.setStatus(projectId, BuildProofRegistry.ProjectStatus.Verified);

        vm.prank(admin);
        registry.setStatus(projectId, BuildProofRegistry.ProjectStatus.Verified);
        assertEq(uint8(registry.getProject(projectId).status), uint8(BuildProofRegistry.ProjectStatus.Verified));
    }

    function testRejectsInvalidScore() public {
        BuildProofRegistry.ScoreSet memory scores = _scores(101);
        vm.prank(builder);
        vm.expectRevert(BuildProofRegistry.InvalidScore.selector);
        registry.registerProject(
            "0G BuildProof",
            "https://github.com/example/0g-buildproof",
            "https://loom.com/demo",
            address(0x1234),
            "https://chainscan.0g.ai/tx/0x1",
            "0xroot",
            keccak256("report"),
            scores
        );
    }

    function testEndorseOncePerWallet() public {
        uint256 projectId = _register();
        vm.prank(reviewer);
        registry.endorseProject(projectId);
        assertEq(registry.getProject(projectId).endorsements, 1);

        vm.prank(reviewer);
        vm.expectRevert(BuildProofRegistry.DuplicateEndorsement.selector);
        registry.endorseProject(projectId);
    }

    function testFlagOncePerWallet() public {
        uint256 projectId = _register();
        vm.prank(reviewer);
        registry.flagProject(projectId, "Explorer proof is stale");
        assertEq(registry.getProject(projectId).flags, 1);
        assertEq(uint8(registry.getProject(projectId).status), uint8(BuildProofRegistry.ProjectStatus.Flagged));

        vm.prank(reviewer);
        vm.expectRevert(BuildProofRegistry.DuplicateFlag.selector);
        registry.flagProject(projectId, "Duplicate");
    }

    function _register() private returns (uint256 projectId) {
        vm.prank(builder);
        projectId = registry.registerProject(
            "0G BuildProof",
            "https://github.com/example/0g-buildproof",
            "https://loom.com/demo",
            address(0x1234),
            "https://chainscan.0g.ai/tx/0x1",
            "0xroot",
            keccak256("report"),
            _scores(90)
        );
    }

    function _scores(uint16 overall) private pure returns (BuildProofRegistry.ScoreSet memory) {
        return BuildProofRegistry.ScoreSet({
            overall: overall,
            integration: 90,
            implementationScore: 88,
            documentation: 92,
            demo: 85,
            community: 91,
            security: 89
        });
    }
}
