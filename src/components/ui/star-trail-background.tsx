"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Types ---

interface TrailStar {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number; // 0 to 1, starts at 1 and fades out
    maxLife: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
}

interface BackgroundParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    phase: number;
}

// --- Configuration Constants ---

const BG_PARTICLE_DENSITY = 0.0003; // Ambient background stars
const TRAIL_SPAWN_RATE = 0.5; // Stars spawned per frame when mouse moves
const STAR_LIFE_DURATION = 100; // Frames a star lasts before fading out
const TRAIL_SPREAD = 30; // Random spread around mouse position

// --- Helper Functions ---

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Draw a star shape
const drawStar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rotation: number,
    opacity: number
) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();

    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / spikes) * i;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.restore();
};

interface StarTrailCanvasProps {
    enableTrail?: boolean;
}

export const StarTrailCanvas: React.FC<StarTrailCanvasProps> = ({ enableTrail = true }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [, setDebugInfo] = useState({ stars: 0, fps: 0 });

    // Mutable state refs to avoid re-renders during animation loop
    const trailStarsRef = useRef<TrailStar[]>([]);
    const backgroundParticlesRef = useRef<BackgroundParticle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
    const frameIdRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    // Initialize Background Particles
    const initParticles = useCallback((width: number, height: number) => {
        const bgCount = Math.floor(width * height * BG_PARTICLE_DENSITY);
        const newBgParticles: BackgroundParticle[] = [];

        for (let i = 0; i < bgCount; i++) {
            newBgParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                size: randomRange(0.5, 1.5),
                alpha: randomRange(0.1, 0.3),
                phase: Math.random() * Math.PI * 2
            });
        }
        backgroundParticlesRef.current = newBgParticles;
    }, []);

    const animate = useCallback((time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate Delta Time
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;
        if (delta > 0) {
            setDebugInfo(prev => ({ ...prev, fps: Math.round(1000 / delta) }));
        }

        // Clear Canvas completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Background Effects ---

        // Subtle radial glow
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const pulseOpacity = Math.sin(time * 0.0008) * 0.025 + 0.065;

        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(canvas.width, canvas.height) * 0.6
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, ${pulseOpacity})`); // Purple glow
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background Particles
        const bgParticles = backgroundParticlesRef.current;
        ctx.fillStyle = "#ffffff";

        for (let i = 0; i < bgParticles.length; i++) {
            const p = bgParticles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around screen
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Twinkle effect
            const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
            const currentAlpha = p.alpha * (0.3 + 0.7 * twinkle);

            ctx.globalAlpha = currentAlpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // --- Trail Stars ---

        if (enableTrail) {
            const mouse = mouseRef.current;
            const trailStars = trailStarsRef.current;

            // Check if mouse moved
            const mouseDist = Math.sqrt(
                Math.pow(mouse.x - mouse.prevX, 2) + Math.pow(mouse.y - mouse.prevY, 2)
            );

            // Spawn new stars along the trail (with probability to keep it sparse)
            if (mouseDist > 2 && Math.random() < TRAIL_SPAWN_RATE) {
                trailStars.push({
                    x: mouse.x + randomRange(-TRAIL_SPREAD, TRAIL_SPREAD),
                    y: mouse.y + randomRange(-TRAIL_SPREAD, TRAIL_SPREAD),
                    vx: randomRange(-0.5, 0.5),
                    vy: randomRange(-0.5, 0.5),
                    size: randomRange(3, 8),
                    life: 1,
                    maxLife: STAR_LIFE_DURATION + randomRange(-20, 20),
                    color: '#FFFFFF',  // White only
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: randomRange(-0.05, 0.05)
                });
            }

            // Update mouse position
            mouse.prevX = mouse.x;
            mouse.prevY = mouse.y;

            // Update and draw trail stars
            for (let i = trailStars.length - 1; i >= 0; i--) {
                const star = trailStars[i];

                // Update position
                star.x += star.vx;
                star.y += star.vy;
                star.rotation += star.rotationSpeed;

                // Apply slight upward drift
                star.vy -= 0.02;

                // Decay life
                star.life -= 1 / star.maxLife;

                // Remove dead stars
                if (star.life <= 0) {
                    trailStars.splice(i, 1);
                    continue;
                }

                // Calculate opacity with easing (fade out smoothly)
                const fadeProgress = star.life;
                const opacity = Math.pow(fadeProgress, 2); // Quadratic easing

                // Draw star
                ctx.fillStyle = star.color;
                drawStar(ctx, star.x, star.y, star.size, star.rotation, opacity);

                // Add glow effect
                const glowSize = star.size * 2;
                const glowGradient = ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, glowSize
                );
                glowGradient.addColorStop(0, star.color.replace(')', `, ${opacity * 0.6})`).replace('#', 'rgba(').replace(/^rgba\(([^,]+)/, (m, hex) => {
                    const r = parseInt(hex.slice(0, 2), 16);
                    const g = parseInt(hex.slice(2, 4), 16);
                    const b = parseInt(hex.slice(4, 6), 16);
                    return `rgba(${r}, ${g}, ${b}`;
                }));
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = glowGradient;
                ctx.globalAlpha = opacity * 0.5;
                ctx.beginPath();
                ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
            setDebugInfo(prev => ({ ...prev, stars: trailStars.length }));
        }

        frameIdRef.current = requestAnimationFrame(animate);
    }, [enableTrail]);

    // Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;

                canvasRef.current.width = width * dpr;
                canvasRef.current.height = height * dpr;

                canvasRef.current.style.width = `${width}px`;
                canvasRef.current.style.height = `${height}px`;

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);

                initParticles(width, height);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [initParticles]);

    // Start Animation
    useEffect(() => {
        frameIdRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameIdRef.current);
    }, [animate]);

    // Mouse Handlers
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none"
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ pointerEvents: 'auto' }}
            />
        </div>
    );
};
