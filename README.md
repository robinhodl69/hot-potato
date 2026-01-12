# The Arbitrum Core

<p align="center">
  <img src="frontend/public/core-preview.png" alt="The Arbitrum Core" width="300" />
</p>

<p align="center">
  <strong>🔥 A "Hot Potato" Game on Arbitrum Stylus 🔥</strong>
</p>

<p align="center">
  <a href="https://arbitrum.io/stylus">
    <img src="https://img.shields.io/badge/Arbitrum-Stylus-28A0F0.svg?logo=arbitrum&logoColor=white" alt="Arbitrum Stylus" />
  </a>
  <a href="https://docs.farcaster.xyz/developers/mini-apps">
    <img src="https://img.shields.io/badge/Farcaster-MiniApp-8B5CF6.svg" alt="Farcaster MiniApp" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/Frontend-React-61DAFB.svg?logo=react&logoColor=white" alt="React" />
  </a>
</p>

---

## 🎮 Overview

**The Arbitrum Core** is a social on-chain game where players compete to hold a digital "Core" NFT and accumulate points. The twist? Hold it too long and it enters **MELTDOWN** mode, burning your points!

### Game Mechanics

| Action | Effect |
|--------|--------|
| **HOLD** | Earn 10 points every 100 blocks (~3 min) |
| **MELTDOWN** | After 900 blocks (~30 min), lose 5% points/min |
| **TRANSFER** | Pass the Core before meltdown to lock in your points |

### Anti-Gaming Rules
- Cannot transfer back to the previous holder
- Farcaster FID registration prevents multi-wallet abuse

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run frontend
pnpm --filter frontend dev

# Build for production
pnpm --filter frontend build
```

---

## 🏗️ Architecture

### Smart Contract (Stylus/Rust)
- **Network**: Arbitrum Sepolia
- **Address**: `0x963d9779eb0de38878a8763f9e840e3622cfba7e`
- **Runtime**: Stylus (Rust → WASM)

### Frontend (React/Vite)
```
frontend/src/
├── views/                  # 6 main views
│   ├── HomeView.tsx        # Boot sequence & entry
│   ├── GameView.tsx        # CORE_DASHBOARD - main gameplay
│   ├── AnalyticsView.tsx   # OPERATOR_INTEL - leaderboard
│   ├── VaultView.tsx       # USER_HANGAR - personal stats
│   ├── SystemLogsView.tsx  # SYSTEM_LOGS - event stream
│   └── TechTerminalView.tsx # TECH_TERMINAL - contract info
├── components/
│   ├── core/CoreVisual.tsx # Animated core with meltdown effects
│   └── effects/Starfield.tsx # Background animation
├── hooks/useSynth.ts       # Audio feedback
├── AppRouter.tsx           # Routing & global game state
└── wagmi.ts                # Wallet configuration
```

### Design System
- **Aesthetic**: Cyberpunk "Stellar Core Command"
- **Colors**: Cyan (stable) / Orange-Red (meltdown)
- **Fonts**: Orbitron (headings), Fira Code (data)

---

## 📱 Views

| Route | Name | Description |
|-------|------|-------------|
| `/` | HOME | Boot sequence, entry point |
| `/core` | CORE | Main game interface with transfer controls |
| `/pulse` | INTEL | Leaderboard & eligibility status |
| `/vault` | HANGAR | Personal stats & achievements |
| `/logs` | LOGS | Real-time Transfer event stream |
| `/terminal` | TECH | Contract parameters & network status |

---

## 🔗 Contract Functions

```rust
fn gameState() -> (address, address, u256, bool)  // holder, prevHolder, lastBlock, isMelting
fn grabCore() -> void                              // Claim the Core
fn passTheCore(to: address) -> void                // Transfer to another player
fn getPoints(addr: address) -> u256                // Get player's points
fn registerFid(fid: u256) -> void                  // Link Farcaster ID
```

---

## 🌐 Farcaster MiniApp

This app is designed as a Farcaster MiniApp with:
- `fc:frame` meta tags for embed preview
- Farcaster wallet connector
- PWA manifest for fullscreen mobile experience

### Deploy to Farcaster

1. Deploy frontend to Vercel/Netlify
2. Update URLs in `index.html` and `farcaster.json`
3. Register at [warpcast.com/~/developers](https://warpcast.com/~/developers)
4. Share your app link in a cast

---

## 🛠️ Development

```bash
# Start dev server
pnpm --filter frontend dev

# Build
pnpm --filter frontend build

# Preview build
pnpm --filter frontend preview
```

---

## 📚 Resources

- [Arbitrum Stylus Docs](https://arbitrum.io/stylus)
- [Farcaster MiniApps](https://docs.farcaster.xyz/developers/mini-apps)
- [wagmi](https://wagmi.sh/)
- [viem](https://viem.sh/)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

<p align="center">
  <strong>Built with 🦾 on Arbitrum Stylus</strong>
</p>
