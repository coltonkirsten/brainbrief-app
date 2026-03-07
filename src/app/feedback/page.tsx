import { createClient } from "@/lib/supabase/server";
import FeedbackForm from "./feedback-form";

export const metadata = {
  title: "Feedback | Brain Brief",
  description: "Share your feedback, report bugs, or request features for Brain Brief.",
};

export default async function FeedbackPage() {
  // Try to get the user's email to pre-fill (optional — page works for anonymous users)
  let userEmail: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  } catch {
    // Not logged in — that's fine
  }

  return <FeedbackForm userEmail={userEmail} />;
}
