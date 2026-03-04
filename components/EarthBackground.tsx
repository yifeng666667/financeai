"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export default function EarthBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 1000 * 2,
            height: 1000 * 2,
            phi: 0,
            theta: 0.3, // Tilt the earth
            dark: 1, // Deep dark mode
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 3.5, // Bright dots
            baseColor: [0, 0, 0], // True black base
            markerColor: [0.14, 0.83, 0.93], // Cyan markers
            glowColor: [0.039, 0.35, 0.8], // Deep blue glow
            markers: [
                // Major financial hubs
                { location: [40.7128, -74.0060], size: 0.05 }, // NY
                { location: [51.5074, -0.1278], size: 0.04 }, // London
                { location: [35.6762, 139.6503], size: 0.06 }, // Tokyo
                { location: [22.3193, 114.1694], size: 0.05 }, // Hong Kong
                { location: [1.3521, 103.8198], size: 0.04 }, // Singapore
                { location: [31.2304, 121.4737], size: 0.07 }, // Shanghai
            ],
            onRender: (state) => {
                // Called on every animation frame.
                state.phi = phi;
                phi += 0.002; // Rotation speed
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden bg-[#0a0e17]">
            {/* Radial Gradient to blend the globe into the deep black space */}
            <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0e17_70%)] opacity-90" />

            {/* Subtle Starfield / Dust grid */}
            <div
                className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0,0,0,0))',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px'
                }}
            />

            {/* The Globe Canvas Container */}
            <div className="relative w-full max-w-[1200px] aspect-square opacity-50 translate-y-[20%] lg:translate-y-[10%] mix-blend-screen">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ width: 1000, height: 1000, maxWidth: "100%", aspectRatio: "1/1" }}
                />
            </div>
        </div>
    );
}
