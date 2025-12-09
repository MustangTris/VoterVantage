import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { type?: "single" | "multiple" }
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props} />
))
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border-b", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    // Simplified trigger - using details/summary logic locally or just always open if we don't implement state context
    // Ideally we need context. For now, let's make it a simple disclosure using details/summary wrapper?
    // But AccordionItem wraps it.
    // Let's implement a really dumb one that relies on parent context or just assumes "open".
    // Wait, "details/summary" is the HTML way.
    // But shadcn API separates Trigger and Content.

    // Let's cheat: "Accordion" usually implies state.
    // Since I can't easily implement the full context in one file efficiently without more code,
    // I will use a simple stateful component here?
    // No, standard shadcn uses context.

    // Fallback: A simple styled button. The actual toggle logic won't work without context.
    // BUT, if I wrap Item in a ContextProvider...
    // Let's make a super simple Context implementation.
    return (
        <button
            ref={ref}
            className={cn(
                "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </button>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
            className
        )}
        {...props}
    >
        <div className="pb-4 pt-0">{children}</div>
    </div>
))
AccordionContent.displayName = "AccordionContent"

// Re-implementing simplified Context version
import { createContext, useContext, useState } from "react"

const AccordionContext = createContext<{
    activeItems: string[]
    toggleItem: (value: string) => void
}>({ activeItems: [], toggleItem: () => { } })

const SimpleAccordion = ({ type = "single", className, children, ...props }: any) => {
    const [activeItems, setActiveItems] = useState<string[]>([])

    const toggleItem = (value: string) => {
        if (type === "single") {
            setActiveItems(prev => prev.includes(value) ? [] : [value])
        } else {
            setActiveItems(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value])
        }
    }

    return (
        <AccordionContext.Provider value={{ activeItems, toggleItem }}>
            <div className={cn("space-y-1", className)} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    )
}

const SimpleAccordionItem = ({ value, className, children, ...props }: any) => {
    return (
        <div className={cn("border-b", className)} {...props} data-item-value={value}>
            {children}
        </div>
    )
}

const SimpleAccordionTrigger = ({ className, children, ...props }: any) => {
    const { activeItems, toggleItem } = useContext(AccordionContext)
    // Need to find value from parent? Or context? 
    // Usually Item provides context too.
    // Let's assume user passes value to Trigger? No, shadcn passes to Item.
    // This requires recursive context or React.Children map.

    // HACK: We can't easily get the 'value' from the parent Item without another context.
    // So let's create an ItemContext.
    return (
        <ItemContext.Consumer>
            {({ value }) => (
                <button
                    className={cn("flex flex-1 items-center justify-between py-4 font-medium", className)}
                    onClick={(e) => { e.preventDefault(); toggleItem(value) }}
                    {...props}
                >
                    {children}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", activeItems.includes(value) ? "rotate-180" : "")} />
                </button>
            )}
        </ItemContext.Consumer>
    )
}

const ItemContext = createContext({ value: "" })

const FinalAccordionItem = ({ value, children, className, ...props }: any) => {
    return (
        <ItemContext.Provider value={{ value }}>
            <div className={cn("border-b", className)} {...props}>
                {children}
            </div>
        </ItemContext.Provider>
    )
}

const FinalAccordionContent = ({ className, children, ...props }: any) => {
    const { activeItems } = useContext(AccordionContext)
    const { value } = useContext(ItemContext)
    const isOpen = activeItems.includes(value)

    if (!isOpen) return null

    return (
        <div className={cn("overflow-hidden text-sm pb-4 pt-0", className)} {...props}>
            {children}
        </div>
    )
}

export { SimpleAccordion as Accordion, FinalAccordionItem as AccordionItem, SimpleAccordionTrigger as AccordionTrigger, FinalAccordionContent as AccordionContent }
