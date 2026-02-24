import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata = {
  title: "Contact | Brain Brief",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <nav className="mb-12"><Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link></nav>
        <div className="bg-card shadow-xl shadow-slate-200/50 border border-border rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-primary mb-4">Contact Us</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Have questions, feedback, or need support? We're here to help. Reach out to us via email and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:brief@brief.brainbrief.app"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground uppercase tracking-wider hover:bg-primary-hover transition-all shadow-sm"
          >
            Email Support
          </a>
          <p className="mt-6 text-sm text-muted-foreground">
            brief@brief.brainbrief.app
          </p>
        </div>
      </div>
    </div>
  );
}
