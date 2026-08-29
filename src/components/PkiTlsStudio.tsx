import React, { useState } from 'react';
import { ShieldCheck, Lock, FileSignature, Key, Globe, ArrowRight, CheckCircle2, Copy, RefreshCw, Layers, ShieldAlert, Cpu, Eye } from 'lucide-react';

export const PkiTlsStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pki' | 'tls'>('pki');

  // PKI State
  const [pkiAlgo, setPkiAlgo] = useState<'ML-DSA-65' | 'ML-DSA-87' | 'SLH-DSA-SHAKE-128s'>('ML-DSA-65');
  const [rootCaName, setRootCaName] = useState('Phoenix Sovereign Post-Quantum Root CA');
  const [serverCn, setServerCn] = useState('api.sovereign.bank.internal');
  const [rootCa, setRootCa] = useState<any | null>(null);
  const [serverCert, setServerCert] = useState<any | null>(null);
  const [pkiLoading, setPkiLoading] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // TLS 1.3 State
  const [tlsServerCn, setTlsServerCn] = useState('secure.sovereign.gateway');
  const [kemGroup, setKemGroup] = useState('X25519MLKEM768');
  const [sigScheme, setSigScheme] = useState('ML-DSA-65');
  const [qkdEnabled, setQkdEnabled] = useState(true);
  const [tlsResult, setTlsResult] = useState<any | null>(null);
  const [tlsLoading, setTlsLoading] = useState<boolean>(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateRootCa = async () => {
    setPkiLoading('root_ca');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/npu/pki/generate-ca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_cn: rootCaName,
          algorithm: pkiAlgo,
          validity_days: 3650,
        }),
      });
      const data = await res.json();
      setRootCa(data);
      setServerCert(null);
    } catch (e) {
      console.error(e);
    } finally {
      setPkiLoading(null);
    }
  };

  const handleIssueServerCert = async () => {
    if (!rootCa) return;
    setPkiLoading('issue_cert');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/npu/pki/issue-cert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_cn: serverCn,
          algorithm: pkiAlgo,
          issuer_cert: rootCa,
          issuer_sk_hex: rootCa.secret_key_hex,
          san: [serverCn, 'gateway.bank.internal', 'localhost'],
          validity_days: 365,
        }),
      });
      const data = await res.json();
      setServerCert(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPkiLoading(null);
    }
  };

  const handleSimulateTlsHandshake = async () => {
    setTlsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/npu/tls/handshake-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_cn: tlsServerCn,
          kem_group: kemGroup,
          sig_algorithm: sigScheme,
          qkd_enabled: qkdEnabled,
        }),
      });
      const data = await res.json();
      setTlsResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTlsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Milestone DR32 · Enterprise PKI & TLS 1.3
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                RFC 8446 · RFC 9370 · ITU-T X.509
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="w-7 h-7 text-blue-400" />
              Post-Quantum X.509 PKI & TLS 1.3 Handshake Studio
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Issue sovereign post-quantum X.509 root & leaf certificates signed natively on AIE2 hardware, and simulate step-by-step quantum-safe TLS 1.3 key exchange.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('pki')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'pki' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              X.509 Post-Quantum CA
            </button>
            <button
              onClick={() => setActiveTab('tls')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'tls' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quantum-Safe TLS 1.3
            </button>
          </div>
        </div>
      </div>

      {/* PKI Tab Content */}
      {activeTab === 'pki' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: CA Generation & Controls */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                1. Root Certificate Authority (CA) Generation
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Root CA Common Name (CN):</label>
                <input
                  type="text"
                  value={rootCaName}
                  onChange={(e) => setRootCaName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Digital Signature Algorithm:</label>
                <div className="flex gap-2 mt-1">
                  {(['ML-DSA-65', 'ML-DSA-87', 'SLH-DSA-SHAKE-128s'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setPkiAlgo(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        pkiAlgo === a
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateRootCa}
                disabled={pkiLoading !== null}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                {pkiLoading === 'root_ca' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Generate Root CA on AIE2 Silicon
              </button>
            </div>

            {/* Issue Server Leaf Cert */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileSignature className="w-4 h-4 text-emerald-400" />
                2. Issue Server Leaf Certificate (Signed by Root CA)
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Server Domain / Common Name (CN):</label>
                <input
                  type="text"
                  value={serverCn}
                  onChange={(e) => setServerCn(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleIssueServerCert}
                disabled={pkiLoading !== null || !rootCa}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                {pkiLoading === 'issue_cert' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                Issue & Sign Server Certificate
              </button>
            </div>
          </div>

          {/* Right: Certificate PEM & Decoded Structure */}
          <div className="space-y-6">
            {rootCa && (
              <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-5 shadow space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Root CA Certificate (X.509 v3)</span>
                  <button
                    onClick={() => copyToClipboard(rootCa.pem, 'root_pem')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
                  >
                    {copiedKey === 'root_pem' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy PEM
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {rootCa.pem}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-800">
                  <div>Subject: <span className="text-white">{rootCa.subject}</span></div>
                  <div>Serial: <span className="text-cyan-400">{rootCa.serial}</span></div>
                  <div>Algorithm: <span className="text-purple-400">{rootCa.algorithm}</span></div>
                  <div>Hardware Latency: <span className="text-emerald-400">{rootCa.latency_ms} ms</span></div>
                </div>
              </div>
            )}

            {serverCert && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Server Leaf Certificate (Issued)</span>
                  <button
                    onClick={() => copyToClipboard(serverCert.pem, 'leaf_pem')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
                  >
                    {copiedKey === 'leaf_pem' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy PEM
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {serverCert.pem}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-800">
                  <div>Subject: <span className="text-white">{serverCert.subject}</span></div>
                  <div>Issuer: <span className="text-blue-400">{serverCert.issuer}</span></div>
                  <div>SAN: <span className="text-amber-400">{serverCert.san.join(', ')}</span></div>
                  <div>Signing Time: <span className="text-emerald-400">{serverCert.latency_ms} ms</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TLS 1.3 Tab Content */}
      {activeTab === 'tls' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Server Domain:</label>
              <input
                type="text"
                value={tlsServerCn}
                onChange={(e) => setTlsServerCn(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">KEM Key Exchange Group:</label>
              <select
                value={kemGroup}
                onChange={(e) => setKemGroup(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white"
              >
                <option value="X25519MLKEM768">X25519MLKEM768 (Hybrid IETF Draft)</option>
                <option value="MLKEM768">ML-KEM-768 (Pure Lattice FIPS 203)</option>
                <option value="MLKEM1024">ML-KEM-1024 (Category 5 Lattice)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Certificate Signature Scheme:</label>
              <select
                value={sigScheme}
                onChange={(e) => setSigScheme(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white"
              >
                <option value="ML-DSA-65">ML-DSA-65 (FIPS 204 Level 3)</option>
                <option value="ML-DSA-87">ML-DSA-87 (FIPS 204 Level 5)</option>
                <option value="SLH-DSA-SHAKE-128s">SLH-DSA-SHAKE-128s (FIPS 205)</option>
              </select>
            </div>

            <button
              onClick={handleSimulateTlsHandshake}
              disabled={tlsLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition"
            >
              {tlsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Execute TLS 1.3 Handshake on NPU
            </button>
          </div>

          {/* Handshake Stepper Result */}
          {tlsResult && (
            <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  TLS 1.3 Quantum-Safe Handshake Established ({tlsResult.handshake_latency_ms} ms)
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                    {tlsResult.cipher_suite}
                  </span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                    {tlsResult.key_exchange_group}
                  </span>
                </div>
              </div>

              {/* Steps Flow */}
              <div className="space-y-3">
                {tlsResult.handshake_steps.map((s: any) => (
                  <div key={s.step} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
                        {s.step}
                      </span>
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {s.name}
                          <span className="text-[10px] text-slate-500 font-normal">({s.direction})</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{s.details}</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">{s.payload_bytes} B</span>
                  </div>
                ))}
              </div>

              {/* Secrets Derivation HUD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Client Traffic Secret 0:</div>
                  <div className="text-cyan-400 break-all select-all font-mono">{tlsResult.secrets.client_application_traffic_secret_0}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Server Traffic Secret 0:</div>
                  <div className="text-emerald-400 break-all select-all font-mono">{tlsResult.secrets.server_application_traffic_secret_0}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
