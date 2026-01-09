# Example Prompts for AI Agents

> Copy-paste these prompts and fill in the blanks. These are designed to get safe, scoped changes.

---

## First Time Here? Start with This

If you haven't cloned the repo yet, use this prompt in Claude Code:

```
Clone the repository at https://github.com/hummusonrails/farcaster-arbitrum-miniapp-starter

After cloning, read the CLAUDE.md file to understand how this codebase works.

Then help me build a Farcaster mini-app. Here's what I want:

App idea: [DESCRIBE YOUR APP IN 1-2 SENTENCES]
NFT name: [WHAT SHOULD THE NFT BE CALLED?]
NFT symbol: [3-5 LETTER SYMBOL, LIKE "COOL" OR "CATS"]

Please:
1. Propose what changes you'll make before writing any code
2. Wait for my approval before modifying files
3. Explain things simply - I'm new to this
```

For detailed setup instructions, see [GETTING_STARTED.md](../GETTING_STARTED.md).

---

## The Golden Rule

Always include this constraint in your prompts:

> **"Propose changes before writing code. List all files you plan to modify."**

This prevents the AI from making changes you don't understand.

---

## Template Prompts

### Set Up Local Farcaster Testing

```
I want to test my app in Farcaster locally using ngrok.

My ngrok URLs are:
- Frontend (5173): [PASTE_FRONTEND_NGROK_URL]
- RPC (8547): [PASTE_RPC_NGROK_URL]

Please update these files with my ngrok URLs:
- frontend/src/viemChains.ts
- frontend/public/.well-known/farcaster.json
- frontend/index.html

Show me the changes first, then make them.
Also remind me to revert these before committing.
```

**Example filled in:**
```
I want to test my app in Farcaster locally using ngrok.

My ngrok URLs are:
- Frontend (5173): https://a1b2-12-34-56-78.ngrok.app
- RPC (8547): https://c3d4-12-34-56-78.ngrok.app

Please update these files with my ngrok URLs:
- frontend/src/viemChains.ts
- frontend/public/.well-known/farcaster.json
- frontend/index.html

Show me the changes first, then make them.
Also remind me to revert these before committing.
```

---

### Revert ngrok URLs After Testing

```
I'm done testing with ngrok. Please revert all the ngrok URLs back to
the original localhost/placeholder values in:
- frontend/src/viemChains.ts
- frontend/public/.well-known/farcaster.json
- frontend/index.html

Show me the changes before making them.
```

---

### Change the NFT Theme

```
I want to change this NFT to be about [TOPIC].

Details:
- NFT name: [NAME] (e.g., "Cool Cats")
- NFT symbol: [SYMBOL] (e.g., "CATS", 3-5 characters)
- Description: [DESCRIPTION]
- I'll provide my own image at: [IMAGE_FILENAME].png

Please:
1. Propose all changes before modifying code
2. Update the contract, export the ABI, and update the frontend
3. Tell me what to name my image file and where to put it
```

**Example filled in:**
```
I want to change this NFT to be about space explorers.

Details:
- NFT name: "Space Explorers"
- NFT symbol: "SPACE"
- Description: "Commemorating the brave souls who venture into the unknown."
- I'll provide my own image at: explorer.png

Please:
1. Propose all changes before modifying code
2. Update the contract, export the ABI, and update the frontend
3. Tell me what to name my image file and where to put it
```

---

### Add a Mint Price

```
I want minting to cost [AMOUNT] ETH.

Please:
1. Update the contract to require payment
2. Update the frontend to send the payment
3. Show me how to verify it works
4. Don't forget to export and update the ABI
```

**Example filled in:**
```
I want minting to cost 0.01 ETH.

Please:
1. Update the contract to require payment
2. Update the frontend to send the payment
3. Show me how to verify it works
4. Don't forget to export and update the ABI
```

---

### Change the App Colors

```
I want to change the app colors to match my brand.

My colors:
- Primary: [HEX_COLOR] (e.g., #ff6b6b)
- Secondary: [HEX_COLOR]
- Background: [HEX_COLOR]

Only change the styling in App.tsx. Don't touch the contract.
```

