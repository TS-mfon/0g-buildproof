// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BuildProofRegistry {
    enum ProjectStatus {
        Pending,
        Verified,
        NeedsWork,
        Flagged,
        Archived
    }

    struct ScoreSet {
        uint16 overall;
        uint16 integration;
        uint16 implementationScore;
        uint16 documentation;
        uint16 demo;
        uint16 community;
        uint16 security;
    }

    struct Project {
        uint256 id;
        address owner;
        string name;
        string githubUrl;
        string demoUrl;
        address submittedContract;
        string explorerUrl;
        string storageRoot;
        bytes32 reportHash;
        ScoreSet scores;
        ProjectStatus status;
        uint64 createdAt;
        uint64 updatedAt;
        uint32 endorsements;
        uint32 flags;
    }

    address public owner;
    uint256 private nextProjectId = 1;

    mapping(uint256 => Project) private projects;
    mapping(address => uint256[]) private projectsByOwner;
    mapping(uint256 => mapping(address => bool)) public hasEndorsed;
    mapping(uint256 => mapping(address => bool)) public hasFlagged;

    event ProjectRegistered(uint256 indexed projectId, address indexed owner, bytes32 indexed reportHash);
    event ProjectReportUpdated(uint256 indexed projectId, bytes32 indexed reportHash, string storageRoot);
    event ProjectStatusChanged(uint256 indexed projectId, ProjectStatus status);
    event ProjectEndorsed(uint256 indexed projectId, address indexed endorser);
    event ProjectFlagged(uint256 indexed projectId, address indexed reporter, string reason);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error NotProjectOwner();
    error InvalidScore();
    error ProjectNotFound();
    error DuplicateEndorsement();
    error DuplicateFlag();
    error EmptyRequiredField();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert EmptyRequiredField();
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function registerProject(
        string calldata name,
        string calldata githubUrl,
        string calldata demoUrl,
        address submittedContract,
        string calldata explorerUrl,
        string calldata storageRoot,
        bytes32 reportHash,
        ScoreSet calldata scores
    ) external returns (uint256 projectId) {
        _requireText(name);
        _requireText(githubUrl);
        _requireText(demoUrl);
        _requireText(explorerUrl);
        _requireText(storageRoot);
        _requireHash(reportHash);
        _validateScores(scores);

        projectId = nextProjectId++;
        uint64 nowTs = uint64(block.timestamp);
        projects[projectId] = Project({
            id: projectId,
            owner: msg.sender,
            name: name,
            githubUrl: githubUrl,
            demoUrl: demoUrl,
            submittedContract: submittedContract,
            explorerUrl: explorerUrl,
            storageRoot: storageRoot,
            reportHash: reportHash,
            scores: scores,
            status: ProjectStatus.Pending,
            createdAt: nowTs,
            updatedAt: nowTs,
            endorsements: 0,
            flags: 0
        });
        projectsByOwner[msg.sender].push(projectId);
        emit ProjectRegistered(projectId, msg.sender, reportHash);
    }

    function updateReport(
        uint256 projectId,
        string calldata storageRoot,
        bytes32 reportHash,
        ScoreSet calldata scores
    ) external {
        Project storage project = _project(projectId);
        if (project.owner != msg.sender) revert NotProjectOwner();
        _requireText(storageRoot);
        _requireHash(reportHash);
        _validateScores(scores);

        project.storageRoot = storageRoot;
        project.reportHash = reportHash;
        project.scores = scores;
        project.updatedAt = uint64(block.timestamp);
        emit ProjectReportUpdated(projectId, reportHash, storageRoot);
    }

    function setStatus(uint256 projectId, ProjectStatus status) external onlyOwner {
        Project storage project = _project(projectId);
        project.status = status;
        project.updatedAt = uint64(block.timestamp);
        emit ProjectStatusChanged(projectId, status);
    }

    function endorseProject(uint256 projectId) external {
        Project storage project = _project(projectId);
        if (hasEndorsed[projectId][msg.sender]) revert DuplicateEndorsement();
        hasEndorsed[projectId][msg.sender] = true;
        project.endorsements += 1;
        emit ProjectEndorsed(projectId, msg.sender);
    }

    function flagProject(uint256 projectId, string calldata reason) external {
        Project storage project = _project(projectId);
        if (hasFlagged[projectId][msg.sender]) revert DuplicateFlag();
        _requireText(reason);
        hasFlagged[projectId][msg.sender] = true;
        project.flags += 1;
        project.status = ProjectStatus.Flagged;
        project.updatedAt = uint64(block.timestamp);
        emit ProjectFlagged(projectId, msg.sender, reason);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert EmptyRequiredField();
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    function getProject(uint256 projectId) external view returns (Project memory) {
        return _projectView(projectId);
    }

    function getProjectCount() external view returns (uint256) {
        return nextProjectId - 1;
    }

    function getProjectsByOwner(address projectOwner) external view returns (uint256[] memory) {
        return projectsByOwner[projectOwner];
    }

    function _project(uint256 projectId) private view returns (Project storage project) {
        project = projects[projectId];
        if (project.owner == address(0)) revert ProjectNotFound();
    }

    function _projectView(uint256 projectId) private view returns (Project memory project) {
        project = projects[projectId];
        if (project.owner == address(0)) revert ProjectNotFound();
    }

    function _validateScores(ScoreSet calldata scores) private pure {
        if (
            scores.overall > 100 ||
            scores.integration > 100 ||
            scores.implementationScore > 100 ||
            scores.documentation > 100 ||
            scores.demo > 100 ||
            scores.community > 100 ||
            scores.security > 100
        ) revert InvalidScore();
    }

    function _requireText(string calldata value) private pure {
        if (bytes(value).length == 0) revert EmptyRequiredField();
    }

    function _requireHash(bytes32 value) private pure {
        if (value == bytes32(0)) revert EmptyRequiredField();
    }
}
