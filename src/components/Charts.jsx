import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from "recharts";

export default function Charts({ entries }) {
  const { painTrend, sleepVsPain, periodAgg } = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const painTrend = sorted.map((e) => ({
      date: e.date,
      pain: Number(e.painScore ?? 0),
    }));

    const sleepVsPain = sorted
      .filter((e) => e.sleepHours !== undefined && e.sleepHours !== null)
      .map((e) => ({
        sleep: Number(e.sleepHours),
        pain: Number(e.painScore ?? 0),
        date: e.date,
      }));

    // Aggregate mood and energy averages by period value
    const groups = new Map();
    for (const e of sorted) {
      const key = (e.period || "none").toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, { key, moodSum: 0, moodCount: 0, energySum: 0, energyCount: 0 });
      }
      const g = groups.get(key);
      if (e.mood !== undefined && e.mood !== null && !Number.isNaN(Number(e.mood))) {
        g.moodSum += Number(e.mood);
        g.moodCount += 1;
      }
      if (e.energy !== undefined && e.energy !== null && !Number.isNaN(Number(e.energy))) {
        g.energySum += Number(e.energy);
        g.energyCount += 1;
      }
    }
    const order = ["none", "light", "medium", "heavy", "spotting"]; // stable display order
    const periodAgg = Array.from(groups.values())
      .map((g) => ({
        period: g.key,
        moodAvg: g.moodCount ? Number((g.moodSum / g.moodCount).toFixed(2)) : null,
        energyAvg: g.energyCount ? Number((g.energySum / g.energyCount).toFixed(2)) : null,
      }))
      .sort((a, b) => order.indexOf(a.period) - order.indexOf(b.period));

    return { painTrend, sleepVsPain, periodAgg };
  }, [entries]);

  return (
    <div className="space-y-6 charts-grid">
      <section className="chart-item" aria-labelledby="chart-pain-trend" role="img" aria-label="Pain over time">
        <h3 id="chart-pain-trend" className="font-medium mb-2">Pain over time</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <LineChart data={painTrend} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} label={{ value: "Date", position: "insideBottom", offset: -5 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} label={{ value: "Pain", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v) => [`Pain: ${v}`, ""]} labelFormatter={(l) => l} />
              <Line type="monotone" dataKey="pain" stroke="#4f46e5" strokeWidth={2} dot={true} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">See how your pain changed day by day.</p>
      </section>

      <section className="chart-item" aria-labelledby="chart-sleep-pain" role="img" aria-label="Sleep and pain">
        <h3 id="chart-sleep-pain" className="font-medium mb-2">Sleep and pain</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="sleep" tick={{ fontSize: 12 }} label={{ value: "Sleep (hours)", position: "insideBottom", offset: -5 }} />
              <YAxis type="number" dataKey="pain" domain={[0, 10]} tick={{ fontSize: 12 }} label={{ value: "Pain", angle: -90, position: "insideLeft" }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, name) => [`${name}: ${v}`, ""]} labelFormatter={(l, p) => (p && p[0] && p[0].payload?.date) || ""} />
              <Scatter data={sleepVsPain} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">Each dot shows a day: sleep hours and pain.</p>
      </section>

      {/* Average mood by period */}
      <section className="chart-item" aria-labelledby="chart-mood-period" role="img" aria-label="Mood during period days and other days">
        <h3 id="chart-mood-period" className="font-medium mb-2">Mood by period</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <BarChart data={periodAgg} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(d) => (d.period.charAt(0).toUpperCase() + d.period.slice(1))} tick={{ fontSize: 12 }} label={{ value: "Period", position: "insideBottom", offset: -5 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} label={{ value: "Mood (1-5)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v) => (v == null ? 'No data' : `Mood: ${v}`)} />
              <Bar dataKey="moodAvg" name="Mood" fill="#f59e0b" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">Bars show typical mood on days with and without a period.</p>
      </section>

      {/* Average energy by period */}
      <section className="chart-item" aria-labelledby="chart-energy-period" role="img" aria-label="Energy during period days and other days">
        <h3 id="chart-energy-period" className="font-medium mb-2">Energy by period</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <BarChart data={periodAgg} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(d) => (d.period.charAt(0).toUpperCase() + d.period.slice(1))} tick={{ fontSize: 12 }} label={{ value: "Period", position: "insideBottom", offset: -5 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} label={{ value: "Energy (1-5)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v) => (v == null ? 'No data' : `Energy: ${v}`)} />
              <Bar dataKey="energyAvg" name="Energy" fill="#06b6d4" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">Bars show typical energy on days with and without a period.</p>
      </section>
    </div>
  );
}
