# Troubleshooting Guide

> Common problems and how to fix them. Search for your error message or symptom.

---

## Contract Issues

### "cargo build fails with missing crate"

**Symptom:**
```
error[E0433]: failed to resolve: use of undeclared crate or module
```

**Cause:** Dependency not in Cargo.toml

**Fix:**
1. Check `contracts/template/Cargo.toml` for the missing crate
2. Add it if missing:
   ```toml
   [dependencies]
   missing-crate = "version"
   ```
3. Run `cargo build --release` again

---

### "cargo stylus export-abi fails"

**Symptom:**
```
error: could not find `stylus` in `cargo`
```

**Cause:** cargo-stylus not installed

**Fix:**
```bash
cargo install cargo-stylus
```

---

### "Contract deployed but calls fail"

**Symptom:** Frontend shows transaction reverts or "call exception"

**Possible Causes:**

1. **ABI out of sync** - Did you export the ABI after changing the contract?
   ```bash
   cd contracts/template
   cargo stylus export-abi --json > ../../frontend/src/abi/SampleNFT.json
   ```

2. **Wrong CONTRACT_ADDRESS** - Check `frontend/src/App.tsx` line 13

3. **Wrong chain** - Is your wallet connected to the same chain as the contract?

---

## Frontend Issues

### "pnpm build fails"

**Symptom:**
```
error TS2304: Cannot find name 'X'
```

**Fix:** Usually a TypeScript error. Read the error message for the file and line number.

Common causes:
- Typo in import statement
- Function doesn't exist in ABI
- Type mismatch

---

### "Wallet won't connect"

**Symptom:** Connect button does nothing or shows error

**Possible Causes:**

1. **No wallet installed** - Need MetaMask or another browser wallet

2. **Wrong connector** - Check `frontend/src/wagmi.ts`
   - In development: uses `injected()` connector
   - In Farcaster: uses `farcasterMiniApp()` connector

3. **Chain not added** - Wallet doesn't know about the chain
   - Wallet should prompt to add chain automatically

---

### "Transaction stuck on pending"

**Symptom:** Mint shows "Minting..." forever

**Possible Causes:**

1. **Not enough gas** - Check wallet for insufficient funds error

2. **Nonce issue** - Try resetting account in wallet settings

3. **RPC issues** - Check console for network errors

---

### "NFT not showing in gallery"

**Symptom:** Minted successfully but gallery is empty

**Possible Causes:**

1. **Transfer event not indexed** - Check that `SampleNFT.json` has the Transfer event

2. **Wrong token ID format** - Check console for errors in `getLogs`

3. **tokenURI returns invalid JSON** - Check contract's `token_uri` function

**Debug:** Open browser console (F12) and look for errors.

---

## Farcaster Issues

### "App not found in Farcaster"

**Symptom:** Farcaster can't discover or load the app

**Possible Causes:**

1. **farcaster.json not accessible** - Try visiting:
   ```
   https://your-url.com/.well-known/farcaster.json
   ```
   Should return JSON, not 404

2. **Invalid JSON** - Use a JSON validator on the file

3. **Wrong URLs** - Check that `homeUrl` matches your actual URL

---

### "Frame doesn't render"

**Symptom:** Farcaster shows broken or no frame

**Possible Causes:**

