"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function DownloadReportButton() {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="border-zinc-200/80 rounded-xl font-semibold flex items-center gap-1.5 shadow-sm text-zinc-700 hover:text-zinc-950 no-print"
      >
        <Printer className="h-4 w-4" />
        Download PDF
      </Button>

      {/* Embedded print styling to ensure print formatting matches premium A4 invoice standards */}
      <style jsx global>{`
        @media print {
          /* Hide dashboard sidebar, back button, footer, and navigation */
          aside, 
          nav, 
          header, 
          footer, 
          button, 
          .no-print {
            display: none !important;
          }
          
          /* Remove borders/paddings from main layout wrapper */
          main, 
          body, 
          html {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
          }
          
          /* Target printable report container directly */
          .print-report-container {
            border: none !important;
            box-shadow: none !important;
            padding: 2cm !important;
            background: white !important;
            max-width: 100% !important;
            width: 100% !important;
            color: black !important;
          }

          /* General typography styling for high print legibility */
          h1, h2, h3, h4, p, span, td, th {
            color: black !important;
          }

          .border {
            border-color: #e4e4e7 !important;
          }

          .bg-gray-50 {
            background-color: #f4f4f5 !important;
          }
        }
      `}</style>
    </>
  );
}
