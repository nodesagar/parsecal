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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 bg-bg-card/90 backdrop-blur-sm border border-border rounded-[16px] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-text">CalendarAI</span>
        </div>
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
          Upload a PDF, snap a photo of a timetable, or paste text — CalendarAI
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

      {/* Input Types */}
      <section className="pb-20 px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Image,
              title: "Images & Photos",
              desc: "Screenshots, whiteboard photos, handwritten notes — even messy ones.",
            },
            {
              icon: FileText,
              title: "PDF Documents",
              desc: "Conference agendas, class syllabi, travel itineraries.",
            },
            {
              icon: Type,
              title: "Plain Text",
              desc: "Paste text from emails, group chats, or any message.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-bg-card border border-border rounded-[16px] p-6 text-center hover:border-primary cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-[10px] flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="pb-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-text text-center mb-12">
          Three steps. Zero manual work.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              color: "bg-primary",
              title: "Upload",
              desc: "Drop a file, take a photo, or paste text with schedule info.",
            },
            {
              step: "2",
              color: "bg-warning",
              title: "Review",
              desc: "AI extracts events. Review, edit, and confirm the draft.",
            },
            {
              step: "3",
              color: "bg-success",
              title: "Push",
              desc: "One click — events land in your Google or Outlook calendar.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div
                className={`w-10 h-10 ${item.color} text-white font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg`}
              >
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
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
          <span className="font-semibold text-text">CalendarAI</span>
        </div>
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} CalendarAI. Built with AI, for humans.
        </p>
      </footer>
    </div>
  );
}
