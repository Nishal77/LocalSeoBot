"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  businessId: string;
}

export default function CampaignForm({ businessId }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/reviews/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          customers: [{ name, phone }],
        }),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to send request");
      }

      setSuccess(true);
      setName("");
      setPhone("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs text-red-800 bg-red-500/10 border border-red-500/20 rounded-xl font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-xs text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-medium">
          Review request enqueued successfully!
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="cust-name" className="text-zinc-600 font-semibold text-xs">Customer Name</Label>
        <Input
          id="cust-name"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="border-zinc-200/80 focus-visible:ring-zinc-950"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cust-phone" className="text-zinc-600 font-semibold text-xs">Mobile Number</Label>
        <Input
          id="cust-phone"
          type="tel"
          placeholder="e.g. +15551234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
          className="border-zinc-200/80 focus-visible:ring-zinc-950"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !name || !phone}
        className="w-full bg-zinc-950 text-white hover:bg-zinc-900 rounded-xl py-2 font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Enqueuing...
          </>
        ) : (
          "Send SMS Request"
        )}
      </Button>
    </form>
  );
}
