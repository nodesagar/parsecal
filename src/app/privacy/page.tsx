import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-bg selection:bg-primary/20 relative overflow-x-hidden pt-32 pb-24 px-6">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 bg-bg-card/90 backdrop-blur-sm border border-border rounded-[20px] px-3 sm:px-8 py-3 flex items-center justify-between max-w-[1400px] mx-auto transition-all">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <span className="hidden sm:block text-xl font-bold text-text">ParseCal</span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-text-muted hover:text-text flex items-center gap-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>

      <section className="relative z-10 max-w-3xl mx-auto bg-bg-card border border-border rounded-[24px] p-8 md:p-12 shadow-sm">
         <div className="mb-10 text-center border-b border-border pb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-[8px] mb-4 uppercase tracking-[0.2em]">Legal</div>
            <h1 className="text-3xl md:text-4xl font-black text-text mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-text-muted font-medium">Last updated: {new Date().toLocaleDateString()}</p>
         </div>

         <div className="text-text-muted space-y-6 text-sm font-medium leading-relaxed">
            <p>
              Your privacy is extremely important to us. This Privacy Policy explains how ParseCal ("we", "us", or "our") collects, uses, and shares information when you use our website and services.
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">1. Information We Collect</h3>
            <p>
              When you use our application to parse and structure events, we collect information you provide directly to us through the authentication process (like Google or Microsoft OAuth scopes). This includes your email address, basic profile information, and authorized access to read/write explicitly granted calendars to facilitate our core scheduling features.
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">2. How We Use Information</h3>
            <p>
              The minimal required data is utilized exclusively to maintain the operational capability of the platform. We use OAuth provider data to query and construct calendar events directly to your chosen platforms. We do not use this data for advertising.
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">3. Data Retention and Security</h3>
            <p>
              Parsed events, images, or raw text blocks processed by our extraction artificial intelligence systems are completely ephemeral. Data payloads are pushed to the LLM interface and promptly scrubbed. We retain active authentication tokens and system metrics required for managing accounts securely.
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">4. Third-Party Services</h3>
            <p>
              Our operations depend on verified third-party API providers including OpenAI, Google Cloud Platform, and Microsoft Entra ID. Your data is subject to transfer constraints explicitly outlined in these platforms' respective terms and policies.
            </p>
            <p className="mt-8 pt-8 border-t border-border/50 text-xs">
              If you have any questions about this Privacy Policy, please contact us through our primary support channels.
            </p>
         </div>
      </section>
    </main>
  );
}
