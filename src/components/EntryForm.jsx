import { useEffect, useRef, useState } from "react";
import { formatYYYYMMDD } from "../lib/date";

const PERIODS = ["none", "light", "medium", "heavy"];

export default function EntryForm({ open, onClose, onSave, initial }) {
  const today = formatYYYYMMDD(new Date());

  // initialize form state with either initial values or defaults
  const [form, setForm] = useState(() => initial || {
    date: today,
    period: "none",
    painScore: 0,
    painLocation: "",
    bpSys: "",
    bpDia: "",
    mood: "",
    energy: "",
    sleepHours: "",
    hydration: "",
    notes: "",
  });

  // reset form whenever the modal opens or initial values change
  useEffect(() => {
    if (!open) return;
    setForm(initial || {
      date: today,
      period: "none",
      painScore: 0,
      painLocation: "",
      bpSys: "",
      bpDia: "",
      mood: "",
      energy: "",
      sleepHours: "",
      hydration: "",
      notes: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  // focus the first input when the form opens
  const firstFieldRef = useRef(null);
  useEffect(() => {
    if (open && firstFieldRef.current) firstFieldRef.current.focus();
  }, [open]);

  // field change handler
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // submit handler (validates + normalizes)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date) return alert("Date is required");
    const pain = Number(form.painScore ?? 0);
    if (Number.isNaN(pain) || pain < 0 || pain > 10) {
      return alert("Pain score must be between 0 and 10");
    }

    onSave?.({
      ...form,
      painScore: pain,
      bpSys: form.bpSys ? Number(form.bpSys) : undefined,
      bpDia: form.bpDia ? Number(form.bpDia) : undefined,
      mood: form.mood ? Number(form.mood) : undefined,
      energy: form.energy ? Number(form.energy) : undefined,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
      hydration: form.hydration ? Number(form.hydration) : undefined,
      painLocation: (form.painLocation || "").trim(),
      notes: (form.notes || "").trim(),
    });

    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="form-help">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="date" className="label">Date</label>
          <input
            ref={firstFieldRef}
            id="date"
            name="date"
            type="date"
            className="input"
            value={form.date}
            onChange={onChange}
            max={formatYYYYMMDD(new Date())}
            required
          />
        </div>

        <div>
          <label htmlFor="period" className="label">Period</label>
          <select
            id="period"
            name="period"
            className="input"
            value={form.period}
            onChange={onChange}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="painScore" className="label">Pain (0–10)</label>
          <input
            id="painScore"
            name="painScore"
            type="number"
            inputMode="numeric"
            min="0"
            max="10"
            className="input"
            value={form.painScore}
            onChange={onChange}
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="painLocation" className="label">Pain Location</label>
          <input
            id="painLocation"
            name="painLocation"
            type="text"
            className="input"
            placeholder="abdomen, head, back, pelvis, etc."
            value={form.painLocation}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="bpSys" className="label">BP Systolic</label>
          <input
            id="bpSys"
            name="bpSys"
            type="number"
            inputMode="numeric"
            className="input"
            placeholder="e.g., 120"
            value={form.bpSys}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="bpDia" className="label">BP Diastolic</label>
          <input
            id="bpDia"
            name="bpDia"
            type="number"
            inputMode="numeric"
            className="input"
            placeholder="e.g., 80"
            value={form.bpDia}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="mood" className="label">Mood (1–5)</label>
          <input
            id="mood"
            name="mood"
            type="number"
            min="1"
            max="5"
            className="input"
            value={form.mood ?? ""}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="energy" className="label">Energy (1–5)</label>
          <input
            id="energy"
            name="energy"
            type="number"
            min="1"
            max="5"
            className="input"
            value={form.energy ?? ""}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="sleepHours" className="label">Sleep (hours)</label>
          <input
            id="sleepHours"
            name="sleepHours"
            type="number"
            step="0.5"
            min="0"
            max="14"
            className="input"
            value={form.sleepHours ?? ""}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="hydration" className="label">Hydration (glasses)</label>
          <input
            id="hydration"
            name="hydration"
            type="number"
            min="0"
            max="20"
            className="input"
            value={form.hydration ?? ""}
            onChange={onChange}
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="notes" className="label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            className="input"
            placeholder="Anything else you noticed..."
            value={form.notes}
            onChange={onChange}
          />
        </div>
      </div>

      <p id="form-help" className="text-xs text-gray-500">
        Tip: Keep it simple. You can always edit entries later.
      </p>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn">Save Entry</button>
      </div>
    </form>
  );
}