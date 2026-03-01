"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Generate hour options from 5 AM to 10 PM (18 options)
const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const hour24 = i + 5; // 5..22
  const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const label = `${hour12}:00 ${ampm}`;
  const value = `${String(hour24).padStart(2, "0")}:00`;
  return { label, value };
});

interface DeliveryTimePickerProps {
  userId: string;
  initialTime: string; // "06:00" format
  timezone: string; // e.g. "America/New_York"
}

export default function DeliveryTimePicker({
  userId,
  initialTime,
  timezone,
}: DeliveryTimePickerProps) {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tzAbbr = getTimezoneAbbreviation(timezone);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newTime = e.target.value;
    setSelectedTime(newTime);
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_time: newTime })
      .eq("user_id", userId);

    setSaving(false);

    if (error) {
      console.error("[delivery-time] Failed to update:", error);
      setSelectedTime(initialTime); // revert on failure
      return;
    }

    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label
        htmlFor="delivery-time"
        className="text-sm font-medium text-muted-foreground whitespace-nowrap"
      >
        Deliver my briefing at:
      </label>
      <select
        id="delivery-time"
        value={selectedTime}
        onChange={handleChange}
        disabled={saving}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
      >
        {HOUR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">{tzAbbr}</span>
      {saving && (
        <span className="text-xs text-muted-foreground">Saving...</span>
      )}
      {saved && (
        <span className="text-xs text-green-600 dark:text-green-400">
          Saved
        </span>
      )}
    </div>
  );
}

function getTimezoneAbbreviation(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value ?? timezone;
  } catch {
    return timezone;
  }
}
