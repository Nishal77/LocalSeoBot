"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CitationItem {
  id: string;
  status: string;
  business: {
    name: string;
    phone: string | null;
    websiteUrl: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  directory: {
    name: string;
    url: string | null;
    priority: number;
  };
}

interface Props {
  initialCitations: CitationItem[];
}

export default function CitationsTable({ initialCitations }: Props) {
  const [citations, setCitations] = useState<CitationItem[]>(initialCitations);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function handleVerify(citationId: string) {
    const url = urls[citationId];
    if (!url) return;

    setLoading((p) => ({ ...p, [citationId]: true }));

    try {
      const res = await fetch(`/api/admin/citations/${citationId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingUrl: url }),
      });

      if (res.ok) {
        setCitations((prev) => prev.filter((c) => c.id !== citationId));
      }
    } catch (err) {
      console.error("Failed to verify manual citation:", err);
    } finally {
      setLoading((p) => ({ ...p, [citationId]: false }));
    }
  }

  return (
    <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold text-zinc-500 tracking-wider">
              <th className="py-3 px-4">Business & NAP</th>
              <th className="py-3 px-4">Directory</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Live URL Input</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {citations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-zinc-400 font-medium">
                  No citations pending manual submission! Good job.
                </td>
              </tr>
            ) : (
              citations.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                  {/* NAP Details */}
                  <td className="py-4 px-4 space-y-1">
                    <div className="font-semibold text-zinc-800">{c.business.name}</div>
                    <div className="text-xs text-zinc-500 font-medium">
                      Phone: {c.business.phone ?? "—"}<br />
                      Web: {c.business.websiteUrl ?? "—"}<br />
                      Addr: {c.business.addressLine1}, {c.business.city}, {c.business.state} {c.business.zip}
                    </div>
                  </td>

                  {/* Directory Details */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-zinc-800">{c.directory.name}</div>
                    {c.directory.url && (
                      <a
                        href={c.directory.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs text-zinc-450 hover:text-zinc-650 mt-1 font-semibold"
                      >
                        Visit Site <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4">
                    <Badge
                      className={
                        c.directory.priority === 1
                          ? "bg-red-500/10 text-red-700 hover:bg-red-500/15 border-red-500/20"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-zinc-200"
                      }
                    >
                      P{c.directory.priority}
                    </Badge>
                  </td>

                  {/* Live URL input */}
                  <td className="py-4 px-4">
                    <Input
                      placeholder="Paste final live listing URL"
                      value={urls[c.id] ?? ""}
                      onChange={(e) => setUrls((p) => ({ ...p, [c.id]: e.target.value }))}
                      disabled={loading[c.id]}
                      className="border-zinc-200/80 focus-visible:ring-zinc-950 max-w-xs rounded-xl"
                    />
                  </td>

                  {/* Verify Action */}
                  <td className="py-4 px-4">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(c.id)}
                      disabled={loading[c.id] || !urls[c.id]}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl"
                    >
                      {loading[c.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Verify Live
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
