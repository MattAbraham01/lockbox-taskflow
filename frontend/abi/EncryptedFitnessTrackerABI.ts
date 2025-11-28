
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const EncryptedFitnessTrackerABI = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum EncryptedFitnessTracker.ActivityType",
          "name": "activityType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "decryptedData",
          "type": "uint32"
        }
      ],
      "name": "ActivityDataDecrypted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum EncryptedFitnessTracker.ActivityType",
          "name": "activityType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ActivityDataStored",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum EncryptedFitnessTracker.ActivityType",
          "name": "activityType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "initialized",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lastUpdateTime",
          "type": "uint256"
        }
      ],
      "name": "DebugState",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "enum EncryptedFitnessTracker.ActivityType",
          "name": "activityType",
          "type": "uint8"
        }
      ],
      "name": "getActivityData",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getLastUpdateTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getTotalActivities",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserActivities",
      "outputs": [
        {
          "internalType": "enum EncryptedFitnessTracker.ActivityType[]",
          "name": "",
          "type": "uint8[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "enum EncryptedFitnessTracker.ActivityType",
          "name": "activityType",
          "type": "uint8"
        }
      ],
      "name": "isActivityInitialized",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum EncryptedFitnessTracker.ActivityType",
          "name": "activityType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "requestDecryptActivityData",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum EncryptedFitnessTracker.ActivityType",
          "name": "activityType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "activityDataEuint32",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "storeActivityData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

