# Contributing to Phoenix NPU PQC Frontend

Thank you for contributing to the **Phoenix NPU PQC Frontend**! This repository provides the interactive web dashboard, cryptographic playground, and real-time visualization suite for device-resident Post-Quantum Cryptography and Quantum Key Distribution on AMD Phoenix NPU silicon.

---

## 1. Development Guidelines

* **Framework**: React 19 + Vite 6 + Tailwind CSS v4 + TypeScript 5.7.
* **Component Architecture**: Modular UI components located in `src/components/`.
* **State Management**: Clean local state & React hooks with strict TypeScript typing.
* **Silicon Parity**: All cryptographic test vectors, parameter sets, and simulated latency bounds must match the physical hardware metrics documented in the core research repository ([`midhatn/phoenix-npu-pqc`](https://github.com/midhatn/phoenix-npu-pqc)).

---

## 2. Local Setup & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Type check & build production bundle
npm run build
```

---

## 3. Submitting Pull Requests

1. Fork and create a branch (`git checkout -b feature/qkd-network-map`).
2. Test your changes locally to ensure clean build output (`npm run build`).
3. Submit a Pull Request describing your visual or functional enhancements.
