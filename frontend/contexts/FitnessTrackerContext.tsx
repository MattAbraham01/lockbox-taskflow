"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { ethers } from "ethers";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useEncryptedFitnessTracker, ActivityType, ACTIVITY_TYPES, ClearValueType } from "../hooks/useEncryptedFitnessTracker";

// Storage key for persisting decrypted data
const STORAGE_KEY = "fitness_tracker_decrypted_data";

interface FitnessTrackerContextType {
  // Connection state
  isConnected: boolean;
  connect: () => void;
  chainId: number | undefined;
  
  // Fitness tracker state
  activityHandles: Record<ActivityType, string | undefined>;
  clearActivityData: Record<ActivityType, ClearValueType | undefined>;
  totalActivities: number | undefined;
  lastUpdateTime: number | undefined;
  message: string;
  contractAddress: string | undefined;
  isDeployed: boolean | undefined;
  
  // Loading states
  isRefreshing: boolean;
  isStoring: boolean;
  isDecrypting: Record<ActivityType, boolean>;
  
  // Actions
  storeActivityData: (activityType: ActivityType, minutes: number) => void;
  decryptActivityData: (activityType: ActivityType) => void;
  refreshFitnessData: () => void;
  
  // Helpers
  canStoreActivityData: boolean;
  canGetFitnessData: boolean;
  canDecryptActivity: (activityType: ActivityType) => boolean;
  isActivityDecrypted: (activityType: ActivityType) => boolean;
  
  // Constants
  ACTIVITY_TYPES: typeof ACTIVITY_TYPES;
}

const FitnessTrackerContext = createContext<FitnessTrackerContextType | null>(null);

