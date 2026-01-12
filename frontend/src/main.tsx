import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";

import AppRouter from "./AppRouter.tsx";
import { config } from "./wagmi.ts";

import { sdk } from "@farcaster/miniapp-sdk";
import "./index.css";

// Signal Farcaster that the mini-app is ready to be displayed
sdk.actions.ready();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
