export default function EntryList({ entries, onEdit, onDelete }) {
if (!entries?.length) return null;

return (
    <ul className="card divide-y divide-gray-200 overflow-hidden">
    {entries.map((e) => (
        <li key={e.id} className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-medium">{e.date}</p>
                <span className="chip capitalize">period: {e.period || "none"}</span>
                <span className="chip">pain: {e.painScore ?? 0}/10</span>
                {e.bpSys && e.bpDia ? <span className="chip">{e.bpSys}/{e.bpDia} mmHg</span> : null}
            </div>
            <div className="text-sm text-gray-700 space-y-1">
                {e.painLocation ? (
                  <p><strong className="mr-1">Location:</strong>{e.painLocation}</p>
                ) : null}
                {e.mood ? (
                  <p><strong className="mr-1">Mood:</strong>{e.mood}/5</p>
                ) : null}
                {e.energy ? (
                  <p><strong className="mr-1">Energy:</strong>{e.energy}/5</p>
                ) : null}
                {e.sleepHours ? (
                  <p><strong className="mr-1">Sleep:</strong>{e.sleepHours}h</p>
                ) : null}
                {e.hydration ? (
                  <p><strong className="mr-1">Hydration:</strong>{e.hydration} glasses</p>
                ) : null}
                {e.notes ? (
                  <p><strong className="mr-1">Notes:</strong>{e.notes}</p>
                ) : null}
            </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0">
            <button className="btn-ghost" onClick={() => onEdit(e)} aria-label={`Edit entry for ${e.date}`}>
                Edit
            </button>
            <button
                className="btn-ghost"
                onClick={() => onDelete(e.id)}
                aria-label={`Delete entry for ${e.date}`}
            >
                Delete
            </button>
            </div>
        </div>
        </li>
    ))}
    </ul>
);
}