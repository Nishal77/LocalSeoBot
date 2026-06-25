"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { Bot } from "lucide-react";
import Link from "next/link";

// Customized SVGs for the local search & AI directories
function GoogleLogo() {
  return (
    <svg className="h-5 w-auto flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
      <title>Google Maps & Search</title>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto text-zinc-400 fill-current hover:text-white transition-all opacity-75 hover:opacity-100">
      <title>Apple Maps</title>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
    </svg>
  );
}

function ChatGptLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto text-[#10a37f] fill-current hover:text-[#19c37d] transition-all opacity-75 hover:opacity-100">
      <title>ChatGPT Search</title>
      <path d="M21.3,10.3A5.4,5.4,0,0,0,18,5.1a5.6,5.6,0,0,0-5.8,1.4,5.4,5.4,0,0,0-5-3.1,5.6,5.6,0,0,0-5,3.3A5.4,5.4,0,0,0,1,12a5.4,5.4,0,0,0,3.3,5.1,5.6,5.6,0,0,0,5.8-1.4,5.4,5.4,0,0,0,5,3.1,5.6,5.6,0,0,0,5-3.3A5.4,5.4,0,0,0,23,12,5.5,5.5,0,0,0,21.3,10.3ZM12.7,18.9a3.6,3.6,0,0,1-1.4-.3l2.9-1.7a1,1,0,0,0,.5-.9V12l1.6.9v3.3A3.8,3.8,0,0,1,12.7,18.9ZM-5.3-2L4.6,15a3.8,3.8,0,0,1,0-5.8L7.5,11a1,1,0,0,0,.5.9v1.9ZM6.3,7.9A3.6,3.6,0,0,1,7.7,6v3.3a1,1,0,0,0,.5.9L11.1,12,9.5,13ZM4.4-4.2a3.8,3.8,0,0,1,5.3,0L13.1,5.4a1,1,0,0,0-.5.9V8.2L11,7.3V4A3.6,3.6,0,0,1,10.7,3.7ZM11.3,12,12.9,11v3.9L11.3,14ZM16.3,18a3.6,3.6,0,0,1-1.4-1.9V12.8a1,1,0,0,0-.5-.9L11.5,10,13,9.1l4.2,2.4v4.1A3.6,3.6,0,0,1,16.3,18ZM1.4-7.8,2.8,1.6a3.8,3.8,0,0,1,0,5.8l-2.8-1.6a1,1,0,0,0-.5-.9V11.1A1,1,0,0,0,17.7,10.2Z" />
    </svg>
  );
}

function GeminiLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto text-blue-400 fill-current hover:text-blue-300 transition-all opacity-75 hover:opacity-100">
      <title>Google Gemini</title>
      <path d="M12 2a1 1 0 0 0-1 1c0 4.418-3.582 8-8 8a1 1 0 0 0 0 2c4.418 0 8 3.582 8 8a1 1 0 0 0 2 0c0-4.418 3.582-8 8-8a1 1 0 0 0 0-2c-4.418 0-8-3.582-8-8a1 1 0 0 0-1-1z" />
    </svg>
  );
}

function ClaudeLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto text-[#cc9c83] fill-current hover:text-[#dcbba7] transition-all opacity-75 hover:opacity-100">
      <title>Anthropic Claude</title>
      <path d="M12 2L2 22h4.5l2.25-5h6.5l2.25 5H22L12 2zm-2.15 13L12 10.25 14.15 15h-4.3z" />
    </svg>
  );
}

function LoginForm() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#09090b] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.03),transparent_60%)] pointer-events-none" />

      {/* Left Column (Authentication Panel) */}
      <div className="flex flex-col justify-between p-8 md:p-12 relative z-10 w-full min-h-screen lg:min-h-0 lg:h-full overflow-y-auto lg:overflow-hidden">
        {/* Top brand logo */}
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">RankAgent</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500 to-blue-500 text-white tracking-widest uppercase">AI</span>
          </Link>
        </div>

        {/* Center Prompt & Button */}
        <div className="flex flex-col items-center justify-center my-auto w-full text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2 max-w-sm">
            Get ranked higher today
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm font-normal mb-8 max-w-xs">
            Takes 3 seconds. Connect your profile instantly.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
            className="flex items-center justify-center gap-3 bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-sm cursor-pointer shadow-md w-full max-w-xs"
          >
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Empty placeholder to keep vertical flex layout aligned */}
        <div className="h-8" />
      </div>

      {/* Right Column (Social Proof & Testimonials) */}
      <div className="hidden lg:flex flex-col justify-between p-16 md:p-20 bg-[#0c0c0e] border-l border-zinc-800/80 relative z-10 w-full h-full overflow-hidden">
        {/* Quote Block */}
        <div className="flex flex-col justify-center my-auto max-w-md">
          {/* Faint double quote */}
          <span className="text-zinc-800 text-6xl font-serif leading-none select-none">“</span>
          
          <blockquote className="text-xl md:text-2xl font-normal leading-relaxed text-zinc-200 mt-2 tracking-tight">
            RankAgent helped us double our business calls from Google Business Profile. The automated weekly posts and instant review replies save us 10+ hours every single week.
          </blockquote>
          
          <div className="mt-6">
            <p className="text-zinc-300 font-medium text-sm">Marcus K.</p>
            <p className="text-zinc-500 text-xs mt-0.5">Owner @ Apex Plumbing & Heating</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
