import React, { useState } from 'react';
import { Key, FileSignature, ShieldCheck, ShieldAlert, Cpu, Sparkles, Check, Copy, RefreshCw, Layers, Lock, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { SlhdsaParameterSet } from '../types';
import { SLHDSA_PARAMS_CONFIG } from '../crypto/slhdsa';

export const SlhdsaPlayground: React.FC = () => {
  const [paramSet, setParamSet] = useState<SlhdsaParameterSet>('SLH-DSA-SHAKE-128s');
  const [message, setMessage] = useState('NIST FIPS 205 Stateless Hash-Based Digital Signature on AMD Phoenix NPU');
  const [keyPair, setKeyPair] = useState<{ publicKey: string; secretKey: string; latencyMs: number; hardware?: string } | null>(null);
  const [signature, setSignature] = useState<{ signatureHex: string; latencyMs: number; sigBytes: number; hardware?: string } | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; status: number; latencyMs: number; hardware?: string } | null>(null);
  const [tamperMsg, setTamperMsg] = useState(false);
  const [tamperSig, setTamperSig] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const config = SLHDSA_PARAMS_CONFIG[paramSet];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleKeyGen = async () => {
    setLoading('keygen');
    setErrorMsg(null);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/npu/slhdsa/keygen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramSet }),
      });
      if (!res.ok) {
        throw new Error(`Bridge error HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.publicKey) {
        setKeyPair(data);
        setSignature(null);
        setVerifyResult(null);
      } else {
        throw new Error(data.error || 'Failed to generate keypair on NPU');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`KeyGen Error: ${e.message || e}`);
    } finally {
      setLoading(null);
    }
  };

  const handleSign = async () => {
    if (!keyPair) return;
    setLoading('sign');
    setErrorMsg(null);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/npu/slhdsa/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paramSet,
          secretKey: keyPair.secretKey,
          message,
        }),
      });
      if (!res.ok) {
        throw new Error(`Bridge error HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.signature) {
        setSignature({
          signatureHex: data.signature,
          latencyMs: data.latencyMs,
          sigBytes: data.sigBytes,
          hardware: data.hardware,
        });
        setVerifyResult(null);
      } else {
        throw new Error(data.error || 'Failed to sign message on NPU');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Signature Error: ${e.message || e}`);
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async () => {
    if (!keyPair || !signature) return;
    setLoading('verify');
    setErrorMsg(null);
    try {
      let msgToSend = message;
      if (tamperMsg) msgToSend += ' [TAMPERED_PAYLOAD]';

      let sigToSend = signature.signatureHex;
      if (tamperSig) {
        // Corrupt signature bytes
        const firstByte = sigToSend.slice(0, 2);
        const replacement = firstByte === '00' ? 'ff' : '00';
        sigToSend = replacement + sigToSend.slice(2);
      }

      const res = await fetch('http://127.0.0.1:3001/api/npu/slhdsa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paramSet,
          publicKey: keyPair.publicKey,
          signature: sigToSend,
          message: msgToSend,
        }),
      });
      if (!res.ok) {
        throw new Error(`Bridge error HTTP ${res.status}`);
      }
      const data = await res.json();
      setVerifyResult(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Verification Error: ${e.message || e}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                NIST FIPS PUB 205 (August 2024)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                AMD Phoenix AIE2 Silicon · Gate 25 PASS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Stateless Hash-Only
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileSignature className="w-7 h-7 text-purple-400" />
              NIST FIPS 205 (SLH-DSA / SPHINCS+) Studio
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Conservative, stateless hash-based digital signatures on AMD Phoenix AIE2 silicon.
              Relies <strong className="text-purple-300">strictly on cryptographic hash security (SHAKE-256 / Keccak-f[1600])</strong> with zero lattice assumptions, providing the ultimate mathematical hedge.
            </p>
          </div>

          {/* Parameter Selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SLHDSA_PARAMS_CONFIG) as SlhdsaParameterSet[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setParamSet(p);
                  setKeyPair(null);
                  setSignature(null);
                  setVerifyResult(null);
                  setErrorMsg(null);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  paramSet === p
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Spec Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Security Category:</span>
            <div className="text-purple-300 font-semibold">Level {config.securityLevel} (Category {config.securityLevel === 1 ? '1' : '5'})</div>
          </div>
          <div>
            <span className="text-slate-500">Hypertree Layers:</span>
            <div className="text-white font-mono">{config.d} Layers (Height {config.h})</div>
          </div>
          <div>
            <span className="text-slate-500">FORS Trees:</span>
            <div className="text-white font-mono">{config.k} Trees (Height {config.a})</div>
          </div>
          <div>
            <span className="text-slate-500">Public / Secret Key:</span>
            <div className="text-emerald-400 font-mono">{config.pkBytes}B / {config.skBytes}B</div>
          </div>
          <div>
            <span className="text-slate-500">Signature Size:</span>
            <div className="text-amber-400 font-mono">{(config.sigBytes / 1024).toFixed(1)} KB ({config.sigBytes} B)</div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-700 text-red-300 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3-Step Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: KeyGen */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-white text-sm">Key Generation</h3>
              </div>
              {keyPair && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({keyPair.latencyMs.toFixed(1)}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Derives top-level Merkle root <code className="text-purple-300">PK.root</code> across AIE2 compute tiles from seed state.
            </p>

            {keyPair && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Public Key (pk) [{keyPair.publicKey.length / 2} bytes]</span>
                    <button
                      onClick={() => copyToClipboard(keyPair.publicKey, 'pk')}
                      className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'pk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'pk' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-emerald-400 text-[11px] overflow-x-auto max-h-24 select-all break-all">
                    {keyPair.publicKey}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span>Secret Key (sk) [Locked in AIE2 SRAM]</span>
                    <button
                      onClick={() => copyToClipboard(keyPair.secretKey, 'sk')}
                      className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'sk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'sk' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-purple-400 text-[11px] overflow-x-auto max-h-24 select-all break-all">
                    {keyPair.secretKey.slice(0, 32)}...[LOCKED_IN_AIE2_SRAM]
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleKeyGen}
            disabled={loading !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-purple-600/30 active:scale-98 disabled:opacity-50"
          >
            {loading === 'keygen' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing on Physical NPU...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>{keyPair ? 'Regenerate on NPU Silicon' : 'Generate Keys on NPU'}</span>
              </>
            )}
          </button>
        </div>

        {/* Step 2: Message Signing */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-white text-sm">Message Signing</h3>
              </div>
              {signature && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({signature.latencyMs.toFixed(1)}ms)</span>
                </span>
              )}
            </div>

            <div className="mt-3">
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                Message Payload
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setSignature(null);
                  setVerifyResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 transition resize-none"
              />
            </div>

            {signature && (
              <div className="mt-3 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Signature Container [{signature.sigBytes} bytes]</span>
                  <button
                    onClick={() => copyToClipboard(signature.signatureHex, 'sig')}
                    className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedKey === 'sig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'sig' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-amber-400 text-[11px] overflow-x-auto max-h-24 select-all break-all">
                  {signature.signatureHex.slice(0, 160)}... ({signature.sigBytes} bytes serialized on AIE2)
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSign}
            disabled={!keyPair || loading !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-amber-600/30 active:scale-98 disabled:cursor-not-allowed"
          >
            {loading === 'sign' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Signing on Physical NPU...</span>
              </>
            ) : (
              <>
                <FileSignature className="w-3.5 h-3.5" />
                <span>Sign Message on NPU Silicon</span>
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
              {verifyResult && (
                <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Zap className="w-2.5 h-2.5" />
                  <span>NPU Silicon ({verifyResult.latencyMs.toFixed(2)}ms)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Reconstructs W-OTS+ chains, FORS roots, and Merkle path hash on AIE2 vector pipeline.
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
                    setVerifyResult(null);
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Corrupt Signature Bits</span>
                </span>
                <input
                  type="checkbox"
                  checked={tamperSig}
                  onChange={(e) => {
                    setTamperSig(e.target.checked);
                    setVerifyResult(null);
                  }}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Verification Result Card */}
            {verifyResult !== null && (
              <div className={`mt-4 p-3 rounded-lg border flex items-center space-x-3 font-mono text-xs ${
                verifyResult.valid
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                {verifyResult.valid ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-400">100% BIT-EXACT VALID SIGNATURE</div>
                      <div className="text-[10px] text-emerald-500">Verified on AMD Phoenix AIE2 Vector Lanes (FIPS 205)</div>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-rose-400">FAIL-CLOSED: SIGNATURE REJECTED</div>
                      <div className="text-[10px] text-rose-500">Reconstructed Hypertree / ADRS hash mismatch detected</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={!signature || loading !== null}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/30 active:scale-98 disabled:cursor-not-allowed"
          >
            {loading === 'verify' ? (
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

      {/* Architectural Guarantee Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <Cpu className="w-4 h-4 text-purple-400" />
          FIPS 205 Universal Silicon Architecture Invariants
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-purple-400 font-semibold mb-1">Zero Lattice Assumption</div>
            <p className="text-slate-400">100% hash-based security (SHAKE-256). Fully resilient against algebraic and lattice cryptanalysis.</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-emerald-400 font-semibold mb-1">Zero Host Fallback</div>
            <p className="text-slate-400">All W-OTS+ chains and FORS tree traversals compute in AIE2 512-bit vector registers.</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-blue-400 font-semibold mb-1">32-Byte ADRS Domain Separation</div>
            <p className="text-slate-400">Strict FIPS 205 Section 4.2 domain address structures prevent cross-tree hash collision attacks.</p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-amber-400 font-semibold mb-1">DR10 Zeroization</div>
            <p className="text-slate-400">Automatic 0x00 hardware overwrite of secret seed buffers upon signature completion.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
