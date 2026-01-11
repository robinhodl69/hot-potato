/**
 * useSynth - Web Audio API synthesizer hook
 * Generates procedural sounds for UI feedback without external audio files
 */
import { useCallback, useRef } from 'react';

type SoundType = 'click' | 'success' | 'warning' | 'sonar';

export function useSynth() {
    const audioContextRef = useRef<AudioContext | null>(null);

    const getContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    /**
     * Plays a metallic click sound
     */
    const playClick = useCallback(() => {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    }, [getContext]);

    /**
     * Plays a success confirmation tone
     */
    const playSuccess = useCallback(() => {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }, [getContext]);

    /**
     * Plays an escalating warning/sonar pulse
     * @param intensity - 0 to 1, affects pitch and urgency
     */
    const playSonar = useCallback((intensity: number = 0.5) => {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Frequency increases with intensity (more urgent as meltdown approaches)
        const baseFreq = 200 + intensity * 600;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000 + intensity * 2000, ctx.currentTime);

        gain.gain.setValueAtTime(0.08 + intensity * 0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    }, [getContext]);

    /**
     * Plays a warning alarm (for critical states)
     */
    const playWarning = useCallback(() => {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
    }, [getContext]);

    const play = useCallback((type: SoundType, options?: { intensity?: number }) => {
        try {
            switch (type) {
                case 'click':
                    playClick();
                    break;
                case 'success':
                    playSuccess();
                    break;
                case 'sonar':
                    playSonar(options?.intensity ?? 0.5);
                    break;
                case 'warning':
                    playWarning();
                    break;
            }
        } catch {
            // Silently fail if audio context is unavailable
        }
    }, [playClick, playSuccess, playSonar, playWarning]);

    return { play };
}
