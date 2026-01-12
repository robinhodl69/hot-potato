/**
 * PageLayout - Consistent wrapper for all non-home views
 * Provides standardized padding, scroll behavior, and navbar clearance
 */
import { ReactNode } from 'react';
import { useGameState } from '../../AppRouter';

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function PageLayout({ children, className = '', noPadding = false }: PageLayoutProps) {
    const { isMelting } = useGameState();

    return (
        <div
            className={`
                h-full overflow-y-auto
                ${noPadding ? '' : 'px-5 py-6'}
                ${className}
            `}
            style={{
                paddingBottom: noPadding ? undefined : 'calc(5rem + env(safe-area-inset-bottom))',
            }}
        >
            {/* Subtle top gradient for depth */}
            <div
                className="fixed top-0 left-0 right-0 h-24 pointer-events-none z-10"
                style={{
                    background: 'linear-gradient(to bottom, rgba(5,5,5,0.8) 0%, transparent 100%)',
                }}
            />

            {/* Content */}
            <div className="relative z-20 space-y-4">
                {children}
            </div>

            {/* Bottom gradient fade before navbar */}
            <div
                className="fixed bottom-20 left-0 right-0 h-16 pointer-events-none z-10"
                style={{
                    background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 100%)',
                }}
            />
        </div>
    );
}
