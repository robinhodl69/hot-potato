/**
 * HUDCard - Enhanced glass panel with sci-fi corner accents
 * Variants: default, highlight (pulsing), stat (centered numbers)
 */
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { useGameState } from '../../AppRouter';

interface HUDCardProps {
    children: ReactNode;
    variant?: 'default' | 'highlight' | 'stat' | 'danger';
    icon?: LucideIcon;
    title?: string;
    className?: string;
    noPadding?: boolean;
}

export default function HUDCard({
    children,
    variant = 'default',
    icon: Icon,
    title,
    className = '',
    noPadding = false,
}: HUDCardProps) {
    const { isMelting } = useGameState();

    const baseClasses = `
        hud-card relative
        ${isMelting ? 'hud-card-meltdown' : 'hud-card-stable'}
        ${variant === 'highlight' ? 'hud-card-highlight' : ''}
        ${variant === 'stat' ? 'hud-card-stat' : ''}
        ${variant === 'danger' ? 'border-meltdown/50 shadow-[0_0_15px_rgba(255,62,0,0.2)]' : ''}
        ${noPadding ? '' : 'p-4'}
        ${className}
    `;

    return (
        <div className={baseClasses}>
            {/* Corner Accents */}
            <div
                className={`
                    absolute -top-px -left-px w-3 h-3
                    border-l-2 border-t-2
                    ${isMelting ? 'border-meltdown/60' : 'border-stable/60'}
                `}
            />
            <div
                className={`
                    absolute -bottom-px -right-px w-3 h-3
                    border-r-2 border-b-2
                    ${isMelting ? 'border-meltdown/60' : 'border-stable/60'}
                `}
            />

            {/* Optional Header */}
            {(Icon || title) && (
                <div className="flex items-center gap-2 mb-3">
                    {Icon && (
                        <Icon className={`w-4 h-4 ${isMelting ? 'text-meltdown' : 'text-stable'}`} />
                    )}
                    {title && (
                        <span
                            className="font-heading text-xs uppercase tracking-widest font-bold"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                        >
                            {title}
                        </span>
                    )}
                </div>
            )}

            {/* Content */}
            {children}
        </div>
    );
}
