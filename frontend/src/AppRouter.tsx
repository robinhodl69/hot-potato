/**
 * AppRouter - Main routing configuration
 * Routes: HOME, CORE, INTEL, HANGAR, LOGS, TECH
 * Includes global game state context and meltdown theme switching
 */
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { createContext, useContext, useState, useEffect } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';
import { Home, Zap, Activity, Wallet, Terminal, Cpu } from 'lucide-react';

import HomeView from './views/HomeView';
import GameView from './views/GameView';
import AnalyticsView from './views/AnalyticsView';
import VaultView from './views/VaultView';
import SystemLogsView from './views/SystemLogsView';
import TechTerminalView from './views/TechTerminalView';
import Starfield from './components/effects/Starfield';
import { useSynth } from './hooks/useSynth';
import TheArbitrumCoreAbi from './abi/TheArbitrumCore.json';
import NetworkGuard from './components/auth/NetworkGuard';

const CONTRACT_ADDRESS = '0xd499da7647edf49770b01130baa1c9bd73e6083a';
const SAFE_LIMIT_BLOCKS = 7200;

// Global game state context
interface GameStateContextType {
    heat: number;
    isMelting: boolean;
    currentHolder: string | undefined;
    previousHolder: string | undefined;
    blockNumber: bigint | undefined;
    activeCoreId: bigint | undefined;
    canSpawn: boolean;
    lastTransferBlock: bigint | undefined;
    lastTransferTimestamp: number | undefined;  // Unix timestamp from Transfer event
}

const GameStateContext = createContext<GameStateContextType>({
    heat: 0,
    isMelting: false,
    currentHolder: undefined,
    previousHolder: undefined,
    blockNumber: undefined,
    activeCoreId: undefined,
    canSpawn: false,
    lastTransferBlock: undefined,
    lastTransferTimestamp: undefined,
});

export const useGameState = () => useContext(GameStateContext);

function NavBar() {
    const location = useLocation();
    const { isMelting } = useGameState();
    const { play } = useSynth();

    // Don't show navbar on home page
    if (location.pathname === '/') return null;

    const navItems = [
        { path: '/', label: 'HOME', icon: Home },
        { path: '/core', label: 'CORE', icon: Zap },
        { path: '/pulse', label: 'INTEL', icon: Activity },
        { path: '/vault', label: 'HANGAR', icon: Wallet },
        { path: '/logs', label: 'LOGS', icon: Terminal },
        { path: '/terminal', label: 'TECH', icon: Cpu },
    ];

    const handleNavClick = () => {
        play('click');
    };

    const accentColor = isMelting ? 'rgb(255, 100, 50)' : 'rgb(0, 255, 255)';

    return (
        <nav
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                padding: '0.5rem',
                paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))'
            }}
        >
            <div className="max-w-lg mx-auto">
                {/* Navbar Container with enhanced styling */}
                <div
                    className="relative flex justify-around items-center py-3 px-2"
                    style={{
                        background: 'rgba(5, 5, 5, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${isMelting ? 'rgba(255, 100, 50, 0.3)' : 'rgba(0, 255, 255, 0.25)'}`,
                        borderRadius: '4px',
                        boxShadow: isMelting
                            ? '0 0 30px rgba(255, 50, 0, 0.2), inset 0 0 20px rgba(255, 50, 0, 0.05)'
                            : '0 0 30px rgba(0, 255, 255, 0.15), inset 0 0 20px rgba(0, 255, 255, 0.03)',
                    }}
                >
                    {/* Corner Accents */}
                    <div
                        className="absolute -top-px -left-px w-4 h-4 border-l-2 border-t-2"
                        style={{ borderColor: accentColor, opacity: 0.7 }}
                    />
                    <div
                        className="absolute -top-px -right-px w-4 h-4 border-r-2 border-t-2"
                        style={{ borderColor: accentColor, opacity: 0.7 }}
                    />
                    <div
                        className="absolute -bottom-px -left-px w-4 h-4 border-l-2 border-b-2"
                        style={{ borderColor: accentColor, opacity: 0.7 }}
                    />
                    <div
                        className="absolute -bottom-px -right-px w-4 h-4 border-r-2 border-b-2"
                        style={{ borderColor: accentColor, opacity: 0.7 }}
                    />

                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavClick}
                                className="relative flex flex-col items-center gap-1 px-3 py-2 rounded transition-all"
                                style={{
                                    color: isActive
                                        ? (isMelting ? '#ff6432' : '#00ffff')
                                        : 'rgba(255, 255, 255, 0.5)',
                                    background: isActive
                                        ? (isMelting ? 'rgba(255, 100, 50, 0.15)' : 'rgba(0, 255, 255, 0.1)')
                                        : 'transparent',
                                    boxShadow: isActive
                                        ? (isMelting ? '0 0 15px rgba(255, 100, 50, 0.3)' : '0 0 15px rgba(0, 255, 255, 0.25)')
                                        : 'none',
                                }}
                            >
                                {/* Active indicator line */}
                                {isActive && (
                                    <div
                                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5"
                                        style={{
                                            background: isMelting ? '#ff6432' : '#00ffff',
                                            boxShadow: isMelting
                                                ? '0 0 8px rgba(255, 100, 50, 0.8)'
                                                : '0 0 8px rgba(0, 255, 255, 0.8)',
                                        }}
                                    />
                                )}
                                <Icon className="w-5 h-5" />
                                <span
                                    className="uppercase tracking-wider font-bold"
                                    style={{
                                        fontFamily: "'Orbitron', sans-serif",
                                        fontSize: '9px',
                                    }}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

