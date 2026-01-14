/**
 * VaultView - USER_HANGAR
 * Personal player stats and wallet context
 * 
 * Components:
 * - PersonalScore: Total energy harvested
 * - WalletProfile: Farcaster FID linked to wallet
 * - SessionAchievements: Unlocked milestones
 */
import { useAccount, useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, Clock, TrendingUp, Award, User, Shield } from 'lucide-react';

import { useGameState } from '../AppRouter';
import { useHistoricalData } from '../hooks/useHistoricalData';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';

const CONTRACT_ADDRESS = "0xe0687d9830081bbd7696f4d8a3a8169aaa986039";

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_hold', name: 'First Contact', desc: 'Hold the Core for the first time', threshold: 1, icon: '🌟' },
    { id: 'centurion', name: 'Centurion', desc: 'Accumulate 100+ points', threshold: 100, icon: '⚡' },
    { id: 'survivor', name: 'Survivor', desc: 'Secure the Core 5+ times', threshold: 5, icon: '🛡️' },
    { id: 'whale', name: 'Whale', desc: 'Accumulate 1,000+ points', threshold: 1000, icon: '🐋' },
];

export default function VaultView() {
    const { address, isConnected } = useAccount();
    const { isMelting, currentHolder } = useGameState();

    // Get historical stats for achievements
    const { userStats } = useHistoricalData(currentHolder);
    const grabCount = address && userStats ? (userStats[address] || 0) : 0;

    // User points from contract
    const { data: userPoints } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        functionName: 'getPoints',
        args: [address],
        query: { enabled: !!address, refetchInterval: 5000 }
    }) as { data: bigint | undefined };

    const points = Number(userPoints || 0n);
    const isHolder = address?.toLowerCase() === currentHolder?.toLowerCase();

    // Calculate unlocked achievements
    const unlockedAchievements = ACHIEVEMENTS.filter(a => {
        if (a.id === 'first_hold') return points > 0;
        if (a.id === 'centurion') return points >= 100;
        if (a.id === 'survivor') return grabCount >= 5;
        if (a.id === 'whale') return points >= 1000;
        return false;
    });

    if (!isConnected) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-8 text-center max-w-sm`}>
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-stable opacity-50" />
                    <h2 className="font-heading text-lg font-bold mb-2">HANGAR LOCKED</h2>
                    <p className="font-data text-xs opacity-50">Connect wallet to access your hangar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <User className={`w-5 h-5 ${isMelting ? 'text-meltdown' : 'text-stable'}`} />
                    <h1 className="font-heading text-lg font-bold uppercase tracking-wider">USER HANGAR</h1>
                </div>
                {isHolder && (
                    <div className="flex items-center gap-1 text-stable text-micro">
                        <Shield className="w-3 h-3" />
                        HOLDING
                    </div>
                )}
            </div>

            {/* PersonalScore - Main Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-6`}
            >
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-stable" />
                    <span className="text-micro opacity-50 uppercase tracking-widest">TOTAL YIELD</span>
                </div>
                <motion.div
                    key={points}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className={`font-heading text-5xl font-bold ${isMelting ? 'text-meltdown neon-title-danger' : 'text-stable neon-title'}`}
                >
                    {points.toLocaleString()}
                </motion.div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-micro opacity-40">ENERGY POINTS</span>
                    <span className={`text-data text-sm ${isHolder ? 'text-stable' : 'opacity-50'}`}>
                        {isHolder ? '↑ ACCUMULATING' : 'IDLE'}
                    </span>
                </div>
            </motion.div>

            {/* WalletProfile */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-micro opacity-40 mb-1">OPERATOR ID</div>
                        <div className="font-data text-sm break-all opacity-80">
                            {address?.slice(0, 10)}...{address?.slice(-8)}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-stable/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-stable" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-stable" />
                        <span className="text-micro opacity-50">STATUS</span>
                    </div>
                    <div className={`font-heading text-lg font-bold ${isHolder ? 'text-stable' : 'opacity-60'}`}>
                        {isHolder ? 'ACTIVE' : 'STANDBY'}
                    </div>
                </div>

                <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-3 h-3 text-warning" />
                        <span className="text-micro opacity-50">BADGES</span>
                    </div>
                    <div className="font-heading text-lg font-bold">
                        {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </div>
                </div>
            </div>

            {/* SessionAchievements */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4 text-warning" />
                    <span className="font-heading text-xs uppercase tracking-widest font-bold">ACHIEVEMENTS</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {ACHIEVEMENTS.map((achievement) => {
                        const unlocked = unlockedAchievements.some(a => a.id === achievement.id);
                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`p-3 rounded border ${unlocked
                                    ? 'border-stable/30 bg-stable/5'
                                    : 'border-white/5 opacity-40'
                                    }`}
                            >
                                <div className="text-xl mb-1">{achievement.icon}</div>
                                <div className={`font-heading text-micro font-bold ${unlocked ? 'text-stable' : ''}`}>
                                    {achievement.name}
                                </div>
                                <div className="text-micro opacity-50">{achievement.desc}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
