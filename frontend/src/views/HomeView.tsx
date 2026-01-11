/**
 * HomeView - Game Entry Experience
 * THE ARBITRUM CORE - THERMAL TRANSFER CHALLENGE
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import CoreVisual from '../components/core/CoreVisual';
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

            {/* Boot Sequence Overlay */}
            <AnimatePresence>
                {bootPhase === 0 && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-20 bg-[#050505] flex items-center justify-center p-8"
                    >
                        <pre className="text-[11px] text-cyan-400 whitespace-pre-wrap leading-relaxed max-w-sm text-center" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                            {typedText}
                            <span className="animate-pulse">█</span>
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
                        className="text-center mt-4 mb-8"
                    >
                        <h1
                            className={`text-4xl md:text-5xl tracking-[0.5em] mb-3 ${isMelting ? 'text-orange-400' : 'text-cyan-400'
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
                        className="flex-1 flex items-center justify-center relative w-full"
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
                        className="w-full max-w-md space-y-4 relative z-50 pb-4"
                        style={{
                            background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 100%)',
                            paddingTop: '32px',
                            marginTop: '-16px',
                        }}
                    >
                        {/* Match Data Panel */}
                        <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} px-6 py-4`}>
                            <div className="flex items-center justify-between" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                                <div className="text-center flex-1">
                                    <span className="block text-[10px] opacity-40 uppercase tracking-widest mb-1">Active Operator</span>
                                    <span className={`text-sm font-bold ${isMelting ? 'text-orange-400' : 'text-cyan-400'}`}>
                                        {currentHolder ? `${currentHolder.slice(0, 6)}...${currentHolder.slice(-4)}` : 'NONE'}
                                    </span>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center flex-1">
                                    <span className="block text-[10px] opacity-40 uppercase tracking-widest mb-1">Thermal Stability</span>
                                    <span className={`text-sm font-bold ${isMelting ? 'text-orange-400' : 'text-cyan-400'}`}>
                                        {(100 - Math.min(heat, 1) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartChallenge}
                            className={`group relative w-full py-5 font-bold uppercase text-sm overflow-hidden border-2 ${isMelting
                                ? 'bg-orange-500 text-black border-orange-300 hover:bg-orange-400'
                                : 'bg-cyan-400 text-black border-cyan-200 hover:bg-white'
                                }`}
                            style={{
                                fontFamily: "'Orbitron', sans-serif",
                                letterSpacing: '0.2em',
                                boxShadow: isMelting
                                    ? '0 0 30px rgba(255, 62, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                                    : '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                START CHALLENGE
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>

                            {/* Scanline overlay */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                                }}
                            />
                        </motion.button>

                        {/* Footer Label */}
                        <p
                            className="text-center text-[9px] opacity-20 uppercase tracking-[0.6em]"
                            style={{ fontFamily: "'Rajdhani', sans-serif" }}
                        >
                            HOLD • EARN • TRANSFER
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