function AppContent() {
    // Global contract state
    const { data: blockNumber } = useBlockNumber({ watch: true });

    // LocalStorage key for persisting transfer timestamp
    const STORAGE_KEY = 'arbitrum_core_last_transfer';

    // State for last transfer timestamp (persisted in localStorage)
    const [lastTransferTimestamp, setLastTransferTimestamp] = useState<number | undefined>(() => {
        // Initialize from localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return data.timestamp;
            }
        }
        return undefined;
    });

    // Track the last known transfer block to detect changes
    const [lastKnownBlock, setLastKnownBlock] = useState<bigint | undefined>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return BigInt(data.block);
            }
        }
        return undefined;
    });

    // Phoenix Model: game_state now returns 5 values
    const { data: gameState } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        functionName: 'gameState',
        query: { refetchInterval: 3000 }
    }) as { data: [string, string, bigint, boolean, bigint] | undefined };

    // Phoenix Model: Check if new core can be spawned
    const { data: canSpawnData } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        functionName: 'canSpawnNewCore',
        query: { refetchInterval: 3000 }
    }) as { data: boolean | undefined };

    // Update localStorage when lastTransferBlock changes
    useEffect(() => {
        const currentBlock = gameState?.[2];
        if (currentBlock && currentBlock > 0n) {
            // Check if this is a new block (transfer happened)
            if (!lastKnownBlock || currentBlock !== lastKnownBlock) {
                const now = Math.floor(Date.now() / 1000);
                setLastTransferTimestamp(now);
                setLastKnownBlock(currentBlock);

                // Persist to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    block: currentBlock.toString(),
                    timestamp: now
                }));
                console.log('Timer synced: new transfer detected at', new Date(now * 1000).toISOString());
            }
        }
    }, [gameState?.[2], lastKnownBlock]);

    // TRUST THE CONTRACT for isMelting
    const isMelting = gameState?.[3] === true;
    const canSpawn = canSpawnData === true;

    // Only calculate heat for UI visualization if NOT melting
    // If melting, set heat to 1+ (danger state)
    const heat = isMelting ? 1.0 : 0;

    const currentHolder = gameState?.[0];
    const previousHolder = gameState?.[1];
    const activeCoreId = gameState?.[4];

    const gameStateValue: GameStateContextType = {
        heat,
        isMelting,
        currentHolder,
        previousHolder,
        blockNumber,
        activeCoreId,
        canSpawn,
        lastTransferBlock: gameState?.[2],
        lastTransferTimestamp,
    };

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <GameStateContext.Provider value={gameStateValue}>
            <div className={`h-screen w-screen overflow-hidden ${isMelting ? 'state-meltdown' : 'state-stable'}`}>
                <Starfield isMelting={isMelting} />

                <NetworkGuard>
                    <div className={`relative z-20 h-full ${isHomePage ? '' : 'pb-20'}`} style={{ paddingLeft: isHomePage ? 0 : '1rem', paddingRight: isHomePage ? 0 : '1rem' }}>
                        <Routes>
                            <Route path="/" element={<HomeView />} />
                            <Route path="/game" element={<GameView />} />
                            <Route path="/core" element={<GameView />} />
                            <Route path="/pulse" element={<AnalyticsView />} />
                            <Route path="/vault" element={<VaultView />} />
                            <Route path="/logs" element={<SystemLogsView />} />
                            <Route path="/terminal" element={<TechTerminalView />} />
                        </Routes>
                    </div>

                    <NavBar />
                </NetworkGuard>
            </div>
        </GameStateContext.Provider>
    );
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
