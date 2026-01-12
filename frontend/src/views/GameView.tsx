/**
 * GameView - CORE_DASHBOARD
 * Main gameplay interface with real-time Stylus contract state
 * 
 * Components:
 * - CoreStabilityGauge: Visual stability percentage
 * - ActiveOperator: Current holder display
 * - TransferAction: Primary grab/transfer button
 * - YieldTracker: Real-time points counter
 */
import { useEffect, useRef, useState } from 'react';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, User, Flame, Target, CircleHelp } from 'lucide-react';
import { sdk } from '@farcaster/miniapp-sdk';

import CoreVisual from '../components/core/CoreVisual';
import HowToPlayModal from '../components/hud/HowToPlayModal';
import OperatorProfile from '../components/identity/OperatorProfile';
import { useSynth } from '../hooks/useSynth';
import { useGameState } from '../AppRouter';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';

const CONTRACT_ADDRESS = "0x963d9779eb0de38878a8763f9e840e3622cfba7e";
const SAFE_LIMIT_BLOCKS = 900;

export default function GameView() {
    const { isConnected, address } = useAccount();
    const { connect, connectors } = useConnect();
    const { play } = useSynth();
    const { heat, isMelting, currentHolder, previousHolder, blockNumber } = useGameState();
    const lastSonarTime = useRef(0);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // ========================
    // CONTRACT READS
    // ========================

    // User points
    const { data: userPoints } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        functionName: 'getPoints',
        args: [address],
        query: { enabled: !!address, refetchInterval: 5000 }
    }) as { data: bigint | undefined };

    // ========================
    // CONTRACT WRITES
    // ========================
    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // ========================
    // DERIVED STATE
    // ========================
    const isOwner = address?.toLowerCase() === currentHolder?.toLowerCase();
    const isPreviousHolder = address?.toLowerCase() === previousHolder?.toLowerCase();
    const canGrab = isConnected && !isOwner && (!isPreviousHolder || isMelting);

    // Stability calculation: (SAFE_LIMIT - blocksHeld) / SAFE_LIMIT * 100
    const stabilityPercent = Math.max(0, Math.min(100, (1 - heat) * 100));
    const blocksRemaining = Math.max(SAFE_LIMIT_BLOCKS - (heat * SAFE_LIMIT_BLOCKS), 0);
    const timeRemaining = Math.floor(blocksRemaining * 2); // ~2s per block on Arbitrum

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatAddress = (addr: string | undefined) => {
        if (!addr) return 'NONE';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // ========================
    // EFFECTS
    // ========================

    // SDK init & Context
    const [farcasterUser, setFarcasterUser] = useState<{ username?: string, pfpUrl?: string } | null>(null);

    useEffect(() => {
        const initSdk = async () => {
            try {
                sdk.actions.ready();
                const context = await sdk.context;
                if (context?.user) {
                    setFarcasterUser({
                        username: context.user.username,
                        pfpUrl: context.user.pfpUrl
                    });
                }
            } catch (err) {
                console.warn('Running outside Farcaster or failed to get context', err);
            }
        };
        initSdk();
    }, []);

    // Sonar effect when owner and melting
    useEffect(() => {
        if (!isOwner || !isMelting) return;
        const now = Date.now();
        const interval = Math.max(2000 - heat * 1500, 500);
        if (now - lastSonarTime.current > interval) {
            play('sonar', { intensity: Math.min(heat, 1) });
            lastSonarTime.current = now;
        }
    }, [heat, isOwner, isMelting, play]);

    // ========================
    // ACTIONS
    // ========================
    const [targetAddress, setTargetAddress] = useState('');

    const handleGrabCore = () => {
        play('click');
        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TheArbitrumCoreAbi,
            functionName: 'grabCore',
            args: [],
        });
    };

    const handleTransfer = () => {
        if (!targetAddress) return;
        play('click');
        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TheArbitrumCoreAbi,
            functionName: 'passTheCore',
            args: [targetAddress as `0x${string}`],
        });
    };

    const handleConnect = () => {
        play('click');
        connect({ connector: connectors[0] });
    };

    // ========================
    // RENDER
    // ========================
    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* HEADER - Connection Status */}
            <header className="relative flex-shrink-0 px-4 py-3 flex justify-between items-center border-b border-white/5">
                {/* Left: Status */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isMelting ? 'bg-meltdown animate-pulse' : 'bg-stable'}`} />
                    <span className={`text-micro font-bold tracking-wider ${isMelting ? 'text-meltdown' : 'text-stable'}`}>
                        CORE_DASHBOARD
                    </span>
                </div>

                {/* Center: HOW TO PLAY */}
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-stable text-black text-[10px] font-bold tracking-widest rounded hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                >
                    HOW TO PLAY
                </button>

                {/* Right: Address */}
                <div className={`text-micro font-bold ${isConnected ? (isMelting ? 'text-meltdown' : 'text-stable') : 'text-white/50'}`}>
                    {isConnected ? formatAddress(address) : 'DISCONNECTED'}
                </div>
            </header>

            {/* TOP SECTION - Core Visual Only */}
            <div className="h-[45%] flex items-center justify-center">
                <div className="w-40 h-40 md:w-48 md:h-48">
                    <CoreVisual heat={Math.min(heat, 1.3)} />
                </div>
            </div>

            {/* BOTTOM SECTION - HUD Panels */}
            <div
                className="flex-1 flex flex-col relative z-30 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-4"
                style={{ gap: '1rem' }}
            >
                {/* Stability + Timer Row */}
                <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {isMelting ? (
                                <Flame className="w-4 h-4 text-meltdown animate-pulse" />
                            ) : (
                                <Target className="w-4 h-4 text-stable" />
                            )}
                            <span className="text-micro opacity-50">STABILITY</span>
                        </div>
                        <div className={`font-heading text-xl font-bold ${isMelting ? 'text-meltdown' : 'text-stable'}`}>
                            {stabilityPercent.toFixed(0)}%
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${isMelting ? 'bg-meltdown' : 'bg-stable'}`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${stabilityPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    {/* Timer */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-micro opacity-40">
                            {isMelting ? 'CRITICAL // BURNING' : 'TIME TO MELTDOWN'}
                        </div>
                        <div className={`font-heading text-2xl font-bold ${isMelting ? 'text-meltdown' : 'text-white'}`}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>

                {/* CONTROL PANEL */}
                <div className="flex-shrink-0" style={{ gap: '1rem', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>

                    {/* Stats Row */}
                    <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                        <div className="flex justify-between items-center">
                            {/* YieldTracker */}
                            <div>
                                <div className="text-micro opacity-40">YOUR YIELD</div>
                                <motion.div
                                    className="font-heading text-2xl font-bold"
                                    key={userPoints?.toString()}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                >
                                    {userPoints?.toString() || '0'}
                                </motion.div>
                            </div>

                            {/* ActiveOperator */}
                            <div className="text-right">
                                <div className="text-micro opacity-40">ACTIVE OPERATOR</div>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <User className={`w-3 h-3 ${isOwner ? 'text-stable' : 'opacity-40'}`} />
                                    <span className={`font-data text-sm ${isOwner ? 'text-stable font-bold' : 'opacity-70'}`}>
                                        {isOwner ? 'YOU' : formatAddress(currentHolder)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TransferAction */}
                    {!isConnected ? (
                        <button onClick={handleConnect} className="btn btn-primary w-full">
                            CONNECT WALLET
                        </button>
                    ) : isOwner ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="0x... recipient address"
                                value={targetAddress}
                                onChange={(e) => setTargetAddress(e.target.value)}
                                className={`w-full px-4 py-3 bg-black/40 backdrop-blur-sm border rounded-sm font-data text-sm placeholder:opacity-40 focus:outline-none transition-all ${isMelting
                                    ? 'border-meltdown/30 focus:border-meltdown/80 focus:shadow-glow-meltdown'
                                    : 'border-stable/20 focus:border-stable/60 focus:shadow-glow-stable'
                                    }`}
                            />
                            <button
                                onClick={handleTransfer}
                                disabled={!targetAddress || isPending || isConfirming}
                                className={`w-full ${isMelting ? 'btn btn-danger' : 'btn btn-primary'}`}
                            >
                                {isPending || isConfirming ? 'TRANSMITTING...' : 'EJECT CORE →'}
                            </button>
                        </div>
                    ) : canGrab ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-stable animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">Core Vulnerable // Initiate Seizure</span>
                            </div>
                            <button
                                onClick={handleGrabCore}
                                disabled={isPending || isConfirming}
                                className="btn btn-primary w-full shadow-[0_0_20px_rgba(0,255,255,0.3)] animate-pulse"
                            >
                                {isPending || isConfirming ? 'ACQUIRING...' : 'GRAB CORE'}
                            </button>
                        </div>
                    ) : (
                        <OperatorProfile
                            address={currentHolder}
                            isPreviousHolder={isPreviousHolder || false}
                            isMe={false}
                            farcasterUser={farcasterUser}
                        />
                    )}

                    {/* Success Toast */}
                    <AnimatePresence>
                        {isConfirmed && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="glass-panel glass-panel-stable p-3 text-center"
                            >
                                <span className="font-data text-xs text-stable">✓ TRANSACTION CONFIRMED</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <HowToPlayModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
    );
}
