"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface BusinessData {
  id: string;
  name: string;
  websiteUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  category: string | null;
  nicheTags: string[];
  gbpLocationId: string | null;
}

export function BusinessSettingsForm({ business }: { business: BusinessData }) {
  const [form, setForm] = useState({
    name: business.name,
    websiteUrl: business.websiteUrl ?? "",
    addressLine1: business.addressLine1 ?? "",
    addressLine2: business.addressLine2 ?? "",
    city: business.city ?? "",
    state: business.state ?? "",
    zip: business.zip ?? "",
    phone: business.phone ?? "",
    category: business.category ?? "",
    nicheTags: business.nicheTags.join(", "),
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((p) => ({ ...p, [key]: e.target.value })),
    };
  }

  async function save() {
    setLoading(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/settings/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          nicheTags: form.nicheTags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Save failed");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Business name</Label>
              <Input {...field("name")} placeholder="Austin Family Dentistry" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Website URL</Label>
              <Input {...field("websiteUrl")} placeholder="https://example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...field("phone")} placeholder="(512) 555-0100" />
            </div>
            <div className="space-y-1.5">
              <Label>Business category</Label>
              <Input {...field("category")} placeholder="dentist" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address (NAP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Address line 1</Label>
            <Input {...field("addressLine1")} placeholder="123 Main St" />
          </div>
          <div className="space-y-1.5">
            <Label>Address line 2 <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input {...field("addressLine2")} placeholder="Suite 200" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1.5">
              <Label>City</Label>
              <Input {...field("city")} placeholder="Austin" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input {...field("state")} placeholder="TX" />
            </div>
            <div className="space-y-1.5">
              <Label>ZIP</Label>
              <Input {...field("zip")} placeholder="78701" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Changing your address will flag existing citations for NAP consistency re-check.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label>Niche tags</Label>
          <Input
            {...field("nicheTags")}
            placeholder="teeth whitening, cosmetic dentistry, emergency dental"
          />
          <p className="text-xs text-muted-foreground">Comma-separated. Used to generate better post content and keywords.</p>
        </CardContent>
      </Card>

      {business.gbpLocationId && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">
                Google Business Profile connected · Location ID: <code className="text-xs">{business.gbpLocationId}</code>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
