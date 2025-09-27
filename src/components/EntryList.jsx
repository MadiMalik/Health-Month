export default function EntryList({ entries, onEdit, onDelete }) {
if (!entries?.length) return null;

return (
    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
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
            <p className="text-sm text-gray-700">
                {e.painLocation ? <><strong className="mr-1">Location:</strong>{e.painLocation}. </> : null}
                {e.mood ? <><strong className="mr-1">Mood:</strong>{e.mood}/5. </> : null}
                {e.energy ? <><strong className="mr-1">Energy:</strong>{e.energy}/5. </> : null}
                {e.sleepHours ? <><strong className="mr-1">Sleep:</strong>{e.sleepHours}h. </> : null}
                {e.hydration ? <><strong className="mr-1">Hydration:</strong>{e.hydration} glasses. </> : null}
                {e.notes ? <><strong className="mr-1">Notes:</strong>{e.notes}</> : null}
            </p>
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