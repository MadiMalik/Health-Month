import { useMemo, useRef, useState } from "react";
import { useEntries } from "../hooks/useEntries";
import { buildSummary } from "../lib/insights";

export default function Summary() {
  const { last30 } = useEntries();
  const summary = useMemo(() => buildSummary(last30), [last30]);

  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: select + copy
      const ta = document.createElement("textarea");
      ta.value = summary.textSummary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const onPrint = () => {
    // Ensure the printable content is visible; the CSS will take care of print styles.
    window.print();
  };

  if (!last30.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Summary</h2>
        <p className="text-sm text-gray-600">
          No entries yet. Add some entries in the Journal tab to see your 30-day summary here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Summary</h2>
          <p className="text-sm text-gray-600">Range: {summary.range}</p>
        </div>
        <div className="select-none print:hidden w-full sm:w-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button className="btn-ghost w-full sm:w-auto" onClick={onCopy}>{copied ? "Copied!" : "Copy summary"}</button>
          <button className="btn w-full sm:w-auto" onClick={onPrint}>Print / Save PDF</button>
        </div>
      </div>

      <div ref={printRef} className="card p-4 print:border-0 print:p-0">
        <section className="space-y-2">
          <p className="text-sm">
            Entries: <strong>{summary.counts.daysLogged}</strong>
          </p>
          {summary.stats.painMedian != null && (
            <p className="text-sm text-gray-700">
              Median pain: <strong>{summary.stats.painMedian}</strong> (avg {summary.stats.painAvg ?? "—"}, max {summary.stats.painMax ?? "—"})
            </p>
          )}
        </section>

        {summary.flags.length > 0 && (
          <section className="mt-4">
            <h3 className="font-medium mb-2">Key Patterns</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
              {summary.flags.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </section>
        )}

        <section className="mt-4">
          <h3 className="font-medium mb-2">Doctor Prompts</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-800">
            {summary.prompts.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </section>

        <section className="mt-4 text-xs text-gray-500">
          Educational demo only — not medical advice. Data stored locally in your browser.
        </section>

        {/* Hidden textarea for debugging / copy if needed
        <textarea className="hidden">{summary.textSummary}</textarea>
        */}
      </div>
    </div>
  );
}