import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TextCarousel } from "@/components/text-carousel"

import { getLandingPageStats } from "@/app/actions/stats"

import { ArrowRight, BarChart3, FileSearch, Users } from "lucide-react"

export default async function Home() {
  const stats = await getLandingPageStats()

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">

      {/* Background Ambience - Liquid Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="container mx-auto flex flex-col items-center text-center relative z-10">

          {/* Pill Badge */}
          <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-purple-200 mb-8 border-purple-500/30">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 mr-2 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></span>
            Informed and Free, Together We Shape Democracy
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Follow the <TextCarousel words={["Money", "Politicians", "Cities", "Lobby Groups"]} className="text-purple-400 mx-2" /> in <br className="hidden md:inline" />
            <span className="text-gradient drop-shadow-sm">
              City Politics
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-slate-300 mb-12 leading-relaxed">
            VoterVantage is your only non-profit database of local political campaign finance disclosures.
            We analyze Form 460 filings to show you exactly who is funding whom.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link href="/search">
              <Button size="lg" className="glass-button w-full sm:w-auto h-14 px-10 text-lg rounded-full font-medium tracking-wide">
                Search Database
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg text-slate-300 hover:text-white hover:bg-white/5 rounded-full">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating Glass Panel */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="glass-panel rounded-2xl p-8 md:p-12 border border-white/5 bg-white/5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center divide-x divide-white/5">

              <div className="p-2">
                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-2">
                  {stats.citiesCount}
                </div>
                <div className="text-sm text-slate-400 font-medium tracking-wider uppercase">Cities</div>
              </div>
              <div className="p-2">
                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-2">
                  {stats.candidatesCount}+
                </div>
                <div className="text-sm text-slate-400 font-medium tracking-wider uppercase">Candidates</div>
              </div>
              <div className="p-2">
                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-2">
                  {stats.volunteersCount}%
                </div>
                <div className="text-sm text-slate-400 font-medium tracking-wider uppercase">Volunteer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Powerful Insights</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Turning complex Form 460 filings into crystal clear data visualization.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 group">
              <div className="h-14 w-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <FileSearch className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Detailed Profiles</h3>
              <p className="text-slate-400 leading-relaxed">
                Deep dives into every candidate and lobbying group. See complete financial backer breakdowns on our dashboards.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 group">
              <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Visual Trends</h3>
              <p className="text-slate-400 leading-relaxed">
                Interactive charts identifying funding sources: local residents vs. outside corporate interests.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:bg-white/10 transition-colors duration-300 group">
              <div className="h-14 w-14 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Volunteer Powered</h3>
              <p className="text-slate-400 leading-relaxed">
                Your right to know, our mission to show. Our rapid portal digitizes filings in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
