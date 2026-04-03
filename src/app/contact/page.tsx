"use client";

import Link from "next/link";

export default function ContactPage() {
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
              className="text-on-surface-variant dark:text-[#C4C5DA] hover:text-white transition-colors text-sm font-medium"
              href="/pricing"
            >
              Pricing
            </Link>
            <Link
              className="text-[#1E40FF] font-semibold border-b-2 border-[#1E40FF] pb-1 text-sm font-medium"
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

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Hero / Mission Statement */}
        <section className="mb-32 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">Our Mission</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-8 text-white">
              Scheduling should be <span className="text-primary-container">invisible.</span>
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
              We're building the first agentic intelligence layer for your time. ParseCal doesn't just manage appointments; it understands context, anticipates friction, and negotiates the optimal flow of your day—so you can focus on what matters.
            </p>
          </div>
          {/* Asymmetric Decorator */}
          <div className="absolute -right-24 top-0 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] -z-10"></div>
        </section>

        {/* Our Story / Bento Grid */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Image Card */}
            <div className="md:col-span-8 group relative overflow-hidden rounded-xl bg-surface-container-low h-[400px]">
              <img
                alt="Team collaborating"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlhGEC45J_PZPSCMAXB0x-LKP9H2d7v6jnBdauVqAtlsir1b2xV9Ak6BQAVJLupgwQKl_TODNeCnTtGrOO747_KyEsdL-UAaf1ecGxx3eVHJ4zKUkYJAPEysL9hXeSc9NPxY_li_JR-80yo1c50cMDf8BA1bsD3KVln0zhBrPhBQFHqIVzargvVorvaLQ_yrx_Nm6UFp0JFalOshnorleoafaj2WvGUgmhfK2MrJTkY9SM3U8-JRbAzErBRw2AZ68DHc0Ab3XqXYUL"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <h3 className="font-headline text-2xl font-bold mb-2 text-white">The Obsidian Architect Philosophy</h3>
                <p className="text-on-surface-variant max-w-md">Born from the need to eliminate the "calendar fatigue" of modern work-life, we carved ParseCal from a vision of absolute precision.</p>
              </div>
            </div>
            {/* Small Info Card */}
            <div className="md:col-span-4 bg-surface-container-low p-8 rounded-xl flex flex-col justify-center">
              <span className="material-symbols-outlined text-secondary-container text-4xl mb-4">auto_awesome</span>
              <h4 className="font-headline text-xl font-bold mb-3 text-white">Intelligence First</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">Our algorithms don't just "detect" text; they parse intent, emotion, and priority to ensure your schedule reflects your actual life goals.</p>
            </div>
            {/* Another Bento Item */}
            <div className="md:col-span-4 bg-primary-container/10 p-8 rounded-xl border border-primary/5">
              <h4 className="font-headline text-5xl font-extrabold text-primary mb-2">99.9%</h4>
              <p className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">Parsing Accuracy</p>
            </div>
            {/* Wide Story Card */}
            <div className="md:col-span-8 bg-surface-container-highest/30 backdrop-blur-sm p-8 rounded-xl flex items-center gap-8 border border-white/5">
              <div className="hidden sm:block w-24 h-24 rounded-full overflow-hidden flex-shrink-0 grayscale">
                <img
                  alt="Founder"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxktDI1KCEzpjlTpgh2dd8mSvxKmefUSamUlANc6crELc8FAJo30nIKtmTkBs8Ijy0NGJbnm84dLggi-3ISAc68b_4tMBsjDUt9SOk-FA3snY9Rk6v9rQ12EeLtsTF7imHf4FQgSaIxMTADjca1ZTNJDoiDxX8-dW4lNlgfGfgf5atSPIHiW7Ukkkd5np48Pfhqd7mh1iunnK6Ou3VVl6hnC-0vdMtr3wq34Ngw5ImBBi82YWhtQrvmByY-KoxgiqsKgouZnEdEu7c"
                />
              </div>
              <div>
                <p className="text-lg italic text-on-surface-variant mb-4 font-body">"We aren't just making a tool; we are building an agent that values your focus as much as you do."</p>
                <p className="font-bold text-white font-headline">— Marcus Thorne, <span className="text-primary font-bold">Founder</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="font-headline text-4xl font-extrabold mb-6 tracking-tight text-white">Get in touch.</h2>
            <p className="text-on-surface-variant mb-12">Whether you're looking for an enterprise integration or just want to chat about the future of AI, our team is standing by.</p>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Email Us</p>
                  <p className="font-medium text-white">hello@parsecal.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Headquarters</p>
                  <p className="font-medium text-white">Obsidian Tower, San Francisco</p>
                </div>
              </div>
            </div>
          </div>
          {/* Form */}
          <div className="bg-surface-container-low p-8 md:p-10 rounded-xl shadow-2xl relative border border-white/5">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded focus:ring-1 focus:ring-primary/30 text-sm py-3 px-4 text-white"
                    placeholder="John Doe"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded focus:ring-1 focus:ring-primary/30 text-sm py-3 px-4 text-white"
                    placeholder="john@company.com"
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Message</label>
                <textarea
                  className="w-full bg-surface-container-lowest border-none rounded focus:ring-1 focus:ring-primary/30 text-sm py-3 px-4 resize-none text-white font-body"
                  placeholder="How can we help you?"
                  rows={4}
                ></textarea>
              </div>
              <button
                className="w-full bg-secondary-container text-on-secondary-container font-bold py-4 rounded hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                Send Message
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
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
