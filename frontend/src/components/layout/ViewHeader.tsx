/**
 * ViewHeader - Standardized header component for all views
 * Features animated underline glow and meltdown-reactive styling
 */
import { LucideIcon } from 'lucide-react';
import { useGameState } from '../../AppRouter';

interface ViewHeaderProps {
    icon: LucideIcon;
    title: string;
    rightContent?: React.ReactNode;
}

export default function ViewHeader({ icon: Icon, title, rightContent }: ViewHeaderProps) {
    const { isMelting } = useGameState();

    return (
        <header className="view-header mb-6">
            <div className="view-header-title">
                <div
                    className={`
                        w-10 h-10 rounded flex items-center justify-center
                        ${isMelting ? 'bg-meltdown/10' : 'bg-stable/10'}
                    `}
                    style={{
                        boxShadow: isMelting
                            ? '0 0 20px rgba(255, 50, 0, 0.2)'
                            : '0 0 20px rgba(0, 255, 255, 0.15)',
                    }}
                >
                    <Icon className={`w-5 h-5 ${isMelting ? 'text-meltdown' : 'text-stable'}`} />
                </div>
                <div>
                    <h1
                        className="font-heading text-lg font-bold uppercase tracking-wider"
                        style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                        {title}
                    </h1>
                    {/* Animated underline */}
                    <div
                        className={`h-px mt-1 ${isMelting ? 'bg-meltdown/40' : 'bg-stable/40'}`}
                        style={{
                            width: '60%',
                            boxShadow: isMelting
                                ? '0 0 8px rgba(255, 50, 0, 0.5)'
                                : '0 0 8px rgba(0, 255, 255, 0.5)',
                        }}
                    />
                </div>
            </div>

            {rightContent && (
                <div className="text-micro opacity-50">
                    {rightContent}
                </div>
            )}
        </header>
    );
}
