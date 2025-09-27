import { formatRange } from "./range";

/**
 * entries: last 30 days (array of objects from useEntries)
 * returns { range, counts, stats, flags, prompts, textSummary }
 */
export function buildSummary(entries) {
  if (!entries || entries.length === 0) {
    return {
      range: null,
      counts: { daysLogged: 0, highPainDays: 0, periodDays: 0 },
      stats: {},
      flags: [],
      prompts: [],
      textSummary: "No entries yet.",
    };
  }

  // Sort ascending by date for windowed calculations
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const range = formatRange(sorted[0].date, sorted[sorted.length - 1].date);

  // Helpers
  const median = (arr) => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const avg = (arr) => (arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null);
  const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

  // Core sets
  const pain = sorted.map((e) => Number(e.painScore || 0));
  const periodDays = sorted.filter((e) => (e.period || "none") !== "none");
  const highPainDays = sorted.filter((e) => Number(e.painScore || 0) >= 7);
  const withBP = sorted.filter((e) => e.bpSys && e.bpDia);
  const withSleep = sorted.filter((e) => e.sleepHours !== undefined && e.sleepHours !== null);
  const withHydration = sorted.filter((e) => e.hydration !== undefined && e.hydration !== null);

  // Trend (split into halves if enough data)
  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);
  const medianFirst = median(firstHalf.map((e) => Number(e.painScore || 0)));
  const medianSecond = median(secondHalf.map((e) => Number(e.painScore || 0)));

  // Co-occurrences (simple rules)
  const sleepLT6 = withSleep.filter((e) => Number(e.sleepHours) < 6);
  const highPainOnLowSleep = sleepLT6.filter((e) => Number(e.painScore || 0) >= 6);
  const lowHydration = withHydration.filter((e) => Number(e.hydration) <= 3);
  const highPainOnLowHydration = lowHydration.filter((e) => Number(e.painScore || 0) >= 6);

  const painOnPeriod = periodDays.map((e) => Number(e.painScore || 0));
  const painOffPeriod = sorted.filter((e) => (e.period || "none") === "none").map((e) => Number(e.painScore || 0));

  // BP stats
  const bpSysVals = withBP.map((e) => Number(e.bpSys));
  const bpDiaVals = withBP.map((e) => Number(e.bpDia));
  const bpStats = withBP.length
    ? {
        sysMin: Math.min(...bpSysVals),
        sysMax: Math.max(...bpSysVals),
        sysAvg: avg(bpSysVals),
        diaMin: Math.min(...bpDiaVals),
        diaMax: Math.max(...bpDiaVals),
        diaAvg: avg(bpDiaVals),
      }
    : null;

  // Flags (limit to 5)
  const flags = [];
  if (highPainDays.length >= 3) {
    flags.push(`Pain was 7/10 or higher on ${highPainDays.length} day${highPainDays.length > 1 ? "s" : ""}. You may want to talk about how often this happens and what helps.`);
  }
  if (medianFirst != null && medianSecond != null && medianSecond > medianFirst) {
    flags.push(`Pain was higher in the second half of the month (from ${medianFirst} to ${medianSecond}).`);
  }
  if (periodDays.length >= 3 && painOnPeriod.length && painOffPeriod.length) {
    const medPeriod = median(painOnPeriod);
    const medNon = median(painOffPeriod);
    if (medPeriod != null && medNon != null && medPeriod > medNon) {
      flags.push(`Pain was higher on period days (median ${medPeriod}) than on other days (median ${medNon}).`);
    }
  }
  if (sleepLT6.length >= 3) {
    const rate = pct(highPainOnLowSleep.length, sleepLT6.length);
    if (rate >= 40) {
      flags.push(`When you slept under 6 hours, pain at 6/10 or more happened about ${rate}% of the time.`);
    }
  }
  if (lowHydration.length >= 3) {
    const rateH = pct(highPainOnLowHydration.length, lowHydration.length);
    if (rateH >= 40) {
      flags.push(`On days you drank 3 or fewer glasses of water, pain at 6/10 or more happened about ${rateH}% of the time.`);
    }
  }
  if (bpStats) {
    flags.push(
      `Blood pressure ranged from ${bpStats.sysMin}/${bpStats.diaMin} to ${bpStats.sysMax}/${bpStats.diaMax} (average about ${bpStats.sysAvg}/${bpStats.diaAvg} mmHg). Ask how to track it the right way.`
    );
  }

  // Prompts (3–4)
  const prompts = [];
  if (highPainDays.length) {
    prompts.push(
      `Last month I had ${highPainDays.length} day${highPainDays.length > 1 ? "s" : ""} with pain 7/10 or higher. What should I track next week to find possible causes?`
    );
  }
  if (medianFirst != null && medianSecond != null && medianSecond > medianFirst) {
    prompts.push(`My pain was higher in the second half of the month. Any ideas why, and what should I watch?`);
  }
  if (periodDays.length >= 3 && painOnPeriod.length && painOffPeriod.length) {
    prompts.push(`Pain seems higher on period days. Is that expected for me? Anything specific I should track then?`);
  }
  if (sleepLT6.length >= 3) {
    prompts.push(`When I sleep under 6 hours, pain is often higher. Could sleep be a factor? What should I try?`);
  }
  if (prompts.length < 3) {
    prompts.push(`Are there any warning signs I should watch for that need urgent care?`);
  }

  // Counts & stats
  const stats = {
    painMedian: median(pain),
    painAvg: avg(pain),
    painMax: pain.length ? Math.max(...pain) : null,
    medianFirst,
    medianSecond,
  };
  const counts = {
    daysLogged: sorted.length,
    highPainDays: highPainDays.length,
    periodDays: periodDays.length,
    withBP: withBP.length,
  };

  // Printable text summary
  const textSummary = buildTextSummary(range, counts, flags, prompts);
  return { range, counts, stats, flags: flags.slice(0, 5), prompts: prompts.slice(0, 4), textSummary };
}

function buildTextSummary(range, counts, flags, prompts) {
  const lines = [];
  lines.push(`Health Month — Summary (For education only; not medical advice)`);
  lines.push(`Dates: ${range}`);
  lines.push(`Days logged: ${counts.daysLogged}`);
  lines.push("");
  if (flags.length) {
    lines.push("What stood out");
    flags.forEach((f) => lines.push(`• ${f}`));
    lines.push("");
  }
  lines.push("Questions to ask my doctor");
  prompts.forEach((p, idx) => lines.push(`${idx + 1}) ${p}`));
  lines.push("");
  lines.push("Notes");
  lines.push("• This is personal information only. It is not medical advice.");
  return lines.join("\n");
}