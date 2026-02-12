"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Sparkles, AudioWaveform, Zap, Sliders, Radio, Orbit, Code, Network, ChevronDown, Star } from 'lucide-react';

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

const BG_PARTICLE_DENSITY = 0.0003; // Ambient background stars (increased for more stars)
const TRAIL_SPAWN_RATE = 0.5; // Stars spawned per frame when mouse moves (very low for sparse trail)
const STAR_LIFE_DURATION = 100; // Frames a star lasts before fading out
const TRAIL_SPREAD = 30; // Random spread around mouse position (wide spread)

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

// --- Components ---

const StarTrailCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [debugInfo, setDebugInfo] = useState({ stars: 0, fps: 0 });

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

    // Animation Loop
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

        frameIdRef.current = requestAnimationFrame(animate);
    }, []);

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

const Navigation: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-black/60 backdrop-blur-xl border-white/20'
                : 'bg-white/5 backdrop-blur-sm border-white/10'
                } border rounded-full px-6 py-3`}
        >
            <div className="flex items-center gap-8">
                {/* Logo */}
                <a href="#" className="flex items-center cursor-pointer">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="1.5" opacity="0.3" />
                        <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="1.5" opacity="0.5" />
                        <circle cx="16" cy="16" r="7" stroke="white" strokeWidth="1.5" opacity="0.7" />
                        <circle cx="16" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity="1" />
                        <text x="16" y="20" fontSize="12" fontFamily="Arial, sans-serif" fill="white" textAnchor="middle" fontWeight="bold">e</text>
                    </svg>
                </a>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-6">
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-white/70 hover:text-white transition-colors text-sm font-medium cursor-pointer"
                    >
                        Features
                    </a>
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-white/70 hover:text-white transition-colors text-sm font-medium cursor-pointer"
                    >
                        Pricing
                    </a>
                </div>

                {/* CTA Button */}
                <button className="ml-2 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-medium transition-all cursor-pointer">
                    Sign In
                </button>
            </div>
        </nav>
    )
}

const HeroContent: React.FC = () => {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                <div className="inline-block animate-fade-in-up">
                    <span className="py-1 px-3 border border-white/20 rounded-full text-xs font-mono text-white/60 tracking-widest uppercase bg-white/5 backdrop-blur-sm">
                        Beyond Stereo
                    </span>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference">
                    Echo
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 font-light leading-relaxed">
                    The world's most advanced spatial audio engine for the web. Seamlessly integrate high-performance 3D soundscapes into your applications with zero latency and native TypeScript support.
                </p>

                <div className="pt-8 pointer-events-auto">
                    <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold tracking-wide overflow-hidden transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                        <span className="relative z-10">Start Composing</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out opacity-10"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};



// --- Bento Grid Section ---

const BentoGrid: React.FC = () => {
    const features = [
        {
            title: "Spatial Mapping",
            description: "Position sound nodes in a 360° field with our powerful spatial API.",
            icon: Radio,
            size: "large"
        },
        {
            title: "Acoustic Physics",
            description: "Audio shifts pitch and resonance based on environmental velocity.",
            icon: Orbit,
            size: "small"
        },
        {
            title: "Sonic Profiles",
            description: "Granular control over frequency, oscillation, and dampening.",
            icon: Sliders,
            size: "small"
        },
        {
            title: "Zero Latency",
            description: "Built on Web Audio API for instantaneous feedback on any device.",
            icon: Zap,
            size: "large"
        },
        {
            title: "TypeScript",
            description: "Fully typed for better DX and seamless integration.",
            icon: Code,
            size: "small"
        },
        {
            title: "Open Source",
            description: "Free and open for everyone, powered by the community.",
            icon: Network,
            size: "small"
        }
    ];

    return (
        <section id="features" className="relative z-10 pt-40 pb-32 px-4 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference mb-6">
                        Powerful Features
                    </h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Everything you need to create beautiful, interactive experiences
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`group relative p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
                                }`}
                        >
                            <feature.icon className="w-12 h-12 mb-4 text-white" strokeWidth={1} />
                            <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-white/60 leading-relaxed">{feature.description}</p>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-3xl transition-all duration-500"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Pricing Section ---

const PricingSection: React.FC = () => {
    const plans = [
        {
            name: "Composer",
            price: "$0",
            description: "Perfect for trying out",
            features: [
                "Basic spatial audio",
                "Up to 8 sound nodes",
                "Community support",
                "MIT License"
            ],
            highlighted: false
        },
        {
            name: "Studio",
            price: "$29",
            period: "/month",
            description: "For serious creators",
            features: [
                "Advanced acoustics library",
                "Unlimited sound nodes",
                "Priority support",
                "Commercial license",
                "Custom integrations"
            ],
            highlighted: true
        },
        {
            name: "Galaxy",
            price: "Contact Sales",
            description: "For large teams",
            features: [
                "Everything in Studio",
                "Dedicated support",
                "Custom development",
                "SLA guarantee",
                "Training & onboarding"
            ],
            highlighted: false
        }
    ];

    return (
        <section id="pricing" className="relative z-10 pt-40 pb-32 px-4 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference mb-6 pb-2">
                        Simple Pricing
                    </h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Choose the plan that works best for you
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-8 rounded-3xl transition-all duration-500 hover:scale-105 cursor-pointer flex flex-col justify-between h-full ${plan.highlighted
                                ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.4)]'
                                : 'bg-white/5 border border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div>
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-bold text-white">
                                        POPULAR
                                    </div>
                                )}

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-white/60 mb-6">{plan.description}</p>

                                <div className="mb-8">
                                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                                    {plan.period && <span className="text-white/60">{plan.period}</span>}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-white/80">
                                            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                className={`w-full py-4 rounded-full font-bold transition-all cursor-pointer mt-auto ${plan.highlighted
                                    ? 'bg-white text-black hover:bg-white/90'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {plan.price === 'Contact Sales' ? 'Contact Sales' : 'Get Started'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Performance Metrics Section ---

const PerformanceMetrics: React.FC = () => {
    const metrics = [
        { value: '< 2ms', label: 'Processing Latency' },
        { value: '10k+', label: 'Concurrent Sources' },
        { value: 'Native', label: 'WASM Engine' }
    ];

    return (
        <section className="relative z-10 py-32 px-4 bg-transparent">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    {metrics.map((metric, idx) => (
                        <div key={idx} className="relative">
                            {/* Vertical Divider */}
                            {idx < metrics.length - 1 && (
                                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-24 bg-zinc-800"></div>
                            )}

                            {/* Radial Gradient for center metric */}
                            {idx === 1 && (
                                <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl"></div>
                            )}

                            <div className="relative text-center py-12 px-8">
                                {/* Metric Value */}
                                <div className="relative inline-block mb-4">
                                    <h3 className="text-6xl md:text-7xl font-bold relative animate-pulse-slow bg-gradient-to-b from-white via-cyan-400 via-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient"
                                        style={{
                                            backgroundSize: '100% 200%',
                                            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.2)) drop-shadow(0 0 30px rgba(34, 211, 238, 0.15)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.25))'
                                        }}
                                    >
                                        {metric.value}
                                    </h3>
                                </div>

                                {/* Metric Label */}
                                <p className="text-zinc-500 text-sm uppercase tracking-wider font-medium">
                                    {metric.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS for animations */}
            <style jsx>{`
                @keyframes gradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }

                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.95;
                    }
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};

// --- Spatial vs. Stereo Comparison Section ---

const SpatialComparison: React.FC = () => {
    return (
        <section className="relative z-10 py-32 px-4 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference mb-6 pb-2">
                        Don't just play sound. Place it.
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-0 relative">
                    {/* Vertical Divider */}
                    <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-white/20"></div>

                    {/* Left Side - Traditional Stereo */}
                    <div className="flex flex-col items-center justify-center p-12">
                        <h3 className="text-2xl font-bold text-white/60 mb-8">Traditional Stereo</h3>

                        {/* Flat Waveform */}
                        <svg width="300" height="100" viewBox="0 0 300 100" fill="none">
                            <path d="M0 50 Q75 30, 150 50 T300 50" stroke="white" strokeWidth="2" opacity="0.3" />
                            <line x1="0" y1="50" x2="300" y2="50" stroke="white" strokeWidth="1" opacity="0.2" />
                        </svg>

                        <p className="text-white/40 text-sm mt-6 text-center max-w-xs">
                            Limited to left and right channels
                        </p>
                    </div>

                    {/* Right Side - Echo Spatial */}
                    <div className="flex flex-col items-center justify-center p-12">
                        <h3 className="text-2xl font-bold text-white mb-8">Echo Spatial Engine</h3>

                        {/* 3D Pulsing Aura */}
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            {/* Outer glow */}
                            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

                            {/* Concentric rings */}
                            <svg width="256" height="256" viewBox="0 0 256 256" fill="none" className="absolute">
                                <circle cx="128" cy="128" r="100" stroke="url(#gradient1)" strokeWidth="1" opacity="0.3" className="animate-ping" style={{ animationDuration: '3s' }} />
                                <circle cx="128" cy="128" r="70" stroke="url(#gradient1)" strokeWidth="1" opacity="0.5" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                                <circle cx="128" cy="128" r="40" stroke="url(#gradient1)" strokeWidth="1" opacity="0.7" className="animate-ping" style={{ animationDuration: '2s' }} />
                                <defs>
                                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="50%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Center sphere */}
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-sm"></div>
                        </div>

                        <p className="text-white/60 text-sm mt-6 text-center max-w-xs">
                            Leveraging native HRTF algorithms to deliver 360° immersion through any standard pair of headphones.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Code Playground Section ---

const CodePlayground: React.FC = () => {
    return (
        <section className="relative z-10 py-32 px-4 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference mb-6 pb-2">
                        Simple API. Infinite Depth.
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Code Editor */}
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden transition-all duration-500">
                        {/* VS Code Style Header */}
                        <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <span className="text-white/60 text-sm ml-4">example.ts</span>
                        </div>

                        {/* Code Content */}
                        <div className="p-8 font-mono text-xs overflow-hidden">
                            <pre className="leading-relaxed">
                                <code>
                                    <span className="text-purple-400">import</span> {'{ '}<span className="text-blue-300">Echo</span> {'} '}
                                    <span className="text-purple-400">from</span> <span className="text-green-400">'@echo/sdk'</span>;
                                    {'\n\n'}
                                    <span className="text-purple-400">const</span> <span className="text-white">engine</span> =
                                    <span className="text-purple-400">new</span> <span className="text-blue-300">Echo</span>.<span className="text-yellow-300">Engine</span>();
                                    {'\n\n'}
                                    <span className="text-purple-400">const</span> <span className="text-white">source</span> =
                                    <span className="text-white">engine</span>.<span className="text-yellow-300">createSource</span>({'{'}
                                    {'\n'}    <span className="text-cyan-300">position</span>: [<span className="text-orange-400">10</span>, <span className="text-orange-400">5</span>, <span className="text-orange-400">-2</span>],
                                    {'\n'}    <span className="text-cyan-300">reverb</span>: <span className="text-orange-400">0.8</span>,
                                    {'\n'}    <span className="text-cyan-300">doppler</span>: <span className="text-orange-400">true</span>
                                    {'\n'}  {'}'});
                                    {'\n\n'}
                                    <span className="text-white">source</span>.<span className="text-yellow-300">play</span>(
                                    {'\n'}  <span className="text-green-400">'/assets/ambient_void.mp3'</span>
                                    {'\n'});
                                </code>
                            </pre>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-purple-400">1</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Import the SDK</h3>
                                    <p className="text-white/60">Lightweight and tree-shakeable for optimal bundle size.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-purple-400">2</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Position in 3D Space</h3>
                                    <p className="text-white/60">Define exact coordinates with built-in physics simulation.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-purple-400">3</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Play and Immerse</h3>
                                    <p className="text-white/60">Instant spatial audio with zero configuration.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Integration Ecosystem Section ---

const IntegrationEcosystem: React.FC = () => {
    const integrations = ['React', 'Three.js', 'Next.js', 'WebGL', 'Vite'];

    return (
        <section className="relative z-10 py-32 px-4 bg-transparent">
            <div className="max-w-5xl mx-auto text-center">
                <p className="text-xl text-white/60 mb-12">
                    Fits into your existing workflow.
                </p>

                <div className="flex flex-wrap justify-center items-center gap-12">
                    {integrations.map((name) => (
                        <div key={name} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100">
                            <div className="text-3xl font-bold text-white/80">{name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Final CTA Section ---

const FinalCTA: React.FC = () => {
    return (
        <section className="relative z-10 py-32 px-4 bg-transparent">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference mb-12">
                    The future of sound is spatial.
                </h2>
                <button className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/20 cursor-pointer">
                    Get Started for Free
                </button>
            </div>
        </section>
    );
};

// --- Testimonials Section ---

const TestimonialsSection: React.FC = () => {
    const testimonials = [
        {
            quote: "Echo changed how we think about web audio. The spatial depth is unlike anything else.",
            name: "Sarah Jenkins",
            role: "Lead Developer",
            company: "SoundScape",
            avatar: "SJ"
        },
        {
            quote: "Zero latency and native TypeScript? It's a dream for our VR browser project.",
            name: "Marcus Thorne",
            role: "CTO",
            company: "OrbitVR",
            avatar: "MT"
        },
        {
            quote: "The API is so clean. We migrated our entire audio engine in a weekend.",
            name: "Elena Rossi",
            role: "Senior Engineer",
            company: "Waveline",
            avatar: "ER"
        },
        {
            quote: "Finally, a spatial audio library that doesn't kill performance on mobile devices.",
            name: "David Chen",
            role: "Mobile Architect",
            company: "AppFlux",
            avatar: "DC"
        },
        {
            quote: "The documentation is world-class. Integrated it into our game engine in under an hour.",
            name: "Alex Rivera",
            role: "Game Dev",
            company: "PixelForge",
            avatar: "AR"
        },
        {
            quote: "Echo's acoustic physics engine is terrifyingly realistic. Our users are blown away.",
            name: "Sophie Wu",
            role: "Product Lead",
            company: "Immerse",
            avatar: "SW"
        }
    ];

    return (
        <section className="relative z-10 py-32 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference mb-6">
                        Wall of Love
                    </h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Trusted by the engineers building the next dimension of the web
                    </p>
                </div>
            </div>

            <div className="relative w-full overflow-hidden">
                {/* Scrolling Container */}
                <div className="flex gap-8 animate-scroll hover:pause px-4 py-8">
                    {[...testimonials, ...testimonials].map((t, idx) => (
                        <div
                            key={idx}
                            className="w-[350px] md:w-[400px] flex-shrink-0 group relative p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-purple-500 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] font-bold" />
                                ))}
                            </div>

                            <blockquote className="text-zinc-100 text-lg leading-relaxed mb-8 relative z-10 min-h-[100px]">
                                "{t.quote}"
                            </blockquote>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/50 font-bold text-xs grayscale">
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{t.name}</div>
                                    <div className="text-zinc-500 text-sm">{t.role} @ {t.company}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(calc(-50% - 1rem)); /* -50% width - half of gap */
                    }
                }
                .animate-scroll {
                    display: flex;
                    width: max-content;
                    animation: scroll 60s linear infinite;
                }
                .hover\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

// --- FAQ Section ---

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "What is Spatial Audio?",
            answer: "3D simulation of sound direction, distance, and height."
        },
        {
            question: "Compatibility?",
            answer: "Native hooks for React and Three.js included."
        },
        {
            question: "Hardware?",
            answer: "Works on any standard headphones using HRTF algorithms."
        },
        {
            question: "Performance?",
            answer: "Renders hundreds of sources at 60fps via hardware acceleration."
        }
    ];

    return (
        <section className="relative z-10 py-32 px-4 bg-transparent">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mix-blend-difference mb-12 text-center">
                    Common Questions
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === idx ? 'shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <span className="text-lg font-semibold text-white">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-white/60 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-40' : 'max-h-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 text-white/70">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Footer ---

const Footer: React.FC = () => {
    const footerLinks = {
        Product: ['Features', 'Pricing', 'Documentation', 'API Reference'],
        Company: ['About', 'Blog', 'Careers', 'Contact'],
        Resources: ['Community', 'Support', 'Status', 'Terms'],
        Social: ['Twitter', 'GitHub', 'Discord', 'LinkedIn']
    };

    return (
        <footer className="relative z-10 bg-black border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Logo */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="1.5" opacity="0.3" />
                                <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="1.5" opacity="0.5" />
                                <circle cx="16" cy="16" r="7" stroke="white" strokeWidth="1.5" opacity="0.7" />
                                <circle cx="16" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity="1" />
                                <text x="16" y="20" fontSize="12" fontFamily="Arial, sans-serif" fill="white" textAnchor="middle" fontWeight="bold">e</text>
                            </svg>
                            <span className="text-white font-medium text-lg">Echo</span>
                        </div>
                        <p className="text-white/40 text-sm">
                            Engineering the architecture of spatial sound for the modern web.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-white font-semibold mb-4">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm cursor-pointer">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-white/40 text-sm">
                            © 2026. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="relative">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-white/60">System Status: <span className="text-green-400">All Nodes Operational</span></span>
                            <span className="text-white/30">|</span>
                            <span className="text-white/60">Latency: <span className="text-purple-400">12ms</span></span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors cursor-pointer">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// --- Main App Component ---

export default function App() {
    return (
        <div className="relative w-full bg-black selection:bg-purple-500 selection:text-white">
            {/* Star Canvas - covers entire page */}
            <StarTrailCanvas />

            {/* Navigation - always visible across entire site */}
            <Navigation />

            {/* Hero Section */}
            <div className="relative h-screen overflow-hidden z-10">
                <HeroContent />
            </div>

            {/* Content Sections */}
            <CodePlayground />
            <IntegrationEcosystem />
            <BentoGrid />
            <PerformanceMetrics />
            <SpatialComparison />
            <PricingSection />
            <TestimonialsSection />
            <FinalCTA />
            <FAQSection />
            <Footer />
        </div>
    );
}
