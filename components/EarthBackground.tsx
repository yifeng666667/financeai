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
                theta: 0.3,
                dark: 1, // Base dark mode
                diffuse: 1.0, // Soft diffuse lighting
                mapSamples: 12000, // Dense but abstract (looks like terrain/clouds)
                mapBrightness: 1.2, // Very subtle map, looking like a gas giant or abstract planet
                baseColor: [0.02, 0.04, 0.1], // Deep cosmic blue base
                markerColor: [0, 0, 0], // No city markers, it's an alien planet
                glowColor: [0.2, 0.5, 1.0], // Stunning neon cyan/blue atmosphere glow
                markers: [],
                onRender: (state) => {
                    state.phi = phi;
                    phi += 0.001; // Unbelievably slow, majestic rotation
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0 bg-[#02050e]">
            {/* Embedded styles for Comets and Custom Animations */}
            <style>{`
                @keyframes comet {
                    0% { transform: translate(50vw, -50vh) rotate(45deg); opacity: 0; }
                    5% { opacity: 1; }
                    25% { transform: translate(-50vw, 50vh) rotate(45deg); opacity: 0; }
                    100% { opacity: 0; }
                }
                .comet {
                    position: absolute;
                    width: 2px;
                    height: 150px;
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(120, 200, 255, 0.8) 60%, rgba(255,255,255,1) 100%);
                    border-radius: 50%;
                    filter: drop-shadow(0 0 10px rgba(120, 200, 255, 0.8));
                    z-index: 10;
                }
                .comet-1 { top: 10%; left: 40%; animation: comet 8s infinite linear; animation-delay: 0s; }
                .comet-2 { top: 20%; left: 80%; animation: comet 12s infinite linear; animation-delay: 4s; }
                .comet-3 { top: 30%; left: 110%; animation: comet 10s infinite linear; animation-delay: 7s; }
                .comet-4 { top: 0%; left: 60%; animation: comet 15s infinite linear; animation-delay: 2s; }
                .comet-5 { top: 50%; left: 120%; animation: comet 14s infinite linear; animation-delay: 9s; }
            `}</style>

            {/* Comets Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="comet comet-1" />
                <div className="comet comet-2" />
                <div className="comet comet-3" />
                <div className="comet comet-4" />
                <div className="comet comet-5" />
            </div>

            {/* Deep Space Starfield Background */}
            <div
                className="absolute inset-0 z-0 opacity-50 mix-blend-screen"
                style={{
                    backgroundImage: 'radial-gradient(1.5px 1.5px at 15px 15px, #ffffff 100%, transparent), radial-gradient(1.5px 1.5px at 50px 30px, rgba(255,255,255,0.8) 100%, transparent), radial-gradient(2px 2px at 90px 80px, rgba(255,255,255,0.5) 100%, transparent), radial-gradient(1px 1px at 130px 120px, rgba(255,255,255,0.9) 100%, transparent)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '150px 150px, 200px 200px, 250px 250px, 300px 300px'
                }}
            />

            {/* The Cosmic Planet Canvas Container */}
            <div className="relative w-full max-w-[1200px] aspect-square flex items-center justify-center mix-blend-screen opacity-100 pb-20 z-20">

                {/* Intense Edge Rim Light / Horizon Glow - Slowly Pulsing */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_120px_rgba(59,130,246,0.3),inset_0_-30px_80px_rgba(59,130,246,0.8),inset_0__10px_20px_rgba(255,255,255,0.8)] pointer-events-none z-30 scale-[0.83] animate-pulse" style={{ animationDuration: '4s' }} />

                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain filter saturate-110"
                    style={{ width: "100%", height: "100%", aspectRatio: "1/1" }}
                />
            </div>

            {/* Dark vignette to focus the center and blend borders */}
            <div className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,#0a0e17_90%)] opacity-100" />
            {/* Premium dark vignette around the edges to blend seamlessly into the #0a0e17 background */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#0a0e17_85%)] opacity-100" />

            {/* Subtle luxury noise/dust overlay for texture */}
            <div
                className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                    backgroundRepeat: 'repeat'
                }}
            />
        </div>
    );
}
