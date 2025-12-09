"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const AsciiDotBackground = () => {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || pathname === "/about") {
        return null;
    }

    // Grid configuration
    // Adjust spacing to control density/performance
    const spacing = 30;

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none mix-blend-screen opacity-40">
            <div
                className="absolute inset-0 flex flex-wrap content-start"
                style={{
                    // Use a CSS grid or flex with forced spacing
                    gap: `${spacing}px`,
                    padding: `${spacing / 2}px`,
                }}
            >
                <GridDots spacing={spacing} />
            </div>
            <style jsx global>{`
        @keyframes wave {
          0%, 100% {
            opacity: 0.1;
            transform: scale(0.6);
            color: #4c1d95; /* Deep purple */
          }
          50% {
            opacity: 1;
            transform: scale(1.4);
            color: #a78bfa; /* Light purple */
          }
        }
        .ascii-dot {
          display: inline-block;
          width: 1ch;
          height: 1ch;
          font-family: monospace;
          animation: wave 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

const GridDots = ({ spacing }: { spacing: number }) => {
    // Calculate approximate number of dots needed to fill screen
    // Since this is client-side, we can just render enough for a standard large screen
    // or use a resize listener. For simplicity and performance, we'll render a fixed large grid
    // and let overflow hide the rest.

    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const cols = Math.ceil(width / (spacing + 10)); // +10 for gap roughly
    const rows = Math.ceil(height / (spacing + 10));

    const dots = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            dots.push(
                <span
                    key={`${x}-${y}`}
                    className="ascii-dot text-purple-600"
                    style={{
                        animationDelay: `${(x + y) * 0.1}s`,
                        marginRight: `${spacing}px`,
                        marginBottom: `${spacing}px`,
                    }}
                >
                    .
                </span>
            );
        }
    }

    return <>{dots}</>;
};