---

### Add a New Button/Feature

```
I want to add a [FEATURE] button to the UI.

When clicked, it should [ACTION].

Please:
1. Explain where this will go in the code
2. Show me the changes before making them
3. Only modify App.tsx unless the contract needs changes
```

**Example filled in:**
```
I want to add a "View on OpenSea" button to the UI.

When clicked, it should open the NFT on OpenSea in a new tab.

Please:
1. Explain where this will go in the code
2. Show me the changes before making them
3. Only modify App.tsx unless the contract needs changes
```

---

### Prepare for Production

```
I'm ready to deploy this app. My production details:

- App URL: [YOUR_URL] (e.g., https://myapp.vercel.app)
- App name: [YOUR_APP_NAME]
- App icon URL: [YOUR_ICON_URL]
- Splash color: [HEX_COLOR]

Please update all the placeholder URLs in:
- frontend/public/.well-known/farcaster.json
- frontend/index.html

Show me the changes before making them.
```

---

### Add a Contract Function

```
I want to add a new function to the contract.

Function name: [NAME]
What it does: [DESCRIPTION]
Parameters: [LIST OR "none"]
Returns: [TYPE OR "nothing"]

Please:
1. Propose the Rust code first
2. After I approve, update the contract
3. Export the new ABI
4. Show me how to call it from the frontend
```

**Example filled in:**
```
I want to add a new function to the contract.

Function name: getTotalMinted
What it does: Returns how many NFTs have been minted
Parameters: none
Returns: a number (uint256)

Please:
1. Propose the Rust code first
2. After I approve, update the contract
3. Export the new ABI
4. Show me how to call it from the frontend
```

---

### Debug a Problem

```
Something is broken. Here's what's happening:

[DESCRIBE THE PROBLEM]

What I expected: [EXPECTED BEHAVIOR]
What actually happens: [ACTUAL BEHAVIOR]

Please:
1. Don't change any code yet
2. Tell me what might be wrong
3. Ask me questions if you need more info
```

---

## Prompts to Avoid (and Why)

### Bad: Too Vague
```
Make this app better.
```
**Problem:** The AI doesn't know what "better" means to you.

### Bad: No Guardrails
```
Change the contract to support multiple NFT types.
```
**Problem:** This is a major change. The AI might break things. Better:
```
I want to support multiple NFT types. Before making changes:
1. Explain what files would need to change
2. Explain what might break
3. Propose an approach for my approval
```

### Bad: Assumes Context
```
Fix the ABI.
```
**Problem:** The AI doesn't know what's wrong with it. Better:
```
The frontend is showing "function not found" errors when calling mint().
The contract has a mint() function. I think the ABI might be out of sync.
Can you check if the ABI matches the contract and fix it if needed?
```

---

## Constraint Phrases to Include

Add these to any prompt for safer results:

| Phrase | Effect |
|--------|--------|
| "Propose changes before writing code" | AI explains first |
| "List all files you'll modify" | No surprise changes |
| "Don't touch the contract" | Limits scope to frontend |
| "Don't touch the frontend" | Limits scope to contract |
| "Export the ABI after contract changes" | Prevents sync issues |
| "Show me the diff" | See exactly what changed |
| "Ask me if anything is unclear" | Prevents assumptions |

---

## Quick Start Prompt

If you just want to get going, use this:

```
I cloned this Farcaster + Arbitrum starter. I want to build [YOUR_IDEA].

Before you start:
1. Read the CLAUDE.md file to understand the codebase
2. Propose a plan for what files you'll change
3. Wait for my approval before modifying code
4. After any contract changes, export and update the ABI

My app idea: [DESCRIBE YOUR APP]
```

**Example:**
```
I cloned this Farcaster + Arbitrum starter. I want to build a membership NFT
for my podcast. Holders get access to bonus episodes.

Before you start:
1. Read the CLAUDE.md file to understand the codebase
2. Propose a plan for what files you'll change
3. Wait for my approval before modifying code
4. After any contract changes, export and update the ABI

The NFT should be called "Podcast VIP" with symbol "PVIP".
The image will be my podcast logo at /podcast-logo.png.
```
