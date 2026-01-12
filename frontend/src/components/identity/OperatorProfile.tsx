import { Share2, Target, ExternalLink, Twitter } from 'lucide-react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { sdk } from '@farcaster/miniapp-sdk';

interface OperatorProfileProps {
    address: string | undefined;
    isPreviousHolder: boolean;
    isMe: boolean;
    farcasterUser: { username?: string, pfpUrl?: string } | null;
}

export default function OperatorProfile({ address, isPreviousHolder, isMe, farcasterUser }: OperatorProfileProps) {
    const safeAddress = address || '0x0000000000000000000000000000000000000000';

    // Unified Share Logic
    const handleShareWarpcast = () => {
        const text = `⚡ I just passed The @arbitrum Core to ${address}! The network stability is holding.\n\nPlay here: https://hot-potato-frontend.vercel.app`;
        const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
        try { sdk.actions.openUrl(url); } catch { window.open(url, '_blank'); }
    };

    const handleShareTwitter = () => {
        const text = `⚡ I just passed The Arbitrum Core to ${address}! The network stability is holding. @arbitrum\n\nPlay here: https://hot-potato-frontend.vercel.app`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="glass-panel glass-panel-stable p-6 text-center space-y-6 relative overflow-hidden">
            {/* Background Glitch Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stable to-transparent opacity-50 animate-pulse" />

            {/* Header Status */}
            <div className="relative z-10">
                <div className="text-micro opacity-40 mb-2 tracking-[0.2em] uppercase">
                    {isPreviousHolder ? 'MISSION ACCOMPLISHED' : 'CURRENT OPERATOR'}
                </div>

                {isPreviousHolder && (
                    <div className="inline-block px-3 py-1 bg-meltdown/10 border border-meltdown/30 rounded text-meltdown text-[10px] font-bold animate-pulse mb-4">
                        ⚠ COOLDOWN ACTIVE: WAIT FOR RESET
                    </div>
                )}
            </div>

            {/* Avatar & Identity Halo */}
            <div className="relative flex justify-center py-2">
                {/* Rotating Rings */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-24 h-24 border border-stable rounded-full animate-spin-slow" style={{ borderStyle: 'dashed' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="w-32 h-32 border border-white rounded-full animate-reverse-spin" style={{ borderStyle: 'dotted' }} />
                </div>

                {/* Main Avatar */}
                <div className="relative z-10 p-1 bg-black rounded-full border-2 border-stable shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                    <Jazzicon diameter={60} seed={jsNumberForAddress(safeAddress)} />
                </div>
            </div>

            {/* Address Display */}
            <div>
                <div className="font-heading text-2xl font-bold text-white tracking-wider">
                    {formatAddress(safeAddress)}
                </div>
                <a
                    href={`https://arbiscan.io/address/${safeAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-stable/60 hover:text-stable mt-1 transition-colors"
                >
                    VIEW ON EXPLORER <ExternalLink className="w-2 h-2" />
                </a>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3 pt-2">
                {isPreviousHolder && (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleShareWarpcast}
                            className="py-3 bg-purple-600/20 border border-purple-500/50 rounded flex items-center justify-center gap-2 text-[10px] font-bold text-purple-400 hover:bg-purple-600/30 transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                        >
                            <Share2 className="w-4 h-4" />
                            WARPCAST
                        </button>
                        <button
                            onClick={handleShareTwitter}
                            className="py-3 bg-blue-400/10 border border-blue-400/30 rounded flex items-center justify-center gap-2 text-[10px] font-bold text-blue-400 hover:bg-blue-400/20 transition-all shadow-[0_0_10px_rgba(96,165,250,0.1)]"
                        >
                            <Twitter className="w-4 h-4" />
                            TWITTER / X
                        </button>
                    </div>
                )}

                <a
                    href="/pulse"
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold tracking-widest transition-all hover:border-stable/50 flex items-center justify-center gap-2"
                >
                    <Target className="w-3 h-3" />
                    TRACK SIGNAL INTEL
                </a>
            </div>
        </div>
    );
}
