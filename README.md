# AMD Phoenix NPU PQC Suite — Interactive Frontend & Hardware Dashboard

<div align="center">

![Release: v1.1.0](https://img.shields.io/badge/Release-v1.1.0-blueviolet.svg)
![React: 19](https://img.shields.io/badge/React-19-blue.svg)
![Vite: 6](https://img.shields.io/badge/Vite-6-646CFF.svg)
![Tailwind CSS: 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)
![Target: AMD Phoenix NPU (AIE2 / XDNA1)](https://img.shields.io/badge/Hardware-AMD%20Phoenix%20NPU%20(AIE2)-blue)
![Standards: FIPS 202 / 203 / 204](https://img.shields.io/badge/Standards-FIPS%20202%20%2F%20203%20%2F%20204-005ea8)
![Silicon Status: 100% Certified](https://img.shields.io/badge/Silicon%20Status-839%2F839%20PASS-brightgreen)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22162273.svg)](https://doi.org/10.5281/zenodo.22162273)

**Modern, interactive web dashboard, cryptographic playground, and real-time hardware execution interface for device-resident Post-Quantum Cryptography & Defense-in-Depth Hybrid QKD on the AMD Phoenix NPU (Ryzen 7 7840HS / Ryzen 9 7940HS / AIE2 / XDNA1 Architecture).**

[Live Hardware Engine Repository](https://github.com/midhatn/phoenix-npu-pqc) · [Architecture & Specifications](https://github.com/midhatn/phoenix-npu-pqc#readme) · [Report Issue](https://github.com/midhatn/phoenix-npu-pqc-frontend/issues)

</div>

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [Quick Start: Clone & Run (Under 2 Minutes)](#2-quick-start-clone--run)
   * [Prerequisites](#prerequisites)
   * [Step 1: Clone the Repositories](#step-1-clone-the-repositories)
   * [Step 2: Start Frontend Web Server](#step-2-start-frontend-web-server)
   * [Step 3: Start Hardware Bridge Server (Optional for Physical NPU)](#step-3-start-hardware-bridge-server-optional-for-physical-npu)
3. [Comprehensive UI Tutorial & Section Guide](#3-comprehensive-ui-tutorial--section-guide)
   * [Top Navigation & Control Header](#31-top-navigation--control-header)
   * [Tab 1: ML-KEM (FIPS 203) — Key Encapsulation Playground](#32-tab-1-ml-kem-fips-203--key-encapsulation-playground)
   * [Tab 2: ML-DSA (FIPS 204) — Digital Signatures Playground](#33-tab-2-ml-dsa-fips-204--digital-signatures-playground)
   * [Tab 3: SHA-3 / SHAKE (FIPS 202) — Keccak-f[1600] Permutation Engine](#34-tab-3-sha-3--shake-fips-202--keccak-f1600-permutation-engine)
   * [Tab 4: Hybrid QKD + PQC Hardware Studio (DR16–DR20 v1.1.0)](#35-tab-4-hybrid-qkd--pqc-hardware-studio-dr16dr20-v110)
   * [Tab 5: 23 Silicon Gates Explorer](#36-tab-5-23-silicon-gates-explorer)
   * [Tab 6: AIE2 Microarchitecture & DR10 Sealed Lifecycle Inspector](#37-tab-6-aie2-microarchitecture--dr10-sealed-lifecycle-inspector)
   * [Master Silicon Suite Test Runner Modal](#38-master-silicon-suite-test-runner-modal)
4. [Architecture & Hardware Bridge Overview](#4-architecture--hardware-bridge-overview)
5. [Repository Structure](#5-repository-structure)
6. [Citation & Academic Reference](#6-citation--academic-reference)
7. [License](#7-license)

---

## 1. Overview

The **AMD Phoenix NPU PQC Frontend Suite** provides a responsive, web-based user interface and hardware execution environment for the world's first **100% on-device, device-resident Post-Quantum Cryptography (PQC) & Hybrid Quantum Key Distribution (QKD) hardware engine** targeting AMD Phoenix APUs.

### Core Capabilities:
* **100% Device-Resident Silicon Execution**: Dispatches quantum-safe lattice arithmetic directly to the 16-tile AI Engine (AIE2 / XDNA1) compute matrix with **Zero Host CPU Fallback**.
* **NIST FIPS Final Standards**: Full support for FIPS 202 (SHA-3/SHAKE), FIPS 203 (ML-KEM-512/768/1024), and FIPS 204 (ML-DSA-44/65/87).
* **Hybrid QKD Defense-in-Depth (Milestone DR16–DR20)**: Fuses optical quantum keys (ETSI GS QKD 014) with post-quantum lattice keys via NIST SP 800-56C Dual-PRF combiners directly in tile memory.
* **Master Silicon Suite Validation**: Real-time streaming runner executing **all 23 hardware validation gates (839 / 839 test cases)** in ~28 seconds.

---

## 2. Quick Start: Clone & Run

### Prerequisites

| Component | Requirement | Description |
| :--- | :--- | :--- |
| **Node.js** | Version 18.0+ (Node 20+ or 24+ recommended) | JavaScript runtime for Vite dev server & production build. |
| **Git** | Any recent version | For cloning repositories. |
| **AMD Phoenix APU** *(Optional)* | Ryzen 7 7840HS, Ryzen 9 7940HS, 8845HS, 8945HS | Required only for physical hardware dispatch. |
| **Python & XRT** *(Optional)* | Python 3.10+ with MLIR-AIE / Ironenv | Required only for physical hardware bridge (`bridge_server.py`). |

> **Dual-Mode Operation**: If you do not have an AMD Phoenix laptop, the web interface automatically runs in **High-Fidelity Browser Emulation Mode**, allowing complete interactive exploration of all cryptographic features!

---

### Step 1: Clone the Repositories

We recommend cloning both the frontend repository and core hardware engine side-by-side into your workspace:

```powershell
# Create or navigate to your projects directory
mkdir -p C:\projects
cd C:\projects

# Clone the Frontend Dashboard
git clone https://github.com/midhatn/phoenix-npu-pqc-frontend.git

# (Optional) Clone the Core Hardware Engine for physical AIE2 execution
git clone https://github.com/midhatn/phoenix-npu-pqc.git
```

---

### Step 2: Start Frontend Web Server

```powershell
# Navigate into the frontend repository
cd phoenix-npu-pqc-frontend

# Install dependencies (React 19, Tailwind CSS v4, Lucide, Vite)
npm install

# Start the Vite development server
npm run dev -- --host
```

Open your web browser at 👉 **`http://localhost:3000`** (or `http://localhost:5173`).

---

### Step 3: Start Hardware Bridge Server (Optional for Physical NPU)

To connect the web interface directly to your laptop's physical AMD Phoenix NPU silicon:

```powershell
# In a second terminal window (inside phoenix-npu-pqc-frontend):
python bridge_server.py
```

The bridge server will automatically:
1. Probe the AMD XDNA NPU driver (`VEN_1022 DEV_1502`).
2. Attach to the core `phoenix-npu-pqc` engine.
3. Expose the REST & Server-Sent Events (SSE) bridge on port `3001`.
4. The dashboard header will immediately illuminate green: **`NPU Silicon: Connected`**!

---

## 3. Comprehensive UI Tutorial & Section Guide

```
+---------------------------------------------------------------------------------------------------------+
|  [Logo] AMD Phoenix NPU (XDNA1 · AIE2)                [● NPU Silicon: Connected]  [>_ Run Silicon Suite] |
+---------------------------------------------------------------------------------------------------------+
|  [<] [Key ML-KEM]  [Doc ML-DSA]  [# SHA-3]  [Shield Hybrid QKD]  [Cpu 23 Silicon Gates]  [Server AIE2] [>]  |
+---------------------------------------------------------------------------------------------------------+
```

---

### 3.1. Top Navigation & Control Header

* **Hardware Indicator**: Displays `NPU Silicon: Connected` when `bridge_server.py` is active, or `Browser Emulation` when running standalone.
* **`Run Silicon Suite` Button**: Opens the global terminal modal that dispatches all 23 hardware validation gates.
* **Scrollable Tab Strip**: Includes interactive `<` and `>` arrow buttons and mousewheel scrolling to navigate across all 6 modules on any screen size.

---

### 3.2. Tab 1: ML-KEM (FIPS 203) — Key Encapsulation Playground

The **ML-KEM Playground** allows you to execute Module-Lattice Key Encapsulation across all three NIST security categories.

```
+---------------------------+---------------------------+---------------------------+
| 1. Key Generation         | 2. Encapsulation          | 3. Decapsulation          |
| [ML-KEM-512 / 768 / 1024] | Generates Ciphertext (c)  | Recovers Shared Secret    |
| Generates: (ek, dk)       | and Shared Secret (ss)    | Tests CCA2 Rejection      |
+---------------------------+---------------------------+---------------------------+
```

#### Step-by-Step Tutorial & Examples:

1. **Select Parameter Set**: Choose **`ML-KEM-512`** (Category 1), **`ML-KEM-768`** (Category 3 - Recommended), or **`ML-KEM-1024`** (Category 5).
2. **Step 1: Generate KeyPair**:
   * Click **"Generate KeyPair on NPU"**.
   * *Output*: Generates encapsulation key `ek` (800–1,568 bytes) and decapsulation key `dk` (1,632–3,168 bytes).
   * Notice the hardware execution badge: `NPU Silicon (~550ms)`.
3. **Step 2: Encapsulate**:
   * Click **"Encapsulate Shared Secret"**.
   * *Output*: Produces ciphertext `c` and ephemeral 32-byte shared secret `ss`.
4. **Step 3: Decapsulate & Verify**:
   * Click **"Decapsulate on NPU"**.
   * *Verdict*: **`SHARED SECRET MATCHED (100% BIT-EXACT)`** — Both client and server hold the identical 256-bit secret key!
5. **Testing Attack Defenses (IND-CCA2 Tampering)**:
   * Turn ON the **"Simulate Ciphertext Tampering (Active Man-in-the-Middle Attack)"** toggle.
   * Click **"Decapsulate on NPU"**.
   * *Result*: IND-CCA2 implicit rejection engages on AIE2 hardware! Instead of leaking decapsulation errors, the NPU derives a deterministic pseudo-random reject key, thwarting chosen-ciphertext attacks.

---

### 3.3. Tab 2: ML-DSA (FIPS 204) — Digital Signatures Playground

The **ML-DSA Playground** demonstrates quantum-safe digital signatures using rejection sampling and hint bit-packing.

```
+---------------------------+---------------------------+---------------------------+
| 1. Key Generation         | 2. Sign Message           | 3. Verify Signature       |
| [ML-DSA-44 / 65 / 87]     | Computes Signature:       | Evaluates Matrix A * z    |
| Generates: (pk, sk)       | (c_tilde, z, h)           | Validates L1-Norm Bounds  |
+---------------------------+---------------------------+---------------------------+
```

#### Step-by-Step Tutorial & Examples:

1. **Select Security Category**: Choose **`ML-DSA-44`** (Fast), **`ML-DSA-65`** (Standard), or **`ML-DSA-87`** (High Security).
2. **Generate Signature Keys**: Click **"Generate KeyPair on NPU"** to derive public key `pk` and secret key `sk`.
3. **Enter Message**: Type any plaintext into the message box (e.g. `Device-Resident Post-Quantum Cryptography on AMD Phoenix NPU`).
4. **Sign**: Click **"Generate Signature on NPU"**.
   * *Output*: Generates signature containing commitment hash `c_tilde`, response vector `z`, and hint vector `h` (2,420 to 4,627 bytes).
5. **Verify**: Click **"Verify Signature on NPU"**.
   * *Verdict*: **`VALID SIGNATURE — Verified on physical AMD Phoenix AIE2 silicon`**!
6. **Testing Attack Defenses**:
   * Toggle **"Tamper Message"** or **"Tamper Signature"** and re-verify.
   * *Result*: Physical verifier on Tile (3,0) immediately rejects the signature (**`INVALID SIGNATURE`**), preventing forgery.

---

### 3.4. Tab 3: SHA-3 / SHAKE (FIPS 202) — Keccak-f[1600] Permutation Engine

The **Keccak Engine** showcases hardware acceleration of the 24-round `Keccak-p[1600, 24]` permutation on AIE2 vector tiles.

```
+-----------------------------------------------------------------------------------+
| Select: [SHA3-224] [SHA3-256] [SHA3-384] [SHA3-512] [SHAKE128] [SHAKE256]          |
| Input Conditioning: Plaintext ASCII  |  Hexadecimal String                        |
| SHAKE Squeeze Slider: [====|=========] 32 .. 512 Bytes                             |
+-----------------------------------------------------------------------------------+
```

#### Step-by-Step Tutorial & Examples:

1. **Select Algorithm**: Choose between fixed-length hash functions (`SHA3-256`, `SHA3-512`) or extendable output functions (`SHAKE128`, `SHAKE256`).
2. **Enter Data**: Provide plaintext ASCII or toggle **"Hex Input"** to feed binary test vectors.
3. **Adjust Squeeze Length (SHAKE only)**: Drag the slider to squeeze any output length from 16 to 512 bytes.
4. **Inspect Metrics**: Observe live telemetry for Sponge Rate ($r$), Capacity ($c$), and Output Bit Length ($d$).

---

### 3.5. Tab 4: Hybrid QKD + PQC Hardware Studio (DR16–DR20 v1.1.0)

The **Hybrid QKD + PQC Studio** demonstrates quantum defense-in-depth by fusing optical Quantum Key Distribution with Post-Quantum lattice algorithms.

```
+-----------------------------------------------------------------------------------+
| 1. KEM (FIPS 203)     | 2. Auth (FIPS 204)    | 3. Attack & Tamper Injection     |
| [512 / 768 / 1024]    | [ML-DSA-44 / 65]      | [Normal / MitM / Tamper / Poison] |
+-----------------------------------------------------------------------------------+
| 5-Stage AIE2 Hardware Fusing Flow:                                                |
| [1. ETSI 014 Ingress] -> [2. ML-DSA Auth] -> [3. ML-KEM] -> [4. SP 800-56C] -> [5. DR10 Zeroize] |
+-----------------------------------------------------------------------------------+
```

#### Step-by-Step Tutorial & Attack Injection Examples:

1. **Standard Compliant Handshake (PASS)**:
   * Leave Attack Mode set to **"Standard Compliant Handshake (PASS)"**.
   * Click **"Execute 100% NPU Handshake"**.
   * *Result*: Physical execution trace logs each stage across Tiles (0,1), (3,0), (2,0..2,3), (3,2), and (3,3). Both Master and Slave recover 100% bit-exact `$K_{\text{Final}}$` in ~67 ms!
2. **MitM Attack Test (Tamper QKD UUID)**:
   * Select **"MitM: Tamper QKD UUID (FIPS 204 Rejection)"**.
   * Click **"Execute 100% NPU Handshake"**.
   * *Defense*: Asymmetric ML-DSA signature check fails on Tile (3,0). Handshake aborts immediately and ephemeral keys are wiped.
3. **Ciphertext Tamper Test (CCA2 Rejection)**:
   * Select **"Tamper Ciphertext (CCA2 Rejection)"**.
   * *Defense*: Tile Row 2 detects altered ciphertext; derived master/slave keys diverge, preventing unauthorized eavesdropping.
4. **Poisoned Optical Key Test (Dual-PRF Test)**:
   * Select **"Poisoned QKD Optical Key (Dual-PRF Test)"**.
   * *Defense*: Even if optical QKD fiber is tapped or poisoned, NIST SP 800-56C Dual Combiner ensures the resulting session keys mismatch, preserving quantum immunity.

---

### 3.6. Tab 5: 23 Silicon Gates Explorer

The **Silicon Gates Explorer** provides an interactive directory of all 23 hardware validation gates.

```
+-----------------------------------------------------------------------------------+
| Total Tests: 839 / 839   |   Pass Rate: 100.00%   |   Active Silicon Gates: 23 / 23 |
| Filter: [ALL] [FIPS 203] [FIPS 204] [FIPS 202] [Hardware/DR0-10] [Search...]      |
+-----------------------------------------------------------------------------------+
```

#### Features:
* **Category Filtering**: Filter by standard (FIPS 203, FIPS 204, FIPS 202, Hardware).
* **Single Gate Dispatch**: Click **"Run This Gate"** on any card to dispatch that specific test script to the physical NPU and stream its output.
* **Architectural Badges**: View hardware invariant limits for every gate (`.text < 16 KiB`, `SRAM < 64 KiB`, `DMA Channels ≤ 2`).

---

### 3.7. Tab 6: AIE2 Microarchitecture & DR10 Sealed Lifecycle Inspector

The **Hardware Inspector** provides a live 4×4 topological layout of the AMD Phoenix NPU compute array.

```
+-----------------------------------------------------------------------------------+
| Row 0: [SHIM NOC (0,0)]    [SHIM NOC (0,1)]    [SHIM NOC (0,2)]    [SHIM NOC (0,3)]    |
| Row 1: [DR0 Ring Prod]     [DR1 ExpandA]       [DR2a SampleNTT]    [DR2b CBD3/Noise]   |
| Row 2: [DR5 KeyGen 512]    [DR6 Encaps 512]    [DR7 Decaps 512]    [DR8 Unified KEM]   |
| Row 3: [DR11 ML-DSA-44]    [DR14 ML-DSA-65]    [DR9 SHA-3 Service] [DR10 Zeroizer]     |
+-----------------------------------------------------------------------------------+
```

#### Interactive Operations:
1. **Tile Selection**: Click any tile to inspect its active task, text memory usage, SRAM allocation, and DMA channels.
2. **QKD Key Ingress**: Click **"Inject QKD Key"** to inject 256-bit entropy into the sealed session ring buffer.
3. **Trigger Hardware Zeroization**: Click **"Trigger Zeroization"** to dispatch the DR10 physical hardware memory scrubber. Wipes 262,144 bytes across SRAM partitions and returns Hardware CRC32 `0x3A6DE048`.

---

### 3.8. Master Silicon Suite Test Runner Modal

Clicking **"Run Silicon Suite"** in the navigation header launches the automated master certification runner:

```
+-----------------------------------------------------------------------------------+
| Progress: 23 / 23 Gates (100%)  |  Silicon Cases: 839 / 839  |  Status: PASSED    |
+-----------------------------------------------------------------------------------+
| [+] Gate 00: DR0 M33 Ring Product                        : PASS ( 0.92s)          |
| [+] Gate 01: DR1 ML-DSA-44 ExpandA                       : PASS ( 0.77s)          |
| ...                                                                               |
| [+] Gate 22: DR19 Hybrid QKD-PQC Session Orchestrator    : PASS ( 0.70s)          |
| ================================================================================  |
| MASTER SILICON SUITE RESULT: 23/23 GATES PASS (100.00%) in 28.10s                  |
+-----------------------------------------------------------------------------------+
```

* **Live Streaming Output**: Streams stdout/stderr from XRT test scripts in real time.
* **Auto Progress Tracking**: Automatically updates the progress bar and test counter across all 839 test cases.

---

## 4. Architecture & Hardware Bridge Overview

```
                                  BROWSER (React 19 + TypeScript)
                                 [http://localhost:3000]
                                            │
                             HTTP REST / SSE Streaming
                                            │
                                            ▼
                                PYTHON HARDWARE BRIDGE
                            [http://127.0.0.1:3001]
                             (bridge_server.py)
                                            │
                                 XRT Driver Bindings
                                            │
                                            ▼
                                AMD PHOENIX NPU SILICON
                            (Ryzen 7 7840HS / Ryzen 9 7940HS)
                          ┌───────────────────────────────────┐
                          │ 4x4 AIE2 / XDNA1 Vector Compute   │
                          │ 512-bit Vector SIMD Engine        │
                          │ 100% Device-Resident PQC & QKD    │
                          └───────────────────────────────────┘
```

The bridge server acts as a lightweight, zero-overhead intermediary between the browser and the low-level AMD XRT drivers, compiling JIT execution graphs and streaming hardware output back to the UI.

---

## 5. Repository Structure

```
phoenix-npu-pqc-frontend/
├── bridge_server.py               # Local Python REST/SSE bridge for live NPU hardware dispatch
├── index.html                     # HTML5 entrypoint with Plus Jakarta Sans & Fira Code
├── package.json                   # Node dependencies & project scripts
├── tsconfig.json                  # TypeScript root compiler configuration
├── tsconfig.app.json              # TypeScript frontend application configuration
├── vite.config.ts                 # Vite 6 + Tailwind CSS v4 bundler setup
└── src/
    ├── main.tsx                   # React 19 application root
    ├── App.tsx                    # Main view router, layout & tab controller
    ├── index.css                  # Tailwind CSS v4 imports & custom scrollbar
    ├── types.ts                   # Core TypeScript cryptographic interface definitions
    ├── utils.ts                   # Hex encoding, byte formatting, and clipboard utilities
    ├── crypto/
    │   ├── hardwareApi.ts         # REST API client connecting UI to port 3001
    │   ├── keccak.ts              # FIPS 202 SHA-3 & SHAKE browser emulation engine
    │   ├── mlkem.ts               # FIPS 203 ML-KEM browser emulation engine
    │   ├── mldsa.ts               # FIPS 204 ML-DSA browser emulation engine
    │   └── silicon.ts             # 23 Silicon Gates specifications & test metadata
    └── components/
        ├── Navbar.tsx             # Responsive header with horizontal scroll & arrows
        ├── MlkemPlayground.tsx    # Interactive ML-KEM playground with CCA2 tampering
        ├── MldsaPlayground.tsx    # Interactive ML-DSA signature playground
        ├── KeccakPlayground.tsx   # Interactive SHA-3 & SHAKE permutation engine
        ├── HybridQkdPlayground.tsx# Hybrid QKD Studio with attack injection & AIE2 trace
        ├── SiliconGateExplorer.tsx# 23-Gate verification explorer & single-gate runner
        ├── HardwareInspector.tsx  # 16-Tile AIE2 layout visualizer & DR10 zeroizer
        └── TestRunnerModal.tsx    # Master silicon suite terminal runner with live SSE
```

---

## 6. Citation & Academic Reference

If you use or reference this software suite in academic research, technical publications, or hardware security evaluations, please cite:

```bibtex
@software{nashar2026phoenix_frontend,
  author       = {Midhat Nashar},
  title        = {{AMD Phoenix NPU PQC Suite: Interactive Frontend & Hardware Dashboard}},
  year         = {2026},
  version      = {v1.1.0},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.22162273},
  url          = {https://github.com/midhatn/phoenix-npu-pqc-frontend}
}
```

---

## 7. License

Licensed under the **[Apache License, Version 2.0](LICENSE)**.
