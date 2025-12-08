"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
    x: number
    y: number
    duration: number
    delay: number
    scale: number
}

export default function BackgroundAscii() {
    const [elements, setElements] = useState<FloatingElement[]>([])

    useEffect(() => {
        // Generate random elements on the client side to avoid hydration mismatch
        const count = 15 // Number of floating elements
        const newElements = Array.from({ length: count }).map((_, i) => ({
            id: i,
            text: ASCII_ART[Math.floor(Math.random() * ASCII_ART.length)],
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            duration: 15 + Math.random() * 20, // 15-35s duration
            delay: Math.random() * -20, // Start at different times
            scale: 0.5 + Math.random() * 1, // 0.5-1.5 scale
        }))
        setElements(newElements)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className="absolute text-slate-500/10 font-mono font-bold whitespace-nowrap select-none"
                    initial={{
                        x: `${el.x}vw`,
                        y: "110vh", // Start below the screen
                        opacity: 0,
                        scale: el.scale,
                    }}
                    animate={{
                        y: "-10vh", // Float to top
                        opacity: [0, 1, 1, 0], // Fade in, stay, fade out
                    }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: el.delay,
                    }}
                    style={{
                        fontSize: "2rem",
                    }}
                >
                    {el.text}
                </motion.div>
            ))}
        </div>
    )
}
