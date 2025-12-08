import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight } from "lucide-react"

const cities = [
    { name: "Desert Hot Springs", link: "/dashboard/dhs", active: true },
    { name: "Palm Springs", link: "/dashboard/palm-springs", active: true },
    { name: "Rancho Mirage", link: "/dashboard/rancho-mirage", active: true },
    { name: "Palm Desert", link: "/dashboard/palm-desert", active: true },
    { name: "La Quinta", link: "/dashboard/la-quinta", active: true },
    { name: "Indio", link: "/dashboard/indio", active: true },
    { name: "Coachella", link: "/dashboard/coachella", active: true },
    { name: "Cathedral City", link: "/dashboard/cathedral-city", active: false }, // Assumption based on geography
]

export default function CitiesPage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

            <section className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto text-center z-10 relative">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
                        Find Your <span className="text-gradient">City</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
                        Select a city to explore its local political contribution database.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {cities.map((city) => (
                            <Link href={city.active ? city.link : "#"} key={city.name} className={city.active ? "" : "pointer-events-none opacity-50"}>
                                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all duration-300 group border border-white/5 hover:border-purple-500/30">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${city.active ? "bg-purple-500/20 text-purple-400" : "bg-slate-700/50 text-slate-500"}`}>
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-white text-lg">{city.name}</span>
                                    </div>
                                    {city.active ? (
                                        <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                                    ) : (
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium px-2 py-1 rounded bg-slate-800/50">Coming Soon</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
