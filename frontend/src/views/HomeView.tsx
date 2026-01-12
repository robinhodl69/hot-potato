/**
 * HomeView - Game Entry Experience
 * THE ARBITRUM CORE - THERMAL TRANSFER CHALLENGE
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import CoreVisual from '../components/core/CoreVisual';
import GameStatusPanel from '../components/hud/GameStatusPanel';
import { useGameState } from '../AppRouter';
import { useSynth } from '../hooks/useSynth';

const BOOT_SEQUENCE = [
    '> INITIALIZING CORE SYSTEMS...',
    '> SCANNING OPERATOR STATUS...',
    '> LOADING MATCH DATA...',
    '> THERMAL CALIBRATION COMPLETE.',
    '> READY.',
];

export default function HomeView() {
    const navigate = useNavigate();
    const { heat, isMelting, currentHolder } = useGameState();
    const { play } = useSynth();

    const [bootPhase, setBootPhase] = useState(0);
    const [showContent, setShowContent] = useState(false);
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

    const handleStartChallenge = () => {
        play('click');
        navigate('/core');
    };

    return (
        <div className="h-full flex flex-col justify-between items-center py-8 px-6 relative bg-transparent">

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

                        {/* CTA Button */}
                        {/* CTA Button (DISABLED FOR ANNOUNCEMENT PHASE) */}
                        <motion.button
                            className={`group relative w-full py-5 font-black uppercase text-sm overflow-hidden border-2 transition-all duration-300 shadow-none bg-white/10 border-white/20 text-white cursor-not-allowed`}
                            style={{
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.2em',
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                SYSTEM STANDBY // SOON
                            </span>
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
        </div>
    );
}
