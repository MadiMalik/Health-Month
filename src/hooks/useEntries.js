import { useEffect, useMemo, useState } from 'react';
import { formatYYYYMMDD } from '../lib/date';

// The key used to store our data in the browser's localStorage.
const STORAGE_KEY = 'health_month_entries_v1';


// Data Shape and & Persistence

// this is the shape of single health entry object that we will be storing.
// types and fields are noted for clarity 



// shape of an entry we store
// {
//   id: string,                                // generated unique id
//   date: 'YYYY-MM-DD',                        // date of the entry
//   period: 'none'|'light'|'medium'|'heavy',   // menstrual period
//   painScore: number,                         // pain score  
//   painLocation: string,                      // pain location
//   bpSys?: number,                      // blood pressure systolic
//   bpDia?: number,                  // blood pressure diastolic
//   mood?: number,                         // mood score
//   energy?: number,                     // energy score
//   sleepHours?: number,                 // sleep hours
//   hydration?: number,                // hydration score
//   notes?: string,                     // additional notes
//   createdAt: ISO string,                 // creation timestamp
//   updatedAt: ISO string                 // last update timestamp
// }


/**
 * Read all the entries from localStorage.
 * Handles potential parsing errors and returns an empty array if no data is found or an error occurs
 * @return {Array} Array of entry objects
 */
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Return an empty array on any parsing error to prevent the app from crashing.
    return [];
  }
}

/**
 * Write the entire list of entries to localStorage
 * @param {Array} list The array of health entry objects to save
 */
function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Custm React Hook for managing a list of health entries

/**
 * It provides a state, persistence to localStorage, and functions for
 * adding, updating, and deleting entries. It also provides a filtered list of entries from the last 30 days.
 * @returns {{entries: Array, last30: Array, addEntry: Function, updateEntry: Function, deleteEntry: Function}}
 * An object containing the entries state, a filtered list, and helper functions.
 */

export function useEntries() {
  // initialize state by reading data from localStorage. The function is passed
  // directly to useState for lazy initialization, so it only runs once.
  const [entries, setEntries] = useState(() => readAll());

  // persist entries on change
  useEffect(() => {
    writeAll(entries);
  }, [entries]);

    /**
     * addEntry(), adds a new entry to the list.
     * Generates a unique ID and timestamps, and normalizes the input data.
     * The new entry is added to the beginning of the list and then the whole list is sorted.
     * @param {object} data The data for the new entry, from the form.
     */

  const addEntry = (data) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const entry = {
      id,
      date: data.date || formatYYYYMMDD(new Date()),
      period: data.period || 'none',
      painScore: Number(data.painScore ?? 0),
      painLocation: data.painLocation?.trim() ?? '',
      bpSys: data.bpSys ? Number(data.bpSys) : undefined,
      bpDia: data.bpDia ? Number(data.bpDia) : undefined,
      mood: data.mood ? Number(data.mood) : undefined,
      energy: data.energy ? Number(data.energy) : undefined,
      sleepHours: data.sleepHours ? Number(data.sleepHours) : undefined,
      hydration: data.hydration ? Number(data.hydration) : undefined,
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    setEntries((prev) => [entry, ...prev].sort(sortByDateDesc));
  };


    /**
     * Updates an existing entry by its ID.
     * Finds the entry and merges the provided patch data, updating the timestamp.
     * The list is then re-sorted.
     * @param {string} id The ID of the entry to update.
     * @param {object} patch The partial data to update the entry with.
     */
  const updateEntry = (id, patch) => {
    setEntries((prev) =>
      prev
        .map((entry) =>
          entry.id === id
            ? { ...entry, ...normalizePatch(patch), updatedAt: new Date().toISOString() }
            : entry
        )
        .sort(sortByDateDesc)
    );
  };

    /**
     * Deletes an entry by its ID.
     * deleteEntry() filters the list to remove the entry with the matching ID.
     * @param {string} id The ID of the entry to delete.
     */
  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

    /**
     * A memoized value for the last 30 days of entries.
     * This prevents unnecessary re-computation of the filtered list on every render.
     * The calculation only runs when the `entries` state array changes.
     */
  const last30 = useMemo(() => {
    // Get the date 29 days ago to include a 30-day range (including today).
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 29);
    const cutoffStr = formatYYYYMMDD(cutoff);

    return entries
      .filter((entry) => entry.date >= cutoffStr)
      .sort(sortByDateDesc);
  }, [entries]);
    // Return the state and the helper functions
  return {
    entries,
    last30,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}


// ------- Helper Functions --------
/**
 * Compares two entries for sorting.
 * Sorts by date in descending order. If dates are the same, it sorts by the
 * `updatedAt` (or `createdAt`) timestamp in descending order, putting newer updates first.
 * @param {object} a The first entry to compare.
 * @param {object} b The second entry to compare.
 * @returns {number} The sort order value (-1, 0, or 1).
 */
function sortByDateDesc(a, b) {
  if (a.date === b.date) {
    const aTime = a.updatedAt || a.createdAt || '';
    const bTime = b.updatedAt || b.createdAt || '';
    return (bTime).localeCompare(aTime);
  }
  return b.date.localeCompare(a.date);
}

/**
 * Normalizes a patch object to ensure data types are correct before updating an entry.
 * It converts specific keys to numbers and trims whitespace from strings.
 * This prevents common data type errors.
 * @param {object} patch The partial data object to normalize.
 * @returns {object} The normalized patch object.
 */
function normalizePatch(patch) {
  const p = { ...patch };
  if ('painScore' in p && p.painScore !== undefined) p.painScore = Number(p.painScore);
  if ('bpSys' in p && p.bpSys !== undefined) p.bpSys = Number(p.bpSys);
  if ('bpDia' in p && p.bpDia !== undefined) p.bpDia = Number(p.bpDia);
  if ('mood' in p && p.mood !== undefined) p.mood = Number(p.mood);
  if ('energy' in p && p.energy !== undefined) p.energy = Number(p.energy);
  if ('sleepHours' in p && p.sleepHours !== undefined) p.sleepHours = Number(p.sleepHours);
  if ('hydration' in p && p.hydration !== undefined) p.hydration = Number(p.hydration);
  if ('painLocation' in p && typeof p.painLocation === 'string') p.painLocation = p.painLocation.trim();
  if ('notes' in p && typeof p.notes === 'string') p.notes = p.notes.trim();
  return p;
}