# AMD Phoenix NPU PQC Suite — Interactive Frontend & Hardware Dashboard

<div align="center">

![React: 19](https://img.shields.io/badge/React-19-blue.svg)
![Vite: 6](https://img.shields.io/badge/Vite-6-646CFF.svg)
![Tailwind CSS: 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)
![Target: AMD Phoenix NPU (AIE2 / XDNA1)](https://img.shields.io/badge/Hardware-AMD%20Phoenix%20NPU1%20(AIE2)-blue)
![Standards: FIPS 202 / 203 / 204](https://img.shields.io/badge/Standards-FIPS%20202%20%2F%20203%20%2F%20204-005ea8)
![Status: 100% PQC Silicon Certified](https://img.shields.io/badge/Silicon%20Status-736%2F736%20PASS-brightgreen)

**Modern, interactive web dashboard, cryptographic playground, and real-time hardware execution interface for device-resident Post-Quantum Cryptography on the AMD Phoenix NPU (Ryzen 7 7840HS / Ryzen 9 7940HS / AIE2 / XDNA1 Architecture).**

[Live Hardware Engine Repository](https://github.com/midhatn/phoenix-npu-pqc) · [Documentation & Architecture](https://github.com/midhatn/phoenix-npu-pqc#readme) · [Report Issue](https://github.com/midhatn/phoenix-npu-pqc-frontend/issues)

</div>

---

## 1. Overview

This repository provides the official interactive frontend and developer suite for **Phoenix NPU PQC**. It enables real-time exploration, visual verification, and physical hardware dispatch of all finalized NIST Post-Quantum Cryptography standards:

- **NIST FIPS 203 (ML-KEM / Kyber)**: Key Encapsulation Mechanisms across all parameter sets (`ML-KEM-512`, `ML-KEM-768`, `ML-KEM-1024`).
- **NIST FIPS 204 (ML-DSA / Dilithium)**: Digital Signature Algorithms across all parameter sets (`ML-DSA-44`, `ML-DSA-65`, `ML-DSA-87`).
- **NIST FIPS 202 (SHA-3 / SHAKE)**: Permutation-based hashing (`SHA3-224`, `SHA3-256`, `SHA3-384`, `SHA3-512`) and extendable-output functions (`SHAKE128`, `SHAKE256`).
- **19 Silicon Gates Explorer**: Comprehensive verification matrix covering all 736 silicon test cases.
- **AIE2 Microarchitecture & Sealed Lifecycle (DR10)**: 4×4 physical tile array visualizer, memory budgets, zeroization triggers, and QKD key ingress.

> **Note on Core Hardware Engine**: All low-level MLIR-AIE dialect pipelines, Peano LLVM-AIE C++ kernels, XCLBIN compilation flows, and raw physical test suites reside in the primary research repository: **[`midhatn/phoenix-npu-pqc`](https://github.com/midhatn/phoenix-npu-pqc)**.

---

## 2. Key Interactive Features

```
                                  ┌──────────────────────────────────────────────┐
                                  │      AMD Phoenix NPU PQC Web Suite           │
                                  └──────────────────────┬───────────────────────┘
                                                         │
         ┌─────────────────────────┬─────────────────────┼─────────────────────┬────────────────────────┐
         ▼                         ▼                     ▼                     ▼                        ▼
  [ML-KEM (FIPS 203)]    [ML-DSA (FIPS 204)]    [SHA-3 (FIPS 202)]    [19 Silicon Gates]    [AIE2 Hardware Layout]
   • KeyGen/Encaps/Decaps • KeyGen/Sign/Verify   • SHA3-224..512       • 736 Test Cases      • 4x4 Tile Matrix
   • Ciphertext Tampering • Message Tampering    • SHAKE128/256        • Memory Budgets      • Memory Scrubber
   • CCA2 Implicit Rej.   • Rejection Loops      • Keccak-f[1600]      • DMA Limits          • DR10 Zeroization
```

### 1. ML-KEM Playground (FIPS 203)
* Full lifecycle testing: `KeyGen`, `Encaps`, and `Decaps`.
* Switch between **ML-KEM-512**, **ML-KEM-768**, and **ML-KEM-1024**.
* Interactive **Ciphertext Tampering Toggle** to test constant-time Fujisaki-Okamoto CCA2 implicit rejection behavior.
* Formatted hex viewers with one-click clipboard copying for public keys, secret keys, ciphertexts, and shared secrets.

### 2. ML-DSA Playground (FIPS 204)
* Full lifecycle testing: `KeyGen`, `Sign` (deterministic & randomized), and `Verify`.
* Switch between **ML-DSA-44**, **ML-DSA-65**, and **ML-DSA-87**.
* Interactive **Message & Signature Tampering Toggles** to verify fail-closed signature verification.
* Real-time metrics: Rejection sampling loop iterations, $L_1$-norm hint weights, and cycle counts.

### 3. SHA-3 / SHAKE Permutation Engine (FIPS 202)
* Live computation for SHA3-224/256/384/512 and SHAKE128/256.
* Arbitrary-length text and hex ingress conditioning.
* Dynamic squeeze-length slider for SHAKE extendable outputs.
* Internal Keccak-f[1600] 5×5 state lane visualizer.

### 4. 19 Silicon Gates Explorer
* Visual audit table for all 19 hardware validation gates (DR0 through DR15).
* Real-time hardware invariant compliance badges:
  * **Zero Host Fallback** (100% on-tile compute).
  * **Instruction Memory Budget** (< 16 KiB `.text` limit per tile).
  * **Local Data RAM Budget** (< 64 KiB SRAM limit per tile).
  * **DMA Constraints** (max 2 input DMA channels).

### 5. AIE2 Tile Array & Sealed Lifecycle Inspector (DR10)
* Interactive 4×4 grid visualizer of SHIM NOC tiles and AIE2 Compute ML tiles.
* Live memory usage per tile and active ObjectFIFO routing.
* **"Trigger Hardware Zeroization"**: Visualizes synchronous tile memory scrubbing (all SRAM wiped to `0x00`) to guarantee state isolation.
* Quantum Key Distribution (QKD) external key ingress simulation.

### 6. Dual-Mode Silicon Test Runner
* **Physical Hardware Mode**: Connects to the local Python hardware bridge (`bridge_server.py`) to execute live test suites directly on the laptop's AMD Phoenix NPU via XRT and stream real terminal output into the UI.
* **Browser Emulation Mode**: High-fidelity WebCrypto / TypeScript emulation that runs entirely offline in any modern browser.

---

## 3. Quick Start & Reproduction Guide

### Prerequisites
* **Node.js**: Version 18.0+ (Node.js 20+ or 24+ recommended).
* **Target Hardware (Optional for physical mode)**: AMD Phoenix APU (Ryzen 7 7840HS, Ryzen 9 7940HS, Ryzen 7 8845HS, Ryzen 9 8945HS) with AMD XDNA NPU driver installed.
* **Python (Optional for physical mode)**: Python 3.10+ with MLIR-AIE / XRT environment.

---

### Step-by-Step Installation

```powershell
# 1. Clone this repository
git clone https://github.com/midhatn/phoenix-npu-pqc-frontend.git
cd phoenix-npu-pqc-frontend

# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser at **`http://localhost:3000`** (or `http://localhost:5173`).

---

### Running with Real Physical NPU Silicon Dispatch

To enable the web interface to dispatch real cryptographic workloads directly to your laptop's AMD Phoenix NPU:

```powershell
# In a separate terminal, launch the local hardware bridge server:
python bridge_server.py
```

The bridge server will automatically:
1. Probe the AMD XDNA driver (`amdnpu`) and verify NPU hardware health.
2. Locate the core [`phoenix-npu-pqc`](https://github.com/midhatn/phoenix-npu-pqc) repository and Ironenv Python runtime.
3. Expose a local REST / SSE bridge on `http://127.0.0.1:3001`.
4. The web dashboard will detect the bridge and display **"Physical NPU Connected"** in the Silicon Test Runner.

---

## 4. Repository Structure

```
phoenix-npu-pqc-frontend/
├── bridge_server.py           # Local Python REST/SSE bridge for live NPU hardware dispatch
├── index.html                 # HTML5 entrypoint with Google Fonts
├── package.json               # Node dependencies & project scripts
├── tsconfig.json              # TypeScript root compiler configuration
├── tsconfig.app.json          # TypeScript frontend application configuration
├── tsconfig.node.json         # TypeScript Vite configuration
├── vite.config.ts             # Vite 6 + Tailwind CSS v4 bundler setup
└── src/
    ├── main.tsx               # React 19 application root
    ├── App.tsx                # Main view router & layout container
    ├── index.css              # Tailwind CSS imports & custom styling
    ├── types.ts               # Core TypeScript interface definitions
    ├── utils.ts               # Hex encoding, byte manipulation, and formatters
    ├── crypto/
    │   ├── keccak.ts          # FIPS 202 SHA-3 & SHAKE permutation engine
    │   ├── mlkem.ts           # FIPS 203 ML-KEM-512/768/1024 implementation
    │   ├── mldsa.ts           # FIPS 204 ML-DSA-44/65/87 implementation
    │   └── silicon.ts         # 19 Silicon Gates specifications & test metadata
    └── components/
        ├── Navbar.tsx         # Navigation header & hardware status badge
        ├── MlkemPlayground.tsx# Interactive ML-KEM playground with tampering tests
        ├── MldsaPlayground.tsx# Interactive ML-DSA signature playground
        ├── KeccakPlayground.tsx# Interactive SHA-3 & SHAKE engine
        ├── SiliconGateExplorer.tsx # 19-gate verification explorer
        ├── HardwareInspector.tsx   # 4x4 AIE2 array visualizer & zeroization demo
        └── TestRunnerModal.tsx     # Terminal modal with live hardware SSE streaming
```

---

## 5. Technology Stack

* **Framework**: [React 19](https://react.dev/)
* **Build Tool**: [Vite 6](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
* **Icons**: [Lucide React](https://lucide.dev/)
* **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
* **Hardware Bridge**: Python 3 standard library (`http.server`, `subprocess`, `urllib`)

---

---

## 6. Hybrid PQC & QKD Hardware Roadmap (v1.1.0)

As part of the upcoming **v1.1.0 release**, this suite is expanding to support **Defense-in-Depth Hybrid Post-Quantum Cryptography & Quantum Key Distribution (QKD)**:

* **Standards Compliance**:
  * **ETSI GS QKD 014 (v1.1.1 / v1.3.1)**: Standard REST API key delivery & JSON Key Container parsing (`/enc_keys`, `/dec_keys`, UUID `key_ID`).
  * **NIST SP 800-56C Rev. 2 & NIST SP 800-227**: Two-step extraction-then-expansion Dual-Key Combiner (KMAC256 / SHAKE256).
  * **NIST FIPS 204 (ML-DSA)**: Asymmetric authentication of QKD control plane to eliminate the classical pre-shared key dilemma.
* **New Hardware Milestones (DR16–DR20)**:
  * **DR16**: ETSI GS QKD 014 Key Container Parser & Sealed Ingress on AIE2 Tile (0,1).
  * **DR17**: ML-DSA Asymmetric QKD Control Plane Authenticator on AIE2 Vector Tiles.
  * **DR18**: NIST SP 800-56C On-Device Dual-Key Combiner ($K_{\text{Final}} = \text{KMAC256}(K_{\text{QKD}} \parallel K_{\text{PQC}})$).
  * **DR19**: Full-Duplex Hybrid QKD-PQC Session Orchestrator & Zero-Leakage Teardown.
  * **DR20**: QKDN Interoperability Test Suite & Master Silicon Certification.

For complete technical specifications, mathematical soundness proofs, and tile mapping, refer to the **[Hybrid PQC & QKD Roadmap](https://github.com/midhatn/phoenix-npu-pqc/blob/main/docs/PQC_AND_QKD_ROADMAP.md)** in the core repository.

## 7. Related Repositories & Citation

This frontend is part of the **AMD Phoenix NPU Post-Quantum Cryptography Research Initiative**:

* **Core Hardware Engine**: [`https://github.com/midhatn/phoenix-npu-pqc`](https://github.com/midhatn/phoenix-npu-pqc) (Silicon certified across 736/736 test cases).
* **DOI**: [10.5281/zenodo.22160353](https://doi.org/10.5281/zenodo.22160353)

```bibtex
@software{nashar2026phoenix_frontend,
  author    = {Midhat Nashar},
  title     = {{AMD Phoenix NPU PQC Suite: Interactive Frontend & Hardware Dashboard}},
  year      = {2026},
  publisher = {GitHub},
  url       = {https://github.com/midhatn/phoenix-npu-pqc-frontend}
}
```

---

## 8. License

Licensed under the [Apache License 2.0](LICENSE).
