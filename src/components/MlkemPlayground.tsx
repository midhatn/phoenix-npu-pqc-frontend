import React, { useState } from 'react';
import { Key, Lock, Unlock, Play, Copy, Check, ShieldAlert, Cpu, RefreshCw, Layers } from 'lucide-react';
import { MlkemParameterSet, MlkemKeyPair, MlkemEncapsResult, MlkemDecapsResult } from '../types';
import { MLKEM_PARAMS, mlkemKeyGen, mlkemEncaps, mlkemDecaps } from '../crypto/mlkem';
import { formatHexView } from '../utils';

export const MlkemPlayground: React.FC = () => {
  const [paramSet, setParamSet] = useState<MlkemParameterSet>('ML-KEM-512');
  const [keyPair, setKeyPair] = useState<MlkemKeyPair | null>(null);
  const [encapsResult, setEncapsResult] = useState<MlkemEncapsResult | null>(null);
  const [decapsResult, setDecapsResult] = useState<MlkemDecapsResult | null>(null);
  const [tamperCt, setTamperCt] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const params = MLKEM_PARAMS[paramSet];

  const handleGenerateKey = () => {
    const pair = mlkemKeyGen(paramSet);
    setKeyPair(pair);
    setEncapsResult(null);
    setDecapsResult(null);
  };

  const handleEncaps = () => {
    if (!keyPair) return;
    const res = mlkemEncaps(paramSet, keyPair.publicKeyHex);
    setEncapsResult(res);
    setDecapsResult(null);
  };

  const handleDecaps = () => {
    if (!keyPair || !encapsResult) return;
    let ct = encapsResult.ciphertextHex;
    if (tamperCt) {
      // Flip first hex nibble to simulate active ciphertext tampering
      const firstNibble = ct[0] === '0' ? '1' : '0';
      ct = firstNibble + ct.slice(1);
    }
    const res = mlkemDecaps(paramSet, keyPair.secretKeyHex, ct);
    setDecapsResult(res);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Parameter Selection & Specification Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                NIST FIPS 203 Module (Kyber)
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
              and constant-time Fujisaki-Okamoto CCA decapsulation with zero host fallback.
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

        {/* Parameter Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Matrix Rank (k)</span>
            <span className="text-cyan-300 font-bold">{params.k} × {params.k}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">NIST Category</span>
            <span className="text-slate-200 font-bold">Category {params.securityCategory}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Public Key (pk)</span>
            <span className="text-slate-200 font-bold">{params.pkSize} Bytes</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Secret Key (sk)</span>
            <span className="text-slate-200 font-bold">{params.skSize} Bytes</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Ciphertext (ct)</span>
            <span className="text-slate-200 font-bold">{params.ctSize} Bytes</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Tile RAM Budget</span>
            <span className="text-emerald-400 font-bold">&lt; 64 KiB / Tile</span>
          </div>
        </div>
      </div>

      {/* Stage 1: Key Generation */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Stage 1: ML-KEM Key Generation (KeyGen)</h3>
              <p className="text-xs text-slate-400">Generates matrix seeds ρ, σ, samples secrets s, e, and outputs (pk, sk).</p>
            </div>
          </div>

          <button
            id="btn-mlkem-keygen"
            onClick={handleGenerateKey}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium transition active:scale-95 cursor-pointer shadow-md shadow-blue-600/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate {paramSet} Keys</span>
          </button>
        </div>

        {keyPair && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-cyan-400 font-semibold">Public Key (pk) · {params.pkSize} Bytes</span>
                <button
                  onClick={() => copyToClipboard(keyPair.publicKeyHex, 'pk')}
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  {copiedKey === 'pk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre p-2 bg-slate-900/60 rounded border border-slate-800/80">
                {formatHexView(keyPair.publicKeyHex, 48)}
              </pre>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-purple-400 font-semibold">Secret Key (sk) · {params.skSize} Bytes</span>
                <button
                  onClick={() => copyToClipboard(keyPair.secretKeyHex, 'sk')}
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  {copiedKey === 'sk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre p-2 bg-slate-900/60 rounded border border-slate-800/80">
                {formatHexView(keyPair.secretKeyHex, 48)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Stage 2: Encapsulation */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Stage 2: Encapsulation (Encaps)</h3>
              <p className="text-xs text-slate-400">Encrypts ephemeral message m under pk to produce (ct, Shared Secret ss).</p>
            </div>
          </div>

          <button
            id="btn-mlkem-encaps"
            disabled={!keyPair}
            onClick={handleEncaps}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition active:scale-95 cursor-pointer ${
              keyPair
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Encapsulate Secret</span>
          </button>
        </div>

        {encapsResult && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-emerald-400 font-semibold">Ciphertext (ct) · {params.ctSize} Bytes</span>
                  <button
                    onClick={() => copyToClipboard(encapsResult.ciphertextHex, 'ct')}
                    className="hover:text-white transition flex items-center space-x-1"
                  >
                    {copiedKey === 'ct' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre p-2 bg-slate-900/60 rounded border border-slate-800/80">
                  {formatHexView(encapsResult.ciphertextHex, 48)}
                </pre>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-amber-400 font-semibold">Sender Shared Secret (ss) · 32 Bytes</span>
                  <button
                    onClick={() => copyToClipboard(encapsResult.sharedSecretHex, 'ss')}
                    className="hover:text-white transition flex items-center space-x-1"
                  >
                    {copiedKey === 'ss' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-amber-300 text-[11px] overflow-x-auto whitespace-pre p-2 bg-slate-900/60 rounded border border-slate-800/80">
                  {formatHexView(encapsResult.sharedSecretHex, 32)}
                </pre>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800">
              <span className="flex items-center space-x-1 text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>NPU Hardware Cycles: {encapsResult.npuCycles.toLocaleString()}</span>
              </span>
              <span>Runtime: {encapsResult.encapsTimeMs} ms</span>
            </div>
          </div>
        )}
      </div>

      {/* Stage 3: Decapsulation & Constant-Time Fault Injection */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Stage 3: Decapsulation (Decaps) & Fault Injection</h3>
              <p className="text-xs text-slate-400">Decodes ciphertext, re-encrypts on-chip, and checks Fujisaki-Okamoto CCA equality.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
              <input
                type="checkbox"
                id="checkbox-tamper-ct"
                checked={tamperCt}
                onChange={(e) => setTamperCt(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={tamperCt ? 'text-rose-400 font-bold' : ''}>
                Simulate Tampered Ciphertext
              </span>
            </label>

            <button
              id="btn-mlkem-decaps"
              disabled={!encapsResult}
              onClick={handleDecaps}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition active:scale-95 cursor-pointer ${
                encapsResult
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Decapsulate</span>
            </button>
          </div>
        </div>

        {decapsResult && (
          <div className="mt-4 space-y-3">
            <div
              className={`p-4 rounded-lg border font-mono text-xs ${
                decapsResult.isValid
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {decapsResult.isValid ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="font-bold text-sm">
                    {decapsResult.isValid
                      ? 'CCA2 Decapsulation SUCCESS · Shared Secret Matched'
                      : 'Constant-Time Implicit Rejection Activated'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {decapsResult.isImplicitRejection ? 'J(z || ct) Fallback' : 'K = K_prime'}
                </span>
              </div>

              <div className="mt-2 bg-slate-950 p-2.5 rounded border border-slate-900">
                <span className="text-slate-400 block text-[11px] mb-1">
                  Receiver Recovered Shared Secret (ss):
                </span>
                <span className={`font-mono text-xs ${decapsResult.isValid ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {decapsResult.recoveredSecretHex}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                <span>NPU Cycles: {decapsResult.npuCycles.toLocaleString()}</span>
                <span>Decaps Time: {decapsResult.decapsTimeMs} ms</span>
                <span>Constant-Time Barrier: ACTIVE (Zero Timing Leakage)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
