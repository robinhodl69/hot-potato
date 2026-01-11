/**
 * AppRouter - Main routing configuration
 * Routes: HOME, CORE, INTEL, HANGAR, LOGS, TECH
 * Includes global game state context and meltdown theme switching
 */
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { createContext, useContext } from 'react';
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

const CONTRACT_ADDRESS = "0x963d9779eb0de38878a8763f9e840e3622cfba7e";
const SAFE_LIMIT_BLOCKS = 900;

// Global game state context
interface GameStateContextType {
    heat: number;
    isMelting: boolean;
    currentHolder: string | undefined;
    previousHolder: string | undefined;
    blockNumber: bigint | undefined;
}

const GameStateContext = createContext<GameStateContextType>({
    heat: 0,
    isMelting: false,
    currentHolder: undefined,
    previousHolder: undefined,
    blockNumber: undefined,
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

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 p-3">
            <div className="max-w-lg mx-auto">
                <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} flex justify-around py-2 px-1`}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavClick}
                                className={`flex flex-col items-center gap-1 px-2 py-2 rounded transition-all ${isActive
                                    ? isMelting
                                        ? 'text-orange-400 bg-orange-500/10'
                                        : 'text-cyan-400 bg-cyan-500/10'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="font-mono text-[8px] uppercase tracking-wider font-bold">
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

    const { data: gameState } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        functionName: 'gameState',
        query: { refetchInterval: 3000 }
    }) as { data: [string, string, bigint, boolean] | undefined };

    // Derived state
    const currentHolder = gameState?.[0];
    const previousHolder = gameState?.[1];
    const lastTransferBlock = gameState?.[2] || 0n;
    const isMelting = gameState?.[3] || false;
    const blocksHeld = blockNumber ? Number(blockNumber - lastTransferBlock) : 0;
    const heat = blocksHeld / SAFE_LIMIT_BLOCKS;

    const gameStateValue: GameStateContextType = {
        heat,
        isMelting,
        currentHolder,
        previousHolder,
        blockNumber,
    };

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <GameStateContext.Provider value={gameStateValue}>
            <div className={`h-screen w-screen overflow-hidden ${isMelting ? 'state-meltdown' : 'state-stable'}`}>
                <Starfield isMelting={isMelting} />

                <div className={`relative z-20 h-full ${isHomePage ? '' : 'pb-20'}`}>
                    <Routes>
                        <Route path="/" element={<HomeView />} />
                        <Route path="/core" element={<GameView />} />
                        <Route path="/pulse" element={<AnalyticsView />} />
                        <Route path="/vault" element={<VaultView />} />
                        <Route path="/logs" element={<SystemLogsView />} />
                        <Route path="/terminal" element={<TechTerminalView />} />
                    </Routes>
                </div>

                <NavBar />
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
