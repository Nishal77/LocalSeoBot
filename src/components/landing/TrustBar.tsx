export function TrustBar() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-xs text-zinc-600 font-semibold uppercase tracking-widest mb-8">Trusted by local businesses in</p>
        <div className="flex flex-wrap justify-center gap-3">
          {["Dentists", "HVAC", "Plumbers", "Restaurants", "Salons", "Law Firms", "Gyms", "Realtors", "Chiropractors"].map((biz) => (
            <span key={biz} className="px-4 py-1.5 rounded-full border border-white/8 bg-white/[0.03] text-zinc-400 text-sm">
              {biz}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
