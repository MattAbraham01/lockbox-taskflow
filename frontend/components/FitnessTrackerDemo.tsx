"use client";

import { useState, useMemo } from "react";
import { ethers } from "ethers";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useEncryptedFitnessTracker, ActivityType } from "../hooks/useEncryptedFitnessTracker";
import { errorNotDeployed } from "./ErrorNotDeployed";

export const FitnessTrackerDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const fhevmProvider = useMemo(
    () => (chainId === 31337 ? "http://localhost:8545" : provider),
    [chainId, provider]
  );

  const fhevmReadonlyProvider = useMemo(
    () =>
      chainId === 31337
        ? new ethers.JsonRpcProvider("http://localhost:8545")
        : ethersReadonlyProvider,
    [chainId, ethersReadonlyProvider]
  );

  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(ActivityType.Running);
  const [activityInput, setActivityInput] = useState<string>("30");
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider: fhevmProvider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const fitnessTracker = useEncryptedFitnessTracker({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: fhevmReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const handleStoreActivityData = () => {
    const minutes = parseInt(activityInput);
    if (minutes > 0) {
      fitnessTracker.storeActivityData(selectedActivity, minutes);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent">
            Welcome to Fitness Tracker
          </h2>
          <p className="text-purple-200 text-xl">
            Track your fitness activities with fully homomorphic encryption
          </p>
        </div>
        <button
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl text-lg transition-all transform hover:scale-105"
          onClick={connect}
        >
          🏃 Connect Wallet
        </button>
      </div>
    );
  }

  if (fitnessTracker.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-4 md:px-6 py-8">
      {/* Header with dark gradient */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
            🏃
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Fitness Tracker
            </h1>
            <p className="text-purple-200 text-lg">
              Encrypted fitness activity tracking with FHEVM
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Activity Data Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                💾
              </div>
              <h2 className="text-2xl font-bold text-white">Record Activity</h2>
            </div>

            {/* Activity Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {fitnessTracker.ACTIVITY_TYPES.map((activity) => (
                <button
                  key={activity.type}
                  onClick={() => setSelectedActivity(activity.type)}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedActivity === activity.type
                      ? `bg-gradient-to-r ${activity.color} border-white text-white shadow-lg`
                      : 'bg-gray-700/50 border-purple-500/30 text-gray-300 hover:border-purple-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{activity.label.split(' ')[0]}</div>
                  <div className="text-sm font-medium">{activity.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={activityInput}
                  onChange={(e) => setActivityInput(e.target.value)}
                  className="w-full rounded-xl bg-gray-700/50 border-2 border-purple-500/30 px-5 py-4 text-lg font-medium text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder={`Enter ${fitnessTracker.ACTIVITY_TYPES.find(a => a.type === selectedActivity)?.label.split(' ')[1]} minutes`}
                />
              </div>
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all transform hover:scale-105 disabled:transform-none"
                disabled={!fitnessTracker.canStoreActivityData}
                onClick={handleStoreActivityData}
              >
                {fitnessTracker.isStoring ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Recording...
                  </span>
                ) : (
                  `💾 Record ${activityInput} min`
                )}
              </button>
            </div>
          </div>

          {/* Activity Data Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fitnessTracker.ACTIVITY_TYPES.map((activity) => {
              const handle = fitnessTracker.activityHandles[activity.type];
              const isDecrypted = fitnessTracker.isActivityDecrypted(activity.type);
              const clearData = fitnessTracker.clearActivityData[activity.type];

              return (
                <div key={activity.type} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-purple-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${activity.color} flex items-center justify-center text-xl shadow-lg`}>
                      {activity.label.split(' ')[0]}
                    </div>
                    <h4 className="text-lg font-bold text-white">{activity.label.split(' ')[1]}</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Encrypted Data Display */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Encrypted</span>
                        <span className="text-xl">🔒</span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">
                        {handle && handle !== "0" ? "[ENCRYPTED_FHE_HANDLE]" : "No data"}
                      </p>
                    </div>

                    {/* Decrypted Data Display */}
                    <div className={`bg-gradient-to-br ${activity.color.replace('500', '900/50')} rounded-xl p-4 border border-opacity-40`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white uppercase tracking-wide">Total Time</span>
                        {isDecrypted && <span className="text-xl">✅</span>}
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {isDecrypted ? `${clearData?.clear?.toString()} min` : "—"}
                      </p>
                    </div>

                    {/* Decrypt Button */}
                    <button
                      className={`w-full bg-gradient-to-r ${activity.color} hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none text-sm`}
                      disabled={!fitnessTracker.canDecryptActivity(activity.type)}
                      onClick={() => fitnessTracker.decryptActivityData(activity.type)}
                    >
                      {fitnessTracker.isDecrypting[activity.type] ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Decrypting...
                        </span>
                      ) : isDecrypted ? (
                        "🔓 Decrypted ✓"
                      ) : (
                        "🔓 Decrypt"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📊</span>
                <h4 className="text-lg font-semibold text-white">Total Activities</h4>
              </div>
              <p className="text-3xl font-bold text-purple-300">
                {fitnessTracker.totalActivities ?? 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h4 className="text-lg font-semibold text-white">Activities Tracked</h4>
              </div>
              <p className="text-3xl font-bold text-purple-300">
                {Object.values(fitnessTracker.activityHandles).filter(handle => handle && handle !== "0").length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⏰</span>
                <h4 className="text-lg font-semibold text-white">Last Activity</h4>
              </div>
              <p className="text-sm font-medium text-purple-300">
                {fitnessTracker.lastUpdateTime
                  ? new Date(Number(fitnessTracker.lastUpdateTime) * 1000).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none"
            disabled={!fitnessTracker.canGetFitnessData}
            onClick={fitnessTracker.refreshFitnessData}
          >
            {fitnessTracker.isRefreshing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Refreshing...
              </span>
            ) : (
              "🔄 Refresh Activities"
            )}
          </button>
        </div>

        {/* Right Column - Status & Debug */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-6">System Status</h3>
            <div className="space-y-4">
              <StatusItem
                label="FHEVM"
                value={fhevmInstance ? "Connected" : "Disconnected"}
                isGood={!!fhevmInstance}
              />
              <StatusItem
                label="Contract"
                value={fitnessTracker.isDeployed ? "Deployed" : "Not Deployed"}
                isGood={!!fitnessTracker.isDeployed}
              />
              <StatusItem
                label="Network"
                value={`Chain ${chainId}`}
                isGood={true}
              />
            </div>
          </div>

          {/* Message Card */}
          {fitnessTracker.message && (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-400/40 rounded-2xl p-4 slide-in">
              <p className="text-sm text-purple-200">{fitnessTracker.message}</p>
            </div>
          )}

          {/* Activity Summary */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-purple-500/30">
            <h4 className="text-lg font-bold text-white mb-4">Activity Summary</h4>
            <div className="space-y-2">
              {fitnessTracker.ACTIVITY_TYPES.map((activity) => {
                const handle = fitnessTracker.activityHandles[activity.type];
                const hasData = handle && handle !== "0";
                return (
                  <div key={activity.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{activity.label.split(' ')[1]}</span>
                    <div className="flex items-center gap-2">
                      {hasData && <span className="text-green-400">●</span>}
                      <span className="text-xs text-gray-400">
                        {fitnessTracker.isActivityDecrypted(activity.type)
                          ? `${fitnessTracker.clearActivityData[activity.type]?.clear?.toString()} min`
                          : hasData ? "Encrypted" : "None"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Debug Toggle */}
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="w-full text-sm text-purple-300 hover:text-purple-200 underline transition-colors"
          >
            {showDebugInfo ? "Hide" : "Show"} Debug Info
          </button>

          {/* Debug Info */}
          {showDebugInfo && (
            <div className="bg-gray-900/80 rounded-2xl p-6 border border-purple-500/30 space-y-4">
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wide">
                Debug Information
              </h3>
              <div className="space-y-2 text-xs">
                <DebugItem label="ChainId" value={chainId} />
                <DebugItem
                  label="Signer"
                  value={
                    ethersSigner
                      ? `${ethersSigner.address.slice(0, 6)}...${ethersSigner.address.slice(-4)}`
                      : "No signer"
                  }
                />
                <DebugItem
                  label="Contract"
                  value={
                    fitnessTracker.contractAddress
                      ? `${fitnessTracker.contractAddress.slice(0, 6)}...${fitnessTracker.contractAddress.slice(-4)}`
                      : "Not deployed"
                  }
                />
                <DebugItem label="FHEVM Status" value={fhevmStatus} />
                <DebugItem
                  label="FHEVM Error"
                  value={fhevmError?.message || "No error"}
                />
                <DebugItem label="isRefreshing" value={fitnessTracker.isRefreshing} />
                <DebugItem label="isStoring" value={fitnessTracker.isStoring} />
                <DebugItem label="Total Activities" value={fitnessTracker.totalActivities} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function StatusItem({
  label,
  value,
  isGood,
}: {
  label: string;
  value: string;
  isGood: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isGood ? "bg-green-400" : "bg-red-400"
          }`}
        ></div>
        <span className="text-sm font-medium text-white">{value}</span>
      </div>
    </div>
  );
}

function DebugItem({ label, value }: { label: string; value: unknown }) {
  const displayValue =
    typeof value === "boolean"
      ? value
        ? "true"
        : "false"
      : typeof value === "string" || typeof value === "number"
      ? String(value)
      : value === null || value === undefined
      ? String(value)
      : JSON.stringify(value);

  return (
    <div className="flex justify-between">
      <span className="text-gray-400 font-mono">{label}:</span>
      <span className="text-purple-300 font-mono font-semibold">{displayValue}</span>
    </div>
  );
}

