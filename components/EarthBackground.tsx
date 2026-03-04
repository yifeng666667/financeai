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
                dark: 1, // Dark mode map
                diffuse: 1.5,
                mapSamples: 24000, // Higher density for premium look
                mapBrightness: 6, // Refined brightness
                // Deep carbon / obsidian base
                baseColor: [0.03, 0.03, 0.03],
                // Luxurious Gold / Amber markers for cities - made extremely bright
                markerColor: [1.0, 0.9, 0.4],
                // Subtle warm bronze / gold atmospheric glow
                glowColor: [0.3, 0.2, 0.05],
                markers: [
                    // Major financial hubs made significantly larger to shine
                    { location: [40.7128, -74.0060], size: 0.15 }, // NY
                    { location: [51.5074, -0.1278], size: 0.12 }, // London
                    { location: [35.6762, 139.6503], size: 0.16 }, // Tokyo
                    { location: [22.3193, 114.1694], size: 0.11 }, // Hong Kong
                    { location: [1.3521, 103.8198], size: 0.10 }, // Singapore
                    { location: [31.2304, 121.4737], size: 0.14 }, // Shanghai
                    { location: [47.3769, 8.5417], size: 0.09 }, // Zurich
                    { location: [48.8566, 2.3522], size: 0.09 }, // Paris
                ],
                onRender: (state) => {
                    state.phi = phi;
                    phi += 0.002; // Elegantly slow rotation
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
            {/* Deep Space Starfield Background */}
            <div
                className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 15px 15px, #ffffff 100%, transparent), radial-gradient(1px 1px at 50px 30px, rgba(255,255,255,0.8) 100%, transparent), radial-gradient(2px 2px at 90px 80px, rgba(255,255,255,0.5) 100%, transparent), radial-gradient(1px 1px at 130px 120px, rgba(255,255,255,0.9) 100%, transparent)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '150px 150px, 200px 200px, 250px 250px, 300px 300px'
                }}
            />

            {/* Tighter, Intense Atmospheric Back-Glow (The "Aura") */}
            <div className="absolute z-10 w-[700px] h-[700px] rounded-full mix-blend-screen translate-y-[5%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.5)_0%,rgba(34,211,238,0.2)_50%,transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />

            {/* The Globe Canvas Container */}
            <div className="relative w-full max-w-[1200px] aspect-square flex items-center justify-center mix-blend-screen opacity-100 pb-20 z-20">
                {/* Intense Edge Rim Light / Horizon Glow - Tighter and brighter */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_80px_rgba(59,130,246,0.3),inset_0_-20px_60px_rgba(59,130,246,0.8),inset_0__10px_20px_rgba(255,255,255,0.5)] pointer-events-none z-30 scale-[0.85]" />

                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain filter contrast-125 saturate-150"
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
