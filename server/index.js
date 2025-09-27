import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSummary } from '../src/lib/insights.js';

// Resolve local data path for persistence
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'entries.json');

// In-memory cache backed by a JSON file
let entries = [];

async function loadEntries() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) entries = arr;
  } catch (e) {
    // If file doesn't exist or parse fails, start with empty array
    entries = [];
  }
}

async function saveEntries() {
  const tmp = JSON.stringify(entries, null, 2);
  await fs.writeFile(DATA_FILE, tmp, 'utf-8');
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// POST /entries — add a single entry
// Body example:
// {
//   "date": "YYYY-MM-DD",
//   "period": "none|light|medium|heavy|spotting",
//   "painScore": 0-10,
//   "painLocation": "",
//   "bpSys": 120,
//   "bpDia": 80,
//   "mood": 1-5,
//   "energy": 1-5,
//   "sleepHours": number,
//   "hydration": number,
//   "notes": "string"
// }
app.post('/entries', async (req, res) => {
  const e = req.body || {};
  if (!e.date) {
    return res.status(400).json({ error: 'date (YYYY-MM-DD) is required' });
  }
  // Basic normalization similar to client side
  const norm = {
    id: e.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: e.date,
    period: e.period || 'none',
    painScore: Number(e.painScore ?? 0),
    painLocation: (e.painLocation || '').trim(),
    bpSys: e.bpSys != null ? Number(e.bpSys) : undefined,
    bpDia: e.bpDia != null ? Number(e.bpDia) : undefined,
    mood: e.mood != null ? Number(e.mood) : undefined,
    energy: e.energy != null ? Number(e.energy) : undefined,
    sleepHours: e.sleepHours != null ? Number(e.sleepHours) : undefined,
    hydration: e.hydration != null ? Number(e.hydration) : undefined,
    notes: (e.notes || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  entries.push(norm);
  await saveEntries();
  res.status(201).json({ ok: true, entry: norm });
});

// PUT /entries/:id — update an entry
app.put('/entries/:id', async (req, res) => {
  const { id } = req.params;
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'entry not found' });
  const patch = req.body || {};
  const current = entries[idx];
  const updated = {
    ...current,
    ...patch,
    painScore: patch.painScore != null ? Number(patch.painScore) : current.painScore,
    bpSys: patch.bpSys != null ? Number(patch.bpSys) : current.bpSys,
    bpDia: patch.bpDia != null ? Number(patch.bpDia) : current.bpDia,
    mood: patch.mood != null ? Number(patch.mood) : current.mood,
    energy: patch.energy != null ? Number(patch.energy) : current.energy,
    sleepHours: patch.sleepHours != null ? Number(patch.sleepHours) : current.sleepHours,
    hydration: patch.hydration != null ? Number(patch.hydration) : current.hydration,
    painLocation: typeof patch.painLocation === 'string' ? patch.painLocation.trim() : current.painLocation,
    notes: typeof patch.notes === 'string' ? patch.notes.trim() : current.notes,
    updatedAt: new Date().toISOString(),
  };
  entries[idx] = updated;
  await saveEntries();
  res.json({ ok: true, entry: updated });
});

// DELETE /entries/:id — delete an entry
app.delete('/entries/:id', async (req, res) => {
  const { id } = req.params;
  const before = entries.length;
  entries = entries.filter((e) => e.id !== id);
  if (entries.length === before) return res.status(404).json({ error: 'entry not found' });
  await saveEntries();
  res.json({ ok: true });
});

// POST /entries/bulk — add an array of entries
app.post('/entries/bulk', async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  if (!list.length) return res.status(400).json({ error: 'Expected an array of entries' });
  const added = [];
  for (const e of list) {
    if (!e || !e.date) continue;
    const norm = {
      id: e.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: e.date,
      period: e.period || 'none',
      painScore: Number(e.painScore ?? 0),
      painLocation: (e.painLocation || '').trim(),
      bpSys: e.bpSys != null ? Number(e.bpSys) : undefined,
      bpDia: e.bpDia != null ? Number(e.bpDia) : undefined,
      mood: e.mood != null ? Number(e.mood) : undefined,
      energy: e.energy != null ? Number(e.energy) : undefined,
      sleepHours: e.sleepHours != null ? Number(e.sleepHours) : undefined,
      hydration: e.hydration != null ? Number(e.hydration) : undefined,
      notes: (e.notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    entries.push(norm);
    added.push(norm);
  }
  await saveEntries();
  res.status(201).json({ ok: true, count: added.length, entries: added });
});

// GET /entries — list all stored entries
app.get('/entries', (_req, res) => {
  res.json({ entries, count: entries.length });
});

// GET /summary — returns summary over all entries (last 30 days logic is handled on client in useEntries,
// but here we return summary for all entries received; callers can filter if needed)
app.get('/summary', (_req, res) => {
  const summary = buildSummary(entries);
  res.json({ summary, count: entries.length });
});

// Start server after loading entries from disk
loadEntries().then(() => {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${PORT}`);
  });
});
