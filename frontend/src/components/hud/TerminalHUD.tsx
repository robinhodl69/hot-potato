import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function GlassPanel({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-2xl ${className}`}
        >
            {children}
        </motion.div>
    );
}

export function MeltdownTimer({ blocksRemaining, isMelting }: { blocksRemaining: number, isMelting: boolean }) {
    // Estimating seconds (2s per block)
    const seconds = blocksRemaining * 2;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        <div className={`p-4 border-2 ${isMelting ? 'border-red-600 bg-red-950/20' : 'border-cyan-500/30 bg-cyan-950/20'} rounded-md transition-colors duration-500`}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">Status Reactor</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isMelting ? 'bg-red-600 text-white animate-pulse' : 'bg-cyan-600 text-white'}`}>
                    {isMelting ? 'MELTDOWN CRITICAL' : 'STABLE'}
                </span>
            </div>

            <div className="flex items-end gap-2 px-2">
                <span className={`text-4xl font-mono font-black ${isMelting ? 'text-red-500' : 'text-cyan-400'}`}>
                    {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono opacity-40 mb-1">POSSESSION_LIMIT</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/5 mt-4 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: isMelting ? "0%" : `${(blocksRemaining / 900) * 100}%` }}
                    className={`h-full ${isMelting ? 'bg-red-600' : 'bg-cyan-500'}`}
                />
            </div>
        </div>
    );
}
