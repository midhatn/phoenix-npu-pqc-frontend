# Contributing to AMD Phoenix NPU PQC Frontend

Thank you for your interest in contributing to the **AMD Phoenix NPU PQC Frontend & Interactive Dashboard**!

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Security reports should be filed according to [SECURITY.md](SECURITY.md).

---

## 1. Development Setup

The frontend is built with **React 19**, **Vite 6**, **TypeScript 5.7**, and **Tailwind CSS v4**.

```bash
# Clone the repository
git clone https://github.com/midhatn/phoenix-npu-pqc-frontend.git
cd phoenix-npu-pqc-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript check and production build
npm run build
```

---

## 2. Core Architecture

The frontend is organized as follows:

* `src/components/`:
  * `MlkemPlayground.tsx`: NIST FIPS 203 (ML-KEM-512/768/1024) interactive testing and ciphertext tampering.
  * `MldsaPlayground.tsx`: NIST FIPS 204 (ML-DSA-44/65/87) digital signature playground and message tampering.
  * `KeccakPlayground.tsx`: NIST FIPS 202 SHA-3 & SHAKE permutation suite with state visualizer.
  * `SiliconGateExplorer.tsx`: 19-Gate verification matrix and tile memory budget auditor.
  * `HardwareInspector.tsx`: 4×4 AIE2 array visualizer, DR10 zeroization scrubber, and QKD ingress.
  * `TestRunnerModal.tsx`: Silicon test runner with live hardware SSE streaming.
* `src/crypto/`:
  * `mlkem.ts`, `mldsa.ts`, `keccak.ts`: Browser-side TypeScript implementations for instant offline interactivity.
  * `silicon.ts`: Metadata, test counts, runtime latencies, and memory limits across all 19 hardware gates.
* `bridge_server.py`:
  * Lightweight Python server running on `localhost:3001` that bridges the browser UI to the physical AMD Phoenix NPU on Windows 11.

---

## 3. Physical Hardware Testing

If you have an AMD Phoenix APU (e.g. Ryzen 7 7840HS / Ryzen 9 7940HS w/ XDNA1 NPU):

1. Clone the core hardware engine [`midhatn/phoenix-npu-pqc`](https://github.com/midhatn/phoenix-npu-pqc).
2. Start the local bridge: `python bridge_server.py`.
3. The web interface will detect the hardware and enable direct silicon dispatch.

---

## 4. Pull Request Checklist

Before submitting a pull request:
- [ ] Run `npm run build` to verify there are zero TypeScript or bundling errors.
- [ ] Ensure any newly added UI components are responsive and adhere to the Tailwind dark theme palette.
- [ ] If adding cryptographic transforms, ensure test vectors match official NIST FIPS 202/203/204 specifications.
- [ ] For low-level MLIR-AIE dialect, C++ kernels, or XCLBIN modifications, submit pull requests to the primary engine repo: [`midhatn/phoenix-npu-pqc`](https://github.com/midhatn/phoenix-npu-pqc).

---

## 5. Licensing

Unless explicitly stated otherwise, contributions are submitted under the [Apache License 2.0](LICENSE).
