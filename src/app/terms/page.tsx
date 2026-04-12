import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";

export default function TermsOfUsePage() {
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
            <h1 className="text-3xl md:text-4xl font-black text-text mb-4 tracking-tight">Terms of Use</h1>
            <p className="text-sm text-text-muted font-medium">Last updated: {new Date().toLocaleDateString()}</p>
         </div>

         <div className="text-text-muted space-y-6 text-sm font-medium leading-relaxed">
            <p>
              Please read these Terms of Use ("Terms") carefully before using the ParseCal website and services operated by us. By using the service, you agree to be bound by these terms.
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">1. Description of Service</h3>
            <p>
              ParseCal provides artificial intelligence parsing capabilities to structure schedules and automatically push them into third-party calendar providers. 
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">2. User Accounts & Connectivity</h3>
            <p>
              To use the integration features, you must securely authenticate via your Microsoft or Google credentials. You are responsible for ensuring your permissions are appropriately restricted according to your organizational or personal security requirements.
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">3. Usage Limits and Acceptable Use</h3>
            <p>
              You agree not to misuse the platform by attempting to reverse engineer the scheduling algorithms or excessively rate-limit the generation infrastructure. The service is provided "as-is" for personal or business productivity tooling.
            </p>
            <h3 className="text-lg font-bold text-text mt-8 mb-3">4. Limitation of Liability</h3>
            <p>
               We are not responsible for any missed appointments, hallucinated calendar entries, or scheduling conflicts resulting from the use of AI OCR engines. It is always the user's explicit responsibility to review drafted events before they are finalized into any connected calendar provider.
            </p>
            <p className="mt-8 pt-8 border-t border-border/50 text-xs">
              ParseCal reserves the right to terminate access to the service for any user who violates these Terms.
            </p>
         </div>
      </section>
    </main>
  );
}
