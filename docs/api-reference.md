# Lock Box Fitness Tracker - API Reference

## Smart Contract Functions

### Core Functions

#### `storeActivityData(ActivityType activityType, uint256 activityData, bytes inputProof)`
Store encrypted fitness activity data for the user.
- **Parameters:**
  - `activityType`: The type of fitness activity (0-5)
  - `activityData`: Activity duration in minutes
  - `inputProof`: FHE input proof
- **Events:** `ActivityDataStored`

#### `getActivityData(address user, ActivityType activityType)`
Get encrypted activity data for a user and activity type.
- **Returns:** Activity data in minutes

#### `batchStoreActivities(ActivityType[] activityTypes, uint256[] activityData, bytes[] inputProofs)`
Store multiple activity data entries in a single transaction.
- **Parameters:**
  - `activityTypes`: Array of activity types
  - `activityData`: Array of activity durations
  - `inputProofs`: Array of FHE input proofs
- **Limits:** Maximum 10 entries per batch

### Analytics Functions

#### `getTotalActivityData(address user)`
Get total activity data across all activity types.
- **Returns:** `(totalMinutes, activityCount)`

#### `getActivityStatistics(address user)`
Get comprehensive activity statistics.
- **Returns:** `(totalMinutes, activityCount, averageMinutes)`

#### `getActivityTrend(address user, ActivityType activityType, uint256 daysBack)`
Get activity trend analysis for a specific activity type.
- **Returns:** `(totalMinutes, averageDaily, isTrendingUp)`

### Utility Functions

#### `getUserActivities(address user)`
Get all activity types that have been initialized for a user.
- **Returns:** Array of activity types

#### `validateActivityData(ActivityType activityType, uint256 activityData)`
Validate activity data input ranges.
- **Returns:** Boolean indicating if data is valid

#### `requestDecryptActivityData(ActivityType activityType, uint256 requestId)`
Request decryption of activity data (creates transaction popup).
- **Returns:** Decrypted activity data

## Activity Types

- `0`: Running
- `1`: Cycling
- `2`: Swimming
- `3`: Weightlifting
- `4`: Yoga
- `5`: Walking

## Error Handling

- Invalid date ranges
- Array length mismatches in batch operations
- Activity data validation failures
- Gas limit exceeded for large batches
