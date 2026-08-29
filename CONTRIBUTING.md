# Contributing to Phoenix NPU PQC & QKD Frontend

Thank you for your interest in contributing to the **AMD Phoenix NPU PQC & QKD Frontend**!

This project provides the official interactive web dashboard, cryptographic playground, and real-time hardware execution interface for **100% on-device Post-Quantum Cryptography (PQC)** and **Defense-in-Depth Hybrid Quantum Key Distribution (QKD)** on the **AMD Phoenix NPU (Ryzen 7 7840HS / Ryzen 9 7940HS / AIE2 / XDNA1 Architecture)**.

---

## 📑 Table of Contents

1. [Code of Conduct & Philosophy](#1-code-of-conduct--philosophy)
2. [How Can You Contribute?](#2-how-can-you-contribute)
3. [Development Environment Setup](#3-development-environment-setup)
4. [Architecture & Design Principles](#4-architecture--design-principles)
   * [Frontend Stack](#frontend-stack)
   * [Hardware Bridge Interface](#hardware-bridge-interface)
   * [Silicon Parity & Fail-Closed Rules](#silicon-parity--fail-closed-rules)
5. [Step-by-Step Contribution Workflow](#5-step-by-step-contribution-workflow)
   * [1. Branching Convention](#1-branching-convention)
   * [2. Local Development & Testing](#2-local-development--testing)
   * [3. Pull Request Submission](#3-pull-request-submission)
6. [Coding Guidelines & Standards](#6-coding-guidelines--standards)
   * [React 19 & TypeScript Strictness](#react-19--typescript-strictness)
   * [Tailwind CSS v4 & Theming](#tailwind-css-v4--theming)
   * [Cryptographic Safety](#cryptographic-safety)
7. [Reporting Bugs & Security Vulnerabilities](#7-reporting-bugs--security-vulnerabilities)
8. [License & Contributor Agreement](#8-license--contributor-agreement)

---

## 1. Code of Conduct & Philosophy

We are committed to providing a welcoming, inclusive, and professional environment for researchers, engineers, and developers from all backgrounds. 

### Core Tenets:
* **Academic Rigor & Scientific Reproducibility**: All cryptographic constants, parameter sets, and timing representations must adhere strictly to finalized NIST standards (FIPS 202, FIPS 203, FIPS 204), ETSI specifications (ETSI GS QKD 014), and physical silicon benchmarks.
* **100% Silicon Integrity**: Do not introduce mock or dummy fallbacks where real hardware operations exist. When hardware is attached, all cryptographic math must execute on physical AIE2 tiles with **Zero Host CPU Fallback**.
* **Constructive Collaboration**: Treat all contributors with mutual respect and constructive technical discourse.

---

## 2. How Can You Contribute?

We welcome contributions across several domains:

* 🔬 **Post-Quantum Cryptographic Enhancements**:
  * Extending test vector generators for ACVP edge cases.
  * Adding visualizations for intermediate polynomial representations (e.g. NTT butterflies, Barrett reduction stages).
* 🛡️ **Hybrid QKD & Defense-in-Depth Features**:
  * Integration with real ID Quantique (Cerberis XGR) or Toshiba QKDN REST APIs.
  * Visualizing quantum bit error rates (QBER) and reconciliation throughput.
  * Adding new simulated attack vectors (e.g., photon number splitting, optical Trojan horse).
* 🎨 **UI/UX & Interactive Design**:
  * Improving responsive design across mobile, tablet, and ultra-wide displays.
  * Enhancing tile memory heatmaps, latency charts, and terminal logs.
  * Adding accessibility (a11y) improvements and keyboard navigation.
* ⚡ **Hardware Bridge & Performance**:
  * Optimizing Server-Sent Events (SSE) streaming throughput in `bridge_server.py`.
  * Adding support for AMD Hawk Point, Strix Point (XDNA2), and future AIE architectures.
* 📚 **Documentation & Tutorials**:
  * Writing walkthroughs, educational guides, and benchmark comparisons.

---

## 3. Development Environment Setup

### Prerequisites
* **Node.js**: `v18.0.0+` (Node 20+ or 24+ LTS recommended).
* **npm**: `v9.0.0+` or `yarn` / `pnpm`.
* **Python**: `3.10+` (Required only for the optional physical hardware bridge).
* **AMD Phoenix Laptop** *(Optional)*: Ryzen 7 7840HS / 7940HS / 8845HS with AMD NPU driver installed.

### Quick Start
```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/phoenix-npu-pqc-frontend.git
cd phoenix-npu-pqc-frontend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. (Optional) In a second terminal, launch the Python hardware bridge
python bridge_server.py
```

Visit **`http://localhost:3000`** in your browser to see your live changes!

---

## 4. Architecture & Design Principles

### Frontend Stack
* **UI Framework**: [React 19](https://react.dev/)
* **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/) with Fast Refresh
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables
* **Type System**: [TypeScript 5.7+](https://www.typescriptlang.org/) (Strict Mode)
* **Icons**: [Lucide React](https://lucide.dev/)

### Hardware Bridge Interface (`bridge_server.py`)
The frontend communicates with physical AMD Phoenix silicon over a local REST / SSE bridge on port `3001`:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/status` | `GET` | Probes NPU driver status, active AIE2 grid, and bridge health. |
| `/api/npu/mlkem/keygen` | `POST` | Dispatches ML-KEM-512/768/1024 KeyGen to AIE2 Tile (2,0). |
| `/api/npu/mlkem/encaps` | `POST` | Dispatches ML-KEM Encapsulation to Tile (2,1). |
| `/api/npu/mlkem/decaps` | `POST` | Dispatches ML-KEM Decapsulation & CCA2 verification to Tile (2,2). |
| `/api/npu/mldsa/keygen` | `POST` | Dispatches ML-DSA-44/65/87 KeyGen to Tile (3,0). |
| `/api/npu/mldsa/sign` | `POST` | Dispatches ML-DSA Signing to Tile (3,1). |
| `/api/npu/mldsa/verify` | `POST` | Dispatches ML-DSA Signature Verification to Tile (3,0). |
| `/api/npu/keccak/hash` | `POST` | Computes SHA3-224..512 & SHAKE128/256 on Tile (3,2). |
| `/api/npu/hybrid/handshake` | `POST` | Executes full-duplex ETSI 014 + PQC + SP 800-56C handshake. |
| `/api/npu/zeroize` | `POST` | Triggers DR10 synchronous memory scrubber on Tile (3,3). |
| `/api/run-suite-stream` | `GET` | SSE stream running all 23 silicon gates (839 test cases). |

### Silicon Parity & Fail-Closed Rules
1. **Zero Secret Leakage**: Secret keys and intermediate polynomials must be cleared or zeroized immediately after computation.
2. **Fail-Closed Security**: In attack simulation modes (e.g. Tampered UUID, Poisoned Ciphertext, Corrupted QKD stream), the UI must explicitly reflect rejection, key mismatch, and automatic session abort.
3. **Exact Byte Alignment**: Byte lengths must adhere strictly to specifications:
   * ML-KEM: `ek` (800 / 1184 / 1568 B), `dk` (1632 / 2400 / 3168 B), `c` (768 / 1088 / 1568 B), `ss` (32 B).
   * ML-DSA: `pk` (1312 / 1952 / 2592 B), `sk` (2560 / 4032 / 4896 B), `sig` (2420 / 3309 / 4627 B).

---

## 5. Step-by-Step Contribution Workflow

### 1. Branching Convention
Create a descriptive feature branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/qkd-network-topology
# or: git checkout -b fix/mldsa-verify-tooltip
# or: git checkout -b docs/quantum-safe-tutorial
```

### 2. Local Development & Testing
Before submitting a PR, verify that the project builds cleanly without TypeScript or Lint errors:

```bash
# 1. Run TypeScript compiler checks and Vite production build
npm run build

# 2. Preview the production build locally
npm run preview
```

### 3. Pull Request Submission
1. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/qkd-network-topology
   ```
2. Open a Pull Request on **[`midhatn/phoenix-npu-pqc-frontend`](https://github.com/midhatn/phoenix-npu-pqc-frontend)**.
3. Provide a clear summary:
   * **What was changed or added?**
   * **Which tabs or components are affected?**
   * **Screenshots / GIFs demonstrating UI changes.**
   * **Confirmation that `npm run build` succeeds.**

---

## 6. Coding Guidelines & Standards

### React 19 & TypeScript Strictness
* Write functional React components using hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
* Maintain strict TypeScript typing. Avoid `any` wherever possible.
* Store cryptographic byte arrays as standard `Uint8Array` or hex strings formatted via `src/utils.ts`.

### Tailwind CSS v4 & Theming
* Use the project's established dark cyber-cryptographic theme:
  * Backgrounds: `slate-950`, `slate-900`, `slate-900/80`
  * Accent Colors:
    * **Cyan** (`cyan-400`, `cyan-500`): Primary actions, ML-KEM, AIE2 compute
    * **Purple** (`purple-400`, `purple-500`): ML-DSA, Hybrid QKD Studio
    * **Emerald** (`emerald-400`, `emerald-500`): Success states, verified hardware, zeroization OK
    * **Rose / Amber** (`rose-400`, `amber-400`): Attack injection, fail-closed rejections, warnings

---

## 7. Reporting Bugs & Security Vulnerabilities

* **General Issues & Feature Requests**: Open an issue at [GitHub Issues](https://github.com/midhatn/phoenix-npu-pqc-frontend/issues).
* **Security & Cryptographic Vulnerabilities**: If you discover a potential vulnerability (e.g. timing leakage, memory exposure, or implementation flaw), please report it responsibly by contacting the maintainers directly or opening a private security advisory.

---

## 8. License & Contributor Agreement

By contributing to **Phoenix NPU PQC Frontend**, you agree that your contributions will be licensed under the **[Apache License, Version 2.0](LICENSE)**.
