import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  useAccount,
  useConnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useBlockNumber
} from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, TrendingUp, User, Wifi, WifiOff } from "lucide-react";

import TheArbitrumCoreAbi from "./abi/TheArbitrumCore.json";
import CoreThree from "./components/core/CoreThree";
import { GlassPanel, MeltdownTimer } from "./components/hud/TerminalHUD";
import { TransferHUD } from "./components/game/TransferHUD";

const CONTRACT_ADDRESS = "0x963d9779eb0de38878a8763f9e840e3622cfba7e";

export default function App() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Contract State
  const { data: gameState } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TheArbitrumCoreAbi,
    functionName: 'game_state',
    query: { refetchInterval: 5000 }
  }) as { data: [string, string, bigint, boolean] | undefined };

  const { data: userPoints } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TheArbitrumCoreAbi,
    functionName: 'get_points',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 }
  }) as { data: bigint | undefined };

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Derived State
  const currentHolder = gameState?.[0];
  const lastTransferBlock = gameState?.[2] || 0n;
  const isMelting = gameState?.[3] || false;
  const isOwner = address?.toLowerCase() === currentHolder?.toLowerCase();

  // Calculate heat (0 to 1)
  const blocksHeld = blockNumber ? Number(blockNumber - lastTransferBlock) : 0;
  const heat = Math.min(blocksHeld / 900, 1.2); // Cap at 1.2 for "overheat" visuals
  const blocksRemaining = Math.max(900 - blocksHeld, 0);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const handleTransfer = (target: string) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TheArbitrumCoreAbi,
      functionName: "pass_the_core",
      args: [target],
    });
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200 selection:bg-cyan-500/30 font-sans overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,180,216,0.05),_transparent)] pointer-events-none" />

      <header className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]" />
          <span className="text-[10px] font-mono tracking-widest font-bold uppercase">Arbitrum_Core_v1.0</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 opacity-60">
            {isConnected ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
            <span className="text-[9px] font-mono uppercase tracking-tighter">
              {isConnected ? 'Link_Established' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto pt-20 pb-24 px-6 flex flex-col min-h-screen">
        {/* 3D Scene Section */}
        <div className="relative h-[300px] -mt-4 mb-2">
          <CoreThree heat={Math.min(heat, 1)} />

          <AnimatePresence>
            {isMelting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-500/5 mix-blend-overlay pointer-events-none transition-colors"
              />
            )}
          </AnimatePresence>
        </div>

        {/* HUD Panels */}
        <div className="space-y-4 flex-grow">
          <GlassPanel className="border-t-2 border-t-cyan-500/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white -mb-1">The Core</h1>
                <p className="text-[9px] font-mono text-cyan-500 tracking-[0.2em] font-bold">IDENTIFIER_BLOCK_ID_01</p>
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-mono opacity-40 uppercase tracking-widest">Global Entropy</span>
                <span className="text-lg font-mono font-bold text-cyan-400">{(heat * 100).toFixed(1)}%</span>
              </div>
            </div>

            <MeltdownTimer blocksRemaining={blocksRemaining} isMelting={isMelting} />
          </GlassPanel>

          <GlassPanel>
            {!isConnected ? (
              <div className="py-2 text-center">
                <p className="text-xs font-mono opacity-50 mb-4 tracking-tighter">INITIALIZE_ENCRYPTION_LINK_TO_BEGIN</p>
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="w-full py-3 bg-white text-black font-black text-xs tracking-[0.3em] uppercase hover:bg-cyan-400 transition-colors"
                >
                  Establish Link
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Holder Info */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-md border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                      <User className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono opacity-40 uppercase">Current_Carrier</span>
                      <span className="text-[11px] font-mono font-bold truncate max-w-[150px]">
                        {isOwner ? 'YOU (AUTHORIZED)' : currentHolder || 'SCANNING...'}
                      </span>
                    </div>
                  </div>
                  <Shield className={`w-4 h-4 ${isOwner ? 'text-green-500' : 'text-white/20'}`} />
                </div>

                {isOwner ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Initiate_Handoff</span>
                    </div>
                    <TransferHUD onTransfer={handleTransfer} isPending={isPending || isConfirming} />
                    <p className="text-[9px] font-mono opacity-40 leading-relaxed italic text-center px-4">
                      "Transfer ownership to a known FID or ENS resolver. Avoid previous holders to bypass anti-cycling protocols."
                    </p>
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-white/10 rounded-md">
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-tighter mb-1">Waiting for transmission...</p>
                    <p className="text-[9px] font-mono opacity-30 italic px-6 leading-tight">
                      Only the current carrier can initiate a core relocation protocol.
                    </p>
                  </div>
                )}
              </div>
            )}
          </GlassPanel>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel className="flex items-center gap-3 py-3">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-mono opacity-50 uppercase">Accumulated_Pts</span>
                <span className="text-sm font-mono font-bold">{userPoints?.toString() || '0'}</span>
              </div>
            </GlassPanel>
            <GlassPanel className="flex items-center gap-3 py-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-mono opacity-50 uppercase">Session_Load</span>
                <span className="text-sm font-mono font-bold">{blocksHeld}B</span>
              </div>
            </GlassPanel>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 pointer-events-none z-10">
        <div className="max-w-md mx-auto flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <img src="/arbitrum.png" alt="Arb" className="w-4 h-4 opacity-40" />
            <span className="text-[8px] font-mono opacity-20 uppercase tracking-[0.4em]">Proprietary_Tech</span>
          </div>
          <div className="text-right opacity-30">
            <p className="text-[8px] font-mono grayscale italic">"Pass_Before_Ignition"</p>
            <p className="text-[7px] font-mono uppercase tracking-tighter">© 2026 PsyLabs Industrial Division</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
