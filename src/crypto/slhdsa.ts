import { SlhdsaParameterSet } from '../types';

export interface SlhdsaParamsConfig {
  name: SlhdsaParameterSet;
  securityLevel: number;
  hashFunction: string;
  n: number;
  h: number;
  d: number;
  hp: number;
  a: number;
  k: number;
  w: number;
  pkBytes: number;
  skBytes: number;
  sigBytes: number;
  description: string;
}

export const SLHDSA_PARAMS_CONFIG: Record<SlhdsaParameterSet, SlhdsaParamsConfig> = {
  'SLH-DSA-SHAKE-128s': {
    name: 'SLH-DSA-SHAKE-128s',
    securityLevel: 1,
    hashFunction: 'SHAKE-256 (Keccak-f[1600])',
    n: 16,
    h: 63,
    d: 7,
    hp: 9,
    a: 12,
    k: 14,
    w: 16,
    pkBytes: 32,
    skBytes: 64,
    sigBytes: 7856,
    description: 'NIST Security Category 1 small signature variant (~7.8 KB). Maximum hash tree optimization.',
  },
  'SLH-DSA-SHAKE-128f': {
    name: 'SLH-DSA-SHAKE-128f',
    securityLevel: 1,
    hashFunction: 'SHAKE-256 (Keccak-f[1600])',
    n: 16,
    h: 66,
    d: 22,
    hp: 3,
    a: 6,
    k: 33,
    w: 16,
    pkBytes: 32,
    skBytes: 64,
    sigBytes: 17088,
    description: 'NIST Security Category 1 fast signing variant. Optimized for high-throughput signing operations.',
  },
  'SLH-DSA-SHAKE-256s': {
    name: 'SLH-DSA-SHAKE-256s',
    securityLevel: 5,
    hashFunction: 'SHAKE-256 (Keccak-f[1600])',
    n: 32,
    h: 64,
    d: 8,
    hp: 8,
    a: 14,
    k: 17,
    w: 16,
    pkBytes: 64,
    skBytes: 128,
    sigBytes: 29792,
    description: 'NIST Security Category 5 (256-bit quantum security). Meets NSA CNSA 2.0 sovereign standards.',
  },
  'SLH-DSA-SHAKE-256f': {
    name: 'SLH-DSA-SHAKE-256f',
    securityLevel: 5,
    hashFunction: 'SHAKE-256 (Keccak-f[1600])',
    n: 32,
    h: 68,
    d: 17,
    hp: 4,
    a: 8,
    k: 35,
    w: 16,
    pkBytes: 64,
    skBytes: 128,
    sigBytes: 49856,
    description: 'NIST Security Category 5 fast variant with deep Hypertree parallelism across AIE2 vector tiles.',
  },
};
