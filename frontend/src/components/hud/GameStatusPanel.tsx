/**
 * GameStatusPanel - HUD component showing current game state
 * Displays Active Operator and Thermal Stability
 * Used in HomeView as entry point overview
 */
import { useGameState } from '../../AppRouter';

interface GameStatusPanelProps {
    className?: string;
}

export default function GameStatusPanel({ className = '' }: GameStatusPanelProps) {
    const { heat, isMelting, currentHolder } = useGameState();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const stabilityPercent = (100 - Math.min(heat, 1) * 100).toFixed(0);

    return (
        <div className={`game-status-panel ${isMelting ? 'game-status-panel-meltdown' : 'game-status-panel-stable'} ${className}`}>
            <div className="scanline-overlay" />
            <div className="game-status-content relative z-20">
                {/* Active Operator */}
                <div className="game-status-item">
                    <span className="block uppercase tracking-[0.2em] text-[10px] font-bold text-cyan-400/80 mb-1" style={{ textShadow: '0 0 2px rgba(34, 211, 238, 0.5)' }}>Active Operator</span>
                    <span className={`block font-mono text-2xl text-white neon-text-wh`}>
                        {currentHolder ? formatAddress(currentHolder) : 'NONE'}
                    </span>
                </div>

                {/* Divider */}
                <div className="game-status-divider" />

                {/* Thermal Stability */}
                <div className="game-status-item">
                    <span className="block uppercase tracking-[0.2em] text-[10px] font-bold text-cyan-400/80 mb-1" style={{ textShadow: '0 0 2px rgba(34, 211, 238, 0.5)' }}>Thermal Stability</span>
                    <span className={`block font-mono text-2xl text-white neon-text-wh`}>
                        {stabilityPercent}%
                    </span>
                </div>
            </div>
        </div>
    );
}
