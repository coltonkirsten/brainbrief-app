"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Topic {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface TopicManagerProps {
  initialTopics: Topic[];
  userId: string;
  maxTopics: number;
  canAddTopics: boolean;
}

export default function TopicManager({
  initialTopics,
  userId,
  maxTopics,
  canAddTopics,
}: TopicManagerProps) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [newTopic, setNewTopic] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopic.trim() || !canAddTopics) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("topics")
      .insert({ name: newTopic.trim(), user_id: userId })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setTopics([...topics, data]);
    setNewTopic("");
    setLoading(false);
    router.refresh();
  }

  async function deleteTopic(id: string) {
    setError(null);
    setDeletingId(id);

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("topics")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setTopics(topics.filter((t) => t.id !== id));
    setDeletingId(null);
    router.refresh();
  }

  async function updateTopic(id: string) {
    if (!editValue.trim()) return;

    setError(null);
    setSavingId(id);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("topics")
      .update({ name: editValue.trim() })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSavingId(null);
      return;
    }

    setTopics(
      topics.map((t) => (t.id === id ? { ...t, name: editValue.trim() } : t))
    );
    setEditingId(null);
    setEditValue("");
    setSavingId(null);
    router.refresh();
  }

  function startEditing(topic: Topic) {
    setEditingId(topic.id);
    setEditValue(topic.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValue("");
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Topic list */}
      <div className="space-y-2">
        {topics.length === 0 && (
          <div className="bg-white shadow-sm border border-border rounded-xl p-8 text-center">
            <h3 className="text-lg font-serif font-bold text-primary mb-2">Welcome to Brain Brief</h3>
            <p className="text-muted-foreground mb-6 text-sm">You have no active topics. Add your own below, or start with a suggestion:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Generative AI", "SpaceX & NASA", "Venture Capital", "Climate Tech", "Formula 1", "Longevity Research"].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={(e) => { e.preventDefault(); setNewTopic(suggestion); }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-primary border border-border rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center gap-3 bg-white shadow-sm border border-border rounded-xl px-4 py-3"
          >
            {editingId === topic.id ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  aria-label="Edit topic name"
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") updateTopic(topic.id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                />
                <button
                  onClick={() => updateTopic(topic.id)}
                  disabled={savingId === topic.id}
                  className="text-sm font-bold text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
                >
                  {savingId === topic.id ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEditing}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-medium truncate text-primary">{topic.name}</span>
                <button
                  onClick={() => startEditing(topic)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Edit
                </button>
                {confirmDeleteId === topic.id ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Sure?</span>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(null);
                        deleteTopic(topic.id);
                      }}
                      disabled={deletingId === topic.id}
                      className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      {deletingId === topic.id ? "Deleting..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(topic.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add topic form */}
      {canAddTopics ? (
        <form onSubmit={addTopic} className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            aria-label="New topic name"
            placeholder="e.g., Artificial Intelligence, Climate Change, NBA..."
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !newTopic.trim()}
            className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-white uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add topic"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground bg-slate-50 border border-border p-4 rounded-md text-center">
          You&apos;ve reached the maximum of {maxTopics} topics. Upgrade to add more.
        </p>
      )}

      {/* Topic count */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-right">
        {topics.length} / {maxTopics} topics tracked
      </p>
    </div>
  );
}
