/**
 * HomeView - Game Entry Experience
 * THE ARBITRUM CORE - THERMAL TRANSFER CHALLENGE
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, HelpCircle, Wallet, CheckCircle2 } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';

import CoreVisual from '../components/core/CoreVisual';
import GameStatusPanel from '../components/hud/GameStatusPanel';
import HowToPlayModal from '../components/hud/HowToPlayModal';
import { useGameState } from '../AppRouter';
import { useSynth } from '../hooks/useSynth';
import { sdk } from '@farcaster/miniapp-sdk';

const BOOT_SEQUENCE = [
    '> INITIALIZING CORE SYSTEMS...',
    '> SCANNING OPERATOR STATUS...',
    '> LOADING MATCH DATA...',
    '> THERMAL CALIBRATION COMPLETE.',
    '> READY.',
];

export default function HomeView() {
    const navigate = useNavigate();
    const { isConnected, address } = useAccount();
    const { connect, connectors } = useConnect();
    const { heat, isMelting } = useGameState();
    const { play } = useSynth();

    // Farcaster SDK init & Context
    useEffect(() => {
        const initSdk = async () => {
            try {
                // sdk.actions.ready() is already called in main.tsx, but no harm in ensuring context here
                const context = await sdk.context;
                if (context?.user) {
                    setFarcasterUser({
                        username: context.user.username,
                        pfpUrl: context.user.pfpUrl
                    });
                }
            } catch (err) {
                console.warn('Farcaster context failed:', err);
            }
        };
        initSdk();
    }, []);

    const [farcasterUser, setFarcasterUser] = useState<{ username?: string, pfpUrl?: string } | null>(null);
    const [bootPhase, setBootPhase] = useState(0);
    const [showContent, setShowContent] = useState(false);
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [currentLine, setCurrentLine] = useState(0);

    // System boot sequence
    useEffect(() => {
        if (currentLine >= BOOT_SEQUENCE.length) {
            setTimeout(() => {
                setBootPhase(1);
                setTimeout(() => setShowContent(true), 500);
            }, 500);
            return;
        }

        const line = BOOT_SEQUENCE[currentLine];
        let charIndex = 0;

        const typeInterval = setInterval(() => {
            if (charIndex <= line.length) {
                setTypedText(BOOT_SEQUENCE.slice(0, currentLine).join('\n') + '\n' + line.slice(0, charIndex));
                charIndex++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    setCurrentLine(prev => prev + 1);
                }, 150);
            }
        }, 20);

        return () => clearInterval(typeInterval);
    }, [currentLine]);

    // Play ambient sound
    useEffect(() => {
        const droneTimer = setTimeout(() => {
            play('sonar', { intensity: 0.1 });
        }, 1500);
        return () => clearTimeout(droneTimer);
    }, [play]);

    const handleConnect = () => {
        play('click');
        if (connectors?.[0]) {
            connect({ connector: connectors[0] });
        }
    };

    const formatAddress = (addr: string | undefined) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className="h-full flex flex-col justify-between items-center py-8 px-6 relative bg-transparent overflow-hidden">

            {/* Vignette Overlay */}
            <div className="vignette-overlay" />

            {/* Boot Sequence Overlay */}
            <AnimatePresence>
                {bootPhase === 0 && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-8 text-center"
                    >
                        <pre className="text-sm text-red-500 font-bold whitespace-pre-wrap leading-relaxed tracking-widest uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {typedText}
                            <span className="animate-pulse text-red-500">█</span>
                        </pre>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER GROUP */}
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-center mt-4 mb-8 animate-float-medium"
                    >
                        <h1
                            className={`text-4xl md:text-5xl tracking-[0.5em] mb-3 glitch-hover cursor-default ${isMelting ? 'text-orange-400' : 'text-cyan-400'
                                }`}
                            style={{
                                fontFamily: "'Orbitron', sans-serif",
                                fontWeight: 900,
                                textShadow: isMelting
                                    ? '0 0 30px rgba(255, 62, 0, 0.6), 0 0 60px rgba(255, 62, 0, 0.3)'
                                    : '0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.2)',
                            }}
                        >
                            THE CORE
                        </h1>
                        <p
                            className="text-sm tracking-[0.4em] text-white/50 uppercase"
                            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
                        >
                            THERMAL TRANSFER CHALLENGE
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CENTER - CORE VISUAL */}
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                        className="flex-1 flex items-center justify-center relative w-full animate-float-slow"
                        style={{ minHeight: '250px' }}
                    >
                        {/* Radial Glow Behind Core */}
                        <div
                            className="absolute"
                            style={{
                                width: '600px',
                                height: '600px',
                                background: isMelting
                                    ? 'radial-gradient(circle, rgba(255, 50, 0, 0.35) 0%, transparent 50%)'
                                    : 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 50%)',
                                filter: 'blur(50px)',
                                zIndex: -1,
                            }}
                        />
                        <div className="w-64 h-64 md:w-80 md:h-80">
                            <CoreVisual heat={0.9} /> {/* Force meltdown red for Home */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD FOOTER */}
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="w-full max-w-md space-y-4 relative z-50 pb-4 animate-float-fast"
                        style={{
                            background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 100%)',
                            paddingTop: '32px',
                            marginTop: '-16px',
                        }}
                    >
                        {/* Match Data Panel */}
                        <GameStatusPanel />

                        {/* CTA Button - WALLET CONNECTION ONLY */}
                        {!isConnected ? (
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleConnect}
                                className={`group relative w-full py-5 font-black uppercase text-sm overflow-hidden border-2 transition-all duration-300 bg-white border-white text-black`}
                                style={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    letterSpacing: '0.2em',
                                }}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Wallet className="w-5 h-5" />
                                    CONNECT WALLET
                                </span>
                            </motion.button>
                        ) : (
                            <div className="space-y-3">
                                <div className="w-full py-4 border-2 border-stable/30 bg-stable/10 rounded flex items-center justify-center gap-3 text-stable font-bold tracking-widest text-xs uppercase overflow-hidden px-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                                    {farcasterUser?.pfpUrl ? (
                                        <div className="flex-shrink-0 w-6 h-6 min-w-[24px] min-h-[24px] rounded-full border border-stable/50 overflow-hidden relative">
                                            <img
                                                src={farcasterUser.pfpUrl}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </div>
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    )}
                                    <span className="truncate">OPERATOR: {farcasterUser?.username ? `@${farcasterUser.username}` : formatAddress(address)}</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 255, 255, 0.6)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        play('click');
                                        navigate('/game');
                                    }}
                                    className="w-full py-5 font-black uppercase text-sm overflow-hidden border-2 transition-all duration-300 bg-cyan-500 border-cyan-400 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)] relative group"
                                    style={{
                                        fontFamily: "'Orbitron', sans-serif",
                                        letterSpacing: '0.2em',
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        START CHALLENGE <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </motion.button>
                            </div>
                        )}

                        {/* HOW TO PLAY TRIGGER */}
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 255, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                play('click');
                                setIsHowToPlayOpen(true);
                            }}
                            className="w-full py-3 flex items-center justify-center gap-2 border border-cyan-500/30 rounded bg-cyan-500/5 text-cyan-400 font-bold text-xs uppercase tracking-widest transition-all"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                        >
                            <HelpCircle className="w-4 h-4" />
                            MISSION BRIEFING
                        </motion.button>

                        {/* Footer Label */}
                        <p
                            className="text-center text-sm text-red-500 font-bold uppercase tracking-[0.2em] font-heading mt-4"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                        >
                            POWERED BY ARBITRUM STYLUS
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            <HowToPlayModal
                isOpen={isHowToPlayOpen}
                onClose={() => setIsHowToPlayOpen(false)}
            />
        </div>
    );
}
