"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/60 dark:bg-[#131313]/60 backdrop-blur-xl shadow-[0_40px_40px_rgba(0,0,0,0.06)]">
        <div className="flex justify-between items-center px-8 h-16 w-full max-w-screen-2xl mx-auto">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white font-headline">
            ParseCal
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              className="text-on-surface-variant dark:text-[#C4C5DA] hover:text-white transition-colors text-sm font-medium"
              href="/"
            >
              Home
            </Link>

            <Link
              className="text-[#1E40FF] font-semibold border-b-2 border-[#1E40FF] pb-1 text-sm"
              href="/pricing"
            >
              Pricing
            </Link>
            <Link
              className="text-on-surface-variant dark:text-[#C4C5DA] hover:text-white transition-colors text-sm font-medium"
              href="/contact"
            >
              Contact
            </Link>

          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 bg-primary-container text-white font-semibold rounded hover:scale-95 transition-transform text-sm cursor-pointer">
              Get Started
            </button>
          </div>

        </div>
      </nav>

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 text-center mb-16">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6">
            Simple, <span className="text-primary-container">Agentic</span> Pricing.
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg mb-10">
            Choose the plan that fits your intelligence needs. Scale your calendar automation from personal use to enterprise-grade operations.
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-medium ${!isYearly ? "text-on-surface" : "text-on-surface-variant"}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 rounded-full bg-surface-container-highest relative p-1 flex items-center transition-colors cursor-pointer"
            >
              <div ripple-color="white" className={`w-4 h-4 bg-primary-container rounded-full absolute transition-all ${isYearly ? "left-7" : "left-1"}`}></div>
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${isYearly ? "text-on-surface" : "text-on-surface-variant"}`}>
              Yearly <span className="bg-secondary-container/20 text-secondary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Save 20%</span>
            </span>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {/* Free Plan */}
          <div className="bg-surface-container-low p-10 rounded-xl flex flex-col h-full border border-outline-variant/5">
            <div className="mb-8">
              <h3 className="font-headline text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-on-surface-variant text-sm">For individuals getting started.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-on-surface-variant">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 20 parses/mo
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 2 Calendar Connections
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Standard Email Support
              </li>
              <li className="flex items-center gap-3 text-sm opacity-30 text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">cancel</span> API access
              </li>
            </ul>
            <button className="w-full py-3 bg-surface-container-highest text-white font-bold rounded-lg hover:bg-surface-bright transition-all cursor-pointer">
              Get Started
            </button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-surface-container relative p-10 rounded-xl flex flex-col h-full border border-primary-container/20 overflow-hidden shadow-[0_0_40px_-10px_rgba(30,64,255,0.3)]">
            <div className="absolute top-0 right-0 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase px-4 py-1.5 tracking-widest">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="font-headline text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-on-surface-variant text-sm">For power users and small teams.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">
                ${isYearly ? "23" : "29"}
              </span>
              <span className="text-on-surface-variant">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-on-surface">
                <span className="material-symbols-outlined text-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Unlimited parses
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface">
                <span className="material-symbols-outlined text-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Unlimited Connections
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface">
                <span className="material-symbols-outlined text-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> API access
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface">
                <span className="material-symbols-outlined text-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Intelligence Analytics
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface">
                <span className="material-symbols-outlined text-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Zapier Integration
              </li>
            </ul>
            <button className="w-full py-3 bg-primary-container text-white font-bold rounded-lg hover:scale-[0.98] transition-all cursor-pointer">

              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-surface-container-low p-10 rounded-xl flex flex-col h-full border border-outline-variant/5">
            <div className="mb-8">
              <h3 className="font-headline text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-on-surface-variant text-sm">For organizations with scale.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">Custom</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Unlimited Everything
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Dedicated AI Models
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Priority Support
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> SSO & Advanced Security
              </li>
            </ul>
            <button className="w-full py-3 bg-surface-container-highest text-white font-bold rounded-lg hover:bg-surface-bright transition-all cursor-pointer">
              Contact Sales
            </button>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="max-w-7xl mx-auto px-8 mb-32 overflow-hidden">
          <h2 className="font-headline text-3xl font-bold text-white mb-12 text-center">Feature Breakdown</h2>
          <div className="bg-surface-container-low rounded-xl overflow-x-auto border border-outline-variant/10">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-high/50">
                  <th className="p-6 text-sm font-bold text-on-surface uppercase tracking-widest">Capabilities</th>
                  <th className="p-6 text-sm font-bold text-on-surface uppercase tracking-widest">Free</th>
                  <th className="p-6 text-sm font-bold text-primary uppercase tracking-widest">Pro</th>
                  <th className="p-6 text-sm font-bold text-on-surface uppercase tracking-widest">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr>
                  <td className="p-6 text-sm font-medium text-on-surface">Monthly Parses</td>
                  <td className="p-6 text-sm text-on-surface-variant">20</td>
                  <td className="p-6 text-sm text-primary font-bold">Unlimited</td>
                  <td className="p-6 text-sm text-on-surface-variant">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium text-on-surface">Agentic Intelligence</td>
                  <td className="p-6 text-sm text-on-surface-variant">Basic</td>
                  <td className="p-6 text-sm text-primary font-bold">Advanced</td>
                  <td className="p-6 text-sm text-on-surface-variant">Custom Models</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium text-on-surface">Calendar Sync</td>
                  <td className="p-6 text-sm text-on-surface-variant">2 Accounts</td>
                  <td className="p-6 text-sm text-primary font-bold">Unlimited</td>
                  <td className="p-6 text-sm text-on-surface-variant">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium text-on-surface">API Access</td>
                  <td className="p-6 text-sm text-on-surface-variant">No</td>
                  <td className="p-6 text-sm text-primary font-bold">Yes</td>
                  <td className="p-6 text-sm text-on-surface-variant">Yes</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium text-on-surface">Support Response</td>
                  <td className="p-6 text-sm text-on-surface-variant">48 Hours</td>
                  <td className="p-6 text-sm text-primary font-bold">12 Hours</td>
                  <td className="p-6 text-sm text-on-surface-variant">Instant</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto px-8 mb-32">
          <h2 className="font-headline text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change plans at any time?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes are reflected instantly and prorated on your next billing cycle."
              },
              {
                q: "How does \"Agentic Intelligence\" work?",
                a: "Our system doesn't just read dates; it understands context, intent, and priority to autonomously organize your schedule across multiple platforms."
              },
              {
                q: "What happens if I exceed my monthly parse limit?",
                a: "Free users will be prompted to upgrade to Pro. We never delete your data, but parsing actions will be paused until the next cycle or upgrade."
              },
              {
                q: "Do you offer discounts for non-profits?",
                a: "Yes, we love supporting mission-driven organizations. Contact our sales team for special pricing options."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-surface-container-low p-6 rounded-lg group">
                <button className="flex justify-between items-center w-full text-left cursor-pointer">
                  <span className="font-bold text-white group-hover:text-primary transition-colors">{faq.q}</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">expand_more</span>
                </button>
                <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/15 bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 py-12 max-w-7xl mx-auto">
          <div className="col-span-1">
            <div className="text-lg font-black text-white font-headline mb-4">ParseCal</div>
            <p className="text-[#C4C5DA] text-xs leading-relaxed max-w-[200px]">
              Empowering time management through agentic artificial intelligence.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="/#features">Features</Link></li>
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="/pricing">Pricing</Link></li>
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="/contact">Contact</Link></li>

              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="#">API Docs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="#">Newsletter</Link></li>
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="#">Twitter</Link></li>
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="#">LinkedIn</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="#">Terms of Service</Link></li>
              <li><Link className="text-[#C4C5DA] text-xs hover:text-secondary transition-colors" href="#">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pb-12">
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#C4C5DA] text-[10px] uppercase tracking-widest opacity-60">© 2024 ParseCal. Agentic Intelligence.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">terminal</span>
              </div>
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">shield</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
