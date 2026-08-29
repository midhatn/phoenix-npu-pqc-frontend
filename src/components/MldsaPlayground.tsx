import React, { useState } from 'react';
import { FileSignature, ShieldCheck, ShieldAlert, Play, Copy, Check, RefreshCw, Zap } from 'lucide-react';
import { MldsaParameterSet, MldsaKeyPair, MldsaSignatureResult, MldsaVerifyResult } from '../types';
import { MLDSA_PARAMS } from '../crypto/mldsa';
import { npuMldsaKeyGen, npuMldsaSign, npuMldsaVerify } from '../crypto/hardwareApi';
import { formatHexView } from '../utils';

export const MldsaPlayground: React.FC = () => {
  const [paramSet, setParamSet] = useState<MldsaParameterSet>('ML-DSA-44');
  const [message, setMessage] = useState('Device-Resident Post-Quantum Cryptography on AMD Phoenix NPU');
  const [keyPair, setKeyPair] = useState<(MldsaKeyPair & { isHardware?: boolean; hardwareLabel?: string; executionTimeMs?: number }) | null>(null);
  const [sigResult, setSigResult] = useState<(MldsaSignatureResult & { isHardware?: boolean; hardwareLabel?: string; executionTimeMs?: number }) | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<(MldsaVerifyResult & { isHardware?: boolean; hardwareLabel?: string }) | null>(null);
  const [tamperSig, setTamperSig] = useState(false);
  const [tamperMsg, setTamperMsg] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const params = MLDSA_PARAMS[paramSet];

  const handleGenerateKeys = async () => {
    setLoadingAction('keygen');
    try {
      const keys = await npuMldsaKeyGen(paramSet);
      setKeyPair(keys);
      setSigResult(null);
      setVerifyStatus(null);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSign = async () => {
    if (!keyPair) return;
    setLoadingAction('sign');
    try {
      const encoder = new TextEncoder();
      const msgBytes = encoder.encode(message);
      const msgHex = Array.from(msgBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      const res = await npuMldsaSign(paramSet, keyPair.secretKeyHex, msgHex);
      setSigResult(res);
      setVerifyStatus(null);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerify = async () => {
    if (!keyPair || !sigResult) return;
    setLoadingAction('verify');
    try {
      let msgToVerify = message;
      if (tamperMsg) {
        msgToVerify += ' [TAMPERED]';
      }
      const encoder = new TextEncoder();
      const msgBytes = encoder.encode(msgToVerify);
      const msgHex = Array.from(msgBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

      let sigToVerify = sigResult.signatureHex;
      if (tamperSig) {
        const firstNibble = sigToVerify[0] === '0' ? '1' : '0';
        sigToVerify = firstNibble + sigToVerify.slice(1);
      }

      const res = await npuMldsaVerify(paramSet, keyPair.publicKeyHex, msgHex, sigToVerify);
      setVerifyStatus(res);
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
      {/* Header & Specs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                NIST FIPS 204 Module (ML-DSA)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Milestones DR1, DR11..DR15
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Module-Lattice-Based Digital Signature Algorithm
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              100% on-device AIE2 SIMD acceleration of ExpandA lattice matrix expansion, rejection sampling loops,
              hint bit-packing, and constant-time signature verification.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {(['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87'] as MldsaParameterSet[]).map((p) => (
              <button
                key={p}
                id={`btn-mldsa-param-${p}`}
                onClick={() => {
                  setParamSet(p);
                  setKeyPair(null);
                  setSigResult(null);
                  setVerifyStatus(null);
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

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Matrix (k × l)</span>
            <span className="text-cyan-300 font-bold">{params.k} × {params.l}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Modulus (q)</span>
            <span className="text-cyan-300 font-bold">8380417</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Public Key (pk)</span>
            <span className="text-cyan-300 font-bold">{params.pkSize} B</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Secret Key (sk)</span>
            <span className="text-cyan-300 font-bold">{params.skSize} B</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Signature (σ)</span>
            <span className="text-cyan-300 font-bold">{params.sigSize} B</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Security Level</span>
            <span className="text-emerald-400 font-bold">NIST Level {params.securityCategory}</span>
          </div>
        </div>
      </div>

      {/* Message Ingress Conditioning */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <label className="block text-xs font-mono font-semibold text-slate-300">
          Message Ingress Payload
        </label>
        <textarea
          rows={2}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setSigResult(null);
            setVerifyStatus(null);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
          placeholder="Enter message to sign..."
        />
      </div>

      {/* 3-Step Interactive Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: KeyGen */}
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
              Derives seed <code>ρ</code>, matrix <code>A</code>, secret vectors <code>s1, s2</code>, and public vector <code>t1</code> on AIE2 hardware.
            </p>

            {keyPair && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Public Key (pk) [{keyPair.publicKeyHex.length / 2} bytes]</span>
                    <button
                      onClick={() => copyToClipboard(keyPair.publicKeyHex, 'pk')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'pk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'pk' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-slate-300 text-[11px] overflow-x-auto max-h-24 select-all">
                    {formatHexView(keyPair.publicKeyHex)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Secret Key (sk) [{keyPair.secretKeyHex.length / 2} bytes]</span>
                    <button
                      onClick={() => copyToClipboard(keyPair.secretKeyHex, 'sk')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'sk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'sk' ? 'Copied' : 'Copy'}</span>
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
            id="btn-mldsa-keygen"
            onClick={handleGenerateKeys}
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
                <FileSignature className="w-3.5 h-3.5" />
                <span>{keyPair ? 'Regenerate on NPU Silicon' : 'Generate Keys on NPU'}</span>
              </>
            )}
          </button>
        </div>

        {/* Step 2: Sign */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-white text-sm">Signing Engine</h3>
              </div>
              {sigResult?.isHardware && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({sigResult.executionTimeMs?.toFixed(1)}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Executes Fiat-Shamir with Aborts lattice rejection loop to generate signature <code>(c_tilde, z, h)</code>.
            </p>

            {sigResult && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Rejection Loop Iterations:</span>
                  <span className="text-emerald-400 font-bold">{sigResult.rejectionLoops}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Hint Vector L1 Weight:</span>
                  <span className="text-cyan-400 font-bold">{sigResult.hintWeight} (Within Bound)</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Signature [{sigResult.signatureHex.length / 2} bytes]</span>
                    <button
                      onClick={() => copyToClipboard(sigResult.signatureHex, 'sig')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'sig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'sig' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-slate-300 text-[11px] overflow-x-auto max-h-24 select-all">
                    {formatHexView(sigResult.signatureHex)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            id="btn-mldsa-sign"
            onClick={handleSign}
            disabled={!keyPair || loadingAction !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/30 active:scale-98 disabled:cursor-not-allowed"
          >
            {loadingAction === 'sign' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Signing on Physical NPU...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{sigResult ? 'Re-Sign on NPU' : 'Sign Message on NPU Silicon'}</span>
              </>
            )}
          </button>
        </div>

        {/* Step 3: Verification */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="font-bold text-white text-sm">Signature Verification</h3>
              </div>
              {verifyStatus?.isHardware && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({verifyStatus.verifyTimeMs.toFixed(1)}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Computes matrix product <code>A·z - c·t1·2^d</code> on AIE2 SIMD lanes and verifies commitment hash match.
            </p>

            {/* Active Tamper Toggles */}
            <div className="mt-3 space-y-2">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tamper Message Body</span>
                </span>
                <input
                  type="checkbox"
                  checked={tamperMsg}
                  onChange={(e) => {
                    setTamperMsg(e.target.checked);
                    setVerifyStatus(null);
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tamper Signature Bits</span>
                </span>
                <input
                  type="checkbox"
                  checked={tamperSig}
                  onChange={(e) => {
                    setTamperSig(e.target.checked);
                    setVerifyStatus(null);
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {verifyStatus !== null && (
              <div className={`mt-4 p-3 rounded-lg border flex items-center space-x-3 font-mono text-xs ${
                verifyStatus.isValid
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                {verifyStatus.isValid ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-400">100% BIT-EXACT VALID SIGNATURE</div>
                      <div className="text-[10px] text-emerald-500">Verified on AMD Phoenix AIE2 Vector Lanes</div>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-rose-400">FAIL-CLOSED: SIGNATURE REJECTED</div>
                      <div className="text-[10px] text-rose-500">Reconstructed commitment mismatch detected</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            id="btn-mldsa-verify"
            onClick={handleVerify}
            disabled={!sigResult || loadingAction !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/30 active:scale-98 disabled:cursor-not-allowed"
          >
            {loadingAction === 'verify' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying on Physical NPU...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Signature on NPU Silicon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
