//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider } from "ethers";
import { FhevmInstance } from "../../fhevmTypes";

// Minimal fallback implementation when @fhevm/mock-utils is not available
const createMinimalLocalMockInstance = (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): FhevmInstance => {
  console.warn("[createMinimalLocalMockInstance] Using minimal fallback - FHE operations will not work");

  const provider = new JsonRpcProvider(parameters.rpcUrl);

  // Return a minimal FhevmInstance implementation
  return {
    // Minimal implementation - just enough to prevent crashes
    async encrypt8(value: number): Promise<`0x${string}`> {
      // Return a dummy encrypted handle
      return `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;
    },
    async encrypt16(value: number): Promise<`0x${string}`> {
      return `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;
    },
    async encrypt32(value: number): Promise<`0x${string}`> {
      return `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;
    },
    async decrypt(handle: `0x${string}`): Promise<number> {
      throw new Error("Decryption not supported in minimal fallback mode");
    },
    async reencrypt(
      handle: `0x${string}`,
      userAddress: `0x${string}`,
      signature: string
    ): Promise<string> {
      throw new Error("Reencryption not supported in minimal fallback mode");
    },
  } as unknown as FhevmInstance;
};

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  // Since @fhevm/mock-utils is removed from dependencies to fix production builds,
  // we always use the fallback implementation
  console.warn("[fhevmMockCreateInstance] Using minimal fallback - FHE operations will not work in production");
  return createMinimalLocalMockInstance(parameters);
};
