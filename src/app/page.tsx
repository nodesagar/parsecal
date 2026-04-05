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
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 bg-bg-card/90 backdrop-blur-sm border border-border rounded-[16px] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Calendar className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-text">ParseCal</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-text-muted hover:text-text cursor-pointer"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-cta hover:bg-cta-hover text-white px-4 py-2 rounded-[10px] cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Calendar Management
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
      <section className="pb-20 px-6 max-w-6xl mx-auto">
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
      <section className="pb-32 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Image,
              title: "Visual Extracts",
              desc: "Screenshots, whiteboard captures, and handwritten schedules. Our OCR handles the noise.",
              label: "IMG / PNG / JPG",
              color: "text-blue-500",
              bgColor: "bg-blue-500/10",
            },
            {
              icon: FileText,
              title: "Document Parses",
              desc: "Formal agendas, syllabi, and multi-page itineraries. Deep structure extraction, instantly.",
              label: "PDF / DOCX",
              color: "text-purple-500",
              bgColor: "bg-purple-500/10",
            },
            {
              icon: Type,
              title: "Raw Context",
              desc: "Paste unstructured text from emails, group chats, or meeting transcripts.",
              label: "STRING / TEXT",
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
      <section id="how-it-works" className="pb-32 px-6 max-w-6xl mx-auto border-t border-border/50 pt-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-text tracking-tight mb-4">
            Zero friction, autonomous extraction.
          </h2>
          <p className="text-text-muted font-medium max-w-lg mx-auto">
            The ParseCal protocol automates the entire lifecycle of event creation.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-primary/0 via-border to-primary/0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {[
              {
                step: "01",
                phase: "EXTRACTION",
                title: "Initialize Source",
                desc: "Drop any unstructured data source into the engine. AI begins pattern recognition.",
                icon: Zap,
                color: "text-primary",
                borderColor: "border-primary/20",
                shadow: "shadow-primary/5",
              },
              {
                step: "02",
                phase: "VALIDATION",
                title: "AI Analysis",
                desc: "Events are serialized with confidence scores. Review the extraction for total accuracy.",
                icon: Sparkles,
                color: "text-warning",
                borderColor: "border-warning/20",
                shadow: "shadow-warning/5",
              },
              {
                step: "03",
                phase: "DEPLOYMENT",
                title: "Push to Node",
                desc: "One click pushes verified events to your connected cloud calendar nodes.",
                icon: CheckCircle2,
                color: "text-success",
                borderColor: "border-success/20",
                shadow: "shadow-success/5",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center md:items-start text-center md:text-left group">
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

      {/* Features - Capabilities Matrix */}
      <section className="pb-32 px-6 max-w-6xl mx-auto border-t border-border/50 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-center md:text-left">
           <div>
             <h2 className="text-3xl font-extrabold text-text tracking-tight mb-2">
               Precision-built for complexity.
             </h2>
             <p className="text-text-muted font-medium">The ParseCal engine handles real-world scheduling anomalies.</p>
           </div>
           <div className="px-4 py-2 bg-success/5 border border-success/20 rounded-full flex items-center gap-2 mx-auto md:mx-0">
             <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
             <span className="text-[10px] font-black text-success uppercase tracking-widest">System Operational</span>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Handwritten Logic", d: "ML-tuned OCR for messy ink", i: Type },
            { t: "Multi-Model AI", d: "GPT-4o, Claude 3.5, Gemini Pro", i: Sparkles },
            { t: "Node Integration", d: "Google & Outlook cloud sync", i: Calendar },
            { t: "Confidence Scoring", d: "Probability metrics per event", i: CheckCircle2 },
            { t: "Inline Buffer", d: "Edit drafts before pushing live", i: ArrowRight },
            { t: "ICS Serialization", d: "Universal calendar format export", i: FileText },
            { t: "Custom Schema", d: "Bring your own LLM API keys", i: Zap },
            { t: "Temporal Logic", d: "Complex recurring schedule support", i: Calendar },
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
      <section className="pb-40 px-6 max-w-5xl mx-auto">
        <div className="relative overflow-hidden bg-bg-card border border-border rounded-[40px] p-12 md:p-20 text-center shadow-2xl">
          {/* Background Decorative Element */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cta/0 via-cta/30 to-cta/0" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-cta/10 rounded-[22px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-cta/5">
              <Zap className="w-8 h-8 text-cta" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-text tracking-tighter mb-6 leading-tight">
              Reclaim your time from<br />
              <span className="text-primary italic">manual serialization.</span>
            </h2>
            
            <p className="text-lg text-text-muted mb-12 font-medium max-w-xl mx-auto">
              Deployment is instant. 20 free cycles per month. <br className="hidden md:block" />
              No credit card. No friction. Just extraction.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-3 bg-cta hover:bg-cta-hover text-white font-black px-10 py-5 rounded-[18px] text-xl transition-all shadow-xl shadow-cta/20 active:scale-95"
              >
                Initialize Free Access
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
                    <span className="text-text-muted italic">AI Extraction accuracy</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-semibold text-text">ParseCal</span>
        </div>
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} ParseCal. Built with AI, for humans.
        </p>
      </footer>
    </div>
  );
}
