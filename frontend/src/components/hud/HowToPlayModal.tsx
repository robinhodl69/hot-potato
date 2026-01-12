import { motion, AnimatePresence } from 'framer-motion';
import { X, Hand, Timer, Activity, ArrowRight } from 'lucide-react';
import { useGameState } from '../../AppRouter';

interface HowToPlayModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
    const { isMelting } = useGameState();

    const steps = [
        {
            icon: Hand,
            title: "1. SEIZE CONTROL",
            desc: "When the Core is stable (blue) or cooling down, GRAB it to become the Active Operator."
        },
        {
            icon: Timer,
            title: "2. ACCUMULATE YIELD",
            desc: "Every block you hold the Core generates POINTS. The longer you hold, the more you earn."
        },
        {
            icon: Activity,
            title: "3. MONITOR ENTROPY",
            desc: "Holding the Core increases its TEMPERATURE. If it reaches 100% Stability Loss, it MELTS DOWN."
        },
        {
            icon: ArrowRight,
            title: "4. EJECT OR BURN",
            desc: "PASS the Core to another address before meltdown to bank your points. If it melts on you, you lose everything."
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={`
                            relative z-10 w-[95%] max-w-md max-h-[85vh] flex flex-col border-2 shadow-2xl overflow-hidden rounded-lg my-auto
                            ${isMelting ? 'border-meltdown/50 shadow-[0_0_30px_rgba(255,62,0,0.2)]' : 'border-stable/50 shadow-[0_0_30px_rgba(0,255,255,0.2)]'}
                        `}
                        style={{ backgroundColor: '#09090b', margin: 'auto' }}
                    >
                        {/* Header */}
                        <div className={`
                            flex-shrink-0 flex items-center justify-between p-4 border-b
                            ${isMelting ? 'bg-meltdown/10 border-meltdown/30' : 'bg-stable/10 border-stable/30'}
                        `}>
                            <h2
                                className="font-heading text-lg font-bold tracking-widest"
                                style={{ color: isMelting ? '#FF3E00' : '#00FFFF' }}
                            >
                                MISSION BRIEFING
                            </h2>
                            <button
                                onClick={onClose}
                                className={`p-1 rounded hover:bg-white/10 transition-colors ${isMelting ? 'text-meltdown' : 'text-stable'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {steps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded bg-white/5 border border-white/10 h-fit ${isMelting ? 'text-meltdown' : 'text-stable'}`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3
                                            className="font-heading font-bold text-sm mb-1"
                                            style={{ color: isMelting ? '#FF3E00' : '#00FFFF' }}
                                        >
                                            {step.title}
                                        </h3>
                                        <p className="font-mono text-xs text-white/60 leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer - Fixed */}
                        <div className="flex-shrink-0 p-4 bg-white/5 border-t border-white/10 text-center">
                            <button
                                onClick={onClose}
                                className={`
                                    w-full py-3 font-heading font-bold uppercase tracking-widest text-sm transition-all
                                    ${isMelting
                                        ? 'bg-meltdown text-black hover:bg-meltdown/80'
                                        : 'bg-stable text-black hover:bg-stable/80'
                                    }
                                `}
                            >
                                ACKNOWLEDGE
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
