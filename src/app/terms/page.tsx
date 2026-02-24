import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Brain Brief",
  description: "Terms of Service for Brain Brief — AI-powered personalized news briefings.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        <h1 className="text-4xl font-bold font-serif text-primary mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Effective date: February 24, 2026</p>

        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-0">

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using Brain Brief (&quot;the Service&quot;), operated by Brain Brief (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">2. Description of Service</h2>
          <p>Brain Brief is an AI-powered personalized news briefing service. We use artificial intelligence with real-time web search capabilities to generate concise, personalized email briefings on topics you select. The Service includes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>A web application for managing your account, topics, and preferences</li>
            <li>AI-generated email briefings delivered on a schedule you choose</li>
            <li>On-demand briefing generation from your dashboard</li>
          </ul>
          <p className="mt-3">The Service is provided &quot;as is&quot; and &quot;as available.&quot; We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">3. Eligibility</h2>
          <p>You must be at least 13 years of age to use the Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">4. User Accounts</h2>
          <p>To use the Service, you must create an account with a valid email address. You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and current information</li>
            <li>Notifying us immediately of any unauthorized access to your account</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">5. Free Trial</h2>
          <p>New users receive a 7-day free trial with full access to the Service, including up to 5 active topics and daily briefing generation. During the trial:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>No payment information is required to start</li>
            <li>You will receive briefings on the topics you select</li>
            <li>After 7 days, briefing generation will pause until you subscribe</li>
            <li>Your account, topics, and past briefings remain accessible after the trial ends</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">6. Subscription and Payment</h2>
          <p>After the free trial, continued access to briefing generation requires a paid subscription to Brain Brief Pro:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Monthly plan:</strong> $6 per month</li>
            <li><strong>Annual plan:</strong> $50 per year</li>
          </ul>
          <p className="mt-3">Payments are processed securely through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel. Subscriptions automatically renew at the end of each billing period.</p>
          <p className="mt-3">You may cancel your subscription at any time from your dashboard or by contacting us. Cancellation takes effect at the end of the current billing period — you will continue to receive briefings until then. Refunds are handled on a case-by-case basis; please contact us at <a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a> for refund requests.</p>
          <p className="mt-3">We reserve the right to change subscription pricing with at least 30 days&apos; notice. Price changes will apply to the next billing cycle after the notice period.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">7. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
            <li>Attempt to gain unauthorized access to the Service or its related systems</li>
            <li>Scrape, crawl, or use automated tools to extract data from the Service</li>
            <li>Redistribute, republish, or commercially exploit briefing content without permission</li>
            <li>Abuse the Service by creating multiple accounts to circumvent trial or usage limits</li>
            <li>Interfere with or disrupt the Service or its infrastructure</li>
            <li>Use the Service to send spam or unsolicited communications</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">8. Intellectual Property</h2>
          <p>The Service, including its design, features, code, and branding, is owned by Brain Brief and protected by applicable intellectual property laws.</p>
          <p className="mt-3"><strong>Generated content:</strong> Briefings are generated by AI using publicly available information. The compiled briefing content is owned by Brain Brief. You are granted a personal, non-transferable license to use your briefings for personal and professional reference.</p>
          <p className="mt-3"><strong>Your data:</strong> You retain ownership of the personal data you provide (email, name, topic preferences). You may request export or deletion of your data at any time.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">9. AI-Generated Content Disclaimer</h2>
          <p><strong>Brain Brief uses artificial intelligence to generate briefing content.</strong> While we use real-time web search grounding to ensure accuracy, AI-generated content may occasionally:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Contain inaccuracies, errors, or outdated information</li>
            <li>Omit relevant details or context</li>
            <li>Reflect biases present in source material</li>
          </ul>
          <p className="mt-3">Briefings are intended for general informational purposes only. They do not constitute professional advice (financial, legal, medical, or otherwise). Always verify important information from authoritative sources before making decisions based on briefing content.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">10. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, Brain Brief and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from or related to your use of the Service.</p>
          <p className="mt-3">Our total liability for any claims arising under these Terms shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">11. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time, with or without cause, including but not limited to violation of these Terms or abusive behavior. Upon termination:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Your access to the Service will be revoked</li>
            <li>Any active subscription will be canceled</li>
            <li>You may request export of your data within 30 days of termination</li>
          </ul>
          <p className="mt-3">You may also delete your account at any time by contacting us at <a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a>.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">12. Modifications to Terms</h2>
          <p>We may update these Terms from time to time. If we make material changes, we will notify you via email or through the Service. Your continued use of the Service after such changes constitutes acceptance of the updated Terms.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">13. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">14. Contact</h2>
          <p>If you have questions about these Terms of Service, please contact us at:</p>
          <p className="mt-2"><a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a></p>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
