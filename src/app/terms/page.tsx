import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Brain Brief",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        <h1 className="text-4xl font-bold font-serif text-primary mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using Brain Brief, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">2. Description of Service</h2>
          <p>Brain Brief provides personalized, AI-generated intelligence briefings delivered via email. The service is provided "as is" and "as available". We reserve the right to modify, suspend, or discontinue the service at any time with or without notice.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">3. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">4. Subscriptions and Payments</h2>
          <p>Brain Brief offers a 7-day free trial, after which a subscription is required to continue receiving briefings. You may cancel your subscription at any time. Refunds are handled on a case-by-case basis.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">5. Limitation of Liability</h2>
          <p>Brain Brief uses AI to synthesize information from various sources. While we strive for accuracy, we do not guarantee the completeness or reliability of the information provided in the briefings. You agree that Brain Brief shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">6. Contact</h2>
          <p>Questions about the Terms of Service should be sent to us at <a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a>.</p>
        </div>
      </div>
    </div>
  );
}
