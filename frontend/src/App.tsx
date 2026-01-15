/**
 * The Arbitrum Core - Main Application
 * Hot Potato game on Arbitrum Stylus with Farcaster integration
 */
import { useEffect, useRef, useState } from "react";
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
import { Zap, AlertTriangle } from "lucide-react";

import TheArbitrumCoreAbi from "./abi/TheArbitrumCore.json";
import CoreVisual from "./components/core/CoreVisual";
import { useSynth } from "./hooks/useSynth";

const CONTRACT_ADDRESS = '0xd499da7647edf49770b01130baa1c9bd73e6083a';
const SAFE_LIMIT_BLOCKS = 7200;
const BLOCK_TIME_SECONDS = 0.25;
export default function App() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { play } = useSynth();
  const lastSonarTime = useRef(0);

  // ===== CONTRACT READS (camelCase to match ABI) =====
  const { data: gameState } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TheArbitrumCoreAbi,
    functionName: 'gameState',
    query: { refetchInterval: 3000 }
  }) as { data: [string, string, bigint, boolean, bigint] | undefined };

  const { data: userPoints } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TheArbitrumCoreAbi,
    functionName: 'getPoints',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 }
  }) as { data: bigint | undefined };

  // ===== CONTRACT WRITES =====
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ===== DERIVED STATE =====
  const currentHolder = gameState?.[0];
  const lastTransferBlock = gameState?.[2] || 0n;
  const isMelting = gameState?.[3] || false;
  const isOwner = address?.toLowerCase() === currentHolder?.toLowerCase();

  // Heat calculation (0 = safe, 1 = meltdown threshold, >1 = burning)
  const blocksHeld = blockNumber ? Number(blockNumber - lastTransferBlock) : 0;
  const heat = blocksHeld / SAFE_LIMIT_BLOCKS;
  const blocksRemaining = Math.max(SAFE_LIMIT_BLOCKS - blocksHeld, 0);
  const timeRemaining = blocksRemaining * 2; // ~2s per block

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ===== EFFECTS =====
  useEffect(() => {
    try {
      sdk.actions.ready();
    } catch {
      // Silently fail when running outside Farcaster context
      console.warn("Running outside Farcaster - SDK not available");
    }
  }, []);

  // Sonar pulse effect based on urgency
  useEffect(() => {
    if (!isOwner || !isMelting) return;

    const now = Date.now();
    const interval = Math.max(2000 - heat * 1500, 500); // Faster as heat increases

    if (now - lastSonarTime.current > interval) {
      play('sonar', { intensity: Math.min(heat, 1) });
      lastSonarTime.current = now;
    }
  }, [blocksHeld, isOwner, isMelting, heat, play]);

  // ===== HANDLERS =====
  const [targetAddress, setTargetAddress] = useState("");

  const handleTransfer = () => {
    if (!targetAddress) return;
    play('click');
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TheArbitrumCoreAbi,
      functionName: "passTheCore",
      args: [targetAddress as `0x${string}`],
    });
  };

  const handleConnect = () => {
    play('click');
    connect({ connector: connectors[0] });
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative scanlines">
      {/* ===== BACKGROUND ===== */}
      <div className="fixed inset-0 bg-black -z-10" />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header Bar */}
        <header className="flex-shrink-0 px-4 py-3 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMelting ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
            <span className="mono text-[10px] tracking-widest uppercase opacity-60">
              ARBITRUM_CORE
            </span>
          </div>
          <div className="mono text-[10px] opacity-40">
            {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'DISCONNECTED'}
          </div>
        </header>

        {/* Core Visual - Top Half */}
        <div className="flex-1 relative min-h-0">
          <CoreVisual heat={Math.min(heat, 1.3)} />

          {/* Status Badge Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} px-4 py-2 flex items-center gap-2`}>
              {isMelting ? (
                <AlertTriangle className="w-4 h-4 text-orange-500 animate-pulse" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-400" />
              )}
              <span className={`mono text-xs font-bold ${isMelting ? 'text-orange-400' : 'text-cyan-400'}`}>
                {isMelting ? 'MELTDOWN' : 'STABLE'}
              </span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <div className={`mono text-4xl font-bold tracking-tight ${isMelting ? 'text-orange-500 shake' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="mono text-[10px] opacity-40 uppercase tracking-widest">
              {isMelting ? 'BURNING POINTS' : 'TIME REMAINING'}
            </div>
          </div>
        </div>

        {/* Control Panel - Bottom Half */}
        <div className="flex-shrink-0 p-4 space-y-3">
          {/* Points Display */}
          <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4 flex justify-between items-center`}>
            <div>
              <div className="mono text-[10px] opacity-40 uppercase">Your Points</div>
              <div className="mono text-2xl font-bold">{userPoints?.toString() || '0'}</div>
            </div>
            <div className="text-right">
              <div className="mono text-[10px] opacity-40 uppercase">Heat Level</div>
              <div className={`mono text-2xl font-bold ${isMelting ? 'text-orange-400' : 'text-cyan-400'}`}>
                {(Math.min(heat, 1) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Action Area */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="btn-brutal btn-brutal-primary w-full"
            >
              CONNECT WALLET
            </button>
          ) : isOwner ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="0x... or @username"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className={`w-full px-4 py-3 bg-black/40 backdrop-blur-sm border rounded-sm font-mono text-sm placeholder:opacity-40 focus:outline-none transition-all ${isMelting
                  ? 'border-orange-500/30 focus:border-orange-500/80 focus:shadow-[0_0_15px_rgba(255,62,0,0.3)]'
                  : 'border-cyan-500/20 focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                  }`}
              />
              <button
                onClick={handleTransfer}
                disabled={!targetAddress || isPending || isConfirming}
                className={`btn-brutal w-full ${isMelting ? 'btn-brutal-danger' : 'btn-brutal-primary'}`}
              >
                {isPending || isConfirming ? 'TRANSMITTING...' : 'EJECT CORE // TRANSFER'}
              </button>
            </div>
          ) : (
            <div className="glass-panel glass-panel-stable p-4 text-center">
              <div className="mono text-[10px] opacity-40 uppercase mb-1">Current Holder</div>
              <div className="mono text-xs truncate opacity-70">
                {currentHolder || 'SCANNING...'}
              </div>
              <div className="mono text-[9px] opacity-30 mt-2 italic">
                WAITING FOR TRANSMISSION
              </div>
            </div>
          )}

          {/* Transaction Success Feedback */}
          <AnimatePresence>
            {isConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel glass-panel-stable p-3 text-center"
              >
                <span className="mono text-xs text-cyan-400">✓ CORE EJECTED SUCCESSFULLY</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

