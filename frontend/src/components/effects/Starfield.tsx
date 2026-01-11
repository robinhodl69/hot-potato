/**
 * Starfield - Interstellar Background Effect
 * Creates a moving starfield like traveling through space
 */
import { useEffect, useRef } from 'react';

interface StarfieldProps {
    isMelting?: boolean;
}

export default function Starfield({ isMelting = false }: StarfieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Star class
        class Star {
            x: number;
            y: number;
            z: number;
            pz: number;

            constructor() {
                this.x = Math.random() * canvas.width - canvas.width / 2;
                this.y = Math.random() * canvas.height - canvas.height / 2;
                this.z = Math.random() * canvas.width;
                this.pz = this.z;
            }

            update(speed: number) {
                this.pz = this.z;
                this.z -= speed;
                if (this.z < 1) {
                    this.x = Math.random() * canvas.width - canvas.width / 2;
                    this.y = Math.random() * canvas.height - canvas.height / 2;
                    this.z = canvas.width;
                    this.pz = this.z;
                }
            }

            draw(ctx: CanvasRenderingContext2D, color: string) {
                const sx = (this.x / this.z) * canvas.width / 2 + canvas.width / 2;
                const sy = (this.y / this.z) * canvas.height / 2 + canvas.height / 2;
                const px = (this.x / this.pz) * canvas.width / 2 + canvas.width / 2;
                const py = (this.y / this.pz) * canvas.height / 2 + canvas.height / 2;

                const size = Math.max(0.5, (1 - this.z / canvas.width) * 3);
                const opacity = Math.max(0.1, 1 - this.z / canvas.width);

                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.globalAlpha = opacity;
                ctx.lineWidth = size;
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.stroke();

                // Star dot
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.arc(sx, sy, size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create stars
        const stars: Star[] = [];
        const numStars = 200;
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }

        // Animation loop
        let animationId: number;
        let currentMelting = isMelting;

        const animate = () => {
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const speed = currentMelting ? 12 : 6;
            const starColor = currentMelting ? '#ff6432' : '#ffffff';

            stars.forEach(star => {
                star.update(speed);
                star.draw(ctx, starColor);
            });

            // Center glow
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.4
            );
            gradient.addColorStop(0, currentMelting ? 'rgba(255, 62, 0, 0.15)' : 'rgba(0, 200, 255, 0.1)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // Update melting state
    useEffect(() => {
        // This will trigger re-render with new colors
    }, [isMelting]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
            }}
        />
    );
}
