import { AnimatedTooltipPreview } from "@/components/ui/demo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex flex-col items-center justify-center gap-12 px-4 max-w-6xl w-full">
        <div className="text-center space-y-6">
          <span className="inline-block py-1 px-3 border border-white/20 rounded-full text-xs font-mono text-white/60 tracking-widest uppercase bg-white/5 backdrop-blur-sm">
            Component Gallery
          </span>
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter">
            Interactive Components
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Explore cutting-edge UI components built with React, TypeScript, and modern web technologies.
          </p>
        </div>

        {/* Component Grid */}
        <div className="grid md:grid-cols-2 gap-8 w-full mt-8">
          {/* Animated Tooltip Card */}
          <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Animated Tooltip</h2>
              <p className="text-slate-400">
                Interactive avatar tooltips with smooth animations and dynamic positioning using Framer Motion.
              </p>
              <div className="flex justify-center py-6">
                <AnimatedTooltipPreview />
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-medium">
                <span>View Component</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Particle Effect Card */}
          <Link href="/particle" className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 block">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Particle Effect Hero</h2>
              <p className="text-slate-400">
                Full-screen interactive particle system with physics simulation and mouse interaction on HTML5 Canvas.
              </p>
              <div className="flex justify-center py-6">
                <div className="w-full h-32 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                  <span className="text-white/40 text-sm font-mono">Click to Experience</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-medium">
                <span>Launch Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-white/40">
          <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Next.js 16</span>
          <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">TypeScript</span>
          <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Tailwind CSS</span>
          <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Framer Motion</span>
          <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">shadcn/ui</span>
        </div>
      </main>
    </div>
  );
}
