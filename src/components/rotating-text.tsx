"use client"

import { useEffect, useState } from "react"

const words = ["Money", "Lobbyists", "Politicians", "Cities"]

export function RotatingText() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length)
        }, 2000) // Rotate every 2 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="inline-block relative text-left align-bottom h-[1.1em] overflow-hidden">
            <div
                className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateY(-${index * 1.1}em)` }}
            >
                {words.map((word) => (
                    <span
                        key={word}
                        className="block h-[1.1em] font-display text-[#85bb65] drop-shadow-md leading-[1.1em]"
                    >
                        {word}
                    </span>
                ))}
            </div>
        </div>
    )
}