export function FitnessTrackerProvider({ children }: { children: ReactNode }) {
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

  // Persisted decrypted data state
  const [persistedClearData, setPersistedClearData] = useState<Record<ActivityType, ClearValueType | undefined>>({
    [ActivityType.Running]: undefined,
    [ActivityType.Cycling]: undefined,
    [ActivityType.Swimming]: undefined,
    [ActivityType.Weightlifting]: undefined,
    [ActivityType.Yoga]: undefined,
    [ActivityType.Walking]: undefined,
  });

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

  const {
    instance: fhevmInstance,
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

  // Load persisted data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && ethersSigner?.address) {
      const storageKey = `${STORAGE_KEY}_${ethersSigner.address}_${chainId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert stored data back to proper format
          const restored: Record<ActivityType, ClearValueType | undefined> = {
            [ActivityType.Running]: undefined,
            [ActivityType.Cycling]: undefined,
            [ActivityType.Swimming]: undefined,
            [ActivityType.Weightlifting]: undefined,
            [ActivityType.Yoga]: undefined,
            [ActivityType.Walking]: undefined,
          };
          
          Object.entries(parsed).forEach(([key, value]) => {
            const activityType = parseInt(key) as ActivityType;
            if (value && typeof value === 'object' && 'handle' in value && 'clear' in value) {
              restored[activityType] = {
                handle: (value as any).handle,
                clear: BigInt((value as any).clear),
              };
            }
          });
          
          setPersistedClearData(restored);
          console.log("[FitnessTrackerContext] Loaded persisted data:", restored);
        } catch (e) {
          console.error("[FitnessTrackerContext] Failed to parse stored data:", e);
        }
      }
    }
  }, [ethersSigner?.address, chainId]);

  // Save decrypted data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && ethersSigner?.address) {
      const storageKey = `${STORAGE_KEY}_${ethersSigner.address}_${chainId}`;
      
      // Merge hook's clearActivityData with persisted data
      const mergedData: Record<ActivityType, ClearValueType | undefined> = { ...persistedClearData };
      
      Object.entries(fitnessTracker.clearActivityData).forEach(([key, value]) => {
        const activityType = parseInt(key) as ActivityType;
        if (value && value.clear !== undefined) {
          mergedData[activityType] = value;
        }
      });

      // Check if there's any data to save
      const hasData = Object.values(mergedData).some(v => v !== undefined);
      if (hasData) {
        // Convert BigInt to string for JSON serialization
        const toStore: Record<string, { handle: string; clear: string } | undefined> = {};
        Object.entries(mergedData).forEach(([key, value]) => {
          if (value) {
            toStore[key] = {
              handle: value.handle,
              clear: value.clear.toString(),
            };
          }
        });
        
        localStorage.setItem(storageKey, JSON.stringify(toStore));
        
        // Update persisted state if hook has new data
        if (Object.values(fitnessTracker.clearActivityData).some(v => v !== undefined)) {
          setPersistedClearData(mergedData);
        }
      }
    }
  }, [fitnessTracker.clearActivityData, ethersSigner?.address, chainId, persistedClearData]);

  // Merge persisted data with hook data
  const mergedClearActivityData = useMemo(() => {
    const merged: Record<ActivityType, ClearValueType | undefined> = { ...persistedClearData };
    
    // Hook data takes precedence over persisted data
    Object.entries(fitnessTracker.clearActivityData).forEach(([key, value]) => {
      const activityType = parseInt(key) as ActivityType;
      if (value && value.clear !== undefined) {
        merged[activityType] = value;
      }
    });
    
    return merged;
  }, [fitnessTracker.clearActivityData, persistedClearData]);

  // Enhanced isActivityDecrypted that checks both hook and persisted data
  const isActivityDecrypted = useCallback((activityType: ActivityType) => {
    const handle = fitnessTracker.activityHandles[activityType];
    const clearData = mergedClearActivityData[activityType];
    return handle && handle === clearData?.handle;
  }, [fitnessTracker.activityHandles, mergedClearActivityData]);

  // Enhanced canDecryptActivity that considers persisted data
  const canDecryptActivity = useCallback((activityType: ActivityType) => {
    // If already decrypted (including from persisted data), don't allow re-decrypt
    if (isActivityDecrypted(activityType)) {
      return false;
    }
    return fitnessTracker.canDecryptActivity(activityType);
  }, [fitnessTracker.canDecryptActivity, isActivityDecrypted]);

  const contextValue: FitnessTrackerContextType = {
    // Connection state
    isConnected,
    connect,
    chainId,
    
    // Fitness tracker state - use merged data
    activityHandles: fitnessTracker.activityHandles,
    clearActivityData: mergedClearActivityData,
    totalActivities: fitnessTracker.totalActivities,
    lastUpdateTime: fitnessTracker.lastUpdateTime,
    message: fitnessTracker.message,
    contractAddress: fitnessTracker.contractAddress,
    isDeployed: fitnessTracker.isDeployed,
    
    // Loading states
    isRefreshing: fitnessTracker.isRefreshing,
    isStoring: fitnessTracker.isStoring,
    isDecrypting: fitnessTracker.isDecrypting,
    
    // Actions
    storeActivityData: fitnessTracker.storeActivityData,
    decryptActivityData: fitnessTracker.decryptActivityData,
    refreshFitnessData: fitnessTracker.refreshFitnessData,
    
    // Helpers - use enhanced versions
    canStoreActivityData: fitnessTracker.canStoreActivityData,
    canGetFitnessData: fitnessTracker.canGetFitnessData,
    canDecryptActivity,
    isActivityDecrypted,
    
    // Constants
    ACTIVITY_TYPES: fitnessTracker.ACTIVITY_TYPES,
  };

  return (
    <FitnessTrackerContext.Provider value={contextValue}>
      {children}
    </FitnessTrackerContext.Provider>
  );
}

export function useFitnessTrackerContext() {
  const context = useContext(FitnessTrackerContext);
  if (!context) {
    throw new Error("useFitnessTrackerContext must be used within a FitnessTrackerProvider");
  }
  return context;
}
