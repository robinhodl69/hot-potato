# System Architecture

> This document explains how all the pieces of this codebase fit together. Read this to understand what you're working with.

## Overview

This is a **full-stack Web3 application** that runs inside Farcaster (a social network). Users can:
1. Connect their wallet
2. Mint an NFT on Arbitrum
3. Share to Farcaster

## The Three Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     FARCASTER LAYER                         │
│  Farcaster reads farcaster.json and fc:frame meta tag       │
│  to display the app in its interface                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  React app (App.tsx) handles UI and wallet interactions     │
│  Uses wagmi/viem to talk to the blockchain                  │
│  Uses Farcaster SDK for social features                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     CONTRACT LAYER                          │
│  Rust smart contract (lib.rs) runs on Arbitrum              │
│  Handles NFT minting and ownership                          │
└─────────────────────────────────────────────────────────────┘
```

## How Data Flows

### Minting an NFT

```
User clicks "Mint NFT"
       ↓
App.tsx calls writeContract({ functionName: "mint" })
       ↓
wagmi sends transaction to Arbitrum
       ↓
lib.rs mint() function executes on-chain
       ↓
NFT is minted, Transfer event emitted
       ↓
Frontend detects event, updates UI
```

### The ABI Connection

The **ABI (Application Binary Interface)** is how the frontend knows how to talk to the contract.

```
lib.rs                    SampleNFT.json              App.tsx
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ pub fn mint()│ ──────► │ "name":"mint"│ ──────► │ writeContract│
│ pub fn name()│  export │ "name":"name"│  import │ ({ abi: ... │
│ ...          │   ABI   │ ...          │         │    })        │
└──────────────┘         └──────────────┘         └──────────────┘
```

If these don't match, calls will fail.

## File Responsibilities

### Contract Layer (`contracts/template/`)

| File | Purpose |
|------|---------|
| `src/lib.rs` | Main contract code. All NFT logic lives here. |
| `src/main.rs` | ABI export entry point. Auto-generated, don't edit. |
| `Cargo.toml` | Rust dependencies (stylus-sdk, openzeppelin-stylus) |
| `package.json` | npm scripts for build/deploy (`pnpm --filter contract-template build`) |

### Frontend Layer (`frontend/`)

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main React component. Contains CONTRACT_ADDRESS and all UI. |
| `src/abi/SampleNFT.json` | Contract ABI. Must match lib.rs exactly. |
| `src/wagmi.ts` | Wallet configuration. Defines which chains and connectors to use. |
| `src/viemChains.ts` | Chain definitions. RPC URLs for Arbitrum and local dev. |
| `src/hooks/usePublicClient.ts` | viem client for read-only contract calls. |
| `index.html` | HTML template. Contains fc:frame meta tag for Farcaster. |

### Farcaster Layer (`frontend/public/`)

| File | Purpose |
|------|---------|
| `.well-known/farcaster.json` | Farcaster manifest. Declares app name, icon, capabilities. |
| `nft.png` | Default NFT image served by the app. |

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **wagmi** - React hooks for Ethereum
- **viem** - Low-level Ethereum client
- **@farcaster/miniapp-sdk** - Farcaster integration

### Contract
- **Rust** - Programming language
- **Stylus SDK** - Arbitrum's Rust smart contract framework
- **OpenZeppelin Stylus** - Pre-built ERC721 implementation

### Tooling
- **pnpm** - Package manager (monorepo workspaces)
- **cargo** - Rust build tool
- **cargo-stylus** - Stylus deployment CLI

## Chain Configuration

The app supports multiple chains:

| Chain | Chain ID | Usage |
|-------|----------|-------|
| Nitro Localhost | 412346 | Local development |
| Arbitrum One | 42161 | Production mainnet |
| Arbitrum Sepolia | 421614 | Testnet |

Chain selection is automatic based on `NODE_ENV`:
- Development: Uses localhost (412346)
- Production: Uses Arbitrum One (42161)

## Farcaster Integration Points

### 1. Manifest (`farcaster.json`)
```json
{
  "frame": {
    "version": "1",
    "name": "App Name",
    "homeUrl": "https://your-app.com",
    "requiredChains": ["eip155:42161"],
    "requiredCapabilities": ["actions.composeCast", "wallet.getEthereumProvider"]
  }
}
```

### 2. Frame Meta Tag (`index.html`)
```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"...","button":{...}}' />
```

### 3. SDK Usage (`App.tsx`)
```typescript
import { sdk } from "@farcaster/miniapp-sdk";
sdk.actions.ready();           // Signal app is loaded
sdk.actions.composeCast({...}); // Share to Farcaster
```

## Build Pipeline

```
                    CONTRACT BUILD

lib.rs ──► cargo build ──► .wasm ──► cargo stylus deploy ──► Contract Address
                              │
                              ▼
                    cargo stylus export-abi
                              │
                              ▼
                    SampleNFT.json (ABI)


                    FRONTEND BUILD

App.tsx + ABI ──► vite build ──► dist/ ──► Deploy to hosting
```

## Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `STYLUS_RPC_URL` | Contract deploy | Target RPC endpoint |
| `DEPLOY_PRIVATE_KEY` | Contract deploy | Deployer wallet key |
| `NODE_ENV` | Frontend | Controls chain selection |
| `VITE_USE_LOCALHOST` | Frontend | Force localhost chain |
