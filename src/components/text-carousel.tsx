"use client"

import { AnimatePresence, motion } from "framer-motion"
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
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={index}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
            {/* Invisible spacer to reserve width for the longest word if needed, 
          or just let the container size itself. 
          For a carousel, often better to fix width or use the longest word as spacer. 
          Here we'll trust the layout or rely on a different strategy if width jumps are an issue.
          To prevent jumping width, we can render the longest word invisibly.
      */}
            <span className="invisible px-1">{words.reduce((a, b) => a.length > b.length ? a : b)}</span>
        </div>
    )
}
