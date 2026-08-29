export type PqcStandard = 'fips203' | 'fips204' | 'fips202' | 'silicon_gates' | 'hardware_arch' | 'test_runner';

export type MlkemParameterSet = 'ML-KEM-512' | 'ML-KEM-768' | 'ML-KEM-1024';
export type MldsaParameterSet = 'ML-DSA-44' | 'ML-DSA-65' | 'ML-DSA-87';
export type KeccakFunction = 'SHA3-224' | 'SHA3-256' | 'SHA3-384' | 'SHA3-512' | 'SHAKE128' | 'SHAKE256';

export interface SiliconGate {
  gateNumber: number;
  milestone: string;
  name: string;
  category: 'FIPS 202' | 'FIPS 203' | 'FIPS 204' | 'Hardware/DR0-10';
  algorithm: string;
  description: string;
  testCount: number;
  passedCount: number;
  avgRuntimeMs: number;
  textMemoryBytes: number; // Max 16384 (16 KiB)
  tileRamBytes: number;    // Max 65536 (64 KiB)
  dmaChannels: number;     // Max 2
  tilesUsed: number;
  zeroHostFallback: boolean;
  objectFifos: string[];
  status: 'CERTIFIED' | 'PASS' | 'PENDING';
}

export interface MlkemKeyPair {
  parameterSet: MlkemParameterSet;
  publicKeyHex: string;
  secretKeyHex: string;
  seedDHex: string;
  seedZHex: string;
  generatedAt: number;
}

export interface MlkemEncapsResult {
  parameterSet: MlkemParameterSet;
  ciphertextHex: string;
  sharedSecretHex: string;
  randomSeedHex: string;
  encapsTimeMs: number;
  npuCycles: number;
}

export interface MlkemDecapsResult {
  recoveredSecretHex: string;
  isValid: boolean;
  isImplicitRejection: boolean;
  decapsTimeMs: number;
  npuCycles: number;
}

export interface MldsaKeyPair {
  parameterSet: MldsaParameterSet;
  publicKeyHex: string;
  secretKeyHex: string;
  seedKHex: string;
  generatedAt: number;
}

export interface MldsaSignatureResult {
  parameterSet: MldsaParameterSet;
  signatureHex: string;
  message: string;
  messageHex: string;
  signTimeMs: number;
  npuCycles: number;
  rejectionLoops: number;
  hintWeight: number;
}

export interface MldsaVerifyResult {
  isValid: boolean;
  verifyTimeMs: number;
  npuCycles: number;
  details: string;
}

export interface TestExecutionResult {
  gateId: number;
  milestone: string;
  name: string;
  totalTests: number;
  passedTests: number;
  durationMs: number;
  status: 'passed' | 'failed' | 'running';
  log: string;
}
