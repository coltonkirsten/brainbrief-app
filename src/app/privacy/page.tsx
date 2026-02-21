import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Brain Brief",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        <h1 className="text-4xl font-bold font-serif text-primary mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including your email address and your chosen topic preferences. We also collect usage data to improve our service.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve Brain Brief, specifically to generate and deliver your personalized intelligence briefings.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">3. Third-Party Services</h2>
          <p>We use trusted third-party services to operate Brain Brief:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Supabase:</strong> For secure authentication and database storage.</li>
            <li><strong>Google Gemini:</strong> To research and generate the content of your briefings.</li>
            <li><strong>Resend:</strong> To securely deliver your daily briefing emails.</li>
          </ul>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">4. Data Sharing and Sales</h2>
          <p><strong>We do not sell your personal data.</strong> Your information is strictly used to provide the Brain Brief service.</p>
          
          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a>.</p>
        </div>
      </div>
    </div>
  );
}
