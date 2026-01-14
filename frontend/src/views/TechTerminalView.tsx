/**
 * TechTerminalView - TECH_TERMINAL
 * System parameters and contract metadata
 * 
 * Components:
 * - ContractManifest: Address, ABI, Stylus runtime
 * - GlobalParams: SAFE_LIMIT, COOLDOWN values
 * - NetworkStatus: Arbitrum Sepolia info
 */
import { useBlockNumber, useGasPrice, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Cpu, FileCode, Settings, Wifi, ExternalLink, Copy, Check, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

import { useGameState } from '../AppRouter';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';

const CONTRACT_ADDRESS = '0xf8b5cdf482b197555a0e7c2c9d98f05d21b9c5b3';
const SAFE_LIMIT_BLOCKS = 900;
const BLOCK_TIME_SECONDS = 2;

export default function TechTerminalView() {
    const { isMelting, heat } = useGameState();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const { data: gasPrice } = useGasPrice();
    const chainId = useChainId();
    const [copied, setCopied] = useState(false);

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(CONTRACT_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatGasPrice = (gas: bigint | undefined) => {
        if (!gas) return '...';
        return `${(Number(gas) / 1e9).toFixed(2)} Gwei`;
    };

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Cpu className={`w-5 h-5 ${isMelting ? 'text-meltdown' : 'text-stable'}`} />
                <h1 className="font-heading text-lg font-bold uppercase tracking-wider">TECH TERMINAL</h1>
            </div>

            {/* ContractManifest */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                    <FileCode className="w-4 h-4 text-stable" />
                    <span className="font-heading text-xs uppercase tracking-widest font-bold">CONTRACT MANIFEST</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="opacity-50">Name</span>
                        <span className="text-stable">TheArbitrumCore</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="opacity-50">Runtime</span>
                        <span className="text-stable">Stylus (Rust)</span>
                    </div>
                    <div className="flex justify-between items-start py-2 border-b border-white/5">
                        <span className="opacity-50">Address</span>
                        <div className="flex items-center gap-2">
                            <span className="text-right break-all max-w-[180px]">
                                {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                            </span>
                            <button
                                onClick={handleCopyAddress}
                                className="text-stable hover:text-white transition-colors"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="opacity-50">Network</span>
                        <a
                            href={`https://sepolia.arbiscan.io/address/${CONTRACT_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-stable hover:text-white transition-colors"
                        >
                            Arbitrum Sepolia <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>

            {/* GlobalParams */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-stable" />
                    <span className="font-heading text-xs uppercase tracking-widest font-bold">GLOBAL PARAMS</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-black/20 rounded">
                        <div className="text-micro opacity-50 mb-1">SAFE_LIMIT</div>
                        <div className="font-heading text-xl font-bold text-stable">{SAFE_LIMIT_BLOCKS}</div>
                        <div className="text-micro opacity-40">blocks</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded">
                        <div className="text-micro opacity-50 mb-1">MELTDOWN TIME</div>
                        <div className="font-heading text-xl font-bold text-meltdown">
                            {Math.floor(SAFE_LIMIT_BLOCKS * BLOCK_TIME_SECONDS / 60)}
                        </div>
                        <div className="text-micro opacity-40">minutes</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded">
                        <div className="text-micro opacity-50 mb-1">BLOCK_TIME</div>
                        <div className="font-heading text-xl font-bold">{BLOCK_TIME_SECONDS}</div>
                        <div className="text-micro opacity-40">seconds</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded">
                        <div className="text-micro opacity-50 mb-1">CURRENT HEAT</div>
                        <div className={`font-heading text-xl font-bold ${isMelting ? 'text-meltdown' : 'text-stable'}`}>
                            {(heat * 100).toFixed(1)}%
                        </div>
                        <div className="text-micro opacity-40">entropy</div>
                    </div>
                </div>
            </div>

            {/* NetworkStatus */}
            <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                    <Wifi className="w-4 h-4 text-stable" />
                    <span className="font-heading text-xs uppercase tracking-widest font-bold">NETWORK STATUS</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="opacity-50">Chain ID</span>
                        <span>{chainId}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="opacity-50">Latest Block</span>
                        <span className="text-stable">#{blockNumber?.toString() || '...'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="opacity-50">Gas Price</span>
                        <span>{formatGasPrice(gasPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="opacity-50">Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-success">ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Administrative Actions */}
            <div className={`glass-panel border-meltdown/30 p-4`}>
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-meltdown" />
                    <span className="font-heading text-xs uppercase tracking-widest font-bold text-meltdown">SYSTEM INITIALIZATION</span>
                </div>

                <p className="text-[10px] opacity-60 mb-4 leading-relaxed italic">
                    ⚠ Warning: Initialization will mint the primary Core (Token ID 1) to the admin address.
                    This should only be performed once per deployment.
                </p>

                <button
                    onClick={() => {
                        writeContract({
                            address: CONTRACT_ADDRESS as `0x${string}`,
                            abi: TheArbitrumCoreAbi,
                            functionName: 'initialize',
                        });
                    }}
                    disabled={isPending || isConfirming || isConfirmed}
                    className="w-full py-4 bg-meltdown/20 hover:bg-meltdown/30 border border-meltdown/50 rounded-sm font-heading text-sm font-bold text-meltdown tracking-[0.3em] transition-all hover:shadow-glow-meltdown disabled:opacity-50"
                >
                    {isPending || isConfirming ? 'EXECUTING INITIALIZATION...' : isConfirmed ? 'CORE INITIALIZED' : 'INITIALIZE SYSTEM CORE'}
                </button>
            </div>
        </div>
    );
}
