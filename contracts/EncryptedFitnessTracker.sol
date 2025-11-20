// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Encrypted Fitness Tracker Contract
/// @author lock-box
/// @notice A privacy-preserving fitness data storage contract using FHEVM.
/// This version uses plain uint32 for testing purposes.
contract EncryptedFitnessTracker {
    // Activity types
    enum ActivityType { Running, Cycling, Swimming, Weightlifting, Yoga, Walking }

    // User's encrypted fitness data by activity type
    mapping(address => mapping(ActivityType => uint32)) private _activityData;
    mapping(address => mapping(ActivityType => bool)) private _activityInitialized;
    mapping(address => uint32) private _totalActivities;
    mapping(address => uint256) private _lastUpdateTime;

    // Events
    event ActivityDataStored(address indexed user, ActivityType activityType, uint256 timestamp);
    event ActivityDataDecrypted(address indexed user, ActivityType activityType, uint32 decryptedData);
    event DebugState(address indexed user, ActivityType activityType, bool initialized, uint256 lastUpdateTime);

    /// @notice Store encrypted fitness activity data for the user
    /// @param activityType The type of fitness activity
    /// @param activityDataEuint32 The encrypted activity data (duration in minutes, ignored in simplified version)
    /// @param inputProof The input proof (ignored in simplified version)
    /// @dev Stores the activity data and increments the total activities count
    function storeActivityData(ActivityType activityType, uint256 activityDataEuint32, bytes calldata inputProof) external {
        emit DebugState(msg.sender, activityType, _activityInitialized[msg.sender][activityType], _lastUpdateTime[msg.sender]);

        // Use the actual activity data passed from frontend
        uint32 activityData = uint32(activityDataEuint32);

        // Store or update activity data
        if (_activityInitialized[msg.sender][activityType]) {
            // Accumulate the activity data
            _activityData[msg.sender][activityType] += activityData;
        } else {
            _activityData[msg.sender][activityType] = activityData;
            _activityInitialized[msg.sender][activityType] = true;
        }

        // Increment total activities count
        _totalActivities[msg.sender] += 1;
        _lastUpdateTime[msg.sender] = block.timestamp;

        emit ActivityDataStored(msg.sender, activityType, block.timestamp);
    }

    /// @notice Get the encrypted activity data for a user and activity type
    /// @param user The address of the user
    /// @param activityType The type of fitness activity
    /// @return The encrypted activity data (duration in minutes)
    function getActivityData(address user, ActivityType activityType) external view returns (uint32) {
        if (_activityInitialized[user][activityType]) {
            return _activityData[user][activityType];
        } else {
            return 0;
        }
    }

    /// @notice Get the total number of activities for a user
    /// @param user The address of the user
    /// @return The total number of activities recorded
    function getTotalActivities(address user) external view returns (uint32) {
        return _totalActivities[user];
    }

    /// @notice Get the last update time for a user
    /// @param user The address of the user
    /// @return The timestamp of the last update
    function getLastUpdateTime(address user) external view returns (uint256) {
        return _lastUpdateTime[user];
    }

    /// @notice Check if an activity type has been initialized for a user
    /// @param user The address of the user
    /// @param activityType The type of fitness activity
    /// @return True if activity data has been initialized for the user
    function isActivityInitialized(address user, ActivityType activityType) external view returns (bool) {
        return _activityInitialized[user][activityType];
    }

    /// @notice Request decryption of activity data (creates transaction and popup)
    /// @param activityType The type of fitness activity
    /// @param requestId A unique identifier for this decryption request
    /// @return The encrypted activity data handle for client-side decryption
    function requestDecryptActivityData(ActivityType activityType, uint256 requestId) external returns (uint32) {
        require(_activityInitialized[msg.sender][activityType], "No activity data stored for this type");

        // Emit event to record the decryption request (this creates a transaction)
        emit ActivityDataDecrypted(msg.sender, activityType, _activityData[msg.sender][activityType]);

        // Return the plain value for client-side decryption
        return _activityData[msg.sender][activityType];
    }

}

