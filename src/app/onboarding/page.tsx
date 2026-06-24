"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle, Building2, MapPin, Link2, BarChart2,
  FileText, CreditCard, Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Location & Contact", icon: MapPin },
  { id: 3, title: "Connect Google", icon: Link2 },
  { id: 4, title: "Running Audit", icon: Loader2 },
  { id: 5, title: "Audit Results", icon: BarChart2 },
  { id: 6, title: "Content Plan", icon: FileText },
  { id: 7, title: "Start Trial", icon: CreditCard },
];

const CATEGORIES = [
  "dentist", "doctor", "plumber", "HVAC", "electrician", "lawyer",
  "restaurant", "salon", "gym", "realtor", "accountant", "veterinarian",
  "landscaper", "painter", "contractor", "cleaning service", "other",
];

interface BusinessData {
  name: string;
  websiteUrl: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  category: string;
  nicheTags: string;
}

interface AuditResult {
  score: number;
  issues: string[];
}

function OnboardingWizard() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gbpConnected, setGbpConnected] = useState(false);

  const [data, setData] = useState<BusinessData>({
    name: "",
    websiteUrl: "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    category: "",
    nicheTags: "",
  });

  // Restore state from URL params (GBP OAuth return)
  useEffect(() => {
    const bid = searchParams.get("businessId");
    const gbp = searchParams.get("gbp");
    const err = searchParams.get("error");
    const stepParam = searchParams.get("step");

    if (bid) setBusinessId(bid);
    if (gbp === "connected") {
      setGbpConnected(true);
      setStep(4); // jump to audit
      if (bid) {
        // Auto-trigger audit
        triggerAudit(bid);
      }
    }
    if (err === "gbp_failed") {
      setError("Google connection failed. Please try again.");
      setStep(3);
    }
    if (stepParam) {
      setStep(parseInt(stepParam));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = (step / STEPS.length) * 100;

  function update(field: keyof BusinessData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function saveBusinessInfo() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          nicheTags: data.nicheTags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const json = await res.json() as { businessId?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      setBusinessId(json.businessId ?? null);
      setStep(3);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function connectGBP() {
    if (!businessId) return;
    // Include step=3 so we can restore context on return
    window.location.href = `/api/onboarding/gbp/connect?businessId=${businessId}`;
  }

  async function triggerAudit(bid: string) {
    setStep(4);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: bid }),
      });
      if (!res.ok) throw new Error("Audit failed to start");

      // Poll for completion
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(`/api/onboarding/audit/result?businessId=${bid}`);
        const pollJson = await pollRes.json() as { status?: string; result?: AuditResult };
        if (pollJson.status === "completed") {
          setAuditResult(pollJson.result ?? null);
          setStep(5);
          return;
        }
        if (pollJson.status === "failed") break;
      }
      // If timeout or failed, still advance with no data
      setStep(5);
    } catch {
      setStep(5);
    } finally {
      setLoading(false);
    }
  }

  async function runAuditManually() {
    if (!businessId) return;
    await triggerAudit(businessId);
  }

  async function completeOnboarding() {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error ?? "Failed to create checkout session");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-primary mb-2">RankAgent AI</div>
          <p className="text-muted-foreground">Set up your account in a few minutes</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of {STEPS.length}</span>
            <span className="text-sm text-muted-foreground">{STEPS[step - 1]?.title}</span>
          </div>
          <Progress value={progress} />
          <div className="flex justify-between mt-3">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex flex-col items-center ${s.id <= step ? "text-primary" : "text-muted-foreground"}`}
              >
                {s.id < step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <s.icon className={`h-5 w-5 ${s.id === step && step === 4 ? "animate-spin" : ""}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your business</CardTitle>
              <CardDescription>We&apos;ll use this to personalize your SEO strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bname">Business name</Label>
                <Input
                  id="bname"
                  placeholder="Smith Dental Care"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  placeholder="https://smithdental.com"
                  value={data.websiteUrl}
                  onChange={(e) => update("websiteUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Business category</Label>
                <Select value={data.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="services">Your main services (comma-separated)</Label>
                <Input
                  id="services"
                  placeholder="teeth whitening, implants, cleanings"
                  value={data.nicheTags}
                  onChange={(e) => update("nicheTags", e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!data.name || !data.category}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Location & contact</CardTitle>
              <CardDescription>
                NAP data (Name, Address, Phone) — the foundation of local SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St"
                  value={data.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Austin"
                    value={data.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="TX"
                    value={data.state}
                    onChange={(e) => update("state", e.target.value)}
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP code</Label>
                <Input
                  id="zip"
                  placeholder="78701"
                  value={data.zip}
                  onChange={(e) => update("zip", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  placeholder="(512) 555-0100"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveBusinessInfo}
                  disabled={loading || !data.city || !data.phone}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save & continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Connect Google Business Profile</CardTitle>
              <CardDescription>
                One-time connection. The bot manages your GBP from here on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {gbpConnected ? (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-800">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Google Business Profile connected!</span>
                </div>
              ) : (
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 space-y-2">
                  <p className="font-medium">We&apos;ll access your GBP to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Publish weekly Google posts</li>
                    <li>Read and respond to reviews</li>
                    <li>Update your business information</li>
                  </ul>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                {!gbpConnected ? (
                  <Button className="flex-1" onClick={connectGBP} disabled={!businessId}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Connect Google Account
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={runAuditManually}>
                    Run audit now
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
                onClick={() => setStep(4)}
              >
                Skip — connect later in Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Audit running */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Analyzing your Google presence...</CardTitle>
              <CardDescription className="text-center">Takes about 30 seconds</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-12 space-y-6">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="space-y-2 text-center text-sm text-muted-foreground">
                <p>Checking your Google Business Profile...</p>
                <p>Scanning top citation directories...</p>
                <p>Analyzing competitor rankings...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Audit results */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Audit complete</CardTitle>
              <CardDescription>
                Here&apos;s what we found — and what the bot will fix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {auditResult ? (
                <>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <div className={`text-4xl font-bold ${auditResult.score >= 70 ? "text-green-600" : auditResult.score >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                      {auditResult.score}%
                    </div>
                    <div>
                      <div className="font-medium">Google presence score</div>
                      <div className="text-sm text-muted-foreground">
                        {auditResult.issues.length > 0
                          ? `${auditResult.issues.length} issue${auditResult.issues.length !== 1 ? "s" : ""} found — the bot will fix them`
                          : "Looking good!"}
                      </div>
                    </div>
                  </div>
                  {auditResult.issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Issues to fix:</p>
                      {auditResult.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-destructive mt-0.5 flex-shrink-0">✗</span>
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                  <p>Audit complete. The bot will run a detailed analysis after setup.</p>
                </div>
              )}
              <Button className="w-full" onClick={() => setStep(6)}>
                See your content plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Content plan */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Your content plan</CardTitle>
              <CardDescription>
                The bot publishes posts like these every week, automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    week: "This week",
                    topic: "Weekly tip",
                    preview: `Quick ${data.category || "local business"} tip for ${data.city || "your area"} residents: schedule your appointments early in the week for the best availability...`,
                  },
                  {
                    week: "Next week",
                    topic: "Service spotlight",
                    preview: `Did you know we offer ${data.nicheTags ? data.nicheTags.split(",")[0]?.trim() : "specialized services"} right here in ${data.city || "your city"}? Our team has helped hundreds of local clients...`,
                  },
                  {
                    week: "Week 3",
                    topic: "Seasonal update",
                    preview: `As the season changes, ${data.name || "our team"} wants to remind ${data.city || "local"} families that now is the perfect time to...`,
                  },
                ].map((post, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">{post.week}</span>
                      <span className="text-xs text-muted-foreground">{post.topic}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.preview}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Posts are AI-generated and tailored to your business. Enable approval mode in Settings to review each post before it publishes.
              </p>
              <Button className="w-full" onClick={() => setStep(7)}>
                Activate my bot
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 7: Start trial */}
        {step === 7 && (
          <Card>
            <CardHeader>
              <CardTitle>Start your 14-day free trial</CardTitle>
              <CardDescription>
                No charge today. Cancel anytime before the trial ends.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="text-2xl font-bold">
                      $99<span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    <div className="text-sm text-muted-foreground">RankAgent AI Starter</div>
                  </div>
                  <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    14 days free
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    "1 GBP post per week (AI-written)",
                    "200+ citation directory submissions",
                    "Review responses within 2 hours",
                    "Weekly keyword tracking (20 keywords)",
                    "Monday morning email reports",
                    "Competitor monitoring",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={completeOnboarding}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Start free trial
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your bot starts immediately. You&apos;ll be prompted to add billing after the 14-day trial.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <OnboardingWizard />
    </Suspense>
  );
}
