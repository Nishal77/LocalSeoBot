"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Loader2, Sparkles } from "lucide-react";

interface MediaItem {
  name: string;
  googleUrl: string;
  createTime: string;
}

export default function PhotosPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    setLoading(true);
    try {
      const res = await fetch("/api/photos");
      if (res.ok) {
        const data = await res.json() as { media: MediaItem[] };
        setMedia(data.media ?? []);
      }
    } catch (err) {
      console.error("Failed to load photos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput) return;

    setUploading(true);
    setError(null);

    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: urlInput }),
      });

      const data = await res.json() as { success?: boolean; media?: MediaItem; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Upload failed");
      }

      if (data.media) {
        setMedia((prev) => [data.media!, ...prev]);
      }
      setUrlInput("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(name: string) {
    const id = name.split("/").pop(); // extract actual media id from resource name
    if (!id) return;

    setMedia((prev) => prev.filter((m) => m.name !== name));

    try {
      await fetch(`/api/photos/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete media:", err);
      fetchPhotos(); // reload on error to revert state
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">GBP Media Gallery</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Manage your Google Business Profile photos. Upload new storefront shots, services, and seasonal photos.
          </p>
        </div>
        <div>
          <Badge className="bg-zinc-100 text-zinc-650 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold px-2.5 py-1 rounded-full select-none">
            Google Connected
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-zinc-200/60 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold tracking-tight">Upload New Photo</CardTitle>
              <Sparkles className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent className="mt-2">
              <form onSubmit={handleUpload} className="space-y-4">
                {error && (
                  <div className="p-3 text-xs text-red-800 bg-red-500/10 border border-red-500/20 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center space-y-2 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition duration-150">
                  <div className="h-10 w-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center mx-auto shadow-sm">
                    <Upload className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div className="text-xs font-semibold text-zinc-700">Drag & drop or upload photo</div>
                  <div className="text-[10px] text-zinc-400 font-medium">Supports JPG, PNG up to 10MB</div>
                </div>

                <div className="space-y-1.5">
                  <Input
                    placeholder="Or paste image URL (e.g. Unsplash)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                    disabled={uploading}
                    className="border-zinc-200/80 focus-visible:ring-zinc-950 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !urlInput}
                  className="w-full bg-zinc-950 text-white hover:bg-zinc-900 rounded-xl font-medium"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading to Google...
                    </>
                  ) : (
                    "Publish to GMB Profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Storefront & Location Media</h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="border border-zinc-200/60 rounded-2xl p-10 text-center text-zinc-400 font-medium bg-white shadow-sm">
              No photos found on Google Business Profile yet. Upload your first photo.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {media.map((m) => (
                <div
                  key={m.name}
                  className="group relative bg-white border border-zinc-250/60 rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-md hover:border-zinc-300 transition duration-150"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.googleUrl}
                    alt="GBP Location Media"
                    className="object-cover w-full h-full group-hover:scale-102 transition duration-200"
                  />
                  
                  {/* Delete Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDelete(m.name)}
                      className="h-10 w-10 rounded-xl bg-white text-red-600 hover:bg-red-50 hover:scale-105 shadow-md flex items-center justify-center transition"
                      title="Delete from Google Profile"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Caption/Time badge */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                    <span className="text-[10px] bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
                      {new Date(m.createTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
