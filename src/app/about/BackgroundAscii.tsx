"use client"

import { useEffect, useState } from "react"

const ASCII_ART = [
    "[ X ]",
    "VOTE",
    "460",
    "$$$",
    "DATA",
    "{ }",
    "<>",
    "//",
    "###",
]

interface FloatingElement {
    id: number
    text: string
    left: number
    duration: number
    delay: number
    scale: number
}

export default function BackgroundAscii() {
    const [elements, setElements] = useState<FloatingElement[]>([])

    useEffect(() => {
        // Generate random elements on the client side
        const count = 15
        const newElements = Array.from({ length: count }).map((_, i) => ({
            id: i,
            text: ASCII_ART[Math.floor(Math.random() * ASCII_ART.length)],
            left: Math.random() * 100, // percentage
            duration: 15 + Math.random() * 20, // 15-35s duration
            delay: Math.random() * -20, // Start at different times (negative delay to pre-warm)
            scale: 0.5 + Math.random() * 1, // 0.5-1.5 scale
        }))
        setElements(newElements)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <style jsx global>{`
                @keyframes floatUp {
                    0% {
                        transform: translateY(110vh);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-10vh);
                        opacity: 0;
                    }
                }
            `}</style>
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="absolute text-slate-500/10 font-mono font-bold whitespace-nowrap select-none"
                    style={{
                        left: `${el.left}vw`,
                        fontSize: "2rem",
                        transform: `scale(${el.scale})`,
                        animationName: "floatUp",
                        animationDuration: `${el.duration}s`,
                        animationTimingFunction: "linear",
                        animationIterationCount: "infinite",
                        animationDelay: `${el.delay}s`,
                        // Initial state before animation starts (though delay helps)
                        opacity: 0,
                    }}
                >
                    {el.text}
                </div>
            ))}
        </div>
    )
}
