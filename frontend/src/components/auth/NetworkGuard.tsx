import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from '../../viemChains';
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
    const { isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain, isPending } = useSwitchChain();

    // If not connected, we don't enforce network yet (handled by wallet connect)
    // If connected, ensure we are on Arbitrum Sepolia
    const isWrongNetwork = isConnected && chainId !== arbitrumSepolia.id;

    if (!isWrongNetwork) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ff3e00 2px, #ff3e00 4px)',
                }}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-md w-full mx-4 p-8 border-2 border-red-500/50 bg-black text-center shadow-[0_0_50px_rgba(255,62,0,0.2)]"
            >
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-red-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-red-500" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-red-500" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-red-500" />

                <WifiOff className="w-16 h-16 mx-auto mb-6 text-red-500 animate-pulse" />

                <h2 className="font-heading text-3xl font-bold text-red-500 mb-2 tracking-widest uppercase">
                    SIGNAL LOST
                </h2>

                <div className="font-mono text-sm text-red-400/80 mb-8 space-y-2">
                    <p>Subspace alignment failed.</p>
                    <p>Frequency mismatch detected.</p>
                </div>

                <div className="p-4 bg-red-900/10 border border-red-500/20 mb-8 font-mono text-xs text-red-300">
                    <div>REQUIRED: ARBITRUM SEPOLIA</div>
                    <div className="opacity-50 mt-1">ID: {arbitrumSepolia.id}</div>
                </div>

                <button
                    onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
                    disabled={isPending}
                    className="w-full py-4 bg-red-500 hover:bg-red-400 text-black font-bold font-heading uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            ALIGNING FREQUENCY...
                        </>
                    ) : (
                        'SWITCH NETWORK'
                    )}
                </button>
            </motion.div>
        </div>
    );
}
