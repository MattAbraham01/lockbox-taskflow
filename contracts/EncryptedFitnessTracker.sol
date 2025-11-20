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

    /// @notice Get all activity types that have been initialized for a user
    /// @param user The address of the user
    /// @return Array of activity types that have data
    function getUserActivities(address user) external view returns (ActivityType[] memory) {
        ActivityType[] memory activities = new ActivityType[](6);
        uint256 count = 0;

        for (uint256 i = 0; i < 6; i++) {
            if (_activityInitialized[user][ActivityType(i)]) {
                activities[count] = ActivityType(i);
                count++;
            }
        }

        // Resize array to actual count
        ActivityType[] memory result = new ActivityType[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activities[i];
        }

        return result;
    }

    /// @notice Get total activity data across all activity types for a user
    /// @param user The address of the user
    /// @return totalData Sum of all activity data across all initialized activities
    /// @return activityCount Number of different activity types with data
    function getTotalActivityData(address user) external view returns (uint32 totalData, uint256 activityCount) {
        totalData = 0;
        activityCount = 0;

        for (uint256 i = 0; i < 6; i++) {
            if (_activityInitialized[user][ActivityType(i)]) {
                totalData += _activityData[user][ActivityType(i)];
                activityCount++;
            }
        }

        return (totalData, activityCount);
    }

    /// @notice Store multiple activity data entries in a single transaction
    /// @param activityTypes Array of activity types to store
    /// @param activityData Array of corresponding activity data values
    /// @param inputProofs Array of input proofs (ignored in simplified version)
    function batchStoreActivities(
        ActivityType[] calldata activityTypes,
        uint256[] calldata activityData,
        bytes[] calldata inputProofs
    ) external {
        require(activityTypes.length == activityData.length, "Array length mismatch");
        require(activityTypes.length == inputProofs.length, "Array length mismatch");
        require(activityTypes.length > 0, "Cannot store empty batch");
        require(activityTypes.length <= 10, "Batch size limited to 10 entries for gas efficiency");

        for (uint256 i = 0; i < activityTypes.length; i++) {
            uint32 data = uint32(activityData[i]);

            // Store or update activity data
            if (_activityInitialized[msg.sender][activityTypes[i]]) {
                // Accumulate the activity data
                _activityData[msg.sender][activityTypes[i]] += data;
            } else {
                _activityData[msg.sender][activityTypes[i]] = data;
                _activityInitialized[msg.sender][activityTypes[i]] = true;
            }

            emit ActivityDataStored(msg.sender, activityTypes[i], block.timestamp);
        }

        // Update global tracking
        _totalActivities[msg.sender] += uint32(activityTypes.length);
        _lastUpdateTime[msg.sender] = block.timestamp;
    }
}

