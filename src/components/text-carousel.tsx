"use client"

import { useEffect, useState } from "react"

interface TextCarouselProps {
    words: string[]
    interval?: number
    className?: string
}

export function TextCarousel({ words, interval = 3000, className }: TextCarouselProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % words.length)
        }, interval)

        return () => clearInterval(timer)
    }, [words, interval])

    return (
        <div className={`inline-flex relative overflow-hidden h-[1.2em] w-auto align-bottom ${className}`}>
            <span
                key={index}
                className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in slide-in-from-bottom fade-in duration-500"
            >
                {words[index]}
            </span>
            {/* Invisible spacer to reserve width for the longest word */}
            <span className="invisible px-1">{words.reduce((a, b) => a.length > b.length ? a : b)}</span>
        </div>
    )
}
