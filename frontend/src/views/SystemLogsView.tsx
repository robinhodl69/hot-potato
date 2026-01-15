/**
 * SystemLogsView - SYSTEM_LOGS
 * On-chain transparency and event monitoring
 * 
 * Components:
 * - EventFeed: Real-time Transfer events
 * - StabilityAlerts: Critical threshold logs
 * - TransactionHashLink: Arbiscan links
 */
import { useEffect, useState } from 'react';
import { useWatchContractEvent, useBlockNumber, usePublicClient } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AlertCircle, ExternalLink, Zap, Clock } from 'lucide-react';

import { useGameState } from '../AppRouter';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';

const CONTRACT_ADDRESS = '0xd499da7647edf49770b01130baa1c9bd73e6083a';

interface LogEntry {
    type: 'transfer' | 'alert' | 'system';
    message: string;
    from?: string;
    to?: string;
    txHash?: string;
    blockNumber: bigint;
    timestamp: number;
}

export default function SystemLogsView() {
    const { heat, isMelting } = useGameState();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const publicClient = usePublicClient();

    // Fetch historical logs on mount
    useEffect(() => {
        const fetchHistory = async () => {
            if (!publicClient) return;
            try {
                const currentBlock = await publicClient.getBlockNumber();
                console.log('[DEBUG] Fetching logs from block:', Number(currentBlock) - 50000);

                const pastLogs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    event: {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [
                            { type: 'address', name: 'from', indexed: true },
                            { type: 'address', name: 'to', indexed: true },
                            { type: 'uint256', name: 'tokenId', indexed: true },
                        ],
                    },
                    fromBlock: currentBlock > 50000n ? currentBlock - 50000n : 0n,
                });

                console.log('[DEBUG] Historical logs found:', pastLogs.length);

                const formattedLogs: LogEntry[] = pastLogs.map(log => ({
                    type: 'transfer' as const,
                    message: `Core transferred`,
                    from: log.args.from as string,
                    to: log.args.to as string,
                    txHash: log.transactionHash as string || undefined,
                    blockNumber: log.blockNumber || 0n,
                    timestamp: Date.now() - Number(currentBlock - (log.blockNumber || 0n)) * 2000, // Approx timestamp
                })).reverse();

                setLogs(prev => {
                    const combined = [...prev, ...formattedLogs];
                    // Uniquify by txHash
                    const seen = new Set<string>();
                    return combined.filter(l => {
                        if (!l.txHash) return true;
                        if (seen.has(l.txHash)) return false;
                        seen.add(l.txHash);
                        return true;
                    }).sort((a, b) => Number(b.blockNumber - a.blockNumber)).slice(0, 50);
                });
            } catch (err) {
                console.error('Failed to fetch historical logs:', err);
            }
        };
        fetchHistory();
    }, [publicClient]);

    // Watch Transfer events
    useWatchContractEvent({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        eventName: 'Transfer',
        onLogs(eventLogs) {
            const newLogs: LogEntry[] = eventLogs.map(log => ({
                type: 'transfer' as const,
                message: `Core transferred`,
                from: (log as any).args?.from as string,
                to: (log as any).args?.to as string,
                txHash: log.transactionHash as string || undefined,
                blockNumber: log.blockNumber || 0n,
                timestamp: Date.now(),
            }));

            setLogs(prev => {
                const combined = [...newLogs, ...prev];
                const seen = new Set<string>();
                return combined.filter(l => {
                    if (!l.txHash) return true;
                    if (seen.has(l.txHash)) return false;
                    seen.add(l.txHash);
                    return true;
                }).slice(0, 50);
            });
        },
    });

    // Generate stability alerts based on heat
    // Clamp stability at 0
    const stabilityPercent = Math.max(0, (1 - heat) * 100);
    const alerts = heat >= 0.8 ? [
        { level: 'CRITICAL', message: `Stability at ${stabilityPercent.toFixed(0)}% - MELTDOWN IMMINENT` },
    ] : heat >= 0.5 ? [
        { level: 'WARNING', message: `Stability below 50% - Monitor closely` },
    ] : [];

    const formatAddress = (addr: string) => {
        if (!addr) return '0x0';
        return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="h-full flex flex-col p-4 bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Terminal className={`w-5 h-5 ${isMelting ? 'text-meltdown' : 'text-stable'}`} />
                    <h1 className="font-heading text-lg font-bold uppercase tracking-wider">SYSTEM LOGS</h1>
                </div>
                <div className="flex items-center gap-2 text-micro opacity-40">
                    <Clock className="w-3 h-3" />
                    BLOCK #{blockNumber?.toString() || '...'}
                </div>
            </div>

            {/* Stability Alerts */}
            <AnimatePresence>
                {alerts.map((alert, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`glass-panel glass-panel-meltdown p-3 mb-3 flex items-center gap-3`}
                    >
                        <AlertCircle className="w-5 h-5 text-meltdown animate-pulse" />
                        <div>
                            <div className="text-micro text-meltdown font-bold">{alert.level}</div>
                            <div className="font-data text-xs">{alert.message}</div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Event Feed */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} flex-1 overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-stable" />
                        <span className="font-heading text-xs uppercase tracking-widest">EVENT STREAM</span>
                    </div>
                    <span className="text-micro opacity-40">{logs.length} events</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
                    <AnimatePresence>
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <Terminal className="w-8 h-8 mb-2" />
                                <div className="text-micro">Watching for events...</div>
                                <div className="text-micro opacity-50 mt-1">
                                    Contract: {CONTRACT_ADDRESS.slice(0, 10)}...
                                </div>
                            </div>
                        ) : (
                            logs.map((log, i) => (
                                <motion.div
                                    key={log.txHash || i}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-2 border-b border-white/5 last:border-0"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-stable">[{formatTime(log.timestamp)}]</span>
                                                <span className={`${log.type === 'transfer' ? 'text-stable' : 'text-meltdown'}`}>
                                                    TRANSFER
                                                </span>
                                            </div>
                                            <div className="opacity-70">
                                                <span className="opacity-50">from:</span> {formatAddress(log.from || '')}
                                                <span className="mx-2 text-stable">→</span>
                                                <span className="opacity-50">to:</span> {formatAddress(log.to || '')}
                                            </div>
                                        </div>
                                        {log.txHash && (
                                            <a
                                                href={`https://sepolia.arbiscan.io/tx/${log.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-stable hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="text-micro opacity-30 mt-1">
                                        Block #{log.blockNumber.toString()}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Contract Info Footer */}
            <div className="mt-3 flex items-center justify-between text-micro opacity-40">
                <span>Arbitrum Sepolia</span>
                <a
                    href={`https://sepolia.arbiscan.io/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-stable transition-colors"
                >
                    View Contract <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
