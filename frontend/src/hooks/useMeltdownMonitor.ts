import { useState, useEffect, useRef } from 'react';
import { useGameState } from '../AppRouter';

export interface MeltdownEvent {
    id: string;
    timestamp: number;
    defaulter: string; // The person who let it melt
    hero: string;      // The person who reset it
}

const STORAGE_KEY = 'core_meltdown_history';

export function useMeltdownMonitor() {
    const { isMelting, currentHolder } = useGameState();
    const [history, setHistory] = useState<MeltdownEvent[]>([]);

    // Refs to track previous state for change detection
    const prevMeltingRef = useRef(false);
    const prevHolderRef = useRef<string | undefined>(undefined);

    // Initial load
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load meltdown history', e);
        }
    }, []);

    // Monitor for Reset Event
    useEffect(() => {
        const wasMelting = prevMeltingRef.current;
        const prevHolder = prevHolderRef.current; // The potential defaulter

        const isReset = wasMelting && !isMelting; // Transition from Melting -> Stable
        const holderChanged = prevHolder && currentHolder && prevHolder.toLowerCase() !== currentHolder.toLowerCase();

        if (isReset && holderChanged && prevHolder) {
            // DETECTED MELTDOWN RESET!
            const newEvent: MeltdownEvent = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                defaulter: prevHolder,
                hero: currentHolder || 'Unknown'
            };

            setHistory(prev => {
                const updated = [newEvent, ...prev].slice(0, 50); // Keep last 50
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        }

        // Update refs
        prevMeltingRef.current = isMelting;
        prevHolderRef.current = currentHolder;

    }, [isMelting, currentHolder]);

    return { meltdownHistory: history };
}
