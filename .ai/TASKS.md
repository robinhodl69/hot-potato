# Common Modification Tasks

> Step-by-step guides for common changes. Follow these exactly to avoid breaking things.

---

## Task: Test Locally in Farcaster (with ngrok)

**Goal:** Preview and test your mini-app inside the actual Farcaster environment using local development servers.

### Prerequisites

- [ngrok](https://ngrok.com/) installed and authenticated
- Local devnode running (for contract testing)
- Frontend dev server running

### Files to Modify (temporarily)

1. `frontend/src/viemChains.ts` (RPC URLs)
2. `frontend/public/.well-known/farcaster.json` (app URLs)
3. `frontend/index.html` (frame meta tag URLs)

### Step-by-Step

**Step 1: Set up ngrok configuration**

The repo includes `ngrok.yml` at the root:
```yaml
tunnels:
  web5173:
    proto: http
    addr: 5173
  web8547:
    proto: http
    addr: 8547
```

If you don't have this file, create it.

**Step 2: Start all local servers**

Terminal 1 - Start the Nitro devnode:
```bash
pnpm --filter contract-template nitro-node
```

Terminal 2 - Start the frontend:
```bash
pnpm dev
```

Terminal 3 - Start ngrok:
```bash
ngrok start --all --config ngrok.yml
```

**Step 3: Get your ngrok URLs**

ngrok will display output like:
```
Forwarding  https://a1b2-xxx.ngrok.app -> http://localhost:5173
Forwarding  https://c3d4-yyy.ngrok.app -> http://localhost:8547
```

Note both URLs:
- **Frontend URL**: The one pointing to port 5173
- **RPC URL**: The one pointing to port 8547

**Step 4: Update viemChains.ts with ngrok RPC**

Edit `frontend/src/viemChains.ts`:

```typescript
// Change this:
rpcUrls: {
  default: {
    http: ['http://localhost:8547'],
    webSocket: ['ws://localhost:8547'],
  },
  public: {
    http: ['http://localhost:8547'],
    webSocket: ['ws://localhost:8547'],
  },
},

// To this (use YOUR ngrok URL):
rpcUrls: {
  default: {
    http: ['https://c3d4-yyy.ngrok.app'],
    webSocket: ['wss://c3d4-yyy.ngrok.app'],
  },
  public: {
    http: ['https://c3d4-yyy.ngrok.app'],
    webSocket: ['wss://c3d4-yyy.ngrok.app'],
  },
},
```

**Step 5: Update Farcaster manifest with ngrok URLs**

Edit `frontend/public/.well-known/farcaster.json`:

```json
{
  "frame": {
    "homeUrl": "https://a1b2-xxx.ngrok.app",
    "iconUrl": "https://a1b2-xxx.ngrok.app/icon.png",
    "splashImageUrl": "https://a1b2-xxx.ngrok.app/splash.png"
  }
}
```

**Step 6: Update frame meta tag**

Edit `frontend/index.html`, find the `<meta name="fc:frame">` tag and update URLs:

```html
<meta name="fc:frame" content='{
  "version": "next",
  "imageUrl": "https://a1b2-xxx.ngrok.app/frame-image.png",
  "button": {
    "title": "Open",
    "action": {
      "type": "launch_frame",
      "name": "Your App Name",
      "url": "https://a1b2-xxx.ngrok.app"
    }
  }
}' />
```

**Step 7: Configure your wallet**

Add the ngrok RPC to MetaMask (or your wallet):
- **Network Name**: Nitro Dev (ngrok)
- **RPC URL**: `https://c3d4-yyy.ngrok.app` (your RPC ngrok URL)
- **Chain ID**: 412346
- **Currency Symbol**: ETH

**Step 8: Test in Farcaster Mini-App Previewer**

1. Go to: https://farcaster.xyz/~/developers/mini-apps/preview
2. Enter your ngrok frontend URL: `https://a1b2-xxx.ngrok.app`
3. Click "Preview"
4. Test your app inside the Farcaster frame

### After Testing: Revert Changes!

**Important:** Don't commit the ngrok URLs! Revert to localhost before committing:

```bash
git checkout frontend/src/viemChains.ts
git checkout frontend/public/.well-known/farcaster.json
git checkout frontend/index.html
```

Or selectively restore just the URL changes.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| ngrok shows "reconnecting" | Check your ngrok auth token, restart ngrok |
| Wallet can't connect to chain | Make sure you're using https:// not http:// |
| Frame doesn't load | Verify farcaster.json is accessible at your ngrok URL |
| RPC calls fail | Check that both tunnels are running (5173 AND 8547) |
| "Failed to fetch" errors | CORS issue - ngrok should handle this automatically |

### Tips

- ngrok free tier gives you random URLs each restart. Paid plans give stable URLs.
- Keep the ngrok terminal visible to see incoming requests
- If something breaks, check the ngrok web interface at http://localhost:4040 for request logs

---

## Task: Change the NFT Theme/Branding

**Goal:** Make the NFT about something different (e.g., "Cute Cats" instead of "Farcaster MiniApp Starter")

### Files to Modify (in order)

1. `contracts/template/src/lib.rs`
2. `frontend/src/abi/SampleNFT.json` (regenerate)
3. `frontend/public/nft.png` (replace image)
4. `frontend/public/.well-known/farcaster.json`
5. `frontend/index.html`
6. `frontend/src/App.tsx` (optional: update UI text)

### Step-by-Step

**Step 1: Update contract metadata**

Edit `contracts/template/src/lib.rs`:

```rust
// Change the name() function (around line 40)
pub fn name(&self) -> Result<String, Vec<u8>> {
    Ok(String::from("Your NFT Name"))  // ← Change this
}

// Change the symbol() function (around line 44)
pub fn symbol(&self) -> Result<String, Vec<u8>> {
    Ok(String::from("SYMBOL"))  // ← Change this (3-5 chars)
}

// Change the token_uri() function (around line 48)
pub fn token_uri(&self, token_id: U256) -> Result<String, Vec<u8>> {
    let image = "/your-image.png";  // ← Change this
    let metadata = format!(
        r#"{{"name":"Your NFT Name #{}","description":"Your description here.","image":"{}"}}"#,
        token_id,
        image
    );
    Ok(metadata)
}
```

**Step 2: Export new ABI**

```bash
cd contracts/template
cargo stylus export-abi --json > ../../frontend/src/abi/SampleNFT.json
```

**Step 3: Replace NFT image**

Put your new image at `frontend/public/your-image.png` (match the path in token_uri)

**Step 4: Update Farcaster manifest**

Edit `frontend/public/.well-known/farcaster.json`:
```json
{
  "frame": {
    "name": "Your App Name",
    "subtitle": "Your app description",
    "description": "Your app description"
  }
}
```

**Step 5: Update frame embed**

Edit `frontend/index.html`, find the fc:frame meta tag and update the name.

**Step 6: Update UI text (optional)**

Edit `frontend/src/App.tsx` to change headings, button text, etc.

### Verify

```bash
cd contracts/template && cargo build --release  # Contract compiles
cd ../.. && pnpm build  # Frontend builds
```

---

## Task: Add a New Contract Function

**Goal:** Add custom functionality to the smart contract

### Files to Modify (in order)

1. `contracts/template/src/lib.rs`
2. `frontend/src/abi/SampleNFT.json` (regenerate)
3. `frontend/src/App.tsx` (add frontend call)

### Step-by-Step

**Step 1: Add function to contract**

Edit `contracts/template/src/lib.rs`, add inside the `impl FarcasterMiniAppStarterContract` block:

```rust
// Example: Add a function that returns total supply
pub fn total_supply(&self) -> Result<U256, Vec<u8>> {
    Ok(self.token_supply.get())
}

// Example: Add a payable mint function
pub fn paid_mint(&mut self) -> Result<(), Vec<u8>> {
    let value = self.vm().msg_value();
    if value < U256::from(1000000000000000u64) {  // 0.001 ETH
        return Err(b"Insufficient payment".to_vec());
    }
    // ... rest of mint logic
}
```

**Step 2: Export new ABI**

```bash
cd contracts/template
cargo stylus export-abi --json > ../../frontend/src/abi/SampleNFT.json
```

**Step 3: Call from frontend**

Edit `frontend/src/App.tsx`:

```typescript
// For read-only functions:
const totalSupply = await publicClient.readContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: SampleNFTAbi,
  functionName: 'total_supply',  // Must match ABI
});

// For write functions:
writeContract({
  address: CONTRACT_ADDRESS,
  abi: SampleNFTAbi,
  functionName: "paid_mint",
  value: BigInt(1000000000000000),  // 0.001 ETH in wei
});
```

### Verify

1. Function appears in `SampleNFT.json`
2. Frontend call uses exact function name from ABI
3. Parameter types match

---

## Task: Deploy to Production (Arbitrum Mainnet)

**Goal:** Deploy the app for real users

### Files to Modify

1. `contracts/template/src/lib.rs` (if not already done)
2. `frontend/src/App.tsx` (CONTRACT_ADDRESS)
3. `frontend/public/.well-known/farcaster.json` (URLs)
4. `frontend/index.html` (URLs)

### Step-by-Step

**Step 1: Deploy contract to Arbitrum**

```bash
cd contracts/template
export STYLUS_RPC_URL=https://arb1.arbitrum.io/rpc
export DEPLOY_PRIVATE_KEY=your-deployer-private-key
cargo stylus deploy --private-key $DEPLOY_PRIVATE_KEY
```

Save the deployed contract address from the output.

**Step 2: Update frontend contract address**

Edit `frontend/src/App.tsx` line 13:
```typescript
const CONTRACT_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

**Step 3: Update Farcaster URLs**

Edit `frontend/public/.well-known/farcaster.json`:
```json
{
  "frame": {
    "homeUrl": "https://your-production-url.com",
    "iconUrl": "https://your-production-url.com/icon.png",
    "splashImageUrl": "https://your-production-url.com/splash.png"
  }
}
```

**Step 4: Update frame meta tag**

Edit `frontend/index.html`, replace all `YOUR_APP_URL` placeholders with your production URL.

**Step 5: Build and deploy frontend**

```bash
pnpm build
# Deploy dist/ folder to your hosting (Vercel, Netlify, etc.)
```

### Verify

1. Visit your production URL
2. Connect wallet, ensure it prompts for Arbitrum
3. Test minting an NFT
4. Test sharing to Farcaster

---

## Task: Add a New Chain

**Goal:** Support additional EVM chains (e.g., Base, Optimism)

### Files to Modify (in order)

1. `frontend/src/viemChains.ts` (add chain definition)
2. `frontend/src/wagmi.ts` (add to chain list)
3. `frontend/public/.well-known/farcaster.json` (add to requiredChains)
4. Deploy contract to new chain
5. `frontend/src/App.tsx` (handle multiple addresses)

### Step-by-Step

**Step 1: Add chain to viemChains.ts**

```typescript
import { base } from 'viem/chains';

export { nitroLocalhost, arbitrum, arbitrumSepolia, base };
```

**Step 2: Add chain to wagmi.ts**

```typescript
import { base } from './viemChains';

const chains = [nitroLocalhost, arbitrum, arbitrumSepolia, base] as const;
```

**Step 3: Update Farcaster manifest**

Edit `frontend/public/.well-known/farcaster.json`:
```json
{
  "frame": {
    "requiredChains": ["eip155:42161", "eip155:8453"]  // Arbitrum + Base
  }
}
```

**Step 4: Deploy contract to new chain**

Deploy using appropriate RPC URL for the new chain.

**Step 5: Handle multiple contract addresses**

Edit `frontend/src/App.tsx`:
```typescript
const CONTRACT_ADDRESSES: Record<number, string> = {
  42161: "0x...",  // Arbitrum
  8453: "0x...",   // Base
};

// Then use:
const { chain } = useAccount();
const contractAddress = CONTRACT_ADDRESSES[chain?.id ?? 42161];
```

---

## Task: Update Frontend Styling

**Goal:** Change colors, layout, or design

### Files to Modify

- `frontend/src/App.tsx` (Tailwind classes)
- `frontend/tailwind.config.ts` (custom colors/themes)
- `frontend/public/` (images, icons)

### Key Tailwind Classes in App.tsx

```
bg-gradient-to-br from-slate-900 to-cyan-900  ← Background gradient
bg-slate-950/90  ← Card background
text-cyan-200  ← Primary text color
bg-cyan-600 hover:bg-cyan-700  ← Primary button
bg-green-600 hover:bg-green-700  ← Mint button
bg-purple-600 hover:bg-purple-700  ← Share button
```

### Adding Custom Colors

Edit `frontend/tailwind.config.ts`:
```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#your-color',
          secondary: '#your-color',
        }
      }
    }
  }
}
```

Then use `bg-brand-primary`, `text-brand-secondary`, etc.

---

## Task: Change the Mint Price

**Goal:** Make minting cost ETH

### Files to Modify

1. `contracts/template/src/lib.rs`
2. `frontend/src/abi/SampleNFT.json` (regenerate)
3. `frontend/src/App.tsx`

### Step-by-Step

**Step 1: Add payment check to contract**

Edit `contracts/template/src/lib.rs`:
```rust
pub fn mint(&mut self) -> Result<(), Vec<u8>> {
    let value = self.vm().msg_value();
    let price = U256::from(10000000000000000u64);  // 0.01 ETH

    if value < price {
        return Err(b"Insufficient payment".to_vec());
    }

    let to = self.vm().msg_sender();
    let token_id = self.token_supply.get() + U256::from(1);
    self.token_supply.set(token_id);
    Ok(self.erc721._mint(to, token_id)?)
}
```

**Step 2: Export new ABI** (important: stateMutability will change to "payable")

```bash
cd contracts/template
cargo stylus export-abi --json > ../../frontend/src/abi/SampleNFT.json
```

**Step 3: Update frontend to send value**

Edit `frontend/src/App.tsx`:
```typescript
const handleMint = () => {
  writeContract({
    address: CONTRACT_ADDRESS,
    abi: SampleNFTAbi,
    functionName: "mint",
    value: BigInt(10000000000000000),  // 0.01 ETH in wei
  });
};
```

### Verify

1. ABI shows `"stateMutability": "payable"` for mint function
2. Frontend sends correct value
3. Test mint fails without payment, succeeds with payment
