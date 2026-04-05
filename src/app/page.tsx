import Link from "next/link";
import {
  Calendar,
  FileText,
  Image,
  Type,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react";
import DashboardPreview from "@/components/landing/dashboard-preview";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg selection:bg-primary/20 relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 bg-bg-card/90 backdrop-blur-sm border border-border rounded-[20px] px-3 sm:px-8 py-3 flex items-center justify-between max-w-[1400px] mx-auto transition-all">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <span className="hidden sm:block text-xl font-bold text-text">ParseCal</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/login"
            className="text-text-muted hover:text-text font-bold text-xs sm:text-sm px-2 sm:px-4 py-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-cta hover:bg-cta-hover text-white font-bold text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-cta/20 active:scale-95 whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Schedule Scanner
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-text leading-tight mb-6">
          Turn any schedule into{" "}
          <span className="text-primary">calendar events</span>
          <br />
          in seconds
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a PDF, snap a photo of a timetable, or paste text — ParseCal
          extracts every event and pushes them to your Google or Outlook
          calendar. No more manual entry.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold px-8 py-3.5 rounded-[10px] text-lg cursor-pointer"
          >
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 bg-bg-card border border-border hover:border-primary text-text font-medium px-8 py-3.5 rounded-[10px] text-lg cursor-pointer"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-cta/20 to-primary/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-bg/50 backdrop-blur-3xl border border-white/20 p-2 md:p-4 rounded-[28px] overflow-hidden shadow-2xl">
             <div className="bg-bg rounded-[20px] p-2 md:p-6 min-h-[400px] flex items-center justify-center overflow-hidden">
                <DashboardPreview />
             </div>
          </div>
        </div>
      </section>

      {/* Input Types - Dossier Style */}
      <section className="pb-36 px-6 max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Image,
              title: "Photos & Notes",
              desc: "Snap a photo of your schedule or whiteboard. Our AI handles the handwriting.",
              label: "IMAGE",
              color: "text-blue-500",
              bgColor: "bg-blue-500/10",
            },
            {
              icon: FileText,
              title: "Files & Documents",
              desc: "Upload PDFs, syllabi, and multi-page itineraries. We extract every event.",
              label: "DOCS",
              color: "text-purple-500",
              bgColor: "bg-purple-500/10",
            },
            {
              icon: Type,
              title: "Copied Text",
              desc: "Paste text directly from emails, group chats, or any messy source.",
              label: "TEXT",
              color: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group relative bg-bg-card border border-border rounded-[24px] p-8 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border border-current ${item.color} uppercase tracking-tighter`}>
                  {item.label}
                </span>
              </div>
              <div className={`w-14 h-14 ${item.bgColor} rounded-[18px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-text mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Operational Protocol */}
      <section id="how-it-works" className="pb-36 px-6 max-w-[1400px] mx-auto border-t border-border/50 pt-32 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-text tracking-tight mb-4">
            Upload once. Done in seconds.
          </h2>
          <p className="text-text-muted font-medium max-w-lg mx-auto">
            ParseCal automates the entire process of scanning and creating events.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-primary/0 via-border to-primary/0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {[
              {
                step: "1",
                phase: "READING",
                title: "Upload Schedule",
                desc: "Drop any file or paste any text. Our AI reads the details instantly.",
                icon: Zap,
                color: "text-primary",
                borderColor: "border-primary/20",
                shadow: "shadow-primary/5",
              },
              {
                step: "2",
                phase: "REVIEWING",
                title: "Smart Extraction",
                desc: "We find every date and time. Review the events and make any quick edits.",
                icon: Sparkles,
                color: "text-warning",
                borderColor: "border-warning/20",
                shadow: "shadow-warning/5",
              },
              {
                step: "3",
                phase: "SYNCING",
                title: "Push to Calendar",
                desc: "One click sends everything to your Google or Outlook calendar.",
                icon: CheckCircle2,
                color: "text-success",
                borderColor: "border-success/20",
                shadow: "shadow-success/5",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center group">
                <div className={`relative w-24 h-24 bg-bg-card border-2 ${item.borderColor} rounded-[32px] flex items-center justify-center mb-8 ${item.shadow} shadow-xl group-hover:-rotate-3 transition-all duration-500`}>
                   <div className="absolute -top-3 -right-3 bg-white border border-border px-2 py-1 rounded-lg text-[10px] font-black text-text shadow-sm">
                      {item.step}
                   </div>
                   <item.icon className={`w-10 h-10 ${item.color}`} />
                </div>
                <div className={`text-[10px] font-black ${item.color} uppercase tracking-[0.25em] mb-3 flex items-center gap-2`}>
                   <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                   {item.phase}
                </div>
                <h3 className="text-2xl font-bold text-text mb-4 tracking-tight group-hover:translate-x-1 transition-transform">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed font-semibold max-w-[280px]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Matrix */}
      <section className="pb-36 px-6 max-w-[1400px] mx-auto border-t border-border/50 pt-32 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-center md:text-left">
           <div>
             <h2 className="text-3xl font-extrabold text-text tracking-tight mb-2">
               Built for messy reality.
             </h2>
             <p className="text-text-muted font-medium">Everything you need to stop typing events manually.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Handwriting AI", d: "ML-tuned OCR for messy ink", i: Type },
            { t: "The Best Models", d: "GPT-4o, Claude 3.5, Gemini Pro", i: Sparkles },
            { t: "Cloud Sync", d: "Google & Outlook calendar sync", i: Calendar },
            { t: "Confidence Score", d: "Accuracy metrics for every event", i: CheckCircle2 },
            { t: "Easy Editing", d: "Fix anything before pushing live", i: ArrowRight },
            { t: "ICS Export", d: "Export for any calendar app", i: FileText },
            { t: "Custom API Keys", d: "Use your own AI provider keys", i: Zap },
            { t: "Smart Schedules", d: "Full support for repeating events", i: Calendar },
          ].map((feature) => (
            <div
              key={feature.t}
              className="group flex flex-col gap-3 bg-bg-card border border-border rounded-[18px] p-5 hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-bg border border-border rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                <feature.i className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text mb-1 tracking-tight">{feature.t}</h4>
                <p className="text-[10px] text-text-muted font-bold leading-relaxed">{feature.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA - Secure Terminal Style */}
      <section className="pb-40 px-6 max-w-5xl mx-auto relative z-10">
        <div className="relative overflow-hidden bg-bg-card border border-border rounded-[40px] p-12 md:p-20 text-center shadow-2xl">
          {/* Background Decorative Element */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cta/0 via-cta/30 to-cta/0" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-cta/10 rounded-[22px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-cta/5">
              <Zap className="w-8 h-8 text-cta" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-text tracking-tighter mb-6 leading-tight">
              Stop typing your<br />
              <span className="text-primary italic">schedule manually.</span>
            </h2>
            
            <p className="text-lg text-text-muted mb-12 font-medium max-w-xl mx-auto">
              Start in seconds. 20 free parses per month. <br className="hidden md:block" />
              No credit card. No complicated setup. Just simplicity.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-3 bg-cta hover:bg-cta-hover text-white font-black px-10 py-5 rounded-[18px] text-xl transition-all shadow-xl shadow-cta/20 active:scale-95"
              >
                Start for Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-6 opacity-40">
                 <div className="flex flex-col text-[10px] font-black text-text uppercase tracking-widest leading-none gap-1">
                    <span>12k+ sessions</span>
                    <span className="text-text-muted italic">Processed this month</span>
                 </div>
                 <div className="w-[1px] h-6 bg-border" />
                 <div className="flex flex-col text-[10px] font-black text-text uppercase tracking-widest leading-none gap-1">
                    <span>99.8% precision</span>
                    <span className="text-text-muted italic">Extraction accuracy</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Premium Multi-column */}
      <footer className="py-24 px-6 border-t border-border bg-bg-card relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-16">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="text-xl font-black text-text tracking-tight">ParseCal</span>
              </Link>
              <p className="text-sm text-text-muted font-medium max-w-[320px] mb-8 leading-relaxed">
                Automatically scan any schedule and create calendar events. 
                Turn messy notes into organized productivity.
              </p>
            </div>

            {/* Live History & System Ops */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <div className="bg-bg border border-border rounded-2xl p-4 overflow-hidden relative group">
                {/* Visual Flow */}
                <div className="flex items-center justify-between gap-4 mb-4 border-b border-border pb-4">
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center">
                         <FileText className="w-4 h-4 text-text-muted" />
                      </div>
                      <span className="text-[8px] font-black text-text-muted uppercase">Scan</span>
                   </div>
                   <div className="flex-1 h-[1px] bg-gradient-to-r from-border via-primary/50 to-border relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-bg border border-primary flex items-center justify-center">
                         <Sparkles className="w-2 h-2 text-primary" />
                      </div>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center">
                         <Calendar className="w-4 h-4 text-text-muted" />
                      </div>
                      <span className="text-[8px] font-black text-text-muted uppercase">Sync</span>
                   </div>
                </div>

                {/* Operations Stream */}
                <div className="space-y-2 font-mono text-[9px] leading-tight">
                   {[
                     { op: "READ", src: "agenda_2025.pdf", out: "14 Events", conf: "98%" },
                     { op: "REVIEW", src: "notes_snippet", out: "3 Events", conf: "99%" },
                     { op: "PUSH", src: "photo_33.jpg", out: "8 Events", conf: "97%" },
                   ].map((log, i) => (
                     <div key={i} className="flex items-center justify-between text-text-muted group-hover:text-text transition-colors">
                        <div className="flex items-center gap-2">
                           <span className="text-primary font-bold">[{log.op}]</span>
                           <span className="opacity-50 truncate max-w-[80px]">{log.src}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span>{log.out}</span>
                           <span className="text-success font-bold">{log.conf}</span>
                        </div>
                     </div>
                   ))}
                </div>
                
                {/* Decorative Terminal Scanline */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Company Column */}
            <div className="col-span-1">
              <h4 className="text-[11px] font-black text-text uppercase tracking-[0.2em] mb-8">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-sm text-text-muted font-semibold hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-text-muted font-semibold hover:text-primary transition-colors">Terms of Use</Link></li>
                <li><Link href="#" className="text-sm text-text-muted font-semibold hover:text-primary transition-colors">Open Source</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 gap-4">
            <p className="text-[11px] font-black text-text-light uppercase tracking-widest leading-relaxed">
              © {new Date().getFullYear()} ParseCal. Engineered for clarity.
            </p>
            <a 
              href="https://github.com/nodesagar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-white/5 transition-all active:scale-95"
            >
              <span className="text-[11px] font-bold text-text-light uppercase tracking-tight">
                Built with <span className="group-hover:animate-pulse">❤️</span> and ☕ by
              </span>
              <span className="text-[11px] font-black text-text uppercase tracking-widest border-b-2 border-primary/20 group-hover:border-primary transition-all">
                Sagar
              </span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
