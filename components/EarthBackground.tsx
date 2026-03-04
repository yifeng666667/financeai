"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export default function EarthBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        let globe: any;

        if (!canvasRef.current) return;

        try {
            globe = createGlobe(canvasRef.current, {
                devicePixelRatio: 2,
                width: 1200 * 2,
                height: 1200 * 2,
                phi: 0,
                theta: 0.35, // Slightly tilted for better 3D depth
                dark: 0.9, // Higher contrast between light and dark sides
                diffuse: 2.0, // Stronger diffuse light for volume
                mapSamples: 16000, // Higher detail
                mapBrightness: 3.0, // Brighter surface texture
                baseColor: [0.01, 0.05, 0.15], // Radiant cosmic blue/indigo
                markerColor: [0, 0, 0],
                glowColor: [0.1, 0.4, 1.0], // Core atmos glow
                markers: [],
                onRender: (state) => {
                    state.phi = phi;
                    phi += 0.0015; // Slightly faster for more visible rotation
                },
            });
        } catch (error) {
            console.error("Failed to initialize cobe globe:", error);
        }

        return () => {
            if (globe) {
                globe.destroy();
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0 bg-[#01040a]">
            {/* Embedded styles for Enhanced Animations */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes star-drift {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-10px, -5px); }
                }
                @keyframes pulse-intense {
                    0%, 100% { transform: scale(1.0); opacity: 0.5; filter: blur(80px); }
                    50% { transform: scale(1.15); opacity: 0.8; filter: blur(100px); }
                }
                .star {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                }
            `}</style>

            {/* Dynamic Starfield */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Twinkling Small Stars */}
                <div className="absolute inset-0 opacity-40" style={{ animation: 'star-drift 60s infinite alternate linear' }}>
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={`star-twinkle-${i}`}
                            className="star"
                            style={{
                                width: Math.random() * 2 + 'px',
                                height: Math.random() * 2 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                opacity: Math.random(),
                                animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    ))}
                </div>

                {/* Distant Static Starfield */}
                <div
                    className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
                    style={{
                        backgroundImage: 'radial-gradient(1px 1px at 15px 15px, #ffffff 100%, transparent), radial-gradient(1.5px 1.5px at 150px 130px, rgba(255,255,255,0.8) 100%, transparent)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '200px 200px, 300px 300px'
                    }}
                />
            </div>

            {/* Layered Multi-Atmospheric Glows */}

            {/* 1. Deep Back-Glow (Wide Ambient Aura) */}
            <div className="absolute z-10 w-[900px] h-[900px] rounded-full mix-blend-screen translate-y-[5%] bg-[radial-gradient(circle_at_center,rgba(0,100,255,0.3)_0%,rgba(0,50,150,0.1)_50%,transparent_80%)] animate-pulse" style={{ animationDuration: '6s' }} />

            {/* 2. Intense Pulse Halo (Visible Atmospheric Expansion) */}
            <div className="absolute z-10 w-[750px] h-[750px] rounded-full mix-blend-screen translate-y-[5%] bg-[radial-gradient(circle_at_center,rgba(100,200,255,0.4)_0%,rgba(50,150,255,0.1)_40%,transparent_65%)]"
                style={{ animation: 'pulse-intense 5s infinite ease-in-out' }} />

            {/* The Cosmic Planet Canvas Container */}
            <div className="relative w-full max-w-[1200px] aspect-square flex items-center justify-center mix-blend-screen opacity-100 pb-20 z-20">

                {/* 3. Razor-Sharp Rim Light / Horizon Glow */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_100px_rgba(59,130,246,0.5),inset_0_-40px_100px_rgba(59,130,246,0.9),inset_0__15px_30px_rgba(255,255,255,0.9)] pointer-events-none z-30 scale-[0.835]" />

                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain filter contrast-125 saturate-125 brightness-110"
                    style={{ width: "100%", height: "100%", aspectRatio: "1/1" }}
                />
            </div>

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_35%,#01040a_95%)] opacity-100" />

            {/* Texture/Noise Overlay */}
            <div
                className="absolute inset-0 z-10 pointer-events-none opacity-[0.04] mix-blend-overlay"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                    backgroundRepeat: 'repeat'
                }}
            />
        </div>
    );
}
