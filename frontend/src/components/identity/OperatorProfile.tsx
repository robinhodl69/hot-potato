import { Share2, Target, ExternalLink } from 'lucide-react';
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

    // Share Intent Logic
    const handleShare = () => {
        const text = `⚡ I just passed The Arbitrum Core to ${address}! The network stability is holding.\n\nCheck the status in the Mini-App!`;
        const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;

        // Attempt to open via SDK first, fallback to window.open
        try {
            sdk.actions.openUrl(url);
        } catch {
            window.open(url, '_blank');
        }
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
                    <button
                        onClick={handleShare}
                        className="btn btn-primary w-full shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center gap-2 group"
                    >
                        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        ANNOUNCE TRANSFER
                    </button>
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
