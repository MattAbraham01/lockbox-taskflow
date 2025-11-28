# Encrypted Fitness Tracker

A privacy-preserving fitness activity tracking application built with FHEVM (Fully Homomorphic Encryption Virtual Machine) technology. Users can record their fitness activities (running, cycling, swimming, weightlifting, yoga, walking) in encrypted form, and view their activity data through secure decryption.

## Features

- **Privacy-Preserving**: Fitness activity data is encrypted using FHEVM, ensuring complete user privacy
- **Multiple Activities**: Track 6 different fitness activities (Running, Cycling, Swimming, Weightlifting, Yoga, Walking)
- **Encrypted Operations**: Activity data storage happens in encrypted form using homomorphic encryption
- **Secure Decryption**: Users can decrypt their own fitness data securely
- **Multi-User Support**: Each user's fitness data is kept separate and private
- **Modern Dark UI**: Built with Next.js, React, and Tailwind CSS with a dark theme
- **Wallet Integration**: RainbowKit wallet integration for easy connection

## Prerequisites

### MetaMask Wallet Setup

1. **Install MetaMask Extension**:
   - **Chrome/Edge**: [Install MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
   - **Firefox**: [Install MetaMask](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)

2. **Configure MetaMask for Local Development**:
   - Open MetaMask extension
   - Click network dropdown → "Add Network"
   - **Network Name**: `Localhost 8545`
   - **New RPC URL**: `http://localhost:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

### System Requirements

- Node.js 18+
- npm or yarn
- MetaMask browser extension

## Architecture

### Smart Contracts
- `EncryptedFitnessTracker.sol`: Main contract handling encrypted fitness activity data storage and decryption
- Uses FHEVM for fully homomorphic encryption operations
- Supports 6 different activity types with individual tracking

### Frontend
- Built with Next.js 15 and React 19
- RainbowKit for wallet connection
- Custom hooks for FHEVM operations
- Interactive activity selection with visual feedback
- Responsive dark theme design with Tailwind CSS

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- A compatible Ethereum wallet (MetaMask, etc.)

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Choose Your Network

#### Option A: Local Development (Recommended for testing)
```bash
# Start local Hardhat node (in one terminal)
npm run local-node

# In another terminal, deploy contracts
npm run deploy-local

# Start frontend development server (in another terminal)
npm run frontend-dev
```

#### Option B: Sepolia Testnet (Production-like environment)
```bash
# Set your environment variables
export INFURA_API_KEY="b18fb7e6ca7045ac83c41157ab93f990"

# Deploy to Sepolia testnet
npm run deploy-sepolia

# Start frontend (will connect to Sepolia)
cd frontend && npm run dev
```

### 3. Access the Application

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Connect Wallet and Test

1. Click "Connect Wallet" to connect your wallet
   - **Local Development**: Use any account from Hardhat node (has 10,000 ETH)
   - **Sepolia Testnet**: Use MetaMask with Sepolia network (needs test ETH)
2. Select a fitness activity type (Running, Cycling, Swimming, Weightlifting, Yoga, Walking)
3. Enter activity duration in minutes and click "Record Activity"
4. Click "Decrypt" on any activity card to view your encrypted activity data

### 5. Network Information

**Local Development (Chain ID: 31337)**
- Contract: Check `deployments/localhost/EncryptedPrivacyVault.json`
- RPC: `http://localhost:8545`
- Free test accounts with 10,000 ETH each

**Sepolia Testnet (Chain ID: 11155111)**
- Contract: Check `deployments/sepolia/EncryptedPrivacyVault.json`
- RPC: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- Requires test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

## Available Scripts

### Backend Scripts

```bash
# Clean build artifacts
npm run clean

# Compile contracts
npm run compile

# Run tests on local network
npm run test

# Run tests on Sepolia testnet
npm run test:sepolia

# Start local Hardhat node
npm run local-node

# Deploy contracts to local network
npm run deploy-local

# Deploy contracts to Sepolia
npm run deploy-sepolia
```

### Frontend Scripts

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Generate ABI files
npm run genabi

# Lint code
npm run lint
```

## Contract Addresses

### Local Network (Hardhat)
- EncryptedPrivacyVault: Check `deployments/localhost/EncryptedPrivacyVault.json`

### Sepolia Testnet
- EncryptedPrivacyVault: Check `deployments/sepolia/EncryptedPrivacyVault.json` (after deployment)

## How It Works

1. **Storing Privacy Data**:
   - User enters privacy data value
   - Data is encrypted using FHEVM before sending to contract
   - Contract stores encrypted privacy data

2. **Data Storage**:
   - Data accumulates with each storage operation
   - All operations happen in encrypted form
   - Tracks data count and last update time

3. **Viewing Privacy Data**:
   - Users can decrypt their own privacy data
   - Decryption happens client-side using FHEVM
   - Only the user can see their decrypted data

## Security Features

- **Fully Homomorphic Encryption**: All computations happen on encrypted data
- **User Isolation**: Each user's data is completely separate
- **Client-Side Decryption**: Users decrypt their own data locally
- **Zero-Knowledge**: Contract cannot see actual privacy data values

## Development

### Project Structure

```
lock-box/
├── contracts/              # Solidity contracts
├── test/                   # Contract tests
├── tasks/                  # Hardhat tasks
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── abi/               # Generated ABI files
│   └── fhevm/             # FHEVM utilities
├── deployments/           # Deployment artifacts
└── types/                 # TypeScript types
```

## Troubleshooting

### Common Issues

#### MetaMask Connection Issues
- **Error**: "MetaMask extension not found" or "Failed to connect to MetaMask"
- **Solution**: Ensure MetaMask extension is installed and enabled in your browser

#### Network Connection Issues
- **Error**: "Unsupported chainId" or "Network not found"
- **Solution**: Add the local network to MetaMask:
  - Network Name: `Localhost 8545`
  - RPC URL: `http://localhost:8545`
  - Chain ID: `31337`

#### Port Conflicts
- **Error**: Port 3000 is already in use
- **Solution**: Application automatically uses next available port (3001, 3002, etc.)

#### Module Resolution Warnings
- **Warning**: `Can't resolve '@react-native-async-storage/async-storage'`
- **Note**: This is a harmless warning from MetaMask SDK in web environment

#### Coinbase Analytics Errors
- **Error**: Failed to fetch from `cca-lite.coinbase.com`
- **Note**: These are third-party analytics errors and don't affect app functionality

### Development Commands

```bash
# Check if Hardhat node is running
curl http://localhost:8545

# Reset local blockchain state
npm run clean-node

# Rebuild contracts
npm run compile

# Run tests
npm test

# Deploy contracts locally
npm run deploy-local
```

## License

BSD-3-Clause-Clear License

## Acknowledgments

- Built with [FHEVM](https://docs.zama.ai/fhevm) by Zama
- Frontend template based on [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template)
- Wallet integration using [RainbowKit](https://rainbowkit.com)

