import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Brain Brief",
  description: "Privacy Policy for Brain Brief — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        <h1 className="text-4xl font-bold font-serif text-primary mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Effective date: February 24, 2026</p>

        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-0">

          <p>Brain Brief (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when you use Brain Brief (&quot;the Service&quot;).</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>

          <h3 className="text-lg font-serif font-semibold text-primary mt-6 mb-3">Information you provide directly</h3>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Email address</strong> — required to create your account and deliver briefings</li>
            <li><strong>Display name</strong> — optional, used to personalize your briefings</li>
            <li><strong>Topic preferences</strong> — the topics you select for your briefings</li>
            <li><strong>Profile question response</strong> — optional self-description (e.g., &quot;Tech professional,&quot; &quot;Student&quot;) to help us understand our audience</li>
          </ul>

          <h3 className="text-lg font-serif font-semibold text-primary mt-6 mb-3">Information collected automatically</h3>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Usage data</strong> — when you generate briefings, open emails, and interact with the Service</li>
            <li><strong>UTM parameters</strong> — if you arrive via a referral link, we capture the source, medium, and campaign parameters to understand how users discover Brain Brief</li>
            <li><strong>Authentication data</strong> — session tokens and login timestamps managed by our authentication provider</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Generate and deliver briefings</strong> — your topics are sent to our AI system to produce personalized briefings, which are delivered to your email</li>
            <li><strong>Manage your account</strong> — authentication, subscription management, and support</li>
            <li><strong>Improve the Service</strong> — understanding usage patterns helps us build a better product</li>
            <li><strong>Communicate with you</strong> — trial status updates, subscription confirmations, service announcements, and support responses</li>
            <li><strong>Analyze growth</strong> — UTM data and profile responses help us understand our audience and improve our marketing</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">3. Third-Party Services</h2>
          <p>We use the following trusted third-party services to operate Brain Brief. Each processes only the data necessary for their specific function:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Supabase</strong> — database storage and user authentication. Stores your account data, topics, and briefing history.</li>
            <li><strong>Stripe</strong> — payment processing. Handles subscription billing securely. We do not store your credit card details — Stripe manages all payment data.</li>
            <li><strong>Resend</strong> — email delivery. Sends your daily briefings and account-related emails.</li>
            <li><strong>Google Gemini</strong> — AI content generation. Your topic names are sent to Google&apos;s Gemini API with real-time web search to generate briefing content. No personal information beyond topic names is shared.</li>
            <li><strong>Vercel</strong> — hosting and infrastructure. Serves the web application and runs our backend services.</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">4. Data Sharing and Sales</h2>
          <p><strong>We do not sell, rent, or trade your personal data to third parties.</strong></p>
          <p className="mt-3">We share data with third-party services only as described in Section 3, solely for the purpose of operating the Service. We may disclose your information if required by law or to protect our rights, safety, or property.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">5. Cookies and Tracking</h2>
          <p>Brain Brief uses minimal cookies:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Authentication session cookies</strong> — essential cookies that keep you logged in. These are strictly necessary for the Service to function and cannot be disabled.</li>
          </ul>
          <p className="mt-3">We do not use advertising cookies, tracking pixels, or third-party analytics cookies. We do not participate in ad networks or cross-site tracking.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">6. Data Retention</h2>
          <p>We retain your data as follows:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Active accounts:</strong> Your data is retained for as long as your account is active.</li>
            <li><strong>Inactive accounts:</strong> If your account has been inactive for more than 12 months, we may reach out before deleting your data.</li>
            <li><strong>Account deletion:</strong> When you request account deletion, we remove your personal data within 30 days. Some anonymized, aggregated data may be retained for analytics purposes.</li>
            <li><strong>Briefing history:</strong> Past briefings are retained while your account is active so you can reference them from your dashboard.</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Access your data</strong> — view all data we have about you from your dashboard</li>
            <li><strong>Export your data</strong> — request a copy of your data by contacting us</li>
            <li><strong>Delete your data</strong> — request complete deletion of your account and all associated data</li>
            <li><strong>Update your data</strong> — modify your name, email, topics, and preferences from your dashboard</li>
            <li><strong>Unsubscribe from emails</strong> — every email includes an unsubscribe link; you can also manage email preferences from your dashboard</li>
            <li><strong>Cancel your subscription</strong> — at any time, with no penalty</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a>.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">8. Email Communications</h2>
          <p>We send the following types of emails:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Briefing emails</strong> — your personalized news briefings, based on the topics and frequency you selected</li>
            <li><strong>Account emails</strong> — email confirmations, password resets, and subscription receipts</li>
            <li><strong>Trial and lifecycle emails</strong> — trial status updates and subscription reminders during and immediately after your free trial</li>
          </ul>
          <p className="mt-3">We will never send unsolicited spam, sell your email address, or share it with third parties for marketing purposes. All emails comply with the CAN-SPAM Act and include a clear unsubscribe mechanism.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">9. Children&apos;s Privacy</h2>
          <p>Brain Brief is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected data from a child under 13, we will delete that information promptly. If you believe a child under 13 has provided us with personal data, please contact us at <a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a>.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">10. Security</h2>
          <p>We take the security of your data seriously and implement industry-standard measures to protect it, including:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Encrypted data transmission (HTTPS/TLS) for all communications</li>
            <li>Secure authentication through Supabase Auth</li>
            <li>Payment data handled exclusively by Stripe (PCI DSS compliant)</li>
            <li>Access controls and service-role separation for database operations</li>
          </ul>
          <p className="mt-3">While we strive to protect your data, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you via email or through the Service before the changes take effect. Your continued use of the Service after such changes constitutes acceptance of the updated policy.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8 mb-4">12. Contact</h2>
          <p>If you have questions or concerns about this Privacy Policy or how we handle your data, please contact us at:</p>
          <p className="mt-2"><a href="mailto:support@brainbrief.app" className="text-accent hover:underline">support@brainbrief.app</a></p>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