1. **fc:frame meta tag malformed** - Check `frontend/index.html`
   - Must be valid JSON inside the `content` attribute
   - All URLs must be absolute (start with https://)

2. **Image URL broken** - `imageUrl` must be publicly accessible

3. **Placeholder URLs still present** - Search for "YOUR_APP":
   ```bash
   grep -r "YOUR_APP" frontend/
   ```

---

### "Share to Farcaster does nothing"

**Symptom:** Share button doesn't open Farcaster composer

**Possible Causes:**

1. **Not running in Farcaster** - This only works inside the Farcaster app

2. **SDK not initialized** - Check that `sdk.actions.ready()` was called

3. **Missing capability** - Check `farcaster.json` has:
   ```json
   "requiredCapabilities": ["actions.composeCast"]
   ```

---

## ABI Sync Issues

### "Function not found in ABI"

**Symptom:**
```
Error: Function "X" not found on ABI
```

**Fix:**
1. Check if function exists in `contracts/template/src/lib.rs`
2. Re-export ABI:
   ```bash
   cd contracts/template
   cargo stylus export-abi --json > ../../frontend/src/abi/SampleNFT.json
   ```
3. Verify function is in `SampleNFT.json`

---

### "Parameter type mismatch"

**Symptom:**
```
Error: invalid argument type
```

**Cause:** Frontend passing wrong type to contract function

**Fix:**
1. Check ABI for expected types
2. In TypeScript:
   - `uint256` → `BigInt(value)` or template literal with `n` suffix
   - `address` → string starting with `0x`
   - `string` → regular string
   - `bytes` → `0x` prefixed hex string

---

## Development Environment

### "Nitro devnode won't start"

**Symptom:** Can't connect to localhost:8547

**Fix:**
1. Make sure Docker is running
2. Start the devnode:
   ```bash
   pnpm --filter contract-template nitro-node
   ```
3. Wait ~30 seconds for it to initialize

---

### "pnpm install fails"

**Symptom:** Dependency resolution errors

**Fix:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### "ngrok not connecting"

**Symptom:** Tunnel shows "reconnecting" or "failed"

**Fix:**
1. Check ngrok account/auth token:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```
2. Verify ports match your actual servers:
   - Frontend: 5173 (Vite default)
   - Devnode: 8547 (Nitro default)
3. Make sure ngrok.yml exists in repo root with correct config

---

## ngrok / Local Farcaster Testing Issues

### "Farcaster previewer can't load my app"

**Symptom:** Farcaster Mini-App Previewer shows blank or error

**Possible Causes:**

1. **farcaster.json not accessible**
   - Test: Visit `https://YOUR_NGROK_URL/.well-known/farcaster.json`
   - Should return JSON, not 404 or HTML

2. **URLs still pointing to localhost**
   - Check all three files have ngrok URLs:
     - `frontend/src/viemChains.ts`
     - `frontend/public/.well-known/farcaster.json`
     - `frontend/index.html`

3. **Mixed http/https**
   - All URLs must use `https://` (ngrok provides this)
   - WebSocket URLs should use `wss://` not `ws://`

4. **ngrok tunnel not running**
   - Check ngrok terminal is still active
   - Restart with: `ngrok start --all --config ngrok.yml`

---

### "Wallet won't connect through ngrok"

**Symptom:** Wallet connection fails when testing via ngrok

**Fix:**

1. **Add ngrok RPC to wallet manually:**
   - Network Name: Nitro Dev (ngrok)
   - RPC URL: `https://YOUR_NGROK_RPC_URL` (the 8547 tunnel)
   - Chain ID: 412346
   - Symbol: ETH

2. **Make sure viemChains.ts has ngrok URL:**
   ```typescript
   rpcUrls: {
     default: {
       http: ['https://YOUR_NGROK_RPC_URL'],
       webSocket: ['wss://YOUR_NGROK_RPC_URL'],
     },
   },
   ```

3. **Clear wallet cache:**
   - In MetaMask: Settings > Advanced > Clear Activity Tab Data

---

### "RPC requests timing out through ngrok"

**Symptom:** Contract calls hang or fail with timeout

**Possible Causes:**

1. **Devnode not running**
   ```bash
   pnpm --filter contract-template nitro-node
   ```

2. **Wrong ngrok tunnel**
   - Make sure you're using the 8547 tunnel URL for RPC
   - The 5173 tunnel is for the frontend only

3. **ngrok rate limits (free tier)**
   - Free tier has request limits
   - Wait a moment and retry

**Debug:** Check ngrok web interface at http://localhost:4040 to see if requests are reaching your server.

---

### "Committed ngrok URLs by accident"

**Symptom:** Pushed code with temporary ngrok URLs

**Fix:**
```bash
# Revert the specific files
git checkout origin/main -- frontend/src/viemChains.ts
git checkout origin/main -- frontend/public/.well-known/farcaster.json
git checkout origin/main -- frontend/index.html

# Commit the fix
git add -A
git commit -m "Revert temporary ngrok URLs"
git push
```

**Prevention:** Before committing, always run:
```bash
grep -r "ngrok" frontend/
```
Should return nothing (or only documentation).

---

## Quick Diagnostic Commands

```bash
# Check if contract compiles
cd contracts/template && cargo build --release

# Check if frontend builds
pnpm build

# Check for placeholder URLs
grep -r "YOUR_APP" frontend/

# Check if ABI has expected functions
cat frontend/src/abi/SampleNFT.json | grep '"name"'

# Check chain in browser console
# Open browser dev tools and run:
# await ethereum.request({ method: 'eth_chainId' })
```

---

## Still Stuck?

If you're using an AI agent, try this prompt:

```
I'm getting this error:

[PASTE ERROR MESSAGE]

This happened when I tried to:

[WHAT YOU WERE DOING]

Please:
1. Don't change any code yet
2. Explain what this error means
3. Tell me the most likely cause
4. Show me how to verify the cause
5. Then show me the fix
```
