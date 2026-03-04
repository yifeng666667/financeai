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
            {/* Embedded styles for Comets and Enhanced Animations */}
            <style>{`
                @keyframes comet {
                    0% { transform: translate(60vw, -60vh) rotate(45deg); opacity: 0; }
                    10% { opacity: 1; }
                    35% { transform: translate(-60vw, 60vh) rotate(45deg); opacity: 0; }
                    100% { opacity: 0; }
                }
                @keyframes pulse-intense {
                    0%, 100% { transform: scale(1.0); opacity: 0.5; filter: blur(80px); }
                    50% { transform: scale(1.15); opacity: 0.8; filter: blur(100px); }
                }
                @keyframes shimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                    100% { opacity: 0.3; }
                }
                .comet {
                    position: absolute;
                    width: 2px;
                    height: 200px;
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(100, 220, 255, 0.6) 50%, rgba(255,255,255,1) 100%);
                    border-radius: 50%;
                    filter: drop-shadow(0 0 15px rgba(100, 220, 255, 0.9));
                    z-index: 5;
                }
                /* Dense Comet System */
                .comet-1 { top: -10%; left: 30%; animation: comet 10s infinite linear; animation-delay: 0s; }
                .comet-2 { top: 10%; left: 70%; animation: comet 14s infinite linear; animation-delay: 4s; }
                .comet-3 { top: 20%; left: 90%; animation: comet 12s infinite linear; animation-delay: 7s; }
                .comet-4 { top: -5%; left: 10%; animation: comet 18s infinite linear; animation-delay: 2s; }
                .comet-5 { top: 40%; left: 100%; animation: comet 16s infinite linear; animation-delay: 9s; }
                .comet-6 { top: 5%; left: 50%; animation: comet 15s infinite linear; animation-delay: 1s; }
                .comet-7 { top: 15%; left: 20%; animation: comet 20s infinite linear; animation-delay: 5s; }
                .comet-8 { top: 0%; left: 85%; animation: comet 13s infinite linear; animation-delay: 11s; }
            `}</style>

            {/* Comets Layer - High Density */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="comet comet-1" />
                <div className="comet comet-2" />
                <div className="comet comet-3" />
                <div className="comet comet-4" />
                <div className="comet comet-5" />
                <div className="comet comet-6" />
                <div className="comet comet-7" />
                <div className="comet comet-8" />
            </div>

            {/* High Density Starfield */}
            <div
                className="absolute inset-0 z-0 opacity-60 mix-blend-screen"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 15px 15px, #ffffff 100%, transparent), radial-gradient(1.5px 1.5px at 50px 30px, rgba(255,255,255,0.8) 100%, transparent), radial-gradient(2px 2px at 90px 80px, rgba(140, 200, 255, 0.6) 100%, transparent), radial-gradient(1px 1px at 130px 120px, rgba(255,255,255,0.9) 100%, transparent)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '100px 100px, 150px 150px, 200px 200px, 250px 250px'
                }}
            />

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
