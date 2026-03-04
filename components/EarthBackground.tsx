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
                // Luxurious Gold / Amber markers for cities
                markerColor: [1.0, 0.75, 0.2],
                // Subtle warm bronze / gold atmospheric glow
                glowColor: [0.3, 0.2, 0.05],
                markers: [
                    // Major financial hubs with slightly varied sizes for organic feel
                    { location: [40.7128, -74.0060], size: 0.08 }, // NY
                    { location: [51.5074, -0.1278], size: 0.07 }, // London
                    { location: [35.6762, 139.6503], size: 0.09 }, // Tokyo
                    { location: [22.3193, 114.1694], size: 0.07 }, // Hong Kong
                    { location: [1.3521, 103.8198], size: 0.06 }, // Singapore
                    { location: [31.2304, 121.4737], size: 0.08 }, // Shanghai
                    { location: [47.3769, 8.5417], size: 0.05 }, // Zurich
                    { location: [48.8566, 2.3522], size: 0.05 }, // Paris
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

            {/* Huge Atmospheric Back-Glow (The "Aura") */}
            <div className="absolute z-10 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen translate-y-[10%]" />
            <div className="absolute z-10 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[80px] mix-blend-screen translate-y-[10%]" />
            {/* The Globe Canvas Container */}
            <div className="relative w-full max-w-[1200px] aspect-square flex items-center justify-center mix-blend-screen opacity-90 pb-20 z-20">
                {/* Intense Edge Rim Light / Horizon Glow (Overlayting the Globe) */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_-40px_100px_rgba(59,130,246,0.5),inset_0__20px_40px_rgba(34,211,238,0.3)] pointer-events-none z-30 scale-[0.83]" />

                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
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
