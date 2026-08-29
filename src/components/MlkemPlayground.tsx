import React, { useState } from 'react';
import { Key, Lock, Unlock, Copy, Check, ShieldAlert, RefreshCw, Zap } from 'lucide-react';
import { MlkemParameterSet, MlkemKeyPair, MlkemEncapsResult, MlkemDecapsResult } from '../types';
import { MLKEM_PARAMS } from '../crypto/mlkem';
import { npuMlkemKeyGen, npuMlkemEncaps, npuMlkemDecaps } from '../crypto/hardwareApi';
import { formatHexView } from '../utils';

export const MlkemPlayground: React.FC = () => {
  const [paramSet, setParamSet] = useState<MlkemParameterSet>('ML-KEM-512');
  const [keyPair, setKeyPair] = useState<(MlkemKeyPair & { isHardware?: boolean; hardwareLabel?: string; executionTimeMs?: number }) | null>(null);
  const [encapsResult, setEncapsResult] = useState<(MlkemEncapsResult & { isHardware?: boolean; hardwareLabel?: string; executionTimeMs?: number }) | null>(null);
  const [decapsResult, setDecapsResult] = useState<(MlkemDecapsResult & { isHardware?: boolean; hardwareLabel?: string; executionTimeMs?: number }) | null>(null);
  const [tamperCt, setTamperCt] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const params = MLKEM_PARAMS[paramSet];

  const handleGenerateKey = async () => {
    setLoadingAction('keygen');
    try {
      const pair = await npuMlkemKeyGen(paramSet);
      setKeyPair(pair);
      setEncapsResult(null);
      setDecapsResult(null);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEncaps = async () => {
    if (!keyPair) return;
    setLoadingAction('encaps');
    try {
      const res = await npuMlkemEncaps(paramSet, keyPair.publicKeyHex);
      setEncapsResult(res);
      setDecapsResult(null);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDecaps = async () => {
    if (!keyPair || !encapsResult) return;
    setLoadingAction('decaps');
    try {
      let ct = encapsResult.ciphertextHex;
      if (tamperCt) {
        const firstNibble = ct[0] === '0' ? '1' : '0';
        ct = firstNibble + ct.slice(1);
      }
      const res = await npuMlkemDecaps(paramSet, keyPair.secretKeyHex, ct);
      setDecapsResult(res);
    } finally {
      setLoadingAction(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                NIST FIPS 203 Module (ML-KEM)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Milestones DR2..DR8
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Module-Lattice-Based Key-Encapsulation Mechanism
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              100% on-device AIE2 SIMD acceleration of SampleNTT, Centered Binomial Noise (CBD),
              and constant-time Fujisaki-Okamoto CCA decapsulation on AMD Phoenix NPU silicon.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {(['ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024'] as MlkemParameterSet[]).map((p) => (
              <button
                key={p}
                id={`btn-param-${p}`}
                onClick={() => {
                  setParamSet(p);
                  setKeyPair(null);
                  setEncapsResult(null);
                  setDecapsResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                  paramSet === p
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Matrix Rank (k)</span>
            <span className="text-cyan-300 font-bold">{params.k} × {params.k}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Modulus (q)</span>
            <span className="text-cyan-300 font-bold">3329</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Public Key (ek)</span>
            <span className="text-cyan-300 font-bold">{params.pkSize} B</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Secret Key (dk)</span>
            <span className="text-cyan-300 font-bold">{params.skSize} B</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Ciphertext (c)</span>
            <span className="text-cyan-300 font-bold">{params.ctSize} B</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Security Category</span>
            <span className="text-emerald-400 font-bold">NIST Level {params.securityCategory}</span>
          </div>
        </div>
      </div>

      {/* 3-Step Interactive Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Key Generation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-white text-sm">Key Generation</h3>
              </div>
              {keyPair?.isHardware && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({keyPair.executionTimeMs?.toFixed(1)}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Generates public encapsulation key <code>ek</code> and private decapsulation key <code>dk</code> on AIE2 vector compute tiles.
            </p>

            {keyPair && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Public Key (ek) [{keyPair.publicKeyHex.length / 2} bytes]</span>
                    <button
                      onClick={() => copyToClipboard(keyPair.publicKeyHex, 'ek')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'ek' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'ek' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-slate-300 text-[11px] overflow-x-auto max-h-24 select-all">
                    {formatHexView(keyPair.publicKeyHex)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Secret Key (dk) [{keyPair.secretKeyHex.length / 2} bytes]</span>
                    <button
                      onClick={() => copyToClipboard(keyPair.secretKeyHex, 'dk')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'dk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'dk' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-slate-300 text-[11px] overflow-x-auto max-h-24 select-all">
                    {formatHexView(keyPair.secretKeyHex)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            id="btn-mlkem-keygen"
            onClick={handleGenerateKey}
            disabled={loadingAction !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-cyan-600/30 active:scale-98 disabled:opacity-50"
          >
            {loadingAction === 'keygen' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing on Physical NPU...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>{keyPair ? 'Regenerate on NPU Silicon' : 'Generate KeyPair on NPU'}</span>
              </>
            )}
          </button>
        </div>

        {/* Step 2: Encapsulation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-white text-sm">Encapsulation</h3>
              </div>
              {encapsResult?.isHardware && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({encapsResult.executionTimeMs?.toFixed(1)}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Encrypts random 32-byte shared secret using public key <code>ek</code> to produce ciphertext <code>c</code>.
            </p>

            {encapsResult && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Ciphertext (c) [{encapsResult.ciphertextHex.length / 2} bytes]</span>
                    <button
                      onClick={() => copyToClipboard(encapsResult.ciphertextHex, 'ct')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'ct' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'ct' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-slate-300 text-[11px] overflow-x-auto max-h-24 select-all">
                    {formatHexView(encapsResult.ciphertextHex)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Shared Secret (ss) [32 bytes]</span>
                    <button
                      onClick={() => copyToClipboard(encapsResult.sharedSecretHex, 'ss1')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'ss1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'ss1' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-emerald-900/50 text-emerald-400 text-[11px] select-all">
                    {encapsResult.sharedSecretHex}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            id="btn-mlkem-encaps"
            onClick={handleEncaps}
            disabled={!keyPair || loadingAction !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/30 active:scale-98 disabled:cursor-not-allowed"
          >
            {loadingAction === 'encaps' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Encapsulating on NPU Silicon...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{encapsResult ? 'Re-Encapsulate on NPU' : 'Encapsulate on NPU Silicon'}</span>
              </>
            )}
          </button>
        </div>

        {/* Step 3: Decapsulation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="font-bold text-white text-sm">Decapsulation</h3>
              </div>
              {decapsResult?.isHardware && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({decapsResult.executionTimeMs?.toFixed(1)}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Recovers shared secret <code>ss</code> using secret key <code>dk</code> with constant-time implicit rejection.
            </p>

            {/* Active Tamper Toggle */}
            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Active Ciphertext Tampering</span>
                </span>
                <input
                  type="checkbox"
                  checked={tamperCt}
                  onChange={(e) => setTamperCt(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            {decapsResult && encapsResult && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Decapsulated Shared Secret</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      decapsResult.recoveredSecretHex === encapsResult.sharedSecretHex && !tamperCt
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {decapsResult.recoveredSecretHex === encapsResult.sharedSecretHex && !tamperCt
                        ? '100% BIT-EXACT MATCH'
                        : 'IMPLICIT REJECTION ACTIVE'}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded border text-[11px] select-all ${
                    decapsResult.recoveredSecretHex === encapsResult.sharedSecretHex && !tamperCt
                      ? 'bg-slate-950 border-emerald-900/50 text-emerald-400'
                      : 'bg-slate-950 border-amber-900/50 text-amber-400'
                  }`}>
                    {decapsResult.recoveredSecretHex}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            id="btn-mlkem-decaps"
            onClick={handleDecaps}
            disabled={!encapsResult || loadingAction !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/30 active:scale-98 disabled:cursor-not-allowed"
          >
            {loadingAction === 'decaps' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Decapsulating on NPU Silicon...</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>{decapsResult ? 'Re-Decapsulate on NPU' : 'Decapsulate on NPU Silicon'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
