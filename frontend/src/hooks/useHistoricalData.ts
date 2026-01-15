import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';

const CONTRACT_ADDRESS = '0xd499da7647edf49770b01130baa1c9bd73e6083a';
const DEPLOY_BLOCK = 0n; // Should be actual deploy block to save RPC calls, using 0 for safety

export interface LeaderboardEntry {
    rank: number;
    address: string;
    points: number; // For now, points = number of times they GRABBED the core
    isActive: boolean;
    lastActiveLines: number; // Timestamp of last action
}

export function useHistoricalData(currentHolder: string | undefined) {
    const publicClient = usePublicClient();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userStats, setUserStats] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        if (!publicClient) return;

        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const currentBlock = await publicClient.getBlockNumber();
                const fromBlock = currentBlock - 50000n > 0n ? currentBlock - 50000n : 0n; // Limit to last 50k blocks for MVP speed

                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'),
                    fromBlock: fromBlock,
                    toBlock: 'latest'
                });

                setScanProgress(100);

                // Process logs to build leaderboard
                // Logic: Count incoming transfers? Or just count who HELD it?
                // The Transfer event in this contract is usually emitted when ownership changes.
                // So 'to' address = new owner.

                const stats: Record<string, number> = {};
                const lastSeen: Record<string, number> = {};

                for (const log of logs) {
                    const to = (log as any).args.to;
                    if (to && to !== '0x0000000000000000000000000000000000000000') {
                        stats[to] = (stats[to] || 0) + 1;
                        // Use block number as proxy for time if timestamp unavailable in log without fetching block
                        lastSeen[to] = Number(log.blockNumber);
                    }
                }

                setUserStats(stats);

                const sortedEntries = Object.entries(stats)
                    .map(([addr, count]) => ({
                        address: addr,
                        points: count * 100, // Arbitrary multiplier for "score"
                        isActive: addr.toLowerCase() === currentHolder?.toLowerCase(),
                        lastActiveLines: lastSeen[addr] || 0
                    }))
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 10) // Top 10
                    .map((entry, index) => ({
                        ...entry,
                        rank: index + 1
                    }));

                setLeaderboard(sortedEntries);
            } catch (error) {
                console.error("Failed to fetch historical logs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [publicClient, currentHolder]);

    return { leaderboard, userStats, isLoading, scanProgress };
}

export type UserStats = Record<string, number>;
