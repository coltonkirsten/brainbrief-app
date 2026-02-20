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
}

export default function TopicManager({
  initialTopics,
  userId,
  maxTopics,
}: TopicManagerProps) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [newTopic, setNewTopic] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddMore = topics.length < maxTopics;

  async function addTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopic.trim() || !canAddMore) return;

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
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("topics")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTopics(topics.filter((t) => t.id !== id));
    router.refresh();
  }

  async function updateTopic(id: string) {
    if (!editValue.trim()) return;

    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("topics")
      .update({ name: editValue.trim() })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTopics(
      topics.map((t) => (t.id === id ? { ...t, name: editValue.trim() } : t))
    );
    setEditingId(null);
    setEditValue("");
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
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Topic list */}
      <div className="space-y-2">
        {topics.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">
              No topics yet. Add your first topic below!
            </p>
          </div>
        )}

        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
          >
            {editingId === topic.id ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") updateTopic(topic.id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                />
                <button
                  onClick={() => updateTopic(topic.id)}
                  className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Save
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
                <span className="flex-1 font-medium">{topic.name}</span>
                <button
                  onClick={() => startEditing(topic)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add topic form */}
      {canAddMore ? (
        <form onSubmit={addTopic} className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="e.g., Artificial Intelligence, Climate Change, NBA..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !newTopic.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add topic"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          You&apos;ve reached the maximum of {maxTopics} topics on the free
          plan.
        </p>
      )}

      {/* Topic count */}
      <p className="text-xs text-muted-foreground">
        {topics.length} / {maxTopics} topics used
      </p>
    </div>
  );
}
