"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface Props {
  postId: string;
  content: string;
}

export function PostActions({ postId, content }: Props) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function approve() {
    setLoading(true);
    await fetch(`/api/posts/${postId}/approve`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  async function saveEdit() {
    setLoading(true);
    await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    router.refresh();
    setLoading(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={6}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={saveEdit} disabled={loading}>
            Save & approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={approve} disabled={loading}>
        Approve & publish
      </Button>
      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
        Edit
      </Button>
    </div>
  );
}
