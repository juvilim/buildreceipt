// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/// @title BuildReceipt
/// @notice An append-only registry of build release receipts.
contract BuildReceipt {
    uint256 public constant MAX_PROJECT_LENGTH = 128;
    uint256 public constant MAX_VERSION_LENGTH = 128;
    uint256 public constant MAX_RELEASE_URL_LENGTH = 2_048;
    uint256 public constant MAX_COMMIT_HASH_LENGTH = 128;
    uint256 public constant MAX_NOTE_LENGTH = 2_048;

    struct Receipt {
        address builder;
        uint256 createdAt;
        bytes32 contentHash;
        string project;
        string version;
        string releaseUrl;
        string commitHash;
        string note;
    }

    uint256 public receiptCount;
    mapping(uint256 => Receipt) public receipts;
    mapping(address => uint256[]) private receiptIdsByBuilder;

    event ReceiptCreated(uint256 indexed receiptId, address indexed builder, bytes32 contentHash);

    error EmptyField(string fieldName);
    error FieldTooLong(string fieldName, uint256 maxLength);

    /// @notice Stores a release receipt. Receipts are immutable once created.
    function createReceipt(
        string calldata project,
        string calldata version,
        string calldata releaseUrl,
        string calldata commitHash,
        string calldata note
    ) external returns (uint256 receiptId) {
        _validateField(project, "project", MAX_PROJECT_LENGTH);
        _validateField(version, "version", MAX_VERSION_LENGTH);
        _validateField(releaseUrl, "releaseUrl", MAX_RELEASE_URL_LENGTH);
        _validateField(commitHash, "commitHash", MAX_COMMIT_HASH_LENGTH);
        _validateField(note, "note", MAX_NOTE_LENGTH);

        receiptId = ++receiptCount;
        bytes32 contentHash = keccak256(
            abi.encode(msg.sender, project, version, releaseUrl, commitHash, note)
        );

        receipts[receiptId] = Receipt({
            builder: msg.sender,
            createdAt: block.timestamp,
            contentHash: contentHash,
            project: project,
            version: version,
            releaseUrl: releaseUrl,
            commitHash: commitHash,
            note: note
        });
        receiptIdsByBuilder[msg.sender].push(receiptId);

        emit ReceiptCreated(receiptId, msg.sender, contentHash);
    }

    function getReceiptIds(address builder) external view returns (uint256[] memory) {
        return receiptIdsByBuilder[builder];
    }

    function _validateField(
        string calldata value,
        string memory fieldName,
        uint256 maxLength
    ) private pure {
        uint256 length = bytes(value).length;
        if (length == 0) revert EmptyField(fieldName);
        if (length > maxLength) revert FieldTooLong(fieldName, maxLength);
    }
}
