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
/**
 * AnalyticsView - OPERATOR_INTEL
 * Social competition and anti-gaming verification
 */
import { useState } from 'react';
import { useAccount, useWatchContractEvent, useBlockNumber } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Trophy, Users, TrendingUp, Shield, ShieldOff, ExternalLink, AlertTriangle } from 'lucide-react';

import { useGameState } from '../AppRouter';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';
import PageLayout from '../components/layout/PageLayout';
import ViewHeader from '../components/layout/ViewHeader';
import HUDCard from '../components/ui/HUDCard';

const CONTRACT_ADDRESS = "0x963d9779eb0de38878a8763f9e840e3622cfba7e";

interface TransferEvent {
    from: string;
    to: string;
    blockNumber: bigint;
    transactionHash: string;
    timestamp: number;
}

import { useHistoricalData } from '../hooks/useHistoricalData';
import { useMeltdownMonitor } from '../hooks/useMeltdownMonitor';

// ... (existing imports)

export default function AnalyticsView() {
    const { address } = useAccount();
    const { heat, isMelting, currentHolder, previousHolder } = useGameState();
    const { data: blockNumber } = useBlockNumber({ watch: true });

    // Client-side Indexing Hook
    const { leaderboard, isLoading: isIndexing, scanProgress } = useHistoricalData(currentHolder);
    const { meltdownHistory } = useMeltdownMonitor();

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

    return (
        <PageLayout className="pt-10">
            <ViewHeader
                icon={Activity}
                title="OPERATOR INTEL"
                rightContent={blockNumber ? `BLOCK #${blockNumber}` : 'SYNCING...'}
            />

            {/* EligibilityBadge */}
            <HUDCard variant="highlight" className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border
                            ${isEligible
                                ? 'bg-stable/10 border-stable text-stable'
                                : 'bg-meltdown/10 border-meltdown text-meltdown'
                            }
                        `}>
                            {isEligible ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold">YOUR STATUS</div>
                            <div className={`font-heading text-lg font-bold ${isEligible ? 'text-stable neon-text-wh' : 'text-meltdown'}`}>
                                {!address ? 'NOT CONNECTED' : isEligible ? 'ELIGIBLE TO GRAB' : 'COOLDOWN ACTIVE'}
                            </div>
                        </div>
                    </div>
                </div>
            </HUDCard>

            {/* Global Stats */}
            <div className="grid grid-cols-2 gap-4">
                <HUDCard variant="stat">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest">ENTROPY</span>
                        </div>
                        <div className={`font-heading text-3xl font-bold ${isMelting ? 'text-meltdown' : 'text-stable'}`}>
                            {(heat * 100).toFixed(1)}%
                        </div>
                    </div>
                </HUDCard>

                <HUDCard variant="stat">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                            <Users className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest">TRANSFERS</span>
                        </div>
                        <div className="font-heading text-3xl font-bold text-white">
                            {transferEvents.length}
                        </div>
                    </div>
                </HUDCard>
            </div>

            {/* Leaderboard - Populated by Client-Side RPC Indexer */}
            <HUDCard title="LEADERBOARD" icon={Trophy}>
                <div className="space-y-1">
                    {isIndexing && leaderboard.length === 0 ? (
                        <div className="text-center py-6 opacity-30">
                            <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <div className="text-xs uppercase tracking-widest">Indexing History... {scanProgress}%</div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-6 opacity-30">
                            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <div className="text-xs uppercase tracking-widest">No Data Found</div>
                        </div>
                    ) : (
                        leaderboard.map((holder) => (
                            <motion.div
                                key={holder.address}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`
                                    grid grid-cols-[40px_1fr_auto] items-center gap-4 py-3 px-3 rounded
                                    border border-transparent hover:border-white/10 hover:bg-white/5 transition-colors
                                    ${holder.isActive ? 'bg-stable/5 border-stable/20' : ''}
                                `}
                            >
                                <span className={`font-heading text-sm font-bold text-center ${holder.rank === 1 ? 'text-warning' : 'opacity-40'}`}>
                                    #{holder.rank}
                                </span>

                                <span className="font-mono text-sm truncate">
                                    {formatAddress(holder.address)}
                                    {holder.isActive && <span className="ml-2 text-stable text-[9px] uppercase tracking-wider font-bold">● ACTIVE</span>}
                                </span>

                                <div className="font-heading text-sm font-bold text-stable text-right">
                                    {holder.points}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </HUDCard>

            {/* Meltdown History */}
            <HUDCard title="RECENT FAILURES" icon={AlertTriangle} variant="danger" className="mb-4">
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {meltdownHistory.length === 0 ? (
                        <div className="text-center py-4 opacity-40">
                            <Shield className="w-6 h-6 mx-auto mb-2 text-stable" />
                            <div className="text-[10px] uppercase tracking-widest text-stable">SYSTEM STABLE // NO INCIDENTS</div>
                        </div>
                    ) : (
                        meltdownHistory.map((event) => (
                            <div key={event.id} className="p-2 bg-meltdown/5 border border-meltdown/20 rounded text-xs flex justify-between items-center">
                                <div>
                                    <div className="text-meltdown font-bold uppercase tracking-wider mb-1">CORE BREACH</div>
                                    <div className="opacity-70 text-[10px]">
                                        FAILED BY: <span className="font-mono text-white">{formatAddress(event.defaulter)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] opacity-50 mb-1">{new Date(event.timestamp).toLocaleTimeString()}</div>
                                    <div className="text-[9px] text-stable uppercase">
                                        RESET BY: {formatAddress(event.hero)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </HUDCard>

            {/* Live Transfer Feed */}
            <HUDCard title="LIVE FEED" icon={Activity}>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {transferEvents.length === 0 ? (
                            <div className="text-center py-8 opacity-30">
                                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                                <div className="text-xs uppercase tracking-widest">Scanning network...</div>
                            </div>
                        ) : (
                            transferEvents.slice(0, 10).map((event, i) => (
                                <motion.div
                                    key={event.transactionHash + i}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-xs"
                                >
                                    <div className="flex items-center gap-2 font-mono">
                                        <span className="opacity-60">{formatAddress(event.from)}</span>
                                        <span className="text-stable">→</span>
                                        <span>{formatAddress(event.to)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="opacity-40">{getTimeAgo(event.timestamp)}</span>
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
            </HUDCard>
        </PageLayout>
    );
}
