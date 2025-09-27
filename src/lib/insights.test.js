import { buildSummary } from "./insights.js";

function makeDate(day) {
  // Returns YYYY-MM-DD with day padded (assumes same month for simplicity)
  const d = String(day).padStart(2, "0");
  return `2025-01-${d}`;
}

function entry(day, overrides = {}) {
  return {
    id: `e-${day}`,
    date: makeDate(day),
    painScore: 0,
    period: "none",
    sleepHours: undefined,
    hydration: undefined,
    ...overrides,
  };
}

describe("buildSummary flags and prompts", () => {
  test("rising trend: median second half > first half adds trend flag", () => {
    const entries = [
      entry(1, { painScore: 2 }),
      entry(2, { painScore: 3 }),
      entry(3, { painScore: 3 }),
      entry(4, { painScore: 4 }),
      // second half higher
      entry(5, { painScore: 5 }),
      entry(6, { painScore: 5 }),
      entry(7, { painScore: 6 }),
      entry(8, { painScore: 6 }),
    ];
    const s = buildSummary(entries);
    const trendFlag = s.flags.find((f) => f.includes("second half"));
    expect(trendFlag).toBeTruthy();
  });

  test("high-pain days (>=7) count triggers flag and related prompt", () => {
    const entries = [
      entry(1, { painScore: 7 }),
      entry(2, { painScore: 7 }),
      entry(3, { painScore: 7 }),
      entry(4, { painScore: 2 }),
      entry(5, { painScore: 4 }),
    ];
    const s = buildSummary(entries);
    const hpFlag = s.flags.find((f) => f.includes("7/10 or higher"));
    expect(hpFlag).toBeTruthy();
    const hpPrompt = s.prompts.find((p) => p.startsWith("Last month I had 3 day"));
    expect(hpPrompt).toBeTruthy();
  });

  test("sleep <6h with >=40% pain>=6 triggers flag", () => {
    const entries = [
      entry(1, { sleepHours: 5, painScore: 6 }), // high pain
      entry(2, { sleepHours: 5, painScore: 7 }), // high pain
      entry(3, { sleepHours: 5, painScore: 2 }), // low pain
      entry(4, { sleepHours: 8, painScore: 6 }), // not considered (<6h only)
      entry(5, { sleepHours: 5, painScore: 2 }), // low pain
    ];
    // <6h nights: days 1,2,3,5 => 4 days, with pain>=6 on 2 => 50%
    const s = buildSummary(entries);
    const sleepFlag = s.flags.find((f) => f.toLowerCase().includes("slept under 6 hours"));
    expect(sleepFlag).toBeTruthy();
  });

  test("hydration <=3 with >=40% pain>=6 triggers flag", () => {
    const entries = [
      entry(1, { hydration: 2, painScore: 6 }), // high pain
      entry(2, { hydration: 3, painScore: 7 }), // high pain
      entry(3, { hydration: 3, painScore: 2 }), // low pain
      entry(4, { hydration: 8, painScore: 6 }), // not considered (<=3 only)
      entry(5, { hydration: 2, painScore: 2 }), // low pain
    ];
    // <=3 glasses: days 1,2,3,5 => 4 days, with pain>=6 on 2 => 50%
    const s = buildSummary(entries);
    const hydFlag = s.flags.find((f) => f.toLowerCase().includes("3 or fewer glasses of water"));
    expect(hydFlag).toBeTruthy();
  });

  test("period median higher than non-period adds flag", () => {
    const entries = [
      entry(1, { period: "light", painScore: 6 }),
      entry(2, { period: "heavy", painScore: 7 }),
      entry(3, { period: "none", painScore: 3 }),
      entry(4, { period: "none", painScore: 2 }),
      entry(5, { period: "spotting", painScore: 6 }),
    ];
    const s = buildSummary(entries);
    const periodFlag = s.flags.find((f) => f.toLowerCase().includes("period days"));
    expect(periodFlag).toBeTruthy();
  });

  test("flags capped to 5 and prompts capped to 4", () => {
    const entries = [
      // Aim to trigger many flags: high pain days, rising trend, period link, sleep, hydration, bp
      entry(1, { painScore: 7, sleepHours: 5, hydration: 2, period: "light", bpSys: 120, bpDia: 80 }),
      entry(2, { painScore: 7, sleepHours: 5, hydration: 2, period: "none", bpSys: 130, bpDia: 85 }),
      entry(3, { painScore: 7, sleepHours: 5, hydration: 2, period: "none", bpSys: 110, bpDia: 75 }),
      entry(4, { painScore: 3, sleepHours: 8, hydration: 5, period: "none", bpSys: 125, bpDia: 82 }),
      entry(5, { painScore: 5, sleepHours: 5, hydration: 2, period: "spotting", bpSys: 135, bpDia: 90 }),
      entry(6, { painScore: 6, sleepHours: 5, hydration: 2, period: "none", bpSys: 115, bpDia: 78 }),
      entry(7, { painScore: 6, sleepHours: 5, hydration: 2, period: "none", bpSys: 118, bpDia: 79 }),
      entry(8, { painScore: 6, sleepHours: 5, hydration: 2, period: "none", bpSys: 122, bpDia: 81 }),
    ];
    const s = buildSummary(entries);
    expect(s.flags.length).toBeLessThanOrEqual(5);
    expect(s.prompts.length).toBeLessThanOrEqual(4);
  });

  test("text summary includes headings and counts", () => {
    const entries = [
      entry(1, { painScore: 1 }),
      entry(2, { painScore: 2 }),
      entry(3, { painScore: 3 }),
    ];
    const s = buildSummary(entries);
    expect(s.textSummary).toContain("Health Month — Summary");
    expect(s.textSummary).toContain("Dates:");
    expect(s.textSummary).toContain("Days logged:");
    expect(s.textSummary).toContain("Questions");
    expect(s.textSummary).toContain("not medical advice");
  });
});
