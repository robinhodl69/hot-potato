# Getting Started (Complete Beginner's Guide)

This guide is for people who have never coded before but want to build their own Farcaster mini-app using AI.

## What You'll Need

1. **Claude Code** - An AI coding assistant that runs on your computer
2. **This repository** - The starter template you're looking at right now
3. **An idea** - What do you want your mini-app to do?

That's it. No coding knowledge required.

---

## Step 1: Install Claude Code

Claude Code is a command-line tool that lets you build software by having a conversation with AI.

### On Mac

Open Terminal (search for "Terminal" in Spotlight) and paste:

```bash
npm install -g @anthropic-ai/claude-code
```

If that doesn't work, you might need to install Node.js first:
1. Go to https://nodejs.org
2. Download the LTS version
3. Install it
4. Try the command above again

### On Windows

Open PowerShell (search for "PowerShell" in Start menu) and paste:

```bash
npm install -g @anthropic-ai/claude-code
```

If that doesn't work, install Node.js first from https://nodejs.org

### Verify It Works

Type this and press Enter:

```bash
claude --version
```

You should see a version number. If you see an error, the installation didn't work.

---

## Step 2: Start Claude Code

In your terminal, type:

```bash
claude
```

This opens Claude Code. You'll see a prompt where you can type messages to Claude.

---

## Step 3: Copy and Paste This Magic Prompt

Copy everything in the box below and paste it into Claude Code:

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

**Before pasting**, replace the parts in [BRACKETS] with your own ideas:

| Replace this | With something like |
|--------------|---------------------|
| `[DESCRIBE YOUR APP IN 1-2 SENTENCES]` | "A membership NFT for my podcast listeners" |
| `[WHAT SHOULD THE NFT BE CALLED?]` | "Podcast VIP Pass" |
| `[3-5 LETTER SYMBOL, LIKE "COOL" OR "CATS"]` | "PVIP" |

---

## Step 4: Follow Along

Claude will:

1. **Clone the repository** - Download the starter code to your computer
2. **Read the instructions** - Understand how the codebase works
3. **Propose changes** - Tell you what it plans to modify
4. **Wait for your approval** - You say "yes" or "no" or ask questions
5. **Make the changes** - Write the code for you
6. **Explain what it did** - In simple terms

### Tips for Talking to Claude

- **Ask questions anytime**: "What does that mean?" or "Can you explain that simpler?"
- **Say no if unsure**: "Wait, I don't understand. Can you explain first?"
- **Be specific**: "I want the button to be blue" is better than "make it look nice"
- **Ask for options**: "What are my options here?" or "What else could we do?"

---

## Step 5: Test Your App

After Claude makes changes, you'll want to see your app running. Ask Claude:

```
How do I run this app locally to see it?
```

Claude will tell you the commands. Usually it's something like:

```bash
pnpm install
pnpm dev
```

Then open your web browser to `http://localhost:5173`

---

## Step 6: Test in Farcaster

When you're ready to test inside the actual Farcaster app, ask Claude:

```
Help me test this app in Farcaster using ngrok. Walk me through each step.
```

Claude will guide you through:
1. Installing ngrok (if needed)
2. Setting up tunnels
3. Updating the URLs
4. Using the Farcaster Mini-App Previewer

---

## Common Questions

### "What is a repository?"

A repository (or "repo") is a folder containing code. When you "clone" a repository, you're downloading that folder to your computer.

### "What is a terminal?"

A terminal is a way to type commands to your computer instead of clicking buttons. Claude Code runs in the terminal.

### "What if Claude makes a mistake?"

Just tell Claude! Say something like:

```
That's not what I wanted. Can you undo that and try something different?
```

Claude can undo changes and try again.

### "What if I get stuck?"

Ask Claude for help:

```
I'm stuck. Can you help me understand what's happening and what I should do next?
```

### "What if something breaks?"

Don't panic. Tell Claude:

```
Something broke. Here's what I see: [describe the problem or paste the error]

Can you help me fix it?
```

### "How do I start over?"

If you want to reset everything:

```
I want to start over from scratch. Can you help me reset the repository to its original state?
```

---

## What You're Building

This starter creates a Farcaster mini-app with:

- **A web page** that users see
- **A smart contract** on Arbitrum (for NFTs)
- **Farcaster integration** so it works inside Farcaster

You're customizing all three parts by describing what you want to Claude.

---

## Next Steps

Once your app is working locally, you'll want to:

1. **Deploy it** - Put it on the internet so others can use it
2. **Connect a real wallet** - For real NFTs on Arbitrum
3. **Submit to Farcaster** - So people can discover your app

Ask Claude to help with each step:

```
I'm ready to deploy this app. Can you walk me through the steps?
```

---

## Getting More Help

- **Ask Claude** - Your first stop for any question
- **GitHub Issues** - https://github.com/hummusonrails/farcaster-arbitrum-miniapp-starter/issues
- **Farcaster Docs** - https://docs.farcaster.xyz/developers/mini-apps/overview
- **Arbitrum Stylus Docs** - https://docs.arbitrum.io/stylus/stylus-gentle-introduction

Good luck building your app!
