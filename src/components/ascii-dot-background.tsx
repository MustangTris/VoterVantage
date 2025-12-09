"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const AsciiDotBackground = () => {
    const pathname = usePathname();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || pathname === "/about" || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        // Animation configuration
        const spacing = 30;
        const dotChar = ".";

        const render = () => {
            if (!ctx) return;
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set basic font styles
            ctx.font = "16px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const cols = Math.ceil(canvas.width / spacing);
            const rows = Math.ceil(canvas.height / spacing);

            // Time scaling for wave speed
            const t = time * 0.002;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const posX = x * spacing + (spacing / 2);
                    const posY = y * spacing + (spacing / 2);

                    // Calculate wave effect
                    // Diagonal wave: (x + y)
                    const waveOffset = (x + y) * 0.2;
                    const waveVal = Math.sin(t + waveOffset);

                    // Map sine wave (-1 to 1) to opacity (0.1 to 1) and color
                    // Normalize waveVal to 0-1 range roughly for easier mapping
                    const normalizedWave = (waveVal + 1) / 2; // 0 to 1

                    // Opacity: 0.1 to 0.8
                    const alpha = 0.1 + (normalizedWave * 0.7);

                    // Color interpolation
                    // Deep Purple (rgb(76, 29, 149)) to Light Purple (rgb(167, 139, 250))
                    // Let's just vary alpha strictly for performance, or toggle fillStyle if needed
                    // Simple approach: Set style
                    // Using distinct colors looks better:
                    // Color 1: #4c1d95 (dark)
                    // Color 2: #a78bfa (light)

                    if (normalizedWave > 0.5) {
                        ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
                    } else {
                        ctx.fillStyle = `rgba(76, 29, 149, ${alpha})`;
                    }

                    // Optional: Scale effect
                    const scale = 0.8 + (normalizedWave * 0.6); // 0.8 to 1.4

                    ctx.save();
                    ctx.translate(posX, posY);
                    ctx.scale(scale, scale);
                    ctx.fillText(dotChar, 0, 0);
                    ctx.restore();
                }
            }

            time += 16; // increment approx 16ms
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mounted, pathname]);

    if (!mounted || pathname === "/about") {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none mix-blend-screen opacity-40"
            style={{ width: '100%', height: '100%' }}
        />
    );
};
