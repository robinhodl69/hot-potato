# Synchronization Requirements

> These files must stay in sync with each other. Breaking sync = broken app.

## Critical Sync Pairs

### 1. Contract Code ↔ ABI

| Source of Truth | Must Match |
|----------------|------------|
| `contracts/template/src/lib.rs` | `frontend/src/abi/SampleNFT.json` |

**What must match:**
- Function names (exact spelling)
- Function parameters (types and order)
- Return types
- Events (name and indexed parameters)

**How to sync:**
```bash
cd contracts/template
cargo stylus export-abi --json > ../../frontend/src/abi/SampleNFT.json
```

**Signs of desync:**
- Transaction reverts with no clear error
- `readContract` returns undefined
- Console errors about missing functions

---

### 2. ABI ↔ Frontend Calls

| Source of Truth | Must Match |
|----------------|------------|
| `frontend/src/abi/SampleNFT.json` | All `writeContract`/`readContract` calls in `App.tsx` |

**What must match:**
```typescript
// In App.tsx:
writeContract({
  abi: SampleNFTAbi,
  functionName: "mint",     // ← Must exist in ABI
  args: [],                 // ← Must match ABI parameter count/types
  value: BigInt(0),         // ← Must be present if ABI says "payable"
});
```

**How to verify:**
1. Open `SampleNFT.json`
2. Find the function entry
3. Compare `name`, `inputs`, `stateMutability`

---

### 3. Deployed Contract ↔ CONTRACT_ADDRESS

| Source of Truth | Must Match |
|----------------|------------|
| Deployed contract on-chain | `CONTRACT_ADDRESS` in `frontend/src/App.tsx` line 13 |

**When this breaks:**
- You deploy a new version of the contract
- You switch between testnet and mainnet
- Someone else deployed the contract and gave you the address

**How to update:**
```typescript
// frontend/src/App.tsx line 13
const CONTRACT_ADDRESS = "0xNEW_ADDRESS_HERE";
```

---

### 4. Farcaster Manifest ↔ Frame Meta Tag

| Files That Must Match |
|-----------------------|
| `frontend/public/.well-known/farcaster.json` |
| `frontend/index.html` (fc:frame meta tag) |

**What must match:**
- `homeUrl` / `url` - Same production URL
- `iconUrl` / `imageUrl` - Valid image URLs
- App name should be consistent

**Template placeholders to replace:**
- `YOUR_APP_URL` → Your production URL (e.g., `https://myapp.vercel.app`)
- `YOUR_APP_IMAGE_URL` → Full URL to app icon
- `YOUR_APP_COLOR` → Hex color code (e.g., `#1a1a2e`)
- `YOUR_APP_NAME` → Your app's name

---

### 5. Chain Configuration

| Files That Must Match |
|-----------------------|
| `frontend/src/viemChains.ts` |
| `frontend/src/wagmi.ts` |
| `frontend/public/.well-known/farcaster.json` (requiredChains) |

**What must match:**
- Chain IDs must be consistent
- RPC URLs must be valid for the chain
- Farcaster manifest must declare chains the app uses

**Chain ID Reference:**
| Chain | Chain ID | EIP-155 Format |
|-------|----------|----------------|
| Nitro Localhost | 412346 | eip155:412346 |
| Arbitrum One | 42161 | eip155:42161 |
| Arbitrum Sepolia | 421614 | eip155:421614 |

---

## Sync Checklist

Use this checklist when making changes:

### After Modifying Contract (`lib.rs`)
- [ ] Contract compiles: `cargo build --release`
- [ ] Export ABI: `cargo stylus export-abi --json`
- [ ] Copy ABI to frontend: `frontend/src/abi/SampleNFT.json`
- [ ] Update frontend calls if function signatures changed
- [ ] If deployed: Update CONTRACT_ADDRESS

### After Deploying Contract
- [ ] Save new contract address
- [ ] Update `CONTRACT_ADDRESS` in `App.tsx`
- [ ] If switching networks: Update chain configuration

### After Changing App URLs
- [ ] Update `frontend/public/.well-known/farcaster.json`
- [ ] Update `frontend/index.html` fc:frame meta tag
- [ ] Rebuild: `pnpm build`

### After Adding Farcaster Features
- [ ] Add required capability to `farcaster.json` → `requiredCapabilities`
- [ ] Test in Farcaster Mini-App Previewer

---

## Quick Validation Commands

```bash
# Verify contract compiles
cd contracts/template && cargo build --release

# Verify frontend builds
pnpm build

# Check for placeholder URLs (should return nothing in production)
grep -r "YOUR_APP" frontend/

# Verify ABI has expected functions
cat frontend/src/abi/SampleNFT.json | grep '"name"'
```

---

## Common Desync Symptoms

| Symptom | Likely Cause |
|---------|--------------|
| "Function not found" in console | ABI doesn't match contract |
| Transaction reverts immediately | Wrong CONTRACT_ADDRESS or ABI mismatch |
| Wallet prompts for wrong network | Chain config mismatch |
| Farcaster can't find app | farcaster.json URLs wrong |
| Frame doesn't render | fc:frame meta tag invalid |
| "Call exception" errors | ABI parameter types wrong |
