"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Settings {
  postTone: string;
  postFrequency: string;
  postApprovalRequired: boolean;
  reviewApprovalRequired: boolean;
  reviewAutoPostAfterHours: number;
  avoidTopics: string[];
  customInstructions: string;
  reviewRequestEnabled: boolean;
}

interface Props {
  businessId: string;
  settings: Settings;
}

export function BotSettingsForm({ settings }: Props) {
  const [form, setForm] = useState<Settings>({
    ...settings,
    avoidTopics: settings.avoidTopics ?? [],
  });
  const [avoidTopicsStr, setAvoidTopicsStr] = useState(settings.avoidTopics.join(", "));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function save() {
    setLoading(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        avoidTopics: avoidTopicsStr.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    setSaved(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* GBP Post settings */}
      <Card>
        <CardHeader>
          <CardTitle>GBP Post settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Post tone</Label>
            <Select
              value={form.postTone}
              onValueChange={(v) => setForm((p) => ({ ...p, postTone: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Post frequency</Label>
            <Select
              value={form.postFrequency}
              onValueChange={(v) => setForm((p) => ({ ...p, postFrequency: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require post approval</Label>
              <p className="text-sm text-muted-foreground">You&apos;ll review posts before they go live</p>
            </div>
            <Switch
              checked={form.postApprovalRequired}
              onCheckedChange={(v) => setForm((p) => ({ ...p, postApprovalRequired: v }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Topics to avoid</Label>
            <Input
              placeholder="politics, competitors, pricing"
              value={avoidTopicsStr}
              onChange={(e) => setAvoidTopicsStr(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated topics the bot will skip</p>
          </div>

          <div className="space-y-2">
            <Label>Custom instructions</Label>
            <Textarea
              placeholder="Always mention our 24/7 emergency service. Focus on family-friendly messaging."
              value={form.customInstructions}
              onChange={(e) => setForm((p) => ({ ...p, customInstructions: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Review settings */}
      <Card>
        <CardHeader>
          <CardTitle>Review response settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Require review approval</Label>
              <p className="text-sm text-muted-foreground">Review responses before they post</p>
            </div>
            <Switch
              checked={form.reviewApprovalRequired}
              onCheckedChange={(v) => setForm((p) => ({ ...p, reviewApprovalRequired: v }))}
            />
          </div>

          {form.reviewApprovalRequired && (
            <div className="space-y-2">
              <Label>Auto-post after (hours)</Label>
              <Select
                value={String(form.reviewAutoPostAfterHours)}
                onValueChange={(v) => setForm((p) => ({ ...p, reviewAutoPostAfterHours: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 8, 12, 24].map((h) => (
                    <SelectItem key={h} value={String(h)}>{h} hours</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If you don&apos;t approve in time, the bot auto-posts
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save settings"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
