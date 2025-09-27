export function formatRange(startYYYYMMDD, endYYYYMMDD) {
    // both are "YYYY-MM-DD"
    return `${pretty(startYYYYMMDD)} – ${pretty(endYYYYMMDD)}`;
  }
  
  function pretty(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }