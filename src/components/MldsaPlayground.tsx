import React, { useState } from 'react';
import { FileSignature, ShieldCheck, ShieldX, Key, RefreshCw, Play, Copy, Check, Cpu, AlertTriangle } from 'lucide-react';
import { MldsaParameterSet, MldsaKeyPair, MldsaSignatureResult, MldsaVerifyResult } from '../types';
import { MLDSA_PARAMS, mldsaKeyGen, mldsaSign, mldsaVerify } from '../crypto/mldsa';
import { formatHexView } from '../utils';

export const MldsaPlayground: React.FC = () => {
  const [paramSet, setParamSet] = useState<MldsaParameterSet>('ML-DSA-44');
  const [keyPair, setKeyPair] = useState<MldsaKeyPair | null>(null);
  const [message, setMessage] = useState<string>('Phoenix NPU: 100% On-Device PQC Silicon Certification');
  const [isRandomized, setIsRandomized] = useState<boolean>(true);
  const [sigResult, setSigResult] = useState<MldsaSignatureResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<MldsaVerifyResult | null>(null);
  const [tamperSig, setTamperSig] = useState<boolean>(false);
  const [tamperMsg, setTamperMsg] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const params = MLDSA_PARAMS[paramSet];

  const handleGenerateKey = () => {
    const pair = mldsaKeyGen(paramSet);
    setKeyPair(pair);
    setSigResult(null);
    setVerifyResult(null);
  };

  const handleSign = () => {
    if (!keyPair) return;
    const res = mldsaSign(paramSet, keyPair.secretKeyHex, message, isRandomized);
    setSigResult(res);
    setVerifyResult(null);
  };

  const handleVerify = () => {
    if (!keyPair || !sigResult) return;
    const msgToVerify = tamperMsg ? message + ' [TAMPERED]' : message;
    let sigToVerify = sigResult.signatureHex;
    if (tamperSig) {
      // Corrupt a byte in signature challenge
      const firstNibble = sigToVerify[0] === '0' ? '1' : '0';
      sigToVerify = firstNibble + sigToVerify.slice(1);
    }
    const res = mldsaVerify(paramSet, keyPair.publicKeyHex, msgToVerify, sigToVerify);
    setVerifyResult(res);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Specs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                NIST FIPS 204 Module (Dilithium)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                Milestones DR11..DR15
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Module-Lattice-Based Digital Signature Standard
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Physical AIE2 acceleration of matrix ExpandA, rejection sampling loops,
              HighBits/LowBits hint decomposition, and signature verification with zero host fallback.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {(['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87'] as MldsaParameterSet[]).map((p) => (
              <button
                key={p}
                id={`btn-param-${p}`}
                onClick={() => {
                  setParamSet(p);
                  setKeyPair(null);
                  setSigResult(null);
                  setVerifyResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                  paramSet === p
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Specs breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Matrix Rank (k × l)</span>
            <span className="text-indigo-300 font-bold">{params.k} × {params.l}</span>
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
            <span className="text-slate-500 block text-[10px]">Signature (sig)</span>
            <span className="text-slate-200 font-bold">{params.sigSize} Bytes</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Noise Bound (η)</span>
            <span className="text-emerald-400 font-bold">η = {params.eta}</span>
          </div>
        </div>
      </div>

      {/* Stage 1: KeyGen */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Stage 1: Key Generation (KeyGen)</h3>
              <p className="text-xs text-slate-400">Samples secrets s1, s2 and compresses lattice public matrix vector t1.</p>
            </div>
          </div>

          <button
            id="btn-mldsa-keygen"
            onClick={handleGenerateKey}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium transition active:scale-95 cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate {paramSet} Keys</span>
          </button>
        </div>

        {keyPair && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-indigo-400 font-semibold">Public Verification Key (pk) · {params.pkSize} Bytes</span>
                <button
                  onClick={() => copyToClipboard(keyPair.publicKeyHex, 'mldsa-pk')}
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  {copiedKey === 'mldsa-pk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre p-2 bg-slate-900/60 rounded border border-slate-800/80">
                {formatHexView(keyPair.publicKeyHex, 48)}
              </pre>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-purple-400 font-semibold">Secret Signing Key (sk) · {params.skSize} Bytes</span>
                <button
                  onClick={() => copyToClipboard(keyPair.secretKeyHex, 'mldsa-sk')}
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  {copiedKey === 'mldsa-sk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
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

      {/* Stage 2: Signing */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center">
                <FileSignature className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Stage 2: Digital Signing (Sign)</h3>
                <p className="text-xs text-slate-400">Rejection sampling with challenge hash c̃ and hint polynomial packing.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  id="checkbox-randomized-sign"
                  checked={isRandomized}
                  onChange={(e) => setIsRandomized(e.target.checked)}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                <span>Hedged / Randomized</span>
              </label>

              <button
                id="btn-mldsa-sign"
                disabled={!keyPair}
                onClick={handleSign}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition active:scale-95 cursor-pointer ${
                  keyPair
                    ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Sign Message</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Payload / Message to Sign:</label>
            <input
              type="text"
              id="input-mldsa-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {sigResult && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-teal-400 font-semibold">
                    Signature Container (z, h, c̃) · {params.sigSize} Bytes
                  </span>
                  <button
                    onClick={() => copyToClipboard(sigResult.signatureHex, 'mldsa-sig')}
                    className="hover:text-white transition flex items-center space-x-1"
                  >
                    {copiedKey === 'mldsa-sig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre p-2 bg-slate-900/60 rounded border border-slate-800/80">
                  {formatHexView(sigResult.signatureHex, 48)}
                </pre>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800">
                <span className="flex items-center space-x-1 text-teal-400">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>NPU Hardware Cycles: {sigResult.npuCycles.toLocaleString()}</span>
                </span>
                <span>Rejection Iterations: {sigResult.rejectionLoops}</span>
                <span>Hint Weight (ω): {sigResult.hintWeight} / {params.omega}</span>
                <span>Signing Time: {sigResult.signTimeMs} ms</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stage 3: Verification */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Stage 3: Verification (Verify) & Tampering Test</h3>
              <p className="text-xs text-slate-400">Rebuilds lattice equation Az - ct1 and checks infinity norm and hints.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                id="checkbox-tamper-msg"
                checked={tamperMsg}
                onChange={(e) => setTamperMsg(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={tamperMsg ? 'text-rose-400 font-bold' : ''}>Tamper Message</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                id="checkbox-tamper-sig"
                checked={tamperSig}
                onChange={(e) => setTamperSig(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={tamperSig ? 'text-rose-400 font-bold' : ''}>Tamper Signature</span>
            </label>

            <button
              id="btn-mldsa-verify"
              disabled={!sigResult}
              onClick={handleVerify}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition active:scale-95 cursor-pointer ${
                sigResult
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Signature</span>
            </button>
          </div>
        </div>

        {verifyResult && (
          <div className="mt-4 space-y-3">
            <div
              className={`p-4 rounded-lg border font-mono text-xs ${
                verifyResult.isValid
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {verifyResult.isValid ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldX className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-bold text-sm">
                  {verifyResult.isValid ? 'VALID SIGNATURE VERIFIED' : 'SIGNATURE VERIFICATION FAILED'}
                </span>
              </div>
              <p className="mt-1 text-slate-300 text-xs">{verifyResult.details}</p>

              <div className="mt-3 flex items-center space-x-4 text-[11px] text-slate-400">
                <span>Verification Time: {verifyResult.verifyTimeMs} ms</span>
                <span>NPU Cycles: {verifyResult.npuCycles.toLocaleString()}</span>
                <span>Host Intercepts: 0 (Device Resident)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
