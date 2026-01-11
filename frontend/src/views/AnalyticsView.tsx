/**
 * AnalyticsView - OPERATOR_INTEL
 * Social competition and anti-gaming verification
 * 
 * Components:
 * - Leaderboard: Top addresses by yield
 * - EligibilityBadge: User cooldown status
 * - OperatorHistory: Previous holders in current cycle
 * - EventFeed: Real-time Transfer events
 */
import { useState } from 'react';
import { useAccount, useWatchContractEvent, useBlockNumber } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Trophy, Users, TrendingUp, Shield, ShieldOff, ExternalLink } from 'lucide-react';

import { useGameState } from '../AppRouter';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';

const CONTRACT_ADDRESS = "0x963d9779eb0de38878a8763f9e840e3622cfba7e";

interface TransferEvent {
    from: string;
    to: string;
    blockNumber: bigint;
    transactionHash: string;
    timestamp: number;
}

export default function AnalyticsView() {
    const { address } = useAccount();
    const { heat, isMelting, currentHolder, previousHolder } = useGameState();
    const { data: blockNumber } = useBlockNumber({ watch: true });

    // Transfer events state
    const [transferEvents, setTransferEvents] = useState<TransferEvent[]>([]);

    // Watch for Transfer events
    useWatchContractEvent({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        eventName: 'Transfer',
        onLogs(logs) {
            const newEvents = logs.map(log => ({
                from: (log as any).args?.from || '0x0',
                to: (log as any).args?.to || '0x0',
                blockNumber: log.blockNumber || 0n,
                transactionHash: log.transactionHash || '',
                timestamp: Date.now(),
            }));
            setTransferEvents(prev => [...newEvents, ...prev].slice(0, 20));
        },
    });

    // Eligibility check
    const isEligible = address &&
        address.toLowerCase() !== currentHolder?.toLowerCase() &&
        address.toLowerCase() !== previousHolder?.toLowerCase();

    // Format helpers
    const formatAddress = (addr: string) => {
        if (!addr || addr === '0x0') return 'GENESIS';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const getTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    // Mock leaderboard - TODO: Build from indexed events
    const topHolders = [
        { rank: 1, address: currentHolder || '0x0000', points: 1250, isActive: true },
        { rank: 2, address: previousHolder || '0x0000', points: 980, isActive: false },
        { rank: 3, address: '0x9E1C...4f1', points: 750, isActive: false },
        { rank: 4, address: '0x2A8D...7c3', points: 520, isActive: false },
        { rank: 5, address: '0xF5B2...1d8', points: 340, isActive: false },
    ];

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Activity className={`w-5 h-5 ${isMelting ? 'text-meltdown' : 'text-stable'}`} />
                    <h1 className="font-heading text-lg font-bold uppercase tracking-wider">OPERATOR INTEL</h1>
                </div>
                <div className="text-micro opacity-40">
                    BLOCK #{blockNumber?.toString() || '...'}
                </div>
            </div>

            {/* EligibilityBadge */}
            <div className={`glass-panel ${isEligible ? 'glass-panel-stable' : 'glass-panel-meltdown'} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isEligible ? (
                            <Shield className="w-5 h-5 text-stable" />
                        ) : (
                            <ShieldOff className="w-5 h-5 text-meltdown" />
                        )}
                        <div>
                            <div className="text-micro opacity-50">YOUR STATUS</div>
                            <div className={`font-heading text-sm font-bold ${isEligible ? 'text-stable' : 'text-meltdown'}`}>
                                {!address ? 'NOT CONNECTED' : isEligible ? 'ELIGIBLE TO GRAB' : 'COOLDOWN ACTIVE'}
                            </div>
                        </div>
                    </div>
                    {!isEligible && address && (
                        <div className="text-right">
                            <div className="text-micro opacity-40">REASON</div>
                            <div className="font-data text-xs opacity-70">
                                {address.toLowerCase() === currentHolder?.toLowerCase()
                                    ? 'You hold the Core'
                                    : 'Previous holder'
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-stable" />
                        <span className="text-micro opacity-50">ENTROPY</span>
                    </div>
                    <div className={`font-heading text-2xl font-bold ${isMelting ? 'text-meltdown' : 'text-stable'}`}>
                        {(heat * 100).toFixed(1)}%
                    </div>
                </div>

                <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-stable" />
                        <span className="text-micro opacity-50">TRANSFERS</span>
                    </div>
                    <div className="font-heading text-2xl font-bold">
                        {transferEvents.length}
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="font-heading text-xs uppercase tracking-widest font-bold">LEADERBOARD</span>
                </div>

                <div className="space-y-2">
                    {topHolders.map((holder) => (
                        <motion.div
                            key={holder.rank}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: holder.rank * 0.1 }}
                            className={`flex items-center justify-between py-2 border-b border-white/5 last:border-0 ${holder.isActive ? 'bg-stable/5' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-heading text-sm font-bold w-6 ${holder.rank === 1 ? 'text-warning' :
                                    holder.rank === 2 ? 'text-neutral-400' :
                                        holder.rank === 3 ? 'text-meltdown-light' : 'opacity-40'
                                    }`}>
                                    #{holder.rank}
                                </span>
                                <span className="font-data text-xs">
                                    {formatAddress(holder.address)}
                                    {holder.isActive && <span className="ml-2 text-stable text-micro">● ACTIVE</span>}
                                </span>
                            </div>
                            <div className="font-heading text-sm font-bold text-stable">
                                {holder.points}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Live Transfer Feed */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-stable animate-pulse" />
                        <span className="font-heading text-xs uppercase tracking-widest font-bold">LIVE FEED</span>
                    </div>
                    <div className="text-micro opacity-40">
                        {transferEvents.length} events
                    </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                    <AnimatePresence>
                        {transferEvents.length === 0 ? (
                            <div className="text-center py-4 opacity-40">
                                <div className="text-micro">Watching for Transfer events...</div>
                            </div>
                        ) : (
                            transferEvents.slice(0, 10).map((event, i) => (
                                <motion.div
                                    key={event.transactionHash + i}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-data text-micro opacity-60">
                                            {formatAddress(event.from)}
                                        </span>
                                        <span className="text-stable">→</span>
                                        <span className="font-data text-micro">
                                            {formatAddress(event.to)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-data text-micro opacity-40">
                                            {getTimeAgo(event.timestamp)}
                                        </span>
                                        <a
                                            href={`https://sepolia.arbiscan.io/tx/${event.transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-stable hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
