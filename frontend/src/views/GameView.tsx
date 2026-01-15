/**
 * GameView - CORE_DASHBOARD
 * Main gameplay interface with real-time Stylus contract state
 * 
 * Components:
 * - CoreStabilityGauge: Visual stability percentage
 * - ActiveOperator: Current holder display
 * - TransferAction: Primary grab/transfer button
 * - YieldTracker: Real-time points counter
 */
import { useEffect, useRef, useState } from 'react';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, User, Flame, Target, CircleHelp, Share2, Twitter, Loader2, ExternalLink } from 'lucide-react';
import { sdk } from '@farcaster/miniapp-sdk';

import CoreVisual from '../components/core/CoreVisual';
import HowToPlayModal from '../components/hud/HowToPlayModal';
import OperatorProfile from '../components/identity/OperatorProfile';
import { useSynth } from '../hooks/useSynth';
import { useGameState } from '../AppRouter';
import TheArbitrumCoreAbi from '../abi/TheArbitrumCore.json';

const CONTRACT_ADDRESS = '0xd499da7647edf49770b01130baa1c9bd73e6083a';
const SAFE_LIMIT_BLOCKS = 7200;

export default function GameView() {
    const { isConnected, address } = useAccount();
    const { connect, connectors } = useConnect();
    const { play } = useSynth();
    const { heat, isMelting, currentHolder, previousHolder, blockNumber, activeCoreId, canSpawn, lastTransferBlock, lastTransferTimestamp } = useGameState();
    const lastSonarTime = useRef(0);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isExploding, setIsExploding] = useState(false);

    // ========================
    // CONTRACT READS
    // ========================

    // User points
    const { data: userPoints } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TheArbitrumCoreAbi,
        functionName: 'getPoints',
        args: [address],
        query: { enabled: !!address, refetchInterval: 5000 }
    }) as { data: bigint | undefined };

    // ========================
    // CONTRACT WRITES
    // ========================
    const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // ========================
    // DERIVED STATE
    // ========================
    const isOwner = address?.toLowerCase() === currentHolder?.toLowerCase();
    const isPreviousHolder = address?.toLowerCase() === previousHolder?.toLowerCase();
    const canGrab = isConnected && !isOwner && isMelting && !canSpawn; // Can't grab if phoenix spawn available

    // Phoenix spawn handler
    const handleSpawnCore = () => {
        play('click');
        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TheArbitrumCoreAbi,
            functionName: 'spawnNewCore',
            gas: 500000n,  // Stylus contracts need explicit gas
        });
    };

    // === EVENT-BASED TIMER ===
    // Uses lastTransferTimestamp from Transfer event for accurate countdown
    const SAFE_LIMIT_SECONDS = 1800; // 30 minutes

    // Real-time clock
    const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000));

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate time remaining based on Transfer event timestamp
    const secondsHeld = lastTransferTimestamp
        ? Math.max(0, currentTime - lastTransferTimestamp)
        : 0;

    const secondsRemaining = Math.max(0, SAFE_LIMIT_SECONDS - secondsHeld);
    const timeRemaining = isMelting ? 0 : secondsRemaining;

    // Stability based on real time progress
    const stabilityPercent = isMelting ? 0 : Math.max(0, (secondsRemaining / SAFE_LIMIT_SECONDS) * 100);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatAddress = (addr: string | undefined) => {
        if (!addr) return 'NONE';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // ========================
    // EFFECTS
    // ========================

    // SDK init & Context (Logged in user)
    const [viewerFarcasterUser, setViewerFarcasterUser] = useState<{ username?: string, pfpUrl?: string } | null>(null);
    // Holder profile info
    const [holderFarcasterUser, setHolderFarcasterUser] = useState<{ username?: string, pfpUrl?: string } | null>(null);

    useEffect(() => {
        const initSdk = async () => {
            try {
                sdk.actions.ready();
                const context = await sdk.context;
                if (context?.user) {
                    setViewerFarcasterUser({
                        username: context.user.username,
                        pfpUrl: context.user.pfpUrl
                    });
                }
            } catch (err) {
                console.warn('Running outside Farcaster or failed to get context', err);
            }
        };
        initSdk();
    }, []);

    // Fetch Holder Farcaster Info
    useEffect(() => {
        const fetchHolderProfile = async () => {
            if (!currentHolder || currentHolder === '0x0000000000000000000000000000000000000000') return;
            try {
                // Searchcaster prefers lowercased addresses
                const cleanAddress = currentHolder.toLowerCase();
                console.log('[DEBUG] Fetching Farcaster profile for:', cleanAddress);

                // Using AllOrigins proxy to bypass CORS blocks in the web environment
                const targetUrl = `https://searchcaster.xyz/api/profiles?connected_address=${cleanAddress}`;
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                if (data && data.length > 0) {
                    console.log('[DEBUG] Profile found:', data[0].body.username);
                    setHolderFarcasterUser({
                        username: data[0].body.username,
                        pfpUrl: data[0].body.avatar
                    });
                } else {
                    console.log('[DEBUG] No Farcaster profile found for this address');
                    setHolderFarcasterUser(null);
                }
            } catch (err) {
                console.warn('Failed to fetch holder profile via proxy:', err);
            }
        };
        fetchHolderProfile();
    }, [currentHolder]);

    // Sonar effect when owner and melting
    useEffect(() => {
        if (!isOwner || !isMelting) return;
        const now = Date.now();
        const interval = Math.max(2000 - heat * 1500, 500);
        if (now - lastSonarTime.current > interval) {
            play('sonar', { intensity: Math.min(heat, 1) });
            lastSonarTime.current = now;
        }
    }, [heat, isOwner, isMelting, play]);

    // ========================
    // ACTIONS
    // ========================
    const [targetAddress, setTargetAddress] = useState('');
    const [lastRecipientHandle, setLastRecipientHandle] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);

    const handleGrabCore = () => {
        play('click');
        setIsExploding(true);
        setTimeout(() => setIsExploding(false), 1500); // Reset after animation
        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TheArbitrumCoreAbi,
            functionName: 'grabCore',
            args: [],
            gas: 500000n,  // Stylus contracts need explicit gas
        });
    };

    const handleTransfer = async () => {
        if (!targetAddress) return;
        play('click');
        setResolveError(null);

        let finalAddress = targetAddress.trim();

        // Handle Resolution (Address vs Farcaster Handle)
        const isHex = /^0x[a-fA-F0-9]{40}$/.test(finalAddress);

        if (!isHex) {
            setIsResolving(true);
            // Auto-strip '@' if they put it, regardless of where they are in the logic
            const username = finalAddress.startsWith('@') ? finalAddress.slice(1) : finalAddress;
            setLastRecipientHandle(username);

            try {
                const cleanUsername = username.toLowerCase().trim();
                console.log('[DEBUG] Resolving handle via proxy:', cleanUsername);

                const targetUrl = `https://searchcaster.xyz/api/profiles?username=${encodeURIComponent(cleanUsername)}`;
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

                const response = await fetch(proxyUrl);

                if (!response.ok) {
                    setResolveError(`API ERROR: ${response.status}`);
                    setIsResolving(false);
                    return;
                }

                const data = await response.json();
                console.log('[DEBUG] Resolution data:', data);

                if (data && data.length > 0 && data[0].connectedAddress) {
                    finalAddress = data[0].connectedAddress;
                } else {
                    setResolveError('USER NOT FOUND (NO WALLET)');
                    setIsResolving(false);
                    return;
                }
            } catch (err) {
                console.error('Handle resolution failed:', err);
                setResolveError('PROXY ERROR: ENGINE OFFLINE');
                setIsResolving(false);
                return;
            }
        } else {
            setLastRecipientHandle(null);
        }

        setIsResolving(false);

        // After resolution, ensure finalAddress is a valid 0x address
        if (!/^0x[a-fA-F0-9]{40}$/.test(finalAddress)) {
            setResolveError('INVALID ADDRESS FORMAT');
            return;
        }

        // Anti-Point Farming Check: Cannot pass back to previous holder
        if (finalAddress.toLowerCase() === previousHolder?.toLowerCase()) {
            setResolveError('CANNOT PASS BACK TO PREVIOUS');
            setIsResolving(false);
            return;
        }

        setIsResolving(false);
        // After resolution, ensure finalAddress is a valid 0x address
        if (!/^0x[a-fA-F0-9]{40}$/.test(finalAddress)) {
            setResolveError('INVALID ADDRESS FORMAT');
            return;
        }

        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TheArbitrumCoreAbi,
            functionName: 'passTheCore',
            args: [finalAddress as `0x${string}`],
            gas: 500000n,  // Stylus contracts need explicit gas
        });
    };

    const handleConnect = () => {
        play('click');
        connect({ connector: connectors[0] });
    };

    const handleShareWarpcastAction = () => {
        const text = `⚡ I just passed The @arbitrum Core to ${lastRecipientHandle ? `@${lastRecipientHandle}` : formatAddress(targetAddress)}! Keep it stable and pass it on. 🛰️\n\nPlay here: https://farcaster.xyz/miniapps/eiZiilnpq2Gv/the-arbitrum-core`;
        const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
        try { sdk.actions.openUrl(url); } catch { window.open(url, '_blank'); }
    };

    const handleShareTwitterAction = () => {
        const text = `⚡ I just passed The Arbitrum Core to ${lastRecipientHandle ? `@${lastRecipientHandle}` : formatAddress(targetAddress)}! Keep it stable and pass it on. @arbitrum 🛰️\n\nPlay here: https://farcaster.xyz/miniapps/eiZiilnpq2Gv/the-arbitrum-core`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // ========================
    // RENDER
    // ========================
    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* HEADER - Connection Status */}
            <header className="relative flex-shrink-0 px-4 py-3 flex justify-between items-center border-b border-white/5">
                {/* Left: Status */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isMelting ? 'bg-meltdown animate-pulse' : 'bg-stable'}`} />
                    <span className={`text-micro font-bold tracking-wider ${isMelting ? 'text-meltdown' : 'text-stable'}`}>
                        CORE_DASHBOARD
                    </span>
                </div>

                {/* Center: HOW TO PLAY */}
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-stable text-black text-[10px] font-bold tracking-widest rounded hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                >
                    HOW TO PLAY
                </button>

                {/* Right: Address */}
                <div className={`text-micro font-bold ${isConnected ? (isMelting ? 'text-meltdown' : 'text-stable') : 'text-white/50'}`}>
                    {isConnected ? formatAddress(address) : 'DISCONNECTED'}
                </div>
            </header>

            {/* TOP SECTION - Core Visual Only */}
            <div className="h-[45%] flex items-center justify-center relative">
                {/* Explosion Animation Overlay */}
                <AnimatePresence>
                    {isExploding && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Explosion Rings */}
                            {[1, 2, 3, 4].map((ring) => (
                                <motion.div
                                    key={ring}
                                    className="absolute rounded-full border-4"
                                    style={{
                                        borderColor: ring % 2 === 0 ? '#ff4400' : '#ffcc00',
                                        boxShadow: `0 0 40px ${ring % 2 === 0 ? '#ff4400' : '#ffcc00'}`,
                                    }}
                                    initial={{ width: 20, height: 20, opacity: 1 }}
                                    animate={{
                                        width: [20, 300 + ring * 50],
                                        height: [20, 300 + ring * 50],
                                        opacity: [1, 0],
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: ring * 0.1,
                                        ease: 'easeOut',
                                    }}
                                />
                            ))}
                            {/* Central Flash */}
                            <motion.div
                                className="absolute w-32 h-32 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, #ffffff 0%, #ff6600 50%, transparent 100%)',
                                    boxShadow: '0 0 100px #ff4400, 0 0 200px #ff6600',
                                }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: [0, 3, 0], opacity: [1, 1, 0] }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`w-40 h-40 md:w-48 md:h-48 ${isExploding ? 'animate-shake' : ''}`}>
                    <CoreVisual heat={Math.min(heat, 1.3)} isExploded={canSpawn} />
                </div>
            </div>

            {/* BOTTOM SECTION - HUD Panels */}
            <div
                className="flex-1 flex flex-col relative z-30 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-4"
                style={{ gap: '1rem' }}
            >
                {/* CORE STABILITY GAUGE - Enhanced */}
                <div
                    className="glass-panel p-5 relative overflow-hidden"
                    style={{
                        borderColor: isMelting ? 'rgba(255, 60, 30, 0.4)' : 'rgba(0, 255, 255, 0.2)',
                        background: isMelting
                            ? 'linear-gradient(180deg, rgba(255, 60, 30, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)'
                            : 'linear-gradient(180deg, rgba(0, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)',
                    }}
                >
                    {/* Heat gradient overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `linear-gradient(90deg, 
                                rgba(0, 255, 255, ${Math.max(0, 1 - heat)}) 0%, 
                                rgba(255, 200, 0, ${heat > 0.5 ? (heat - 0.5) * 2 : 0}) 50%,
                                rgba(255, 60, 30, ${heat}) 100%)`,
                            opacity: 0.15,
                        }}
                    />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                            {isMelting ? (
                                <Flame className="w-5 h-5 text-meltdown animate-pulse" />
                            ) : (
                                <Target className="w-5 h-5 text-stable" />
                            )}
                            <span className="text-xs font-bold tracking-widest opacity-60">CORE STABILITY</span>
                        </div>
                        <div
                            className="font-heading text-2xl font-bold"
                            style={{
                                color: heat < 0.5 ? '#00ffff' : heat < 0.8 ? '#ffcc00' : '#ff3c1e',
                                textShadow: `0 0 20px ${heat < 0.5 ? 'rgba(0,255,255,0.5)' : heat < 0.8 ? 'rgba(255,200,0,0.5)' : 'rgba(255,60,30,0.8)'}`,
                            }}
                        >
                            {stabilityPercent.toFixed(0)}%
                        </div>
                    </div>

                    {/* Progress Bar - Enhanced */}
                    <div className="h-3 bg-black/60 rounded-full overflow-hidden mb-4 relative z-10">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: heat < 0.5
                                    ? 'linear-gradient(90deg, #00ffff, #2dd4bf)'
                                    : heat < 0.8
                                        ? 'linear-gradient(90deg, #ffcc00, #ff9900)'
                                        : 'linear-gradient(90deg, #ff6600, #ff2200)',
                                boxShadow: `0 0 10px ${heat < 0.5 ? '#00ffff' : heat < 0.8 ? '#ffcc00' : '#ff3300'}`,
                            }}
                            initial={{ width: '100%' }}
                            animate={{ width: `${stabilityPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Countdown Timer - LARGE & PROMINENT */}
                    <div className="text-center relative z-10">
                        <div className="text-micro opacity-50 mb-1 tracking-widest">
                            {isMelting ? '⚠️ MELTDOWN ACTIVE' : 'TIME TO MELTDOWN'}
                        </div>
                        <div
                            className={`font-heading font-bold ${isMelting ? 'animate-pulse' : ''}`}
                            style={{
                                fontSize: '3rem',
                                lineHeight: 1,
                                color: heat < 0.5 ? '#ffffff' : heat < 0.8 ? '#ffcc00' : '#ff3c1e',
                                textShadow: heat >= 0.8 ? '0 0 30px rgba(255,60,30,0.8)' : 'none',
                            }}
                        >
                            {formatTime(timeRemaining)}
                        </div>
                        <div className="text-micro opacity-40 mt-2">
                            {Math.floor(secondsRemaining).toLocaleString()} seconds remaining
                        </div>
                    </div>
                </div>

                {/* CONTROL PANEL */}
                <div className="flex-shrink-0" style={{ gap: '1rem', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>

                    {/* Stats Row */}
                    <div className={`glass-panel ${isMelting ? 'glass-panel-meltdown' : 'glass-panel-stable'} p-4`}>
                        <div className="flex justify-between items-center">
                            {/* YieldTracker */}
                            <div>
                                <div className="text-micro opacity-40">YOUR YIELD</div>
                                <motion.div
                                    className="font-heading text-2xl font-bold"
                                    key={userPoints?.toString()}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                >
                                    {userPoints?.toString() || '0'}
                                </motion.div>
                            </div>

                            {/* ActiveOperator */}
                            <div className="text-right">
                                <div className="text-micro opacity-40">ACTIVE OPERATOR</div>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <User className={`w-3 h-3 ${isOwner ? 'text-stable' : 'opacity-40'}`} />
                                    <span className={`font-data text-sm ${isOwner ? 'text-stable font-bold' : 'opacity-70'}`}>
                                        {isOwner ? 'YOU' : formatAddress(currentHolder)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TransferAction */}
                    {!isConnected ? (
                        <button onClick={handleConnect} className="btn btn-primary w-full">
                            CONNECT WALLET
                        </button>
                    ) : isOwner ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="@username or 0x address"
                                value={targetAddress}
                                onChange={(e) => {
                                    setTargetAddress(e.target.value);
                                    if (resolveError) setResolveError(null);
                                }}
                                disabled={isResolving || isPending || isConfirming}
                                className={`w-full px-4 py-3 bg-black/40 backdrop-blur-sm border rounded-sm font-data text-sm placeholder:opacity-40 focus:outline-none transition-all ${resolveError
                                    ? 'border-red-500/50 shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                                    : isMelting
                                        ? 'border-meltdown/30 focus:border-meltdown/80 focus:shadow-glow-meltdown'
                                        : 'border-stable/20 focus:border-stable/60 focus:shadow-glow-stable'
                                    }`}
                            />

                            {resolveError && (
                                <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center animate-pulse">
                                    ⚠ {resolveError}
                                </div>
                            )}

                            <button
                                onClick={handleTransfer}
                                disabled={!targetAddress || isPending || isConfirming || isResolving}
                                className={`w-full ${isMelting ? 'btn btn-danger' : 'btn btn-primary'} flex items-center justify-center gap-2`}
                            >
                                {isResolving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        RESOLVING STATUS...
                                    </>
                                ) : isPending || isConfirming ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        TRANSMITTING...
                                    </>
                                ) : (
                                    'EJECT CORE →'
                                )}
                            </button>
                        </div>
                    ) : canSpawn && isConnected ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-meltdown animate-pulse">
                                <Flame className="w-4 h-4" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">CORE DEAD // PHOENIX PROTOCOL AVAILABLE</span>
                            </div>
                            <button
                                onClick={handleSpawnCore}
                                disabled={isPending || isConfirming}
                                className="btn w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-[0_0_30px_rgba(255,100,0,0.5)] animate-pulse"
                            >
                                {isPending || isConfirming ? 'SPAWNING...' : '🔥 SPAWN NEW CORE'}
                            </button>
                            <div className="text-[9px] text-center opacity-50">
                                Core #{activeCoreId?.toString()} has been abandoned. Claim the next generation!
                            </div>
                        </div>
                    ) : canGrab ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-stable animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">Core Vulnerable // Initiate Seizure</span>
                            </div>
                            <button
                                onClick={handleGrabCore}
                                disabled={isPending || isConfirming}
                                className="btn btn-primary w-full shadow-[0_0_20px_rgba(0,255,255,0.3)] animate-pulse"
                            >
                                {isPending || isConfirming ? 'ACQUIRING...' : 'GRAB CORE'}
                            </button>
                        </div>
                    ) : (
                        <OperatorProfile
                            address={currentHolder}
                            isPreviousHolder={isPreviousHolder || false}
                            isMe={false}
                            farcasterUser={holderFarcasterUser}
                        />
                    )}

                    {/* Success Toast & Sharing */}
                    <AnimatePresence>
                        {isConfirmed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass-panel glass-panel-stable p-4 text-center space-y-3"
                            >
                                <div className="flex items-center justify-center gap-2 text-stable font-bold text-xs uppercase tracking-widest">
                                    <Zap className="w-4 h-4" />
                                    CORE EJECTED SUCCESSFULLY
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={handleShareWarpcastAction}
                                        className="py-2 bg-purple-600/20 border border-purple-500/50 rounded flex items-center justify-center gap-2 text-[10px] font-bold text-purple-400 hover:bg-purple-600/30 transition-all"
                                    >
                                        <Share2 className="w-3 h-3" />
                                        WARPCAST
                                    </button>
                                    <button
                                        onClick={handleShareTwitterAction}
                                        className="py-2 bg-blue-400/10 border border-blue-400/30 rounded flex items-center justify-center gap-2 text-[10px] font-bold text-blue-400 hover:bg-blue-400/20 transition-all"
                                    >
                                        <Twitter className="w-3 h-3" />
                                        TWITTER / X
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Feedback */}
                    <AnimatePresence>
                        {(writeError || confirmError) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="glass-panel border-red-500/50 bg-red-500/10 p-4 text-center mt-4"
                            >
                                <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest">
                                    <AlertTriangle className="w-4 h-4" />
                                    TRANSMISSION FAILED
                                </div>
                                <div className="text-[10px] opacity-70 mt-1 uppercase text-red-200">
                                    {writeError?.message?.includes('PREV') || writeError?.message?.includes('E2') ? 'CANNOT PASS BACK TO PREVIOUS HOLDER (E2)' :
                                        writeError?.message?.includes('FID') || writeError?.message?.includes('E3') ? 'FID ANTI-CHEAT TRIGGERED (E3)' :
                                            writeError?.message?.includes('OWNER') || writeError?.message?.includes('E1') ? 'NOT THE CORE OWNER (E1)' :
                                                writeError?.message?.includes('E4') ? 'POINT SETTLEMENT FAILED (E4)' :
                                                    writeError?.message?.includes('E5') ? 'ERC721 TRANSFER FAILED (E5)' :
                                                        writeError?.message || confirmError?.message || 'UNKNOWN INTERFERENCE'}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <HowToPlayModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div >
    );
}
