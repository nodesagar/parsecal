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

      {/* Features */}
      <section className="pb-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-text text-center mb-12">
          Built for real-world schedules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "Handwritten note recognition",
            "Multi-provider AI (Gemini, GPT, Claude)",
            "Google Calendar & Outlook integration",
            "Confidence scores for each event",
            "Inline editing before push",
            ".ics export for any calendar",
            "Bring your own API key",
            "Recurring event support",
          ].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 bg-bg-card border border-border rounded-[10px] px-4 py-3"
            >
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              <span className="text-sm font-medium text-text">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 max-w-3xl mx-auto text-center">
        <div className="bg-bg-card border border-border rounded-[16px] p-10">
          <Zap className="w-10 h-10 text-cta mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-3">
            Stop typing events manually
          </h2>
          <p className="text-text-muted mb-6">
            20 free parses per month. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold px-8 py-3.5 rounded-[10px] text-lg cursor-pointer"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
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
