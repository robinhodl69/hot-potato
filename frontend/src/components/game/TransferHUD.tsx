import { useState } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TransferHUDProps {
    onTransfer: (address: string) => void;
    isPending: boolean;
}

export function TransferHUD({ onTransfer, isPending }: TransferHUDProps) {
    const [username, setUsername] = useState('');
    const [targetAddress, setTargetAddress] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Mock search - TODO: Integrate Farcaster SDK resolution
    const handleSearch = async () => {
        if (!username) return;
        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
            // Mock resolution
            setTargetAddress('0x' + Math.random().toString(16).slice(2, 42));
            setIsSearching(false);
        }, 800);
    };

    return (
        <div className="space-y-4">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER @USERNAME..."
                    className="w-full bg-black/40 border border-white/10 rounded-md py-3 pl-10 pr-4 text-xs font-mono tracking-wider focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-mono transition-colors"
                >
                    {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'SEARCH'}
                </button>
            </div>

            {targetAddress && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center justify-between"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono opacity-50 uppercase tracking-tighter">Target Hash</span>
                        <span className="text-[11px] font-mono text-cyan-200 truncate max-w-[180px]">{targetAddress}</span>
                    </div>
                    <button
                        onClick={() => onTransfer(targetAddress)}
                        disabled={isPending}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 p-2 rounded-md shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2 group"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        <span className="text-[10px] font-bold tracking-tighter uppercase pr-1">PASS CORE</span>
                    </button>
                </motion.div>
            )}
        </div>
    );
}
